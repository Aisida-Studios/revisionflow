// src/pages/Analytics.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Skeleton from '../components/Skeleton'
import AIOutput from '../components/AIOutput'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { getPaperAttempts, gradeImpliesQualification } from '../utils/firestore'
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { SUBJECT_COLOURS } from '../data/subjects'
import { CONF_LABELS, CONF_COLOURS, displayTopicName } from '../utils/topicDisplay'
import {
  Clock, Flame, TrendingUp, TrendingDown, Minus, Award, Target, BookOpen,
  Brain, Calendar, Star, AlertCircle, CheckCircle, BarChart2, Activity,
} from 'lucide-react'
import './Analytics.css'

const COLOURS = ['#0d9488', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#166534']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'topics', label: 'Topics' },
  { id: 'trends', label: 'Trends' },
]
const tooltipStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }
const axisTick = { fontSize: 11, fill: 'var(--text-muted)' }

// ── Date helpers — local-date parsing throughout, no UTC shifts ────────────
function sessionDate(s) {
  return s.startTime ? new Date(s.startTime) : (s.date ? new Date(s.date + 'T00:00:00') : null)
}
function attemptDateOf(a) {
  if (a.attemptDate) return new Date(a.attemptDate + 'T00:00:00')
  if (a.createdAt?.seconds) return new Date(a.createdAt.seconds * 1000)
  return null
}
function toDate(d) {
  if (!d) return null
  if (d.seconds) return new Date(d.seconds * 1000)
  if (typeof d.toDate === 'function') return d.toDate()
  const parsed = new Date(d)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
function monthBounds(offset) {
  const now = new Date()
  return [new Date(now.getFullYear(), now.getMonth() + offset, 1), new Date(now.getFullYear(), now.getMonth() + offset + 1, 1)]
}
function weekBounds(offset) {
  const now = new Date()
  const diffToMon = (now.getDay() + 6) % 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMon)
  const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset * 7)
  return [start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)]
}
const fmtMins = (m) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`

// Stricter than the shared filterToCurrentQualification (used elsewhere in the app, e.g.
// Dashboard's predicted grades): still trusts an explicit qualification tag, or an unambiguous
// grade format (GCSE grades are 1-9, A-Level/AS-Level use A*-E — so a grade of '7' or 'A*' alone
// settles it), but never falls back to guessing from whichever other record for the subject
// happens to be closest in time. That time-proximity guess is reasonable for a quick dashboard
// glance, but for subject-level averages here it can silently blend an old qualification's
// numbers into a new one's (e.g. GCSE Maths into AS-Level Maths) — an honest gap is better than
// a wrong average.
function strictQualificationMatch(records, subjectsList) {
  const list = Array.isArray(subjectsList) ? subjectsList : []
  return records.filter(r => {
    if (r.archived) return false
    const name = r.subject || r.subjectId
    const subjMeta = list.find(s => s.name === name)
    if (!subjMeta) return false
    const currentQual = subjMeta.qualification
    if (r.qualification) return r.qualification === currentQual
    const byGrade = gradeImpliesQualification(r.grade)
    if (byGrade) return byGrade === currentQual
    return false
  })
}

// ── Small presentational pieces ─────────────────────────────────────────────
function Sparkline({ id, data, colour = 'var(--accent)' }) {
  const hasShape = data && data.filter(d => d.v > 0).length >= 2
  if (!hasShape) return <div className="analytics-sparkline" />
  const gradId = `spark-grad-${id}`
  return (
    <div className="analytics-sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colour} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colour} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={colour} strokeWidth={1.75} fill={`url(#${gradId})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function ConfDistribution({ counts }) {
  const max = Math.max(1, ...[1, 2, 3, 4, 5].map(l => counts[l] || 0))
  return (
    <div className="analytics-conf-distribution">
      {[1, 2, 3, 4, 5].map(level => (
        <div key={level} className="analytics-conf-bar"
          style={{ height: `${Math.max(8, ((counts[level] || 0) / max) * 100)}%`, background: CONF_COLOURS[level] }}
          title={`${CONF_LABELS[level]}: ${counts[level] || 0}`} />
      ))}
    </div>
  )
}

function TrendChip({ value, format: fmt, period = 'last month' }) {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus
  const cls = value > 0 ? 'is-up' : value < 0 ? 'is-down' : 'is-flat'
  return <span className={`analytics-trend ${cls}`}><Icon size={12} /> {fmt(value)} vs {period}</span>
}

function StatHero({ icon, label, value, loading, trend, spark }) {
  return (
    <div className="card analytics-stat-card">
      <div className="analytics-stat-top">
        <span className="analytics-stat-icon">{icon}</span>
        <span className="analytics-stat-label">{label}</span>
      </div>
      <div className="analytics-stat-value">
        {loading ? <Skeleton height={28} width={70} /> : value}
      </div>
      <div className="analytics-stat-foot">
        {loading ? <Skeleton height={14} width={90} /> : (trend || <span />)}
        {!loading && spark}
      </div>
    </div>
  )
}

