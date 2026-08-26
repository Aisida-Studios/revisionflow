// src/pages/Dashboard.jsx — UI v4
import React, { useEffect, useState, useRef } from 'react'
import AIOutput from '../components/AIOutput'
import ReferralRewardPopup from '../components/ReferralRewardPopup'
import EmergencyBanner from '../components/EmergencyBanner'
import DailyQuests from '../components/DailyQuests'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { getSessions, getPaperAttempts, getTopicsWithConfidence, getQuizResults, filterToCurrentQualification } from '../utils/firestore'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { getDailyAdvice } from '../utils/ai'
import { gradeColour } from '../utils/calendar'
import { computeWeakTopics, computeSubjectPredictions } from '../utils/gradeInsights'
import { BADGE_LIST } from '../data/badges'
import { SUBJECT_COLOURS, subjectColour, LEVELS, levelFromXP } from '../data/subjects'
import { applyReferralCodeForExistingUser } from '../utils/referrals'
import { format } from 'date-fns'
import {
  Flame, Zap, Calendar, FileText, Brain,
  CheckSquare, MessageSquare, ArrowRight, Clock, TrendingUp, Trophy,
  CheckCircle2, Circle, AlertCircle, ChevronRight, ChevronLeft, Gift, Crown,
  Star, Sparkles, BookOpen, Target, Snowflake, Lock, Timer as TimerIcon,
  GraduationCap, Rocket,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { isExamDone, daysUntilExam as _daysTil } from '../utils/examUtils'


// ── Beta thanks banner ────────────────────────────────────────────────────────
// Gold-toned rather than the brand green — this is a premium/reward moment
// (permanent lifetime Pro for early users), same visual language as the Pro
// badge and Upgrade CTA in Layout.jsx.
function BetaThanksBanner({ onDismiss }) {
  return (
    <div className="slide-up" style={{
      marginBottom: 20, borderRadius: 24, overflow: 'hidden',
      background: 'linear-gradient(135deg, #b45309 0%, #f59e0b 55%, #fbbf24 100%)',
      boxShadow: '0 8px 32px rgba(180,83,9,0.35), 0 2px 0 rgba(255,255,255,0.1) inset',
    }}>
      <div style={{ padding: '20px 22px', position: 'relative' }}>
        <button onClick={onDismiss} style={{
          position: 'absolute', top: 12, right: 14,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
          width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span className="float" style={{ flexShrink: 0, marginTop: 2 }}><Crown size={34} color="#fff" /></span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: 5 }}>
              Thank you for being a beta user!
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: '0 0 14px' }}>
              You helped build RevisionFlow. As a thank you, you have{' '}
              <strong style={{ color: '#fff' }}>lifetime Pro access</strong> — unlimited AI, all themes,
              timed quiz, and every feature we add in the future. Forever. No charge.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Unlimited AI','All themes','Timed quiz','All icons','Every future feature'].map(f => (
                <span key={f} style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}>✓ {f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{
        padding: '9px 22px', background: 'rgba(0,0,0,0.15)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)',
      }}>
        <span>Your account is permanently marked as a lifetime member</span>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)',
          cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline',
        }}>Dismiss</button>
      </div>
    </div>
  )
}

