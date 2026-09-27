// src/utils/subjectKey.js
// ─────────────────────────────────────────────────────────────────────────────
// Canonical "subject instance" key.
//
// A subject instance is board + qualification + subject + tier. The same subject NAME can
// legitimately mean several different, unrelated things for one student (a different
// specification, a different set of past papers, a different grade scale) — nothing in this
// app should treat them as the same bucket of data just because the name string matches.
//
// Format: `${board}|${qualification}|${subject}|${tier}`
//   'AQA|GCSE|Physics|Higher'   is a different instance from
//   'OCR|GCSE|Physics|Higher'   and from
//   'AQA|AS-Level|Physics|N/A'  and from
//   'AQA|A-Level|Physics|N/A'
//
// Deliberately NOT the client-generated `profile.subjects[i].id` — that's an arbitrary id
// assigned when the subject was added to this one student's profile, not a description of
// what the subject actually IS, so it's neither stable nor comparable across records or
// students.
//
// Tier only genuinely exists for some GCSE subjects (Foundation/Higher — see isTiered() in
// data/subjects.js); AS-Level and A-Level are never tiered. Callers that don't have tier data
// at all (e.g. flashcard sets — see deriveSetBoardLevel below, which never captures tier)
// should build/compare keys with { includeTier: false } rather than let a genuinely-missing
// tier field default to "N/A" and mismatch against a real tier value on the other side of
// the comparison.
//
// This module does NOT canonicalise board-name aliases (e.g. 'WJEC' vs 'Eduqas', or the
// currently-offered-but-unsupported 'Cambridge' board) — it keys on whatever board string a
// record already carries. Unifying board aliases app-wide is separate, larger work; once
// that lands, feed its canonical board value in here rather than a raw stored string.
//
// STATUS: this module is currently wired into spacedRepetition.js's
// subjectsNotPracticedThisWeek() only. Rolling it out to topics, paper attempts, quiz
// results, sessions, mistakes, notes, exam dates, calendar items, recommendations,
// analytics, predicted grades, AI context, scheduler state, paper structures and question
// attempts is tracked separately and not yet done — see the delivery notes.
// ─────────────────────────────────────────────────────────────────────────────

import { getSubjectQualification } from '../data/subjects'

export const NO_TIER = 'N/A'

function clean(value) {
  return value === undefined || value === null ? '' : String(value).trim()
}

function normalizeTier(tier) {
  const t = clean(tier)
  return t || NO_TIER
}

/**
 * Builds the canonical subject-instance key from explicit parts. Returns null if board,
 * qualification or subject is missing — there's no honest key to build from partial data,
 * and silently returning e.g. '|GCSE|Physics|N/A' would risk matching records that don't
 * actually share a board.
 */
export function buildSubjectKey({ board, qualification, subject, tier } = {}, { includeTier = true } = {}) {
  const b = clean(board)
  const q = clean(qualification)
  const s = clean(subject)
  if (!b || !q || !s) return null
  return includeTier ? `${b}|${q}|${s}|${normalizeTier(tier)}` : `${b}|${q}|${s}`
}

/**
 * The subject-instance key for one of the student's own profile.subjects entries. Goes
 * through getSubjectQualification() for the qualification (never reads subject.qualification
 * or profile.qualification directly), so this can never disagree with the rest of the app
 * about what qualification a given profile subject is at.
 */
export function subjectKeyForProfileSubject(subjectEntry, profile, options) {
  if (!subjectEntry) return null
  return buildSubjectKey({
    board: subjectEntry.board,
    qualification: getSubjectQualification(subjectEntry, profile),
    subject: subjectEntry.name,
    tier: subjectEntry.tier,
  }, options)
}

/**
 * The set of subject-instance keys for every subject the student is CURRENTLY doing — the
 * canonical "current subject instances" that other current-data filters should compare
 * records against, rather than each re-deriving its own notion of "current".
 */
export function getCurrentSubjectKeys(profile, options) {
  const keys = new Set()
  for (const s of profile?.subjects || []) {
    const key = subjectKeyForProfileSubject(s, profile, options)
    if (key) keys.add(key)
  }
  return keys
}

/**
 * Best-effort subject-instance key for an arbitrary record (a session, mistake, paper
 * attempt, flashcard set, etc.) — uses an explicit record.subjectKey if present, otherwise
 * derives one from record.board/qualification/subject/tier. Returns null when neither is
 * available: callers must treat a null key as "unclassified", never as "belongs to some
 * other qualification" — there's no honest basis to guess either way. A record whose
 * qualification is stored under a different field name (e.g. flashcard sets' `level`) needs
 * that mapped to `qualification` before calling this — see deriveSetBoardLevel below for
 * that specific case.
 */
export function deriveRecordSubjectKey(record, options) {
  if (!record) return null
  if (record.subjectKey) return clean(record.subjectKey) || null
  if (record.board && record.qualification && record.subject) {
    return buildSubjectKey({
      board: record.board,
      qualification: record.qualification,
      subject: record.subject,
      tier: record.tier,
    }, options)
  }
  return null
}

/**
 * Whether `record` belongs to one of the student's CURRENT subject instances. Pass a
 * precomputed `currentKeys` (from getCurrentSubjectKeys) when checking many records in a
 * loop, so the profile isn't re-walked on every call.
 */
export function isCurrentSubjectInstance(record, profile, currentKeys, options) {
  const keys = currentKeys || getCurrentSubjectKeys(profile, options)
  const key = deriveRecordSubjectKey(record, options)
  return !!key && keys.has(key)
}

// ── Flashcard-set board/qualification derivation ────────────────────────────────────────
// Relocated verbatim from Study.jsx (previously a local, unexported function) so
// spacedRepetition.js's subjectsNotPracticedThisWeek() can use the exact same derivation,
// rather than a second, possibly-drifting copy of this logic, to decide whether a set
// belongs to a current subject instance. Behaviour is unchanged from the original; only the
// location moved — Study.jsx now imports this instead of defining it locally.
//
// Flashcard sets only carry board+level when they're official/admin-generated
// (saveOfficialFlashcardSet stamps both) — a regular user's own saveFlashcardSet call never
// captures them (see firestore.js), so for "my sets" the only honest source is the
// board/qualification already on that subject's entry in the student's own profile.
//
// profile is only meaningful when deriving for the CURRENT user's own sets — for someone
// else's public set with no stamped board/level, there's no honest source to derive from, so
// this deliberately falls through to {board: null, level: null} (shown as "any level") rather
// than guessing based on whoever happens to be viewing it. Callers showing another user's
// public set must pass null for profile, never the viewer's own.
export function deriveSetBoardLevel(set, profile) {
  if (set.board && set.level) return { board: set.board, level: set.level }
  if (!profile) return { board: null, level: null }
  const subjMeta = profile?.subjects?.find(s => s.name === set.subject)
  return { board: subjMeta?.board || null, level: subjMeta ? getSubjectQualification(subjMeta, profile) : null }
}
