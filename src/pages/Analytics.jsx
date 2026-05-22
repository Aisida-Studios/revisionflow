// src/pages/Analytics.jsx
import React, { useState, useEffect, useMemo } from 'react'
import Skeleton from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { getPaperAttempts } from '../utils/firestore'
import { format, subDays, eachDayOfInterval, startOfWeek, getDay } from 'date-fns'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area,
} from 'recharts'
import { SUBJECT_COLOURS } from '../data/subjects'
import { Activity, Clock, Flame, TrendingUp, Award, Target, BookOpen,
         Zap, Brain, Calendar, Star, AlertCircle, CheckCircle, BarChart2 } from 'lucide-react'

const COLOURS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7']
const HOUR_LABELS = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am',
                     '12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function StatCard({ icon, label, val, sub, colour, loading }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
      <div style={{ color: colour || 'var(--accent-light)', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '1.35rem', color: colour || 'var(--accent-light)' }}>
        {loading ? <Skeleton height={26} width={60} style={{ margin: '0 auto' }} /> : val}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
        {loading ? <Skeleton height={11} width={70} style={{ margin: '4px auto 0' }} /> : label}
      </div>
      {sub && !loading && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
          {icon} {title}
        </h4>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '14px 18px' }}>{children}</div>}
    </div>
  )
}

