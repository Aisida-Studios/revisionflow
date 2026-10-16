// src/utils/ai.js
// All AI calls go through /api/tutor (netlify/functions/tutor.js).
// The Mistral API key is server-side only: MISTRAL_API_KEY in Netlify env vars.
// Never use VITE_MISTRAL_API_KEY — the key must never be in the browser bundle.
import { recordActivityStreak } from './firestore'
import { auth, getAppCheckHeader } from '../firebase'
import { daysUntilExam } from './examUtils'

const AI_ENDPOINT = '/api/tutor'

// tutor.js now aborts the Mistral request itself at 45s and returns a clean JSON 504 — see
// AI_REQUEST_TIMEOUT in that file. This is a few seconds above that, so the normal case is the
// browser receiving the server's own controlled 504 well before this ever fires. It exists purely
// as a safety net for the rare case where even that response doesn't arrive in time.
const AI_TIMEOUT_MS = 49000

// ── Auth header helper ─────────────────────────────────────────────────────────
// tutor.js now verifies a Firebase ID token server-side and derives uid from it —
// it no longer trusts a client-supplied uid field. getIdToken() returns Firebase's
// cached token and transparently refreshes it in the background when it's close to
// expiring, so this is cheap to call on every request. Returns null if nobody's
// signed in, which callers below turn into a "please sign in" message before ever
// touching the network.
async function authedHeaders() {
  if (!auth.currentUser) return null
  const idToken = await auth.currentUser.getIdToken()
  const appCheckHeader = await getAppCheckHeader()
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken, ...appCheckHeader }
}

const SYSTEM = `You are RevisionFlow's AI tutor — an expert on UK GCSE, AS-Level and A-Level revision.
AS-Level is a standalone one-year qualification, separate from A-Level (not the first year of it) —
keep their content, depth and grading scale (A-E for AS-Level, A*-E for A-Level) distinct whenever a
student's qualification is given as one or the other.
You give specific, practical, encouraging advice tailored to UK students.
Be concise but thorough. Use bullet points where helpful. Focus on actionable recommendations.
Always reference specific free resources where relevant:
- Maths: Dr Frost Maths, 1stclassmaths, Corbettmaths, PMT, Addvancemaths (Further Maths)
- Sciences: Cognito, PMT, SaveMyExams, Primrose Kitten
- Computer Science: Craig 'n' Dave, CS GCSE Guru, Seneca
- English: Mr Bruff, SaveMyExams
- Geography: Internet Geography, PMT
- Business: Tutor2u
- Languages: Seneca, Herr Antrim (German)
- All subjects: Seneca, PMT, SaveMyExams`

// ── Core call function ─────────────────────────────────────────────────────────
// uid is used locally only, to record the activity streak below — it is no longer sent
// to the server. tutor.js now derives uid itself from the verified auth token attached
// by authedHeaders() above, so a caller can't influence whose account is charged.
export async function callAI(prompt, systemPrompt = SYSTEM, maxTokens = 2000, uid = null, feature = null) {
  const headers = await authedHeaders()
  if (!headers) return { error: 'Please sign in to use AI features.' }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS) // safety net — see AI_TIMEOUT_MS above
  try {
    const res = await fetch(AI_ENDPOINT, {
      method:  'POST',
      headers,
      signal:  controller.signal,
      body: JSON.stringify({
        messages:     [{ role: 'user', content: prompt }],
        systemPrompt: systemPrompt || SYSTEM,
        maxTokens,
        feature,
      }),
    })
    clearTimeout(timeoutId)

    // tutor.js always returns application/json, on every path, including its own error
    // handling — so a non-JSON body here means the platform intervened before that code
    // ever ran. In practice this is almost always the function being cut off mid-request
    // on a big completion, and calling res.json() on it throws an opaque "Unexpected
    // token '<'" (it's Netlify's own HTML error page). Catch it here with a message that
    // actually says what happened.
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return { error: `Server returned a non-JSON response (HTTP ${res.status}) — most likely the request ran too long and the function was cut off before finishing.` }
    }

    const data = await res.json()

    if (!res.ok) {
      // 429 = daily allowance used up for this feature
      if (res.status === 429) {
        return { error: data.error || "You've used today's AI help. More opens up tomorrow." }
      }
      return { error: data.error || `AI request failed (${res.status}). Please try again.` }
    }

    if (!data.text) return { error: 'AI returned an empty response. Please try again.' }
    // Record streak for any successful AI interaction
    if (uid) recordActivityStreak(uid).catch(() => {})
    return { text: data.text, provider: 'mistral', remaining: data.remaining }
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      console.error('[AI] Request timed out')
      return { error: 'AI request timed out. Please try again.' }
    }
    console.error('[AI] Network error:', e)
    return { error: 'Could not reach the AI service. Check your internet connection.' }
  }
}

// ── Vision variant — same contract, error handling, and timeout as callAI above,
// just also sends imageBase64 through to tutor.js. Kept as a separate function rather
// than adding an optional param to callAI so none of its ~15 existing text-only callers
// need to change, and so it's obvious at a glance which calls actually send an image. ──
export async function callAIWithImage(prompt, imageBase64, systemPrompt = SYSTEM, maxTokens = 2000, uid = null) {
  const headers = await authedHeaders()
  if (!headers) return { error: 'Please sign in to use AI features.' }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  try {
    const res = await fetch(AI_ENDPOINT, {
      method:  'POST',
      headers,
      signal:  controller.signal,
      body: JSON.stringify({
        messages:     [{ role: 'user', content: prompt }],
        systemPrompt: systemPrompt || SYSTEM,
        maxTokens,
        imageBase64,
      }),
    })
    clearTimeout(timeoutId)

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return { error: `Server returned a non-JSON response (HTTP ${res.status}) — most likely the request ran too long and the function was cut off before finishing.` }
    }

    const data = await res.json()

    if (!res.ok) {
      if (res.status === 429) {
        return { error: data.error || "You've used today's AI help. More opens up tomorrow." }
      }
      return { error: data.error || `AI request failed (${res.status}). Please try again.` }
    }

    if (!data.text) return { error: 'AI returned an empty response. Please try again.' }
    if (uid) recordActivityStreak(uid).catch(() => {})
    return { text: data.text, provider: 'mistral', remaining: data.remaining }
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      console.error('[AI] Image request timed out')
      return { error: 'AI request timed out. Please try again.' }
    }
    console.error('[AI] Network error:', e)
    return { error: 'Could not reach the AI service. Check your internet connection.' }
  }
}

