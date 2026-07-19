// src/pages/EmergencyMode.jsx
// Shows when an exam is within 7 days.
// Gives: predicted grade, weakest topics, today's plan, predicted questions.

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { checkAndAwardBadge } from '../utils/firestore'
import { callAI } from '../utils/ai'
import { getSubjectQualification } from '../data/subjects'
import { daysUntilExam } from '../utils/calendar'
import AIOutput from '../components/AIOutput'
import { AlertTriangle, Zap, ChevronLeft, Clock, Target, Brain, FileText } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDaysUntil(dateStr) { return daysUntilExam(dateStr) }

function getHoursUntil(dateStr) {
  return Math.round((new Date(dateStr) - new Date()) / 3600000)
}

// ── AI call ──────────────────────────────────────────────────────────────────

async function generateEmergencyPlan({ subject, board, level, paper, weakTopics, avgScore, hoursUntil, mistakes, allTopics }) {
  const days = Math.floor(hoursUntil / 24)
  const sessionsLeft = Math.max(2, Math.min(8, Math.floor(hoursUntil / 3)))

  // Filter topics to the specific paper if known
  const paperTopics = paper && allTopics.length
    ? allTopics.filter(t => !t.paper || String(t.paper) === String(paper))
    : allTopics

  const weakPaperTopics = paperTopics.filter(t => (t.confidence || 3) <= 2)
  const topicsForContext = weakPaperTopics.length > 0 ? weakPaperTopics : paperTopics.slice(0, 10)

  const prompt = [
    "You are a senior " + board + " " + subject + " examiner and the student's personal tutor.",
    'The student has ' + subject + ' ' + level + (paper ? ' Paper ' + paper : '') + ' in ' + days + (days !== 1 ? ' days' : ' day') + ' (' + hoursUntil + ' hours).',
    '',
    'STUDENT DATA:',
    '- Recent paper average: ' + (avgScore !== null ? Math.round(avgScore) + '%' : 'no papers logged'),
    '- Weakest topics: ' + (weakPaperTopics.slice(0, 6).map(function(t){return t.name}).join(', ') || 'none logged'),
    '- Unresolved mistakes: ' + (mistakes.slice(0, 4).map(function(m){return m.topic || (m.description || '').slice(0, 30)}).join(', ') || 'none'),
    '- Revision sessions available before exam: ~' + sessionsLeft,
    '',
    'SPECIFICATION TOPICS FOR THIS PAPER:',
    topicsForContext.slice(0, 10).map(function(t){return '- ' + t.name + ' (confidence ' + (t.confidence || 3) + '/5)'}).join('\n'),
    '',
    'OUTPUT FORMAT — follow exactly, every section required:',
    '',
    'PREDICTED GRADE: [' + (level === 'GCSE' ? 'e.g. Grade 6' : 'e.g. B') + ']',
    'GRADE REASONING: [one sentence citing the student data]',
    '',
    'TOP 5 TOPICS TO REVISE:',
    '1. [topic name] — [what the mark scheme rewards, 1 sentence]',
    '2. [topic name] — [examiner tip]',
    '3. [topic name] — [examiner tip]',
    '4. [topic name] — [examiner tip]',
    '5. [topic name] — [examiner tip]',
    '',
    "TODAY'S PLAN:",
    'Session 1 (30 min): [specific task with exact topic and activity]',
    'Session 2 (30 min): [specific task]',
    'Session 3 (30 min): [past paper practice — name specific year and paper if possible]',
    '',
    'PREDICTED EXAM QUESTIONS:',
    'Q1 ([X] marks): [realistic ' + board + '-style question on weakest topic]',
    'Q2 ([X] marks): [realistic question — different topic]',
    'Q3 ([X] marks): [realistic question — different topic]',
    '',
    'EXAM DAY TIP: [one specific, actionable tip for ' + subject + (paper ? ' Paper ' + paper : '') + ']',
  ].join('\n')

  return callAI(prompt, null, 8192)
}


