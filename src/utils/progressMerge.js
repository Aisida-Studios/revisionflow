// src/utils/progressMerge.js
// Pure: fold per-card outcomes into a flashcard set's mastery and spaced-repetition schedule.
// Outcome per card: 1 = missed, 2 = partly, 3 = got it (the same scale as the flash-card ratings).
// Kept separate from the Firestore writer (studyProgress.js) so it can be unit-tested without Firebase.
import { nextSchedule } from './spacedRepetition'

export function mergeOutcomes(mastery = {}, schedule = {}, outcomes = {}) {
  const m = { ...mastery }
  const s = { ...schedule }
  for (const [question, outcome] of Object.entries(outcomes || {})) {
    if (outcome !== 1 && outcome !== 2 && outcome !== 3) continue
    m[question] = outcome
    s[question] = nextSchedule(s[question], outcome)
  }
  return { mastery: m, schedule: s }
}

export const hasOutcomes = (outcomes) => !!outcomes && Object.keys(outcomes).length > 0

/**
 * Where a session's progress is written, and what is written there. `ownData` is the student's own set document, or
 * null when they have none for this id (an official, premade or community set opened from the public list: not theirs
 * to write to); `progressData` is their stored progress record for such a set, or null. Nothing is changed in place.
 * Returns { target: 'set' | 'progress', mastery, schedule }.
 */
export function planProgressSave(ownData, progressData, outcomes) {
  const base = ownData || progressData || {}
  const merged = mergeOutcomes(base.cardMastery, base.cardSchedule, outcomes)
  return { target: ownData ? 'set' : 'progress', mastery: merged.mastery, schedule: merged.schedule }
}

/** What a session starts from: the student's own set if they have one, else their progress record, else nothing. */
export function savedProgressFrom(ownData, progressData) {
  const base = ownData || progressData || {}
  return { cardMastery: base.cardMastery || {}, cardSchedule: base.cardSchedule || {} }
}

/**
 * An AI marker's "AWARDED MARKS: x/y" line read onto the 1 to 3 outcome scale, with the same tiers as the Answer Marker's
 * result card: 70% or more is 3, 50% or more is 2, less is 1. null when the line is missing or the total is 0.
 */
export function outcomeFromMarkerText(text) {
  const found = String(text || '').match(/AWARDED MARKS[:\s]+(\d+)\s*\/\s*(\d+)/i)
  if (!found || !Number(found[2])) return null
  const share = Number(found[1]) / Number(found[2])
  return share >= 0.7 ? 3 : share >= 0.5 ? 2 : 1
}
