// src/components/TooltipTour.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

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

  // Every step now carries the route it's actually describing. When the tour advances to a step
  // whose route differs from wherever the user currently is, it navigates there — previously the
  // tour was mounted only inside Dashboard.jsx and just displayed text ABOUT Calendar/Topics/AI
  // Advisor/Timer while the user stayed put on the dashboard the whole time, never actually seeing
  // the pages being described.
  const steps = [
    {
      route: '/dashboard',
      title: '👋 Hey ' + firstName + '!',
      body: subjList
        ? "You're set up for " + qual + ' in ' + subjList + (subjects.length > 3 ? ' and ' + (subjects.length - 3) + ' more' : '') + '. Quick 30-second tour of where everything lives.'
        : "Quick 30-second tour of where everything lives, then you're free to dive in.",
    },
    {
      route: '/dashboard',
      title: '📅 Your Dashboard',
      body: examCount > 0
        ? "This is home base — today's sessions, your next exam countdown, streak, and a fresh tip every day."
        : "This is home base. Once you add exam dates, you'll see a live countdown here alongside today's sessions and streak.",
    },
    {
      route: '/calendar',
      title: '📅 Calendar',
      body: subjList
        ? 'Generate a full revision schedule for ' + subjList + ' with one click — built around your exam dates and the availability you set during signup.'
        : 'Generate a full revision schedule with one click, built around your exam dates and availability.',
    },
    {
      route: '/topics',
      title: '🧠 Topics',
      body: subjects.length
        ? 'Every topic for ' + (subjNames[0] || 'your subjects') + ' is already pre-loaded. Rate your confidence 1–5 on each one, and RevisionFlow will know exactly what to prioritise.'
        : 'Topics auto-load once you add subjects in Settings. Rate your confidence 1–5 and RevisionFlow prioritises accordingly.',
    },
    {
      route: '/study',
      title: '📚 Study Tools',
      body: 'Generate flashcards for any topic, run a timed quiz, tackle board-accurate exam questions, and get your written answers marked leniently — like a real examiner would, not just exact-match.',
    },
    {
      route: '/ai',
      title: '✨ AI Advisor',
      body: target
        ? "Ask anything about your subjects and get grade predictions toward your target grade " + target + " — all personalised to your actual data, not generic advice."
        : 'Ask anything about your subjects and get grade predictions — all personalised to your actual data, not generic advice.',
    },
    {
      route: '/timer',
      title: '⏱ Timer',
      body: 'Built-in Pomodoro timer or stopwatch for focused sessions. Keeps running even when you switch pages, and earns you XP per minute.',
    },
    {
      route: '/dashboard',
      title: "🎯 You're all set, " + firstName + '!',
      body: examCount === 0
        ? 'First step: add your exam dates so the countdown and scheduling can kick in. Good luck! 🚀'
        : "Jump into Calendar to generate your first revision schedule, or head straight to Topics to start rating your confidence. Good luck! 🚀",
    },
  ]

  return steps
}

export default function TooltipTour({ onComplete, profile }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const TOUR_STEPS = buildSteps(profile)
  const navigate = useNavigate()
  const location = useLocation()

  // Navigate to whatever page the current step is describing. Runs on mount too (not just on step
  // change) so starting the tour from somewhere other than the dashboard still lands on the first
  // step's actual page rather than leaving the tour talking about a page that isn't showing.
  useEffect(() => {
    const targetRoute = TOUR_STEPS[step]?.route
    if (targetRoute && targetRoute !== location.pathname) {
      navigate(targetRoute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

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
      padding: 16, boxSizing: 'border-box',
    }}>
      <div style={{
        // Fixed to var(--bg-card) — the modal previously referenced var(--surface), which is not
        // defined anywhere in globals.css, so the tour card had no actual background colour at all.
        background: 'var(--bg-card)', borderRadius: 16, padding: '2rem',
        maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid var(--border)',
        // The fix for popups rendering below the viewport: this box previously had no maxHeight or
        // overflow handling at all, so on a short viewport (landscape mobile, a browser window with
        // dev tools open, a phone with the on-screen keyboard up) a tour step with a longer body could
        // push its own Next/Skip buttons and step counter below y=0 or off the bottom — with the
        // outer overlay itself not scrollable, there was no way to reach them. Capping the card's own
        // height and letting IT scroll internally guarantees the whole card, controls included, always
        // stays reachable regardless of viewport size or content length — matching how every other
        // modal in the app already behaves via the shared .modal class (see globals.css).
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', justifyContent: 'center' }}>
          {TOUR_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 8, height: 8, borderRadius: 4,
              background: i === step ? 'var(--accent)' : i < step ? 'var(--accent-pale)' : 'var(--border)',
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
