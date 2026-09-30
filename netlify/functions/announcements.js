// netlify/functions/announcements.js
// Admin-authored, audience-targeted in-app announcements (release notes, price changes,
// "beta users keep lifetime Pro" messaging, etc.) — shown as a dismissible banner in-app.
//
// Deliberately its own file, not folded into admin.js (which may be under active work
// elsewhere) or Admin.jsx's existing "Content" tab (which is about bulk AI topic-note
// generation — a different concern, and one the parallel AI-consolidation chat may be
// reworking per spec Section 40).
//
// WHY A FUNCTION, NOT A DIRECT CLIENT FIRESTORE READ: there are currently no
// version-controlled Firestore security rules for this app at all (flagged separately as
// the single highest-priority gap). Rather than add a new collection that needs a new rule
// to be safe, reads go through this function (like public-data.js and admin.js already do)
// so this collection is never exposed to the client SDK either way, rules or no rules.
//
// AUDIENCE TARGETING: the 'active' read action resolves the CALLER's own isPro/betaUser
// status server-side from their verified token's uid — never from a client-supplied claim —
// so a free user can't spoof 'pro' to see (or, more importantly, a write path couldn't let
// them spoof their way into) content meant for another segment.
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const ADMIN_EMAIL = 'femiaisida1@gmail.com'
const VALID_AUDIENCES = ['all', 'free', 'pro', 'beta']
const VALID_TYPES = ['info', 'success', 'warning']

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

// Any signed-in user — this is the read path, not the write path.
async function verifyUserToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) throw new Error('No authorization token provided')
  const admin = await getAdmin()
  return admin.auth().verifyIdToken(token)
}

async function verifyAdminToken(event) {
  const decoded = await verifyUserToken(event)
  if (decoded.email !== ADMIN_EMAIL) throw new Error('Forbidden: not an admin account')
  return decoded
}

function logAdminAction(db, action, details = {}) {
  db.collection('adminAuditLog').add({
    action, actorEmail: ADMIN_EMAIL, details, timestamp: new Date().toISOString(),
  }).catch(e => console.warn('[announcements] audit log write failed:', e.message))
}

// 'pro' matches ProGate.jsx's own isStripe definition exactly: isPro true AND not a beta
// grant — an actual paying subscriber, not lifetime-free-Pro from the beta cohort.
function audienceMatches(audience, isPro, isBeta) {
  if (audience === 'all') return true
  if (audience === 'beta') return isBeta
  if (audience === 'pro') return isPro && !isBeta
  if (audience === 'free') return !isPro && !isBeta
  return false
}

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
      },
      body: '',
    }
  }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return respond(400, { error: 'Invalid JSON' }) }
  const { action } = body
  if (!action) return respond(400, { error: 'action required' })

  try {
    const admin = await getAdmin()
    const db = admin.firestore()

    // ── Read: the announcement(s) relevant to the signed-in caller right now ──────
    if (action === 'active') {
      const decoded = await verifyUserToken(event)
      const userSnap = await db.collection('users').doc(decoded.uid).get()
      const u = userSnap.exists ? userSnap.data() : {}
      const isPro = !!u.isPro
      const isBeta = !!u.betaUser

      const nowIso = new Date().toISOString()
      const snap = await db.collection('announcements')
        .where('active', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(20) // small admin-authored collection — filter the rest in memory, no composite index needed
        .get()

      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => !a.expiresAt || a.expiresAt > nowIso)
        .filter(a => audienceMatches(a.audience || 'all', isPro, isBeta))
        .slice(0, 3)
        .map(a => ({ id: a.id, message: a.message, type: a.type || 'info', linkUrl: a.linkUrl || null, linkText: a.linkText || null }))

      return respond(200, { announcements: items })
    }

    // ── Everything below is admin-only ─────────────────────────────────────────
    await verifyAdminToken(event)

    if (action === 'list') {
      const snap = await db.collection('announcements').orderBy('createdAt', 'desc').limit(200).get()
      return respond(200, { announcements: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
    }

    if (action === 'create') {
      const { message, type = 'info', audience = 'all', linkUrl = null, linkText = null, expiresAt = null } = body
      if (!message || !message.trim()) return respond(400, { error: 'message required' })
      if (!VALID_TYPES.includes(type)) return respond(400, { error: 'invalid type' })
      if (!VALID_AUDIENCES.includes(audience)) return respond(400, { error: 'invalid audience' })
      const ref = await db.collection('announcements').add({
        message: message.trim(), type, audience, linkUrl, linkText, expiresAt,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: ADMIN_EMAIL,
      })
      logAdminAction(db, 'createAnnouncement', { id: ref.id, audience, type })
      return respond(200, { ok: true, id: ref.id })
    }

    if (action === 'update') {
      const { id, ...fields } = body
      if (!id) return respond(400, { error: 'id required' })
      const allowed = ['message', 'type', 'audience', 'linkUrl', 'linkText', 'expiresAt', 'active']
      const patch = {}
      for (const k of allowed) if (k in fields) patch[k] = fields[k]
      if (patch.type && !VALID_TYPES.includes(patch.type)) return respond(400, { error: 'invalid type' })
      if (patch.audience && !VALID_AUDIENCES.includes(patch.audience)) return respond(400, { error: 'invalid audience' })
      await db.collection('announcements').doc(id).update(patch)
      logAdminAction(db, 'updateAnnouncement', { id, patch })
      return respond(200, { ok: true })
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) return respond(400, { error: 'id required' })
      await db.collection('announcements').doc(id).delete()
      logAdminAction(db, 'deleteAnnouncement', { id })
      return respond(200, { ok: true })
    }

    return respond(400, { error: 'Unknown action: ' + action })
  } catch (e) {
    if (e.message === 'Forbidden: not an admin account' || e.message === 'No authorization token provided') {
      return respond(403, { error: 'Forbidden' })
    }
    console.error('[announcements] error:', e)
    return respond(500, { error: e.message })
  }
}
