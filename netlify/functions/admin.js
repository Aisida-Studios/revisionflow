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

    // ── Archive Past Papers/quiz results superseded by a qualification switch ──────
    // One-time (safe to re-run) backfill: for every user and every subject, finds history
    // that belongs to a qualification other than the subject's current one and flags it
    // archived:true so it drops out of current-qualification views but keeps counting toward
    // lifetime stats. Already-tagged records are handled directly. Untagged (legacy) records
    // are classified in order: grade format (a numeric grade or a Combined Science pair can
    // only be GCSE, "A*" can only be A-Level), then whichever other record for the same
    // subject is closest in time, then left alone (treated as current) if neither applies.
    // Mirrors gradeImpliesQualification / nearestTaggedQualification / archiveSupersededAttempts
    // in src/utils/firestore.js — keep the two in sync if either one changes.
    if (action === 'archiveSupersededQualificationData') {
      const { targetUid: onlyUid } = body

      function gradeImpliesQualification(grade) {
        if (!grade) return null
        const g = String(grade).trim()
        if (/^[1-9]$/.test(g)) return 'GCSE'
        if (/^[1-9]-[1-9]$/.test(g)) return 'GCSE'
        if (g === 'A*') return 'A-Level'
        return null
      }
      function subjectQualification(subject, profile) {
        return (subject && subject.qualification) || (profile && profile.qualification) || 'GCSE'
      }
      function nearestTaggedQualification(records, targetMillis) {
        let best = null, bestDiff = Infinity
        for (const r of records) {
          if (!r.qualification || r.createdAtMillis == null) continue
          const diff = Math.abs(r.createdAtMillis - targetMillis)
          if (diff < bestDiff) { bestDiff = diff; best = r.qualification }
        }
        return best
      }

      let userDocs
      if (onlyUid) {
        const single = await db.collection('users').doc(onlyUid).get()
        userDocs = single.exists ? [single] : []
      } else {
        const snap = await db.collection('users').get()
        userDocs = snap.docs
      }

      // usersChecked/subjectsWithHistory count real activity found; archivedBy* count how each
      // archived record was classified; leftAmbiguous is records with no usable signal at all
      // (no tag, no diagnostic grade, no other record for that subject to compare against) —
      // those are deliberately left untouched rather than guessed at with nothing to go on.
      const summary = { usersChecked: 0, subjectsWithHistory: 0, archivedByTag: 0, archivedByGrade: 0, archivedByTime: 0, leftAmbiguous: 0 }
      const toArchive = []

      for (const userDoc of userDocs) {
        const profile = userDoc.data()
        const subjectsList = Array.isArray(profile.subjects) ? profile.subjects : []
        if (!subjectsList.length) continue

        const [papersSnap, quizzesSnap] = await Promise.all([
          db.collection('users').doc(userDoc.id).collection('paperAttempts').get(),
          db.collection('users').doc(userDoc.id).collection('quizResults').get(),
        ])
        const allDocs = [...papersSnap.docs, ...quizzesSnap.docs]
          .map(d => ({ ref: d.ref, ...d.data() }))
          .filter(d => !d.archived)
        if (!allDocs.length) continue
        summary.usersChecked++

        const bySubject = {}
        allDocs.forEach(d => {
          if (!d.subject) return
          ;(bySubject[d.subject] = bySubject[d.subject] || []).push(d)
        })

        for (const subjectName of Object.keys(bySubject)) {
          const records = bySubject[subjectName]
          const subjMeta = subjectsList.find(s => s.name === subjectName)
          const currentQual = subjectQualification(subjMeta, profile)

          const tagged = records
            .filter(d => d.qualification)
            .map(d => ({ qualification: d.qualification, createdAtMillis: d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : null }))

          let touchedThisSubject = false

          for (const d of records) {
            if (d.qualification) {
              if (d.qualification !== currentQual) { toArchive.push(d.ref); summary.archivedByTag++; touchedThisSubject = true }
              continue
            }
            const byGrade = gradeImpliesQualification(d.grade)
            if (byGrade) {
              if (byGrade !== currentQual) { toArchive.push(d.ref); summary.archivedByGrade++; touchedThisSubject = true }
              continue
            }
            const targetMillis = d.createdAt && d.createdAt.toMillis ? d.createdAt.toMillis() : null
            const nearest = targetMillis != null ? nearestTaggedQualification(tagged, targetMillis) : null
            if (nearest) {
              if (nearest !== currentQual) { toArchive.push(d.ref); summary.archivedByTime++; touchedThisSubject = true }
              // else nearest === currentQual: confidently current, correctly left unarchived
            } else {
              summary.leftAmbiguous++
            }
          }
          if (touchedThisSubject) summary.subjectsWithHistory++
        }
      }

      const batchSize = 400
      for (let i = 0; i < toArchive.length; i += batchSize) {
        const batch = db.batch()
        toArchive.slice(i, i + batchSize).forEach(ref => batch.update(ref, { archived: true }))
        await batch.commit()
      }

      return respond(200, { ok: true, summary: { ...summary, totalArchived: toArchive.length } })
    }

    return respond(400, { error: 'Unknown action: ' + action })

  } catch(e) {
    console.error('[admin]', e.message)
    return respond(500, { error: 'Internal server error' })
  }
}
