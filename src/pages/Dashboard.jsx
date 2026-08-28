// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame, Trophy, Clock, Target, TrendingUp, BookOpen, ChevronRight,
  CalendarDays, Award, PlayCircle, CheckCircle2, Lock, Compass,
  ClipboardList, Inbox, Gift, PartyPopper, X,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import Skeleton from '../components/Skeleton'
import DailyQuests from '../components/DailyQuests'
import EmergencyBanner from '../components/EmergencyBanner'
import TopicUpdateBanner from '../components/TopicUpdateBanner'
import ReferralCard from '../components/ReferralCard'
import ReferralRewardPopup from '../components/ReferralRewardPopup'

import {
  getSessions, getPaperAttempts, getQuizResults, getTopicsWithConfidence,
  filterToCurrentQualification,
} from '../utils/firestore'
import { applyReferralCodeForExistingUser } from '../utils/referrals'
import { computeSubjectPredictions, computeWeakTopics } from '../utils/gradeInsights'
import { filterUpcomingExams, countdownLabel, countdownUrgency } from '../utils/examUtils'
import { gradeColour } from '../utils/calendar'
import { LEVELS, levelFromXP, subjectColour } from '../data/subjects'
import { BADGE_MAP } from '../data/badges'

/* ─────────────────────────────────────────────────────────────────────────
   Small presentational helpers, local to this file only. Section.jsx was
   ruled out — it's the collapsible admin-panel primitive (AdminDataEditor /
   Admin.jsx), not a general card, so it's the wrong shape for a student-
   facing dashboard. These use the SAME existing tokens/classes (.card,
   .badge-*, .conf-dots, .streak-fire, .empty-state, .progress-bar) as the
   rest of the app rather than inventing a parallel visual language.
   ───────────────────────────────────────────────────────────────────────── */

function greetingWord(hour) {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good evening'
}

function firstName(profile, user) {
  const raw = profile?.displayName || user?.displayName || ''
  return raw.trim().split(' ')[0] || 'there'
}

function fmtHours(minutes) {
  if (!minutes) return '0h'
  const h = minutes / 60
  return h >= 10 ? `${Math.round(h)}h` : `${Math.round(h * 10) / 10}h`
}

function SubjectDot({ subject }) {
  return <span className="subject-dot" style={{ background: subjectColour(subject) }} />
}

function ExamRow({ exam }) {
  const urgency = countdownUrgency(exam.examDate)
  return (
    <li className="exam-row">
      <SubjectDot subject={exam.subject} />
      <div className="exam-row-main">
        <span className="exam-row-subject">{exam.subject}</span>
        <span className="exam-row-meta">{exam.board}{exam.qualification ? ` · ${exam.qualification}` : ''}</span>
      </div>
      <span className={`badge ${urgency === 'urgent' ? 'badge-red' : urgency === 'soon' ? 'badge-amber' : 'badge-grey'}`}>
        {countdownLabel(exam.examDate)}
      </span>
    </li>
  )
}

