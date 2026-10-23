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
