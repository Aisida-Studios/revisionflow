// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react'
import Skeleton from '../components/Skeleton'
import AIOutput from '../components/AIOutput'
import TooltipTour from '../components/TooltipTour'
import UpdatePrompt from '../components/UpdatePrompt'
import EmergencyBanner from '../components/EmergencyBanner'
import DailyQuests from '../components/DailyQuests'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { getSessions, getTasks, getPaperAttempts } from '../utils/firestore'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { getDailyAdvice } from '../utils/ai'
import { countdownLabel, countdownUrgency, gradeColour } from '../utils/calendar'
import { BADGE_LIST } from '../data/badges'
import { SUBJECT_COLOURS } from '../data/subjects'
import { applyReferralCodeForExistingUser } from '../utils/referrals'
import { format } from 'date-fns'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Flame, Zap, Calendar, FileText, Brain,
  CheckSquare, MessageSquare, ArrowRight, Clock, TrendingUp, Trophy,
  CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Gift
} from 'lucide-react'
import toast from 'react-hot-toast'

import { isExamDone, daysUntilExam as _daysTil } from '../utils/examUtils'

// Level formula — matches firestore.js
function xpForLevel(n) { return Math.floor(100 * Math.pow(1.15, n - 1)) }
function computeLevel(totalXP) {
  let lv = 1, cum = 0
  while (true) {
    const needed = xpForLevel(lv)
    if (cum + needed > totalXP) break
    cum += needed; lv++
  }
  return lv
}

