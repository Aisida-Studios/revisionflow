// src/utils/gradeTargets.js
// A target grade only means something on its own qualification's scale. 9 does not exist at
// AS-Level (A to E, no A*) and is not an A-Level grade either, yet an old default of '9' was
// saved against AS-Level subjects and several screens fell back to 9 when no target was set.
//
// Every reader goes through here: it returns the stored target only when it is a real grade for
// that subject, otherwise null ("Not set"). Nothing is ever invented, and stored data is never
// rewritten from here (the student picks a valid target the next time they save their subjects).
import { getGradeOptions, getSubjectQualification } from '../data/subjects'

/** The grades a subject can actually be awarded (its qualification's scale, tier-aware). */
export function gradeScaleFor(subject, profile) {
  return getGradeOptions(subject?.name, getSubjectQualification(subject, profile), subject?.tier)
}

export function isValidTargetGrade(subject, profile, grade) {
  if (grade === undefined || grade === null || grade === '') return false
  return gradeScaleFor(subject, profile).includes(String(grade))
}

/**
 * The student's target for this subject, or null when none is stored or the stored one is not a
 * grade on this subject's scale (for example '9' on an AS-Level subject).
 */
export function resolveTargetGrade(subject, profile) {
  const candidates = [subject?.targetGrade, profile?.targetGrades?.[subject?.name]]
  for (const c of candidates) if (isValidTargetGrade(subject, profile, c)) return String(c)
  return null
}

/** Text for display: the target, or "Not set". */
export function targetGradeLabel(subject, profile) {
  return resolveTargetGrade(subject, profile) || 'Not set'
}

/** Text for an AI prompt: the target, or "not set" (never a made-up number). */
export function targetGradeForPrompt(subject, profile) {
  return resolveTargetGrade(subject, profile) || 'not set'
}
