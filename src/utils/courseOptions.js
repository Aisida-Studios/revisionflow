// src/utils/courseOptions.js
// Course options. The rules (which slots a subject has, what a choice hides, how the chooser behaves) live in
// courseOptionsCore.js, which has no Firebase in it. This file re-exports all of it, so every existing import from
// utils/courseOptions keeps working, and adds the one function that writes to Firestore.

import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { withSubjectOptions } from './courseOptionsCore'

export * from './courseOptionsCore'

// users/{uid} is owner-only in the Firestore rules and `subjects` is not a server-owned field, so no rule change
// is needed. Call refreshProfile() afterwards so every screen sees the choice.
export async function saveSubjectOptions(uid, profile, subject, options) {
  await updateDoc(doc(db, 'users', uid), { subjects: withSubjectOptions(profile.subjects, subject, options, profile) })
}
