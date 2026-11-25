// netlify/functions/announcements.js
// Admin-authored, audience-targeted in-app announcements (release notes, price changes, "beta users keep lifetime Pro" messaging,
// etc.) — shown as a dismissible banner in-app (AnnouncementBanner.jsx).
//
// Deliberately its own file, not folded into admin.js or Admin.jsx's existing "Content" tab (which is about bulk AI topic-note
// generation — a different concern).
//
// WHY A FUNCTION, NOT A DIRECT CLIENT FIRESTORE READ: the announcements collection is server-only in firestore.rules (it falls
// under the catch-all deny), so it is never exposed to the client SDK. Reads and writes both go through here.
//
// SECURITY MODEL
//   * `active` (what the banner calls) needs any signed-in student. Their audience (free / pro / beta) is resolved on the
//     server from the verified token's uid, never from anything the browser claims.
//   * Everything else needs a VERIFIED admin (lib/auth.js requireAdmin: verified token, revocation checked, verified e-mail on the
//     admin list). Each change is written to adminAuditLog BEFORE it is made (lib/audit.js); if that cannot be written, nothing
//     changes.
//   * The banner turns `linkUrl` into a clickable link for every student, so a link is only ever a plain https:// address or a
//     path inside this site: never javascript:, data: or a protocol-relative address. That is checked when an announcement is
//     saved AND again when one is served, so an old or hand-edited record cannot put a bad link in front of students.
//   * Input is bounded and typed; errors are generic and logs carry no personal data (lib/http.js).
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
'use strict'

