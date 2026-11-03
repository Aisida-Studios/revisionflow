// src/utils/subjectEdits.js
// A subject's course options (the optional papers or topics a student chose) only make sense for the board and
// qualification they were chosen under. When either changes the options no longer apply, so they are cleared and
// the student chooses again. Pure; used by Settings when it saves the subject list.
import { canonicalBoard } from '../data/boards'
import { getSubjectQualification } from '../data/subjects'

const keyOf = (s) => (s && (s.id || s.name)) || ''

// The same course is the same subject on the same board and qualification (Eduqas and WJEC count as one board). This is
// the identity saveSubjectOptions() in utils/courseOptions.js matches on, so the two always agree.
export function isSameCourse(a, b, profile) {
  if (!a || !b) return false
  return a.name === b.name
    && canonicalBoard(a.board) === canonicalBoard(b.board)
    && getSubjectQualification(a, profile) === getSubjectQualification(b, profile)
}

// True when this subject is already in the SAVED subject list, so its options can be written straight away. A subject
// that was only just added on the Settings page is not saved yet and keeps its options until "Save subjects".
export function isSavedCourse(savedSubjects, subject, profile) {
  return (savedSubjects || []).some(s => isSameCourse(s, subject, profile))
}

export function dropOptionsWhenCourseChanges(nextSubjects, previousSubjects) {
  const before = new Map((previousSubjects || []).map(s => [keyOf(s), s]))
  return (nextSubjects || []).map(s => {
    if (!s || s.options === undefined) return s
    const prev = before.get(keyOf(s))
    if (!prev) return s
    const boardChanged = !!prev.board && !!s.board && canonicalBoard(prev.board) !== canonicalBoard(s.board)
    const qualChanged  = !!prev.qualification && !!s.qualification && prev.qualification !== s.qualification
    if (!boardChanged && !qualChanged) return s
    const { options, ...rest } = s      // omitted, not set to undefined (Firestore rejects undefined)
    return rest
  })
}