// Turns a photo into text — either a printed/handwritten question (transcribed exactly,
// for feeding into the maths solver or answer marker) or a handwritten essay (transcribed
// with an explicit best-effort guess at unclear handwriting, per the brief — messy essays
// still get a full transcription with [unclear] markers rather than gaps).
export async function extractTextFromImage(imageBase64, kind, uid) {
  const isEssay = kind === 'essay'
  const sys = isEssay
    ? `You transcribe handwritten student essays from photos. Handwriting is often messy — make your best educated guess at unclear words from context rather than leaving them out. If a word is genuinely illegible, write [unclear] in its place rather than guessing wildly. Return ONLY the transcribed text, no commentary, no "Here's the transcription:" preamble.`
    : `You transcribe exam questions or maths problems from photos, printed or handwritten. Transcribe exactly what is written, preserving numbers, symbols, and structure precisely. Use plain text for any maths notation (x^2, not LaTeX, no dollar signs). Return ONLY the transcribed text, no commentary.`
  const prompt = isEssay
    ? 'Transcribe the handwritten essay in this image as accurately as possible.'
    : 'Transcribe the question or problem shown in this image exactly.'
  return callAIWithImage(prompt, imageBase64, sys, 1500, uid)
}
export async function callAIChat(messages, systemPrompt = SYSTEM, uid = null, feature = null, maxTokens = 2000) {
  const headers = await authedHeaders()
  if (!headers) return { error: 'Please sign in to use AI features.' }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  try {
    const res = await fetch(AI_ENDPOINT, {
      method:  'POST',
      headers,
      signal:  controller.signal,
      body: JSON.stringify({ messages, systemPrompt, feature, maxTokens }),
    })
    clearTimeout(timeoutId)

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return { error: `Server returned a non-JSON response (HTTP ${res.status}) — most likely the request ran too long and the function was cut off before finishing.` }
    }

    const data = await res.json()
    if (!res.ok) {
      if (res.status === 429) {
        return { error: data.error || "You've used today's AI help. More opens up tomorrow." }
      }
      return { error: data.error || `AI request failed (${res.status}). Please try again.` }
    }
    if (!data.text) return { error: 'AI returned an empty response. Please try again.' }
    return { text: data.text, provider: 'mistral', remaining: data.remaining }
  } catch (e) {
    clearTimeout(timeoutId)
    if (e.name === 'AbortError') {
      console.error('[AI] Chat request timed out')
      return { error: 'AI request timed out. Please try again.' }
    }
    console.error('[AI] Network error:', e)
    return { error: 'Could not reach the AI service. Check your internet connection.' }
  }
}

// ── Exported AI functions ──────────────────────────────────────────────────────

export async function generateStudyPlan(userData, uid, isPro) {
  const { subjects, examDates, weakTopics, availableHours, preferences, weeksUntilFirst, firstExamDate, lastExamDate } = userData
  const weeks = weeksUntilFirst || 12
  const windowDesc = firstExamDate && lastExamDate
    ? `from now until ${lastExamDate} (first exam: ${firstExamDate}, approximately ${weeks} weeks away)`
    : `approximately ${weeks} weeks`

  const detailConstraint = isPro
    ? `- Give a week-by-week breakdown for the ENTIRE plan, not just the final weeks — one short paragraph per week`
    : `- Keep each week's entry concise — one paragraph per phase, not per week`

  const formatSection = isPro
    ? `1. Subject priority order and reasoning (bullet list)
2. Phase 1 — Foundation (week-by-week breakdown)
3. Phase 2 — Intensive revision (week-by-week breakdown, more past papers)
4. Phase 3 — Final push (week-by-week, exam-specific focus)
5. Resources per subject (concise list)
6. 3 practical motivation tips`
    : `1. Subject priority order and reasoning (bullet list)
2. Phase 1 — Foundation (what to do, which subjects, ratio)
3. Phase 2 — Intensive revision (shift in focus, more past papers)
4. Phase 3 — Final push (exam-specific focus, week by week for last 3 weeks only)
5. Resources per subject (concise list)
6. 3 practical motivation tips`

  const wordCap = isPro ? 1400 : 600

  const prompt = `Generate a personalised GCSE/A-Level revision study plan for a student.

STUDENT DETAILS:
Subjects: ${subjects?.map(s => `${s.name} (${s.board}, current: ${s.currentGrade || '?'}, target: ${s.targetGrade || 9})`).join(', ')}
Exam period: ${windowDesc}
Upcoming exams: ${(examDates || []).map(e => ({ ...e, daysLeft: daysUntilExam(e.examDate) })).filter(e => e.daysLeft != null && e.daysLeft >= 0).sort((a,b) => a.daysLeft - b.daysLeft).slice(0,12).map(e => `${e.subject} P${e.paper} on ${e.examDate}`).join(', ') || 'Not specified'}
Available hours per week: ${availableHours || 10}
Focus preference: ${preferences || 'Balanced content and exam practice'}

IMPORTANT CONSTRAINTS:
- The plan must cover EXACTLY ${weeks} weeks — no more
- Structure into 3 clear phases: Foundation (weeks 1-${Math.floor(weeks*0.4)}), Intensive (weeks ${Math.floor(weeks*0.4)+1}-${Math.floor(weeks*0.8)}), Final push (weeks ${Math.floor(weeks*0.8)+1}-${weeks})
- In the final 2 weeks before each exam, prioritise that specific subject heavily
${detailConstraint}

FORMAT:
${formatSection}

Keep the total response under ${wordCap} words. Be specific and actionable.`
  return callAI(prompt, SYSTEM, isPro ? 4500 : 2200, uid)
}