const { route, parseJsonBody, respond, HttpError } = require('./lib/http')
const { getAdmin, verifyUser, requireAdmin, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')
const { logAdminAction } = require('./lib/audit')

const VALID_AUDIENCES = ['all', 'free', 'pro', 'beta']
const VALID_TYPES = ['info', 'success', 'warning']
const ID_RE = /^[A-Za-z0-9_-]{1,100}$/
const MESSAGE_MAX = 500
const LINK_URL_MAX = 500
const LINK_TEXT_MAX = 60
const MAX_BODY_BYTES = 8 * 1024
const MAX_SHOWN = 3

// ── Field checks. Each returns { ok: true, value } or { ok: false, error }. ────────────────────────────────────────────
const bad = (error) => ({ ok: false, error })
const good = (value) => ({ ok: true, value })
const isEmpty = (v) => v === undefined || v === null || v === ''

function checkMessage(v) {
  if (typeof v !== 'string' || !v.trim()) return bad('message required')
  const s = v.trim()
  return s.length > MESSAGE_MAX ? bad(`message must be at most ${MESSAGE_MAX} characters`) : good(s)
}
// A path inside this site ("/pro", "/study?tab=1") or a plain https address. Anything else is refused.
function checkLinkUrl(v) {
  if (isEmpty(v)) return good(null)
  if (typeof v !== 'string' || v.length > LINK_URL_MAX || /[\s\\\u0000-\u001f\u007f]/.test(v)) return bad('linkUrl must be a plain https:// address or a path starting with /')
  if (v.startsWith('/')) return /^\/(?![/\\])[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/.test(v) ? good(v) : bad('linkUrl must be a plain https:// address or a path starting with /')
  // "https://" must be written out. A browser reads "https:example.com" on an https page as a path on THIS site, so it would not go
  // where the address parsed on its own seems to say.
  if (!/^https:\/\//i.test(v)) return bad('linkUrl must be a plain https:// address or a path starting with /')
  let u
  try { u = new URL(v) } catch { return bad('linkUrl must be a plain https:// address or a path starting with /') }
  if (u.protocol !== 'https:' || u.username || u.password || !u.hostname.includes('.')) return bad('linkUrl must be a plain https:// address or a path starting with /')
  return good(v)
}
function checkLinkText(v) {
  if (isEmpty(v)) return good(null)
  if (typeof v !== 'string') return bad('linkText must be text')
  const s = v.trim()
  return s.length > LINK_TEXT_MAX ? bad(`linkText must be at most ${LINK_TEXT_MAX} characters`) : good(s || null)
}
// Stored as an ISO string (that is what the expiry filter compares). The admin screen already sends one; it must start with a
// four-digit year-month-day so a loose string such as "1" or "next friday" is never guessed at.
function checkExpiresAt(v) {
  if (isEmpty(v)) return good(null)
  if (typeof v !== 'string' || v.length > 40 || !/^\d{4}-\d{2}-\d{2}/.test(v) || Number.isNaN(Date.parse(v))) return bad('expiresAt must be a date')
  return good(new Date(v).toISOString())
}
const checkType = (v) => (VALID_TYPES.includes(v) ? good(v) : bad('invalid type'))
const checkAudience = (v) => (VALID_AUDIENCES.includes(v) ? good(v) : bad('invalid audience'))
const checkActive = (v) => (typeof v === 'boolean' ? good(v) : bad('active must be true or false'))

const FIELD_CHECKS = { message: checkMessage, type: checkType, audience: checkAudience, linkUrl: checkLinkUrl, linkText: checkLinkText, expiresAt: checkExpiresAt, active: checkActive }

// True while an announcement should still be shown. No expiry means no end date. An expiry that cannot be read as a date (a
// hand-edited record, a Firestore Timestamp, free text) HIDES the announcement: a stale notice that never goes away is worse than
// one that is not shown. Compared as real instants, so an offset such as "+01:00" is honoured.
function isLive(expiresAt, nowMs) {
  if (expiresAt === undefined || expiresAt === null || expiresAt === '') return true
  if (typeof expiresAt !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(expiresAt)) return false
  const t = Date.parse(expiresAt)
  return Number.isFinite(t) && t > nowMs
}

// 'pro' matches ProGate.jsx's own isStripe definition exactly: isPro true AND not a beta grant — an actual paying subscriber, not
// lifetime-free-Pro from the beta cohort.
function audienceMatches(audience, isPro, isBeta) {
  if (audience === 'all') return true
  if (audience === 'beta') return isBeta
  if (audience === 'pro') return isPro && !isBeta
  if (audience === 'free') return !isPro && !isBeta
  return false
}

// What a student is shown. Everything is re-checked here, whatever is stored.
function publicView(a) {
  if (typeof a.message !== 'string' || !a.message.trim()) return null
  const link = checkLinkUrl(a.linkUrl)
  const text = checkLinkText(a.linkText)
  return {
    id: a.id,
    message: a.message.slice(0, MESSAGE_MAX),
    type: VALID_TYPES.includes(a.type) ? a.type : 'info',
    linkUrl: link.ok ? link.value : null,
    linkText: link.ok && link.value && text.ok ? text.value : null,
  }
}

module.exports.handler = route('announcements', async (event) => {
  await enforceAppCheck(event)                       // monitor-only unless APP_CHECK_ENFORCE=true
  const body = parseJsonBody(event, { maxBytes: MAX_BODY_BYTES, allowEmpty: false })
  const action = body.action
  if (typeof action !== 'string' || !action) throw new HttpError(400, 'action required', 'bad_request')
  const db = getAdmin().firestore()

  // ── Read: the announcement(s) relevant to the signed-in caller right now ──────────────────────────────────────────
  if (action === 'active') {
    const decoded = await verifyUser(event)
    await enforceRateLimit(db, event, { route: 'announcements.active', uid: decoded.uid, limit: 120, windowSec: 3600 })
    const userSnap = await db.collection('users').doc(decoded.uid).get()
    const u = userSnap.exists ? userSnap.data() : {}
    const isPro = u.isPro === true
    const isBeta = u.betaUser === true

    const nowMs = Date.now()
    // Equality filter only. Adding .orderBy('createdAt') here needs a COMPOSITE Firestore index (an equality filter plus an
    // ordering on a different field); without that index Firestore throws FAILED_PRECONDITION, which made this endpoint return
    // 500 for every signed-in user and kept the banner from ever showing. The collection is small and admin-authored, so
    // newest-first is sorted in memory instead.
    const snap = await db.collection('announcements').where('active', '==', true).limit(50).get()
    const items = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))   // createdAt is an ISO string
      .filter(a => isLive(a.expiresAt, nowMs))
      .filter(a => audienceMatches(a.audience || 'all', isPro, isBeta))
      .map(publicView)
      .filter(Boolean)
      .slice(0, MAX_SHOWN)
    return respond(200, { announcements: items }, event)
  }

  // ── Everything below is admin-only ────────────────────────────────────────────────────────────────────────────────
  const actor = await requireAdmin(event)
  await enforceRateLimit(db, event, { route: 'announcements.admin', uid: actor.uid, limit: 600, windowSec: 3600 })

  if (action === 'list') {
    const snap = await db.collection('announcements').orderBy('createdAt', 'desc').limit(200).get()
    return respond(200, { announcements: snap.docs.map(d => ({ id: d.id, ...d.data() })) }, event)
  }

  if (action === 'create') {
    const fields = {}
    for (const [key, fallback] of [['message', undefined], ['type', 'info'], ['audience', 'all'], ['linkUrl', null], ['linkText', null], ['expiresAt', null]]) {
      const raw = body[key] === undefined ? fallback : body[key]
      const r = FIELD_CHECKS[key](raw)
      if (!r.ok) throw new HttpError(400, r.error, 'bad_request')
      fields[key] = r.value
    }
    if (fields.linkText && !fields.linkUrl) fields.linkText = null            // text without a link means nothing
    const ref = db.collection('announcements').doc()
    await logAdminAction(db, actor, 'createAnnouncement', { id: ref.id, audience: fields.audience, type: fields.type })
    await ref.set({ ...fields, active: true, createdAt: new Date().toISOString(), createdBy: actor.email })
    return respond(200, { ok: true, id: ref.id }, event)
  }

  if (action === 'update') {
    const { id } = body
    if (typeof id !== 'string' || !ID_RE.test(id)) throw new HttpError(400, 'id required', 'bad_request')
    const patch = {}
    for (const key of Object.keys(FIELD_CHECKS)) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) continue
      const r = FIELD_CHECKS[key](body[key])
      if (!r.ok) throw new HttpError(400, r.error, 'bad_request')
      patch[key] = r.value
    }
    if (Object.keys(patch).length === 0) throw new HttpError(400, 'Nothing to update', 'bad_request')
    const ref = db.collection('announcements').doc(id)
    if (!(await ref.get()).exists) throw new HttpError(404, 'Announcement not found', 'not_found')
    await logAdminAction(db, actor, 'updateAnnouncement', { id, patch })
    await ref.update(patch)
    return respond(200, { ok: true }, event)
  }

  if (action === 'delete') {
    const { id } = body
    if (typeof id !== 'string' || !ID_RE.test(id)) throw new HttpError(400, 'id required', 'bad_request')
    await logAdminAction(db, actor, 'deleteAnnouncement', { id })
    await db.collection('announcements').doc(id).delete()
    return respond(200, { ok: true }, event)
  }

  throw new HttpError(400, 'Unknown action', 'bad_request')
})

// Exported for tests only.
module.exports._internals = { checkLinkUrl, checkExpiresAt, isLive, publicView, audienceMatches, MESSAGE_MAX, LINK_TEXT_MAX, MAX_SHOWN }
