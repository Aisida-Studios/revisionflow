// netlify/functions/notify.js
// Sends Web Push notifications: a signed-in student to their own device (the "send test notification" button), or an admin to
// many subscriptions at once.
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
//
// POST /api/notify   { subscription, title?, message?, url? }       a student's own device  -> { ok, expired? }
//                    { subscriptions: [...], title?, message?, url? } admin broadcast          -> { ok, sent, expired, failed }
//
// SECURITY MODEL
//   * Both paths need a verified Firebase ID token (lib/auth.js). The broadcast path needs a VERIFIED admin (verified token,
//     revocation checked, e-mail verified and on the admin list), never an e-mail the request merely claims.
//   * THE SERVER MAKES THE OUTBOUND CALL. web-push POSTs to whatever host the subscription's `endpoint` names, on whatever port
//     it names. Unchecked, any signed-in student could make this function send requests to any HTTPS address (a way to probe
//     hosts and ports from inside Netlify, and to relay traffic under our name), and the old error text handed the reason
//     back to them. So an endpoint is only used if it is an https:// address, with no credentials and no custom port, on a
//     known push service (Firebase Cloud Messaging for Chrome/Edge/Brave/Opera/Samsung, Mozilla for Firefox, Apple for Safari,
//     Windows Notification Service). Add another service with PUSH_ENDPOINT_HOSTS (comma-separated host names) if one is
//     ever needed. The host is read with BOTH the WHATWG URL parser and the legacy one web-push itself uses, and the two must
//     agree, so a crafted address cannot look like a push service to one parser and point elsewhere for the other.
//   * The notification text is bounded and cleaned, and `url` can only be a path inside this site.
//   * Sends are rate limited per account, bounded in time (TTL, socket timeout) and, for a broadcast, in size and concurrency.
//   * Errors tell the caller nothing about the network: no host names, no provider messages. Logs carry a status code only.
'use strict'

const nodeUrl = require('url')
const webpush = require('web-push')
const { route, parseJsonBody, respond, HttpError } = require('./lib/http')
const { getAdmin, verifyUser, requireAdmin, enforceAppCheck, adminEmails } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')

// Push services whose endpoints we will call. A host matches if it equals one of these or is a subdomain of it.
const PUSH_HOST_SUFFIXES = [
  'fcm.googleapis.com',                 // Chrome, Edge, Brave, Opera, Samsung Internet, Android browsers
  'updates.push.services.mozilla.com',  // Firefox
  'push.services.mozilla.com',
  'web.push.apple.com',                 // Safari (macOS, iOS / iPadOS home-screen apps)
  'push.apple.com',
  'notify.windows.com',                 // Windows Notification Service
]

const MAX_SELF_BODY_BYTES = 8 * 1024
const MAX_BROADCAST_BODY_BYTES = 512 * 1024
const MAX_BROADCAST = 500
const BROADCAST_CONCURRENCY = 25
const TITLE_MAX = 80
const MESSAGE_MAX = 240
const URL_MAX = 200
const KEY_RE = /^[A-Za-z0-9_-]{16,256}={0,2}$/    // p256dh and auth are base64url
const HOSTNAME_RE = /^(?=.{3,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/
const SEND_OPTIONS = { TTL: 3600, timeout: 10000 }

function extraHostSuffixes(env = process.env) {
  return String(env.PUSH_ENDPOINT_HOSTS || '').split(',').map((s) => s.trim().toLowerCase()).filter((s) => HOSTNAME_RE.test(s))
}

// The host of a push endpoint if (and only if) it is one we are willing to call, otherwise null.
function pushEndpointHost(endpoint, env = process.env) {
  if (typeof endpoint !== 'string' || endpoint.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(endpoint)) return null
  let parsed
  try { parsed = new URL(endpoint) } catch { return null }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || (parsed.port && parsed.port !== '443')) return null
  // web-push reads the address with the legacy parser; refuse anything the two parsers disagree about.
  const legacy = nodeUrl.parse(endpoint)
  if (!legacy.hostname || legacy.hostname.toLowerCase() !== parsed.hostname) return null
  if (legacy.port && String(legacy.port) !== '443') return null
  const host = parsed.hostname
  const ok = [...PUSH_HOST_SUFFIXES, ...extraHostSuffixes(env)].some((s) => host === s || host.endsWith('.' + s))
  return ok ? host : null
}

// A clean copy of a subscription containing only what web-push needs, or null if it is not usable.
function cleanSubscription(sub, env = process.env) {
  if (!sub || typeof sub !== 'object' || Array.isArray(sub)) return null
  if (!pushEndpointHost(sub.endpoint, env)) return null
  const keys = sub.keys
  if (!keys || typeof keys !== 'object' || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string') return null
  if (!KEY_RE.test(keys.p256dh) || !KEY_RE.test(keys.auth)) return null
  return { endpoint: sub.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }
}

const cleanText = (v, max, fallback) => {
  const s = typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : ''
  return s || fallback
}
// Only a path inside this site: "/dashboard", "/study?tab=1". Not "//host", not "https://host", not "javascript:".
const cleanUrl = (v) => (typeof v === 'string' && v.length <= URL_MAX && /^\/(?![/\\])[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/.test(v) ? v : '/')

function buildPayload(body) {
  return JSON.stringify({
    title: cleanText(body.title, TITLE_MAX, 'RevisionFlow'),
    body: cleanText(body.message, MESSAGE_MAX, 'Time to revise!'),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    url: cleanUrl(body.url),
    timestamp: Date.now(),
  })
}

let vapidReady = false
function ensureVapid() {
  if (vapidReady) return
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) {
    console.error('[notify] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not set in the Netlify environment')
    throw new HttpError(503, 'Notifications are not available right now.', 'not_configured')
  }
  const subject = process.env.VAPID_SUBJECT || 'mailto:' + [...adminEmails()][0]
  try {
    webpush.setVapidDetails(subject, pub, priv)
  } catch {
    console.error('[notify] the VAPID keys in the Netlify environment are not valid')
    throw new HttpError(503, 'Notifications are not available right now.', 'not_configured')
  }
  vapidReady = true
}

// One send. Resolves to 'sent' | 'expired' | 'failed'; never throws, and never logs anything but a status code.
async function sendOne(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, payload, SEND_OPTIONS)
    return 'sent'
  } catch (err) {
    const code = err && Number(err.statusCode)
    if (code === 410 || code === 404) return 'expired'     // the browser says this subscription no longer exists
    console.error('[notify] a push service refused or did not answer' + (Number.isFinite(code) && code ? ` (HTTP ${code})` : ''))
    return 'failed'
  }
}