export async function getTopicAdvice(subject, topic, confidence, mistakes, uid) {
  // An unrated topic (null/0) must not be described as a middle rating — say it is unrated.
  const confLabel = confidence > 0
    ? (['','Very weak — needs urgent attention','Weak — gaps in understanding','Building — some understanding but not secure','Strong — mostly secure','Mastered — confident'][confidence] || 'Not rated yet')
    : 'Not rated yet — the student has not rated this topic, so do not assume a level'
  const prompt = `You are an expert GCSE/A-Level tutor. A student is revising the topic "${topic}" within ${subject}. Their current confidence is: ${confLabel}.

Give a focused, exam-targeted response with these sections:

**Why students struggle with "${topic}"**
1-2 sentences on the most common misconceptions or hardest parts. Be specific to this exact topic.

**What you must know for the exam**
4-6 bullet points of the essential knowledge/skills for "${topic}". Use exact terminology the examiner expects.

**Best way to revise this specific topic**
One concrete, actionable technique tailored to the nature of this content.

**Exam technique tip**
One specific, actionable tip on how marks are awarded for "${topic}".

**Free resources**
2 specific free resources. Format exactly as: [Name](URL) — one line of what it covers.

Keep under 280 words total. Everything must be specific to "${topic}".
Recent mistakes to address: ${mistakes?.join(', ') || 'none logged'}`
  return callAI(prompt, SYSTEM, 1800, uid)
}

export async function analyseWeaknesses(paperAttempts, subject, uid) {
  const recent = paperAttempts?.slice(0, 8) || []
  const prompt = `Analyse this student's past paper performance:
Subject: ${subject || 'All subjects'}
Recent attempts: ${JSON.stringify(recent.map(a => ({ subject: a.subject, paper: a.paper, year: a.year, score: a.score, maxMarks: a.maxMarks, percentage: a.percentage, grade: a.grade })))}

Provide:
1. Pattern analysis — which topics/question types are consistently weak
2. Priority topics to revise this week (ranked by urgency)
3. Specific free resources for each weak area
4. Whether to focus more on content revision or exam technique
5. Realistic grade trajectory based on recent scores`
  return callAI(prompt, SYSTEM, 3000, uid)
}

export async function getResourceRecommendations(subject, board, tier, weakTopics, qualification, uid) {
  const prompt = `Recommend the best FREE revision resources for:
Subject: ${subject} (${qualification || 'GCSE'}, ${board || 'AQA'}${tier && tier !== 'N/A' ? ', ' + tier : ''})
Weak topics: ${weakTopics?.join(', ') || 'General revision'}

For each resource:
- Name and URL
- What it's best for
- How to use it effectively
- Recommended time per week

Only include genuinely free resources, and only ones that actually cover ${qualification || 'GCSE'} content for this subject (not just GCSE, if the student is past GCSE). Include at least 5.`
  return callAI(prompt, SYSTEM, 3000, uid)
}

export async function generateCalendarPlan(userData, uid) {
  const prompt = `Generate a revision calendar plan for a student:
Subjects: ${userData.subjects?.map(s => `${s.name} (${s.board}, target: ${s.targetGrade || 9})`).join(', ')}
Available days: ${userData.availableDays?.join(', ')}
Session times: ${JSON.stringify(userData.startTimes)}
End time: ${userData.endTime}
Content:exam ratio: ${userData.ratio || '2:1'}
Weeks until exams: ${userData.weeksUntilExams}

Generate a week-by-week plan showing subject priority, session types, and key milestones.
Be specific about which papers and topics to cover each week.`
  return callAI(prompt, SYSTEM, 4000, uid)
}

export async function getDailyAdvice(uid, todaysSessions, streak, recentMistakes) {
  const prompt = `Give a student their personalised daily revision briefing:
Today's sessions: ${todaysSessions?.map(s => `${s.subject} (${s.type})`).join(', ') || 'None scheduled'}
Current streak: ${streak} days
Recent mistakes: ${recentMistakes?.slice(0,3).map(m => `${m.subject}: ${m.topic}`).join(', ') || 'None'}

Give:
1. One motivational sentence (specific to their streak/progress)
2. Today's focus tip (specific to their sessions)
3. One quick win they can get today
4. A reminder about their most urgent weak area

Keep it short, punchy, and encouraging. Max 150 words total.`
  return callAI(prompt, SYSTEM, 1024, uid)
}

export async function chatWithAI(messages, userContext, uid) {
  const contextStr = userContext?.subjects?.length
    ? `Student context: studying ${userContext.subjects.map(s => s.name).join(', ')}.`
    : ''
  const systemWithContext = contextStr ? `${SYSTEM}\n\n${contextStr}` : SYSTEM
  return callAIChat(messages.slice(-10), systemWithContext, uid, 'advisorChat', 2000)
}

export const AI_MARKING_DISCLAIMER = 'AI marking estimate — not official examiner marking. Compare with your teacher\'s or the board\'s published mark scheme.'

/**
 * AI marking estimate.
 * Contract (all required unless marked optional):
 *   question, studentAnswer, markScheme, marksAvailable, board, qualification,
 *   subject, topic (optional), markSchemeProvenance (optional, e.g. 'student-supplied')
 * Returns the callAI result ({ text } | { error }) with `disclaimer` attached.
 */
