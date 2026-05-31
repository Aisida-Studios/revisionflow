// src/utils/ai.js
// All AI calls go through /api/tutor (netlify/functions/tutor.js).
// The Mistral API key is server-side only: MISTRAL_API_KEY in Netlify env vars.
// Never use VITE_MISTRAL_API_KEY — the key must never be in the browser bundle.
import { recordActivityStreak } from './firestore'

const AI_ENDPOINT = '/api/tutor'

const SYSTEM = `You are RevisionFlow's AI tutor — an expert on UK GCSE and A-Level revision.
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

export async function getResourceRecommendations(subject, board, tier, weakTopics, uid) {
  const prompt = `Recommend the best FREE revision resources for:
Subject: ${subject} (${board || 'AQA'}, ${tier || 'Higher'})
Weak topics: ${weakTopics?.join(', ') || 'General revision'}

For each resource:
- Name and URL
- What it's best for
- How to use it effectively
- Recommended time per week

Only include genuinely free resources. Include at least 5.`
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

export async function predictGrade(subject, paperAttempts, topicConfidences, uid) {
  const subjectAttempts = paperAttempts?.filter(a => a.subject === subject) || []
  const weakTopics = topicConfidences?.filter(t => t.subjectId === subject && (t.confidence||3) <= 2) || []
  const prompt = `Predict the likely GCSE final grade for this student:
Subject: ${subject}
Paper attempts: ${JSON.stringify(subjectAttempts.slice(0,6).map(a => ({year:a.year,paper:a.paper,percentage:a.percentage,grade:a.grade})))}
Weak topics (confidence ≤2/5): ${weakTopics.map(t => t.name).join(', ') || 'None logged'}

