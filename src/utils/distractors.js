// src/utils/distractors.js
// The options of a multiple-choice quiz question. Pure: no React, no Firebase, no network, so every rule here is tested.
//
// How a quiz gets its options:
//   1. Every question starts on REAL answers taken from other cards in the same set (pickLocalDistractors). Nothing has
//      to be fetched, so the quiz starts at once and cannot fail.
//   2. Better, AI-written distractors are fetched in SMALL BATCHES while the student is answering, always a little ahead
//      of them (planBatch, createDistractorTopUp), and swapped in for questions they have not reached yet. A reply that
//      is late, partial, malformed or missing only means that question keeps its real-answer options.

export const BATCH_SIZE = 8           // questions per AI request: small enough for one quick, complete reply
export const WATERMARK = 6            // keep this many of the next multiple-choice questions covered
export const MAX_AI_CALLS = 16        // per quiz; after that the remaining questions keep their real-answer options
export const MAX_FAILURES = 2         // failed requests in a row before the quiz stops asking
export const MAX_TRIES = 2            // per question
export const BATCH_CHARS = 2200       // total length of the answers in one request
export const MAX_ANSWER_CHARS = 400   // a longer answer is not sent: its options stay real answers

const tidy = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim()

/** The form two answers are compared in: case, spacing and a trailing full stop do not make them different. */
export const answerKey = (s) => tidy(s).toLowerCase().replace(/[.,;:!?]+$/, '')

// One answer inside the other ("Nucleus" and "The nucleus of the cell") reads as the same answer, so is not a distractor.
const overlaps = (a, b) => a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))

