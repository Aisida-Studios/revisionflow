// src/utils/qualificationSwitch.js
// Detects when a student's subject list means a subject's history is no longer "current" —
// either because it switched level (directly, or a same-named subject reappearing at a
// different level, e.g. GCSE Physics -> AS-Level Physics with no single "switch" click), or
// because it was dropped entirely with nothing replacing it. Used by Settings.jsx to offer the
// keep/remove choice for that subject's superseded Past Papers attempts and quiz results —
// see archiveSupersededAttempts/deleteSubjectAttempts in firestore.js for what happens once
// the student answers.
//
// Matching is done by subject NAME, not by the subject's client-generated id — id is freshly
// regenerated (Date.now().toString()) every time a subject is added, so a remove-then-add of
// the "same" subject at a new level produces two different ids. Name is the only stable way to
// recognise "this is conceptually the same subject, now at a different level".
import { getSubjectQualification } from '../data/subjects'

// oldSubjects / newSubjects: profile.subjects-shaped arrays (before and after a save).
// profile: the profile object to resolve fallback qualification against — pass the profile as
// it was BEFORE this save (see the callers' comments about onSnapshot timing).
// Returns: [{ subjectName, oldQualification, newQualification }, ...] — one entry per subject
// name that's no longer current. newQualification is null for a subject dropped with no
// same-named replacement — there's nothing to switch it "to", just old history to deal with.
export function detectQualificationSwitches(oldSubjects, newSubjects, profile) {
  const oldList = Array.isArray(oldSubjects) ? oldSubjects : []
  const newList = Array.isArray(newSubjects) ? newSubjects : []
  const switches = []

  for (const oldSubj of oldList) {
    const oldQual = getSubjectQualification(oldSubj, profile)

    // Same id still present — this is a direct in-place edit of an existing subject
    // (e.g. a future per-subject qualification control), not an add/remove pair.
    const sameId = newList.find(s => s.id === oldSubj.id)
    if (sameId) {
      const stillQual = getSubjectQualification(sameId, profile)
      if (stillQual !== oldQual) {
        switches.push({ subjectName: oldSubj.name, oldQualification: oldQual, newQualification: stillQual })
      }
      continue
    }

    // Id is gone (removed, or replaced). Look for a same-NAME subject in the new list —
    // that's the implicit-switch case: old one deactivated, new one with the same name active.
    const sameName = newList.find(s => s.name === oldSubj.name)
    if (sameName) {
      const newQual = getSubjectQualification(sameName, profile)
      if (newQual !== oldQual) {
        switches.push({ subjectName: oldSubj.name, oldQualification: oldQual, newQualification: newQual })
      }
      continue
    }

    // No same-named replacement: subject dropped entirely. Its history isn't current either —
    // offer it for the same keep/remove choice, just with nothing to switch "to".
    switches.push({ subjectName: oldSubj.name, oldQualification: oldQual, newQualification: null })
  }

  return switches
}