export async function markAnswer(input, uid) {
  const {
    question, studentAnswer, markScheme, marksAvailable, board, qualification,
    subject, topic = null, markSchemeProvenance = 'student-supplied',
  } = input || {}
  const marks = Number(marksAvailable)
  const missing = []
  if (!String(question || '').trim()) missing.push('question')
  if (!String(studentAnswer || '').trim()) missing.push('student answer')
  if (!String(markScheme || '').trim()) missing.push('mark scheme')
  if (!Number.isFinite(marks) || marks < 1) missing.push('marks available')
  if (!String(board || '').trim()) missing.push('exam board')
  if (!String(qualification || '').trim()) missing.push('qualification')
  if (!String(subject || '').trim()) missing.push('subject')
  if (missing.length) return { error: 'Missing required marking input: ' + missing.join(', ') }

  const isLevelBased = marks >= 6
  const isMaths = subject === 'Mathematics' || subject === 'Further Mathematics'

  const markerSystem = `You are an AI marking assistant producing a marking ESTIMATE for ${board} ${qualification} ${subject}. You are not an examiner and your output is not official marking.

RULES:
1. Mark ONLY against the mark scheme supplied by the student. Do not invent mark scheme points that are not in it or clearly implied by it.
2. Never award marks for vague or generic statements. Every mark needs a specific, creditable point.
3. Do not award implied points unless the supplied mark scheme says implied references are accepted.
4. For level-based questions read the whole answer before choosing a level; do not upgrade for one good sentence.
5. Be conservative: AI markers tend to over-mark. Maximum available is ${marks}; never exceed it.
6. Quote the student's own words when awarding or denying marks.
7. If the mark scheme is too thin to mark confidently, say so rather than guessing.`

  const prompt = `QUALIFICATION: ${board} ${qualification} ${subject}${topic ? `\nTOPIC: ${topic}` : ''}
MARKS AVAILABLE: ${marks}
${isLevelBased ? 'MARKING TYPE: Level-based (holistic)' : `MARKING TYPE: Point-mark (maximum ${marks})`}
MARK SCHEME PROVENANCE: ${markSchemeProvenance}

QUESTION:
${String(question).trim()}

MARK SCHEME (use only this):
${String(markScheme).trim()}

STUDENT'S ANSWER (mark exactly what is written):
${String(studentAnswer).trim()}

---

Use EXACTLY this format:

AWARDED MARKS: [X]/${marks}
${isLevelBased ? 'LEVEL: [level and mark range]' : ''}

CREDITED POINTS:
[Points credited, quoting the student's words. If none, write "None — no creditable content identified."]

POINTS NOT CREDITED:
[Mark scheme points not adequately addressed]

ANNOTATION:
[2-3 quoted sentences from the answer, each with why it does or does not gain marks]

${isMaths
  ? `MARK BREAKDOWN:\n- Method marks (M): [X]\n- Accuracy marks (A): [X]\n- B marks (B): [X]`
  : `AO BREAKDOWN:\n- AO1: [X]/[available]\n- AO2: [X]/[available]\n- AO3: [X]/[available] (omit any AO not relevant to this question)`}

GRADE BOUNDARY CONTEXT:
[Only state what this raw mark might indicate if you are confident; otherwise write "Not enough information to estimate a grade."]

TO REACH THE NEXT MARK BAND:
1. [Specific improvement tied to the mark scheme]
2. [Second improvement]
3. [Third improvement]

EXAMINER NOTE: [One sentence of feedback. Begin with "AI estimate:".]`

  const res = await callAI(prompt, markerSystem, 4000, uid, 'markAnswer')
  return { ...res, disclaimer: AI_MARKING_DISCLAIMER }
}


export async function generateFlashcards(subject, topic, count, uid, maxTokens = null, focusHint = '') {
  count = count || 8
  // Scale the budget to how many cards were actually requested rather than a flat ceiling — the
  // format this prompt enforces is a 1-3 sentence answer per card, so ~100 tokens/card plus a flat
  // 200-token buffer for the surrounding structure comfortably covers it without over-asking on a
  // small request. An explicit maxTokens (e.g. AdminAutoGenerate.jsx's own adaptive-retry budget)
  // still overrides this.
  const tokenBudget = maxTokens || Math.min(4000, Math.max(700, count * 100 + 200))
  var topicPart = topic ? ', topic: ' + topic : ''
  var prompt = [
    'Generate exactly ' + count + ' revision flashcards for: ' + subject + topicPart + '.',
    focusHint ? focusHint : '',
    '',
    'STRICT FORMAT RULES:',
    '- Begin your response immediately with Q: (no introduction)',
    '- Use this exact format for every card:',
    'Q: [question text]',
    'A: [answer text]',
    '- Separate cards with one blank line',
    '- No numbering, no bullet points, no markdown, no bold, no asterisks',
    '- Answers: 1-3 sentences, include key terms and facts',
    '- Questions: specific and exam-focused',
    '',
    'Example:',
    'Q: What is the formula for calculating speed?',
    'A: Speed = Distance divided by Time. The standard unit is metres per second (m/s).',
    '',
    'Q: Define osmosis.',
    'A: Osmosis is the movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane.',
    '',
    'Now generate exactly ' + count + ' flashcards for ' + subject + (topic ? ' (' + topic + ')' : '') + ':',
  ].join('\n')
  return callAI(prompt, SYSTEM, tokenBudget, uid)
}

// Large flashcard requests are produced in chunks. One call for 30-50 cards needs more output than a
// single response allows, so it came back cut off mid-card. Each chunk is a separate request that is
// told which questions already exist (so the set does not repeat itself); chunks are merged into the
// same "Q: ... A: ..." text the rest of the app parses, with duplicate questions dropped.
// Resolves to the usual { text } / { error } shape, plus { requested, produced, partial }.
// If a later chunk fails the cards already produced are returned with partial: true.
export async function generateFlashcardsChunked(subject, topic, count, uid, { chunkSize = 15, focusHint = '', onProgress = null } = {}) {
  count = count || 8
  if (count <= chunkSize) {
    const res = await generateFlashcards(subject, topic, count, uid, null, focusHint)
    return res.error ? res : { ...res, requested: count, produced: parseFlashcards(res.text).length, partial: false }
  }
  const norm = (q) => q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const toQA = (list) => list.map(c => 'Q: ' + c.q + '\nA: ' + c.a).join('\n\n')
  const cards = []
  const seen = new Set()
  const maxRequests = Math.ceil(count / chunkSize) + 2 // a little slack for chunks that return fewer or repeat
  for (let request = 0; request < maxRequests && cards.length < count; request++) {
    const want = Math.min(chunkSize, count - cards.length)
    const already = cards.slice(-30).map(c => c.q).join(' | ')
    const hint = [focusHint, already ? 'Cover DIFFERENT ground from these questions that are already written (do not repeat or reword them): ' + already : ''].filter(Boolean).join('\n')
    const res = await generateFlashcards(subject, topic, want, uid, null, hint)
    if (res.error) {
      if (!cards.length) return res
      return { text: toQA(cards), requested: count, produced: cards.length, partial: true, warning: res.error }
    }
    let added = 0
    for (const c of parseFlashcards(res.text)) {
      const key = norm(c.q)
      if (!key || seen.has(key)) continue
      seen.add(key); cards.push(c); added++
      if (cards.length >= count) break
    }
    if (onProgress) onProgress(cards.length, count)
    if (!added) break // the model is only repeating itself - stop rather than spend more requests
  }
  return { text: toQA(cards), requested: count, produced: cards.length, partial: cards.length < count }
}