function Card({ title, icon, note, right, children }) {
  return (
    <div className="card analytics-card">
      <div className="analytics-card-head">
        <h4 className="analytics-card-title">{icon}{title}</h4>
        {right}
      </div>
      {note && <p className="analytics-card-note">{note}</p>}
      {children}
    </div>
  )
}

function StudyPatternsCard({ weeklyPattern, timeOfDayData, sessionLengthDist }) {
  const [mode, setMode] = useState('day')
  const caption = useMemo(() => {
    if (mode === 'day') {
      const best = [...weeklyPattern].sort((a, b) => b.hours - a.hours)[0]
      if (!best || best.hours === 0) return null
      return `Most productive: ${best.day}s (${best.hours}h avg)`
    }
    if (mode === 'time') {
      const peak = [...timeOfDayData].sort((a, b) => b.hours - a.hours)[0]
      if (!peak || peak.hours === 0) return null
      return `You study most in the ${peak.label.split('\n')[0].toLowerCase()}`
    }
    const peak = [...sessionLengthDist].sort((a, b) => b.count - a.count)[0]
    if (!peak || peak.count === 0) return null
    return `Most sessions run ${peak.label}`
  }, [mode, weeklyPattern, timeOfDayData, sessionLengthDist])

  return (
    <Card title="Study patterns" icon={<Calendar size={16} />} note={caption}
      right={
        <div className="analytics-seg">
          <button className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>Day of week</button>
          <button className={mode === 'time' ? 'active' : ''} onClick={() => setMode('time')}>Time of day</button>
          <button className={mode === 'length' ? 'active' : ''} onClick={() => setMode('length')}>Session length</button>
        </div>
      }>
      {mode === 'day' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={weeklyPattern}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} unit="h" axisLine={false} tickLine={false} width={32} />
            <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={tooltipStyle} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="var(--accent)" maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {mode === 'time' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={timeOfDayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} unit="h" axisLine={false} tickLine={false} width={32} />
            <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={tooltipStyle} />
            <Bar dataKey="hours" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {mode === 'length' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={sessionLengthDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
            <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default function Analytics() {
  const { user, profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [attempts, setAttempts] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(30)
  const [gradeSub, setGradeSub] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getDocs(collection(db, 'users', user.uid, 'sessions')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      getPaperAttempts(user.uid),
      getDocs(collection(db, 'users', user.uid, 'topics')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
    ]).then(([sess, atts, tops]) => {
      setSessions(sess)
      setAttempts(atts)
      setTopics(tops)
      setLoading(false)
    })
  }, [user])

  const subjectList = profile?.subjects?.map(s => s.name) || []
  useEffect(() => { if (subjectList.length && !gradeSub) setGradeSub(subjectList[0]) }, [subjectList.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Strictly qualification-matched — see strictQualificationMatch above for why this is
  // stricter than the shared filterToCurrentQualification used elsewhere in the app. Study time
  // below deliberately stays unfiltered (all sessions, lifetime): sessions don't carry a
  // qualification field at all (see the Time-by-subject note further down), and time spent
  // doesn't become "wrong" across a qualification change the way a stale grade or confidence
  // rating would.
  const currentAttempts = useMemo(() => strictQualificationMatch(attempts, profile?.subjects), [attempts, profile])
  const currentSubjects = useMemo(() => profile?.subjects || [], [profile])
  const currentTopics = useMemo(() => strictQualificationMatch(topics, currentSubjects), [topics, currentSubjects])

  // ── Core time data (lifetime) ─────────────────────────────────────────────
  const completedSessions = useMemo(() => sessions.filter(s => s.completed), [sessions])
  const totalMinutes = useMemo(() => completedSessions.reduce((sum, s) => sum + (parseInt(s.duration) || 45), 0), [completedSessions])
  const rangeStart = useMemo(() => subDays(new Date(), dateRange), [dateRange])
  const recentSessions = useMemo(() => completedSessions.filter(s => { const d = sessionDate(s); return d && d >= rangeStart }), [completedSessions, rangeStart])
  const recentMinutes = useMemo(() => recentSessions.reduce((sum, s) => sum + (parseInt(s.duration) || 45), 0), [recentSessions])
  const avgDailyMinutes = Math.round(recentMinutes / dateRange)
  const completionRate = sessions.length ? Math.round((completedSessions.length / sessions.length) * 100) : 0

  // ── Hero stat: study time ─────────────────────────────────────────────────
  const studyTimeTrend = useMemo(() => {
    const [curS, curE] = monthBounds(0), [prevS, prevE] = monthBounds(-1)
    let cur = 0, prev = 0
    completedSessions.forEach(s => {
      const d = sessionDate(s); if (!d) return
      const mins = parseInt(s.duration) || 45
      if (d >= curS && d < curE) cur += mins
      else if (d >= prevS && d < prevE) prev += mins
    })
    if (!prev) return null
    return Math.round(((cur - prev) / prev) * 100)
  }, [completedSessions])

  const last10Weeks = useMemo(() => {
    const weeks = Array.from({ length: 10 }, (_, i) => {
      const [s, e] = weekBounds(i - 9)
      return { start: s, end: e, mins: 0, count: 0 }
    })
    completedSessions.forEach(s => {
      const d = sessionDate(s); if (!d) return
      const bucket = weeks.find(w => d >= w.start && d < w.end)
      if (bucket) { bucket.mins += parseInt(s.duration) || 45; bucket.count += 1 }
    })
    return weeks
  }, [completedSessions])

  // ── Hero stat: average grade ──────────────────────────────────────────────
  const avgGrade = useMemo(() => {
    const withPct = currentAttempts.filter(a => a.percentage != null)
    return withPct.length ? Math.round(withPct.reduce((s, a) => s + a.percentage, 0) / withPct.length) : null
  }, [currentAttempts])

  const avgGradeTrend = useMemo(() => {
    const [curS, curE] = monthBounds(0), [prevS, prevE] = monthBounds(-1)
    const cur = [], prev = []
    currentAttempts.forEach(a => {
      if (a.percentage == null) return
      const d = attemptDateOf(a); if (!d) return
      if (d >= curS && d < curE) cur.push(a.percentage)
      else if (d >= prevS && d < prevE) prev.push(a.percentage)
    })
    if (!cur.length || !prev.length) return null
    const curAvg = cur.reduce((a, b) => a + b, 0) / cur.length
    const prevAvg = prev.reduce((a, b) => a + b, 0) / prev.length
    return Math.round(curAvg - prevAvg)
  }, [currentAttempts])

  const gradeSpark = useMemo(() => {
    return currentAttempts
      .filter(a => a.percentage != null)
      .map(a => ({ v: a.percentage, _d: attemptDateOf(a) }))
      .filter(a => a._d)
      .sort((a, b) => a._d - b._d)
      .slice(-10)
  }, [currentAttempts])

  // ── Hero stat: topic confidence ───────────────────────────────────────────
  const avgConfidencePct = useMemo(() => {
    const rated = currentTopics.filter(t => t.confidence)
    return rated.length ? Math.round((rated.reduce((s, t) => s + t.confidence, 0) / rated.length) * 20) : null
  }, [currentTopics])

  const confidenceCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    currentTopics.forEach(t => { if (t.confidence) counts[t.confidence] = (counts[t.confidence] || 0) + 1 })
    return counts
  }, [currentTopics])

  const confidenceTrend = useMemo(() => {
    // Aggregated, never-invented trend: for each topic with real confidenceHistory, compare the
    // latest rating to the newest entry that's at least ~3 weeks older, then average the deltas.
    // Topics without enough history simply don't contribute — same "omit rather than fabricate"
    // rule TopicDetail.jsx already uses per-topic, generalised across the whole subject set.
    const deltas = []
    currentTopics.forEach(t => {
      const hist = Array.isArray(t.confidenceHistory) ? t.confidenceHistory : []
      const sorted = hist.map(h => ({ ...h, _d: toDate(h?.date) })).filter(h => h._d).sort((a, b) => a._d - b._d)
      if (sorted.length < 2) return
      const latest = sorted[sorted.length - 1]
      const baseline = [...sorted].reverse().find(h => latest._d - h._d >= 21 * 24 * 60 * 60 * 1000)
      if (!baseline) return
      deltas.push((latest.value - baseline.value) * 20)
    })
    if (!deltas.length) return null
    return Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length)
  }, [currentTopics])

  // ── Hero stat: sessions completed ─────────────────────────────────────────
  const sessionsMonthDelta = useMemo(() => {
    const [curS, curE] = monthBounds(0), [prevS, prevE] = monthBounds(-1)
    let cur = 0, prev = 0
    completedSessions.forEach(s => {
      const d = sessionDate(s); if (!d) return
      if (d >= curS && d < curE) cur++
      else if (d >= prevS && d < prevE) prev++
    })
    return cur - prev
  }, [completedSessions])

  // ── Daily study chart (respects the date-range selector) ──────────────────
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: rangeStart, end: new Date() })
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const daySess = recentSessions.filter(s => s.date === dayStr || (s.startTime && format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr))
      const total = daySess.reduce((sum, s) => sum + (parseInt(s.duration) || 45) / 60, 0)
      return { date: format(day, dateRange <= 14 ? 'EEE d' : 'd MMM'), total: Math.round(total * 10) / 10 }
    })
  }, [recentSessions, rangeStart, dateRange])

  // ── Day-of-week / time-of-day / session-length patterns (all-time) ───────
  const weeklyPattern = useMemo(() => {
    const counts = Array(7).fill(0).map((_, i) => ({ day: DAY_NAMES[i], minutes: 0 }))
    completedSessions.forEach(s => {
      const d = s.startTime ? new Date(s.startTime) : (s.date ? new Date(s.date + 'T12:00:00') : null)
      if (!d) return
      counts[getDay(d)].minutes += parseInt(s.duration) || 45
    })
    return counts.map(c => ({ ...c, hours: Math.round(c.minutes / 60 * 10) / 10 }))
  }, [completedSessions])

  const timeOfDayData = useMemo(() => {
    const buckets = [
      { label: 'Early\n6–9am', hours: [6, 7, 8], minutes: 0 },
      { label: 'Morning\n9–12', hours: [9, 10, 11], minutes: 0 },
      { label: 'Afternoon\n12–5', hours: [12, 13, 14, 15, 16], minutes: 0 },
      { label: 'Evening\n5–9pm', hours: [17, 18, 19, 20], minutes: 0 },
      { label: 'Night\n9pm+', hours: [21, 22, 23, 0, 1], minutes: 0 },
    ]
    completedSessions.forEach(s => {
      if (!s.startTime) return
      const hr = new Date(s.startTime).getHours()
      const bucket = buckets.find(b => b.hours.includes(hr))
      if (bucket) bucket.minutes += parseInt(s.duration) || 45
    })
    return buckets.map(b => ({ ...b, hours: Math.round(b.minutes / 60 * 10) / 10 }))
  }, [completedSessions])

  const sessionLengthDist = useMemo(() => {
    const buckets = [
      { label: '<15m', min: 0, max: 15, count: 0 }, { label: '15–30m', min: 15, max: 30, count: 0 },
      { label: '30–45m', min: 30, max: 45, count: 0 }, { label: '45–60m', min: 45, max: 60, count: 0 },
      { label: '60–90m', min: 60, max: 90, count: 0 }, { label: '90m+', min: 90, max: 9999, count: 0 },
    ]
    completedSessions.forEach(s => {
      const dur = parseInt(s.duration) || 45
      const b = buckets.find(b => dur >= b.min && dur < b.max)
      if (b) b.count++
    })
    return buckets
  }, [completedSessions])

  // ── Consistency heatmap (12 weeks) ────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const start = subDays(new Date(), 83)
    return eachDayOfInterval({ start, end: new Date() }).map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const count = completedSessions.filter(s => s.date === dayStr || (s.startTime && format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr)).length
      return { dayStr, count, label: format(day, 'EEE d MMM') }
    })
  }, [completedSessions])
  const heatColour = (count) => {
    if (count === 0) return 'var(--bg-hover)'
    if (count === 1) return 'rgba(34,197,94,0.35)'
    if (count === 2) return 'rgba(34,197,94,0.58)'
    if (count === 3) return 'rgba(34,197,94,0.78)'
    return 'var(--success)'
  }

  // ── Personal records (slimmed — day-of-week and totals already live elsewhere) ─
  const records = useMemo(() => {
    const longestSession = completedSessions.reduce((max, s) => Math.max(max, parseInt(s.duration) || 45), 0)
    const bestStreak = profile?.bestStreak || profile?.streak || 0
    const subjectMins = {}
    completedSessions.forEach(s => { if (s.subject) subjectMins[s.subject] = (subjectMins[s.subject] || 0) + (parseInt(s.duration) || 45) })
    const topSubject = Object.entries(subjectMins).sort((a, b) => b[1] - a[1])[0]
    return { longestSession, bestStreak, topSubject }
  }, [completedSessions, profile])

  // ── Subjects tab ───────────────────────────────────────────────────────────
  // Time is grouped by subject NAME only, because session documents don't store a qualification
  // field at all (confirmed against how sessions are actually created in Calendar.jsx) — there's
  // no reliable signal to split old GCSE minutes from new AS-Level minutes for a subject that's
  // changed level. What we CAN do honestly is label every bar with the subject's CURRENT
  // qualification, so it's never ambiguous which level a bar is currently tracked under, even
  // though historical minutes logged before a level change may still be folded into it.
  const subjectDist = useMemo(() => {
    const counts = {}
    completedSessions.forEach(s => { if (s.subject) counts[s.subject] = (counts[s.subject] || 0) + (parseInt(s.duration) || 45) })
    return Object.entries(counts)
      .map(([name, minutes]) => {
        const qualification = profile?.subjects?.find(s => s.name === name)?.qualification
        return {
          name, minutes, hours: Math.round(minutes / 60 * 10) / 10, qualification,
          label: qualification ? `${name} (${qualification})` : name,
        }
      })
      .sort((a, b) => b.minutes - a.minutes)
  }, [completedSessions, profile])

  const subjectBalance = useMemo(() => {
    if (!subjectDist.length) return []
    const target = totalMinutes / subjectDist.length
    return subjectDist.map(s => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name,
      qualification: s.qualification, pct: Math.min(200, Math.round((s.minutes / Math.max(target, 1)) * 100)),
    }))
  }, [subjectDist, totalMinutes])

  const subjectPerformance = useMemo(() => {
    return currentSubjects.map(sub => {
      const name = sub.name
      const atts = currentAttempts.filter(a => a.subject === name && a.percentage != null)
      const tops = currentTopics.filter(t => t.subjectId === name && t.confidence)
      const grade = atts.length ? Math.round(atts.reduce((s, a) => s + a.percentage, 0) / atts.length) : null
      const conf = tops.length ? Math.round((tops.reduce((s, t) => s + t.confidence, 0) / tops.length) * 20) : null
      const mins = subjectDist.find(d => d.name === name)?.minutes || 0
      return { name, qualification: sub.qualification, grade, conf, mins }
    }).sort((a, b) => b.mins - a.mins)
  }, [currentSubjects, currentAttempts, currentTopics, subjectDist])

  // ── Topics tab ─────────────────────────────────────────────────────────────
  const weakTopics = useMemo(() =>
    currentTopics.filter(t => t.confidence && t.confidence <= 2)
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 8)
      .map(t => ({ id: t.id, subject: t.subjectId || '–', topic: displayTopicName(t.name || t.topicName || t.topic || t.id), confidence: t.confidence }))
  , [currentTopics])

  const strongTopics = useMemo(() =>
    currentTopics.filter(t => t.confidence >= 4).slice(0, 6)
      .map(t => ({ id: t.id, subject: t.subjectId || '–', topic: displayTopicName(t.name || t.topicName || t.topic || t.id) }))
  , [currentTopics])

  // ── Trends tab ─────────────────────────────────────────────────────────────
  const gradeTrajectory = useMemo(() => {
    if (!gradeSub) return []
    return currentAttempts.filter(a => a.subject === gradeSub && a.percentage != null)
      .sort((a, b) => (attemptDateOf(a) || 0) - (attemptDateOf(b) || 0))
      .map((a, i) => ({ attempt: i + 1, label: `P${a.paper} ${a.year}`, percentage: Math.round(a.percentage), grade: a.grade || '' }))
  }, [currentAttempts, gradeSub])

  const gradeTrend = useMemo(() => {
    if (gradeTrajectory.length < 2) return null
    return gradeTrajectory[gradeTrajectory.length - 1].percentage - gradeTrajectory[0].percentage
  }, [gradeTrajectory])

  const papersBySubject = useMemo(() => {
    const bySubject = {}
    currentAttempts.forEach(a => { bySubject[a.subject] = (bySubject[a.subject] || 0) + 1 })
    return Object.entries(bySubject).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }, [currentAttempts])

  const scoreDistribution = useMemo(() => {
    const buckets = [
      { label: '0–40%', min: 0, max: 40, count: 0 }, { label: '40–50%', min: 40, max: 50, count: 0 },
      { label: '50–60%', min: 50, max: 60, count: 0 }, { label: '60–70%', min: 60, max: 70, count: 0 },
      { label: '70–80%', min: 70, max: 80, count: 0 }, { label: '80–90%', min: 80, max: 90, count: 0 },
      { label: '90–100%', min: 90, max: 101, count: 0 },
    ]
    currentAttempts.forEach(a => {
      if (a.percentage == null) return
      const b = buckets.find(b => a.percentage >= b.min && a.percentage < b.max)
      if (b) b.count++
    })
    return buckets
  }, [currentAttempts])

  if (loading) return (
    <div className="fade-in">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title"><Activity size={22} /> Analytics</h2>
          <p className="analytics-subtitle">Your revision activity at a glance</p>
        </div>
      </div>
      <div className="analytics-hero">
        {Array(4).fill(0).map((_, i) => <div key={i} className="card analytics-stat-card"><Skeleton height={90} /></div>)}
      </div>
      <Skeleton height={220} style={{ marginBottom: 16, borderRadius: 12 }} />
      <Skeleton height={180} style={{ borderRadius: 12 }} />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title"><Activity size={22} /> Analytics</h2>
          <p className="analytics-subtitle">Your revision activity at a glance</p>
        </div>
        <select className="select" style={{ width: 'auto' }} value={dateRange} onChange={e => setDateRange(parseInt(e.target.value))}>
          {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>

      {/* ── Hero stat row ── */}
      <div className="analytics-hero">
        <StatHero icon={<Clock size={15} />} label="Study time" value={fmtMins(totalMinutes)}
          trend={<TrendChip value={studyTimeTrend} format={v => `${v > 0 ? '+' : ''}${v}%`} />}
          spark={<Sparkline id="study" data={last10Weeks.map(w => ({ v: w.mins }))} />} />
        <StatHero icon={<Award size={15} />} label="Average grade" value={avgGrade != null ? `${avgGrade}%` : '–'}
          trend={<TrendChip value={avgGradeTrend} format={v => `${v > 0 ? '+' : ''}${v} pts`} />}
          spark={<Sparkline id="grade" data={gradeSpark} colour="var(--info)" />} />
        <StatHero icon={<Brain size={15} />} label="Topic confidence" value={avgConfidencePct != null ? `${avgConfidencePct}%` : '–'}
          trend={<TrendChip value={confidenceTrend} format={v => `${v > 0 ? '+' : ''}${v} pts`} />}
          spark={<ConfDistribution counts={confidenceCounts} />} />
        <StatHero icon={<Activity size={15} />} label="Sessions completed" value={completedSessions.length}
          trend={<TrendChip value={sessionsMonthDelta} format={v => `${v > 0 ? '+' : ''}${v}`} />}
          spark={<Sparkline id="sessions" data={last10Weeks.map(w => ({ v: w.count }))} colour="var(--gold)" />} />
      </div>

      {/* ── Tabs ── */}
      <div className="tabs analytics-tabs" style={{ flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeTab === 'overview' && (<>
        <Card title="Daily study hours" icon={<Clock size={16} />}>
          {dailyData.every(d => d.total === 0) ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No completed sessions in this period</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={axisTick} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} unit="h" axisLine={false} tickLine={false} width={32} />
                <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="total" stroke="var(--accent)" fill="url(#areaGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <StudyPatternsCard weeklyPattern={weeklyPattern} timeOfDayData={timeOfDayData} sessionLengthDist={sessionLengthDist} />

        <Card title="Study consistency" icon={<Calendar size={16} />} note="Last 12 weeks">
          <div className="analytics-heatmap-scroll">
            <div className="analytics-heatmap-grid">
              {heatmapData.map((d, i) => (
                <div key={i} className="analytics-heatmap-cell" title={`${d.label}: ${d.count} session${d.count !== 1 ? 's' : ''}`} style={{ background: heatColour(d.count) }} />
              ))}
            </div>
            <div className="analytics-heatmap-legend">
              Less {[0, 1, 2, 3, 4].map(n => <div key={n} className="swatch" style={{ background: heatColour(n) }} />)} More
            </div>
          </div>
        </Card>

        <Card title="Personal records" icon={<Award size={16} />}>
          <div className="analytics-records">
            <div className="analytics-record">
              <div className="analytics-record-label"><Flame size={13} /> Longest session</div>
              <div className="analytics-record-val">{records.longestSession ? fmtMins(records.longestSession) : '–'}</div>
            </div>
            <div className="analytics-record">
              <div className="analytics-record-label"><Star size={13} /> Best streak</div>
              <div className="analytics-record-val">{records.bestStreak} days</div>
            </div>
            <div className="analytics-record">
              <div className="analytics-record-label"><BookOpen size={13} /> Top subject</div>
              <div className="analytics-record-val">{records.topSubject ? `${records.topSubject[0]} (${fmtMins(records.topSubject[1])})` : '–'}</div>
            </div>
          </div>
        </Card>
      </>)}

      {/* ══ SUBJECTS ══ */}
      {activeTab === 'subjects' && (<>
        <Card title="Time by subject" icon={<BookOpen size={16} />}>
          {subjectDist.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No sessions logged yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(120, subjectDist.length * 38)}>
              <BarChart data={subjectDist} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={axisTick} unit="h" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" tick={axisTick} width={150} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={tooltipStyle} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {subjectDist.map((s, i) => <Cell key={i} fill={SUBJECT_COLOURS?.[s.name] || COLOURS[i % COLOURS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Subject performance" icon={<BarChart2 size={16} />}>
          {subjectPerformance.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>Add subjects in Settings to see a breakdown here</p></div>
          ) : (
            <div className="analytics-subject-list">
              {subjectPerformance.map(s => (
                <div key={s.name} className="analytics-subject-row">
                  <span className="analytics-subject-dot" style={{ background: SUBJECT_COLOURS?.[s.name] || 'var(--accent)' }} />
                  <span className="analytics-subject-name">
                    <span className="truncate">{s.name}</span>
                    {s.qualification && <span className="badge badge-grey" style={{ fontSize: '0.62rem' }}>{s.qualification}</span>}
                  </span>
                  <div className="analytics-subject-metrics">
                    <div className="analytics-metric">
                      <div className="analytics-metric-val">{s.grade != null ? `${s.grade}%` : '–'}</div>
                      <div className="analytics-metric-label">Grade</div>
                    </div>
                    <div className="analytics-metric">
                      <div className="analytics-metric-val">{s.conf != null ? `${s.conf}%` : '–'}</div>
                      <div className="analytics-metric-label">Confidence</div>
                    </div>
                    <div className="analytics-metric">
                      <div className="analytics-metric-val">{s.mins ? fmtMins(s.mins) : '–'}</div>
                      <div className="analytics-metric-label">Time</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Subject balance" icon={<Target size={16} />} note="How evenly you spread study time — 100% is an equal share">
          {subjectBalance.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subjectBalance.map(s => {
                const state = s.pct < 50 ? 'danger' : s.pct > 150 ? 'warning' : 'success'
                return (
                  <div key={s.name} className="progress-row">
                    <div className="progress-row-top">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s.name}
                        {s.qualification && <span className="badge badge-grey" style={{ fontSize: '0.62rem' }}>{s.qualification}</span>}
                      </span>
                      <span style={{ color: `var(--${state})`, fontWeight: 700 }}>{s.pct}%</span>
                    </div>
                    <div className="thin-progress"><div className="thin-progress-fill" style={{ width: `${Math.min(s.pct, 100)}%`, background: `var(--${state})` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </>)}

      {/* ══ TOPICS ══ */}
      {activeTab === 'topics' && (<>
        <Card title="Confidence breakdown" icon={<Brain size={16} />}>
          {currentTopics.filter(t => t.confidence).length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <Brain size={28} style={{ opacity: 0.3 }} />
              <p>Rate topics in the Topics page to see your confidence breakdown</p>
            </div>
          ) : (
            <div className="analytics-conf-list">
              {[5, 4, 3, 2, 1].map(level => {
                const count = confidenceCounts[level] || 0
                const total = currentTopics.filter(t => t.confidence).length
                const pct = total ? Math.round((count / total) * 100) : 0
                return (
                  <div key={level}>
                    <div className="analytics-conf-item-top">
                      <span className="name">{CONF_LABELS[level]}</span>
                      <span className="count">{count} topic{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="thin-progress"><div className="thin-progress-fill" style={{ width: `${pct}%`, background: CONF_COLOURS[level] }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card title="Needs attention" icon={<AlertCircle size={16} />}>
          {weakTopics.length === 0 ? (
            <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} /> No topics rated as struggling — great work
            </p>
          ) : (
            <div>
              {weakTopics.map((t, i) => (
                <Link key={i} to={`/topics/${t.id}`} className="analytics-topic-row">
                  <div className="analytics-topic-row-top">
                    <span className="analytics-topic-name">{t.topic}</span>
                    <span className="analytics-topic-subject">{t.subject}</span>
                  </div>
                  <div className="thin-progress"><div className="thin-progress-fill" style={{ width: `${t.confidence * 20}%`, background: 'var(--danger)' }} /></div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Strong topics" icon={<CheckCircle size={16} />}>
          {strongTopics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Rate topics as confident and they'll appear here</p>
          ) : (
            <div className="analytics-strong-grid">
              {strongTopics.map((t, i) => (
                <Link key={i} to={`/topics/${t.id}`} className="analytics-strong-chip">
                  <span className="name">{t.topic}</span>
                  <span className="subject">{t.subject}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </>)}

      {/* ══ TRENDS ══ */}
      {activeTab === 'trends' && (<>
        <Card title="Grade trajectory" icon={<TrendingUp size={16} />}
          right={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="select" style={{ width: 'auto' }} value={gradeSub} onChange={e => setGradeSub(e.target.value)}>
                {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {gradeTrend !== null && <TrendChip value={gradeTrend} format={v => `${v > 0 ? '+' : ''}${v} pts`} period="first attempt" />}
            </div>
          }>
          {gradeTrajectory.length < 2 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>Log at least 2 papers for {gradeSub || 'this subject'} to see a trajectory</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={gradeTrajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={axisTick} unit="%" axisLine={false} tickLine={false} width={36} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Papers by subject" icon={<BookOpen size={16} />}>
          {papersBySubject.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No papers logged yet — log papers in Past Papers</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={papersBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Score distribution" icon={<BarChart2 size={16} />}>
          {currentAttempts.filter(a => a.percentage != null).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No percentage scores logged yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {scoreDistribution.map((b, i) => <Cell key={i} fill={b.min >= 70 ? 'var(--success)' : b.min >= 50 ? 'var(--warning)' : 'var(--danger)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Study summary" icon={<Star size={16} />}>
          <AIInsights
            sessions={completedSessions} topics={currentTopics} attempts={currentAttempts} profile={profile}
            dateRange={dateRange} avgDailyMinutes={avgDailyMinutes} weeklyPattern={weeklyPattern}
            weakTopics={weakTopics} subjectBalance={subjectBalance} uid={user?.uid} />
        </Card>

        <Card title="Study recommendations" icon={<Target size={16} />}>
          <div>
            {avgDailyMinutes < 30 && (
              <Rec icon={<Clock size={16} />} colour="var(--warning)" title="Increase daily study time"
                desc={`You're averaging ${avgDailyMinutes}m/day this period. Aim for at least 45–60 minutes daily for consistent progress.`} />
            )}
            {weakTopics.length > 3 && (
              <Rec icon={<Target size={16} />} colour="var(--danger)" title={`Focus on ${weakTopics.length} weak topics`}
                desc={`Your lowest-confidence topics are: ${weakTopics.slice(0, 3).map(t => t.topic).join(', ')}. Prioritise these in your next sessions.`} />
            )}
            {subjectBalance.some(s => s.pct < 40) && (
              <Rec icon={<BarChart2 size={16} />} colour="var(--info)" title="Rebalance your subjects"
                desc={`${subjectBalance.filter(s => s.pct < 40).map(s => s.name).join(', ')} ${subjectBalance.filter(s => s.pct < 40).length === 1 ? 'is' : 'are'} getting less than 40% of a fair share of study time.`} />
            )}
            {completionRate < 70 && sessions.length > 5 && (
              <Rec icon={<CheckCircle size={16} />} colour="var(--warning)" title="Improve session completion"
                desc={`Only ${completionRate}% of your sessions are marked complete. Try shorter sessions you can fully commit to.`} />
            )}
            {(profile?.streak || 0) < 3 && (
              <Rec icon={<Flame size={16} />} colour="var(--accent)" title="Build your streak"
                desc="Short daily sessions beat long irregular ones. Even 20 minutes every day builds momentum and improves retention." />
            )}
            {weeklyPattern.some(d => d.hours === 0 && ['Sat', 'Sun'].includes(d.day)) && attempts.length > 0 && (
              <Rec icon={<Calendar size={16} />} colour="#0d9488" title="Use weekends for papers"
                desc="Weekends are great for timed past paper practice when you have longer uninterrupted blocks." />
            )}
            {weakTopics.length === 0 && avgDailyMinutes >= 45 && completionRate >= 80 && (
              <div className="analytics-rec-positive">
                <span className="analytics-rec-icon"><Award size={16} /></span>
                <div>
                  <div className="analytics-rec-title">You're doing great</div>
                  <div className="analytics-rec-desc">Strong completion rate, good daily time, and no weak topics. Keep it up and focus on timed past papers to maximise exam performance.</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </>)}
    </div>
  )
}

function Rec({ icon, colour, title, desc }) {
  return (
    <div className="analytics-rec" style={{ '--rec-colour': colour }}>
      <span className="analytics-rec-icon">{icon}</span>
      <div>
        <div className="analytics-rec-title">{title}</div>
        <div className="analytics-rec-desc">{desc}</div>
      </div>
    </div>
  )
}

function AIInsights({ sessions, topics, attempts, profile, dateRange, avgDailyMinutes, weeklyPattern, weakTopics, subjectBalance, uid }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const { callAI } = await import('../utils/ai')
      const bestDay = [...weeklyPattern].sort((a, b) => b.hours - a.hours)[0]
      const needsWork = weakTopics.slice(0, 3).map(t => t.topic).join(', ')
      const lowSubs = subjectBalance.filter(s => s.pct < 50).map(s => s.name).join(', ')
      const prompt = `You are a GCSE/A-Level revision coach. Write a personalised 3-paragraph study summary for this student. Be encouraging but honest and specific.

Student data:
- Streak: ${profile?.streak || 0} days
- Total sessions: ${sessions.length} completed
- Avg daily study (last ${dateRange} days): ${avgDailyMinutes} minutes
- Most productive day: ${bestDay?.day} (${bestDay?.hours}h avg)
- Topics needing work: ${needsWork || 'none identified yet'}
- Underpractised subjects: ${lowSubs || 'none — good balance'}
- Papers attempted: ${attempts.length}
- Topics rated: ${topics.length}

Paragraph 1: What they're doing well (specific).
Paragraph 2: The 1-2 most important things to improve (specific, actionable).
Paragraph 3: One specific strategy or tip for the next 7 days.

Keep it under 200 words total. Address them as "you". Don't use bullet points.`

      const res = await callAI(prompt, null, 600, uid)
      if (res.error) { setSummary('Could not generate summary: ' + res.error); return }
      setSummary(res.text || '')
      setGenerated(true)
    } catch (e) {
      setSummary('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!generated && !loading) return (
    <div className="analytics-summary-empty">
      <p>Get a personalised summary of your study patterns and recommendations</p>
      <button className="btn btn-primary" onClick={generate}>Generate my study summary</button>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton height={16} /><Skeleton height={16} width="90%" /><Skeleton height={16} width="95%" /><Skeleton height={16} width="80%" />
    </div>
  )

  return (
    <div>
      <AIOutput text={summary} compact />
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { setSummary(''); setGenerated(false) }}>Regenerate</button>
    </div>
  )
}
