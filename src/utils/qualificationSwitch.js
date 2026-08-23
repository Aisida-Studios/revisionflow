// src/utils/qualificationSwitch.js
// Detects when a student's subject list implies a qualification change for a subject name —
// either directly (they edited a subject's own qualification) or implicitly (the old subject
// is gone and a same-named one reappears at a different level, e.g. GCSE Physics -> AS-Level
// Physics with no single "switch" click). Used by Settings.jsx to trigger archiving of that
// subject's superseded Past Papers attempts and quiz results — see archiveSupersededAttempts
// in firestore.js for what actually happens once a switch is detected here.
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
// name whose active qualification changed. A subject that's simply removed with no same-named
// replacement is NOT included: there's no current view left for its old data to bleed into.
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
    }
    // No same-named replacement: subject just dropped, not a qualification switch.
  }

  return switches
}