export async function generatePredictedQuestions(subject, board, level, topic, totalMarks, numQuestions, uid) {
  const n     = Number(numQuestions) || 3
  const total = Number(totalMarks)   || n * 6

  // Board-specific mark value lists and command words
  const BOARD_CFG = {
    AQA: {
      GCSE:   { marks:[1,2,3,4,5,6],    cmds:{1:'State',2:'Describe',3:'Explain',4:'Explain',5:'Explain',6:'Evaluate/Discuss'}, scheme:'Point-mark: 1 mark per valid distinct point. For 6-mark questions use level-based marking (Level 1: 1-2, Level 2: 3-4, Level 3: 5-6).', style:'Questions are concise. 1-2 mark questions test recall. 4-6 mark questions require developed explanation or evaluation with examples. Avoid compound questions for lower marks.' },
      ALevel: { marks:[2,3,4,5,6,9,12,15,20], cmds:{2:'State/Give',3:'Outline',4:'Explain',5:'Explain',6:'Analyse',9:'Evaluate',12:'Evaluate',15:'Discuss/Assess',20:'Essay'}, scheme:'Level-based for 6+ marks: L1 basic/limited (bottom third), L2 some development (middle), L3 clear/coherent (top third). Indicative content lists creditworthy points — not exhaustive. AO1/AO2/AO3 split specified.', style:'Stimulus material used for higher mark questions. Precise technical language. Questions often include "with reference to" or "using examples".' },
    },
    Edexcel: {
      GCSE:   { marks:[1,2,3,4,5,6,8],  cmds:{1:'State',2:'Describe',3:'Explain',4:'Explain',5:'Explain',6:'Evaluate',8:'Evaluate'}, scheme:'Point mark: each bullet = 1 mark. Mark scheme lists specific answer points; alternatives in brackets. Do NOT accept vague or generic answers.', style:'Often uses structured stems like "Use the data to..." or "Give one reason...". Scaffolded sub-parts (a)(b)(c) common.' },
      ALevel: { marks:[2,3,4,5,6,8,10,12,16,20], cmds:{2:'State',3:'Outline',4:'Explain',5:'Explain',6:'Assess',8:'Evaluate',10:'Evaluate',12:'Evaluate',16:'To what extent',20:'Essay'}, scheme:'Level-based for 6+ marks. 4 levels for 12+ marks, 3 levels for 6-10 marks. QWC assessed at 12+ marks.', style:'"To what extent" essays require a judgement. Data response questions include quantitative analysis requirement.' },
    },
    OCR: {
      GCSE:   { marks:[1,2,3,4,5,6],    cmds:{1:'State/Identify',2:'Describe',3:'Explain',4:'Explain',5:'Discuss',6:'Evaluate'}, scheme:'Point marking with accept alternatives. "OWTTE" (or words to that effect) used widely. Credit context-specific examples.', style:'Structured sub-parts (a)(i)(ii)(iii) common. Questions often provide a scenario or case study context.' },
      ALevel: { marks:[2,3,4,5,6,8,9,12,15], cmds:{2:'State',3:'Explain',4:'Explain',5:'Analyse',6:'Evaluate',8:'Discuss',9:'Evaluate',12:'Assess',15:'Essay'}, scheme:'Levels-based for 6+ marks. AO1/AO2/AO3 breakdown explicit per question. Indicative content NOT exhaustive.', style:'Assessment objective balance stated per question. Synoptic links rewarded in essays.' },
    },
    WJEC:   {
      GCSE:   { marks:[1,2,3,4,5,6],    cmds:{1:'State',2:'Describe',3:'Explain',4:'Explain',5:'Discuss',6:'Evaluate'}, scheme:'Point-mark 1-4 marks. Levels for 5-6 marks. Accept alternative wording.', style:'Bilingual structure (English/Welsh). Context-based questions with stimulus material.' },
      ALevel: { marks:[2,4,6,8,10,15,20], cmds:{2:'State',4:'Explain',6:'Analyse',8:'Evaluate',10:'Evaluate',15:'Discuss',20:'Essay'}, scheme:'Levels-based. AO1/AO2/AO3 specified. Synoptic questions at end of paper.', style:'Synoptic assessment links multiple topics. Extended prose required for high marks.' },
    },
    Eduqas: {
      GCSE:   { marks:[1,2,3,4,5,6],    cmds:{1:'State',2:'Describe',3:'Explain',4:'Explain',5:'Discuss',6:'Evaluate'}, scheme:'Point-mark lower marks. Levels 5-6. Accept alternatives.', style:'Similar to WJEC. Stimulus material used. Context specific.' },
      ALevel: { marks:[2,4,6,8,10,15,20], cmds:{2:'State',4:'Explain',6:'Analyse',8:'Evaluate',10:'Evaluate',15:'Discuss',20:'Essay'}, scheme:'Levels-based with AO breakdown.', style:'Extended writing required. Synoptic at end.' },
    },
    CCEA: {
      GCSE:   { marks:[1,2,3,4,5,6],    cmds:{1:'State',2:'Describe',3:'Explain',4:'Explain',5:'Discuss',6:'Evaluate'}, scheme:'Point-mark. Accept alternatives. Context relevant.', style:'Northern Ireland contexts used. Structured sub-parts.' },
      ALevel: { marks:[2,4,6,8,10,15,20], cmds:{2:'State',4:'Explain',6:'Analyse',8:'Evaluate',10:'Evaluate',15:'Discuss',20:'Essay'}, scheme:'Levels based. AO breakdown explicit.', style:'Extended prose. Case studies from NI contexts.' },
    },
  }

  const lvlKey = (level === 'A-Level' || level === 'AS-Level' || level === 'ALEVEL') ? 'ALevel' : 'GCSE'
  const cfg    = (BOARD_CFG[board] || BOARD_CFG.AQA)[lvlKey] || BOARD_CFG.AQA.GCSE

  // Distribute total marks across n questions using valid mark values
  function distributeMarks(tot, count, available) {
    const sorted = [...available].sort((a, b) => a - b)
    const result = []
    let rem = tot
    for (let i = 0; i < count; i++) {
      const target  = Math.round(rem / (count - i))
      const closest = sorted.reduce((a, b) => Math.abs(b - target) < Math.abs(a - target) ? b : a)
      result.push(closest)
      rem -= closest
    }
    return result
  }

  const markDist = distributeMarks(total, n, cfg.marks)
  const isMaths  = subject === 'Mathematics' || subject === 'Further Mathematics' || subject === 'Statistics'

  // Build the allocation description for the prompt
  const allocDesc = markDist.map((m, i) => {
    const cmd = cfg.cmds[m] || (m <= 2 ? 'State' : m <= 4 ? 'Explain' : 'Evaluate')
    return 'Q' + (i + 1) + ': ' + m + ' marks — command word: ' + cmd
  }).join('\n')

  const mathsExtra = isMaths
    ? '\n\nMATHS FORMATTING RULES:\n' +
      '- Write all mathematical expressions in plain text: e.g. "x^2 + 3x - 4 = 0", "sin(30°)", "√(16)", "3/4"\n' +
      '- Use * for multiplication: "3 * 4 = 12" or "3x"\n' +
      '- For fractions write: "a/b" or "(a+b)/(c+d)"\n' +
      '- NEVER use LaTeX (no \\frac, \\sqrt, no $ signs)\n' +
      '- For method marks: M1, A1, B1 on separate lines\n' +
      '- Include a worked answer in the mark scheme: show every step'
    : ''

  const specExtra = level === 'A-Level' || level === 'AS-Level'
    ? '- Reference A-Level specification content only — not GCSE level\n' +
      '- Questions should demand application and analysis, not just recall\n'
    : '- Questions should be appropriate for GCSE exam conditions\n' +
      '- Lower mark questions (1-2) test pure recall; higher (4-6) test understanding\n'

  const sysPrompt = 'You are a CHIEF EXAMINER for ' + board + ' ' + level + ' ' + subject + ' with 20 years of experience writing official exam papers. ' +
    'You have complete knowledge of the current ' + board + ' ' + level + ' ' + subject + ' specification. ' +
    'You write questions that are indistinguishable from real past paper questions. ' +
    'Every question must be spec-accurate, use the exact command words for the board, and include a fully worked mark scheme.'

  const prompt =
    'Write EXACTLY ' + n + ' exam question' + (n > 1 ? 's' : '') + ' for ' + board + ' ' + level + ' ' + subject + ' on the topic: "' + topic + '"\n\n' +

    'MARK ALLOCATION — follow EXACTLY:\n' + allocDesc + '\n' +
    'Total: ' + markDist.reduce((a, b) => a + b, 0) + ' marks\n\n' +

    'BOARD RULES FOR ' + board + ' ' + level + ':\n' +
    '- Style: ' + cfg.style + '\n' +
    '- Mark scheme format: ' + cfg.scheme + '\n' +
    specExtra +
    '- Every question MUST be specifically and exclusively about the topic: "' + topic + '"\n' +
    '- Do NOT include any question outside the ' + board + ' ' + level + ' ' + subject + ' specification\n' +
    '- Use the exact phrasing and command words used on real ' + board + ' papers\n' +
    mathsExtra + '\n\n' +

    'OUTPUT FORMAT — copy this structure exactly for each question:\n\n' +
    '---QUESTION 1--- [X marks]\n' +
    '[The question text here, written exactly as it would appear on the exam paper. Include any stimulus, figures, or data if appropriate for this mark value and command word.]\n\n' +
    'MARK SCHEME:\n' +
    '[Full mark scheme as it would appear in the official mark scheme booklet:\n' +
    '- For point-mark: bullet each creditworthy point. State max marks clearly.\n' +
    '- For level-based: give full level descriptors (L1/L2/L3) with mark ranges + indicative content bullets.\n' +
    '- For maths: show full worked solution with M/A/B marks on each line.]\n\n' +
    'EXAMINER TIP:\n' +
    '[Most common student mistake on this specific question. One sentence.]\n\n' +
    '---QUESTION 2--- [X marks]\n' +
    '[etc.]\n\n' +

    'CRITICAL REQUIREMENTS:\n' +
    '1. Output EXACTLY ' + n + ' question block' + (n > 1 ? 's' : '') + ' — no more, no fewer\n' +
    '2. Each block MUST start with ---QUESTION N--- on its own line\n' +
    '3. Each block MUST contain: question text, MARK SCHEME section, EXAMINER TIP section\n' +
    '4. Do NOT include any text before ---QUESTION 1--- or after the last EXAMINER TIP\n' +
    '5. Questions must read as genuine exam questions — not as AI-generated placeholders'

  return callAI(prompt, sysPrompt, 4500, uid)
}