Provide:
1. Predicted grade range (e.g. grade 7–8) with confidence level
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
  // Board-specific config
  const boardConfig = {
    AQA: {
      GCSE:    { marks:[1,2,3,4,5,6,8],         commands:{1:'State/Give/Name',2:'Describe/Outline',3:'Explain',4:'Explain in detail',5:'Explain',6:'Evaluate/Discuss'},    markScheme:'Award one mark per valid bullet point. Max marks stated in brackets.', style:'Concise questions. Higher mark questions use stimulus material. Use Evaluate or Discuss for 6-mark questions.' },
      ALevel:  { marks:[2,3,4,5,6,8,9,12,15,20], commands:{2:'State/Give',3:'Outline',4:'Explain',5:'Explain/Analyse',6:'Analyse',8:'Evaluate',9:'Evaluate',12:'Evaluate/Discuss',15:'Discuss/Assess',20:'Essay'}, markScheme:'Level-based marking for 8+ marks. Level 1 (basic), Level 2 (some development), Level 3 (clear/coherent), Level 4 (sustained). Point-mark for 6 marks and under.', style:'Longer stimulus for essays. Precise technical language required. Mark schemes use indicative content.' },
    },
    Edexcel: {
      GCSE:    { marks:[1,2,3,4,5,6,8],         commands:{1:'State/Give',2:'Describe',3:'Explain',4:'Explain',5:'Explain',6:'Evaluate/Assess'}, markScheme:'Point marking. Each bullet = 1 mark. Do not accept entries listed.', style:'Structured scaffolding. Often uses complete-the-sentence or use-the-data stems.' },
      ALevel:  { marks:[2,3,4,5,6,8,10,12,16,20], commands:{2:'State',3:'Outline',4:'Explain',5:'Explain',6:'Assess/Analyse',8:'Evaluate',10:'Evaluate',12:'Evaluate',16:'To what extent',20:'Essay'}, markScheme:'Levels-based for 6+ marks. QWC assessed at 12+ marks.', style:'To what extent essays common. Data response includes quantitative analysis.' },
    },
    OCR: {
      GCSE:    { marks:[1,2,3,4,5,6],            commands:{1:'State/Identify',2:'Describe',3:'Explain',4:'Explain',5:'Discuss',6:'Evaluate'}, markScheme:'Point marking with accept alternatives. Owtte used frequently.', style:'Structured sub-parts (a)(i)(ii). Context-based scenarios common.' },
      ALevel:  { marks:[2,3,4,5,6,8,9,12,15],   commands:{2:'State',3:'Explain',4:'Explain',5:'Analyse',6:'Evaluate',8:'Discuss',9:'Evaluate',12:'Assess',15:'Essay'}, markScheme:'Levels-based for 6+ marks. AO1/AO2/AO3 breakdown per question.', style:'Assessment objective balance specified per question.' },
    },
  }

  const cfgKey = (level === 'A-Level' || level === 'ALEVEL') ? 'ALevel' : 'GCSE'
  const cfg    = boardConfig[board]?.[cfgKey] || boardConfig.AQA[cfgKey]
  const n      = Number(numQuestions) || 3
  const total  = Number(totalMarks)  || n * 6

  // Distribute marks across questions
  function distributeMarks(tot, count, available) {
    const result = []
    let rem = tot
    for (let i = 0; i < count; i++) {
      const target  = Math.round(rem / (count - i))
      const closest = available.reduce((a, b) => Math.abs(b - target) < Math.abs(a - target) ? b : a)
      result.push(closest)
      rem -= closest
    }
    return result
  }

  const markDist = distributeMarks(total, n, cfg.marks)

  // Build each question block as a plain string — no nested template literals
  function makeMarkScheme(m) {
    if (m <= 6) {
      return '• Award 1 mark for: [specific answer point]\n• Award 1 mark for: [another valid point]\n(Maximum ' + m + ' marks)'
    }
    const l3lo = Math.round(m * 0.75)
    const l2lo = Math.round(m * 0.4)
    const l2hi = Math.round(m * 0.74)
    const l1hi = Math.round(m * 0.39)
    return 'Level 3 [' + l3lo + '-' + m + ' marks]: [descriptor]\nLevel 2 [' + l2lo + '-' + l2hi + ' marks]: [descriptor]\nLevel 1 [1-' + l1hi + ' marks]: [descriptor]\nIndicative content:\n• [point 1]\n• [point 2]'
  }

  function makeQuestion(m, num) {
    const cmd = cfg.commands[m] || (m <= 2 ? 'State/Give' : m <= 4 ? 'Explain' : 'Evaluate')
    return '---QUESTION ' + num + '--- [' + m + ' marks]\n' +
      '[Write question here — command word: ' + cmd + ' — about "' + subject + '" topic: "' + (topic || 'the specified topic') + '"]\n\n' +
      'MARK SCHEME:\n' + makeMarkScheme(m) + '\n\n' +
      'EXAMINER NOTE: [Most common student mistake on this question type]'
  }

  const allocationLines = markDist.map(function(m, i) {
    const cmd = cfg.commands[m] || (m <= 2 ? 'State/Give' : m <= 4 ? 'Explain' : 'Evaluate')
    return 'Question ' + (i + 1) + ': ' + m + ' marks — command word must be: ' + cmd
  }).join('\n')

  const formatBlocks = markDist.map(function(m, i) {
    return makeQuestion(m, i + 1)
  }).join('\n\n')

  const prompt = 'You are a senior ' + board + ' examiner writing the OFFICIAL ' + level + ' ' + subject + ' examination paper.\n\n' +
    'TASK: Write EXACTLY ' + n + ' exam question' + (n > 1 ? 's' : '') + ' on the topic "' + (topic || 'the specified topic') + '".\n\n' +
    'MARK ALLOCATION (follow exactly):\n' + allocationLines + '\n' +
    'Total: ' + markDist.reduce(function(a,b){return a+b}, 0) + ' marks\n\n' +
    'BOARD-SPECIFIC RULES FOR ' + board + ' ' + level + ':\n' +
    '- ' + cfg.style + '\n' +
    '- Mark scheme format: ' + cfg.markScheme + '\n' +
    '- NEVER use mark values outside this list: ' + cfg.marks.join(', ') + '\n' +
    '- Write questions EXACTLY as they appear on real ' + board + ' ' + level + ' ' + subject + ' papers\n' +
    '- All questions MUST be specifically about the given topic\n\n' +
    'STRICT OUTPUT FORMAT (copy exactly):\n\n' +
    formatBlocks + '\n\n' +
    'CRITICAL: Output EXACTLY ' + n + ' question' + (n > 1 ? 's' : '') + ', no more, no fewer. No preamble or extra text outside the ---QUESTION N--- blocks.'

  return callAI(prompt, SYSTEM, 8192, uid)
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
