// src/utils/ai.js
// All AI calls go through /api/tutor (netlify/functions/tutor.js).
// The Mistral API key is server-side only: MISTRAL_API_KEY in Netlify env vars.
// Never use VITE_MISTRAL_API_KEY — the key must never be in the browser bundle.
import { recordActivityStreak } from './firestore'

const AI_ENDPOINT = '/api/tutor'

const SYSTEM = `You are RevisionFlow's AI tutor — an expert on UK GCSE, AS-Level, A-Level and BTEC revision.
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
// uid is passed for server-side rate limiting — never used for anything else.
export async function callAI(prompt, systemPrompt = SYSTEM, maxTokens = 8192, uid = null) {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages:     [{ role: 'user', content: prompt }],
        systemPrompt: systemPrompt || SYSTEM,
        maxTokens,
        uid,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      // 429 = rate limit hit
      if (res.status === 429) {
        return { error: data.error || 'Daily AI limit reached. Try again tomorrow.' }
      }
      return { error: data.error || `AI request failed (${res.status}). Please try again.` }
    }

    if (!data.text) return { error: 'AI returned an empty response. Please try again.' }
    // Record streak for any successful AI interaction
    if (uid) recordActivityStreak(uid).catch(() => {})
    return { text: data.text, provider: 'mistral', remaining: data.remaining }
  } catch (e) {
    console.error('[AI] Network error:', e)
    return { error: 'Could not reach the AI service. Check your internet connection.' }
  }
}

// Multi-turn chat variant — sends full message history
export async function callAIChat(messages, systemPrompt = SYSTEM, uid = null) {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt, uid }),
    })

    const data = await res.json()
    if (!res.ok) return { error: data.error || `AI request failed (${res.status}).` }
    if (!data.text) return { error: 'AI returned an empty response.' }
    return { text: data.text, provider: 'mistral', remaining: data.remaining }
  } catch (e) {
    return { error: 'Could not reach the AI service.' }
  }
}

// ── Exported AI functions ──────────────────────────────────────────────────────

export async function generateStudyPlan(userData, uid) {
  const { subjects, examDates, weakTopics, availableHours, preferences, weeksUntilFirst, firstExamDate, lastExamDate } = userData
  const weeks = weeksUntilFirst || 12
  const windowDesc = firstExamDate && lastExamDate
    ? `from now until ${lastExamDate} (first exam: ${firstExamDate}, approximately ${weeks} weeks away)`
    : `approximately ${weeks} weeks`

  const prompt = `Generate a personalised GCSE/A-Level revision study plan for a student.

STUDENT DETAILS:
Subjects: ${subjects?.map(s => `${s.name} (${s.board}, current: ${s.currentGrade || '?'}, target: ${s.targetGrade || 9})`).join(', ')}
Exam period: ${windowDesc}
Upcoming exams: ${examDates?.filter(e => new Date(e.examDate) > new Date()).sort((a,b)=>new Date(a.examDate)-new Date(b.examDate)).slice(0,12).map(e => `${e.subject} P${e.paper} on ${e.examDate}`).join(', ') || 'Not specified'}
Available hours per week: ${availableHours || 10}
Focus preference: ${preferences || 'Balanced content and exam practice'}

IMPORTANT CONSTRAINTS:
- The plan must cover EXACTLY ${weeks} weeks — no more
- Structure into 3 clear phases: Foundation (weeks 1-${Math.floor(weeks*0.4)}), Intensive (weeks ${Math.floor(weeks*0.4)+1}-${Math.floor(weeks*0.8)}), Final push (weeks ${Math.floor(weeks*0.8)+1}-${weeks})
- In the final 2 weeks before each exam, prioritise that specific subject heavily
- Keep each week's entry concise — one paragraph per phase, not per week

FORMAT:
1. Subject priority order and reasoning (bullet list)
2. Phase 1 — Foundation (what to do, which subjects, ratio)
3. Phase 2 — Intensive revision (shift in focus, more past papers)
4. Phase 3 — Final push (exam-specific focus, week by week for last 3 weeks only)
5. Resources per subject (concise list)
6. 3 practical motivation tips

