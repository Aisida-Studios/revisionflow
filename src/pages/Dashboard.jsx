// src/pages/Dashboard.jsx — UI v3
import React, { useEffect, useState, useRef } from 'react'
import AIOutput from '../components/AIOutput'
import TooltipTour from '../components/TooltipTour'
import EmergencyBanner from '../components/EmergencyBanner'
import DailyQuests from '../components/DailyQuests'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { getSessions, getPaperAttempts } from '../utils/firestore'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { getDailyAdvice } from '../utils/ai'
import { gradeColour } from '../utils/calendar'
import { BADGE_LIST } from '../data/badges'
import { SUBJECT_COLOURS, subjectColour } from '../data/subjects'
import { applyReferralCodeForExistingUser } from '../utils/referrals'
import { format } from 'date-fns'
import {
  Flame, Zap, Calendar, FileText, Brain,
  CheckSquare, MessageSquare, ArrowRight, Clock, TrendingUp, Trophy,
  CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Gift, Crown,
  Star, Sparkles, BookOpen, Target,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { isExamDone, daysUntilExam as _daysTil } from '../utils/examUtils'

function xpForLevel(n) { return Math.floor(100 * Math.pow(1.15, n - 1)) }
function computeLevel(totalXP) {
  let lv = 1, cum = 0
  while (true) { const n = xpForLevel(lv); if (cum + n > totalXP) break; cum += n; lv++ }
  return lv
}

const LEVEL_TITLES = ['Newcomer','Studier','Consistent','Rising Star','Focused','Dedicated','Diligent','Scholar','High Achiever','Master','Legend']

// ── Beta thanks banner ────────────────────────────────────────────────────────
function BetaThanksBanner({ onDismiss }) {
  return (
    <div className="slide-up" style={{
      marginBottom: 20, borderRadius: 24, overflow: 'hidden',
      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #6366f1 100%)',
      boxShadow: '0 8px 32px rgba(124,58,237,0.4), 0 2px 0 rgba(255,255,255,0.1) inset',
    }}>
      <div style={{ padding: '20px 22px', position: 'relative' }}>
        <button onClick={onDismiss} style={{
          position: 'absolute', top: 12, right: 14,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
          width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span className="float" style={{ fontSize: '2.5rem', flexShrink: 0 }}>👑</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', marginBottom: 5 }}>
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
    !hasExams  && { emoji:'📅', text:'Add exam dates', link:'/exams' },
    hasSubs    && { emoji:'📆', text:'Generate revision schedule', link:'/calendar' },
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
function StatCard({ emoji, label, value, sub, colour, link, loading }) {
  const inner = (
    <div className="card card-interactive" style={{ textAlign: 'center', padding: '18px 14px' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: colour, letterSpacing: '-0.02em', lineHeight: 1 }}>
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
function QuickAction({ emoji, label, to, colour }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="card card-interactive" style={{ textAlign: 'center', padding: '16px 10px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, margin: '0 auto 10px',
          background: colour + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
          border: `2px solid ${colour}30`,
        }}>{emoji}</div>
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
  const [recentPapers,        setRecentPapers]         = useState([])
  const [aiAdvice,            setAiAdvice]             = useState('')
  const [aiLoading,           setAiLoading]            = useState(false)
  const [dataLoading,         setDataLoading]          = useState(true)
  const [showTour,            setShowTour]             = useState(false)
  const [setupSkipped,        setSetupSkipped]         = useState(() => localStorage.getItem('setup-skipped') === '1')
  const [welcomeDismissed,    setWelcomeDismissed]     = useState(() => localStorage.getItem('welcome-dismissed') === '1')
  const [betaBannerDismissed, setBetaBannerDismissed] = useState(() => localStorage.getItem('beta-banner-dismissed') === '1')
  const [refCode,             setRefCode]             = useState('')
  const [refLoading,          setRefLoading]          = useState(false)
  const [showRefInput,        setShowRefInput]        = useState(false)

  useEffect(() => {
    if (!profile) return
    if (!localStorage.getItem('tour_complete') && !profile.tourComplete) setShowTour(true)
  }, [profile?.uid])

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
    ]).then(([sessions, papers]) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const getDate = s => s.date || (s.startTime?.toDate ? format(s.startTime.toDate(), 'yyyy-MM-dd') : (typeof s.startTime === 'string' ? s.startTime.slice(0,10) : null))
      setTodaySessions(sessions.filter(s => getDate(s) === todayStr))
      const sorted = [...papers].sort((a,b) => {
        const da = a.attemptDate ? new Date(a.attemptDate) : new Date((a.createdAt?.seconds||0)*1000)
        const db2= b.attemptDate ? new Date(b.attemptDate) : new Date((b.createdAt?.seconds||0)*1000)
        return db2 - da
      })
      setRecentPapers(sorted.slice(0,6))
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
      if (ok) { toast.success('🚀 Code applied! +100 XP unlocked.'); setShowRefInput(false); setRefCode('') }
      else toast.error("Code not found or already used.")
    } catch(e) { toast.error('Something went wrong.') }
    setRefLoading(false)
  }

  // Computed values
  const totalXP      = profile?.xp || 0
  const level        = computeLevel(totalXP)
  let xpSoFar = 0
  for (let i = 1; i < level; i++) xpSoFar += xpForLevel(i)
  const xpThisLevel  = totalXP - xpSoFar
  const xpNeeded     = xpForLevel(level)
  const xpProgress   = Math.min(100, (xpThisLevel / xpNeeded) * 100)
  const levelTitle   = LEVEL_TITLES[Math.min(Math.floor((level-1)/5), LEVEL_TITLES.length-1)]

  const badges = (profile?.badges||[]).map(id => BADGE_LIST.find(b=>b.id===id)).filter(Boolean)

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

  const hour     = new Date().getHours()
  const greeting = hour<12?'Good morning':'Good afternoon'
  const hasRef   = !!profile?.referredBy

  const QUICK_ACTIONS = [
    { emoji:'✨', label:'Study Tools', to:'/study',       colour:'#7c3aed' },
    { emoji:'🧠', label:'Topics',      to:'/topics',      colour:'#8b5cf6' },
    { emoji:'⏱',  label:'Timer',       to:'/timer',       colour:'#06b6d4' },
    { emoji:'🤖', label:'AI Advisor',  to:'/ai',          colour:'#a855f7' },
    { emoji:'📄', label:'Past Papers', to:'/papers',      colour:'#f59e0b' },
    { emoji:'📅', label:'Calendar',    to:'/calendar',    colour:'#10b981' },
    { emoji:'📊', label:'Analytics',   to:'/analytics',   colour:'#3b82f6' },
    { emoji:'🏆', label:'Leaderboard', to:'/leaderboard', colour:'#f43f5e' },
  ]

  return (
    <div className="fade-in">
      {showTour && <TooltipTour profile={profile} onComplete={async () => {
        setShowTour(false)
        localStorage.setItem('tour_complete','1')
        if (user) {
          try { const {updateDoc,doc:d}=await import('firebase/firestore'); const {db:db2}=await import('../firebase'); await updateDoc(d(db2,'users',user.uid),{tourComplete:true}) } catch(e){}
        }
      }} />}

      {!gdprConsent && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
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
              background:'linear-gradient(135deg,#7c3aed,#a855f7)',
              color:'#fff', fontSize:'0.8rem', fontWeight:800,
              boxShadow:'0 4px 14px rgba(124,58,237,0.35)',
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
              <span style={{ fontSize:'1.3rem' }}>🚀</span>
              <span style={{ fontWeight:800, fontSize:'0.95rem' }}>Get started — {setupProgress}/{setupSteps.length} complete</span>
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
                <span style={{ fontSize:'1.1rem' }}>{step.done ? '✅' : '⭕'}</span>
                <span style={{ flex:1, fontWeight:600, fontSize:'0.875rem', color: step.done ? 'var(--success)' : 'var(--text-primary)', textDecoration: step.done?'line-through':'none' }}>
                  {step.label}
                </span>
                {!step.done && <ChevronRight size={16} color="var(--text-muted)" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── XP + level card ── */}
      <div className="card" style={{ marginBottom:20, background:'linear-gradient(135deg,var(--accent-pale),var(--bg-card))' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
              <span style={{ fontSize:'1.4rem' }}>⚡</span>
              <span style={{ fontWeight:900, fontSize:'1.1rem', color:'var(--accent)' }}>Level {level}</span>
              <span className="badge badge-purple">{levelTitle}</span>
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
              {xpThisLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP to Level {level+1}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontWeight:900, fontSize:'1.4rem', color:'var(--accent)' }}>{totalXP.toLocaleString()}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Total XP</div>
          </div>
        </div>
        <div className="progress-bar" style={{ height:14 }}>
          <div className="progress-fill xp-bar-fill" style={{ width:`${xpProgress}%` }} />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <StatCard emoji="🔥" label="Streak"    value={`${profile?.streak||0}d`}  sub="Keep it going!" colour="var(--warning)"      link="/analytics" loading={dataLoading} />
        <StatCard emoji="📅" label="Sessions today"     value={todaySessions.length}        sub={`${todaySessions.filter(s=>s.completed).length} completed`} colour="var(--success)" link="/calendar" loading={dataLoading} />
        <StatCard emoji="🏅" label="Badges"    value={badges.length}               sub="earned"         colour="var(--gold)"         link="/profile"   loading={dataLoading} />
        <StatCard emoji="📅" label="Next exam" value={daysToExam===0?'Today!':daysToExam===1?'1 day':daysToExam!=null?`${daysToExam}d`:'—'} sub={nextExam?.subject||'No exams'} colour={daysToExam!=null&&daysToExam<=7?'var(--danger)':daysToExam!=null&&daysToExam<=14?'var(--warning)':'var(--info)'} link="/exams" loading={dataLoading} />
      </div>

      {/* ── Daily quests ── */}
      <div style={{ marginBottom:20 }}>
        <DailyQuests />
      </div>

      {/* ── Today + AI Briefing ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Today's sessions */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h4 style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:'1.1rem' }}>📅</span> Today
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
                  {s.completed && <span style={{ fontSize:'1.1rem' }}>✅</span>}
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

        {/* AI Briefing */}
        <div className="card accent-card">
          <h4 style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <span style={{ fontSize:'1.1rem' }}>🤖</span> AI Daily Briefing
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
              <span style={{ fontSize:'2rem' }}>💭</span>
              <p style={{ fontSize:'0.82rem', margin:0 }}>No briefing yet today</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop:8 }} onClick={loadDailyBriefing}>
                Generate briefing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions grid ── */}
      <div style={{ marginBottom:20 }}>
        <h3 style={{ marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.1rem' }}>⚡</span> Quick actions
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {QUICK_ACTIONS.map(a => <QuickAction key={a.to} {...a} />)}
        </div>
      </div>

      {/* ── Upcoming exams ── */}
      {(profile?.examDates||[]).filter(e=>e.examDate&&!isExamDone(e.examDate)).length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><span>📆</span> Upcoming exams</h3>
            <Link to="/exams" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
            {(profile.examDates||[])
              .filter(e=>e.examDate&&!isExamDone(e.examDate))
              .sort((a,b)=>new Date(a.examDate)-new Date(b.examDate))
              .slice(0,4)
              .map(e => {
                const days = _daysTil(e.examDate)
                const urg  = days<=7?'var(--danger)':days<=14?'var(--warning)':'var(--accent)'
                return (
                  <div key={e.id||e.examDate} className="card" style={{ borderColor: days<=7?'var(--danger-border)':days<=14?'var(--warning-border)':'var(--border)', background: days<=7?'var(--danger-pale)':days<=14?'var(--warning-pale)':'var(--bg-card)' }}>
                    <div style={{ fontWeight:800, fontSize:'2rem', color:urg, lineHeight:1 }}>
                      {days===0?'📢':days===1?'1d':`${days}d`}
                    </div>
                    <div style={{ fontWeight:700, fontSize:'0.85rem', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {e.subject}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{e.board} · {e.examDate}</div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Recent papers ── */}
      {recentPapers.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><span>📄</span> Recent papers</h3>
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
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><span>🏅</span> Badges</h3>
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
          <div style={{ fontSize:'1.8rem', marginBottom:8 }}>🎁</div>
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