/** A shuffled copy (Fisher-Yates). `rand` is injectable so tests are exact. */
export function shuffled(list, rand = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A 53-bit string hash (cyrb53): enough that two different cards of a set never share a key in practice.
function hash53(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/** A stable key for a card, from its own text: the same whichever cards a quiz uses, in whatever order, and a card that
 *  has been edited gets a new one. This is what the shared options cache is keyed by. */
export const cardKey = (card) => hash53(answerKey(card && card.q) + '\u0001' + answerKey(card && card.a)).toString(36)

// ── Real-answer options (always available) ─────────────────────────────────────────────────────────

const isNumeric = (s) => { const t = tidy(s); const digits = (t.match(/\d/g) || []).length; return digits > 0 && digits / t.length >= 0.4 }
const wordCount = (s) => (tidy(s) ? tidy(s).split(' ').length : 0)
// How unlike two answers look: length, number of words, and number versus text.
function distance(a, b) {
  const la = tidy(a).length, lb = tidy(b).length, wa = wordCount(a), wb = wordCount(b)
  return Math.abs(la - lb) / Math.max(la, lb, 1) + 0.5 * Math.abs(wa - wb) / Math.max(wa, wb, 1) + (isNumeric(a) !== isNumeric(b) ? 0.6 : 0)
}

/**
 * Wrong answers for `card`, taken from the other answers in `pool`: never the right answer, never a repeat of each
 * other, never one that contains (or sits inside) the right answer. The closest in length and kind are preferred so an
 * option is not obviously out of place, with a random pick among the nearest so repeat quizzes vary. May return fewer
 * than `count` (a small set), or none.
 */
export function pickLocalDistractors(pool, card, count = 3, rand = Math.random) {
  const correct = answerKey(card && card.a)
  const seen = new Set([correct])
  const candidates = []
  for (const c of pool || []) {
    if (!c || c === card) continue
    const text = tidy(c.a)
    const key = answerKey(text)
    if (!text || seen.has(key)) continue
    seen.add(key)
    if (overlaps(correct, key)) continue
    candidates.push(text)
  }
  candidates.sort((x, y) => distance(card.a, x) - distance(card.a, y))
  return shuffled(candidates.slice(0, count * 2), rand).slice(0, count)
}

/** The option objects for a question: the right answer (the card itself) among the wrong ones, in a random order. */
export function buildOptions(card, wrongs, rand = Math.random) {
  return shuffled([...wrongs.map(a => ({ ...card, a })), card], rand)
}

/** AI-proposed wrong answers, kept only where they are real alternatives: text or numbers, not the right answer, not a
 *  repeat, not a copy of the right answer with words added. Returns at most `count`. */
export function cleanProposed(correct, proposed, count = 3) {
  const correctKey = answerKey(correct)
  const seen = new Set([correctKey])
  const out = []
  for (const raw of Array.isArray(proposed) ? proposed : []) {
    if (out.length >= count) break
    if (typeof raw !== 'string' && !(typeof raw === 'number' && Number.isFinite(raw))) continue
    const text = tidy(raw)
    const key = answerKey(text)
    if (!text || text.length > MAX_ANSWER_CHARS * 2 || seen.has(key) || overlaps(correctKey, key)) continue
    seen.add(key)
    out.push(text)
  }
  return out
}

// ── Asking the AI for a few at a time ──────────────────────────────────────────────────────────────

/** The request for one batch. `items` is [{ q, a }]. */
export function buildDistractorPrompt(items) {
  const list = items.map((it, i) => `Q${i + 1}: ${tidy(it.q)} | Answer: ${tidy(it.a)}`).join('\n')
  return `You are writing multiple choice distractors for a flashcard quiz. For each of the ${items.length} questions below, write exactly 3 wrong answer options.

RULES:
- Same length and style as the real answer (if the answer is two sentences, so are the distractors)
- Use correct subject terminology: they must sound like they could be right
- Change one or two key facts, numbers or ideas to make them wrong (wrong direction, wrong organ, wrong date, wrong formula)
- Never the same as the real answer, and never the same as each other
- Not obviously wrong or silly; never "None of the above" or "All of the above"

Reply with ONLY a JSON array of ${items.length} arrays, in the same order as the questions, each holding exactly 3 strings. No markdown, no explanation:
[["wrong 1","wrong 2","wrong 3"],["wrong 1","wrong 2","wrong 3"]]

Questions and real answers:
${list}`
}

/** A reply budget sized to the batch: three wrong answers per answer is about as many characters again, three times over. */
export function distractorTokens(items) {
  const chars = (items || []).reduce((n, it) => n + Math.min(tidy(it && it.a).length, MAX_ANSWER_CHARS), 0)
  return Math.max(700, Math.min(3200, chars + 300))
}

const asRow = (x) => (Array.isArray(x) ? x.filter(v => typeof v === 'string' || typeof v === 'number').map(tidy).filter(Boolean) : [])

/** Reads a reply into rows of wrong answers, one row per question in order. Copes with a code fence, text around the
 *  array, a single flat list, and a reply cut off part-way (the complete rows are kept). Garbage gives []. */
export function parseDistractorReply(text) {
  const body = String(text == null ? '' : text).replace(/```(?:json)?/gi, '')
  const start = body.indexOf('['), end = body.lastIndexOf(']')
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(body.slice(start, end + 1))
      if (Array.isArray(parsed)) {
        if (parsed.length && parsed.every(v => typeof v === 'string')) return [asRow(parsed)]
        return parsed.map(asRow)
      }
    } catch { /* fall through: pick out the rows that are whole */ }
  }
  const rows = []
  for (const m of body.matchAll(/\[\s*"(?:[^"\\]|\\.)*"(?:\s*,\s*"(?:[^"\\]|\\.)*")*\s*\]/g)) {
    try { rows.push(asRow(JSON.parse(m[0]))) } catch { /* a row that will not parse is skipped */ }
  }
  return rows
}

// ── Planning and running the top-up ────────────────────────────────────────────────────────────────

/**
 * Which questions to ask the AI about next: nothing while the next `watermark` unanswered multiple-choice questions
 * (the one on screen included) are all covered; otherwise the next `maxItems` that still need it, in order, within a
 * character budget. `status[position]` is 'done', or the number of tries already spent. Returns positions in `questions`.
 */
export function planBatch(questions, current, status = {}, { watermark = WATERMARK, maxItems = BATCH_SIZE, maxChars = BATCH_CHARS } = {}) {
  const list = questions || []
  const upcoming = []
  for (let i = Math.max(0, current); i < list.length; i++) {
    const q = list[i]
    if (q && q.type === 'mc' && q.checked == null) upcoming.push(i)
  }
  const wanted = (i) => {
    const s = status[i]
    if (s === 'done' || (typeof s === 'number' && s >= MAX_TRIES)) return false
    const a = tidy(list[i].card && list[i].card.a)
    return !!a && a.length <= MAX_ANSWER_CHARS
  }
  if (!upcoming.slice(0, watermark).some(wanted)) return []
  const picked = []
  let chars = 0
  for (const i of upcoming) {
    if (!wanted(i)) continue
    const len = tidy(list[i].card.a).length
    if (picked.length && chars + len > maxChars) break
    picked.push(i)
    chars += len
    if (picked.length >= maxItems) break
  }
  return picked
}

/**
 * The background top-up for one quiz. Nothing in it can break the quiz: every failure just leaves real-answer options.
 *   getQuestions()   the current list of { type, card, checked }
 *   getCurrent()     the position of the question on screen
 *   fetchBatch(items) async -> { rows } or { error, retryable }   (items are [{ q, a }])
 *   onUpgrade(fresh) { [position]: options } for questions the student has not reached
 *   onComplete(found) { [cardKey]: three wrong answers } once EVERY multiple-choice question has AI options (for the cache)
 * kick() starts (or nudges) the loop and resolves when it has gone quiet; call it whenever the question changes.
 */
export function createDistractorTopUp({
  getQuestions, getCurrent, fetchBatch, onUpgrade, onComplete,
  status = {}, hadCache = false, limits,
  maxCalls = MAX_AI_CALLS, maxFailures = MAX_FAILURES, retryDelay = 2500,
  wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)), rand = Math.random,
}) {
  const state = { stopped: false, calls: 0, fails: 0, again: false, saved: false }
  const found = {}
  let running = null

  function maybeComplete(questions) {
    if (hadCache || state.saved || !onComplete || !Object.keys(found).length) return
    if (!questions.length || !questions.every((q, i) => !q || q.type !== 'mc' || status[i] === 'done')) return
    state.saved = true
    onComplete({ ...found })
  }

  async function loop() {
    while (!state.stopped) {
      const questions = getQuestions()
      const batch = planBatch(questions, getCurrent(), status, limits)
      if (!batch.length) { maybeComplete(questions); return }
      if (state.calls >= maxCalls) { state.stopped = true; return }
      if (state.fails > 0) { await wait(retryDelay); if (state.stopped) return }
      state.calls += 1
      let reply
      try { reply = await fetchBatch(batch.map(i => ({ q: questions[i].card.q, a: questions[i].card.a }))) }
      catch { reply = { error: 'request failed', retryable: true } }
      if (state.stopped) return
      const rows = reply && !reply.error && Array.isArray(reply.rows) ? reply.rows : null
      if (!rows && reply && reply.retryable === false) { state.stopped = true; return }       // e.g. today's allowance is used up: asking again cannot help
      const now = getQuestions()
      const current = getCurrent()
      const fresh = {}
      let got = 0
      batch.forEach((pos, k) => {
        const card = questions[pos].card
        const wrongs = cleanProposed(card.a, rows && rows[k])
        if (wrongs.length >= 3) {
          got += 1
          status[pos] = 'done'
          found[cardKey(card)] = wrongs
          if (pos > current && now[pos] && now[pos].checked == null) fresh[pos] = buildOptions(card, wrongs, rand)     // only a question not yet reached
        } else {
          status[pos] = (typeof status[pos] === 'number' ? status[pos] : 0) + 1
        }
      })
      if (Object.keys(fresh).length) onUpgrade(fresh)
      if (got) state.fails = 0
      else if (++state.fails >= maxFailures) { state.stopped = true; return }
    }
  }

  function kick() {
    if (state.stopped) return running || Promise.resolve()
    if (running) { state.again = true; return running }
    running = (async () => {
      try {
        do { state.again = false; await loop() } while (state.again && !state.stopped)
      } catch { /* the quiz already has its options; nothing in here may break it */ }
      finally { running = null }
    })()
    return running
  }

  return {
    kick,
    stop() { state.stopped = true },
    stats: () => ({ calls: state.calls, fails: state.fails, stopped: state.stopped, found: Object.keys(found).length }),
  }
}
