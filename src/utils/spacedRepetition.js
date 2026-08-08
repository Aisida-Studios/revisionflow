// src/utils/spacedRepetition.js
// Simple Leitner-box scheduler for flashcards. Deliberately simple (5 boxes, fixed
// intervals) rather than a full SM-2 implementation — good enough to genuinely resurface
// cards a student keeps getting wrong, without needing per-card ease-factor tuning.
//
// A card's schedule is stored per-set, alongside the existing cardMastery map:
//   cardSchedule: { [cardQ]: { box: 1-5, dueDate: 'YYYY-MM-DD' } }
//
// Dates are local YYYY-MM-DD strings (not Date objects / ISO UTC strings) throughout,
// so "is this due today" never shifts around a timezone boundary, and so lexicographic
// string comparison ('2026-08-09' <= '2026-08-10') is also correct chronological order.

export const LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 16] // index 0 = box 1
export const MAX_BOX = LEITNER_INTERVALS_DAYS.length

function pad(n) { return String(n).padStart(2, '0') }

export function dateToStr(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

export function todayStr() {
  return dateToStr(new Date())
}

export function addDaysStr(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return dateToStr(d)
}

// schedule may be undefined (never practiced) — treated as due now.
export function isDue(schedule) {
  if (!schedule || !schedule.dueDate) return true
  return schedule.dueDate <= todayStr()
}

export function daysOverdue(schedule) {
  if (!schedule || !schedule.dueDate) return 0
  const [y, m, d] = schedule.dueDate.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((now - due) / 86400000)
}

// rating: 1 = Didn't know (back to box 1, due now), 2 = Partially (hold box, retry at
// same interval), 3 = Got it (promote a box, interval grows).
export function nextSchedule(schedule, rating) {
  const currentBox = schedule?.box || 1
  let box
  if (rating === 3) box = Math.min(MAX_BOX, currentBox + 1)
  else if (rating === 2) box = currentBox
  else box = 1
  return { box, dueDate: addDaysStr(LEITNER_INTERVALS_DAYS[box - 1]) }
}

// Sorts most-urgent-first: never-scheduled and low-box cards before high-box ones,
// and within a box, the most overdue first.
export function practiceSortCompare(a, b) {
  const boxA = a.schedule?.box || 0
  const boxB = b.schedule?.box || 0
  if (boxA !== boxB) return boxA - boxB
  return daysOverdue(b.schedule) - daysOverdue(a.schedule)
}

// Builds a flat, priority-sorted queue of due cards across every set.
// sets: [{ id, title, subject, cards: [{q,a}], cardSchedule }]
export function buildDueQueue(sets) {
  const queue = []
  for (const set of sets || []) {
    const schedule = set.cardSchedule || {}
    for (const card of set.cards || []) {
      const cardSchedule = schedule[card.q]
      if (!isDue(cardSchedule)) continue
      queue.push({ setId: set.id, setTitle: set.title, subject: set.subject, card, schedule: cardSchedule })
    }
  }
  return queue.sort(practiceSortCompare)
}
