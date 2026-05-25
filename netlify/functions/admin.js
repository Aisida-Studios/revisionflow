// netlify/functions/admin.js
// Server-side admin operations — writes to Firestore using Firebase Admin SDK
// which bypasses client-side security rules. Protected by ADMIN_EMAIL check.
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const ADMIN_EMAIL = 'femiaisida1@gmail.com'

// Lazy-init Admin SDK to avoid cold-start overhead
let adminDb = null

async function getAdminDb() {
  if (adminDb) return adminDb

  const admin = require('firebase-admin')

  if (!admin.apps.length) {
    // FIREBASE_SERVICE_ACCOUNT must be the full service account JSON as a string
    // Set it in Netlify Dashboard → Site settings → Environment variables
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }

  adminDb = admin.firestore()
  return adminDb
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  }
}

module.exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let body
  try { body = JSON.parse(event.body || '{}') } catch(e) { return respond(400, { error: 'Invalid JSON' }) }

  const { action, callerEmail, targetUid, targetUids, field, value } = body

  // Verify caller is admin
  if (callerEmail !== ADMIN_EMAIL) {
    return respond(403, { error: 'Forbidden' })
  }

  if (!action) return respond(400, { error: 'action required' })

  try {
    const db = await getAdminDb()

    // ── Set a single field on a single user ──────────────────────
    if (action === 'setUserField') {
      if (!targetUid || field === undefined || value === undefined) {
        return respond(400, { error: 'targetUid, field, value required' })
      }
      await db.collection('users').doc(targetUid).update({ [field]: value })
      return respond(200, { ok: true })
    }

    // ── Bulk set field on multiple users ─────────────────────────
    if (action === 'bulkSetField') {
      if (!targetUids || !Array.isArray(targetUids) || field === undefined || value === undefined) {
        return respond(400, { error: 'targetUids array, field, value required' })
      }
      const batchSize = 400  // Firestore batch limit is 500
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

    // ── Get user by email ─────────────────────────────────────────
    if (action === 'findByEmail') {
      const { email } = body
      if (!email) return respond(400, { error: 'email required' })
      const snap = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get()
      if (snap.empty) return respond(200, { user: null })
      const d = snap.docs[0]
      return respond(200, { user: { id: d.id, ...d.data() } })
    }

    // ── List users ────────────────────────────────────────────────
    if (action === 'listUsers') {
      const { limitN = 200, filterField, filterValue } = body
      let q = db.collection('users').orderBy('createdAt', 'desc').limit(limitN)
      if (filterField && filterValue !== undefined) {
        q = db.collection('users').where(filterField, '==', filterValue).limit(limitN)
      }
      const snap = await q.get()
      const users = snap.docs.map(d => {
        const data = d.data()
        // Don't send sensitive fields to client
        const { privateKey, secretKey, ...safe } = data
        return { id: d.id, ...safe }
      })
      return respond(200, { users })
    }

    return respond(400, { error: 'Unknown action: ' + action })

  } catch(e) {
    console.error('[admin]', e.message)
    return respond(500, { error: e.message })
  }
}
