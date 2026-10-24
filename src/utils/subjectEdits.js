// src/utils/subjectEdits.js
// A subject's course options (the optional papers or topics a student chose) only make sense for the board and
// qualification they were chosen under. When either changes the options no longer apply, so they are cleared and
// the student chooses again. Pure; used by Settings when it saves the subject list.
import { canonicalBoard } from '../data/boards'

const keyOf = (s) => (s && (s.id || s.name)) || ''

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
