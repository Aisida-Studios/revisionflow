// src/pages/EmergencyMode.jsx
// Shows when an exam is within 7 days.
// Estimated grade and priority topics come from the same deterministic engines Dashboard.jsx
// and Calendar.jsx already use (gradeInsights.js / recommendations.js) — computed instantly, not
// asked of the AI, so this page can never quietly disagree with what those pages show for the
// same subject. The AI is only used for what genuinely needs it: a written plan, practice
// questions, and a one-line exam-day tip.

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  checkAndAwardBadge, getTopicsWithConfidence, getPaperAttempts, getQuizResults, getMistakes,
  filterToCurrentQualification,
} from '../utils/firestore'
import { computeSubjectPredictions } from '../utils/gradeInsights'
import { computeTopicRecommendations } from '../utils/recommendations'
import { callAI } from '../utils/ai'
import { getSubjectQualification } from '../data/subjects'
import { daysUntilExam } from '../utils/calendar'
import { parseLocalDate } from '../utils/examUtils'
import AIOutput from '../components/AIOutput'
import { AlertTriangle, Zap, ChevronLeft, Clock, Target, Brain, FileText, CheckCircle2 } from 'lucide-react'

// -- Helpers --------------------------------------------------------------------

function getDaysUntil(dateStr) { return daysUntilExam(dateStr) }

function getHoursUntil(dateStr) {
  // parseLocalDate, not new Date(dateStr) -- a "YYYY-MM-DD" exam date parses as UTC midnight,
  // which in BST is an hour out and can flip which side of midnight "today" falls on.
  const examDay = parseLocalDate(dateStr)
  if (!examDay) return null
  return Math.round((examDay - new Date()) / 3600000)
}

// -- AI call: plan, practice questions and exam-day tip only. Grade and topic priority are
//    computed in the component body below, not asked of the model. -----------------------------

async function generateEmergencyPlan({ subject, board, level, paper, recommendations, prediction, hoursUntil, subjectMistakes }) {
  const days = Math.floor(hoursUntil / 24)
  const sessionsLeft = Math.max(2, Math.min(8, Math.floor(hoursUntil / 3)))
  const topicNames = recommendations.map(function (r) { return r.topic })

  const prompt = [
    "You are a senior " + board + " " + subject + " examiner and the student's personal tutor.",
    'The student has ' + subject + ' ' + level + (paper ? ' Paper ' + paper : '') + ' in ' + days + (days !== 1 ? ' days' : ' day') + ' (' + hoursUntil + ' hours).',
    '',
    'ALREADY-CALCULATED STUDENT DATA -- do not contradict these numbers, build the plan around them:',
    '- Estimated current grade: ' + (prediction ? prediction.grade + ' (' + prediction.percentage + '%)' : 'not enough data yet'),
    '- Priority topics, in order, with why each was flagged:',
    (recommendations.length
      ? recommendations.map(function (r, i) { return '  ' + (i + 1) + '. ' + r.topic + ' -- ' + r.reasons.join('; ') }).join('\n')
      : '  (no specific priority topics flagged -- general revision)'),
    '- Unresolved mistakes: ' + (subjectMistakes.slice(0, 4).map(function (m) { return m.topic || (m.description || '').slice(0, 30) }).join(', ') || 'none'),
    '- Revision sessions available before exam: ~' + sessionsLeft,
    '',
    'OUTPUT FORMAT -- follow exactly, every section required:',
    '',
    "TODAY'S PLAN:",
    'Session 1 (30 min): [specific task using one of the priority topics above]',
    'Session 2 (30 min): [specific task using another priority topic above]',
    'Session 3 (30 min): [past paper practice -- name specific year and paper if possible]',
    '',
    'PRACTICE QUESTIONS:',
    'Q1 ([X] marks): [' + board + '-style practice question on ' + (topicNames[0] || 'a weak topic') + ']',
    'Q2 ([X] marks): [practice question -- different topic]',
    'Q3 ([X] marks): [practice question -- different topic]',
    '',
    'EXAM DAY TIP: [one specific, actionable tip for ' + subject + (paper ? ' Paper ' + paper : '') + ']',
  ].join('\n')

  return callAI(prompt, null, 8192)
}

// -- Parse the AI response into sections -----------------------------------------

function parsePlan(text) {
  if (!text) return null
  const get = (label, nextLabel) => {
    const start = text.indexOf(label)
    if (start === -1) return ''
    const contentStart = start + label.length
    const end = nextLabel ? text.indexOf(nextLabel, contentStart) : text.length
    return text.slice(contentStart, end === -1 ? undefined : end).trim()
  }

  return {
    todaysPlan: get("TODAY'S PLAN:", 'PRACTICE QUESTIONS:'),
    questions:  get('PRACTICE QUESTIONS:', 'EXAM DAY TIP:'),
    examDayTip: get('EXAM DAY TIP:', null),
  }
}

// -- Main component ---------------------------------------------------------------

