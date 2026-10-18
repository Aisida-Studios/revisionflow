// src/utils/attemptGrade.js
// Grading ONE past paper against a boundary set - the single place that decides how.
//
// Boundary sets are usually out of the whole subject (e.g. 240 for three 80-mark papers) while a
// paper is worth less (e.g. 80), so the paper's mark is compared by PERCENTAGE (see
// scaleBoundariesToPaper in data/paperDatabase.js). Comparing the raw mark - 75 against marks out of
// 240 - is what used to turn 75/80 into a grade 4.
import { calculateGradeFromBoundaries } from '../data/paperDatabase'

const CUSTOM_SOURCE = 'Student-entered boundaries'

// -> { grade, gradeProvenance } for a score out of maxMarks. `custom` marks boundaries the student
// typed in themselves (never presented as official).
export function gradePaper({ score, maxMarks, boundarySet, custom = false, year = null }) {
  const s = Number(score), max = Number(maxMarks)
  if (!boundarySet || !(max > 0) || !Number.isFinite(s)) return { grade: null, gradeProvenance: null }
  const grade = calculateGradeFromBoundaries(s, boundarySet, max)
  const scaledFrom = boundarySet.maxMarks && Number(boundarySet.maxMarks) !== max ? Number(boundarySet.maxMarks) : null
  const base = custom
    ? { requestedYear: Number(year) || null, sourceYear: null, verified: false, estimated: true, source: CUSTOM_SOURCE, label: 'Grade from boundaries you entered' }
    : (boundarySet.provenance || null)
  if (!base) return { grade, gradeProvenance: null }
  return {
    grade,
    gradeProvenance: {
      requestedYear: base.requestedYear ?? null, sourceYear: base.sourceYear ?? null,
      verified: !!base.verified, estimated: !!base.estimated || !!scaledFrom,
      source: base.source,
      label: base.label + (scaledFrom && !custom ? ` Converted by percentage from the whole-subject total (${scaledFrom}) to this paper (${max}).` : ''),
      ...(scaledFrom && !custom ? { scaledFrom } : {}),
    },
  }
}

// A saved attempt whose grade was produced by the old behaviour (raw mark against whole-subject
// boundaries) and is therefore wrong. Returns { grade } with the corrected grade, or null to leave
// it alone. A grade is only touched when it EXACTLY matches what the old behaviour would have saved
// and differs from the correct one, so grades from custom boundaries or typed by hand are safe.
export function staleGradeFix(attempt, boundarySet) {
  if (!attempt || !boundarySet) return null
  if (attempt.customBoundaries || attempt.gradeProvenance?.source === CUSTOM_SOURCE) return null
  const max = Number(attempt.maxMarks), score = Number(attempt.score)
  if (!(max > 0) || !Number.isFinite(score) || !boundarySet.maxMarks || Number(boundarySet.maxMarks) === max) return null
  const oldGrade = calculateGradeFromBoundaries(score, boundarySet)            // raw mark, as it used to be saved
  const correct  = calculateGradeFromBoundaries(score, boundarySet, max)
  return attempt.grade === oldGrade && oldGrade !== correct ? { grade: correct } : null
}

// The boundary set an attempt was graded with when it used the student's own boundaries.
export function customBoundarySetFor(attempt) {
  if (!Array.isArray(attempt?.customBoundaries) || !attempt.customBoundaries.length) return null
  return {
    boundaries: attempt.customBoundaries,
    maxMarks: Number(attempt.customBoundariesMax) || Number(attempt.maxMarks),
    grades: attempt.customGrades || undefined,
  }
}
