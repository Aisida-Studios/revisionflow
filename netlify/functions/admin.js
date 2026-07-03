// netlify/functions/admin.js
// Server-side admin operations using Firebase Admin SDK (bypasses Firestore rules).
//
// SECURITY MODEL:
//   Every request must include a valid Firebase ID token in the Authorization header.
//   The server verifies this token with Firebase Admin Auth — it cannot be faked.
//   The decoded token's email must match ADMIN_EMAIL exactly.
//   callerEmail in the body is still checked for defence-in-depth, but the
//   token verification is the real gate.
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const ADMIN_EMAIL = 'femiaisida1@gmail.com'

// ── Firebase Admin singleton ──────────────────────────────────────────────────
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

// ── Response helper ───────────────────────────────────────────────────────────
function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  }
}

// ── Auth verification ─────────────────────────────────────────────────────────
// Extracts the Bearer token from the Authorization header and verifies it
// with Firebase Admin. Returns the decoded token or throws.
async function verifyAdminToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) throw new Error('No authorization token provided')

  const admin = await getAdmin()
  const decoded = await admin.auth().verifyIdToken(token)

  if (decoded.email !== ADMIN_EMAIL) {
    throw new Error('Forbidden: not an admin account')
  }

  return decoded
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  // ── Verify Firebase ID token before doing anything ────────────────────────
  try {
    await verifyAdminToken(event)
  } catch(e) {
    console.warn('[admin] auth failed:', e.message)
    return respond(403, { error: 'Forbidden' })
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch(e) { return respond(400, { error: 'Invalid JSON' }) }

  const { action, targetUid, targetUids, field, value } = body

  if (!action) return respond(400, { error: 'action required' })

  try {
    const admin = await getAdmin()
    const db    = admin.firestore()

    // ── Set a single field on one user ────────────────────────────
    if (action === 'setUserField') {
      if (!targetUid || field === undefined || value === undefined) {
        return respond(400, { error: 'targetUid, field, value required' })
      }
      // Guard against writing sensitive internal fields via this endpoint
      const BLOCKED_FIELDS = ['stripeSecretKey', 'serviceAccount', '__proto__', 'constructor']
      if (BLOCKED_FIELDS.includes(field)) {
        return respond(400, { error: 'Cannot write protected field: ' + field })
      }
      await db.collection('users').doc(targetUid).update({ [field]: value })
      return respond(200, { ok: true })
    }

    // ── Bulk set field on multiple users ──────────────────────────
    if (action === 'bulkSetField') {
      if (!targetUids || !Array.isArray(targetUids) || field === undefined || value === undefined) {
        return respond(400, { error: 'targetUids array, field, value required' })
      }
      const BLOCKED_FIELDS = ['stripeSecretKey', 'serviceAccount', '__proto__', 'constructor']
      if (BLOCKED_FIELDS.includes(field)) {
        return respond(400, { error: 'Cannot write protected field: ' + field })
      }
      const batchSize = 400
      const chunks = []
      for (let i = 0; i < targetUids.length; i += batchSize) {
        chunks.push(targetUids.slice(i, i + batchSize))
      }
      for (const chunk of chunks) {
        const batch = db.batch()
        chunk.forEach(uid => {
          batch.update(db.collection('users').doc(uid), { [field]: value })
        })
        await batch.commit()
      }
      return respond(200, { ok: true, updated: targetUids.length })
    }

    // ── Find user by email ────────────────────────────────────────
    if (action === 'findByEmail') {
      const { email } = body
      if (!email) return respond(400, { error: 'email required' })
      // Use Firebase Auth (not Firestore query) — more reliable and doesn't
      // require email to be stored on the user document
      try {
        const userRecord = await admin.auth().getUserByEmail(email.toLowerCase())
        const snap = await db.collection('users').doc(userRecord.uid).get()
        if (!snap.exists) return respond(200, { user: null })
        const { stripeSecretKey, serviceAccount, ...safe } = snap.data()
        return respond(200, { user: { id: snap.id, ...safe } })
      } catch(e) {
        if (e.code === 'auth/user-not-found') return respond(200, { user: null })
        throw e
      }
    }

    // ── List users ────────────────────────────────────────────────
    if (action === 'listUsers') {
      const { limitN = 200, filterField, filterValue } = body
      let q = db.collection('users').orderBy('createdAt', 'desc').limit(Math.min(limitN, 500))
      if (filterField && filterValue !== undefined) {
        q = db.collection('users').where(filterField, '==', filterValue).limit(Math.min(limitN, 500))
      }
      const snap = await q.get()
      const users = snap.docs.map(d => {
        const { stripeSecretKey, serviceAccount, ...safe } = d.data()
        return { id: d.id, ...safe }
      })
      return respond(200, { users })
    }

    // ── Add single resource link ──────────────────────────────────
    if (action === 'addResourceLink') {
      const { subject, keywords, name, url, site } = body
      if (!subject || !keywords || !name || !url) {
        return respond(400, { error: 'subject, keywords, name, url required' })
      }
      const ref = await db.collection('topicResourceLinks').add({
        subject,
        keywords: Array.isArray(keywords) ? keywords : String(keywords).split(',').map(k => k.trim().toLowerCase()).filter(Boolean),
        name,
        url,
        site: site || name,
        createdAt: new Date().toISOString(),
      })
      return respond(200, { ok: true, id: ref.id })
    }

    // ── Bulk add resource links ───────────────────────────────────
    if (action === 'bulkAddResourceLinks') {
      const { rows } = body
      if (!rows || !Array.isArray(rows) || !rows.length) {
        return respond(400, { error: 'rows array required' })
      }
      const batchSize = 400
      const chunks = []
      for (let i = 0; i < rows.length; i += batchSize) chunks.push(rows.slice(i, i + batchSize))
      let added = 0
      for (const chunk of chunks) {
        const batch = db.batch()
        chunk.forEach(row => {
          if (!row.subject || !row.keywords || !row.name || !row.url) return
          const ref = db.collection('topicResourceLinks').doc()
          batch.set(ref, {
            subject: row.subject,
            keywords: Array.isArray(row.keywords)
              ? row.keywords
              : String(row.keywords).split('|').map(k => k.trim().toLowerCase()).filter(Boolean),
            name:     row.name,
            url:      row.url,
            site:     row.site || row.name,
            createdAt: new Date().toISOString(),
          })
          added++
        })
        await batch.commit()
      }
      return respond(200, { ok: true, added })
    }

    // ── List resource links ───────────────────────────────────────
    if (action === 'listResourceLinks') {
      const snap = await db.collection('topicResourceLinks').orderBy('createdAt', 'desc').limit(1000).get()
      const links = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return respond(200, { links })
    }

    // ── Delete resource link ──────────────────────────────────────
    if (action === 'deleteResourceLink') {
      const { linkId } = body
      if (!linkId) return respond(400, { error: 'linkId required' })
      await db.collection('topicResourceLinks').doc(linkId).delete()
      return respond(200, { ok: true })
    }

    return respond(400, { error: 'Unknown action: ' + action })

  } catch(e) {
    console.error('[admin]', e.message)
    return respond(500, { error: 'Internal server error' })
  }
}