Keep the total response under 600 words. Be specific and actionable.`
  return callAI(prompt, SYSTEM, 8192, uid)
}

export async function getTopicAdvice(subject, topic, confidence, mistakes, uid) {
  const confLabel = ['','Very weak — needs urgent attention','Weak — gaps in understanding','Building — some understanding but not secure','Strong — mostly secure','Mastered — confident'][confidence] || 'Building'
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
  return callAI(prompt, SYSTEM, 8192, uid)
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
  return callAI(prompt, SYSTEM, 8192, uid)
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
  return callAI(prompt, SYSTEM, 8192, uid)
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
  return callAI(prompt, SYSTEM, 8192, uid)
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
  return callAIChat(messages.slice(-10), systemWithContext, uid)
}

export async function predictGrade(subject, paperAttempts, topicConfidences, qualification, uid) {
  const qual = qualification || 'GCSE'
  const subjectAttempts = paperAttempts?.filter(a => a.subject === subject) || []
  const weakTopics = topicConfidences?.filter(t => t.subjectId === subject && (t.confidence||3) <= 2) || []
  const exampleRange = qual === 'GCSE' ? 'e.g. grade 7-8' : qual === 'AS-Level' ? 'e.g. B-C' : 'e.g. B-C'
  const scaleNote = qual === 'GCSE'
    ? 'Grades are numeric 9 (highest) to 1 (lowest).'
    : qual === 'AS-Level'
      ? 'Grades are A (highest) to E (lowest) — AS-Level does not award an A*.'
      : 'Grades are A* (highest) to E (lowest).'
  const prompt = `Predict the likely ${qual} final grade for this student:
Subject: ${subject}
Qualification: ${qual}. ${scaleNote}
Paper attempts: ${JSON.stringify(subjectAttempts.slice(0,6).map(a => ({year:a.year,paper:a.paper,percentage:a.percentage,grade:a.grade})))}
Weak topics (confidence ≤2/5): ${weakTopics.map(t => t.name).join(', ') || 'None logged'}

Provide:
1. Predicted grade range (${exampleRange}) with confidence level
2. What would push the grade up
3. What risks pulling it down
4. The single most impactful thing to work on right now`
  return callAI(prompt, SYSTEM, 8192, uid)
}

export async function suggestNextTopic(subject, topicConfidences, examDates, uid) {
  const subjectTopics = topicConfidences?.filter(t => t.subjectId === subject) || []
  const nextExam = examDates?.filter(e => e.subject === subject && new Date(e.examDate) > new Date())
    .sort((a,b) => new Date(a.examDate) - new Date(b.examDate))[0]
  const prompt = `Suggest the single most important topic for this student to revise next:
Subject: ${subject}
Next exam: ${nextExam ? `${nextExam.examDate} (Paper ${nextExam.paper})` : 'Not specified'}
Topic confidence ratings:
${subjectTopics.sort((a,b)=>(a.confidence||3)-(b.confidence||3)).slice(0,15).map(t => `- ${t.name}: ${t.confidence||3}/5`).join('\n')}

Recommend ONE specific topic and explain:
1. Why this topic should be next (exam proximity + confidence gap)
2. How to structure a 45-minute revision session on it
3. Specific resources to use
4. What a grade 9 answer looks like for exam questions on this topic`
  return callAI(prompt, SYSTEM, 8192, uid)
}

export async function markAnswer(subject, board, level, paper, question, markAllocation, studentAnswer, uid) {
  const isLevelBased = markAllocation >= 6
  const isMaths = subject === 'Mathematics' || subject === 'Further Mathematics'

  // Conservative marking system prompt — forces accuracy over generosity
  const markerSystem = `You are a SENIOR PRINCIPAL EXAMINER for ${board} ${level} ${subject}. You have marked thousands of scripts.

