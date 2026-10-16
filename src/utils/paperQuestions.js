// src/utils/paperQuestions.js
// Question-level structure for a past paper: a mark DISTRIBUTION (groups such as "5 questions of
// 4 marks"), validation against the paper's real total and the course's real limits, and the
// per-question scores a student enters. Nothing here invents an official structure - a
// distribution entered by a student is always labelled student-entered, never verified.

export const GCSE_SCIENCE_SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'Combined Science']
export const MAX_QUESTIONS = 60

// The largest single question the course can contain, or null when no cap is known.
// GCSE science papers top out at 6-mark extended-response questions - an 8-mark question there
// means the structure was entered wrongly.
export function maxQuestionMarks(qualification, subject) {
  return qualification === 'GCSE' && GCSE_SCIENCE_SUBJECTS.includes(subject) ? 6 : null
}

const isWhole = (n) => Number.isInteger(n) && n >= 1

// groups: [{ count, marks }] -> [{ num, marks, scored: 0, topic: '' }], numbered 1..N in order.
export function buildQuestions(groups) {
  const out = []
  for (const g of groups || []) {
    for (let i = 0; i < (Number(g.count) || 0); i++) out.push({ num: out.length + 1, marks: Number(g.marks), scored: 0, topic: '' })
  }
  return out
}

export const distributionTotal = (groups) =>
  (groups || []).reduce((s, g) => s + (Number(g.count) || 0) * (Number(g.marks) || 0), 0)

// Does this distribution describe the paper? { ok, total, errors[] }
export function validateDistribution(groups, { maxMarks, qualification, subject } = {}) {
  const errors = []
  const list = groups || []
  if (!list.length) errors.push('Add at least one group of questions.')
  list.forEach((g, i) => {
    if (!isWhole(Number(g.count))) errors.push(`Group ${i + 1}: the number of questions must be a whole number of 1 or more.`)
    if (!isWhole(Number(g.marks))) errors.push(`Group ${i + 1}: marks per question must be a whole number of 1 or more.`)
  })
  const total = distributionTotal(list)
  const questionCount = list.reduce((s, g) => s + (Number(g.count) || 0), 0)
  if (questionCount > MAX_QUESTIONS) errors.push(`A paper can have at most ${MAX_QUESTIONS} questions here.`)
  const cap = maxQuestionMarks(qualification, subject)
  if (cap != null && list.some(g => Number(g.marks) > cap)) {
    errors.push(`A GCSE ${subject} question is worth at most ${cap} marks.`)
  }
  if (Number(maxMarks) > 0 && total !== Number(maxMarks) && !errors.length) {
    errors.push(`The questions add up to ${total} marks but the paper is worth ${maxMarks}.`)
  }
  return { ok: errors.length === 0, total, errors }
}

// Do the entered per-question scores match the score logged for the paper? { ok, total, errors[] }
export function validateScores(questions, { score } = {}) {
  const errors = []
  let total = 0
  for (const q of questions || []) {
    const got = Number(q.scored)
    if (!Number.isInteger(got) || got < 0 || got > q.marks) {
      errors.push(`Question ${q.num}: enter a whole number from 0 to ${q.marks}.`)
    } else total += got
  }
  if (!errors.length && score != null && total !== Number(score)) {
    errors.push(`The question marks add up to ${total} but you logged ${score} for this paper.`)
  }
  return { ok: errors.length === 0, total, errors }
}

export const lostMarks = (q) => Math.max(0, (Number(q?.marks) || 0) - (Number(q?.scored) || 0))

// Questions where marks were dropped, biggest loss first.
export const questionsWithLostMarks = (questions) =>
  (questions || []).filter(q => lostMarks(q) > 0).sort((a, b) => lostMarks(b) - lostMarks(a) || a.num - b.num)

// Inverse of buildQuestions: a stored structure back into editable groups, merging consecutive
// questions that are worth the same (5 questions of 4 marks, not five separate rows).
export function groupsFromQuestions(questions) {
  const groups = []
  for (const q of questions || []) {
    const last = groups[groups.length - 1]
    if (last && last.marks === q.marks) last.count++
    else groups.push({ count: 1, marks: q.marks })
  }
  return groups
}
