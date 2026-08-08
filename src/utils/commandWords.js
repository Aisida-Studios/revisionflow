// src/utils/commandWords.js
// Command-word coaching used by the Answer Marker (inline hint) and the post-mark
// "next action" suggestion. The word list mirrors the BOARD_CFG.cmds vocabulary already
// used in generatePredictedQuestions (utils/ai.js) — State, Give, Identify, Describe,
// Outline, Explain, Analyse, Evaluate, Discuss, Assess, To what extent, Essay — so
// detection lines up with what this app's own question generator actually produces.
// Definitions here are general UK exam-technique guidance in our own words, not
// verbatim board wording — boards phrase their own glossaries slightly differently.

export const COMMAND_WORDS = [
  { word: 'To what extent', meaning: 'Weigh up evidence for and against, then give a judgement on how far something is true.', technique: 'Do not just say "a lot" or "a little" — show the evidence on both sides before you conclude.' },
  { word: 'Identify', meaning: 'Name or pick out the correct fact, feature, or trend from what is given.', technique: 'Point to the specific thing asked for — no explanation needed.' },
  { word: 'Describe', meaning: 'Set out the relevant details of what something is or what happens, without needing to explain why.', technique: 'Stick to what you can observe or recall — save the "why" for an explain question.' },
  { word: 'Outline', meaning: 'Give the main points briefly — a summary, not full detail.', technique: 'Keep each point to a single line. Depth belongs in an explain or discuss question.' },
  { word: 'Explain', meaning: 'Give reasons, or say how or why something happens.', technique: 'Every point should connect to a "because" — link the cause to its effect.' },
  { word: 'Analyse', meaning: 'Break something down into its parts and show how they relate to or affect each other.', technique: 'Go beyond describing — show the connections between the parts.' },
  { word: 'Evaluate', meaning: 'Weigh up strengths, weaknesses, or evidence on both sides, then reach a justified overall judgement.', technique: 'Always finish with a clear judgement that answers the question — do not just list points.' },
  { word: 'Discuss', meaning: 'Consider more than one side of an issue or factor, in a balanced way, before concluding.', technique: 'Cover at least two viewpoints before giving your own reasoned conclusion.' },
  { word: 'Assess', meaning: 'Weigh up the importance, success, or extent of something to reach a supported conclusion.', technique: 'Similar to evaluate — consider more than one factor before you judge.' },
  { word: 'Essay', meaning: 'A full extended-response question — plan a structured argument with a clear line of reasoning and a conclusion.', technique: 'Spend a minute planning your structure before you start writing.' },
  { word: 'State', meaning: 'Give a short, precise fact or definition with no explanation needed.', technique: 'One sentence is usually enough — do not explain why.' },
  { word: 'Give', meaning: 'Provide a specific example, reason, or fact — brief and direct.', technique: 'Answer with the exact thing asked for, nothing more.' },
]

// Longest word/phrase first so "To what extent" is checked before any word it contains.
const SORTED = [...COMMAND_WORDS].sort((a, b) => b.word.length - a.word.length)

export function detectCommandWord(questionText) {
  if (!questionText) return null
  const text = questionText.toLowerCase()
  for (const entry of SORTED) {
    const escaped = entry.word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp('\\b' + escaped + '\\b', 'i').test(text)) return entry
  }
  return null
}

// attempts: [{ commandWord, pct }] — pct is 0-100. Groups by command word, averages pct,
// and returns the weakest one if it is below threshold. Pure aggregation, no AI call.
export function analyzeCommandWordWeakness(attempts, threshold = 65) {
  if (!attempts || !attempts.length) return null
  const withWord = attempts.filter(a => a.commandWord && typeof a.pct === 'number')
  if (!withWord.length) return null

  const bySkill = {}
  for (const a of withWord) {
    const key = a.commandWord
    if (!bySkill[key]) bySkill[key] = { commandWord: key, total: 0, count: 0 }
    bySkill[key].total += a.pct
    bySkill[key].count += 1
  }

  const ranked = Object.values(bySkill)
    .map(s => ({ commandWord: s.commandWord, avgPct: Math.round(s.total / s.count), count: s.count }))
    .sort((a, b) => a.avgPct - b.avgPct)

  const weakest = ranked[0]
  if (!weakest || weakest.avgPct >= threshold) return null
  return weakest
}