// ── Beta user special thanks banner ──────────────────────────────────────────
function BetaThanksBanner({ onDismiss }) {
  return (
    <div style={{
      marginBottom: 20, borderRadius: 14, overflow: 'hidden',
      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)',
      boxShadow: '0 4px 24px rgba(124,58,237,0.25)',
    }}>
      <div style={{ padding: '20px 22px', position: 'relative' }}>
        <button onClick={onDismiss} style={{
          position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.15)',
          border: 'none', borderRadius: '50%', width: 26, height: 26,
          cursor: 'pointer', color: '#fff', fontSize: '1rem', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>👑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>
              Thank you for being a beta user
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 14px' }}>
              You helped shape RevisionFlow from the very beginning. As a thank you,
              you have <strong style={{ color: '#fff' }}>lifetime free access to all Pro features</strong> — including
              unlimited AI, all themes, timed quiz mode, and everything we build in the future.
              No subscription needed, ever.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Unlimited AI generations', 'All 10 themes', 'Timed quiz mode', 'All profile icons', 'Every future Pro feature'].map(f => (
                <span key={f} style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
                }}>✓ {f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 22px', background: 'rgba(0,0,0,0.15)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Your account is permanently marked as a lifetime member</span>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}>
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ── Personalised welcome card for new users ───────────────────────────────────
function WelcomeCard({ profile, onDismiss }) {
  const firstName   = (profile?.displayName || '').split(' ')[0] || 'there'
  const subjects    = profile?.subjects || []
  const subjNames   = subjects.slice(0, 3).map(s => s.name)
  const qual        = profile?.qualification || 'GCSE'
  const hasExams    = (profile?.examDates || []).length > 0
  const hasSubjects = subjects.length > 0

  function dismiss() {
    localStorage.setItem('welcome-dismissed', '1')
    onDismiss?.()
  }

  const nextSteps = [
    !hasExams    && { emoji: '📅', text: 'Add your exam dates', link: '/exams',    key: 'exams' },
    !hasSubjects && { emoji: '📚', text: 'Add your subjects',   link: '/settings?tab=subjects', key: 'subjects' },
    hasSubjects  && { emoji: '📆', text: 'Generate a revision schedule', link: '/calendar', key: 'cal' },
    hasSubjects  && { emoji: '🧠', text: 'Rate topic confidence', link: '/topics', key: 'topics' },
  ].filter(Boolean).slice(0, 3)

  return (
    <div style={{
      marginBottom: 20, borderRadius: 16, overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.08) 100%)',
      border: '1px solid rgba(124,58,237,0.25)',
    }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>
              Welcome to RevisionFlow, {firstName}! 🎉
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {hasSubjects
                ? "You're set up for " + qual + ' in ' + (subjNames.length > 1 ? subjNames.slice(0,-1).join(', ') + ' and ' + subjNames[subjNames.length-1] : subjNames[0]) + (subjects.length > 3 ? ' and ' + (subjects.length - 3) + ' more' : '') + '. Here\'s where to start:'
                : "Your account is ready. Let's get you set up — it takes about 2 minutes."
              }
            </p>
          </div>
          <button onClick={dismiss} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, flexShrink: 0, fontSize: '1.1rem', lineHeight: 1,
          }} title="Dismiss">×</button>
        </div>

        {nextSteps.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {nextSteps.map((step, i) => (
              <Link key={step.key} to={step.link} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', borderRadius: 999,
                background: i === 0 ? 'var(--accent)' : 'var(--bg-surface)',
                color: i === 0 ? '#fff' : 'var(--text-primary)',
                border: i === 0 ? 'none' : '1px solid var(--border)',
                textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
                transition: 'opacity 0.15s',
              }}>
                <span>{step.emoji}</span> {step.text}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* XP incentive strip */}
      <div style={{
        padding: '10px 20px', background: 'rgba(124,58,237,0.07)',
        borderTop: '1px solid rgba(124,58,237,0.12)',
        fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>⚡</span>
        Complete each step to earn XP and unlock your first badges. Start with the most urgent step above.
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [gdprConsent,    setGdprConsent]    = useState(localStorage.getItem('gdpr_consent') === 'true')
  const [todaySessions,  setTodaySessions]  = useState([])
  const [tasks,          setTasks]          = useState([])
  const [recentPapers,   setRecentPapers]   = useState([])
  const [aiAdvice,       setAiAdvice]       = useState('')
  const [aiLoading,      setAiLoading]      = useState(false)
  const [dataLoading,    setDataLoading]    = useState(true)
  // Tour: show only if profile says tourComplete is not set (new users) 
  // Falls back to localStorage for backwards compatibility, but Firestore is source of truth
  const [showTour, setShowTour] = useState(false)
  useEffect(() => {
    if (!profile) return
    const localDone = localStorage.getItem('tour_complete')
    const firestoreDone = profile.tourComplete
    if (!localDone && !firestoreDone) {
      setShowTour(true)
    }
  }, [profile?.uid])
  const [setupSkipped,      setSetupSkipped]      = useState(() => localStorage.getItem('setup-skipped') === '1')
  const [welcomeDismissed,  setWelcomeDismissed]  = useState(() => localStorage.getItem('welcome-dismissed') === '1')
  const [betaBannerDismissed, setBetaBannerDismissed] = useState(() => localStorage.getItem('beta-banner-dismissed') === '1')

  // New user = account created within last 48 hours
  const isNewUser = (() => {
    if (welcomeDismissed) return false
    const ts = profile?.createdAt?.toDate ? profile.createdAt.toDate() : null
    if (!ts) return false
    return (Date.now() - ts.getTime()) < 48 * 60 * 60 * 1000
  })()

  // Papers carousel
  const [carouselIdx,    setCarouselIdx]    = useState(0)
  const carouselRef = useRef(null)

  // Referral entry for existing users
  const [refCode,        setRefCode]        = useState('')
  const [refLoading,     setRefLoading]     = useState(false)
  const [showRefInput,   setShowRefInput]   = useState(false)

  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([
      getSessions(user.uid, { limit: 500 }),
      getTasks(user.uid),
      getPaperAttempts(user.uid, null),
    ]).then(([sessions, taskList, papers]) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd')

      const getSessionDate = (s) => {
        if (!s) return null
        if (s.date) return s.date
        if (typeof s.startTime === 'string') return s.startTime.substring(0, 10)
        if (s.startTime?.toDate) return format(s.startTime.toDate(), 'yyyy-MM-dd')
        return null
      }

      const sessionEvents = sessions.filter(s => getSessionDate(s) === todayStr)
      const taskEvents = taskList
        .filter(t => (t.dueDate || '').substring(0, 10) === todayStr)
        .map(t => ({ ...t, isTask: true, title: `Task: ${t.title}`, startTime: t.dueDate, subject: t.subject || 'General' }))

      const combined = [...sessionEvents, ...taskEvents].sort((a, b) => {
        const getVal = (x) => {
          if (x.start && x.start.includes(':')) return x.start
          if (typeof x.startTime === 'string' && x.startTime.includes('T'))
            return x.startTime.split('T')[1].substring(0, 5)
          return '00:00'
        }
        return getVal(a).localeCompare(getVal(b))
      })

      setTodaySessions(combined)
      setTasks(taskList.filter(t => !t.completed).slice(0, 5))

      const sorted = [...papers].sort((a, b) => {
        const da  = a.attemptDate ? new Date(a.attemptDate) : new Date((a.createdAt?.seconds || 0) * 1000)
        const db2 = b.attemptDate ? new Date(b.attemptDate) : new Date((b.createdAt?.seconds || 0) * 1000)
        return db2 - da
      })
      setRecentPapers(sorted.slice(0, 20))
      setDataLoading(false)
    }).catch(err => {
      console.error('Dashboard load error:', err)
      setDataLoading(false)
    })

    loadDailyBriefing()
  }, [user])

  async function loadDailyBriefing() {
    if (!user) return
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const ref = doc(db, 'users', user.uid, 'dailyBriefing', 'latest')
    try {
      const snap = await getDoc(ref)
      if (snap.exists() && snap.data().date === todayStr) {
        setAiAdvice(snap.data().text)
        return
      }
    } catch (e) {}
    setAiLoading(true)
    const res = await getDailyAdvice(user.uid, todaySessions, profile?.streak || 0, [])
    if (res?.text) {
      setAiAdvice(res.text)
      try { await setDoc(ref, { date: todayStr, text: res.text, createdAt: serverTimestamp() }) } catch (e) {}
    }
    setAiLoading(false)
  }

  async function handleApplyRefCode() {
    if (!refCode.trim() || !user) return
    setRefLoading(true)
    try {
      const ok = await applyReferralCodeForExistingUser(user.uid, refCode.trim())
      if (ok) {
        toast.success('🚀 Code applied! +100 XP and Rocket icon unlocked.')
        setShowRefInput(false)
        setRefCode('')
      } else {
        toast.error('Code not found, already used, or that\'s your own code.')
      }
    } catch (e) {
      toast.error('Something went wrong. Try again.')
    }
    setRefLoading(false)
  }

  // Computed level values
  const totalXP     = profile?.xp || 0
  const level       = computeLevel(totalXP)
  let xpSoFar = 0
  for (let i = 1; i < level; i++) xpSoFar += xpForLevel(i)
  const xpThisLevel = totalXP - xpSoFar
  const xpNeeded    = xpForLevel(level)
  const xpProgress  = Math.min(100, (xpThisLevel / xpNeeded) * 100)

  const LEVEL_TITLES = ['Newcomer','Studier','Consistent','Rising','Focused','Dedicated','Diligent','Scholar','High Achiever','Master','Legend']
  const levelTitle   = LEVEL_TITLES[Math.min(Math.floor((level - 1) / 5), LEVEL_TITLES.length - 1)]

  const badges = (profile?.badges || [])
    .map(id => BADGE_LIST.find(b => b.id === id))
    .filter(Boolean)

  const examCountdowns = (profile?.examDates || [])
    .filter(e => e.examDate)
    .map(e => ({ ...e, label: countdownLabel(e.examDate), urgency: countdownUrgency(e.examDate) }))
    .filter(e => e.urgency !== 'done')
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .slice(0, 4)

  const setupSteps = [
    { id: 'subjects', label: 'Add your subjects',           done: (profile?.subjects || []).length > 0,  link: '/settings?tab=subjects' },
    { id: 'exams',    label: 'Add exam dates',               done: (profile?.examDates || []).length > 0, link: '/exams' },
    { id: 'calendar', label: 'Generate a revision schedule', done: todaySessions.length > 0,               link: '/calendar' },
  ]
  const setupDone     = setupSteps.every(s => s.done)
  const setupProgress = setupSteps.filter(s => s.done).length

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  // Carousel helpers
  const totalCards = recentPapers.length
  function prevCard() { setCarouselIdx(i => Math.max(0, i - 1)) }
  function nextCard() { setCarouselIdx(i => Math.min(totalCards - 1, i + 1)) }

  const hasReferral = !!profile?.referredBy

  return (
    <>
      {/* Beta user special thanks banner */}
      {isBeta && !betaBannerDismissed && (
        <BetaThanksBanner onDismiss={() => { localStorage.setItem('beta-banner-dismissed','1'); setBetaBannerDismissed(true) }} />
      )}

      {showTour && <TooltipTour profile={profile} onComplete={async () => {
        setShowTour(false)
        localStorage.setItem('tour_complete', '1')
        if (user) {
          try {
            const { updateDoc, doc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            await updateDoc(doc(db, 'users', user.uid), { tourComplete: true })
          } catch (e) {}
        }
      }} />}

      {/* GDPR banner */}
      {!gdprConsent && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, background: 'var(--bg-surface)', borderTop: '2px solid var(--accent)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 -4px 20px rgba(0,0,0,0.3)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 600 }}>
            🍪 RevisionFlow stores your revision data to power your study features. By continuing, you agree to our{' '}
            <a href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</a>.
          </p>
          <button onClick={() => { localStorage.setItem('gdpr_consent', 'true'); setGdprConsent(true) }}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
            I Agree
          </button>
        </div>
      )}

      <div className="fade-in">
        <UpdatePrompt />
        <EmergencyBanner />

        {/* Welcome card for brand-new users (joined within 48h, setup not yet done) */}
        {isNewUser && !setupDone && (
          <WelcomeCard profile={profile} onDismiss={() => setWelcomeDismissed(true)} />
        )}

        {/* Setup checklist */}
        {!setupDone && !setupSkipped && (
          <div style={{ marginBottom: 20, padding: 16, background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.1))', border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} color="var(--accent-light)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Get started — {setupProgress}/{setupSteps.length} steps complete</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ height: 6, width: 100, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(setupProgress / setupSteps.length) * 100}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
                <button onClick={() => { localStorage.setItem('setup-skipped', '1'); setSetupSkipped(true) }} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>Skip</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {setupSteps.map(step => (
                <Link key={step.id} to={step.link} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: step.done ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface)', border: `1px solid ${step.done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, textDecoration: 'none', color: 'inherit' }}>
                  <CheckCircle2 size={16} color={step.done ? 'var(--success)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: step.done ? 400 : 600, color: step.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: step.done ? 'line-through' : 'none' }}>{step.label}</span>
                  {!step.done && <ChevronRight size={14} color="var(--text-muted)" />}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ marginBottom: 4 }}>
            Good {greeting},{' '}
            <span className="gradient-text">{profile?.displayName?.split(' ')[0] || profile?.profile?.displayName?.split(' ')[0]}!</span>
          </h1>
          <p>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {[
            { label: 'Streak',    val: <><span className="streak-fire">🔥</span>{profile?.streak || 0} days</>,               sub: 'Keep it going!',  col: 'var(--warning)' },
            { label: 'XP',        val: <><Zap size={15} style={{ color: 'var(--accent-light)' }} />{totalXP.toLocaleString()}</>, sub: `Level ${level}`, col: 'var(--accent-light)' },
            { label: 'Today',     val: todaySessions.length,  sub: `${todaySessions.filter(s => s.completed).length} done`, col: 'var(--success)' },
            (() => {
              const nextExam = (profile?.examDates || [])
                .filter(e => e.examDate && !isExamDone(e.examDate))
                .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0]
              const daysTo = nextExam ? _daysTil(nextExam.examDate) : null
              return { label: 'Next exam', val: daysTo === 0 ? 'Today!' : daysTo === 1 ? '1 day' : daysTo !== null ? `${daysTo} days` : '—', sub: nextExam ? `${nextExam.subject}` : 'No exams added', col: daysTo !== null && daysTo <= 7 ? 'var(--danger)' : daysTo !== null && daysTo <= 14 ? 'var(--warning)' : 'var(--accent-light)' }
            })(),
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.col, display: 'flex', alignItems: 'center', gap: 5 }}>
                {dataLoading ? <Skeleton width={60} height={24} /> : s.val}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {dataLoading ? <Skeleton width={80} height={12} style={{ marginTop: 4 }} /> : s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* XP progress bar — shows progress within current level only */}
        <div className="card" style={{ marginBottom: 20, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 600 }}>Level {level} — {levelTitle}</span>
            <span style={{ color: 'var(--text-muted)' }}>{xpThisLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP this level</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Daily quests */}
        <div style={{ marginBottom: 20 }}>
          <DailyQuests />
        </div>

        {/* Today + AI briefing */}
        <div className="grid-2" style={{ marginBottom: 20, gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Calendar size={17} color="var(--accent-light)" /> Today</h4>
              <Link to="/calendar" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {dataLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>{[1,2,3].map(i => <Skeleton key={i} height={48} />)}</div>
            ) : todaySessions.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <Calendar size={28} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No sessions today</p>
                <Link to="/calendar" className="btn btn-primary btn-sm">Open calendar</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {todaySessions.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: `1px solid ${s.completed ? 'var(--success)' : 'var(--border)'}`, opacity: s.completed ? 0.7 : 1 }}>
                    <div style={{ width: 3, height: 32, borderRadius: 2, background: SUBJECT_COLOURS[s.subject] || 'var(--accent)', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title || s.subject}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.start} · {s.duration || 45}min</div>
                    </div>
                    {s.completed && <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card accent-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <MessageSquare size={17} color="var(--accent-light)" />
              <h4>AI Daily Briefing</h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Updates daily</span>
            </div>
            {aiLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton height={14} width="90%" /><Skeleton height={14} width="100%" /><Skeleton height={14} width="80%" />
              </div>
            ) : aiAdvice ? (
              <AIOutput text={aiAdvice} label="AI Briefing" />
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading your daily briefing…</p>
            )}
            <Link to="/ai" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
              Open AI Advisor <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Exam countdowns + Tasks */}
        <div className="grid-2" style={{ marginBottom: 20, gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Clock size={17} color="var(--accent-light)" /> Upcoming Exams</h4>
              <Link to="/exams" className="btn btn-ghost btn-sm">All</Link>
            </div>
            {examCountdowns.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <p style={{ fontSize: '0.875rem' }}>No upcoming exams</p>
                <Link to="/exams" className="btn btn-primary btn-sm">Add exams</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {examCountdowns.map(e => (
                  <div key={e.id || e.subject + e.paper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.subject} P{e.paper}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.board} · {new Date(e.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <span className={`badge badge-${e.urgency === 'urgent' ? 'red' : e.urgency === 'soon' ? 'amber' : 'purple'}`}>{e.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 7 }}><CheckSquare size={17} color="var(--accent-light)" /> Tasks</h4>
              <Link to="/tasks" className="btn btn-ghost btn-sm">All</Link>
            </div>
            {dataLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{[1,2,3].map(i => <Skeleton key={i} height={42} />)}</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <p style={{ fontSize: '0.875rem' }}>No pending tasks</p>
                <Link to="/tasks" className="btn btn-primary btn-sm">Add task</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tasks.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--success)', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                      {t.dueDate && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due {new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent papers (carousel) + Badges */}
        <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>

          {/* Papers carousel */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 7 }}><TrendingUp size={17} color="var(--accent-light)" /> Recent Papers</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {recentPapers.length > 1 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{carouselIdx + 1}/{recentPapers.length}</span>
                )}
                <Link to="/papers" className="btn btn-ghost btn-sm">All</Link>
              </div>
            </div>

            {dataLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton height={120} style={{ marginBottom: 6 }} />
              </div>
            ) : recentPapers.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <p style={{ fontSize: '0.875rem' }}>No papers logged yet</p>
                <Link to="/papers" className="btn btn-primary btn-sm">Log a paper</Link>
              </div>
            ) : (() => {
              const p = recentPapers[carouselIdx]
              // Spark data for this subject across all papers
              const subjectPapers = recentPapers
                .filter(x => x.subject === p.subject && x.percentage)
                .sort((a, b) => new Date(a.attemptDate || 0) - new Date(b.attemptDate || 0))
              const sparkData = subjectPapers.slice(-8).map((x, i) => ({ i, pct: x.percentage, label: `P${x.paper} ${x.year}` }))
              const trend = sparkData.length >= 2 ? sparkData[sparkData.length - 1].pct - sparkData[0].pct : null

              return (
                <div>
                  {/* Main paper card */}
                  <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.subject}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {p.board} · Paper {p.paper} · {p.year}{p.tier ? ` · ${p.tier}` : ''}
                        </div>
                        {p.attemptDate && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {new Date(p.attemptDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {p.grade && (
                          <div style={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1, color: gradeColour(p.grade) }}>{p.grade}</div>
                        )}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {p.score}/{p.maxMarks}
                          {p.percentage ? ` · ${p.percentage}%` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Sparkline for this subject */}
                    {sparkData.length >= 2 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.subject} trend</span>
                          {trend !== null && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {trend >= 0 ? '+' : ''}{trend}%
                            </span>
                          )}
                        </div>
                        <ResponsiveContainer width="100%" height={40}>
                          <LineChart data={sparkData}>
                            <Line type="monotone" dataKey="pct" stroke="var(--accent)" strokeWidth={2} dot={false} />
                            <Tooltip
                              formatter={v => [`${v}%`]}
                              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.7rem' }}
                              labelFormatter={l => sparkData[l]?.label || ''}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Carousel navigation */}
                  {recentPapers.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <button
                        onClick={prevCard}
                        disabled={carouselIdx === 0}
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: carouselIdx === 0 ? 'not-allowed' : 'pointer', opacity: carouselIdx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Dots */}
                      <div style={{ display: 'flex', gap: 5 }}>
                        {recentPapers.slice(0, Math.min(recentPapers.length, 8)).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIdx(i)}
                            style={{
                              width: i === carouselIdx ? 16 : 7,
                              height: 7,
                              borderRadius: 999,
                              border: 'none',
                              cursor: 'pointer',
                              background: i === carouselIdx ? 'var(--accent)' : 'var(--bg-hover)',
                              transition: 'all 0.2s ease',
                              padding: 0,
                            }}
                          />
                        ))}
                        {recentPapers.length > 8 && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{recentPapers.length - 8}</span>
                        )}
                      </div>

                      <button
                        onClick={nextCard}
                        disabled={carouselIdx === totalCards - 1}
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: carouselIdx === totalCards - 1 ? 'not-allowed' : 'pointer', opacity: carouselIdx === totalCards - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Badges */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Trophy size={17} color="var(--warning)" /> Badges</h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{badges.length}/{BADGE_LIST.length}</span>
            </div>
            {badges.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '2.5rem' }}>🏅</div>
                <p style={{ fontSize: '0.875rem' }}>Complete your first session to earn badges!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {badges.map(b => (
                  <div
                    key={b.id}
                    title={`${b.name}: ${b.desc}`}
                    style={{
                      width: 56, height: 56,
                      borderRadius: 12,
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.7rem',
                      cursor: 'default',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(124,58,237,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {b.icon}
                  </div>
                ))}
              </div>
            )}
            <Link to="/profile" className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              View all {BADGE_LIST.length} badges →
            </Link>
          </div>
        </div>

        {/* Referral code entry for existing users */}
        {!hasReferral && (
          <div className="card" style={{ marginBottom: 20, padding: '14px 16px' }}>
            {!showRefInput ? (
              <button
                onClick={() => setShowRefInput(true)}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)' }}
              >
                <Gift size={14} /> Have a referral code? Enter it here
              </button>
            ) : (
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Gift size={15} color="var(--accent-light)" /> Enter a referral code
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}
                    placeholder="e.g. AB12CD34"
                    maxLength={8}
                    value={refCode}
                    onChange={e => setRefCode(e.target.value.toUpperCase())}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleApplyRefCode} disabled={refLoading || !refCode.trim()}>
                    {refLoading ? '…' : 'Apply'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowRefInput(false)}>Cancel</button>
                </div>
                <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  You'll earn +100 XP and unlock the 🚀 Rocket profile icon.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}
