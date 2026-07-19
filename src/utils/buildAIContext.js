// src/utils/buildAIContext.js
// Builds a full student context string used across ALL AI features in RevisionFlow
// Every AI call should include this so outputs are personalised and in sync

/**
 * Builds a comprehensive context string from all available student data.
 * Pass to every AI prompt so the AI knows the full picture.
 *
 * @param {object} profile - Firestore user profile
 * @param {object} opts - additional data
 * @param {Array}  opts.topics - topic confidence ratings
 * @param {Array}  opts.papers - past paper attempts
 * @param {Array}  opts.mistakes - logged mistakes
 * @param {Array}  opts.tasks - tasks list
 * @param {Array}  opts.sessions - recent sessions
 * @param {Array}  opts.priorities - priority list items
 */
export function buildAIContext(profile, opts = {}) {
  if (!profile) return ''

  const { topics = [], papers = [], mistakes = [], tasks = [], sessions = [], priorities = [] } = opts

  const lines = []

  // ── Student identity ─────────────────────────────────────────────
  lines.push('=== STUDENT PROFILE ===')
  lines.push(`Name: ${profile.displayName || 'Student'}`)
  lines.push(`Qualification: ${profile.qualification || 'GCSE'}`)
  lines.push(`Level: ${profile.level || 1} | XP: ${profile.xp || 0} | Streak: ${profile.streak || 0} days`)

  // ── Subjects ─────────────────────────────────────────────────────
  if (profile.subjects?.length) {
    lines.push('\n=== SUBJECTS ===')
    profile.subjects.forEach(s => {
      const qual = s.qualification || profile.qualification || 'GCSE'
      const parts = [`${s.name} (${s.board || 'AQA'}, ${qual}`]
      if (s.tier && s.tier !== 'N/A') parts[0] += ` ${s.tier}`
      parts[0] += ')'
      if (s.currentGrade) parts.push(`current: ${s.currentGrade}`)
      if (s.targetGrade) parts.push(`target: ${s.targetGrade}`)
      lines.push('• ' + parts.join(' | '))
    })
  }

  // ── Exam dates ───────────────────────────────────────────────────
  const today = new Date()
  const upcoming = (profile.examDates || [])
    .filter(e => e.examDate && new Date(e.examDate) > today)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))

  if (upcoming.length) {
    lines.push('\n=== UPCOMING EXAMS ===')
    upcoming.slice(0, 10).forEach(e => {
      const daysLeft = Math.ceil((new Date(e.examDate) - today) / 86400000)
      lines.push(`• ${e.subject} – ${e.paper || 'Exam'}: ${e.examDate} (${daysLeft} days)`)
    })
  }

  // ── Topic confidence ─────────────────────────────────────────────
  if (topics.length) {
    lines.push('\n=== TOPIC CONFIDENCE (1=low, 5=high) ===')
    const currentSubjectNames = new Set((profile.subjects || []).map(s => s.name))
    const bySubject = {}
    topics.forEach(t => {
      if (!currentSubjectNames.has(t.subjectId)) return
      if (!bySubject[t.subjectId]) bySubject[t.subjectId] = []
      bySubject[t.subjectId].push(t)
    })
    Object.entries(bySubject).forEach(([subj, ts]) => {
      const weak = ts.filter(t => t.confidence <= 2).map(t => t.name).slice(0, 5)
      const strong = ts.filter(t => t.confidence >= 5).map(t => t.name).slice(0, 3)
      const avg = (ts.reduce((s, t) => s + (t.confidence || 3), 0) / ts.length).toFixed(1)
      lines.push(`${subj} (avg ${avg}/5):`)
      if (weak.length) lines.push(`  Weak: ${weak.join(', ')}`)
      if (strong.length) lines.push(`  Strong: ${strong.join(', ')}`)
    })
  }

  // ── Priority list ────────────────────────────────────────────────
  if (priorities.length) {
    lines.push('\n=== REVISION PRIORITIES ===')
    const top = priorities
      .filter(p => p.rating >= 4)
      .sort((a, b) => (b.rating - a.rating) || (a.order - b.order))
      .slice(0, 10)
    if (top.length) {
      top.forEach(p => {
        const stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating)
        lines.push(`• ${p.topicName} (${p.subjectId}) ${stars}`)
      })
    } else {
      lines.push('No high-priority topics set yet.')
    }
  }

  // ── Past papers ──────────────────────────────────────────────────
  if (papers.length) {
    lines.push('\n=== PAST PAPER PERFORMANCE ===')
    const bySubject = {}
    papers.forEach(p => {
      if (!bySubject[p.subject]) bySubject[p.subject] = []
      bySubject[p.subject].push(p)
    })
    Object.entries(bySubject).forEach(([subj, ps]) => {
      const recent = ps.slice(0, 5)
      const scores = recent.map(p => {
        const pct = p.maxMarks ? Math.round((p.score / p.maxMarks) * 100) : null
        return pct ? `${p.score}/${p.maxMarks} (${pct}%, ${p.grade || '?'})` : `${p.score} (${p.grade || '?'})`
      })
      lines.push(`${subj}: ${scores.join(' | ')}`)
    })
  }

  // ── Mistakes ─────────────────────────────────────────────────────
  if (mistakes.length) {
    lines.push('\n=== RECENT MISTAKES ===')
    const recent = mistakes.slice(0, 10)
    recent.forEach(m => {
      lines.push(`• [${m.subject}] ${m.topic || 'General'}: ${m.description?.slice(0, 80) || ''}`)
    })
  }

  // ── Recent sessions ──────────────────────────────────────────────
  if (sessions.length) {
    lines.push('\n=== RECENT REVISION SESSIONS ===')
    const recent = sessions.slice(0, 7)
    recent.forEach(s => {
      const date = s.date || s.start?.substring(0, 10) || 'Unknown'
      lines.push(`• ${date}: ${s.subject || 'Unknown'} – ${s.duration || s.durationMins || '?'} min`)
    })
  }

  // ── Tasks ────────────────────────────────────────────────────────
  const openTasks = tasks.filter(t => !t.completed)
  if (openTasks.length) {
    lines.push('\n=== OPEN TASKS ===')
    openTasks.slice(0, 5).forEach(t => {
      lines.push(`• ${t.text || t.title || 'Task'}${t.dueDate ? ` (due ${t.dueDate})` : ''}`)
    })
  }

  lines.push('\n=== END OF STUDENT CONTEXT ===')

  return lines.join('\n')
}

/** Standard system prompt for all RevisionFlow AI features */
export function getSystemPrompt(context) {
  return `You are RevisionFlow's AI tutor for UK GCSE, AS-Level, A-Level and BTEC students. AS-Level is a standalone qualification separate from A-Level, not its first year — keep them distinct. You are personalised, practical, and encouraging. You have full access to this student's revision data and should use it to give specific, relevant advice.

Free resources to reference when relevant: Dr Frost Maths, Cognito, Physics & Maths Tutor (PMT), SaveMyExams, Seneca Learning, Mr Bruff (English), Craig 'n' Dave (Computer Science), BBC Bitesize, GCSEPod.

Format your response clearly. Use **bold** for key terms. Keep responses focused and actionable.

${context ? `STUDENT DATA:\n${context}` : ''}`
}