export default function EmergencyMode() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [selectedExam, setSelectedExam] = useState(null)

  // Real student data -- same fetch shape as Dashboard.jsx's predicted-grade widget, so a
  // subject's estimated grade can never quietly disagree between the two pages.
  const [topics, setTopics] = useState([])
  const [paperAttempts, setPaperAttempts] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const [aiLoading, setAiLoading] = useState(false)
  const [planText, setPlanText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState('')

  // Find exams within the next 7 days
  const urgentExams = useMemo(() => {
    return (profile?.examDates || [])
      .filter(e => {
        const d = getDaysUntil(e.examDate)
        return d >= 0 && d <= 7
      })
      .sort((a, b) => getDaysUntil(a.examDate) - getDaysUntil(b.examDate))
  }, [profile])

  // Auto-select the closest exam
  useEffect(() => {
    if (urgentExams.length > 0 && !selectedExam) {
      setSelectedExam(urgentExams[0])
    }
  }, [urgentExams])

  // Load real topics/papers/quizzes/mistakes once -- same functions and shape Dashboard.jsx uses.
  useEffect(() => {
    if (!user || !profile) return
    let cancelled = false
    setDataLoading(true)
    Promise.all([
      getTopicsWithConfidence(user.uid, profile?.subjects || []),
      getPaperAttempts(user.uid),
      getQuizResults(user.uid),
      getMistakes(user.uid),
    ]).then(([t, p, q, m]) => {
      if (cancelled) return
      setTopics(t || [])
      setPaperAttempts(p || [])
      setQuizResults(q || [])
      setMistakes(m || [])
      setDataLoading(false)
    }).catch(() => { if (!cancelled) setDataLoading(false) })
    return () => { cancelled = true }
  }, [user, profile])

  const currentPapers = useMemo(
    () => filterToCurrentQualification(paperAttempts, profile?.subjects || []),
    [paperAttempts, profile?.subjects]
  )
  const currentQuizzes = useMemo(
    () => filterToCurrentQualification(quizResults, profile?.subjects || []),
    [quizResults, profile?.subjects]
  )
  // Same call, same inputs, as Dashboard.jsx's own predicted-grade widget -- a lookup into the
  // one shared calculation, not a second estimate that could drift from it.
  const allPredictions = useMemo(
    () => (profile ? computeSubjectPredictions(topics, currentPapers, currentQuizzes, profile) : []),
    [topics, currentPapers, currentQuizzes, profile]
  )
  const prediction = selectedExam ? allPredictions.find(p => p.subject === selectedExam.subject) : null

  const subjectTopics = useMemo(() => {
    if (!selectedExam) return []
    const bySubject = topics.filter(t => t.subjectId === selectedExam.subject)
    // Scope to the specific paper when known -- a topic with no paper set is treated as
    // belonging to every paper, same as this page's own logic did before.
    return selectedExam.paper
      ? bySubject.filter(t => !t.paper || String(t.paper) === String(selectedExam.paper))
      : bySubject
  }, [topics, selectedExam])

  const subjectMistakes = useMemo(
    () => selectedExam ? mistakes.filter(m => m.subject === selectedExam.subject && !m.resolved) : [],
    [mistakes, selectedExam]
  )

  // Same deterministic scorer Calendar.jsx's "Recommended topics" and TopicDetail's "Why this
  // topic matters" use -- scoped here to just this exam's subject/paper.
  const recommendations = useMemo(
    () => selectedExam
      ? computeTopicRecommendations({ topics: subjectTopics, mistakes: subjectMistakes, examDates: profile?.examDates || [], limit: 5 })
      : [],
    [subjectTopics, subjectMistakes, profile, selectedExam]
  )

  // Generate the AI plan (writing, practice questions, tip) once the real data above is ready.
  useEffect(() => {
    if (!selectedExam || !user || dataLoading) return
    generatePlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam, dataLoading])

  async function generatePlan() {
    setAiLoading(true)
    setError('')
    setPlanText('')
    setParsed(null)

    try {
      const subj = profile?.subjects?.find(s => s.name === selectedExam.subject)
      const subjQual = getSubjectQualification(subj, profile)

      const result = await generateEmergencyPlan({
        subject:    selectedExam.subject,
        board:      subj?.board || selectedExam.board || 'AQA',
        level:      subjQual,
        paper:      selectedExam.paper || null,
        recommendations,
        prediction,
        hoursUntil: getHoursUntil(selectedExam.examDate),
        subjectMistakes,
      })

      if (result.error) {
        setError(result.error)
        return
      }
      const text = result.text || 'Could not generate plan. Please try again.'
      setPlanText(text)
      if (text && user?.uid) checkAndAwardBadge(user.uid, 'emergency_mode').catch(() => {})
      setParsed(parsePlan(text))
    } catch (err) {
      setError(`Error: ${err.message || 'Something went wrong. Check your Mistral API key is set in Netlify environment variables.'}`)
    } finally {
      setAiLoading(false)
    }
  }

  // No urgent exams -- show message
  if (urgentExams.length === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: 12 }} />
          <h2 style={{ marginBottom: 8 }}>No exams in the next 7 days</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Emergency Mode activates automatically when you have an exam within 7 days.
            Make sure your exam dates are added.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/exams')}>
            Add exam dates
          </button>
        </div>
      </div>
    )
  }

  const days = selectedExam ? getDaysUntil(selectedExam.examDate) : null
  const hours = selectedExam ? getHoursUntil(selectedExam.examDate) : null
  const isToday = days === 0

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Back button */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
        <ChevronLeft size={14} /> Back to dashboard
      </button>

      {/* Header -- urgency banner, semantic tokens so it's correct in dark mode too */}
      <div style={{
        background: 'var(--danger-pale)',
        border: '2px solid var(--danger-border)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <AlertTriangle size={28} style={{ color: 'var(--danger)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: 'var(--danger)', fontSize: '1.2rem' }}>
            Emergency Mode -- {selectedExam?.subject}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isToday
              ? `Exam is TODAY -- ${hours} hours left`
              : `Exam in ${days} day${days !== 1 ? 's' : ''} (${hours} hours)`}
          </p>
        </div>
        {/* Exam selector if multiple urgent exams */}
        {urgentExams.length > 1 && (
          <select
            className="select"
            value={selectedExam?.subject}
            onChange={e => setSelectedExam(urgentExams.find(ex => ex.subject === e.target.value))}
            style={{ width: 'auto' }}
          >
            {urgentExams.map(ex => (
              <option key={ex.subject + ex.examDate} value={ex.subject}>
                {ex.subject} -- {getDaysUntil(ex.examDate)}d
              </option>
            ))}
          </select>
        )}
      </div>

      {dataLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your topics, papers and mistakes...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Panel 1 -- Estimated grade: computed instantly from gradeInsights.js, the same call
              Dashboard.jsx makes. Never an AI guess, never shown as more certain than it is. */}
          <div className="card" style={{ background: 'var(--success-pale)', border: '1px solid var(--success-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Target size={18} style={{ color: 'var(--success)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Estimated current grade</h3>
            </div>
            {prediction ? (
              <>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginBottom: 4 }}>
                  {prediction.grade}
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {prediction.percentage}% blended estimate, based on your RevisionFlow data
                  ({prediction.sources.papers} paper{prediction.sources.papers !== 1 ? 's' : ''}, {prediction.sources.quizzes} quiz{prediction.sources.quizzes !== 1 ? 'zes' : ''}, {prediction.sources.topicsRated} rated topic{prediction.sources.topicsRated !== 1 ? 's' : ''}). Not an official prediction.
                </p>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Not enough data yet -- log a past paper or quiz for {selectedExam?.subject} to get an estimate.
              </p>
            )}
          </div>

          {/* Panel 2 -- Priority topics: same deterministic scorer as Calendar.jsx's "Recommended
              topics" and TopicDetail's "Why this topic matters", explained, not just listed. */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Brain size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Priority topics right now</h3>
            </div>
            {recommendations.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommendations.map(r => (
                  <div key={r.id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>{r.topic}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.reasons.join(' - ')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No specific weak spots flagged for {selectedExam?.subject} yet -- rate a few topics' confidence to get priorities here.
              </p>
            )}
          </div>

          {/* AI loading / error / plan panels */}
          {aiLoading && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Writing today's plan...</p>
            </div>
          )}

          {error && (
            <div className="card" style={{ border: '1px solid var(--danger-border)', padding: 20 }}>
              <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
              <button className="btn btn-primary btn-sm" onClick={generatePlan} style={{ marginTop: 12 }}>
                Try again
              </button>
            </div>
          )}

          {parsed && !aiLoading && (
            <>
              {/* Panel 3 -- Today's plan */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Clock size={18} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Today's revision plan</h3>
                </div>
                <AIOutput text={parsed.todaysPlan} label="Your plan" />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/timer')}
                  style={{ marginTop: 12 }}
                >
                  <Zap size={14} /> Start 30-min timer
                </button>
              </div>

              {/* Panel 4 -- Practice questions: AI-generated, explicitly not official predictions */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FileText size={18} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Practice questions</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  AI-generated practice on your priority topics above -- not official exam questions, and not a prediction of what will come up.
                </p>
                <AIOutput text={parsed.questions} label="Practice questions" />
              </div>

              {/* Panel 5 -- Exam day tip */}
              {parsed.examDayTip && (
                <div className="card" style={{ background: 'var(--success-pale)', border: '1px solid var(--success-border)' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--success)' }}>
                    Exam day tip
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.875rem' }}>{parsed.examDayTip}</p>
                </div>
              )}

              {/* Regenerate -- only re-runs the AI writing; the grade/topics above don't change */}
              <button className="btn btn-secondary btn-sm" onClick={generatePlan} style={{ alignSelf: 'flex-start' }}>
                Regenerate plan
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
