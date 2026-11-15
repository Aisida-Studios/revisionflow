// src/utils/studyProgress.js
// Saves what a student has learned in a study session. The decisions (which document, what to merge) are pure and live in
// progressMerge.js; this file only reads and writes the documents.
//
// A set the student owns keeps its mastery and spaced-repetition schedule on the set itself
// (users/{uid}/flashcardSets/{setId}). An official, premade or community set opened from the public list is not theirs to
// write to, so their progress on it is stored in users/{uid}/setProgress/{setId} (owner-only in the Firestore rules).
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { planProgressSave, savedProgressFrom } from './progressMerge'

const setRef = (uid, setId) => doc(db, 'users', uid, 'flashcardSets', setId)
const progressRef = (uid, setId) => doc(db, 'users', uid, 'setProgress', setId)

// The student's own set if there is one; only when there is not, their progress record for it.
async function readSources(uid, setId) {
  const own = await getDoc(setRef(uid, setId))
  if (own.exists()) return { ownData: own.data(), progressData: null }
  const prog = await getDoc(progressRef(uid, setId))
  return { ownData: null, progressData: prog.exists() ? prog.data() : null }
}

/** The saved { cardMastery, cardSchedule } for a set: both empty when nothing has been saved yet. */
export async function loadSetProgress(uid, setId) {
  const { ownData, progressData } = await readSources(uid, setId)
  return savedProgressFrom(ownData, progressData)
}

/** Merge { [question]: 1|2|3 } into the set's mastery and schedule. Returns the merged { mastery, schedule }. */
export async function persistSetOutcomes(uid, setId, outcomes) {
  if (!uid || !setId) throw new Error('There is no set to save progress to.')
  const { ownData, progressData } = await readSources(uid, setId)
  const plan = planProgressSave(ownData, progressData, outcomes)
  const fields = { cardMastery: plan.mastery, cardSchedule: plan.schedule, lastStudiedAt: serverTimestamp() }
  if (plan.target === 'set') await updateDoc(setRef(uid, setId), fields)
  else await setDoc(progressRef(uid, setId), fields, { merge: true })
  return { mastery: plan.mastery, schedule: plan.schedule }
}
