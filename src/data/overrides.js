// src/data/overrides.js
// Admin-editable overlay on top of the static topics.js / examDates2026.js / paperDatabase.js
// data files. Rather than migrating ~3,700 topics' worth of static content into Firestore in
// one risky pass, admin adds/edits/removals live in their own small Firestore collections and
// get MERGED with the static data at read time. Static data is always the base layer; an
// override can add a new entry, replace an existing one, or hide one the admin has marked wrong.
//
// Used by the admin data editor (src/components/AdminDataEditor.jsx) for writes, and by
// Topics.jsx / ExamDates.jsx / PastPapers.jsx for reads, at the specific points students
// actually see this data.

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { getAllTopicsFlat as getStaticTopics } from './topics'
import { getExamDates as getStaticExamDates, getAllSubjectsForBoard as getStaticSubjectsForBoard } from './examDates2026'
import { getPaperSpec as getStaticPaperSpec, getBoundaries as getStaticBoundaries } from './paperDatabase'

function sanitize(str) {
  return String(str || '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ── Topics ───────────────────────────────────────────────────────────────────
function topicOverrideId(board, level, subject) {
  return sanitize(`${board}_${level}_${subject}`).slice(0, 150)
}

export async function getTopicOverride(board, level, subject) {
  const snap = await getDoc(doc(db, 'topicOverrides', topicOverrideId(board, level, subject)))
  return snap.exists() ? snap.data() : null
}

export async function saveTopicOverride(board, level, subject, { added, removedNames, renamed }) {
  const id = topicOverrideId(board, level, subject)
  await setDoc(doc(db, 'topicOverrides', id), {
    board, level, subject,
    added: added || [],
    removedNames: removedNames || [],
    renamed: renamed || {},
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Merged topic list: static data with admin additions/removals/renames applied. Falls back to
// static-only if the override fetch fails for any reason (network, missing rule, etc.) — admin
// data problems should never be able to take the whole topics list down for a student.
export async function getMergedTopicsFlat(board, subject, level) {
  const staticTopics = getStaticTopics(board, subject, level) || []
  let override = null
  try { override = await getTopicOverride(board, level, subject) } catch (e) { override = null }
  if (!override) return staticTopics

  const removed = new Set(override.removedNames || [])
  const renamed = override.renamed || {}
  const kept = staticTopics
    .filter(t => !removed.has(t.name))
    .map(t => renamed[t.name] ? { ...t, name: renamed[t.name] } : t)
  const added = (override.added || []).map(a => ({ name: a.name, paper: a.paper || 'Admin-added' }))
  return [...kept, ...added]
}

// ── Exam dates ───────────────────────────────────────────────────────────────
// Each override doc is one exam-date entry. `replacesKey` links it to a specific static entry
// (board|level|subject|paper) to override; entries with no replacesKey are net-new additions
// (e.g. 2027 dates, or a board/level combo the static file doesn't cover at all).
function examDateKey(board, level, subject, paper) {
  return sanitize(`${board}_${level}_${subject}_${paper}`)
}

export async function listExamDateOverrides(level) {
  const snap = await getDocs(collection(db, 'examDateOverrides'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(o => !level || o.level === level)
}

export async function saveExamDateOverride(entry) {
  const id = entry.id || examDateKey(entry.board, entry.level, entry.subject, entry.paper)
  await setDoc(doc(db, 'examDateOverrides', id), {
    board: entry.board, level: entry.level, subject: entry.subject,
    tier: entry.tier || 'N/A', paper: entry.paper, paperName: entry.paperName || '',
    date: entry.date, removed: !!entry.removed,
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return id
}

export async function deleteExamDateOverride(id) {
  await deleteDoc(doc(db, 'examDateOverrides', id))
}

// Merged exam dates for one subject/board — static entries, with any matching override applied
// (replaced or removed), plus any net-new override entries for this subject/board/level.
export async function getMergedExamDates(subject, board, tier, level) {
  const staticDates = getStaticExamDates(subject, board, tier, level) || []
  let overrides = []
  try { overrides = await listExamDateOverrides(level) } catch (e) { overrides = [] }
  const relevant = overrides.filter(o => o.board === board && o.subject === subject)
  const overrideByPaper = new Map(relevant.map(o => [String(o.paper), o]))

  const merged = []
  for (const d of staticDates) {
    const ov = overrideByPaper.get(String(d.paper))
    if (ov) { if (!ov.removed) merged.push(ov); overrideByPaper.delete(String(d.paper)); continue }
    merged.push(d)
  }
  // Remaining overrides are net-new (no matching static paper number)
  for (const ov of overrideByPaper.values()) if (!ov.removed) merged.push(ov)
  return merged
}

// ── Paper database (specs + grade boundaries) ───────────────────────────────
function paperOverrideId(board, level, subject, paper) {
  return sanitize(`${board}_${level}_${subject}_P${paper}`)
}
function boundaryOverrideId(board, level, subject) {
  return sanitize(`${board}_${level}_${subject}`)
}

export async function getPaperSpecOverride(board, level, subject, paper) {
  const snap = await getDoc(doc(db, 'paperSpecOverrides', paperOverrideId(board, level, subject, paper)))
  return snap.exists() ? snap.data() : null
}

export async function savePaperSpecOverride(board, level, subject, paper, { maxMarks, duration }) {
  const id = paperOverrideId(board, level, subject, paper)
  await setDoc(doc(db, 'paperSpecOverrides', id), {
    board, level, subject, paper, maxMarks, duration, updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getMergedPaperSpec(board, subject, tier, paper, level) {
  let override = null
  try { override = await getPaperSpecOverride(board, level, subject, paper) } catch (e) { override = null }
  if (override) return { maxMarks: override.maxMarks, duration: override.duration, level }
  return getStaticPaperSpec(board, subject, tier, paper, level)
}

export async function getBoundaryOverride(board, level, subject) {
  const snap = await getDoc(doc(db, 'boundaryOverrides', boundaryOverrideId(board, level, subject)))
  return snap.exists() ? snap.data() : null
}

export async function saveBoundaryOverride(board, level, subject, { maxMarks, boundaries, grades }) {
  const id = boundaryOverrideId(board, level, subject)
  await setDoc(doc(db, 'boundaryOverrides', id), {
    board, level, subject, maxMarks, boundaries, grades: grades || null, updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getMergedBoundaries(board, subject, tier, year, level) {
  let override = null
  try { override = await getBoundaryOverride(board, level, subject) } catch (e) { override = null }
  if (override) return { maxMarks: override.maxMarks, boundaries: override.boundaries, grades: override.grades, level, note: 'admin-edited' }
  return getStaticBoundaries(board, subject, tier, year, level)
}