export default function Analytics() {
  const { user, profile } = useAuth()
  const [sessions,  setSessions]  = useState([])
  const [attempts,  setAttempts]  = useState([])
  const [topics,    setTopics]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [dateRange, setDateRange] = useState(30)
  const [gradeSub,  setGradeSub]  = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getDocs(collection(db, 'users', user.uid, 'sessions')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      getPaperAttempts(user.uid, null),
      getDocs(collection(db, 'users', user.uid, 'topicConfidence')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
    ]).then(([sess, atts, tops]) => {
      setSessions(sess)
      setAttempts(atts)
      setTopics(tops)
      setLoading(false)
    })
  }, [user])

  const subjectList = profile?.subjects?.map(s => s.name) || []
  useEffect(() => { if (subjectList.length && !gradeSub) setGradeSub(subjectList[0]) }, [subjectList.length])

  // ── Core data ──────────────────────────────────────────────────────────────
  const completedSessions = useMemo(() => sessions.filter(s => s.completed), [sessions])
  const totalMinutes      = useMemo(() => completedSessions.reduce((sum, s) => sum + (parseInt(s.duration) || 45), 0), [completedSessions])
  const rangeStart        = useMemo(() => subDays(new Date(), dateRange), [dateRange])

  const recentSessions = useMemo(() => completedSessions.filter(s => {
    const d = s.startTime ? new Date(s.startTime) : s.date ? new Date(s.date + 'T00:00:00') : null
    return d && d >= rangeStart
  }), [completedSessions, rangeStart])

  const recentMinutes    = useMemo(() => recentSessions.reduce((sum, s) => sum + (parseInt(s.duration) || 45), 0), [recentSessions])
  const avgDailyMinutes  = Math.round(recentMinutes / dateRange)
  const completionRate   = sessions.length ? Math.round((completedSessions.length / sessions.length) * 100) : 0
  const avgSessionLength = completedSessions.length ? Math.round(totalMinutes / completedSessions.length) : 0

  // ── Daily study chart ─────────────────────────────────────────────────────
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: rangeStart, end: new Date() })
    return days.map(day => {
      const dayStr     = format(day, 'yyyy-MM-dd')
      const daySess    = recentSessions.filter(s =>
        s.date === dayStr || (s.startTime && format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr)
      )
      const bySubject  = {}
      let total        = 0
      daySess.forEach(s => {
        const hrs = (parseInt(s.duration) || 45) / 60
        bySubject[s.subject] = (bySubject[s.subject] || 0) + hrs
        total += hrs
      })
      return { date: format(day, dateRange <= 14 ? 'EEE d' : 'd MMM'), total: Math.round(total * 10) / 10, sessions: daySess.length, ...bySubject }
    })
  }, [recentSessions, dateRange])

  // ── Weekly pattern ────────────────────────────────────────────────────────
  const weeklyPattern = useMemo(() => {
    const counts = Array(7).fill(0).map((_, i) => ({ day: DAY_NAMES[i], minutes: 0, sessions: 0 }))
    completedSessions.forEach(s => {
      const d = s.startTime ? new Date(s.startTime) : s.date ? new Date(s.date + 'T12:00:00') : null
      if (!d) return
      const dow = getDay(d)
      counts[dow].minutes  += parseInt(s.duration) || 45
      counts[dow].sessions += 1
    })
    return counts.map(c => ({ ...c, hours: Math.round(c.minutes / 60 * 10) / 10 }))
  }, [completedSessions])

  // ── Time of day ───────────────────────────────────────────────────────────
  const timeOfDayData = useMemo(() => {
    const buckets = [
      { label: 'Early\n6–9am',  hours: [6,7,8],        sessions: 0, minutes: 0 },
      { label: 'Morning\n9–12', hours: [9,10,11],       sessions: 0, minutes: 0 },
      { label: 'Afternoon\n12–5',hours:[12,13,14,15,16], sessions: 0, minutes: 0 },
      { label: 'Evening\n5–9pm', hours: [17,18,19,20],  sessions: 0, minutes: 0 },
      { label: 'Night\n9pm+',   hours: [21,22,23,0,1],  sessions: 0, minutes: 0 },
    ]
    completedSessions.forEach(s => {
      if (!s.startTime) return
      const hr = new Date(s.startTime).getHours()
      const bucket = buckets.find(b => b.hours.includes(hr))
      if (bucket) { bucket.sessions++; bucket.minutes += parseInt(s.duration) || 45 }
    })
    return buckets.map(b => ({ ...b, hours: Math.round(b.minutes / 60 * 10) / 10 }))
  }, [completedSessions])

  // ── Subject distribution ──────────────────────────────────────────────────
  const subjectDist = useMemo(() => {
    const counts = {}
    completedSessions.forEach(s => {
      if (!s.subject) return
      counts[s.subject] = (counts[s.subject] || 0) + (parseInt(s.duration) || 45)
    })
    return Object.entries(counts)
      .map(([name, minutes]) => ({ name, minutes, hours: Math.round(minutes / 60 * 10) / 10 }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [completedSessions])

  // ── Subject balance (how close to equal distribution) ────────────────────
  const subjectBalance = useMemo(() => {
    if (!subjectDist.length) return []
    const target = totalMinutes / subjectDist.length
    return subjectDist.map(s => ({
      name:  s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name,
      actual: s.hours,
      target: Math.round(target / 60 * 10) / 10,
      pct: Math.min(100, Math.round((s.minutes / Math.max(target, 1)) * 100)),
    }))
  }, [subjectDist, totalMinutes])

  // ── Topic confidence breakdown ────────────────────────────────────────────
  const confidenceBreakdown = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    topics.forEach(t => { if (t.confidence) counts[t.confidence] = (counts[t.confidence] || 0) + 1 })
    const labels = { 1: 'Not started', 2: 'Struggling', 3: 'Getting there', 4: 'Confident', 5: 'Mastered' }
    const colours = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#10b981', 5: '#7c3aed' }
    return Object.entries(counts).map(([k, v]) => ({ name: labels[k], value: v, colour: colours[k] })).filter(c => c.value > 0)
  }, [topics])

  const weakTopics = useMemo(() =>
    topics.filter(t => t.confidence <= 2).slice(0, 8)
      .map(t => ({ subject: t.subject || '–', topic: t.topicName || t.topic || t.id, confidence: t.confidence || 1 }))
  , [topics])

  const strongTopics = useMemo(() =>
    topics.filter(t => t.confidence >= 4).slice(0, 6)
      .map(t => ({ subject: t.subject || '–', topic: t.topicName || t.topic || t.id }))
  , [topics])

  // ── Grade trajectory ──────────────────────────────────────────────────────
  const gradeTrajectory = useMemo(() => {
    if (!gradeSub) return []
    return attempts
      .filter(a => a.subject === gradeSub && a.percentage)
      .sort((a, b) => new Date(a.attemptDate || a.createdAt?.seconds * 1000 || 0) - new Date(b.attemptDate || b.createdAt?.seconds * 1000 || 0))
      .map((a, i) => ({ attempt: i + 1, label: `P${a.paper} ${a.year}`, percentage: Math.round(a.percentage), grade: a.grade || '' }))
  }, [attempts, gradeSub])

  const gradeTrend = useMemo(() => {
    if (gradeTrajectory.length < 2) return null
    const first = gradeTrajectory[0].percentage
    const last  = gradeTrajectory[gradeTrajectory.length - 1].percentage
    return last - first
  }, [gradeTrajectory])

  // ── Session length distribution ───────────────────────────────────────────
  const sessionLengthDist = useMemo(() => {
    const buckets = [
      { label: '<15m',  min: 0,   max: 15,  count: 0 },
      { label: '15–30m',min: 15,  max: 30,  count: 0 },
      { label: '30–45m',min: 30,  max: 45,  count: 0 },
      { label: '45–60m',min: 45,  max: 60,  count: 0 },
      { label: '60–90m',min: 60,  max: 90,  count: 0 },
      { label: '90m+',  min: 90,  max: 9999,count: 0 },
    ]
    completedSessions.forEach(s => {
      const dur = parseInt(s.duration) || 45
      const b = buckets.find(b => dur >= b.min && dur < b.max)
      if (b) b.count++
    })
    return buckets
  }, [completedSessions])

  // ── XP over time ──────────────────────────────────────────────────────────
  const xpHistory = useMemo(() => {
    if (!profile?.xp) return []
    // Approximate from session count — real XP history would need its own subcollection
    const days = eachDayOfInterval({ start: rangeStart, end: new Date() })
    let cumXP = Math.max(0, (profile.xp || 0) - recentSessions.length * 50)
    return days.map(day => {
      const dayStr  = format(day, 'yyyy-MM-dd')
      const daySess = recentSessions.filter(s =>
        s.date === dayStr || (s.startTime && format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr)
      )
      cumXP += daySess.length * 50
      return { date: format(day, dateRange <= 14 ? 'EEE d' : 'd MMM'), xp: cumXP }
    })
  }, [recentSessions, profile, dateRange])

  // ── Personal records ──────────────────────────────────────────────────────
  const records = useMemo(() => {
    const longestSession = completedSessions.reduce((max, s) => Math.max(max, parseInt(s.duration) || 45), 0)
    const sessionsPerDay = {}
    completedSessions.forEach(s => {
      const d = s.date || (s.startTime ? format(new Date(s.startTime), 'yyyy-MM-dd') : null)
      if (d) sessionsPerDay[d] = (sessionsPerDay[d] || 0) + 1
    })
    const mostProductiveDay = Object.entries(sessionsPerDay).sort((a, b) => b[1] - a[1])[0]
    const bestStreak = profile?.streak || 0
    const subjectMins = {}
    completedSessions.forEach(s => {
      if (s.subject) subjectMins[s.subject] = (subjectMins[s.subject] || 0) + (parseInt(s.duration) || 45)
    })
    const topSubject = Object.entries(subjectMins).sort((a, b) => b[1] - a[1])[0]
    return { longestSession, mostProductiveDay, bestStreak, topSubject }
  }, [completedSessions, profile])

  // ── Consistency heatmap ───────────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const start = subDays(new Date(), 83)
    const days  = eachDayOfInterval({ start, end: new Date() })
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const count  = completedSessions.filter(s =>
        s.date === dayStr || (s.startTime && format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr)
      ).length
      return { date: day, dayStr, count, label: format(day, 'EEE d MMM') }
    })
  }, [completedSessions])

  const heatColour = (count) => {
    if (count === 0) return 'var(--bg-hover)'
    if (count === 1) return 'rgba(124,58,237,0.35)'
    if (count === 2) return 'rgba(124,58,237,0.58)'
    if (count === 3) return 'rgba(124,58,237,0.78)'
    return '#7c3aed'
  }

  const fmtMins = (m) => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`

  const TABS = ['overview','subjects','topics','grades','insights']

  if (loading) return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
        {Array(6).fill(0).map((_, i) => <div key={i} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}><Skeleton height={60} /></div>)}
      </div>
      <Skeleton height={220} style={{ marginBottom: 16, borderRadius: 12 }} />
      <Skeleton height={180} style={{ borderRadius: 12 }} />
    </div>
  )

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Activity size={22} /> Study Insights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>Your complete revision analytics</p>
        </div>
        <select className="select" style={{ width: 'auto' }} value={dateRange} onChange={e => setDateRange(parseInt(e.target.value))}>
          {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>

      {/* ── Summary stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard icon={<Clock size={18}/>}    label="Total study time"    val={fmtMins(totalMinutes)}        colour="var(--accent-light)" />
        <StatCard icon={<Activity size={18}/>} label="Sessions completed"  val={completedSessions.length}     colour="var(--info)" />
        <StatCard icon={<Zap size={18}/>}      label="Avg session length"  val={`${avgSessionLength}m`}       colour="var(--purple-300)" />
        <StatCard icon={<Flame size={18}/>}    label="Current streak"      val={`${profile?.streak||0} days`} colour="var(--warning)" />
        <StatCard icon={<Target size={18}/>}   label="Completion rate"     val={`${completionRate}%`}         colour="var(--success)" />
        <StatCard icon={<BookOpen size={18}/>} label="Papers logged"       val={attempts.length}              colour="var(--accent)" />
        <StatCard icon={<Brain size={18}/>}    label="Topics tracked"      val={topics.length}                colour="var(--purple-400)" />
        <StatCard icon={<BarChart2 size={18}/>}label="Avg daily (period)"  val={`${avgDailyMinutes}m`}        colour="var(--info)" />
      </div>

      {/* ── Tabs ── */}
      <div className="tabs" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}
            style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === 'overview' && (<>

        {/* Daily study chart */}
        <Section title="Daily Study Hours" icon={<Clock size={16}/>}>
          {dailyData.every(d => d.total === 0) ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No completed sessions in this period</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="h" />
                <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="total" stroke="var(--accent)" fill="url(#areaGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Weekly pattern */}
        <Section title="Day-of-Week Pattern" icon={<Calendar size={16}/>}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Which days you study most — all time</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="h" />
              <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="hours" radius={[4,4,0,0]}>
                {weeklyPattern.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {weeklyPattern.length > 0 && (() => {
            const best = [...weeklyPattern].sort((a,b) => b.hours - a.hours)[0]
            const worst = [...weeklyPattern].filter(d => d.sessions > 0).sort((a,b) => a.hours - b.hours)[0]
            return (
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-green">🏆 Most productive: {best.day} ({best.hours}h avg)</span>
                {worst && worst.day !== best.day && <span className="badge badge-grey">📉 Lightest: {worst.day}</span>}
              </div>
            )
          })()}
        </Section>

        {/* Time of day */}
        <Section title="Time of Day" icon={<Clock size={16}/>}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>When you tend to study — all time</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={timeOfDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="h" />
              <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="hours" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {timeOfDayData.length > 0 && (() => {
            const peak = [...timeOfDayData].sort((a,b) => b.hours - a.hours)[0]
            if (!peak || peak.hours === 0) return null
            return <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 10 }}>📍 You study most in the <strong>{peak.label.split('\n')[0]}</strong></p>
          })()}
        </Section>

        {/* Session length distribution */}
        <Section title="Session Length Distribution" icon={<BarChart2 size={16}/>}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sessionLengthDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Consistency heatmap */}
        <Section title="Study Consistency (12 weeks)" icon={<Calendar size={16}/>}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(84,1fr)', gap: 2, minWidth: 560 }}>
              {heatmapData.map((d, i) => (
                <div key={i} title={`${d.label}: ${d.count} session${d.count !== 1 ? 's' : ''}`}
                  style={{ aspectRatio: '1', borderRadius: 2, background: heatColour(d.count), cursor: 'default' }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Less
              {[0,1,2,3,4].map(n => <div key={n} style={{ width: 12, height: 12, borderRadius: 2, background: heatColour(n) }} />)}
              More
            </div>
          </div>
        </Section>

        {/* Personal records */}
        <Section title="Personal Records" icon={<Award size={16}/>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
            {[
              { label: '🏆 Longest session',    val: fmtMins(records.longestSession) || '–' },
              { label: '🔥 Best streak',         val: `${records.bestStreak} days` },
              { label: '📅 Most productive day', val: records.mostProductiveDay ? `${records.mostProductiveDay[0]} (${records.mostProductiveDay[1]} sessions)` : '–' },
              { label: '📚 Top subject',         val: records.topSubject ? `${records.topSubject[0]} (${fmtMins(records.topSubject[1])})` : '–' },
              { label: '📝 Papers attempted',    val: attempts.length },
              { label: '🧠 Topics rated',        val: topics.length },
            ].map(r => (
              <div key={r.label} style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.val}</div>
              </div>
            ))}
          </div>
        </Section>
      </>)}

      {/* ══ SUBJECTS TAB ══ */}
      {activeTab === 'subjects' && (<>

        <Section title="Time by Subject" icon={<BookOpen size={16}/>}>
          {subjectDist.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No sessions logged yet</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="h" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={90} />
                  <Tooltip formatter={(v) => [`${v}h`, 'Study time']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="hours" radius={[0,4,4,0]}>
                    {subjectDist.map((s, i) => <Cell key={i} fill={SUBJECT_COLOURS?.[s.name] || COLOURS[i % COLOURS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {subjectDist.map((s, i) => (
                  <span key={s.name} className="badge" style={{ background: (SUBJECT_COLOURS?.[s.name] || COLOURS[i % COLOURS.length]) + '22', color: SUBJECT_COLOURS?.[s.name] || COLOURS[i % COLOURS.length] }}>
                    {s.name}: {s.hours}h
                  </span>
                ))}
              </div>
            </>
          )}
        </Section>

        <Section title="Subject Balance" icon={<Target size={16}/>}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>How evenly you distribute your time — 100% = your fair share</p>
          {subjectBalance.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No data yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subjectBalance.map((s, i) => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontSize: '0.8rem', color: s.pct < 50 ? 'var(--danger)' : s.pct > 150 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                      {s.pct}%{s.pct < 50 ? ' ⚠️' : s.pct > 150 ? ' 📈' : ' ✓'}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: Math.min(s.pct, 100) + '%', borderRadius: 4,
                      background: s.pct < 50 ? 'var(--danger)' : s.pct > 150 ? 'var(--warning)' : 'var(--success)',
                      transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="XP Earned (this period)" icon={<Zap size={16}/>}>
          {xpHistory.every(d => d.xp === 0) ? <p style={{ color: 'var(--text-muted)' }}>No XP data yet</p> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={xpHistory}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="xp" stroke="#f59e0b" fill="url(#xpGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Section>
      </>)}

      {/* ══ TOPICS TAB ══ */}
      {activeTab === 'topics' && (<>

        <Section title="Confidence Breakdown" icon={<Brain size={16}/>}>
          {confidenceBreakdown.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <Brain size={32} style={{ opacity: 0.3 }} />
              <p>Rate topics in the Topics page to see your confidence breakdown</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={confidenceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {confidenceBreakdown.map((c, i) => <Cell key={i} fill={c.colour} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {confidenceBreakdown.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.colour, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', flex: 1 }}>{c.name}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {topics.length} topics rated total
                </div>
              </div>
            </div>
          )}
        </Section>

        <Section title="Needs Attention" icon={<AlertCircle size={16}/>}>
          {weakTopics.length === 0 ? (
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>✓ No topics rated as struggling — great work!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weakTopics.map((t, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.topic}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subject}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: '0.9rem', opacity: n <= t.confidence ? 1 : 0.2 }}>⭐</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Strong Topics" icon={<CheckCircle size={16}/>}>
          {strongTopics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Rate topics as confident (4–5 stars) and they'll appear here</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {strongTopics.map((t, i) => (
                <div key={i} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, fontSize: '0.82rem', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{t.topic}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.subject}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </>)}

      {/* ══ GRADES TAB ══ */}
      {activeTab === 'grades' && (<>

        <Section title="Grade Trajectory" icon={<TrendingUp size={16}/>}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <select className="select" style={{ width: 'auto' }} value={gradeSub} onChange={e => setGradeSub(e.target.value)}>
              {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {gradeTrend !== null && (
              <span className={`badge ${gradeTrend >= 0 ? 'badge-green' : 'badge-red'}`}>
                {gradeTrend >= 0 ? '📈' : '📉'} {gradeTrend >= 0 ? '+' : ''}{gradeTrend}% since first attempt
              </span>
            )}
          </div>
          {gradeTrajectory.length < 2 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>Log at least 2 papers for {gradeSub} to see your trajectory</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={gradeTrajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Papers by Subject" icon={<BookOpen size={16}/>}>
          {attempts.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}><p>No papers logged yet — log papers in Past Papers</p></div>
          ) : (() => {
            const bySubject = {}
            attempts.forEach(a => { bySubject[a.subject] = (bySubject[a.subject] || 0) + 1 })
            const data = Object.entries(bySubject).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count)
            return (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          })()}
        </Section>

        <Section title="Score Distribution" icon={<BarChart2 size={16}/>}>
          {attempts.filter(a => a.percentage).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No percentage scores logged yet</p>
          ) : (() => {
            const buckets = [
              { label: '0–40%',  min: 0,  max: 40,  count: 0 },
              { label: '40–50%', min: 40, max: 50,  count: 0 },
              { label: '50–60%', min: 50, max: 60,  count: 0 },
              { label: '60–70%', min: 60, max: 70,  count: 0 },
              { label: '70–80%', min: 70, max: 80,  count: 0 },
              { label: '80–90%', min: 80, max: 90,  count: 0 },
              { label: '90–100%',min: 90, max: 101, count: 0 },
            ]
            attempts.forEach(a => {
              if (!a.percentage) return
              const b = buckets.find(b => a.percentage >= b.min && a.percentage < b.max)
              if (b) b.count++
            })
            return (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {buckets.map((b, i) => <Cell key={i} fill={b.min >= 70 ? 'var(--success)' : b.min >= 50 ? 'var(--warning)' : 'var(--danger)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          })()}
        </Section>
      </>)}

      {/* ══ INSIGHTS TAB ══ */}
      {activeTab === 'insights' && (<>

        <Section title="AI Study Summary" icon={<Star size={16}/>}>
          <AIInsights
            sessions={completedSessions}
            topics={topics}
            attempts={attempts}
            profile={profile}
            dateRange={dateRange}
            recentMinutes={recentMinutes}
            avgDailyMinutes={avgDailyMinutes}
            weeklyPattern={weeklyPattern}
            weakTopics={weakTopics}
            subjectBalance={subjectBalance}
            uid={user?.uid}
          />
        </Section>

        <Section title="Study Recommendations" icon={<Target size={16}/>} defaultOpen={true}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {avgDailyMinutes < 30 && (
              <Rec icon="⏱" colour="var(--warning)"
                title="Increase daily study time"
                desc={`You're averaging ${avgDailyMinutes}m/day this period. Aim for at least 45–60 minutes daily for consistent progress.`} />
            )}
            {weakTopics.length > 3 && (
              <Rec icon="🎯" colour="var(--danger)"
                title={`Focus on ${weakTopics.length} weak topics`}
                desc={`Your lowest-confidence topics are: ${weakTopics.slice(0,3).map(t => t.topic).join(', ')}. Prioritise these in your next sessions.`} />
            )}
            {subjectBalance.some(s => s.pct < 40) && (
              <Rec icon="⚖️" colour="var(--info)"
                title="Rebalance your subjects"
                desc={`${subjectBalance.filter(s => s.pct < 40).map(s => s.name).join(', ')} ${subjectBalance.filter(s => s.pct < 40).length === 1 ? 'is' : 'are'} getting less than 40% of your fair share of study time.`} />
            )}
            {completionRate < 70 && sessions.length > 5 && (
              <Rec icon="✅" colour="var(--warning)"
                title="Improve session completion"
                desc={`Only ${completionRate}% of your sessions are marked complete. Try shorter sessions you can fully commit to.`} />
            )}
            {profile?.streak < 3 && (
              <Rec icon="🔥" colour="var(--accent)"
                title="Build your streak"
                desc="Short daily sessions beat long irregular ones. Even 20 minutes every day will build momentum and improve retention." />
            )}
            {weeklyPattern.some(d => d.hours === 0 && ['Sat','Sun'].includes(d.day)) && attempts.length > 0 && (
              <Rec icon="📅" colour="var(--purple-400)"
                title="Use weekends for papers"
                desc="Weekends are great for timed past paper practice when you have longer uninterrupted blocks." />
            )}
            {weakTopics.length === 0 && avgDailyMinutes >= 45 && completionRate >= 80 && (
              <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>🌟 You're doing great!</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Strong completion rate, good daily time, and no weak topics. Keep it up and focus on timed past papers to maximise exam performance.</div>
              </div>
            )}
          </div>
        </Section>
      </>)}
    </div>
  )
}

function Rec({ icon, colour, title, desc }) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${colour}` }}>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{icon} {title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}

function AIInsights({ sessions, topics, attempts, profile, dateRange, recentMinutes, avgDailyMinutes, weeklyPattern, weakTopics, subjectBalance, uid }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const { callAI } = await import('../utils/ai')
      const bestDay  = [...weeklyPattern].sort((a,b) => b.hours - a.hours)[0]
      const needsWork = weakTopics.slice(0,3).map(t => t.topic).join(', ')
      const lowSubs  = subjectBalance.filter(s => s.pct < 50).map(s => s.name).join(', ')
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
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: '0.875rem' }}>
        Get a personalised AI summary of your study patterns and recommendations
      </p>
      <button className="btn btn-primary" onClick={generate}>✨ Generate my study summary</button>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton height={16} />
      <Skeleton height={16} width="90%" />
      <Skeleton height={16} width="95%" />
      <Skeleton height={16} width="80%" />
    </div>
  )

  return (
    <div>
      <p style={{ lineHeight: 1.7, color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{summary}</p>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { setSummary(''); setGenerated(false) }}>
        ↺ Regenerate
      </button>
    </div>
  )
}