// ── Parse the AI response into sections ──────────────────────────────────────

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
    predictedGrade:   get('PREDICTED GRADE:', 'GRADE REASONING:'),
    gradeReasoning:   get('GRADE REASONING:', 'TOP 5 TOPICS TO REVISE:'),
    topTopics:        get('TOP 5 TOPICS TO REVISE:', "TODAY'S PLAN:"),
    todaysPlan:       get("TODAY'S PLAN:", 'PREDICTED EXAM QUESTIONS:'),
    questions:        get('PREDICTED EXAM QUESTIONS:', 'EXAM DAY TIP:'),
    examDayTip:       get('EXAM DAY TIP:', null),
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EmergencyMode() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [selectedExam, setSelectedExam] = useState(null)
  const [loading, setLoading] = useState(false)
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
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
  }, [profile])

  // Auto-select the closest exam
  useEffect(() => {
    if (urgentExams.length > 0 && !selectedExam) {
      setSelectedExam(urgentExams[0])
    }
  }, [urgentExams])

  // Generate plan when exam is selected
  useEffect(() => {
    if (!selectedExam || !user) return
    generatePlan()
  }, [selectedExam])

  async function generatePlan() {
    setLoading(true)
    setError('')
    setPlanText('')
    setParsed(null)

    try {
      // Fetch student data from Firestore
      const [topicsSnap, papersSnap, mistakesSnap] = await Promise.all([
        getDocs(query(
          collection(db, 'users', user.uid, 'topics'),
          where('subjectId', '==', selectedExam.subject),
          limit(50)
        )),
        getDocs(query(
          collection(db, 'users', user.uid, 'paperAttempts'),
          where('subject', '==', selectedExam.subject),
          limit(10)
        )),
        getDocs(query(
          collection(db, 'users', user.uid, 'mistakes'),
          where('subject', '==', selectedExam.subject),
          where('resolved', '==', false),
          limit(5)
        )),
      ])

      const subj = profile?.subjects?.find(s => s.name === selectedExam.subject)
      const subjQual = getSubjectQualification(subj, profile)

      const allTopics = topicsSnap.docs.map(d => d.data())
        .filter(t => !t.qualification || t.qualification === subjQual)
        .sort((a, b) => (a.confidence || 3) - (b.confidence || 3))
      const weakTopics = allTopics.filter(t => (t.confidence || 3) <= 2)
      const papers = papersSnap.docs.map(d => d.data()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5)
      const avgScore = papers.length
        ? papers.reduce((s, p) => s + (p.percentage || 0), 0) / papers.length
        : null
      const mistakes = mistakesSnap.docs.map(d => d.data())

      const result = await generateEmergencyPlan({
        subject:    selectedExam.subject,
        board:      subj?.board || selectedExam.board || 'AQA',
        level:      subjQual,
        paper:      selectedExam.paper || null,
        weakTopics,
        allTopics,
        avgScore,
        hoursUntil: getHoursUntil(selectedExam.examDate),
        mistakes,
      })

      if (result.error) {
        setError(result.error)
        return
      }
      const text = result.text || 'Could not generate plan. Please try again.'
      setPlanText(text)
      if (text && user?.uid) checkAndAwardBadge(user.uid, 'emergency_mode').catch(()=>{})
      setParsed(parsePlan(text))
    } catch (err) {
      setError(`Error: ${err.message || 'Something went wrong. Check your Mistral API key is set in Netlify environment variables.'}`)
    } finally {
      setLoading(false)
    }
  }

  // No urgent exams — show message
  if (urgentExams.length === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
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

      {/* Header — red urgency banner */}
      <div style={{
        background: 'rgba(239,68,68,0.1)',
        border: '2px solid rgba(239,68,68,0.4)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <AlertTriangle size={28} color="#ef4444" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: '#ef4444', fontSize: '1.2rem' }}>
            Emergency Mode — {selectedExam?.subject}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isToday
              ? `Exam is TODAY — ${hours} hours left`
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
                {ex.subject} — {getDaysUntil(ex.examDate)}d
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Building your emergency plan...</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analysing your topics, papers and mistakes</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)', padding: 20 }}>
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={generatePlan} style={{ marginTop: 12 }}>
            Try again
          </button>
        </div>
      )}

      {/* Plan panels */}
      {parsed && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Panel 1 — Predicted grade */}
          <div className="card" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Target size={18} color="var(--accent-light)" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Predicted grade</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)', marginBottom: 4 }}>
              {parsed.predictedGrade || '—'}
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {parsed.gradeReasoning}
            </p>
          </div>

          {/* Panel 2 — Top 5 topics */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Brain size={18} color="var(--accent-light)" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Top 5 topics to revise now</h3>
            </div>
            <AIOutput text={parsed.topTopics} label="Priority topics" />
          </div>

          {/* Panel 3 — Today's plan */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Clock size={18} color="var(--accent-light)" />
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

          {/* Panel 4 — Predicted questions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FileText size={18} color="var(--accent-light)" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Predicted exam questions</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Based on the specification and your weak areas. Try answering before checking.
            </p>
            <AIOutput text={parsed.questions} label="Predicted questions" />
          </div>

          {/* Panel 5 — Exam day tip */}
          {parsed.examDayTip && (
            <div className="card" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--success)' }}>
                💡 Exam day tip
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '0.875rem' }}>{parsed.examDayTip}</p>
            </div>
          )}

          {/* Regenerate */}
          <button className="btn btn-secondary btn-sm" onClick={generatePlan} style={{ alignSelf: 'flex-start' }}>
            Regenerate plan
          </button>

        </div>
      )}
    </div>
  )
}