async function inBatches(items, size, fn) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))))
  return out
}

module.exports.handler = route('notify', async (event) => {
  await enforceAppCheck(event)
  const decoded = await verifyUser(event)
  const body = parseJsonBody(event, { maxBytes: MAX_BROADCAST_BODY_BYTES, allowEmpty: false })
  const db = getAdmin().firestore()

  // ── Admin broadcast ───────────────────────────────────────────────────────────────────────────────────────────────
  if (body.subscriptions !== undefined) {
    const admin = await requireAdmin(event)                 // verified token + verified e-mail + on the admin list
    await enforceRateLimit(db, event, { route: 'notify.broadcast', uid: admin.uid, limit: 20, windowSec: 3600 })
    if (!Array.isArray(body.subscriptions) || body.subscriptions.length === 0) throw new HttpError(400, 'subscriptions must be a non-empty list.', 'bad_request')
    if (body.subscriptions.length > MAX_BROADCAST) throw new HttpError(400, `At most ${MAX_BROADCAST} subscriptions can be sent to at once.`, 'too_many')
    ensureVapid()
    const payload = buildPayload(body)
    const results = { sent: 0, expired: 0, failed: 0 }
    const outcomes = await inBatches(body.subscriptions, BROADCAST_CONCURRENCY, async (raw) => {
      const sub = cleanSubscription(raw)
      return sub ? sendOne(sub, payload) : 'failed'         // an unusable entry is counted, never sent anywhere
    })
    for (const o of outcomes) results[o]++
    return respond(200, { ok: true, ...results }, event)
  }

  // ── A student's own device ────────────────────────────────────────────────────────────────────────────────────────
  if (Buffer.byteLength(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8') > MAX_SELF_BODY_BYTES) throw new HttpError(413, 'Request body is too large.', 'payload_too_large')
  if (body.subscription === undefined) throw new HttpError(400, 'subscription or subscriptions required', 'bad_request')
  const subscription = cleanSubscription(body.subscription)
  if (!subscription) throw new HttpError(400, 'That notification subscription is not valid.', 'bad_subscription')
  await enforceRateLimit(db, event, { route: 'notify.self', uid: decoded.uid, limit: 20, windowSec: 3600, message: 'Too many notifications. Please try again later.' })
  ensureVapid()
  const outcome = await sendOne(subscription, buildPayload(body))
  if (outcome === 'sent') return respond(200, { ok: true }, event)
  if (outcome === 'expired') return respond(200, { ok: true, expired: true }, event)
  throw new HttpError(502, 'The notification could not be sent. Please try again later.', 'push_failed')
})

// Exported for tests only.
module.exports._internals = { pushEndpointHost, cleanSubscription, cleanUrl, cleanText, buildPayload, PUSH_HOST_SUFFIXES, MAX_BROADCAST, TITLE_MAX, MESSAGE_MAX, SEND_OPTIONS }