CRITICAL MARKING RULES — you MUST follow these exactly:
1. NEVER award marks for vague or generic statements. Every mark requires a specific, creditable point.
2. If the student implies something but does not state it explicitly, do NOT award the mark unless the mark scheme specifically says "accept implied reference".
3. For level-based questions: read the FULL answer before deciding the level. Do not upgrade for one good sentence in an otherwise weak answer.
4. Be CONSERVATIVE. Real examiner research shows AI markers consistently over-mark by 15-25%. Correct for this by being strict.
5. Max marks available is ${markAllocation}. You CANNOT award more than ${markAllocation}.
6. If the answer is strong but has a small gap, award the mark band BELOW the top — reserve the top band for genuinely exceptional answers.
7. Quote directly from the student's answer when awarding or denying marks. Do not paraphrase their words to make them seem better than they are.`

  const prompt = `EXAMINATION PAPER: ${board} ${level} ${subject}${paper ? ` Paper ${paper}` : ''}
TOTAL MARKS FOR THIS QUESTION: ${markAllocation}
${isLevelBased ? `MARKING TYPE: Level-based (holistic — judge the overall quality, not just individual points)` : `MARKING TYPE: Point-mark (each distinct valid point = 1 mark, maximum ${markAllocation})`}

QUESTION:
${question}

STUDENT'S ANSWER (mark exactly what is written — do not award marks for what they might have meant):
${studentAnswer}

---

Now mark this answer. Use EXACTLY this format — no deviations:

AWARDED MARKS: [X]/${markAllocation}
${isLevelBased ? 'LEVEL: [Level 1 / 2 / 3 / 4 — state which and the mark range for that level]' : ''}

CREDITED POINTS:
[List only the points you are actually awarding marks for, one per line. Quote the student's exact words that earned each mark. If zero points earned, write "None — no creditable content identified."]

POINTS NOT CREDITED:
[List mark scheme points the student did not adequately address. Be specific about what was missing.]

ANNOTATION:
[Pick 2-3 sentences from the student's answer. Quote them in "speech marks". For each, explain precisely why it does or does not gain marks — reference specific mark scheme criteria.]

${isMaths
  ? `MARK BREAKDOWN:
• Method marks (M): [X] — [which methods were shown correctly]
• Accuracy marks (A): [X] — [which values were correct]
• B marks (B): [X]`
  : `AO BREAKDOWN:
• AO1 Knowledge & Understanding: [X]/[available] — [brief reason]
• AO2 Application: [X]/[available] — [brief reason]
• AO3 Analysis & Evaluation: [X]/[available] — [brief reason]`}

GRADE BOUNDARY CONTEXT:
[State roughly what raw mark this corresponds to as a grade — e.g. "This mark would typically correspond to a grade 6 on this paper"]

TO REACH THE NEXT MARK BAND:
1. [Specific thing to add or change — quote from mark scheme indicative content]
2. [Specific second improvement]
3. [Specific third improvement]

EXAMINER NOTE: [One sentence in examiner voice — the kind of comment written on actual marked scripts, e.g. "Some relevant knowledge shown but analysis lacks development — candidate must engage more explicitly with the question's focus on..."]`

  return callAI(prompt, markerSystem, 8192, uid)
}


export async function generateFlashcards(subject, topic, count, uid) {
  count = count || 8
  var topicPart = topic ? ', topic: ' + topic : ''
  var prompt = [
    'Generate exactly ' + count + ' revision flashcards for: ' + subject + topicPart + '.',
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
  return callAI(prompt, SYSTEM, 8192, uid)
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

  return callAI(prompt, sysPrompt, 8192, uid)
}


export async function generateTopicNote({ subject, board, level, topic, uid }) {
  const isALevel = level === 'A-Level' || level === 'AS-Level'

  const sys = 'You are a senior ' + board + ' examiner and ' + level + ' ' + subject + ' teacher with 15 years of experience. ' +
    'You have expert knowledge of the ' + board + ' ' + level + ' ' + subject + ' specification. ' +
    'CRITICAL: Only include content explicitly on the ' + board + ' ' + level + ' ' + subject + ' specification. ' +
    'Do NOT include content from other boards, other levels, or beyond the spec.'

  const eg = isALevel ? '3' : '2'

  const prompt = 'Create a complete specification-accurate revision guide.\n\n' +
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
    'Use markdown. **Bold** all key terms. Be thorough and specification-accurate throughout.'

  return callAI(prompt, sys, 8192, uid)
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
