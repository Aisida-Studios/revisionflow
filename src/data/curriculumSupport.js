// src/data/curriculumSupport.js
// ─────────────────────────────────────────────────────────────────────────────
// Which subjects can actually be studied on RevisionFlow for a given board +
// qualification. The verified topic dataset (data/topics.js) is the source of
// truth: a subject is only offered if the app really has curriculum content for
// that exact board + qualification. The master subject lists in subjects.js are
// qualification-wide unions (e.g. every GCSE subject any board offers) and must
// not be shown on their own in a picker — most subject+board pairs in that union
// have no content behind them.
//
// Order follows the master list in subjects.js so pickers stay in a familiar,
// stable order. (The reverse gap — a subject with topic data that is missing
// from the master list — was checked when this was written and does not occur;
// if one is ever added to topics.js it must be added to subjects.js too or it
// will not appear here.)
//
// Lives in its own module (not subjects.js) so subjects.js stays a light
// constants file that does not depend on the large topic dataset.
// ─────────────────────────────────────────────────────────────────────────────

import { getSubjectList, SUPPORTED_QUALIFICATIONS } from './subjects'
import { getSubjectsForBoard } from './topics'
import { canonicalBoard } from './boards'

/**
 * Subject names with real curriculum data for this board + qualification.
 * Returns [] for an unsupported board or qualification (e.g. legacy Cambridge,
 * BTEC) — never another board's or qualification's subjects.
 */
export function getSupportedSubjects(board, qualification) {
  if (!SUPPORTED_QUALIFICATIONS.includes(qualification)) return []
  const supported = new Set(getSubjectsForBoard(canonicalBoard(board), qualification))
  return getSubjectList(qualification).filter(name => supported.has(name))
}

export function isSupportedCombination(board, qualification, subject) {
  return getSupportedSubjects(board, qualification).includes(subject)
}
