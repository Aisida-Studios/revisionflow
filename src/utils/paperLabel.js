// src/utils/paperLabel.js
// How a logged paper is named on screen. An official past paper has a year and a paper number. An unofficial one (a mock,
// a practice paper, a teacher's paper) has the name the student gave it and no year. Every place that shows or groups a
// paper uses these, so a paper without a year never prints "null" or "undefined". Pure functions: no imports.

const SHORT_NAME_MAX = 24

export function isUnofficial(a) {
  return !!a && (a.unofficial === true || (a.year == null && !!String(a.paperName || '').trim()))
}

const paperNumber = a => (a && a.paper != null && a.paper !== '' ? a.paper : null)
const cleanName = a => String(a.paperName || '').trim().replace(/\s+/g, ' ')

// "Unofficial", or the exam year as text ('' when an old record has neither).
export function paperYearText(a) {
  if (!a) return ''
  if (isUnofficial(a)) return 'Unofficial'
  return a.year == null ? '' : String(a.year)
}

// Full name: "Paper 2 (2024)" | "Hodder practice paper 2 (unofficial)"
export function paperTitle(a) {
  if (!a) return ''
  if (isUnofficial(a)) {
    const name = cleanName(a)
    return (name || 'Unofficial paper') + (name ? ' (unofficial)' : '')
  }
  const n = paperNumber(a)
  const head = n == null ? 'Paper' : 'Paper ' + n
  return a.year == null ? head : head + ' (' + a.year + ')'
}

// Short name for chart labels and one-line summaries: "P2 2024" | "Hodder practice pap…"
export function paperShort(a) {
  if (!a) return ''
  if (isUnofficial(a)) {
    const name = cleanName(a) || 'Unofficial'
    return name.length > SHORT_NAME_MAX ? name.slice(0, SHORT_NAME_MAX - 1).trimEnd() + '…' : name
  }
  const n = paperNumber(a)
  return [n == null ? '' : 'P' + n, a.year == null ? '' : String(a.year)].filter(Boolean).join(' ')
}

// What counts as "the same paper again": an official paper is the subject and paper number; an unofficial one is the
// subject and its name, so two different mocks are never mistaken for repeat attempts at one paper.
export function paperGroupKey(a) {
  if (!a) return ''
  const subject = a.subject || ''
  if (isUnofficial(a)) return subject + '|unofficial:' + cleanName(a).toLowerCase()
  const n = paperNumber(a)
  return subject + '|' + (n == null ? '' : n)
}
