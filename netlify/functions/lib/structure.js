// netlify/functions/lib/structure.js
// Server-side validation for an OFFICIAL per-question paper structure submitted through /api/admin.
// The same rules exist client-side in src/utils/paperQuestions.js (so students and admins get the
// same feedback); tests/utils.test.js runs both against one table of cases so they cannot drift.
'use strict'

const GCSE_SCIENCE_SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Combined Science']
const MAX_QUESTIONS = 60

// Largest single question the course can contain, or null when no cap is known.
function maxQuestionMarks(level, subject) {
  return level === 'GCSE' && GCSE_SCIENCE_SUBJECTS.includes(subject) ? 6 : null
}

// questions: [{ num, marks }] numbered 1..N in order. Returns { ok, total, errors[] }.
function validateQuestionStructure(questions, { maxMarks, level, subject } = {}) {
  const errors = []
  if (!Array.isArray(questions) || questions.length === 0) {
    return { ok: false, total: 0, errors: ['A structure needs at least one question.'] }
  }
  if (questions.length > MAX_QUESTIONS) errors.push(`A paper can have at most ${MAX_QUESTIONS} questions.`)
  const cap = maxQuestionMarks(level, subject)
  let total = 0
  questions.forEach((q, i) => {
    if (!q || q.num !== i + 1) errors.push(`Question ${i + 1} must be numbered ${i + 1}.`)
    if (!q || !Number.isInteger(q.marks) || q.marks < 1) errors.push(`Question ${i + 1}: marks must be a whole number of 1 or more.`)
    else {
      total += q.marks
      if (cap != null && q.marks > cap) errors.push(`Question ${i + 1}: a GCSE ${subject} question is worth at most ${cap} marks.`)
    }
  })
  if (!errors.length) {
    if (!Number.isInteger(maxMarks) || maxMarks < 1) errors.push('The paper total (maxMarks) is required.')
    else if (total !== maxMarks) errors.push(`The questions add up to ${total} marks but the paper is worth ${maxMarks}.`)
  }
  return { ok: errors.length === 0, total, errors }
}

module.exports = { GCSE_SCIENCE_SUBJECTS, MAX_QUESTIONS, maxQuestionMarks, validateQuestionStructure }
