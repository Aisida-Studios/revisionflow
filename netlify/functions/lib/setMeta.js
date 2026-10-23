// netlify/functions/lib/setMeta.js
// Board and level of a flashcard set, for sets that predate the separate board / level fields.
// The old bulk generator saved official sets as "{board} {level} {subject} — {topic}" with no board
// or level fields, so a board filter could not find them. This reads them back out of that
// predictable, code-generated title. Pure and dependency-free; src/utils/flashcardMeta.js is its
// browser twin and tests/utils.test.js checks the two agree.

const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[\s\-_/]+/g, '')

// Every spelling of a board that has appeared in stored data -> the canonical value the app uses.
const BOARD_BY_KEY = {
  aqa: 'AQA',
  edexcel: 'Edexcel', pearsonedexcel: 'Edexcel', pearson: 'Edexcel',
  ocr: 'OCR',
  wjec: 'WJEC', eduqas: 'WJEC', eduqaswjec: 'WJEC', wjeceduqas: 'WJEC',
  ccea: 'CCEA',
}
// How a board is written at the start of a title, longest first so 'Pearson Edexcel' beats 'Edexcel'.
const BOARD_PREFIXES = ['Pearson Edexcel', 'Eduqas / WJEC', 'WJEC / Eduqas', 'WJEC Eduqas', 'Eduqas WJEC',
  'Edexcel', 'Eduqas', 'WJEC', 'AQA', 'OCR', 'CCEA']
const LEVEL_BY_KEY = { gcse: 'GCSE', aslevel: 'AS-Level', alevel: 'A-Level' }
const LEVEL_PREFIXES = ['AS-Level', 'AS Level', 'A-Level', 'A Level', 'GCSE']

function canonicalBoardName(raw) { return BOARD_BY_KEY[norm(raw)] || '' }
function normaliseLevelName(raw) { return LEVEL_BY_KEY[norm(raw)] || '' }

function startsWithWord(text, phrase) {
  return text.length > phrase.length && text.slice(0, phrase.length).toLowerCase() === phrase.toLowerCase() && text[phrase.length] === ' '
}

/** "Edexcel GCSE Physics — Waves" -> { board: 'Edexcel', level: 'GCSE', subject: 'Physics', topic: 'Waves' }, else null. */
function parseSetTitle(title) {
  const text = String(title || '').trim()
  if (!text) return null
  const boardPhrase = BOARD_PREFIXES.find(b => startsWithWord(text, b))
  if (!boardPhrase) return null
  const afterBoard = text.slice(boardPhrase.length + 1).trim()
  const levelPhrase = LEVEL_PREFIXES.find(l => startsWithWord(afterBoard, l))
  if (!levelPhrase) return null
  const rest = afterBoard.slice(levelPhrase.length + 1).trim()
  const [subject, ...topicParts] = rest.split(/\s+[\u2014\u2013-]\s+/)
  if (!subject) return null
  return {
    board: canonicalBoardName(boardPhrase),
    level: normaliseLevelName(levelPhrase),
    subject: subject.trim(),
    topic: topicParts.join(' - ').trim(),
  }
}

/** Stamped fields first, then (for sets that carry them only in the title) the parsed title. '' when unknown. */
function officialSetMeta(set) {
  const board = canonicalBoardName(set && set.board)
  const level = normaliseLevelName(set && set.level)
  if (board && level) return { board, level }
  const parsed = parseSetTitle(set && set.title)
  return { board: board || (parsed && parsed.board) || '', level: level || (parsed && parsed.level) || '' }
}

module.exports = { canonicalBoardName, normaliseLevelName, parseSetTitle, officialSetMeta }