export async function generateTopicNote({ subject, board, level, topic, uid, maxTokens = 4096 }) {
  const isALevel = level === 'A-Level' || level === 'AS-Level'

  const sys = 'You are a senior ' + board + ' examiner and ' + level + ' ' + subject + ' teacher with 15 years of experience. ' +
    'You have expert knowledge of the ' + board + ' ' + level + ' ' + subject + ' specification. ' +
    'CRITICAL: Only include content explicitly on the ' + board + ' ' + level + ' ' + subject + ' specification. ' +
    'Do NOT include content from other boards, other levels, or beyond the spec.'

  const eg = isALevel ? '3' : '2'

  // Two smaller sequential calls instead of one ~8K-token request. A lower max_tokens on a
  // single call doesn't reliably reduce generation TIME — it only cuts the response short at
  // roughly the same elapsed time, since the model generates at a fixed rate regardless of where
  // the ceiling sits. Actually asking for less content per call is what shortens it. Sequential
  // rather than parallel, so a batch of 5 items doesn't turn into 10 concurrent Mistral calls.
  const promptA = 'Create PART 1 of 2 of a complete specification-accurate revision guide. ' +
    'Do not include a title or introduction — start directly with the first heading below. Do not ' +
    'mention that this is part 1 of 2.\n\n' +
    'EXAM BOARD: ' + board + '\nLEVEL: ' + level + '\nSUBJECT: ' + subject + '\nTOPIC: ' + topic + '\n\n' +
    'CRITICAL: Every point must be directly from the ' + board + ' ' + level + ' ' + subject + ' specification only.\n\n' +
    '## Specification Coverage\n' +
    'Exactly what the ' + board + ' ' + level + ' ' + subject + ' spec says about this topic. List every sub-topic and skill required.\n\n' +
    '## Key Definitions\n' +
    'Every term the ' + board + ' spec requires for this topic. Format: **Term** — precise definition.\n\n' +
    '## Core Content\n' +
    'Complete content for every spec point. Include all required formulae, equations, case studies, events, vocabulary as appropriate to ' + subject + '.\n\n' +
    '## Explanation\n' +
    'Clear explanation of all concepts from first principles. Use numbered steps for processes. At least 300 words.\n\n' +
    'Use markdown. **Bold** all key terms. Be thorough and specification-accurate.'

  const promptB = 'Create PART 2 of 2 of the SAME revision guide — the exam-preparation half. ' +
    'Do not include a title, introduction, or repeat anything — start directly with the first heading below. Do not ' +
    'mention that this is part 2 of 2.\n\n' +
    'EXAM BOARD: ' + board + '\nLEVEL: ' + level + '\nSUBJECT: ' + subject + '\nTOPIC: ' + topic + '\n\n' +
    'CRITICAL: Every point must be directly from the ' + board + ' ' + level + ' ' + subject + ' specification only.\n\n' +
    '## Worked Examples\n' +
    eg + ' fully worked ' + board + ' ' + level + '-style examples with full working. Match real ' + board + ' past paper style and difficulty.\n\n' +
    '## Common Exam Mistakes\n' +
    '6 specific mistakes students make on ' + board + ' ' + level + ' ' + subject + ' questions on this topic, based on examiner reports.\n\n' +
    '## ' + board + ' Exam Technique\n' +
    '- Typical question styles for this topic in ' + board + ' ' + level + ' ' + subject + '\n' +
    '- Command words used and exactly what they require\n' +
    '- Typical mark allocations\n' +
    '- What the ' + board + ' mark scheme specifically rewards\n\n' +
    '## Exact Mark Scheme Phrases\n' +
    '8-10 verbatim-style phrases from ' + board + ' ' + level + ' ' + subject + ' mark schemes for this topic. Students should memorise these exactly.\n\n' +
    '## Specification Links\n' +
    '3-4 other ' + board + ' ' + level + ' ' + subject + ' spec topics that connect to this one, and how.\n\n' +
    '## Quick-Fire Recall\n' +
    '12 facts or definitions a student must state instantly in an exam. Numbered, one sentence each. Spec-required content only.\n\n' +
    'Use markdown. **Bold** all key terms. Be thorough and specification-accurate.'

  const resA = await callAI(promptA, sys, maxTokens, uid)
  if (resA.error) return resA
  const resB = await callAI(promptB, sys, maxTokens, uid)
  if (resB.error) return resB

  return { text: resA.text.trim() + '\n\n' + resB.text.trim(), provider: resB.provider, remaining: resB.remaining }
}


