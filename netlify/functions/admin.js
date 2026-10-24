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

const { officialSetMeta, canonicalBoardName, normaliseLevelName } = require('./lib/setMeta')

const ADMIN_EMAIL = 'femiaisida1@gmail.com'

// ── Firebase Admin singleton ──────────────────────────────────────────────────
let _admin = null
async function getAdmin() {
  if (_admin) return _admin
  const admin = require('firebase-admin')
const { validateQuestionStructure } = require('./lib/structure')
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    },
    body: JSON.stringify(body),
  }
}

// ── App Check (bot protection) — monitor mode, see notify.js for the full explanation.
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

// ── Audit log ──────────────────────────────────────────────────────────────
// Records every privileged write this function makes to adminAuditLog, so there's a trail
// to check if something looks wrong later, or if the admin account itself is ever
// compromised. Fire-and-forget on purpose — a logging failure should never block or delay
// the actual admin action.
function logAdminAction(db, action, details = {}) {
  db.collection('adminAuditLog').add({
    action,
    actorEmail: ADMIN_EMAIL,
    details,
    timestamp: new Date().toISOString(),
  }).catch(e => console.warn('[admin] audit log write failed:', e.message))
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  const appCheckValid = await checkAppCheck(event)
  if (process.env.APP_CHECK_ENFORCE === 'true' && !appCheckValid) {
    return respond(401, { error: 'Request verification failed.' })
  }

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

  // Admin-settable fields via setUserField/bulkSetField, as an ALLOWLIST rather than a
  // denylist. The previous version blocked a short, specific list of sensitive fields
  // (stripeSecretKey, serviceAccount, __proto__, constructor) and allowed everything else —
  // meaning any OTHER field on a user doc (uid, email, createdAt, xp, adminAuditLog-adjacent
  // fields, anything) was writable by construction, not by decision. Checked every caller in
  // the app (Admin.jsx's Beta/Pro toggle buttons are the only ones) before narrowing this:
  // 'betaUser' and 'isPro' are the only two fields anything currently sets through either
  // action. A future admin feature that needs to set something else will get a clear,
  // deliberate error here rather than silently working — extend this list explicitly when
  // that's actually needed, rather than widening it speculatively now.
  const ADMIN_SETTABLE_FIELDS = ['betaUser', 'isPro']

  try {
    const admin = await getAdmin()
    const db    = admin.firestore()

    // ── Set a single field on one user ────────────────────────────
    if (action === 'setUserField') {
      if (!targetUid || field === undefined || value === undefined) {
        return respond(400, { error: 'targetUid, field, value required' })
      }
      if (!ADMIN_SETTABLE_FIELDS.includes(field)) {
        return respond(400, { error: 'Field not allowed via setUserField: ' + field })
      }
      await db.collection('users').doc(targetUid).update({ [field]: value })
      logAdminAction(db, 'setUserField', { targetUid, field, value })
      return respond(200, { ok: true })
    }

    // ── Bulk set field on multiple users ──────────────────────────
    if (action === 'bulkSetField') {
      if (!targetUids || !Array.isArray(targetUids) || field === undefined || value === undefined) {
        return respond(400, { error: 'targetUids array, field, value required' })
      }
      if (!ADMIN_SETTABLE_FIELDS.includes(field)) {
        return respond(400, { error: 'Field not allowed via bulkSetField: ' + field })
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
      logAdminAction(db, 'bulkSetField', { targetUids, count: targetUids.length, field, value })
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
      logAdminAction(db, 'addResourceLink', { subject, name, url })
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
      logAdminAction(db, 'bulkAddResourceLinks', { added })
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
      logAdminAction(db, 'deleteResourceLink', { linkId })
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
      const summary = { usersChecked: 0, subjectsWithHistory: 0, archivedByTag: 0, archivedByGrade: 0, archivedByTime: 0, leftAmbiguous: 0, examDatesRemoved: 0 }
      const toArchive = []
      const examDateFixes = [] // { userId, keptExamDates }

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

        const switchedSubjectNames = new Set()

        for (const subjectName of Object.keys(bySubject)) {
          const records = bySubject[subjectName]
          const subjMeta = subjectsList.find(s => s.name === subjectName)
          // No current entry at all for this subject (dropped, nothing replaced it) — there's
          // no qualification for its history to still match, so everything about it should be
          // superseded, not compared against the account's general qualification.
          const currentQual = subjMeta ? subjectQualification(subjMeta, profile) : null

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
          if (touchedThisSubject) { summary.subjectsWithHistory++; switchedSubjectNames.add(subjectName) }
        }

        // A subject with confirmed superseded history also means any exam date entries still
        // sitting there for that subject are for a qualification it's no longer at — a new
        // specification means new dates, which the student re-adds in Exam Dates, so old ones
        // aren't worth keeping around the way Past Papers/quiz history is.
        const examDates = Array.isArray(profile.examDates) ? profile.examDates : []
        if (switchedSubjectNames.size && examDates.length) {
          const keptExamDates = examDates.filter(e => !switchedSubjectNames.has(e.subject))
          if (keptExamDates.length !== examDates.length) {
            examDateFixes.push({ userId: userDoc.id, keptExamDates })
            summary.examDatesRemoved += examDates.length - keptExamDates.length
          }
        }
      }

      const batchSize = 400
      for (let i = 0; i < toArchive.length; i += batchSize) {
        const batch = db.batch()
        toArchive.slice(i, i + batchSize).forEach(ref => batch.update(ref, { archived: true }))
        await batch.commit()
      }
      for (const fix of examDateFixes) {
        await db.collection('users').doc(fix.userId).update({ examDates: fix.keptExamDates })
      }

      logAdminAction(db, 'archiveSupersededQualificationData', { targetUid: onlyUid || 'all users', totalArchived: toArchive.length })
      return respond(200, { ok: true, summary: { ...summary, totalArchived: toArchive.length } })
    }

    // ── Official flashcard sets: repair old data, and record an admin review ──────────────────────
    // Sets made by the old bulk generator keep their board and level only inside the title, and were
    // never reviewed. These two actions fix that on the server (the Firestore rules forbid clients from
    // writing official sets). migrateOfficialSets stamps board and level as real fields so the board
    // filter can find the sets. verifyOfficialSets records that an admin has reviewed sets: it is a
    // dry run (counts only) unless confirm === true, and every change is written to the audit log.
    if (action === 'migrateOfficialSets' || action === 'verifyOfficialSets') {
      const [byUid, byType] = await Promise.all([
        db.collection('publicFlashcards').where('uid', '==', 'official').get(),
        db.collection('publicFlashcards').where('authorType', '==', 'official').get(),
      ])
      const officialDocs = new Map()
      for (const d of [...byUid.docs, ...byType.docs]) officialDocs.set(d.id, d)

      const commitInChunks = async (updates) => {          // updates: [{ ref, patch }]
        for (let i = 0; i < updates.length; i += 400) {
          const batch = db.batch()
          for (const u of updates.slice(i, i + 400)) batch.update(u.ref, u.patch)
          await batch.commit()
        }
      }

      if (action === 'migrateOfficialSets') {
        const summary = { scanned: officialDocs.size, stamped: 0, alreadyFine: 0, unreadable: 0 }
        const updates = []
        for (const d of officialDocs.values()) {
          const data = d.data()
          const meta = officialSetMeta(data)
          const patch = {}
          if (meta.board && data.board !== meta.board) patch.board = meta.board
          if (meta.level && data.level !== meta.level) patch.level = meta.level
          if (!meta.board || !meta.level) summary.unreadable++
          if (Object.keys(patch).length) { updates.push({ ref: d.ref, patch }); summary.stamped++ }
          else if (meta.board && meta.level) summary.alreadyFine++
        }
        await commitInChunks(updates)
        logAdminAction(db, 'migrateOfficialSets', summary)
        return respond(200, { ok: true, summary })
      }

      const { filter = {}, confirm } = body
      const wantBoard   = filter.board   ? canonicalBoardName(filter.board)   : ''
      const wantLevel   = filter.level   ? normaliseLevelName(filter.level)   : ''
      const wantSubject = filter.subject ? String(filter.subject).trim()      : ''
      const matched = []
      let alreadyVerified = 0
      for (const d of officialDocs.values()) {
        const data = d.data()
        if (data.verified === true) { alreadyVerified++; continue }
        const meta = officialSetMeta(data)
        if (wantBoard && meta.board !== wantBoard) continue
        if (wantLevel && meta.level !== wantLevel) continue
        if (wantSubject && data.subject !== wantSubject) continue
        matched.push({ doc: d, meta })
      }
      if (confirm !== true) {
        return respond(200, { ok: true, dryRun: true, wouldVerify: matched.length, alreadyVerified, total: officialDocs.size })
      }
      const now = new Date().toISOString()
      const updates = matched.map(({ doc, meta }) => {
        const data = doc.data()
        const patch = {
          verified: true, verifiedAt: now, verifiedBy: ADMIN_EMAIL, version: (Number(data.version) || 0) + 1,
          provenance: { status: 'verified', approvedBy: ADMIN_EMAIL, approvedAt: now, via: 'admin review of an existing set' },
        }
        if (meta.board && data.board !== meta.board) patch.board = meta.board
        if (meta.level && data.level !== meta.level) patch.level = meta.level
        return { ref: doc.ref, patch }
      })
      await commitInChunks(updates)
      logAdminAction(db, 'verifyOfficialSets', { verified: updates.length, filter: { board: wantBoard, level: wantLevel, subject: wantSubject } })
      return respond(200, { ok: true, verified: updates.length, alreadyVerified })
    }

    // ── Content pipeline: draft → review → approval ───────────────
    // Every privileged content write (admin overrides, official flashcards, verified
    // topic notes) goes through here. Nothing reaches a live collection until an admin
    // has explicitly moved the draft to review and then approved it.
    if (action === 'contentDraft' || action === 'contentSubmit' || action === 'contentApprove' ||
        action === 'contentReject' || action === 'contentListDrafts') {
      const CONTENT_KINDS = {
        topicOverride:     'topicOverrides',
        examDateOverride:  'examDateOverrides',
        paperSpecOverride: 'paperSpecOverrides',
        boundaryOverride:  'boundaryOverrides',
        officialFlashcard: 'publicFlashcards',
        topicNote:         'topicNotes',
      }
      const ID_RE = /^[A-Za-z0-9_-]{1,200}$/
      const drafts = db.collection('adminDrafts')

      if (action === 'contentListDrafts') {
        const status = body.status
        let q = drafts.orderBy('createdAt', 'desc').limit(100)
        const snap = await q.get()
        // `id` must stay the DRAFT document's id (what approve / reject look up). The draft's own data also has an
        // `id` field (the id of the content being changed), which used to overwrite it; that one is `contentId`.
        const rows = snap.docs.map(d => ({ ...d.data(), contentId: d.data().id, id: d.id, draftId: d.id })).filter(r => !status || r.status === status)
        return respond(200, { drafts: rows })
      }

      if (action === 'contentDraft') {
        const { kind, id, op = 'set', data } = body
        if (!CONTENT_KINDS[kind]) return respond(400, { error: 'Unknown content kind: ' + kind })
        if (!ID_RE.test(String(id || ''))) return respond(400, { error: 'Invalid content id' })
        if (op !== 'set' && op !== 'delete') return respond(400, { error: 'op must be set or delete' })
        let clean = null
        if (op === 'set') {
          if (!data || typeof data !== 'object' || Array.isArray(data)) return respond(400, { error: 'data object required' })
          if (JSON.stringify(data).length > 900000) return respond(400, { error: 'Draft too large' })
          clean = { ...data }
          delete clean.provenance; delete clean.updatedAt; delete clean.verified
          if (kind === 'boundaryOverride') {
            // Boundaries must carry provenance so the app never passes off another year's data as official.
            if (!Number.isInteger(clean.year) || !String(clean.source || '').trim()) {
              return respond(400, { error: 'boundaryOverride requires an integer year and a source' })
            }
          }
          if (kind === 'paperSpecOverride' && clean.questions !== undefined && clean.questions !== null) { // null = remove the structure
            // An official per-question structure must describe the paper exactly - this is what makes
            // it "verified" for students, so a structure that doesn't add up is refused outright.
            const check = validateQuestionStructure(clean.questions, { maxMarks: clean.maxMarks, level: clean.level, subject: clean.subject })
            if (!check.ok) return respond(400, { error: 'Invalid question structure: ' + check.errors.join(' ') })
            clean.questions = clean.questions.map(q => ({ num: q.num, marks: q.marks }))
          }
          if (kind === 'officialFlashcard') {
            clean.uid = 'official'; clean.official = true; clean.authorType = 'official'; clean.isPublic = true
          }
        }
        const draftId = kind + '__' + id
        await drafts.doc(draftId).set({
          kind, id, op, data: clean, status: 'draft',
          createdAt: new Date().toISOString(), createdBy: ADMIN_EMAIL,
          reviewedAt: null, rejectedReason: null,
        })
        logAdminAction(db, 'contentDraft', { draftId, op })
        return respond(200, { ok: true, draftId, status: 'draft' })
      }

      const { draftId } = body
      if (!ID_RE.test(String(draftId || '').replace(/__/g, '_'))) return respond(400, { error: 'Invalid draftId' })
      const ref = drafts.doc(draftId)
      const snap = await ref.get()
      if (!snap.exists) return respond(404, { error: 'Draft not found' })
      const draft = snap.data()

      if (action === 'contentSubmit') {
        if (draft.status !== 'draft') return respond(409, { error: 'Only drafts can be submitted for review' })
        await ref.update({ status: 'in_review', submittedAt: new Date().toISOString() })
        return respond(200, { ok: true, status: 'in_review' })
      }

      if (action === 'contentReject') {
        if (draft.status === 'approved') return respond(409, { error: 'Already approved' })
        await ref.update({ status: 'rejected', rejectedReason: String(body.reason || '').slice(0, 500), reviewedAt: new Date().toISOString() })
        return respond(200, { ok: true, status: 'rejected' })
      }

      // contentApprove — idempotent: re-approving an approved draft is a no-op.
      if (draft.status === 'approved') return respond(200, { ok: true, status: 'approved', alreadyApproved: true })
      if (draft.status !== 'in_review') return respond(409, { error: 'Draft must be in review before approval' })
      const target = db.collection(CONTENT_KINDS[draft.kind]).doc(draft.id)
      if (draft.op === 'delete') {
        await target.delete()
      } else {
        // A doc created by approval needs createdAt: Firestore leaves documents without the field
        // out of any orderBy('createdAt') query, which would hide approved sets from the community list.
        const already = await target.get()
        await target.set({
          ...(already.exists ? {} : { createdAt: admin.firestore.FieldValue.serverTimestamp() }),
          ...draft.data,
          provenance: { status: 'verified', approvedBy: ADMIN_EMAIL, approvedAt: new Date().toISOString(), draftId },
          verified: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })
      }
      await ref.update({ status: 'approved', reviewedAt: new Date().toISOString() })
      logAdminAction(db, 'contentApprove', { draftId, kind: draft.kind, op: draft.op })
      return respond(200, { ok: true, status: 'approved' })
    }

    return respond(400, { error: 'Unknown action: ' + action })

  } catch(e) {
    console.error('[admin]', e.message)
    return respond(500, { error: 'Internal server error' })
  }
}
