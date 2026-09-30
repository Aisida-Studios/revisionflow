// src/data/boards.js
// ─────────────────────────────────────────────────────────────────────────────
// The ONE place exam-board identity is defined. Every selector, lookup and key
// builder that needs to know "which board is this" goes through canonicalBoard()
// rather than keeping its own alias table.
//
// What is stored: profile.subjects[i].board (and every other record's `board`
// field) holds the canonical VALUE below — for Eduqas/WJEC that is 'WJEC', the
// value every existing profile already holds. Nothing here changes what is
// stored, so no existing data needs migrating.
//
// What is shown: the LABEL. Eduqas and WJEC are one organisation and one
// dataset in this app, so they are presented as a single 'Eduqas / WJEC'
// option rather than two.
//
// What is NOT supported: anything else — most notably 'Cambridge'. RevisionFlow
// has no Cambridge International (IGCSE / CIE) curriculum data, and 'Cambridge
// OCR' is just OCR's new name (already covered by 'OCR'). An unsupported board
// stays exactly as stored (never silently rewritten to another board), is
// labelled "(not supported)" when shown, and is never offered as a choice.
//
// Each data file (topics.js, examDates2026.js, paperDatabase.js) keys its own
// data by its own board string — that mapping (canonical value → that file's
// key) lives in that file, because it is a fact about how that file is keyed,
// not about board naming. Do not add a second alias table anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_BOARDS = [
  { value: 'AQA',     label: 'AQA' },
  { value: 'Edexcel', label: 'Edexcel' },
  { value: 'OCR',     label: 'OCR' },
  { value: 'WJEC',    label: 'Eduqas / WJEC' },
  { value: 'CCEA',    label: 'CCEA' },
]

// Used only where a record has no board at all (profiles that predate board
// capture). Never used to stand in for a board that IS named but unsupported.
export const DEFAULT_BOARD = 'AQA'

// Lower-cased, whitespace-free spellings → canonical value. Every way the
// Eduqas/WJEC board has been written in stored data or older code is here.
const ALIASES = {
  aqa: 'AQA',
  edexcel: 'Edexcel',
  ocr: 'OCR',
  ccea: 'CCEA',
  wjec: 'WJEC',
  eduqas: 'WJEC',
  'eduqas/wjec': 'WJEC',
  'wjec/eduqas': 'WJEC',
}

/**
 * Canonical stored value for a board string. Known spellings resolve to their
 * canonical value; an unrecognised (e.g. legacy 'Cambridge') board is returned
 * trimmed but otherwise untouched; a missing board returns ''.
 */
export function canonicalBoard(board) {
  const raw = String(board == null ? '' : board).trim()
  if (!raw) return ''
  const key = raw.toLowerCase().replace(/\s+/g, '')
  return ALIASES[key] || raw
}

export function isSupportedBoard(board) {
  const canon = canonicalBoard(board)
  return SUPPORTED_BOARDS.some(b => b.value === canon)
}

/** Display text for any stored board value. Unsupported values are labelled as such. */
export function boardLabel(board) {
  const canon = canonicalBoard(board)
  if (!canon) return ''
  const hit = SUPPORTED_BOARDS.find(b => b.value === canon)
  return hit ? hit.label : `${canon} (not supported)`
}

/**
 * Options for a board <select>: the supported boards, plus — only when the
 * current value is a legacy/unsupported board — that value as a disabled
 * option, so existing data stays visible without anyone being able to newly
 * choose it. Pass the select's value through canonicalBoard() too, so a value
 * stored under an alias (e.g. 'Eduqas') still shows as selected.
 */
export function boardSelectOptions(currentValue) {
  const options = SUPPORTED_BOARDS.map(b => ({ value: b.value, label: b.label, disabled: false }))
  const canon = canonicalBoard(currentValue)
  if (canon && !isSupportedBoard(canon)) {
    options.push({ value: canon, label: boardLabel(canon), disabled: true })
  }
  return options
}
