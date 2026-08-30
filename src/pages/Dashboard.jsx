// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, ClipboardList, CheckCircle2, CheckSquare,
  Trophy, Award, PartyPopper, Gift, X, CalendarDays, Target,
  Leaf, FlaskConical, Atom, Calculator, Landmark, Globe2, Cpu, GraduationCap,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import Skeleton from '../components/Skeleton'
import DailyQuests from '../components/DailyQuests'
import EmergencyBanner from '../components/EmergencyBanner'
import TopicUpdateBanner from '../components/TopicUpdateBanner'
import ReferralCard from '../components/ReferralCard'
import ReferralRewardPopup from '../components/ReferralRewardPopup'
import CellIllustration from '../components/illustrations/CellIllustration'
import SeedlingIllustration from '../components/illustrations/SeedlingIllustration'

import {
  getSessions, getPaperAttempts, getQuizResults, getTopicsWithConfidence,
  filterToCurrentQualification,
} from '../utils/firestore'
import { applyReferralCodeForExistingUser } from '../utils/referrals'
import { computeSubjectPredictions, computeWeakTopics } from '../utils/gradeInsights'
import { filterUpcomingExams, countdownLabel } from '../utils/examUtils'
import { gradeColour } from '../utils/calendar'
import { LEVELS, levelFromXP, SUBJECT_COLOURS } from '../data/subjects'
import { BADGE_MAP } from '../data/badges'