// ── Welcome card ──────────────────────────────────────────────────────────────
function WelcomeCard({ profile, onDismiss }) {
  const firstName = (profile?.displayName || '').split(' ')[0] || 'there'
  const subjects  = profile?.subjects || []
  const qual      = profile?.qualification || 'GCSE'
  const hasExams  = (profile?.examDates || []).length > 0
  const hasSubs   = subjects.length > 0

  const steps = [
    !hasSubs   && { emoji:'📚', text:'Add your subjects', link:'/settings?tab=subjects' },
    !hasExams  && { emoji:'⏰', text:'Add exam dates', link:'/exams' },
    hasSubs    && { emoji:'📅', text:'Generate revision schedule', link:'/calendar' },
    hasSubs    && { emoji:'🧠', text:'Rate topic confidence', link:'/topics' },
  ].filter(Boolean).slice(0, 3)

  return (
    <div className="card slide-up" style={{
      marginBottom: 20,
      background: 'linear-gradient(135deg, var(--accent-pale) 0%, var(--bg-card) 100%)',
      border: '2px solid var(--border-strong)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🎉</div>
          <h3 style={{ marginBottom: 4 }}>Welcome to RevisionFlow, {firstName}!</h3>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            {hasSubs
              ? `You're set up for ${qual}. Here's what to do next:`
              : "Let's get you set up — takes about 2 minutes."}
          </p>
        </div>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '1.3rem', padding: 4, flexShrink: 0,
        }}>×</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <Link key={s.text} to={s.link} className={`btn ${i === 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            {s.emoji} {s.text}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon:Icon, label, value, sub, colour, link, loading }) {
  const inner = (
    <div className="card card-interactive" style={{ textAlign: 'center', padding: '18px 14px' }}>
      <Icon size={22} color={colour} style={{ marginBottom: 6 }} />
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: colour, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  )
  if (link) return <Link to={link} style={{ textDecoration: 'none' }}>{inner}</Link>
  return inner
}

// ── Quick action ──────────────────────────────────────────────────────────────
function QuickAction({ icon:Icon, label, to, colour }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="card card-interactive" style={{ textAlign: 'center', padding: '16px 10px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, margin: '0 auto 10px',
          background: colour + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${colour}30`,
        }}><Icon size={22} color={colour} /></div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{label}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { isPro, isBeta } = useIsPro()
  const [gdprConsent,         setGdprConsent]         = useState(localStorage.getItem('gdpr_consent') === 'true')
  const [todaySessions,       setTodaySessions]        = useState([])
  const [allSessions,         setAllSessions]          = useState([])
  const [recentPapers,        setRecentPapers]         = useState([])
  const [allPapers,           setAllPapers]            = useState([])
  const [topics,              setTopics]               = useState([])
  const [quizResults,         setQuizResults]          = useState([])
  const [aiAdvice,            setAiAdvice]             = useState('')
  const [aiLoading,           setAiLoading]            = useState(false)
  const [dataLoading,         setDataLoading]          = useState(true)
  const [setupSkipped,        setSetupSkipped]         = useState(() => localStorage.getItem('setup-skipped') === '1')
  const [welcomeDismissed,    setWelcomeDismissed]     = useState(() => localStorage.getItem('welcome-dismissed') === '1')
  const [betaBannerDismissed, setBetaBannerDismissed] = useState(() => localStorage.getItem('beta-banner-dismissed') === '1')
  const [refCode,             setRefCode]             = useState('')
  const [refLoading,          setRefLoading]          = useState(false)
  const [showRefInput,        setShowRefInput]        = useState(false)
  const [showReferredReward,  setShowReferredReward]  = useState(false)

  const isNewUser = (() => {
    if (welcomeDismissed) return false
    const ts = profile?.createdAt?.toDate ? profile.createdAt.toDate() : null
    if (!ts) return false
    return (Date.now() - ts.getTime()) < 48 * 60 * 60 * 1000
  })()

  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([
      getSessions(user.uid),
      getPaperAttempts(user.uid),
      getTopicsWithConfidence(user.uid, profile?.subjects),
      getQuizResults(user.uid),
    ]).then(([sessions, papers, topicDocs, quizzes]) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const getDate = s => s.date || (s.startTime?.toDate ? format(s.startTime.toDate(), 'yyyy-MM-dd') : (typeof s.startTime === 'string' ? s.startTime.slice(0,10) : null))
      setTodaySessions(sessions.filter(s => getDate(s) === todayStr))
      setAllSessions(sessions)
      const sorted = [...papers].sort((a,b) => {
        const da = a.attemptDate ? new Date(a.attemptDate) : new Date((a.createdAt?.seconds||0)*1000)
        const db2= b.attemptDate ? new Date(b.attemptDate) : new Date((b.createdAt?.seconds||0)*1000)
        return db2 - da
      })
      setRecentPapers(sorted.slice(0,6))
      setAllPapers(papers)
      setTopics(topicDocs)
      setQuizResults(quizzes)
      setDataLoading(false)
    }).catch(() => setDataLoading(false))
    loadDailyBriefing()
  }, [user])

  async function loadDailyBriefing() {
    if (!user) return
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const ref = doc(db, 'users', user.uid, 'dailyBriefing', 'latest')
    try {
      const snap = await getDoc(ref)
      if (snap.exists() && snap.data().date === todayStr) { setAiAdvice(snap.data().text); return }
    } catch(e) {}
    setAiLoading(true)
    const res = await getDailyAdvice(user.uid, [], profile?.streak||0, [])
    if (res?.text) {
      setAiAdvice(res.text)
      try { await setDoc(ref, { date: todayStr, text: res.text, createdAt: serverTimestamp() }) } catch(e) {}
    }
    setAiLoading(false)
  }

  async function handleApplyRefCode() {
    if (!refCode.trim() || !user) return
    setRefLoading(true)
    try {
      const ok = await applyReferralCodeForExistingUser(user.uid, refCode.trim())
      if (ok) { setShowReferredReward(true); setShowRefInput(false); setRefCode('') }
      else toast.error("Code not found or already used.")
    } catch(e) { toast.error('Something went wrong.') }
    setRefLoading(false)
  }

  // Computed values
  const totalXP       = profile?.xp || 0
  const level         = levelFromXP(totalXP)
  const currentLvlXp  = LEVELS[level - 1]?.xpRequired || 0
  const nextLvlXp      = LEVELS[level]?.xpRequired ?? (currentLvlXp + 1000000)
  const xpThisLevel   = totalXP - currentLvlXp
  const xpNeeded      = nextLvlXp - currentLvlXp
  const xpProgress    = Math.min(100, (xpThisLevel / xpNeeded) * 100)
  const levelTitle    = LEVELS[level - 1]?.title || 'Newcomer'

  const badges = (profile?.badges||[]).map(id => BADGE_LIST.find(b=>b.id===id)).filter(Boolean)

  const weakTopics = computeWeakTopics(topics)
  const currentPapers = filterToCurrentQualification(allPapers, profile?.subjects)
  const currentQuizResults = filterToCurrentQualification(quizResults, profile?.subjects)
  const predictions = computeSubjectPredictions(topics, currentPapers, currentQuizResults, profile)
  const visiblePredictions = (isPro || isBeta) ? predictions : predictions.slice(0, 1)
  const hiddenPredictionCount = predictions.length - visiblePredictions.length

  // Per-subject progress (confidence-based) — was missing entirely; derived
  // straight from the already-loaded `topics`, grouped by t.subject, average
  // t.confidence (1–5 scale) converted to a percentage. Sorted alphabetically
  // rather than weakest-first, since "Weak topics this week" already covers
  // that framing further down — this section is a neutral overview instead.
  const subjectProgress = Object.values(
    topics.reduce((acc, t) => {
      if (!t.subject) return acc
      if (!acc[t.subject]) acc[t.subject] = { subject: t.subject, sum: 0, rated: 0, total: 0 }
      acc[t.subject].total += 1
      if (t.confidence != null && t.confidence > 0) {
        acc[t.subject].sum += t.confidence
        acc[t.subject].rated += 1
      }
      return acc
    }, {})
  ).map(s => ({
    subject: s.subject,
    pct: s.rated ? Math.round((s.sum / s.rated / 5) * 100) : 0,
    rated: s.rated,
    total: s.total,
  })).sort((a,b) => a.subject.localeCompare(b.subject))

  // First not-yet-completed session today, for the "next session" hero card.
  const nextSession = todaySessions.find(s => !s.completed) || null

  // The four core progress metrics (brief §16) — study time, average grade,
  // topic confidence, sessions. Study time/sessions use `allSessions` (added
  // above; previously the fetch discarded everything except today). Average
  // grade uses paper percentages only — quiz results aren't read here since
  // their percentage field isn't verified against this page's data shape;
  // safer to under-cover than to guess at an unverified field name.
  const completedSessions = allSessions.filter(s => s.completed)
  const totalStudyMinutes = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const studyTimeLabel = `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`
  const avgGradePct = currentPapers.length
    ? Math.round(currentPapers.reduce((sum, p) => sum + (p.percentage || 0), 0) / currentPapers.length)
    : null
  const ratedTopicsAll = topics.filter(t => t.confidence > 0)
  const avgConfidencePct = ratedTopicsAll.length
    ? Math.round((ratedTopicsAll.reduce((sum, t) => sum + t.confidence, 0) / ratedTopicsAll.length / 5) * 100)
    : null

  // Recent activity feed — merges the two sources that already have reliable,
  // verified date handling (recentPapers is pre-sorted; today's completed
  // sessions have a plain time string). Deliberately not pulling in topic
  // rating history too, since that source's timestamp shape isn't verified
  // here and a wrong merge would be worse than a shorter, correct list.
  const recentActivity = [
    ...recentPapers.slice(0,3).map(p => ({
      key: `paper-${p.id}`, label: `Completed past paper`,
      detail: `${p.subject} · Paper ${p.paperNumber}${p.year ? ` (${p.year})` : ''}`,
      when: p.attemptDate || null,
    })),
    ...todaySessions.filter(s=>s.completed).slice(0,3).map(s => ({
      key: `session-${s.id}`, label: `Completed session`,
      detail: s.title || s.subject, when: 'Today',
    })),
  ].slice(0,4)

  // Streak freeze status — mirrors the rolling 7-day window logic in
  // firestore.js:recordActivityStreak, purely for display here (that function is the only
  // place that actually consumes/writes a freeze).
  const freezeIsPro = isPro || isBeta
  const freezeAllowance = freezeIsPro ? 3 : 1
  const freezeWeekFresh = !profile?.freezeWeekStart ||
    Math.round((new Date() - new Date(profile.freezeWeekStart)) / 86400000) >= 7
  const freezesUsed = freezeWeekFresh ? 0 : (profile?.freezesUsedThisWeek || 0)
  const freezesRemaining = Math.max(0, freezeAllowance - freezesUsed)

  const nextExam = (profile?.examDates||[])
    .filter(e => e.examDate && !isExamDone(e.examDate))
    .sort((a,b) => new Date(a.examDate) - new Date(b.examDate))[0]
  const daysToExam = nextExam ? _daysTil(nextExam.examDate) : null

  const setupSteps = [
    { id:'subjects', label:'Add your subjects',           done:(profile?.subjects||[]).length>0, link:'/settings?tab=subjects' },
    { id:'exams',    label:'Add exam dates',               done:(profile?.examDates||[]).length>0, link:'/exams' },
    { id:'calendar', label:'Generate revision schedule',   done:todaySessions.length>0, link:'/calendar' },
  ]
  const setupDone     = setupSteps.every(s=>s.done)
  const setupProgress = setupSteps.filter(s=>s.done).length

  // Was morning/afternoon only (anything after 12:00 said "Good afternoon",
  // including 9pm) — now the three-state greeting the brief calls for.
  const hour     = new Date().getHours()
  const greeting = hour<12 ? 'Good morning' : hour<18 ? 'Good afternoon' : 'Good evening'
  const hasRef   = !!profile?.referredBy

  const QUICK_ACTIONS = [
    { icon:Zap,            label:'Study Tools', to:'/study',       colour:'var(--accent)' },
    { icon:Brain,          label:'Topics',      to:'/topics',      colour:'#0369a1' },
    { icon:TimerIcon,      label:'Timer',       to:'/timer',       colour:'#0891b2' },
    { icon:MessageSquare,  label:'AI Advisor',  to:'/ai',          colour:'#64748b' },
    { icon:GraduationCap,  label:'Tutor',       to:'/tutor',       colour:'#0d9488' },
    { icon:FileText,       label:'Past Papers', to:'/papers',      colour:'#f59e0b' },
    { icon:Calendar,       label:'Calendar',    to:'/calendar',    colour:'#10b981' },
    { icon:TrendingUp,     label:'Analytics',   to:'/analytics',   colour:'#3b82f6' },
    { icon:Trophy,         label:'Leaderboard', to:'/leaderboard', colour:'#f43f5e' },
  ]

  return (
    <div className="fade-in">
      {showReferredReward && (
        <ReferralRewardPopup variant="referred" onClose={() => setShowReferredReward(false)} />
      )}

      {!gdprConsent && (
        <div className="above-mobile-nav" style={{
          position:'fixed', left:0, right:0, zIndex:9999,
          background:'var(--bg-card)', borderTop:'2px solid var(--border-strong)',
          padding:'14px 20px', display:'flex', alignItems:'center',
          justifyContent:'space-between', flexWrap:'wrap', gap:10,
          boxShadow:'0 -4px 24px rgba(0,0,0,0.12)',
        }}>
          <p style={{ margin:0, fontSize:'0.875rem' }}>
            🍪 RevisionFlow stores your revision data. By continuing you agree to our{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
          <button className="btn btn-primary btn-sm"
            onClick={() => { localStorage.setItem('gdpr_consent','true'); setGdprConsent(true) }}>
            Accept & continue
          </button>
        </div>
      )}

      <EmergencyBanner />

      {isBeta && !betaBannerDismissed && (
        <BetaThanksBanner onDismiss={() => { localStorage.setItem('beta-banner-dismissed','1'); setBetaBannerDismissed(true) }} />
      )}

      {isNewUser && !setupDone && (
        <WelcomeCard profile={profile} onDismiss={() => { localStorage.setItem('welcome-dismissed','1'); setWelcomeDismissed(true) }} />
      )}

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div>
            <h1 style={{ marginBottom: 2 }}>
              {greeting},{' '}
              <span className="gradient-text">{profile?.displayName?.split(' ')[0] || 'there'}!</span>
            </h1>
            <p style={{ fontSize:'0.9rem', margin:0 }}>{format(new Date(),'EEEE, d MMMM yyyy')}</p>
          </div>
          {isPro && (
            <div style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'6px 14px', borderRadius:999,
              background:'linear-gradient(135deg,#f59e0b,#fbbf24)',
              color:'#fff', fontSize:'0.8rem', fontWeight:700,
              boxShadow:'var(--shadow-sm)',
            }}>
              <Crown size={14} /> Pro
            </div>
          )}
        </div>
      </div>

      {/* ── Setup checklist ── */}
      {!setupDone && !setupSkipped && (
        <div className="card slide-up" style={{ marginBottom:20, borderColor:'var(--border-strong)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Rocket size={19} color="var(--accent)" />
              <span style={{ fontWeight:700, fontSize:'0.95rem' }}>Get started — {setupProgress}/{setupSteps.length} complete</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="progress-bar" style={{ width:90, height:10 }}>
                <div className="progress-fill" style={{ width:`${(setupProgress/setupSteps.length)*100}%` }} />
              </div>
              <button onClick={() => { localStorage.setItem('setup-skipped','1'); setSetupSkipped(true) }}
                className="btn btn-ghost btn-sm">Skip</button>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {setupSteps.map(step => (
              <Link key={step.id} to={step.link} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'12px 14px', borderRadius:14, textDecoration:'none', color:'inherit',
                background: step.done ? 'var(--success-pale)' : 'var(--bg-muted)',
                border: `2px solid ${step.done ? 'var(--success-border)' : 'var(--border)'}`,
                transition:'all 0.2s',
              }}>
                {step.done ? <CheckCircle2 size={18} color="var(--success)" /> : <Circle size={18} color="var(--text-muted)" />}
                <span style={{ flex:1, fontWeight:600, fontSize:'0.875rem', color: step.done ? 'var(--success)' : 'var(--text-primary)', textDecoration: step.done?'line-through':'none' }}>
                  {step.label}
                </span>
                {!step.done && <ChevronRight size={16} color="var(--text-muted)" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 1: Next session + Upcoming exams, side by side ── */}
      <div style={{ display:'grid', gridTemplateColumns: nextSession ? '1.6fr 1fr' : '1fr', gap:16, marginBottom:20 }} className="dash-row-1">
        <div className="card">
          {nextSession ? (
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>
                Your next session
              </div>
              <h2 style={{ marginBottom:2 }}>{nextSession.subject}</h2>
              <p style={{ fontSize:'0.9rem', marginBottom:14 }}>{nextSession.title || 'Revision session'}</p>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, color:'var(--text-muted)', fontSize:'0.82rem' }}>
                <Clock size={14} /> {nextSession.duration || 45} min
              </div>
              <Link to="/study" className="btn btn-primary">
                Start session <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>
                Your next session
              </div>
              <h3 style={{ marginBottom:6 }}>Nothing scheduled for today</h3>
              <p style={{ fontSize:'0.875rem', marginBottom:14 }}>Jump into a subject now, or generate a plan from your calendar.</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <Link to="/study" className="btn btn-primary">Start studying</Link>
                <Link to="/calendar" className="btn btn-secondary">Open calendar</Link>
              </div>
            </div>
          )}
        </div>

        {(profile?.examDates||[]).filter(e=>e.examDate&&!isExamDone(e.examDate)).length > 0 && (
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h4>Upcoming exams</h4>
              <Link to="/exams" style={{ fontSize:'0.78rem', color:'var(--accent)', fontWeight:600 }}>View all</Link>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {(profile.examDates||[])
                .filter(e=>e.examDate&&!isExamDone(e.examDate))
                .sort((a,b)=>new Date(a.examDate)-new Date(b.examDate))
                .slice(0,3)
                .map(e => {
                  const days = _daysTil(e.examDate)
                  const urg  = days<=7?'var(--danger)':days<=14?'var(--warning)':'var(--accent)'
                  return (
                    <div key={e.id||e.examDate} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:urg, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.subject}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{e.board}</div>
                      </div>
                      <div style={{ fontSize:'0.78rem', fontWeight:700, color:urg, flexShrink:0 }}>
                        {days===0?'Today':days===1?'1d':`${days}d`}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* ── Row 2: Your progress — the four core metrics (§16) ── */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <h3>Your progress</h3>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span className="badge badge-purple" style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Zap size={11} /> Level {level} · {totalXP.toLocaleString()} XP
            </span>
            <Link to="/analytics" style={{ fontSize:'0.78rem', color:'var(--accent)', fontWeight:600 }}>View analytics</Link>
          </div>
        </div>
        <div className="card">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }} className="dash-progress-grid">
            {[
              { icon:Clock, label:'Study time', value: dataLoading?'—':studyTimeLabel, colour:'var(--accent)' },
              { icon:Target, label:'Average grade', value: dataLoading?'—':(avgGradePct!=null?`${avgGradePct}%`:'—'), colour:'var(--info)' },
              { icon:Brain, label:'Topic confidence', value: dataLoading?'—':(avgConfidencePct!=null?`${avgConfidencePct}%`:'—'), colour:'var(--success)' },
              { icon:Calendar, label:'Sessions', value: dataLoading?'—':completedSessions.length, colour:'var(--gold)' },
            ].map(m => (
              <div key={m.label} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <m.icon size={17} color={m.colour} style={{ marginTop:2, flexShrink:0 }} />
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:'1.25rem', letterSpacing:'-0.01em', lineHeight:1.1 }}>{m.value}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, marginTop:2 }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Subject-by-subject progress (dashboard priority #3, §11/§15) ── */}
      {subjectProgress.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div className="card">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {subjectProgress.map(s => (
                <div key={s.subject}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                    <span style={{ fontWeight:600 }}>{s.subject}</span>
                    <span style={{ fontWeight:700, color:'var(--text-secondary)' }}>
                      {s.rated>0 ? `${s.pct}%` : 'Not rated yet'}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height:8 }}>
                    <div className="progress-fill" style={{ width:`${s.pct}%`, background: subjectColour?.(s.subject)||'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Today's goal + Streak + Recent activity, side by side ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }} className="dash-row-3">
        <div className="card">
          <h4 style={{ marginBottom:10 }}>Today's goal</h4>
          <div style={{ fontWeight:800, fontSize:'1.6rem', marginBottom:8 }}>
            {todaySessions.filter(s=>s.completed).length} / {todaySessions.length || 1}
            <span style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-muted)' }}> sessions</span>
          </div>
          <div className="progress-bar" style={{ height:10, marginBottom:10 }}>
            <div className="progress-fill" style={{ width:`${todaySessions.length ? (todaySessions.filter(s=>s.completed).length/todaySessions.length)*100 : 0}%` }} />
          </div>
          <Link to="/calendar" style={{ fontSize:'0.78rem', color:'var(--accent)', fontWeight:600 }}>View goals</Link>
        </div>

        <div className="card">
          <h4 style={{ marginBottom:10 }}>{profile?.streak||0} day streak</h4>
          <div style={{ display:'flex', gap:5, marginBottom:8 }}>
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <div key={i} style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:'0.62rem', color:'var(--text-muted)', marginBottom:3 }}>{d}</div>
                <div style={{
                  width:'100%', aspectRatio:1, borderRadius:'50%',
                  background: i < Math.min(7, profile?.streak||0) ? 'var(--success)' : 'var(--bg-hover)',
                  border: i < Math.min(7, profile?.streak||0) ? 'none' : '2px solid var(--border)',
                }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
            {freezesRemaining>0?`${freezesRemaining} freeze${freezesRemaining===1?'':'s'} left this week`:'Keep it going!'}
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom:10 }}>Recent activity</h4>
          {recentActivity.length === 0 ? (
            <p style={{ fontSize:'0.8rem', margin:0 }}>Nothing yet — complete a session or a paper to see it here.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {recentActivity.map(a => (
                <div key={a.key} style={{ fontSize:'0.8rem' }}>
                  <div style={{ fontWeight:600 }}>{a.label}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.72rem' }}>{a.detail} · {a.when}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Daily quests ── */}
      <div style={{ marginBottom:20 }}>
        <DailyQuests />
      </div>

      {/* ── Today + Daily Briefing ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Today's sessions */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h4 style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Calendar size={16} /> Today
            </h4>
            <Link to="/calendar" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {dataLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton-pulse" style={{ height:52, borderRadius:12 }} />)}
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="empty-state" style={{ padding:'24px 0' }}>
              <span style={{ fontSize:'2.5rem' }}>📭</span>
              <p style={{ fontSize:'0.875rem', margin:0 }}>No sessions scheduled</p>
              <Link to="/calendar" className="btn btn-primary btn-sm" style={{ marginTop:8 }}>Open calendar</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {todaySessions.slice(0,4).map(s => (
                <div key={s.id} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                  borderRadius:12, border:'2px solid var(--border)',
                  background: s.completed ? 'var(--success-pale)' : 'var(--bg-muted)',
                  borderColor: s.completed ? 'var(--success-border)' : 'var(--border)',
                }}>
                  <div style={{ width:4, height:36, borderRadius:99, background: subjectColour?.(s.subject)||'var(--accent)', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:'0.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.title||s.subject}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                      {s.start} · {s.duration||45}min
                    </div>
                  </div>
                  {s.completed && <CheckCircle2 size={18} color="var(--success)" />}
                </div>
              ))}
              {todaySessions.length > 4 && (
                <Link to="/calendar" style={{ fontSize:'0.78rem', color:'var(--accent)', fontWeight:600, textAlign:'center', padding:6 }}>
                  +{todaySessions.length-4} more →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Daily Briefing */}
        <div className="card accent-card">
          <h4 style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <Sparkles size={16} /> Daily Briefing
            <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginLeft:'auto', fontWeight:400 }}>Updates daily</span>
          </h4>
          {aiLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[80,100,70].map(w => <div key={w} className="skeleton-pulse" style={{ height:14, width:`${w}%`, borderRadius:6 }} />)}
            </div>
          ) : aiAdvice ? (
            <AIOutput text={aiAdvice} />
          ) : (
            <div className="empty-state" style={{ padding:'16px 0' }}>
              <Sparkles size={28} style={{ opacity:0.35 }} />
              <p style={{ fontSize:'0.82rem', margin:0 }}>No briefing yet today</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop:8 }} onClick={loadDailyBriefing}>
                Generate briefing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Predicted grades ── */}
      {(profile?.subjects||[]).length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><Target size={18} /> Predicted grades</h3>
            {predictions.length > 0 && <span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Rough estimate, not official</span>}
          </div>
          {dataLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton-pulse" style={{ height:104, borderRadius:16 }} />)}
            </div>
          ) : predictions.length === 0 ? (
            <div className="card empty-state" style={{ padding:'20px 16px' }}>
              <TrendingUp size={28} style={{ opacity:0.35 }} />
              <p style={{ fontSize:'0.82rem', margin:0 }}>Log a past paper or take a quiz to see a predicted grade here</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
              {visiblePredictions.map(p => (
                <div key={p.subject} className="card" style={{ padding:'14px' }}>
                  <div style={{ fontWeight:700, fontSize:'0.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:6 }}>
                    {p.subject}
                  </div>
                  <div style={{ fontWeight:800, fontSize:'1.8rem', color:gradeColour(p.grade), lineHeight:1 }}>{p.grade}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4 }}>{p.percentage}% blended</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:6, lineHeight:1.4 }}>
                    {[
                      p.sources.papers ? `${p.sources.papers} paper${p.sources.papers===1?'':'s'}` : null,
                      p.sources.quizzes ? `${p.sources.quizzes} quiz${p.sources.quizzes===1?'':'zes'}` : null,
                      p.sources.topicsRated ? `${p.sources.topicsRated} rated topic${p.sources.topicsRated===1?'':'s'}` : null,
                    ].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
              {hiddenPredictionCount > 0 && (
                <Link to="/pro" style={{ textDecoration:'none' }}>
                  <div className="card" style={{ padding:'14px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', height:'100%', border:'1px dashed var(--border)', minHeight:104 }}>
                    <Lock size={16} style={{ color:'var(--text-muted)', marginBottom:6 }} />
                    <div style={{ fontSize:'0.78rem', fontWeight:700 }}>+{hiddenPredictionCount} more subject{hiddenPredictionCount===1?'':'s'}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--accent)', marginTop:2 }}>Unlock with Pro</div>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Weak topics this week ── */}
      {(profile?.subjects||[]).length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><Brain size={18} /> Weak topics this week</h3>
            <Link to="/topics" className="btn btn-ghost btn-sm">Rate topics</Link>
          </div>
          {dataLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton-pulse" style={{ height:52, borderRadius:12 }} />)}
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="card empty-state" style={{ padding:'20px 16px' }}>
              <CheckCircle2 size={28} style={{ opacity:0.35 }} />
              <p style={{ fontSize:'0.82rem', margin:0 }}>Nothing rated below 2/5 right now — nice work</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {weakTopics.map(t => (
                <Link key={t.id} to="/topics" style={{ textDecoration:'none', color:'inherit' }}>
                  <div className="card card-interactive" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' }}>
                    <div style={{ width:4, height:32, borderRadius:99, background: subjectColour?.(t.subject)||'var(--accent)', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                        {t.subject}{t.board ? ` · ${t.board}` : ''}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ width:7, height:7, borderRadius:'50%', background: n<=t.confidence?'var(--danger)':'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Quick actions grid ── */}
      <div style={{ marginBottom:20 }}>
        <h3 style={{ marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <Zap size={18} /> Quick actions
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {QUICK_ACTIONS.map(a => <QuickAction key={a.to} {...a} />)}
        </div>
      </div>

      {/* ── Recent papers ── */}
      {recentPapers.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><FileText size={18} /> Recent papers</h3>
            <Link to="/papers" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
            {recentPapers.map(p => (
              <div key={p.id} className="card" style={{ padding:'14px' }}>
                <div style={{ fontWeight:800, fontSize:'1.3rem', color:gradeColour(p.grade,p.subject,p.qualification||'GCSE'), marginBottom:4 }}>
                  {p.grade||'?'}
                </div>
                <div style={{ fontWeight:600, fontSize:'0.8rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.subject}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{p.year} · Paper {p.paperNumber}</div>
                {p.percentage != null && (
                  <div style={{ marginTop:6 }}>
                    <div className="progress-bar" style={{ height:6 }}>
                      <div className="progress-fill" style={{ width:`${p.percentage}%`, background: gradeColour(p.grade,p.subject,p.qualification||'GCSE') }} />
                    </div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:2 }}>{p.percentage}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges showcase ── */}
      {badges.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><Trophy size={18} /> Badges</h3>
            <Link to="/profile" className="btn btn-ghost btn-sm">View all {badges.length}</Link>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {badges.slice(0,12).map(b => (
              <div key={b.id} title={`${b.name}: ${b.desc}`}
                className="card card-interactive"
                style={{ width:54, height:54, padding:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', borderRadius:16, border:'2px solid var(--border)' }}>
                {b.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Referral entry ── */}
      {!hasRef && (
        <div className="card" style={{ marginBottom:20, textAlign:'center', padding:24 }}>
          <Gift size={28} color="var(--accent)" style={{ marginBottom:8 }} />
          <h4 style={{ marginBottom:6 }}>Have a referral code?</h4>
          <p style={{ fontSize:'0.875rem', marginBottom:12 }}>You both earn XP + unlock the Rocket icon</p>
          {showRefInput ? (
            <div style={{ display:'flex', gap:8, maxWidth:300, margin:'0 auto' }}>
              <input className="input" placeholder="Enter code" value={refCode}
                onChange={e=>setRefCode(e.target.value.toUpperCase())}
                onKeyDown={e=>e.key==='Enter'&&handleApplyRefCode()} />
              <button className="btn btn-primary btn-sm" onClick={handleApplyRefCode} disabled={refLoading}>
                {refLoading?'…':'Apply'}
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowRefInput(true)}>
              Enter code
            </button>
          )}
        </div>
      )}
    </div>
  )
}
