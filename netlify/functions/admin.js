// netlify/functions/admin.js
// Server-side admin operations using Firebase Admin SDK (bypasses Firestore rules).
//
// SECURITY MODEL:
//   * Every request must carry a valid Firebase ID token. lib/auth.js `requireAdmin` verifies it with Firebase Admin (signature,
//     expiry AND revocation), requires the account's e-mail to be VERIFIED, and requires that address to be on the admin list
//     (ADMIN_EMAILS, default: the owner's address). Nothing in the request body is trusted for identity: the `callerEmail` field
//     the admin screen still sends is ignored.
//   * Every privileged change is written to adminAuditLog BEFORE it is made, with the verified actor, and the request fails
//     (nothing changes) if that record cannot be written: an unrecorded privileged change is worse than a failed click. The
//     record can say more than happened (the change then failed), never less. Every action here is safe to repeat.
//   * Input is validated before anything is written: user ids, booleans, field names, list sizes, and, for resource links
//     (which every student is shown), the address: https only.
//   * What an admin screen gets back about a student is an ALLOWLIST (ADMIN_USER_FIELDS), not "everything except two fields":
//     no push subscription, no payment identifiers, no exam dates, no friend list.
//   * Errors are generic and logs carry no document paths or personal data (lib/http.js).
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
'use strict'

