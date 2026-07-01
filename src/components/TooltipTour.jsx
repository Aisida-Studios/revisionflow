// src/components/TooltipTour.jsx
import { useState, useEffect } from 'react'

function buildSteps(profile) {
  const firstName  = (profile?.displayName || '').split(' ')[0] || 'there'
  const subjects   = profile?.subjects || []
  const subjNames  = subjects.slice(0, 3).map(s => s.name)
  const subjList   = subjNames.length
    ? (subjNames.length === 1 ? subjNames[0] : subjNames.slice(0, -1).join(', ') + ' and ' + subjNames[subjNames.length - 1])
    : null
  const qual       = profile?.qualification || 'exams'
  const examCount  = (profile?.examDates || []).length
  const target     = subjects[0]?.targetGrade

  const steps = [
    {
      title: '👋 Hey ' + firstName + '!',
      body: subjList
        ? "You're set up for " + qual + ' in ' + subjList + (subjects.length > 3 ? ' and ' + (subjects.length - 3) + ' more' : '') + '. Quick 30-second tour of where everything lives.'
        : "Quick 30-second tour of where everything lives, then you're free to dive in.",
    },
    {
      title: '📅 Your Dashboard',
      body: examCount > 0
        ? "This is home base — today's sessions, your next exam countdown, streak, and a fresh AI tip every day."
        : "This is home base. Once you add exam dates, you'll see a live countdown here alongside today's sessions and streak.",
    },
    {
      title: '📆 Calendar',
      body: subjList
        ? 'Generate a full revision schedule for ' + subjList + ' with one click — built around your exam dates and the availability you set during signup.'
        : 'Generate a full revision schedule with AI, built around your exam dates and availability.',
    },
    {
      title: '🧠 Topics',
      body: subjects.length
        ? 'Every topic for ' + (subjNames[0] || 'your subjects') + ' is already pre-loaded. Rate your confidence 1–5 on each one, and the AI will know exactly what to prioritise.'
        : 'Topics auto-load once you add subjects in Settings. Rate your confidence 1–5 and the AI prioritises accordingly.',
    },
    {
      title: '✨ AI Advisor',
      body: target
        ? "Ask anything, get grade predictions toward your target grade " + target + ", mark your answers like a real examiner, and generate flashcards — all personalised to your data."
        : 'Ask anything, get grade predictions, mark your answers like a real examiner, and generate flashcards — all personalised to your data.',
    },
    {
      title: '⏱ Timer',
      body: 'Built-in Pomodoro timer or stopwatch for focused sessions. Keeps running even when you switch pages, and earns you XP per minute.',
    },
    {
      title: "🎯 You're all set, " + firstName + '!',
      body: examCount === 0
        ? 'First step: add your exam dates so the countdown and AI scheduling can kick in. Good luck! 🚀'
        : "Jump into Calendar to generate your first revision schedule, or head straight to Topics to start rating your confidence. Good luck! 🚀",
    },
  ]

  return steps
}

export default function TooltipTour({ onComplete, profile }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const TOUR_STEPS = buildSteps(profile)

  function skip() {
    localStorage.setItem('tour_complete', 'true')
    setVisible(false)
    onComplete?.()
  }

  function next() {
    if (step >= TOUR_STEPS.length - 1) {
      skip()
    } else {
      setStep(s => s + 1)
    }
  }

  if (!visible) return null

  const current = TOUR_STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '2rem',
        maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid var(--border)',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', justifyContent: 'center' }}>
          {TOUR_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 8, height: 8, borderRadius: 4,
              background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)60' : 'var(--border)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontSize: '1.15rem', textAlign: 'center' }}>
          {current.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
          {current.body}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button onClick={skip} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-muted)', borderRadius: 8,
            padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem',
          }}>
            Skip tour
          </button>
          <button onClick={next} style={{
            background: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 700,
          }}>
            {step === TOUR_STEPS.length - 1 ? '🚀 Get started!' : 'Next →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {step + 1} of {TOUR_STEPS.length}
        </p>
      </div>
    </div>
  )
}
