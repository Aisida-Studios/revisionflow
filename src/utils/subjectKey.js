// src/utils/subjectKey.js
// ─────────────────────────────────────────────────────────────────────────────
// Canonical "subject instance" key: one stable identifier for a single
// board + qualification + subject + tier combination — e.g. AQA GCSE Physics
// Higher is a different subject instance from OCR GCSE Physics Higher, and
// from AQA AS-Level Physics. Plain subject NAME ("Physics") is not enough on
// its own anywhere in this app; this is the thing every record that belongs
// to one specific subject should carry so it can never be silently blended
// with another board/qualification/tier's data for the same subject name.
//
// Deliberately reuses utils/topicId.js's qualification tokens rather than
// re-deriving GCSE/AS-Level/A-Level/BTEC handling a second, slightly
// different way — topic IDs are already board+qualification-scoped; this is
// the same idea one level up, without a topic name in it.
//
// WJEC/Eduqas note: this file resolves both aliases to one shared board token
// (EDUQAS_WJEC) purely so a record's subjectKey is stable no matter which of
// the two names it was originally stored under. This does NOT change how
// data/topics.js or data/examDates2026.js look up their own board-keyed data
// — those already have their own working (if inconsistent with each other)
// WJEC/Eduqas alias tables, and rewriting either is a separate, larger job
// that needs its own careful verification, not bundled into this file.
// 'Cambridge' is intentionally left as its own distinct token — never merged
// into OCR or any other board — so legacy Cambridge records stay identifiable
// as their own (unsupported) thing rather than being silently corrupted into
// a supported board's data.
//
// A client-generated subject `id` (profile.subjects[i].id, if one is ever
// added) must NEVER be used here: it isn't guaranteed stable across edits or
// a subject being removed and re-added. board+qualification+subject+tier is
// the only part of a subject that's actually meaningful and worth keying on.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeQualificationToken } from './topicId'

// Local-only alias resolution for key-building — see file header note above.
const KEY_BOARD_ALIASES = {
  'WJEC': 'EDUQAS_WJEC', 'wjec': 'EDUQAS_WJEC',
  'Eduqas': 'EDUQAS_WJEC', 'eduqas': 'EDUQAS_WJEC',
  'Eduqas/WJEC': 'EDUQAS_WJEC', 'Eduqas / WJEC': 'EDUQAS_WJEC',
}

function sanitize(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_]/g, '_')
}

function boardToken(board) {
  const raw = String(board || 'AQA').trim()
  return sanitize(KEY_BOARD_ALIASES[raw] || raw)
}

/**
 * Builds the canonical subject-instance key. Accepts either a profile.subjects[i]
 * entry ({ name, board, qualification, tier }) or a Firestore record that already
 * carries the same information under the names those records commonly use
 * (subjectId instead of name is typical for topics/mistakes/paper attempts).
 *
 * Tier uses the same 'N/A' sentinel already established on profile.subjects[i].tier
 * (see data/subjects.js's getGradeOptions and every scheduler.js call site) rather
 * than null/undefined, so a subject with no tier still produces a stable key.
 */
export function buildSubjectKey({ board, qualification, subject, subjectId, name, tier } = {}) {
  const subjectName = subject || subjectId || name
  if (!subjectName) return null
  const qualTok = normalizeQualificationToken(qualification)
  const tierTok = tier && tier !== 'N/A' ? sanitize(tier) : 'NA'
  return `${boardToken(board)}|${qualTok}|${sanitize(subjectName)}|${tierTok}`
}

/**
 * The set of subject-instance keys for everything currently in profile.subjects —
 * what "is this record current?" checks compare against. qualification/tier fall
 * back the same way getSubjectQualification (data/subjects.js) already does.
 */
export function currentSubjectKeys(profile) {
  return new Set(
    (profile?.subjects || [])
      .map(s => buildSubjectKey({
        board: s.board,
        qualification: s.qualification || profile?.qualification,
        subject: s.name,
        tier: s.tier,
      }))
      .filter(Boolean)
  )
}

/**
 * Whether a record belongs to one of the student's CURRENT subject instances.
 * - A record that already carries subjectKey is compared directly (cheapest,
 *   and the only reliable path once records are actually written with one).
 * - A record with enough fields to derive a key (board/subject + qualification)
 *   has one derived and compared — this is the bridge for existing records
 *   written before subjectKey existed.
 * - A record with neither is never guessed into matching. It's legacy/
 *   unclassified, not current — callers that need to preserve it for history
 *   should do so in a separate legacy view, not current-subject analytics.
 */
export function isCurrentSubjectInstance(record, profile) {
  if (!record) return false
  const keys = currentSubjectKeys(profile)
  if (record.subjectKey) return keys.has(record.subjectKey)
  const subjectName = record.subject || record.subjectId || record.name
  if (subjectName && record.qualification) {
    return keys.has(buildSubjectKey({ ...record, subject: subjectName }))
  }
  return false
}

/**
 * Filters a list of records down to only the student's current subject
 * instances, using isCurrentSubjectInstance's same rules. Intended as the
 * eventual single replacement for the qualification-only
 * filterToCurrentQualification() — not yet wired in anywhere, since swapping
 * every call site over needs each one checked against what fields its
 * records actually carry first (many pre-date subjectKey and only have
 * board+qualification, some have neither and would silently drop out here
 * rather than the softer legacy handling filterToCurrentQualification
 * currently gives them).
 */
export function filterToCurrentSubjectInstance(records, profile) {
  return (records || []).filter(r => isCurrentSubjectInstance(r, profile))
}
