// src/utils/studyProgress.js
// Saves what a student has learned in a study session into their own flashcard set.
// The merge itself is pure (progressMerge.js); this file only reads and writes the set document.
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { mergeOutcomes } from './progressMerge'

/** Merge { [question]: 1|2|3 } into the set's mastery and schedule. Returns the merged { mastery, schedule }. */
export async function persistSetOutcomes(uid, setId, outcomes) {
  const ref = doc(db, 'users', uid, 'flashcardSets', setId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('That set is not saved yet.')
  const data = snap.data()
  const merged = mergeOutcomes(data.cardMastery, data.cardSchedule, outcomes)
  await updateDoc(ref, { cardMastery: merged.mastery, cardSchedule: merged.schedule, lastStudiedAt: serverTimestamp() })
  return merged
}
