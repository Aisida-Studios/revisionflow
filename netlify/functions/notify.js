// netlify/functions/notify.js
// Sends Web Push notifications to one or many subscribers
// Called by: manual triggers from the client (self test-push) or the admin panel (broadcast)
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
//
// SECURITY MODEL:
//   Both send paths below now require a valid Firebase ID token in the Authorization header,
//   verified with Firebase Admin Auth — the same pattern already used correctly in
//   admin.js/tutor.js/stripe.js/friends.js/referral.js. Previously the single-subscription path
//   had no auth check at all, and the batch path's "admin" check was `callerEmail !== ADMIN_EMAIL`
//   where callerEmail was just a string read from the request body — trivially spoofed by sending
//   that exact string. Either gap let anyone on the internet, no account required, POST directly
//   to this public endpoint with an arbitrary subscription/title/message/url and have the server
//   send it through RevisionFlow's own push identity. The batch path is additionally gated on the
//   verified token's email matching ADMIN_EMAIL, mirroring admin.js's verifyAdminToken.

const webpush = require('web-push')

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const ADMIN_EMAIL   = 'femiaisida1@gmail.com'

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    },
    body: JSON.stringify(body),
  }
}

// ── Firebase Admin — lazy singleton ──────────────────────────────────────────
let _admin = null
async function getAdmin() {
  if (_admin) return _admin
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  }
  _admin = admin
  return admin
}

// ── Auth verification ─────────────────────────────────────────────────────────
// Extracts the Bearer token from the Authorization header and verifies it with
// Firebase Admin. Returns the decoded token (its .uid/.email are the only identity this file trusts).
async function verifyUserToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) throw new Error('No authorization token provided')
  const admin = await getAdmin()
  return admin.auth().verifyIdToken(token)
}

// ── App Check (bot protection) — monitor mode ───────────────────────────────
// Logs whether the request carried a valid App Check token but never blocks on it unless
// APP_CHECK_ENFORCE=true is set in Netlify's environment — that's the switch to flip once
// Firebase Console shows real traffic verifying correctly (Console → App Check).
async function checkAppCheck(event) {
  const token = event.headers['x-firebase-appcheck']
  if (!token) { console.log('[app-check] missing'); return false }
  try {
    const admin = await getAdmin()
    await admin.appCheck().verifyToken(token)
    return true
  } catch (e) {
    console.log('[app-check] invalid:', e.message)
    return false
  }
}

module.exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck' }, body: '' }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  const appCheckValid = await checkAppCheck(event)
  if (process.env.APP_CHECK_ENFORCE === 'true' && !appCheckValid) {
    return respond(401, { error: 'Request verification failed.' })
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return respond(500, { error: 'VAPID keys not configured in Netlify environment variables' })
  }

  let decoded
  try {
    decoded = await verifyUserToken(event)
  } catch (e) {
    return respond(401, { error: 'Please sign in to use notifications.' })
  }

  webpush.setVapidDetails(`mailto:${ADMIN_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE)

  let body
  try { body = JSON.parse(event.body || '{}') } catch(e) { return respond(400, { error: 'Invalid JSON' }) }

  const { subscription, subscriptions, title, message, url } = body

  // Batch/broadcast sends are admin-only — checked against the VERIFIED token's email, never a
  // client-supplied field. Nothing in the app currently calls this path (self test-push always
  // sends a single subscription — see below), so this is reserved for a future admin broadcast
  // feature or an external script run as the admin account.
  if (subscriptions && decoded.email !== ADMIN_EMAIL) {
    return respond(403, { error: 'Forbidden' })
  }

  const payload = JSON.stringify({
    title: title || 'RevisionFlow',
    body:  message || 'Time to revise!',
    icon:  '/favicon.svg',
    badge: '/favicon.svg',
    url:   url || '/',
    timestamp: Date.now(),
  })

  // Single subscription send — any signed-in user, sending their own device's subscription
  // (this is what the "send test notification" button and auto-subscribe flow actually do).
  if (subscription) {
    try {
      await webpush.sendNotification(subscription, payload)
      return respond(200, { ok: true })
    } catch(e) {
      if (e.statusCode === 410) return respond(200, { ok: true, expired: true })
      return respond(500, { error: e.message })
    }
  }

  // Batch send to multiple subscriptions (admin-only, see check above)
  if (subscriptions && Array.isArray(subscriptions)) {
    const results = { sent: 0, expired: 0, failed: 0 }
    await Promise.all(subscriptions.map(async sub => {
      try {
        await webpush.sendNotification(sub, payload)
        results.sent++
      } catch(e) {
        if (e.statusCode === 410) results.expired++
        else results.failed++
      }
    }))
    return respond(200, { ok: true, ...results })
  }

  return respond(400, { error: 'subscription or subscriptions required' })
}