/* ─────────────────────────────────────────────────────────────────────────
   Matches the reference mockup: plain greeting (no card behind it), a
   dominant "next session" card with a line-art illustration, Today +
   Streak stacked beside it, then a plain three-column row. No icons in
   card headers — just bold text ("card-eyebrow"), matching the mockup
   exactly. Everything below that row is real product functionality that
   isn't pictured in the mockup (predicted grades, quests, badges, quick
   actions, referrals) — kept, but restyled in the same plain language so
   the page reads as one design rather than a mockup glued to a leftover.
   ───────────────────────────────────────────────────────────────────────── */

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAY_NARROW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toJsDate(value) {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
function formatShortDate(d) { return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}` }
function formatFullDate(d) { return `${WEEKDAY_FULL[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}` }
function fmtDuration(minutes) {
  if (!minutes) return '0m'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
function firstName(profile, user) {
  const raw = profile?.displayName || user?.displayName || ''
  return raw.trim().split(' ')[0] || 'there'
}
function greetingWord(hour) {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/* Which of the real illustration components fits a given subject. This is
   the ONE place that needs a new line when another subject-specific
   illustration lands in components/illustrations/ — nothing else in this
   file changes. Not literally auto-detecting new files on disk (Vite
   doesn't do that safely without a build-time glob, which is more
   fragile than it's worth for two components) — but adding one becomes a
   single import + a single array entry, not new branching logic. First
   matching rule wins, so put more specific subjects above general ones. */
const ILLUSTRATION_RULES = [
  { test: (s) => /biology/i.test(s || ''), Component: CellIllustration },
  // { test: (s) => /chemistry/i.test(s || ''), Component: ChemistryIllustration },
  // { test: (s) => /physics/i.test(s || ''), Component: PhysicsIllustration },
]
function illustrationFor(subject) {
  const rule = ILLUSTRATION_RULES.find((r) => r.test(subject))
  return rule ? rule.Component : SeedlingIllustration
}

/* Small subject-colour icon badge for list rows (Upcoming Exams, Subject
   Overview). No per-topic icon set exists in the codebase yet — grepped
   Topics.jsx/TopicDetail.jsx to confirm — so this is a deliberately light,
   easily-swappable stand-in built from SUBJECT_COLOURS (real, existing
   data) and lucide-react (already a dependency), not a second
   illustration architecture. Swap the icon map for real per-topic
   illustrations here, in one place, once they exist. */
const SUBJECT_ICONS = {
  Biology: Leaf, Chemistry: FlaskConical, Physics: Atom,
  Mathematics: Calculator, 'Further Mathematics': Calculator, Statistics: Calculator,
  'English Language': BookOpen, 'English Literature': BookOpen,
  History: Landmark, Geography: Globe2, 'Computer Science': Cpu,
}
function SubjectBadge({ subject }) {
  const Icon = SUBJECT_ICONS[subject] || GraduationCap
  const colour = SUBJECT_COLOURS?.[subject] || 'var(--text-muted)'
  return (
    <span className="subject-badge" style={{ color: colour, background: `${colour}1a` }}>
      <Icon size={14} />
    </span>
  )
}

function EmptyMini({ text, to, label }) {
  return (
    <div className="mini-empty">
      <p>{text}</p>
      {to && <Link to={to} className="card-footer-link">{label} <ArrowRight size={13} /></Link>}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="dash">
      <Skeleton width={220} height={32} />
      <Skeleton width={160} height={16} style={{ marginTop: 8 }} />
      <div className="dash-top-row" style={{ marginTop: 24 }}>
        <Skeleton height={220} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={100} />
          <Skeleton height={100} />
        </div>
      </div>
      <div className="dash-trio" style={{ marginTop: 16 }}>
        <Skeleton height={180} />
        <Skeleton height={180} />
        <Skeleton height={180} />
      </div>
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
    <div className="card" style={{ marginBottom: 16 }}>
      <p className="card-eyebrow">Finish setting up</p>
      <ul className="plain-list">
        {remaining.map((i) => (
          <li key={i.label} className="plain-row">
            <Link to={i.to} className="plain-row-main" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="checklist-dot" />
              <span className="plain-row-title">{i.label}</span>
            </Link>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function BadgeShowcase({ earnedIds }) {
  const earned = (earnedIds || []).map((id) => BADGE_MAP[id]).filter(Boolean)
  if (!earned.length) {
    return <EmptyMini text="No badges yet — keep revising to unlock your first one." />
  }
  return (
    <div className="badge-showcase">
      {earned.slice(0, 8).map((b) => (
        <span key={b.id} className="badge-icon" title={`${b.name}${b.description ? ` — ${b.description}` : ''}`}>
          {b.icon}
        </span>
      ))}
      {earned.length > 8 && <span className="badge-icon badge-icon--more">+{earned.length - 8}</span>}
    </div>
  )
}

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

  useEffect(() => { document.title = 'Dashboard · RevisionFlow' }, [])

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
  const weakTopics = useMemo(() => computeWeakTopics(topics, 4), [topics])
  const upcomingExams = useMemo(() => filterUpcomingExams(profile?.examDates || []).slice(0, 4), [profile?.examDates])

  const avgConfidence = useMemo(() => {
    if (!topics.length) return null
    const rated = topics.filter((t) => t.confidence)
    if (!rated.length) return null
    return Math.round((rated.reduce((sum, t) => sum + t.confidence, 0) / rated.length) * 20)
  }, [topics])

  // Grouped by subjectId — the real raw field name on topic docs (confirmed
  // via computeWeakTopics/getTopicsWithConfidence, which both read it
  // directly), not the `.subject` field some older code assumed.
  const subjectOverview = useMemo(() => {
    const bySubject = {}
    topics.forEach((t) => {
      const key = t.subjectId
      if (!key) return
      if (!bySubject[key]) bySubject[key] = { subject: key, total: 0, sum: 0 }
      if (t.confidence) { bySubject[key].total += 1; bySubject[key].sum += t.confidence }
    })
    return Object.values(bySubject)
      .filter((s) => s.total > 0)
      .map((s) => ({ subject: s.subject, percent: Math.round((s.sum / s.total) * 20) }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 6)
  }, [topics])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)

  const todaySessions = useMemo(() => {
    return sessions
      .map((s) => ({ ...s, _date: toJsDate(s.date) }))
      .filter((s) => s._date && s._date >= today && s._date < tomorrow)
  }, [sessions])

  const todayMinutes = useMemo(
    () => todaySessions.filter((s) => s.completed).reduce((sum, s) => sum + (s.duration || 0), 0),
    [todaySessions]
  )

  const upcomingSessions = useMemo(() => {
    return sessions
      .filter((s) => !s.completed)
      .map((s) => ({ ...s, _date: toJsDate(s.date) }))
      .filter((s) => s._date)
      .sort((a, b) => a._date - b._date)
  }, [sessions])
  const nextSession = upcomingSessions[0] || null
  const NextSessionIllustration = illustrationFor(nextSession?.subject)

  const last7Days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i)
      const done = sessions.some((s) => {
        if (!s.completed) return false
        const sd = toJsDate(s.date)
        return sd && sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate()
      })
      days.push({ key: d.toISOString(), label: WEEKDAY_NARROW[d.getDay()], done, isToday: i === 0 })
    }
    return days
  }, [sessions])

  const recentActivity = useMemo(() => {
    const fromSessions = sessions.filter((s) => s.completed).map((s) => ({
      id: `s-${s.id}`, icon: BookOpen, title: 'Revised topic',
      sub: s.title || s.subject || 'Study session', date: toJsDate(s.date),
    }))
    const fromPapers = currentPapers.map((p) => ({
      id: `p-${p.id}`, icon: ClipboardList, title: 'Completed past paper',
      sub: `${p.subject || ''}${p.paperNumber ? ` — Paper ${p.paperNumber}` : ''}`.trim() || 'Past paper',
      date: toJsDate(p.createdAt || p.attemptDate),
    }))
    const fromQuizzes = currentQuizzes.map((q) => ({
      id: `q-${q.id}`, icon: CheckCircle2, title: 'Completed quiz',
      sub: q.subject || 'Quiz', date: toJsDate(q.createdAt || q.date),
    }))
    return [...fromSessions, ...fromPapers, ...fromQuizzes]
      .filter((i) => i.date)
      .sort((a, b) => b.date - a.date)
      .slice(0, 4)
  }, [sessions, currentPapers, currentQuizzes])

  const xp = profile?.xp || 0
  const level = levelFromXP(xp)
  const thisLevel = LEVELS[level - 1] || LEVELS[0]
  const nextLevel = LEVELS[level] || null
  const xpIntoLevel = xp - (thisLevel?.xpRequired || 0)
  const xpForNext = nextLevel ? nextLevel.xpRequired - (thisLevel?.xpRequired || 0) : 0
  const xpPercent = nextLevel ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 100
  const streak = profile?.streak || 0

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

  if (!profile) return <DashboardSkeleton />

  return (
    <div className="dash">
      {refReward && <ReferralRewardPopup reward={refReward} onClose={() => setRefReward(null)} />}

      <EmergencyBanner />
      <TopicUpdateBanner />
      {profile?.betaUser && !betaThanksDismissed && <BetaThanks onDismiss={dismissBetaThanks} />}
      <SetupChecklist profile={profile} />

      {/* ── Plain greeting — no card, no background, matching the reference ── */}
      <div className="dash-header">
        <h1 className="dash-greeting">{greetingWord(new Date().getHours())}, {firstName(profile, user)}</h1>
        <p className="dash-date">{formatFullDate(new Date())}</p>
      </div>

      {/* ── Next session (dominant) + Today / Streak ─────────────────────── */}
      {dataLoading ? (
        <div className="dash-top-row" style={{ marginTop: 24 }}>
          <Skeleton height={220} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton height={100} /><Skeleton height={100} />
          </div>
        </div>
      ) : (
        <div className="dash-top-row" style={{ marginTop: 24 }}>
          <div className="card next-session-card">
            <p className="card-eyebrow">Your next session</p>
            {nextSession ? (
              <>
                <h2 className="next-session-subject">{nextSession.subject || 'Study session'}</h2>
                <p className="next-session-topic">{nextSession.title || 'Revision session'}</p>
                <div className="next-session-meta">
                  {nextSession.duration && <span className="mini-tag">{nextSession.duration} min</span>}
                </div>
                <Link to="/timer" className="btn btn-primary next-session-cta">
                  Start session <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <div className="next-session-empty">
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 14px', maxWidth: 260 }}>
                  Nothing scheduled next — plan a session or jump straight in.
                </p>
                <Link to="/calendar" className="btn btn-primary next-session-cta">
                  Plan a session <ArrowRight size={16} />
                </Link>
              </div>
            )}
            <div className="growth-illustration">
              <NextSessionIllustration size={150} />
            </div>
          </div>

          <div className="dash-side-col">
            <div className="card">
              <p className="card-eyebrow">Today</p>
              <div className="today-stats-row">
                <div className="stat-pair">
                  <span className="stat-num">{todaySessions.length}</span>
                  <span className="stat-cap">sessions</span>
                </div>
                <div className="stat-pair">
                  <span className="stat-num">{avgConfidence != null ? `${avgConfidence}%` : '—'}</span>
                  <span className="stat-cap">confidence</span>
                </div>
                <div className="stat-pair">
                  <span className="stat-num">{fmtDuration(todayMinutes)}</span>
                  <span className="stat-cap">study time</span>
                </div>
              </div>
            </div>
            <div className="card">
              <p className="card-eyebrow">Streak</p>
              <div className="streak-row">
                <span className="stat-num">{streak}</span>
                <span className="stat-cap">days</span>
              </div>
              <div className="week-dots">
                {last7Days.map((d) => (
                  <div key={d.key} className="week-dot-col">
                    <span className="week-dot-label">{d.label}</span>
                    <span className={`week-dot ${d.done ? 'week-dot--done' : ''} ${d.isToday && !d.done ? 'week-dot--today' : ''}`}>
                      {d.done && <CheckCircle2 size={11} />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upcoming / Needs attention / Recent activity ─────────────────── */}
      <div className="dash-trio" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="card-eyebrow">Upcoming</p>
          {dataLoading ? <Skeleton height={130} /> : upcomingSessions.length ? (
            <ul className="plain-list">
              {upcomingSessions.slice(0, 4).map((s) => (
                <li key={s.id} className="plain-row">
                  <div className="plain-row-main">
                    <span className="plain-row-title">{s.subject || 'Study session'}</span>
                    <span className="plain-row-sub">{s.title || ''}</span>
                  </div>
                  <span className="plain-row-meta">{formatShortDate(s._date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMini text="Nothing scheduled yet." to="/calendar" label="Plan your week" />
          )}
          <Link to="/calendar" className="card-footer-link">View full calendar <ArrowRight size={13} /></Link>
        </div>

        <div className="card">
          <p className="card-eyebrow">Needs attention</p>
          {dataLoading ? <Skeleton height={130} /> : weakTopics.length ? (
            <>
              <p className="card-sub-line">{weakTopics.length} topic{weakTopics.length === 1 ? ' is' : 's are'} below 60% confidence</p>
              <ul className="plain-list">
                {weakTopics.map((t) => (
                  <li key={t.id} className="progress-row">
                    <div className="progress-row-top">
                      <span>{t.name}</span>
                      <span>{t.confidence * 20}%</span>
                    </div>
                    <div className="thin-progress">
                      <div className="thin-progress-fill" style={{ width: `${t.confidence * 20}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyMini text="Nothing flagged — nice work staying on top of things." />
          )}
          <Link to="/topics" className="card-footer-link">View all weak topics <ArrowRight size={13} /></Link>
        </div>

        <div className="card">
          <p className="card-eyebrow">Recent activity</p>
          {dataLoading ? <Skeleton height={130} /> : recentActivity.length ? (
            <ul className="plain-list">
              {recentActivity.map((i) => (
                <li key={i.id} className="plain-row">
                  <span className="row-icon-chip"><i.icon size={14} /></span>
                  <div className="plain-row-main">
                    <span className="plain-row-title">{i.title}</span>
                    <span className="plain-row-sub">{i.sub}</span>
                  </div>
                  <span className="plain-row-meta">{formatShortDate(i.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMini text="Your first session will show up here." to="/study" label="Start studying" />
          )}
          <Link to="/analytics" className="card-footer-link">View all activity <ArrowRight size={13} /></Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          Below the mockup's fold: real functionality not pictured in the
          reference image, restyled in the same plain language rather than
          removed. See the accompanying note for why this is here.
         ───────────────────────────────────────────────────────────────── */}

      <div className="grid-2" style={{ marginTop: 16 }}>
        {upcomingExams.length > 0 && (
          <div className="card">
            <p className="card-eyebrow">Upcoming exams</p>
            <ul className="plain-list">
              {upcomingExams.map((e) => (
                <li key={e.id || `${e.subject}-${e.examDate}`} className="plain-row">
                  <SubjectBadge subject={e.subject} />
                  <div className="plain-row-main">
                    <span className="plain-row-title">{e.subject}</span>
                    <span className="plain-row-sub">{e.board}{e.qualification ? ` · ${e.qualification}` : ''}</span>
                  </div>
                  <span className="plain-row-meta">{countdownLabel(e.examDate)}</span>
                </li>
              ))}
            </ul>
            <Link to="/exams" className="card-footer-link">All exam dates <ArrowRight size={13} /></Link>
          </div>
        )}

        <div className="card">
          <p className="card-eyebrow">Subject overview</p>
          {dataLoading ? <Skeleton height={130} /> : subjectOverview.length ? (
            <ul className="plain-list">
              {subjectOverview.map((s) => (
                <li key={s.subject} className="progress-row">
                  <div className="progress-row-top">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SubjectBadge subject={s.subject} />{s.subject}
                    </span>
                    <span>{s.percent}%</span>
                  </div>
                  <div className="thin-progress">
                    <div
                      className="thin-progress-fill"
                      style={{ width: `${s.percent}%`, background: SUBJECT_COLOURS?.[s.subject] || 'var(--accent)' }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMini text="Rate your topic confidence to see subjects here." to="/topics" label="Go to Topics" />
          )}
          <Link to="/topics" className="card-footer-link">Manage subjects <ArrowRight size={13} /></Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="card-eyebrow"><CheckSquare size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Today's plan</p>
          {dataLoading ? <Skeleton height={90} /> : todaySessions.length ? (
            <ul className="plain-list">
              {todaySessions.slice(0, 4).map((s) => (
                <li key={s.id} className="plain-row">
                  <div className="plain-row-main">
                    <span className="plain-row-title">{s.title || s.subject}</span>
                    <span className="plain-row-sub">{s.duration ? `${s.duration} min` : ''}</span>
                  </div>
                  {s.completed ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <span className="mini-tag">Pending</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMini text="Nothing scheduled for today." to="/calendar" label="Plan today" />
          )}
        </div>
        <div className="card"><DailyQuests /></div>
      </div>

      <div className="dash-row-3" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="card-eyebrow"><Award size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Predicted grades</p>
          {dataLoading ? <Skeleton height={120} /> : predictions.length ? (
            <>
              <ul className="plain-list">
                {visiblePredictions.map((p) => (
                  <li key={`${p.board}-${p.subject}`} className="plain-row">
                    <span className="plain-row-title" style={{ flex: 1 }}>{p.subject}</span>
                    <span className="mini-tag" style={{ color: gradeColour(p.grade), borderColor: gradeColour(p.grade), fontWeight: 800 }}>
                      {p.grade}
                    </span>
                  </li>
                ))}
              </ul>
              {hiddenPredictionCount > 0 && (
                <Link to="/pro" className="card-footer-link" style={{ marginTop: 8 }}>
                  {hiddenPredictionCount} more subject{hiddenPredictionCount > 1 ? 's' : ''} with Pro <ArrowRight size={13} />
                </Link>
              )}
            </>
          ) : (
            <EmptyMini text="Complete a quiz or past paper to see predicted grades." to="/papers" label="Try a paper" />
          )}
        </div>

        <div className="card">
          <p className="card-eyebrow"><Trophy size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Achievements</p>
          <div className="achievement-level-row">
            <div>
              <span className="stat-num" style={{ fontSize: '1.3rem' }}>Level {level}</span>
              <span className="stat-cap" style={{ display: 'block' }}>{thisLevel?.title || ''}</span>
            </div>
            <span className="plain-row-meta">{xpIntoLevel} / {xpForNext || '—'} XP</span>
          </div>
          <div className="thin-progress" style={{ marginBottom: 18 }}>
            <div className="thin-progress-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="card-sub-line" style={{ margin: '0 0 8px' }}>Badges</p>
          <BadgeShowcase earnedIds={profile.badges} />
          <Link to="/profile" className="card-footer-link">All badges <ArrowRight size={13} /></Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-eyebrow">Quick actions</p>
        <div className="grid-3 quick-actions">
          <Link to="/study" className="quick-action"><BookOpen size={18} /><span>Start studying</span></Link>
          <Link to="/timer" className="quick-action"><Target size={18} /><span>Focus timer</span></Link>
          <Link to="/papers" className="quick-action"><ClipboardList size={18} /><span>Past papers</span></Link>
          <Link to="/topics" className="quick-action"><Target size={18} /><span>Topics</span></Link>
          <Link to="/tutor" className="quick-action"><BookOpen size={18} /><span>Tutor</span></Link>
          <Link to="/ai" className="quick-action"><Target size={18} /><span>AI Advisor</span></Link>
          <Link to="/mistakes" className="quick-action"><X size={18} /><span>Mistakes log</span></Link>
          <Link to="/calendar" className="quick-action"><CalendarDays size={18} /><span>Plan my week</span></Link>
          <Link to="/exams" className="quick-action"><Award size={18} /><span>Exam dates</span></Link>
        </div>
      </div>

      {!profile.referredBy && (
        <div className="card gold-card" style={{ marginTop: 16 }}>
          <p className="card-eyebrow"><Gift size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Have a referral code?</p>
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