const { officialSetMeta, canonicalBoardName, normaliseLevelName } = require('./lib/setMeta')
const { validateQuestionStructure } = require('./lib/structure')
const { route, parseJsonBody, respond: httpRespond } = require('./lib/http')
const { getAdmin, requireAdmin, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')
const { logAdminAction } = require('./lib/audit')

const MAX_BODY_BYTES = 1500000          // a content draft may be up to ~900,000 characters
const MAX_BULK_UIDS = 1000
const MAX_LINK_ROWS = 2000
const UID_RE = /^[A-Za-z0-9_-]{1,128}$/
const DOC_ID_RE = /^[A-Za-z0-9_-]{1,200}$/
const DRAFT_ID_RE = /^[A-Za-z0-9_-]{1,230}$/
const LINK_ID_RE = /^[A-Za-z0-9_-]{1,100}$/
const isUid = (v) => typeof v === 'string' && UID_RE.test(v)

// Admin-settable fields via setUserField/bulkSetField, as an ALLOWLIST rather than a denylist. An earlier version blocked a short
// list of sensitive names and allowed everything else, which meant any OTHER field on a user document (uid, email, createdAt, xp,
// anything) was writable by construction, not by decision. Every caller in the app was checked before narrowing it: 'betaUser'
// and 'isPro' are the only two fields anything sets through either action (Admin.jsx's Beta/Pro buttons). A future admin feature
// that needs another gets a clear, deliberate error here rather than silently working: extend this list explicitly when that is
// actually needed, rather than widening it speculatively.
const ADMIN_SETTABLE_FIELDS = ['betaUser', 'isPro']
const LIST_FILTER_FIELDS = ['betaUser', 'isPro']

// What the admin screens read from a student's document (Admin.jsx: name, address, plan flags, XP/streak/activity, sign-up date,
// who referred them). Anything else stays on the server.
const ADMIN_USER_FIELDS = ['displayName', 'email', 'createdAt', 'lastActivityDate', 'xp', 'streak', 'isPro', 'betaUser', 'referredBy']
function adminUserView(id, data) {
  const out = { id }
  for (const k of ADMIN_USER_FIELDS) if (data && data[k] !== undefined) out[k] = data[k]
  return out
}

// ── Resource links ────────────────────────────────────────────────────────────────────────────────────────────────────
// Shown to every student as a link, so the address must be a plain https address: a javascript: or data: address stored here
// would run in front of students on click.
function cleanText(v, max) {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s && s.length <= max ? s : null
}
function cleanLinkUrl(v) {
  if (typeof v !== 'string' || v.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(v)) return null
  let u
  try { u = new URL(v) } catch { return null }
  if (u.protocol !== 'https:' || u.username || u.password || !u.hostname.includes('.')) return null
  return v
}
// An array is kept as given (strings only); a string is split on the separator, trimmed and lower-cased, as before.
function cleanKeywords(v, separator) {
  const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(separator).map(k => k.trim().toLowerCase()) : null
  if (!list) return null
  const out = list.filter(k => typeof k === 'string' && k.trim() && k.length <= 80).slice(0, 40)
  return out.length ? out : null
}
function cleanLinkRow(input, keywordSeparator) {
  const subject = cleanText(input.subject, 100)
  const name = cleanText(input.name, 200)
  const url = cleanLinkUrl(input.url)
  const keywords = cleanKeywords(input.keywords, keywordSeparator)
  const site = input.site === undefined || input.site === null || input.site === '' ? name : cleanText(input.site, 100)
  if (!subject || !name || !keywords) return { error: 'subject, keywords and name are required (text of a sensible length)' }
  if (!url) return { error: 'url must be a plain https:// address' }
  if (!site) return { error: 'site must be short text' }
  return { value: { subject, keywords, name, url, site } }
}

// ── Audit log ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Every privileged action is recorded in adminAuditLog (lib/audit.js, read by admin-metrics.js): awaited, and called BEFORE the
// change, so there is a trail if something looks wrong or the admin account itself is ever compromised.

// ── Main handler ──────────────────────────────────────────────────────────────────────────────────────────────────────
module.exports.handler = route('admin', async (event) => {
  const respond = (status, body) => httpRespond(status, body, event)

  await enforceAppCheck(event)                       // monitor-only unless APP_CHECK_ENFORCE=true
  const actor = await requireAdmin(event)            // verified token + verified e-mail + on the admin list
  const admin = getAdmin()
  const db = admin.firestore()
  await enforceRateLimit(db, event, { route: 'admin', uid: actor.uid, limit: 3000, windowSec: 3600 })

  const body = parseJsonBody(event, { maxBytes: MAX_BODY_BYTES, allowEmpty: false })
  const { action, targetUid, targetUids, field, value } = body
  if (typeof action !== 'string' || !action) return respond(400, { error: 'action required' })

  // ── Set a single field on one user ────────────────────────────
  if (action === 'setUserField') {
    if (!isUid(targetUid)) return respond(400, { error: 'targetUid must be a valid user id' })
    if (!ADMIN_SETTABLE_FIELDS.includes(field)) return respond(400, { error: 'Field not allowed via setUserField' })
    if (typeof value !== 'boolean') return respond(400, { error: 'value must be true or false' })
    const ref = db.collection('users').doc(targetUid)
    if (!(await ref.get()).exists) return respond(404, { error: 'User not found' })
    await logAdminAction(db, actor, 'setUserField', { targetUid, field, value })
    await ref.update({ [field]: value })
    return respond(200, { ok: true })
  }

  // ── Bulk set field on multiple users ──────────────────────────
  // Only users that exist are changed (a batch containing a missing document would fail as a whole, leaving the earlier
  // chunks applied and the later ones not); the others are counted in `skipped`.
  if (action === 'bulkSetField') {
    if (!Array.isArray(targetUids) || targetUids.length === 0) return respond(400, { error: 'targetUids must be a non-empty list' })
    if (targetUids.length > MAX_BULK_UIDS) return respond(400, { error: `At most ${MAX_BULK_UIDS} users at a time` })
    if (!targetUids.every(isUid)) return respond(400, { error: 'Every targetUid must be a valid user id' })
    if (!ADMIN_SETTABLE_FIELDS.includes(field)) return respond(400, { error: 'Field not allowed via bulkSetField' })
    if (typeof value !== 'boolean') return respond(400, { error: 'value must be true or false' })
    const uids = [...new Set(targetUids)]
    const refs = uids.map(uid => db.collection('users').doc(uid))
    const existing = []
    for (let i = 0; i < refs.length; i += 300) {
      for (const snap of await db.getAll(...refs.slice(i, i + 300))) if (snap.exists) existing.push(snap.ref)
    }
    await logAdminAction(db, actor, 'bulkSetField', { targetUids: uids, count: existing.length, field, value })
    for (let i = 0; i < existing.length; i += 400) {
      const batch = db.batch()
      existing.slice(i, i + 400).forEach(ref => batch.update(ref, { [field]: value }))
      await batch.commit()
    }
    return respond(200, { ok: true, updated: existing.length, skipped: uids.length - existing.length })
  }

  // ── Find user by email ────────────────────────────────────────
  // Looked up through Firebase Auth (not a Firestore query): more reliable, and the e-mail need not be stored on the user
  // document. The audit record holds the account found, never the address that was typed.
  if (action === 'findByEmail') {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || email.length > 254 || !email.includes('@')) return respond(400, { error: 'email required' })
    let userRecord
    try {
      userRecord = await admin.auth().getUserByEmail(email)
    } catch (e) {
      if (e && e.code === 'auth/user-not-found') {
        await logAdminAction(db, actor, 'findByEmail', { found: false })
        return respond(200, { user: null })
      }
      throw e
    }
    const snap = await db.collection('users').doc(userRecord.uid).get()
    await logAdminAction(db, actor, 'findByEmail', { found: snap.exists, targetUid: userRecord.uid })
    if (!snap.exists) return respond(200, { user: null })
    return respond(200, { user: adminUserView(snap.id, snap.data()) })
  }

  // ── List users ────────────────────────────────────────────────
  if (action === 'listUsers') {
    const limitN = body.limitN === undefined ? 200 : body.limitN
    if (!Number.isInteger(limitN) || limitN < 1) return respond(400, { error: 'limitN must be a whole number of 1 or more' })
    const cap = Math.min(limitN, 500)
    let q
    if (body.filterField !== undefined) {
      if (!LIST_FILTER_FIELDS.includes(body.filterField) || typeof body.filterValue !== 'boolean') {
        return respond(400, { error: 'filterField must be one of ' + LIST_FILTER_FIELDS.join(', ') + ', with a true/false filterValue' })
      }
      q = db.collection('users').where(body.filterField, '==', body.filterValue).limit(cap)
    } else {
      q = db.collection('users').orderBy('createdAt', 'desc').limit(cap)
    }
    const snap = await q.get()
    return respond(200, { users: snap.docs.map(d => adminUserView(d.id, d.data())) })
  }

  // ── Add single resource link ──────────────────────────────────
  if (action === 'addResourceLink') {
    const row = cleanLinkRow(body, ',')
    if (row.error) return respond(400, { error: row.error })
    await logAdminAction(db, actor, 'addResourceLink', { subject: row.value.subject, name: row.value.name, url: row.value.url })
    const ref = await db.collection('topicResourceLinks').add({ ...row.value, createdAt: new Date().toISOString() })
    return respond(200, { ok: true, id: ref.id })
  }

  // ── Bulk add resource links ───────────────────────────────────
  // Rows that are incomplete or have an unusable address are skipped and counted, as before.
  if (action === 'bulkAddResourceLinks') {
    const { rows } = body
    if (!Array.isArray(rows) || rows.length === 0) return respond(400, { error: 'rows array required' })
    if (rows.length > MAX_LINK_ROWS) return respond(400, { error: `At most ${MAX_LINK_ROWS} rows at a time` })
    const valid = []
    let skipped = 0
    for (const raw of rows) {
      const row = raw && typeof raw === 'object' && !Array.isArray(raw) ? cleanLinkRow(raw, '|') : { error: 'not a row' }
      if (row.error) skipped++
      else valid.push(row.value)
    }
    await logAdminAction(db, actor, 'bulkAddResourceLinks', { added: valid.length, skipped })
    for (let i = 0; i < valid.length; i += 400) {
      const batch = db.batch()
      valid.slice(i, i + 400).forEach(v => batch.set(db.collection('topicResourceLinks').doc(), { ...v, createdAt: new Date().toISOString() }))
      await batch.commit()
    }
    return respond(200, { ok: true, added: valid.length, skipped })
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
    if (typeof linkId !== 'string' || !LINK_ID_RE.test(linkId)) return respond(400, { error: 'linkId required' })
    await logAdminAction(db, actor, 'deleteResourceLink', { linkId })
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
    const onlyUid = body.targetUid === undefined || body.targetUid === null || body.targetUid === '' ? null : body.targetUid
    if (onlyUid !== null && !isUid(onlyUid)) return respond(400, { error: 'targetUid must be a valid user id' })

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

    await logAdminAction(db, actor, 'archiveSupersededQualificationData', { targetUid: onlyUid || 'all users', totalArchived: toArchive.length })
    const batchSize = 400
    for (let i = 0; i < toArchive.length; i += batchSize) {
      const batch = db.batch()
      toArchive.slice(i, i + batchSize).forEach(ref => batch.update(ref, { archived: true }))
      await batch.commit()
    }
    for (const fix of examDateFixes) {
      await db.collection('users').doc(fix.userId).update({ examDates: fix.keptExamDates })
    }

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
      await logAdminAction(db, actor, 'migrateOfficialSets', summary)
      await commitInChunks(updates)
      return respond(200, { ok: true, summary })
    }

    const filter = body.filter && typeof body.filter === 'object' && !Array.isArray(body.filter) ? body.filter : {}
    const confirm = body.confirm
    const wantBoard   = filter.board   ? canonicalBoardName(String(filter.board))   : ''
    const wantLevel   = filter.level   ? normaliseLevelName(String(filter.level))   : ''
    const wantSubject = filter.subject ? String(filter.subject).trim()              : ''
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
        verified: true, verifiedAt: now, verifiedBy: actor.email, version: (Number(data.version) || 0) + 1,
        provenance: { status: 'verified', approvedBy: actor.email, approvedAt: now, via: 'admin review of an existing set' },
      }
      if (meta.board && data.board !== meta.board) patch.board = meta.board
      if (meta.level && data.level !== meta.level) patch.level = meta.level
      return { ref: doc.ref, patch }
    })
    await logAdminAction(db, actor, 'verifyOfficialSets', { verified: updates.length, filter: { board: wantBoard, level: wantLevel, subject: wantSubject } })
    await commitInChunks(updates)
    return respond(200, { ok: true, verified: updates.length, alreadyVerified })
  }

  // ── Content pipeline: draft → review → approval ───────────────
  // Every privileged content write (admin overrides, official flashcards, verified
  // topic notes) goes through here. Nothing reaches a live collection until an admin
  // has explicitly moved the draft to review and then approved it.
  if (action === 'contentDraft' || action === 'contentSubmit' || action === 'contentApprove' ||
      action === 'contentReject' || action === 'contentListDrafts') {
    // A null-prototype object, so that `__proto__`, `constructor`, `toString` and the like are not keys. (A plain object literal
    // answers "truthy" for all of them, which made `kind: "__proto__"` pass the old check.)
    const CONTENT_KINDS = Object.freeze(Object.assign(Object.create(null), {
      topicOverride:     'topicOverrides',
      examDateOverride:  'examDateOverrides',
      paperSpecOverride: 'paperSpecOverrides',
      boundaryOverride:  'boundaryOverrides',
      officialFlashcard: 'publicFlashcards',
      topicNote:         'topicNotes',
    }))
    const isKind = (v) => typeof v === 'string' && v in CONTENT_KINDS
    const isDocId = (v) => typeof v === 'string' && DOC_ID_RE.test(v)
    const isDraftId = (v) => typeof v === 'string' && DRAFT_ID_RE.test(v)       // "<kind>__<content id>"
    const drafts = db.collection('adminDrafts')

    if (action === 'contentListDrafts') {
      const status = typeof body.status === 'string' ? body.status : ''
      let q = drafts.orderBy('createdAt', 'desc').limit(100)
      const snap = await q.get()
      // `id` must stay the DRAFT document's id (what approve / reject look up). The draft's own data also has an
      // `id` field (the id of the content being changed), which used to overwrite it; that one is `contentId`.
      const rows = snap.docs.map(d => ({ ...d.data(), contentId: d.data().id, id: d.id, draftId: d.id })).filter(r => !status || r.status === status)
      return respond(200, { drafts: rows })
    }

    if (action === 'contentDraft') {
      const { kind, id, op = 'set', data } = body
      if (!isKind(kind)) return respond(400, { error: 'Unknown content kind' })
      if (!isDocId(id)) return respond(400, { error: 'Invalid content id' })
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
      await logAdminAction(db, actor, 'contentDraft', { draftId, op })
      await drafts.doc(draftId).set({
        kind, id, op, data: clean, status: 'draft',
        createdAt: new Date().toISOString(), createdBy: actor.email,
        reviewedAt: null, rejectedReason: null,
      })
      return respond(200, { ok: true, draftId, status: 'draft' })
    }

    const { draftId } = body
    if (!isDraftId(draftId)) return respond(400, { error: 'Invalid draftId' })
    const ref = drafts.doc(draftId)
    const snap = await ref.get()
    if (!snap.exists) return respond(404, { error: 'Draft not found' })
    const draft = snap.data()
    // Drafts are only ever written by this function, but whatever is stored is re-checked before it is used to pick a collection.
    if (!isKind(draft.kind) || !isDocId(draft.id)) return respond(409, { error: 'This draft is not valid' })

    if (action === 'contentSubmit') {
      if (draft.status !== 'draft') return respond(409, { error: 'Only drafts can be submitted for review' })
      await logAdminAction(db, actor, 'contentSubmit', { draftId })
      await ref.update({ status: 'in_review', submittedAt: new Date().toISOString() })
      return respond(200, { ok: true, status: 'in_review' })
    }

    if (action === 'contentReject') {
      if (draft.status === 'approved') return respond(409, { error: 'Already approved' })
      await logAdminAction(db, actor, 'contentReject', { draftId })
      await ref.update({ status: 'rejected', rejectedReason: String(body.reason || '').slice(0, 500), reviewedAt: new Date().toISOString() })
      return respond(200, { ok: true, status: 'rejected' })
    }

    // contentApprove — idempotent: re-approving an approved draft is a no-op.
    if (draft.status === 'approved') return respond(200, { ok: true, status: 'approved', alreadyApproved: true })
    if (draft.status !== 'in_review') return respond(409, { error: 'Draft must be in review before approval' })
    await logAdminAction(db, actor, 'contentApprove', { draftId, kind: draft.kind, op: draft.op })
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
        provenance: { status: 'verified', approvedBy: actor.email, approvedAt: new Date().toISOString(), draftId },
        verified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true })
    }
    await ref.update({ status: 'approved', reviewedAt: new Date().toISOString() })
    return respond(200, { ok: true, status: 'approved' })
  }

  return respond(400, { error: 'Unknown action' })
})