export async function getTopicNoteFromCache(board, level, subject, topic) {
  const { doc, getDoc } = await import('firebase/firestore')
  const { db } = await import('../firebase')
  const slug = slugify(board + '_' + level + '_' + subject + '_' + topic)
  try {
    const snap = await getDoc(doc(db, 'topicNotes', slug))
    if (snap.exists()) return { cached: true, ...snap.data() }
    return null
  } catch(e) { return null }
}

export async function saveTopicNoteToCache(board, level, subject, topic, text) {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const { db } = await import('../firebase')
  const slug = slugify(board + '_' + level + '_' + subject + '_' + topic)
  await setDoc(doc(db, 'topicNotes', slug), {
    board, level, subject, topic, text,
    slug,
    verified: false,
    provenance: 'ai-generated-draft',
    generatedAt: serverTimestamp(),
    views: 1,
  })
  return slug
}

export async function incrementTopicNoteViews(slug) {
  const { doc, updateDoc, increment } = await import('firebase/firestore')
  const { db } = await import('../firebase')
  try { await updateDoc(doc(db, 'topicNotes', slug), { views: increment(1) }) } catch(e) {}
}

// ── Flashcard generation cache ──────────────────────────────────────────────
// Mirrors getTopicNoteFromCache/saveTopicNoteToCache above: a shared, top-level cache (not
// per-user) so every student generating flashcards for the same board+level+subject+topic gets
// an instant result after the first person ever generates it, instead of paying for and waiting
// on a fresh AI call every single time. Deliberately includes `level` in the key — a subject
// name alone (e.g. "Biology") isn't unique across GCSE/AS-Level/A-Level, and reusing another
// qualification's flashcards would be exactly the kind of mixing bug fixed elsewhere this
// session. Requires a Firestore rule for the new `flashcardCache` collection (see chat).
export async function getFlashcardSetFromCache(board, level, subject, topic, count) {
  const { doc, getDoc } = await import('firebase/firestore')
  const { db } = await import('../firebase')
  const slug = slugify(board + '_' + level + '_' + subject + '_' + (topic || 'general') + '_' + count)
  try {
    const snap = await getDoc(doc(db, 'flashcardCache', slug))
    if (snap.exists()) return { cached: true, ...snap.data() }
    return null
  } catch (e) { return null }
}

export async function saveFlashcardSetToCache(board, level, subject, topic, count, cards) {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const { db } = await import('../firebase')
  const slug = slugify(board + '_' + level + '_' + subject + '_' + (topic || 'general') + '_' + count)
  await setDoc(doc(db, 'flashcardCache', slug), {
    board, level, subject, topic: topic || '', count,
    cards, slug,
    generatedAt: serverTimestamp(),
    views: 1,
  })
  return slug
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 200)
}


// ── Exported so Admin.jsx can use it for bulk flashcard generation ────────────
export function parseFlashcards(text) {
  const cards = []
  let current = null
  for (const line of (text || '').split('\n')) {
    const q = line.match(/^Q:\s*(.+)/)
    const a = line.match(/^A:\s*(.+)/)
    if (q) { if (current?.q && current?.a) cards.push(current); current = { q: q[1].trim(), a: '' } }
    else if (a && current) current.a = a[1].trim()
    else if (current && line.trim() && !current.a) current.a += line.trim()
    else if (current && line.trim() && current.a) current.a += ' ' + line.trim()
  }
  if (current?.q && current?.a) cards.push(current)
  return cards.filter(c => c.q && c.a)
}

