// src/utils/flashcardMeta.js
// Board and level of a flashcard set, for filters. Browser twin of netlify/functions/lib/setMeta.js
// (tests/utils.test.js checks the two agree).
//
// Old bulk-generated official sets were saved as "{board} {level} {subject} — {topic}" with no board or
// level fields, so a board filter could not find them (and, worse, the viewer's own profile was used to
// guess a board, so only the viewer's own boards ever matched). Rules here:
//   1. A stamped board / level is used, in its canonical spelling.
//   2. An OFFICIAL set that has none reads them back out of its code-generated title.
//   3. Anything else is "unknown" (''), never guessed from whoever is looking at it.

const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[\s\-_/]+/g, '')

const BOARD_BY_KEY = {
  aqa: 'AQA',
  edexcel: 'Edexcel', pearsonedexcel: 'Edexcel', pearson: 'Edexcel',
  ocr: 'OCR',
  wjec: 'WJEC', eduqas: 'WJEC', eduqaswjec: 'WJEC', wjeceduqas: 'WJEC',
  ccea: 'CCEA',
}
const BOARD_PREFIXES = ['Pearson Edexcel', 'Eduqas / WJEC', 'WJEC / Eduqas', 'WJEC Eduqas', 'Eduqas WJEC',
  'Edexcel', 'Eduqas', 'WJEC', 'AQA', 'OCR', 'CCEA']
const LEVEL_BY_KEY = { gcse: 'GCSE', aslevel: 'AS-Level', alevel: 'A-Level' }
const LEVEL_PREFIXES = ['AS-Level', 'AS Level', 'A-Level', 'A Level', 'GCSE']

export const canonicalBoardName = (raw) => BOARD_BY_KEY[norm(raw)] || ''
export const normaliseLevelName = (raw) => LEVEL_BY_KEY[norm(raw)] || ''

function startsWithWord(text, phrase) {
  return text.length > phrase.length && text.slice(0, phrase.length).toLowerCase() === phrase.toLowerCase() && text[phrase.length] === ' '
}

/** "Edexcel GCSE Physics — Waves" -> { board: 'Edexcel', level: 'GCSE', subject: 'Physics', topic: 'Waves' }, else null. */
export function parseSetTitle(title) {
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

export const claimsOfficial = (set) => !!set && (set.uid === 'official' || set.authorType === 'official' || set.official === true)

/** { board, level } in canonical spelling, '' where unknown. Never uses the viewer's profile. */
export function setBoardLevel(set) {
  const board = canonicalBoardName(set && set.board)
  const level = normaliseLevelName(set && set.level)
  if ((board && level) || !claimsOfficial(set)) return { board, level }
  const parsed = parseSetTitle(set.title)
  return { board: board || (parsed && parsed.board) || '', level: level || (parsed && parsed.level) || '' }
}