function EmptyInline({ icon: Icon, text, actionLabel, actionTo }) {
  return (
    <div className="empty-state" style={{ padding: '32px 16px' }}>
      <Icon size={30} strokeWidth={1.5} className="empty-icon" style={{ fontSize: 'unset', opacity: 0.45 }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{text}</p>
      {actionTo && (
        <Link to={actionTo} className="btn btn-secondary btn-sm">{actionLabel}</Link>
      )}
    </div>
  )
}

function BetaThanks({ onDismiss }) {
  return (
    <div className="card gold-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <PartyPopper size={20} style={{ color: 'var(--gold)', flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: '0.9rem' }}>
        Thanks for being a beta user — you've got Pro features free, for good.
      </p>
      <button type="button" className="btn-icon" onClick={onDismiss} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}

function SetupChecklist({ profile }) {
  const items = [
    { done: !!profile?.subjects?.length, label: 'Add your subjects', to: '/settings' },
    { done: !!profile?.examDates?.length, label: 'Set your exam dates', to: '/exams' },
    { done: !!profile?.displayName, label: 'Set your display name', to: '/settings' },
  ]
  const remaining = items.filter((i) => !i.done)
  if (!remaining.length) return null
  return (
    <div className="card accent-card" style={{ marginBottom: 16 }}>
      <div className="dash-card-head"><h2>Finish setting up</h2></div>
      <ul className="checklist">
        {remaining.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="checklist-item">
              <span className="checklist-dot" />
              {i.label}
              <ChevronRight size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BadgeShowcase({ earnedIds }) {
  const earned = (earnedIds || [])
    .map((id) => BADGE_MAP[id])
    .filter(Boolean)
  if (!earned.length) {
    return <EmptyInline icon={Trophy} text="No badges yet — keep revising to unlock your first one." />
  }
  return (
    <div className="badge-showcase">
      {earned.slice(0, 12).map((b) => (
        <span key={b.id} className="badge badge-pop" title={b.description || b.name}>
          {b.icon} {b.name}
        </span>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="dash">
      <div className="card hero-section">
        <Skeleton width={180} height={30} />
        <Skeleton width={260} height={16} style={{ marginTop: 10 }} />
        <div className="hero-stats" style={{ marginTop: 28 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={64} />)}
        </div>
      </div>
      <div className="dash-row-1" style={{ marginTop: 20 }}>
        <Skeleton height={180} />
        <Skeleton height={180} />
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { to: '/study', label: 'Start studying', icon: BookOpen },
  { to: '/timer', label: 'Focus timer', icon: Clock },
  { to: '/papers', label: 'Past papers', icon: ClipboardList },
  { to: '/topics', label: 'Topics', icon: Target },
  { to: '/tutor', label: 'Tutor', icon: Compass },
  { to: '/ai', label: 'AI Advisor', icon: TrendingUp },
  { to: '/mistakes', label: 'Mistakes log', icon: X },
  { to: '/calendar', label: 'Plan my week', icon: CalendarDays },
  { to: '/exams', label: 'Exam dates', icon: Award },
]

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { isPro } = useIsPro()

  const [sessions, setSessions] = useState([])
  const [paperAttempts, setPaperAttempts] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [topics, setTopics] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const [refCode, setRefCode] = useState('')
  const [refBusy, setRefBusy] = useState(false)
  const [refError, setRefError] = useState('')
  const [refReward, setRefReward] = useState(null)
  const [betaThanksDismissed, setBetaThanksDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('rf_beta_thanks_dismissed') === '1'
  )

  useEffect(() => {
    document.title = 'Dashboard · RevisionFlow'
  }, [])

  function dismissBetaThanks() {
    localStorage.setItem('rf_beta_thanks_dismissed', '1')
    setBetaThanksDismissed(true)
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setDataLoading(true)
    Promise.all([
      getSessions(user.uid),
      getPaperAttempts(user.uid),
      getQuizResults(user.uid),
      getTopicsWithConfidence(user.uid, profile?.subjects || []),
    ]).then(([s, p, q, t]) => {
      if (cancelled) return
      setSessions(s || [])
      setPaperAttempts(p || [])
      setQuizResults(q || [])
      setTopics(t || [])
      setDataLoading(false)
    }).catch(() => { if (!cancelled) setDataLoading(false) })
    return () => { cancelled = true }
    // profile.subjects is included so a subject/qualification change in Settings
    // is reflected next time this mounts, rather than reading a stale closure.
  }, [user, profile?.subjects])

  const currentPapers = useMemo(
    () => filterToCurrentQualification(paperAttempts, profile?.subjects || []),
    [paperAttempts, profile?.subjects]
  )
  const currentQuizzes = useMemo(
    () => filterToCurrentQualification(quizResults, profile?.subjects || []),
    [quizResults, profile?.subjects]
  )

  const predictions = useMemo(
    () => (profile ? computeSubjectPredictions(topics, currentPapers, currentQuizzes, profile) : []),
    [topics, currentPapers, currentQuizzes, profile]
  )
  const weakTopics = useMemo(() => computeWeakTopics(topics, 5), [topics])

  const upcomingExams = useMemo(
    () => filterUpcomingExams(profile?.examDates || []).slice(0, 4),
    [profile?.examDates]
  )
  const nextExam = upcomingExams[0] || null

  const now = new Date()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  const minutesThisWeek = useMemo(() => {
    return sessions
      .filter((s) => s.completed)
      .filter((s) => {
        const d = s.date?.toDate ? s.date.toDate() : (s.startTime?.toDate ? s.startTime.toDate() : (s.date ? new Date(s.date) : null))
        return d && d >= weekStart
      })
      .reduce((sum, s) => sum + (s.duration || 0), 0)
  }, [sessions])

  const completedSessionCount = useMemo(() => sessions.filter((s) => s.completed).length, [sessions])

  const avgPrediction = useMemo(() => {
    if (!predictions.length) return null
    const withPct = predictions.filter((p) => typeof p.percentage === 'number')
    if (!withPct.length) return null
    return Math.round(withPct.reduce((sum, p) => sum + p.percentage, 0) / withPct.length)
  }, [predictions])

  const avgConfidence = useMemo(() => {
    if (!topics.length) return null
    const rated = topics.filter((t) => t.confidence)
    if (!rated.length) return null
    return Math.round((rated.reduce((sum, t) => sum + t.confidence, 0) / rated.length) * 20)
  }, [topics])

  const xp = profile?.xp || 0
  const level = levelFromXP(xp)
  const thisLevel = LEVELS[level - 1] || LEVELS[0]
  const nextLevel = LEVELS[level] || null
  const xpIntoLevel = xp - (thisLevel?.xpRequired || 0)
  const xpForNext = nextLevel ? nextLevel.xpRequired - (thisLevel?.xpRequired || 0) : 0
  const xpPercent = nextLevel ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 100

  const streak = profile?.streak || 0
  const hasAnyData = sessions.length > 0 || currentPapers.length > 0 || currentQuizzes.length > 0

  const visiblePredictions = isPro ? predictions : predictions.slice(0, 1)
  const hiddenPredictionCount = Math.max(0, predictions.length - visiblePredictions.length)

  async function handleApplyRefCode(e) {
    e.preventDefault()
    if (!refCode.trim() || !user) return
    setRefBusy(true)
    setRefError('')
    try {
      const result = await applyReferralCodeForExistingUser(user.uid, refCode.trim())
      setRefReward(result)
      setRefCode('')
    } catch (err) {
      setRefError(err?.message || 'That code did not work — check it and try again.')
    } finally {
      setRefBusy(false)
    }
  }

  if (!profile) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dash">
      {refReward && <ReferralRewardPopup reward={refReward} onClose={() => setRefReward(null)} />}

      <EmergencyBanner />
      <TopicUpdateBanner />
      {profile?.betaUser && !betaThanksDismissed && <BetaThanks onDismiss={dismissBetaThanks} />}
      <SetupChecklist profile={profile} />

      {/* ── Hero: who you are, how you're doing, what's next ─────────────── */}
      <section className="card hero-section" data-tour="dashboard-greeting">
        <div className="hero-top">
          <div>
            <p className="hero-eyebrow">{greetingWord(now.getHours())}</p>
            <h1 className="hero-title">{firstName(profile, user)}</h1>
            {nextExam ? (
              <p className="hero-sub">
                <CalendarDays size={16} />
                {nextExam.subject} · {countdownLabel(nextExam.examDate)}
              </p>
            ) : (
              <p className="hero-sub">No exams on your calendar yet — add your subjects in Settings.</p>
            )}
          </div>
          {isPro && <span className="badge badge-gold">Pro</span>}
        </div>

        {dataLoading ? (
          <div className="hero-stats" style={{ marginTop: 28 }}>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={64} />)}
          </div>
        ) : (
          <div className="hero-stats" data-tour="dashboard-streak">
            <div className="hero-stat">
              <Flame size={20} className="streak-fire" style={{ color: streak > 0 ? '#f97316' : 'var(--text-muted)' }} />
              <div>
                <span className="stat-value" style={{ fontSize: '1.5rem' }}>{streak}</span>
                <span className="stat-label">day streak</span>
              </div>
            </div>
            <div className="hero-stat">
              <Trophy size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <span className="stat-value" style={{ fontSize: '1.5rem' }}>Lv {level}</span>
                <span className="stat-label">{thisLevel?.title || 'Studier'}</span>
              </div>
            </div>
            <div className="hero-stat">
              <Clock size={20} style={{ color: 'var(--info)' }} />
              <div>
                <span className="stat-value" style={{ fontSize: '1.5rem' }}>{fmtHours(minutesThisWeek)}</span>
                <span className="stat-label">this week</span>
              </div>
            </div>
            <div className="hero-stat hero-stat--xp">
              <div className="hero-xp-row">
                <span className="stat-label" style={{ marginTop: 0 }}>{xpIntoLevel} / {xpForNext || '—'} XP</span>
                <Link to="/profile" className="dash-link-sm">Level {level + 1} <ChevronRight size={12} /></Link>
              </div>
              <div className="progress-bar" role="progressbar" aria-valuenow={xpPercent} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress to next level">
                <div className="progress-fill xp-bar-fill" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>
        )}
      </section>

      {!dataLoading && !hasAnyData && (
        <div className="card accent-card" style={{ marginTop: 20, textAlign: 'center', padding: '40px 24px' }}>
          <BookOpen size={32} style={{ color: 'var(--accent)' }} />
          <h2 style={{ margin: '12px 0 6px' }}>Your revision hub is ready</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            Log your first session to start tracking streaks, XP and progress.
          </p>
          <Link to="/study" className="btn btn-primary">Start studying</Link>
        </div>
      )}

      {/* ── Row 1: what's coming up, what to do right now ────────────────── */}
      <div className="dash-row-1" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="dash-card-head">
            <h2><CalendarDays size={18} /> Upcoming exams</h2>
            <Link to="/exams" className="dash-link-sm">All dates <ChevronRight size={12} /></Link>
          </div>
          {dataLoading ? (
            <Skeleton height={120} />
          ) : upcomingExams.length ? (
            <ul className="exam-list">
              {upcomingExams.map((e) => <ExamRow key={e.id || `${e.subject}-${e.examDate}`} exam={e} />)}
            </ul>
          ) : (
            <EmptyInline icon={CalendarDays} text="No upcoming exams found for your subjects." actionLabel="Check exam dates" actionTo="/exams" />
          )}
        </div>

        <div className="card">
          <div className="dash-card-head">
            <h2><Target size={18} /> Needs attention</h2>
            <Link to="/topics" className="dash-link-sm">All topics <ChevronRight size={12} /></Link>
          </div>
          {dataLoading ? (
            <Skeleton height={120} />
          ) : weakTopics.length ? (
            <ul className="priority-list">
              {weakTopics.map((t) => (
                <li key={t.id} className="priority-row">
                  <SubjectDot subject={t.subject} />
                  <div className="priority-row-main">
                    <span className="priority-row-name">{t.name}</span>
                    <span className="priority-row-meta">{t.subject}</span>
                  </div>
                  <div className="conf-dots" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`conf-dot ${n <= t.confidence ? `active-${t.confidence}` : ''}`} style={{ cursor: 'default' }} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyInline icon={Target} text="Nothing flagged as low-confidence — nice work." actionLabel="Rate your topics" actionTo="/topics" />
          )}
        </div>
      </div>

      {/* ── Today: goals and quests ────────────────────────────────────────── */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="dash-card-head">
            <h2><CheckCircle2 size={18} /> Today's plan</h2>
            <Link to="/calendar" className="dash-link-sm">Calendar <ChevronRight size={12} /></Link>
          </div>
          <TodayPlan sessions={sessions} loading={dataLoading} />
        </div>
        <div className="card">
          <DailyQuests />
        </div>
      </div>

      {/* ── Progress overview: the four numbers that matter ───────────────── */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="dash-card-head">
          <h2><TrendingUp size={18} /> Progress</h2>
          <Link to="/analytics" className="dash-link-sm">Full analytics <ChevronRight size={12} /></Link>
        </div>
        {dataLoading ? (
          <div className="dash-progress-grid">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={78} />)}
          </div>
        ) : (
          <div className="dash-progress-grid">
            <div className="dash-progress-cell">
              <span className="stat-value">{fmtHours(minutesThisWeek)}</span>
              <span className="stat-label">Study time this week</span>
            </div>
            <div className="dash-progress-cell">
              <span className="stat-value">{avgPrediction != null ? `${avgPrediction}%` : '—'}</span>
              <span className="stat-label">Average score</span>
            </div>
            <div className="dash-progress-cell">
              <span className="stat-value">{avgConfidence != null ? `${avgConfidence}%` : '—'}</span>
              <span className="stat-label">Topic confidence</span>
            </div>
            <div className="dash-progress-cell">
              <span className="stat-value">{completedSessionCount}</span>
              <span className="stat-label">Sessions completed</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Row 3: predicted grades + recent activity ──────────────────────── */}
      <div className="dash-row-3" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="dash-card-head">
            <h2><Award size={18} /> Predicted grades</h2>
          </div>
          {dataLoading ? (
            <Skeleton height={140} />
          ) : predictions.length ? (
            <>
              <ul className="grade-list">
                {visiblePredictions.map((p) => (
                  <li key={`${p.board}-${p.subject}`} className="grade-row">
                    <SubjectDot subject={p.subject} />
                    <span className="grade-row-subject">{p.subject}</span>
                    <span className="badge" style={{ background: `${gradeColour(p.grade)}22`, color: gradeColour(p.grade), fontWeight: 800 }}>
                      {p.grade}
                    </span>
                  </li>
                ))}
              </ul>
              {hiddenPredictionCount > 0 && (
                <Link to="/pro" className="dash-locked-row">
                  <Lock size={14} />
                  <span>{hiddenPredictionCount} more subject{hiddenPredictionCount > 1 ? 's' : ''} — unlock with Pro</span>
                </Link>
              )}
            </>
          ) : (
            <EmptyInline icon={Award} text="Complete a quiz or past paper to see predicted grades." actionLabel="Try a paper" actionTo="/papers" />
          )}
        </div>

        <div className="card">
          <div className="dash-card-head">
            <h2><PlayCircle size={18} /> Recent activity</h2>
          </div>
          <RecentActivity sessions={sessions} papers={currentPapers} loading={dataLoading} />
        </div>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="dash-card-head"><h2>Quick actions</h2></div>
        <div className="grid-3 quick-actions">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className="quick-action">
              <a.icon size={18} />
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="dash-card-head">
          <h2><Trophy size={18} /> Achievements</h2>
          <Link to="/profile" className="dash-link-sm">All badges <ChevronRight size={12} /></Link>
        </div>
        <BadgeShowcase earnedIds={profile.badges} />
      </div>

      {!profile.referredBy && (
        <div className="card gold-card" style={{ marginTop: 20 }}>
          <div className="dash-card-head"><h2><Gift size={18} /> Have a referral code?</h2></div>
          <form onSubmit={handleApplyRefCode} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="input"
              style={{ flex: '1 1 200px' }}
              placeholder="Enter code"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              disabled={refBusy}
            />
            <button type="submit" className="btn btn-gold" disabled={refBusy || !refCode.trim()}>
              {refBusy ? 'Applying…' : 'Apply'}
            </button>
          </form>
          {refError && <p className="form-error" style={{ marginTop: 8 }}>{refError}</p>}
          <ReferralCard variant="compact" />
        </div>
      )}
    </div>
  )
}

/* ── Today's plan: calendar-scheduled sessions for today ────────────────── */
function TodayPlan({ sessions, loading }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const todaySessions = useMemo(() => {
    return sessions.filter((s) => {
      const d = s.date?.toDate ? s.date.toDate() : (s.date ? new Date(s.date) : null)
      return d && d >= today && d < tomorrow
    })
  }, [sessions])

  if (loading) return <Skeleton height={90} />

  if (!todaySessions.length) {
    return <EmptyInline icon={Inbox} text="Nothing scheduled for today." actionLabel="Plan today" actionTo="/calendar" />
  }

  const done = todaySessions.filter((s) => s.completed).length

  return (
    <div>
      <div className="progress-bar" style={{ marginBottom: 12 }}>
        <div className="progress-fill" style={{ width: `${Math.round((done / todaySessions.length) * 100)}%` }} />
      </div>
      <ul className="exam-list">
        {todaySessions.slice(0, 4).map((s) => (
          <li key={s.id} className="exam-row">
            <SubjectDot subject={s.subject} />
            <div className="exam-row-main">
              <span className="exam-row-subject">{s.title || s.subject}</span>
              <span className="exam-row-meta">{s.duration ? `${s.duration} min` : ''}</span>
            </div>
            {s.completed ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            ) : (
              <span className="badge badge-grey">Pending</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Recent activity: merges recent sessions + recent papers ────────────── */
function RecentActivity({ sessions, papers, loading }) {
  const items = useMemo(() => {
    const fromSessions = sessions
      .filter((s) => s.completed)
      .map((s) => ({
        id: `s-${s.id}`,
        subject: s.subject,
        label: s.title || s.subject || 'Study session',
        date: s.date?.toDate ? s.date.toDate() : (s.date ? new Date(s.date) : null),
        icon: BookOpen,
      }))
    const fromPapers = papers.map((p) => ({
      id: `p-${p.id}`,
      subject: p.subject,
      label: `${p.subject} — Paper ${p.paperNumber || ''}`.trim(),
      date: p.createdAt?.toDate ? p.createdAt.toDate() : (p.attemptDate ? new Date(p.attemptDate) : null),
      icon: ClipboardList,
    }))
    return [...fromSessions, ...fromPapers]
      .filter((i) => i.date)
      .sort((a, b) => b.date - a.date)
      .slice(0, 5)
  }, [sessions, papers])

  if (loading) return <Skeleton height={120} />

  if (!items.length) {
    return <EmptyInline icon={PartyPopper} text="No activity yet — your first session will show up here." actionLabel="Start studying" actionTo="/study" />
  }

  return (
    <ul className="exam-list">
      {items.map((i) => (
        <li key={i.id} className="exam-row">
          <SubjectDot subject={i.subject} />
          <div className="exam-row-main">
            <span className="exam-row-subject">{i.label}</span>
            <span className="exam-row-meta">{i.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