// ── Skill-focused flashcards — triggered by SkillFlashcardSuggestion when marking history
// shows a consistently weak command word. Reuses parseFlashcards' Q:/A: format so
// saveFlashcardSet handle the result with no changes. exampleQuestion is optional context
// (the marker has no separate topic field, just a pasted question) so the cards stay in
// roughly the same content area as what the student was just marked on.
export async function generateSkillFlashcards(subject, board, level, commandWord, exampleQuestion, count, uid) {
  count = count || 3
  const sys = `You are an expert ${board || 'UK'} ${level || 'GCSE'} ${subject} tutor. You write short, targeted flashcards that build the specific skill of answering "${commandWord}"-style exam questions — not just fact recall.`
  const prompt = [
    'Generate exactly ' + count + ' flashcards that build the skill of answering "' + commandWord + '" questions in ' + subject + '.',
    exampleQuestion ? 'The student was just marked on this question, so stay in a similar content area:\n"' + exampleQuestion.slice(0, 300) + '"' : '',
    '',
    'STRICT FORMAT RULES:',
    '- Begin your response immediately with Q: (no introduction)',
    '- Use this exact format for every card:',
    'Q: [a short prompt that specifically requires the ' + commandWord + ' skill]',
    'A: [a model answer, or the structure needed to score full marks]',
    '- Separate cards with one blank line',
    '- No numbering, no bullet points, no markdown, no bold, no asterisks',
    '',
    'Now generate exactly ' + count + ' flashcards:',
  ].filter(Boolean).join('\n')
  return callAI(prompt, sys, 1200, uid)
}

// ── On-demand memory aid — used by MemoryAidButton (Flash mode + post-quiz review) ───────
export async function generateMemoryAid(front, back, subject, uid) {
  const sys = `You help ${subject || 'GCSE/A-Level'} students remember a flashcard they keep getting wrong. Give ONE short, memorable mnemonic, acronym, or vivid analogy — never more than two sentences. No preamble, no "Here's a mnemonic:" framing, just the memory aid itself.`
  const prompt = `Question: ${front}\nAnswer: ${back}\n\nGive a memory aid that links the question to the answer.`
  return callAI(prompt, sys, 200, uid)
}

/* =========================
   SUBJECT TUTORS (Pro) — src/pages/Tutor.jsx
========================= */

// Deliberately teaches the method rather than just handing over an answer — the response
// is structured into STEP N: blocks so the page can reveal them one at a time instead of
// dumping the full solution immediately. Plain text notation, same convention as the rest
// of the app (see the mathsExtra block in generatePredictedQuestions above) — no LaTeX.
export async function solveMathsProblem(problem, level, uid) {
  const sys = `You are an outstanding UK Maths tutor helping a ${level || 'GCSE'} student understand HOW to solve a problem, not just get the answer. Use plain text notation only — write x^2, sqrt(x), fractions as a/b — never LaTeX, never dollar signs, never markdown formatting like ** or #. Every step should teach the reasoning, not just show the calculation.`

  const prompt = `Solve this step by step so the student can follow and learn the method:

${problem}

Format your response EXACTLY like this:

STEP 1: [short title for what this step does]
[the working, and a plain-English explanation of why this step is taken]

STEP 2: [short title]
[working + explanation]

(continue with as many steps as the problem genuinely needs — do not pad with unnecessary steps, and do not skip any either)

FINAL ANSWER: [the final answer, clearly stated]

Rules:
- Plain text maths notation only (x^2, not LaTeX, no dollar signs)
- Explain the reasoning at each step, not just the calculation
- If there's a common mistake students make on this type of problem, mention it briefly in the relevant step`

  return callAI(prompt, sys, 1800, uid)
}

// Splits a solveMathsProblem response into individual steps for progressive reveal, plus
// the final answer. Tolerant of a missing FINAL ANSWER block (still returns whatever steps
// parsed) since a malformed response shouldn't lose the working the student can still read.
export function parseMathsSteps(text) {
  if (!text) return { steps: [], finalAnswer: '' }
  const finalMatch = text.match(/FINAL ANSWER:\s*([\s\S]*)$/i)
  const finalAnswer = finalMatch ? finalMatch[1].trim() : ''
  const body = finalMatch ? text.slice(0, finalMatch.index) : text

  const steps = []
  const stepRegex = /STEP\s*(\d+):\s*([^\n]*)\n?([\s\S]*?)(?=STEP\s*\d+:|$)/gi
  let match
  while ((match = stepRegex.exec(body)) !== null) {
    const title = match[2].trim()
    const content = match[3].trim()
    if (!title && !content) continue
    steps.push({ number: parseInt(match[1], 10) || steps.length + 1, title, content })
  }
  return { steps, finalAnswer }
}

// Holistic essay feedback — quote-and-comment style (same spirit as markAnswer's
// ANNOTATION section) rather than a single numeric mark, since a full essay isn't being
// checked against one specific mark scheme. ROUGH BAND is explicitly framed as
// approximate — this is feedback, not an official grade.
export async function getEssayFeedback(essayText, essayType, level, uid) {
  const sys = `You are an experienced UK English ${level || 'GCSE'} teacher and examiner giving feedback on a student's ${essayType || 'essay'}. Be specific and honest — quote directly from their own writing when praising or critiquing a point, don't give vague generic feedback. Be encouraging but do not inflate the quality of weak work.`

  const prompt = `ESSAY TYPE: ${essayType || 'General essay'}
LEVEL: ${level || 'GCSE'}

STUDENT'S ESSAY:
${essayText}

Give feedback in this exact format:

STRENGTHS:
[2-3 specific things done well — quote a short phrase from the essay for each]

AREAS TO IMPROVE:
[2-3 specific, actionable improvements — quote a short phrase from the essay for each where relevant]

STRUCTURE & ARGUMENT:
[1-2 sentences on paragraphing, flow, and how clearly the argument or thesis comes through]

TECHNICAL ACCURACY:
[1-2 sentences on the general pattern of spelling, grammar, or punctuation issues — not an exhaustive line-edit]

ROUGH BAND:
[a rough, clearly-approximate indicative band, e.g. "reads like a mid-to-upper band response" — with one sentence on what's holding it back from the band above]

NEXT STEP:
[the single most impactful thing to work on next]`

  return callAI(prompt, sys, 2400, uid, 'essayFeedback')
}
