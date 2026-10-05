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
// Boards: canonicalBoard() from data/boards.js is the app's single board alias table, so every
// Eduqas/WJEC spelling produces the same key ('WJEC'). An unsupported board such as legacy
// 'Cambridge' is kept as its own distinct token — never merged into OCR or any other board — so
// legacy Cambridge records stay identifiable as their own (unsupported) thing rather than being
// silently corrupted into a supported board's data.
//
// A client-generated subject `id` (profile.subjects[i].id, if one is ever
// added) must NEVER be used here: it isn't guaranteed stable across edits or
// a subject being removed and re-added. board+qualification+subject+tier is
// the only part of a subject that's actually meaningful and worth keying on.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeQualificationToken } from './topicId'
import { canonicalBoard, DEFAULT_BOARD } from '../data/boards'

function sanitize(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_]/g, '_')
}

function boardToken(board) {
  // Only a MISSING board takes the default (profiles that predate board capture); a named board
  // is never swapped for another.
  return sanitize(canonicalBoard(board) || DEFAULT_BOARD)
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
  if (record.archived) return false // explicitly resolved as "keep, hidden" — never current
  // A record carrying its own real subjectKey was stamped with a genuine tier (even 'N/A' for a
  // non-tiered subject), so a precise, tier-aware comparison against every current instance's
  // key is reliable here.
  if (record.subjectKey) return currentSubjectKeys(profile).has(record.subjectKey)

  const subjectName = record.subject || record.subjectId || record.name
  if (!subjectName || !record.qualification) return false
  const subjMeta = (profile?.subjects || []).find(s => s.name === subjectName)
  if (!subjMeta) return false
  const currentQualification = subjMeta.qualification || profile?.qualification
  if (record.qualification !== currentQualification) return false
  if (canonicalBoard(record.board) !== (canonicalBoard(subjMeta.board) || DEFAULT_BOARD)) return false
  // Tier is only enforced when BOTH sides actually have a real (non-'N/A') tier. A record with
  // no tier field at all — true for every topic, note and mistake written before tier was ever
  // captured per-record, tiered subject or not — means "tier unknown", not "no tier"; treating
  // that as a mismatch against a genuinely tiered current subject would make every one of those
  // pre-existing records vanish from current views, which is a worse error than the (narrower)
  // one this is fixing.
  if (record.tier && record.tier !== 'N/A' && subjMeta.tier && subjMeta.tier !== 'N/A' && record.tier !== subjMeta.tier) {
    return false
  }
  return true
}

/**
 * Filters a list of records down to only the student's current subject
 * instances, using isCurrentSubjectInstance's same rules — compares subjectKey
 * directly where present, derives one from board+qualification+tier where
 * those exist but subjectKey doesn't yet, and excludes (rather than guesses
 * about) a record with neither. The single replacement for the old
 * qualification-only, grade-format/nearest-neighbour-guessing
 * filterToCurrentQualification() that used to live in utils/firestore.js —
 * wired into every surface that used it (Dashboard, Past Papers, Analytics,
 * AI Advisor, Emergency Mode, AI context, PDF reports) plus
 * getTopicsWithConfidence, which had its own separate qualification-only
 * check with the same board-blindness problem.
 */
/**
 * Looks up a student's own subject by name in their current profile.subjects and returns
 * its full identity — board, qualification, tier and the canonical subjectKey. This is the
 * common case at a write site that only has a plain subject NAME (the student picked it
 * from a dropdown of their own subjects, e.g. a session/mistake/quiz form) and needs to tag
 * a new record with all of it at once. Returns null if the name isn't found (e.g. a subject
 * that's since been removed from the profile) rather than guessing any part of it.
 */
export function subjectIdentityForName(subjectName, profile) {
  const subj = (profile?.subjects || []).find(s => s.name === subjectName)
  if (!subj) return null
  const qualification = subj.qualification || profile?.qualification
  const tier = subj.tier || 'N/A'
  const board = canonicalBoard(subj.board) || DEFAULT_BOARD
  return { board, qualification, tier, subjectKey: buildSubjectKey({ board, qualification, subject: subj.name, tier }) }
}

export function filterToCurrentSubjectInstance(records, profile) {
  return (records || []).filter(r => isCurrentSubjectInstance(r, profile))
}
