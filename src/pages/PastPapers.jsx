// src/pages/PastPapers.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  savePaperAttempt, getPaperAttempts, deletePaperAttempt, updatePaperAttempt, gradeImpliesQualification,
} from '../utils/firestore'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { analyseWeaknesses } from '../utils/ai'
import { gradeColour } from '../utils/calendar'
import { AVAILABLE_YEARS, getPastPaperSourceUrl } from '../data/paperDatabase'
import { getMergedPaperSpec, getMergedBoundaries, saveBoundaryOverride } from '../data/overrides'
import { isTiered } from '../data/examDates2026'
import { paperName } from '../data/paperNames'
import { getAllTopicsFlat } from '../data/topics'
import { displayTopicName } from '../utils/topicDisplay'
import { SUBJECT_COLOURS, getGradeOptions, getSubjectQualification } from '../data/subjects'
import Skeleton from '../components/Skeleton'
import AIOutput from '../components/AIOutput'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  Plus, X, Brain, TrendingUp, TrendingDown, FileText, Trash2, Edit2, Check, Search,
  ExternalLink, AlertCircle,
} from 'lucide-react'
import './PastPapers.css'

const tooltipStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }
const axisTick = { fontSize: 11, fill: 'var(--text-muted)' }

// ── Helpers ──────────────────────────────────────────────────────────────────
function attemptDateOf(a) {
  if (a.attemptDate) return new Date(a.attemptDate + 'T00:00:00')
  if (a.createdAt?.seconds) return new Date(a.createdAt.seconds * 1000)
  return null
}
function fmtDate(a) {
  const d = attemptDateOf(a)
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'
}
// Groups per-question marks by the topic string entered against each question and computes a
// percentage per topic. Real data only — an attempt with no questionMarks yields an empty array,
// never a fabricated breakdown.
function aggregateByTopic(questionMarks) {
  if (!Array.isArray(questionMarks) || !questionMarks.length) return []
  const groups = {}
  questionMarks.forEach(q => {
    const key = (q.topic || '').trim()
    if (!key) return
    if (!groups[key]) groups[key] = { topic: key, scored: 0, marks: 0 }
    groups[key].scored += Number(q.scored) || 0
    groups[key].marks += Number(q.marks) || 0
  })
  return Object.values(groups)
    .filter(g => g.marks > 0)
    .map(g => ({ ...g, pct: Math.round((g.scored / g.marks) * 100) }))
    .sort((a, b) => a.pct - b.pct)
}
// Stricter than the shared filterToCurrentQualification (used elsewhere in the app, e.g.
// Dashboard's predicted grades): still trusts an explicit qualification tag, or an unambiguous
// grade format (GCSE grades are 1-9, A-Level/AS-Level use A*-E), but never falls back to
// guessing from whichever other record for the subject happens to be closest in time. That
// time-proximity guess is reasonable for a quick dashboard glance, but here — averages, trends,
// trajectories — it can silently blend an old qualification's numbers into a new one's (e.g.
// GCSE Maths into AS-Level Maths). An honest gap is better than a wrong average.
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

// Real UK grade boundaries are almost always published per WHOLE SUBJECT — every component
// paper added together — not per individual paper. E.g. AQA GCSE Maths Higher boundaries are
// out of 240 (three 80-mark papers combined), but a single logged paper is only out of 80.
// Comparing a raw single-paper score against that combined-total boundary breaks completely: a
// perfect 80/80 (100%) never reaches a boundary meant for 240, and comes out as a U.
// Comparing PERCENTAGES instead is scale-independent, and matches how students actually use a
// single practice paper to gauge themselves ("boundaries were 78% for a 9, I got 82%, so I'm on
// track") — it's an ESTIMATE from one paper, not the real combined-exam grade, so callers should
// treat/label it as such whenever the boundary's own maxMarks doesn't match the paper's.
function gradeFromBoundaries(scorePercentage, boundaryData) {
  if (!boundaryData?.boundaries?.length || !boundaryData?.maxMarks || scorePercentage == null) return null
  const { boundaries, grades, maxMarks } = boundaryData
  const gradeLabels = grades && grades.length ? grades : ['9', '8', '7', '6', '5', '4', '3', '2', '1']
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i] == null) continue
    const boundaryPct = (boundaries[i] / maxMarks) * 100
    if (scorePercentage >= boundaryPct) return gradeLabels[i]
  }
  return 'U'
}
// True when the boundary data's own mark scale doesn't match the paper actually being logged —
// the tell-tale sign we're comparing against a whole-subject/combined-papers boundary rather
// than a genuine per-paper one, so the resulting grade is an estimate, not the real thing.
function isEstimatedGrade(boundaryData, attemptMaxMarks) {
  return !!(boundaryData?.maxMarks && attemptMaxMarks && boundaryData.maxMarks !== Number(attemptMaxMarks))
}
// Matches a free-typed topic name against the student's REAL topic docs for that subject only —
// never constructs/guesses a topic ID. If nothing matches, callers fall back to a subject-filtered
// Topics link rather than a possibly-wrong direct link.
function findTopicMatch(topics, subjectName, topicName) {
  if (!topicName) return null
  const norm = s => (s || '').trim().toLowerCase()
  const target = norm(topicName)
  return topics.find(t => norm(t.subjectId) === norm(subjectName) && norm(displayTopicName(t.name || t.topicName || '')) === target)
    || topics.find(t => norm(t.subjectId) === norm(subjectName) && norm(t.name || t.topicName || '') === target)
    || null
}
function findPreviousAttempt(attempts, current) {
  const curDate = attemptDateOf(current)
  if (!curDate) return null
  const before = attempts
    .filter(a => a.subject === current.subject && a.id !== current.id && a.percentage != null)
    .map(a => ({ a, d: attemptDateOf(a) }))
    .filter(x => x.d && x.d < curDate)
    .sort((x, y) => y.d - x.d)
  return before[0]?.a || null
}

export default function PastPapers() {
  const { user, profile } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('attempts')
  const [selSubject, setSelSubject] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [showQPrompt, setShowQPrompt] = useState(null)
  const [backfillQueue, setBackfillQueue] = useState(null) // null = not backfilling; array of attempts still to go
  const [backfillTotal, setBackfillTotal] = useState(0)
  const [detailAttempt, setDetailAttempt] = useState(null)
  const [boundaryEditor, setBoundaryEditor] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [recalcProgress, setRecalcProgress] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getPaperAttempts(user.uid),
      getDocs(collection(db, 'users', user.uid, 'topics')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
    ]).then(([atts, tops]) => { setAttempts(atts); setTopics(tops); setLoading(false) })
  }, [user])

  const currentAttempts = useMemo(() => strictQualificationMatch(attempts, profile?.subjects), [attempts, profile])
  const currentTopics = useMemo(() => strictQualificationMatch(topics, profile?.subjects), [topics, profile])
  const subjectList = profile?.subjects?.map(s => s.name) || []

  const subjectAverages = useMemo(() => {
    return subjectList.map(name => {
      const atts = currentAttempts.filter(a => a.subject === name && a.percentage != null)
        .sort((a, b) => (attemptDateOf(a) || 0) - (attemptDateOf(b) || 0))
      if (!atts.length) return { name, avg: null, count: 0, trend: null }
      const avg = Math.round(atts.reduce((s, a) => s + a.percentage, 0) / atts.length)
      let trend = null
      if (atts.length >= 4) {
        const half = Math.floor(atts.length / 2)
        const firstHalf = atts.slice(0, half).reduce((s, a) => s + a.percentage, 0) / half
        const secondHalf = atts.slice(half).reduce((s, a) => s + a.percentage, 0) / (atts.length - half)
        trend = Math.round(secondHalf - firstHalf)
      }
      return { name, avg, count: atts.length, trend }
    }).filter(s => s.count > 0)
  }, [currentAttempts, subjectList])

  const filtered = useMemo(() => {
    let list = currentAttempts
    if (selSubject) list = list.filter(a => a.subject === selSubject)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(a => `${a.subject} ${a.board} ${a.paper} ${a.year} ${a.tier || ''}`.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => (attemptDateOf(b) || 0) - (attemptDateOf(a) || 0))
  }, [currentAttempts, selSubject, search])

  const attemptsMissingBreakdown = useMemo(() =>
    [...currentAttempts].filter(a => !a.questionMarks?.length).sort((a, b) => (attemptDateOf(b) || 0) - (attemptDateOf(a) || 0))
  , [currentAttempts])

  async function handleDelete(id) {
    if (!window.confirm('Delete this paper attempt? This cannot be undone.')) return
    await deletePaperAttempt(user.uid, id)
    setAttempts(prev => prev.filter(a => a.id !== id))
    setDetailAttempt(null)
    toast.success('Attempt deleted')
  }

  async function handleSaveQuestionMarks(attemptId, questionMarks) {
    await updatePaperAttempt(user.uid, attemptId, { questionMarks })
    setAttempts(prev => prev.map(a => a.id === attemptId ? { ...a, questionMarks } : a))
    setDetailAttempt(prev => (prev && prev.id === attemptId) ? { ...prev, questionMarks } : prev)
  }

  // Guided flow for adding topic breakdowns to several already-logged papers in one go, without
  // fabricating any of the per-question data itself — the student still enters real marks for
  // each paper, this just removes the friction of finding and opening each one individually.
  function startBackfill(list) {
    if (!list.length) return
    setBackfillTotal(list.length)
    setBackfillQueue(list.slice(1))
    setShowQPrompt(list[0])
  }
  function advanceBackfill() {
    if (backfillQueue === null) { setShowQPrompt(null); return }
    if (backfillQueue.length === 0) {
      setBackfillQueue(null)
      setShowQPrompt(null)
      toast.success('All done — topic breakdowns updated')
      return
    }
    setShowQPrompt(backfillQueue[0])
    setBackfillQueue(backfillQueue.slice(1))
  }
  function stopBackfill() {
    setBackfillQueue(null)
    setShowQPrompt(null)
  }

  // One-off fix-up for attempts logged before the grade calculation bug was fixed (it was
  // comparing a single paper's raw marks against whole-subject, all-papers-combined boundaries,
  // so scores frequently came out far too low — e.g. a perfect single-paper score reading as a
  // U). Re-derives every attempt's grade with the corrected, percentage-based logic and only
  // writes the ones that actually changed.
  async function handleRecalculateGrades() {
    if (!currentAttempts.length) { toast.error('No papers to recalculate'); return }
    setRecalculating(true)
    let changed = 0
    try {
      const scored = currentAttempts.filter(a => a.percentage != null)
      for (let i = 0; i < scored.length; i++) {
        const a = scored[i]
        setRecalcProgress({ current: i + 1, total: scored.length })
        const qual = a.qualification || profile?.subjects?.find(s => s.name === a.subject)?.qualification
        const bounds = await getMergedBoundaries(a.board, a.subject, a.tier === 'N/A' ? null : a.tier, a.year, qual)
        const newGrade = bounds?.boundaries ? gradeFromBoundaries(a.percentage, bounds) : null
        const newEstimated = isEstimatedGrade(bounds, a.maxMarks)
        if (newGrade !== (a.grade ?? null) || newEstimated !== (a.gradeEstimated || false)) {
          await updatePaperAttempt(user.uid, a.id, { grade: newGrade, gradeEstimated: newEstimated })
          setAttempts(prev => prev.map(x => x.id === a.id ? { ...x, grade: newGrade, gradeEstimated: newEstimated } : x))
          changed++
        }
      }
      toast.success(changed ? `Updated ${changed} grade${changed === 1 ? '' : 's'}` : 'All grades were already correct')
    } catch (e) {
      toast.error('Could not recalculate: ' + e.message)
    } finally {
      setRecalculating(false)
      setRecalcProgress(null)
    }
  }

  async function runAnalysis() {
    setAnalysing(true)
    try {
      const result = await analyseWeaknesses(currentAttempts, selSubject, user.uid)
      if (result.error) toast.error(result.error)
      setAnalysis(result.text || result.error || 'Could not analyse.')
    } catch (e) {
      setAnalysis('Error: ' + e.message)
    } finally {
      setAnalysing(false)
    }
  }

  if (loading) return (
    <div className="fade-in">
      <div className="papers-header"><div><h2 className="papers-title"><FileText size={22} /> Past Papers</h2></div></div>
      <Skeleton height={90} style={{ marginBottom: 16, borderRadius: 12 }} />
      <Skeleton height={300} style={{ borderRadius: 12 }} />
    </div>
  )

  return (
    <div className="fade-in">
      <div className="papers-header">
        <div>
          <h2 className="papers-title"><FileText size={22} /> Past Papers</h2>
          <p className="papers-subtitle">Log attempts, track your score, and see where marks are slipping</p>
        </div>
        <div className="papers-header-actions">
          <button className="btn btn-secondary" onClick={handleRecalculateGrades} disabled={recalculating}>
            {recalculating ? `Recalculating… ${recalcProgress ? `(${recalcProgress.current}/${recalcProgress.total})` : ''}` : 'Recalculate grades'}
          </button>
          <button className="btn btn-secondary" onClick={() => setBoundaryEditor({})}>Grade boundaries</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Log a paper</button>
        </div>
      </div>

      {subjectAverages.length > 0 && (
        <div className="papers-subject-summary">
          {subjectAverages.map(s => (
            <div key={s.name} className={`card papers-subject-card${selSubject === s.name ? ' active' : ''}`}
              role="button" tabIndex={0}
              onClick={() => setSelSubject(selSubject === s.name ? '' : s.name)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelSubject(selSubject === s.name ? '' : s.name) } }}>
              <div className="papers-subject-card-name">
                <span className="papers-subject-card-dot" style={{ background: SUBJECT_COLOURS?.[s.name] || 'var(--accent)' }} />
                {s.name}
              </div>
              <div className="papers-subject-card-val" style={{ color: SUBJECT_COLOURS?.[s.name] || 'var(--accent)' }}>{s.avg}%</div>
              <div className="papers-subject-card-meta">
                {s.count} paper{s.count !== 1 ? 's' : ''}
                {s.trend !== null ? (
                  <span style={{ color: s.trend >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700, marginLeft: 6 }}>{s.trend >= 0 ? '+' : ''}{s.trend}%</span>
                ) : s.count < 4 ? (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 6 }} title="A trend appears once you've logged 4 or more papers for this subject">· trend at 4+</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs papers-tabs">
        <button className={`tab${tab === 'attempts' ? ' active' : ''}`} onClick={() => setTab('attempts')}>Papers</button>
        <button className={`tab${tab === 'progress' ? ' active' : ''}`} onClick={() => setTab('progress')}>Progress</button>
        <button className={`tab${tab === 'analyse' ? ' active' : ''}`} onClick={() => setTab('analyse')}>Analysis</button>
      </div>

      {tab === 'attempts' && (<>
        {attemptsMissingBreakdown.length > 0 && (
          <div className="papers-backfill-banner">
            <Brain size={16} />
            <span>
              <strong>{attemptsMissingBreakdown.length}</strong> paper{attemptsMissingBreakdown.length !== 1 ? 's' : ''} {attemptsMissingBreakdown.length !== 1 ? "don't" : "doesn't"} have a topic breakdown yet
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => startBackfill(attemptsMissingBreakdown)}>Add them now</button>
          </div>
        )}
        <div className="papers-filter-row">
          <div className="papers-search">
            <Search size={15} />
            <input className="input" placeholder="Search by subject, board, paper or year" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto' }} value={selSubject} onChange={e => setSelSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state">
            <FileText size={32} style={{ opacity: 0.3 }} />
            <p>{currentAttempts.length === 0 ? "You haven't logged any papers yet" : 'No papers match your search'}</p>
            {currentAttempts.length === 0 && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Log your first paper</button>}
          </div>
        ) : (
          <div className="papers-list">
            {filtered.map(a => (
              <div key={a.id} className="papers-card" role="button" tabIndex={0}
                onClick={() => setDetailAttempt(a)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailAttempt(a) } }}>
                <span className="papers-card-dot" style={{ background: SUBJECT_COLOURS?.[a.subject] || 'var(--accent)' }} />
                <div className="papers-card-main">
                  <div className="papers-card-title">
                    {a.subject} · Paper {a.paper} ({a.year})
                    {a.tier && a.tier !== 'N/A' && <span className="badge badge-grey" style={{ fontSize: '0.62rem' }}>{a.tier}</span>}
                  </div>
                  <div className="papers-card-sub">{a.board} · {fmtDate(a)}{a.questionMarks?.length ? ' · Topic breakdown added' : ''}</div>
                </div>
                <div className="papers-card-score">
                  <div className="papers-card-pct" style={{ color: a.grade ? gradeColour(a.grade) : 'var(--text-primary)' }}>
                    {a.percentage != null ? `${Math.round(a.percentage)}%` : '–'}
                  </div>
                  <div className="papers-card-marks">{a.score}/{a.maxMarks}{a.grade ? ` · Grade ${a.grade}${a.gradeEstimated ? ' (est.)' : ''}` : ''}</div>
                </div>
                <div className="papers-card-actions">
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); setEditEntry(a) }} title="Edit"><Edit2 size={14} /></button>
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); handleDelete(a.id) }} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>)}

      {tab === 'progress' && (
        <ProgressTab attempts={currentAttempts} subjectList={subjectList} selSubject={selSubject} setSelSubject={setSelSubject} />
      )}

      {tab === 'analyse' && (
        <div className="card">
          <h4 className="analytics-card-title" style={{ marginBottom: 14 }}><Brain size={16} /> Weakness analysis</h4>
          {currentAttempts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Log a few papers first so there's something to analyse.</p>
          ) : !analysis && !analysing ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 14 }}>
                Get an AI breakdown of patterns across {selSubject || 'all your'} paper attempts — weak areas, priority topics, and whether to focus on content or technique.
              </p>
              <button className="btn btn-primary" onClick={runAnalysis}>Analyse my papers</button>
            </div>
          ) : analysing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton height={16} /><Skeleton height={16} width="90%" /><Skeleton height={16} width="95%" />
            </div>
          ) : (
            <div>
              <AIOutput text={analysis} compact />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setAnalysis('')}>Run again</button>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddAttemptModal
          profile={profile}
          onClose={() => setShowAdd(false)}
          onSave={async (a) => {
            const id = await savePaperAttempt(user.uid, a)
            const saved = { ...a, id }
            setAttempts(prev => [saved, ...prev])
            setShowAdd(false)
            toast.success('Paper logged')
            setShowQPrompt(saved)
          }}
        />
      )}

      {editEntry && (
        <EditEntryModal
          attempt={editEntry}
          onClose={() => setEditEntry(null)}
          onSave={async (updates) => {
            await updatePaperAttempt(user.uid, editEntry.id, updates)
            setAttempts(prev => prev.map(a => a.id === editEntry.id ? { ...a, ...updates } : a))
            setEditEntry(null)
            toast.success('Attempt updated')
          }}
        />
      )}

      {showQPrompt && (
        <QuestionMarksModal
          key={showQPrompt.id}
          attempt={showQPrompt}
          progress={backfillQueue !== null ? { current: backfillTotal - backfillQueue.length, total: backfillTotal } : null}
          onSkip={() => backfillQueue !== null ? advanceBackfill() : setShowQPrompt(null)}
          onClose={stopBackfill}
          onSave={async (marks) => {
            await handleSaveQuestionMarks(showQPrompt.id, marks)
            if (backfillQueue !== null) { advanceBackfill() } else { toast.success('Performance by topic saved'); setShowQPrompt(null) }
          }}
        />
      )}

      {boundaryEditor && (
        <BoundaryEditorModal profile={profile} onClose={() => setBoundaryEditor(null)} />
      )}

      {detailAttempt && (
        <PaperDetailModal
          attempt={detailAttempt}
          previous={findPreviousAttempt(currentAttempts, detailAttempt)}
          topics={currentTopics}
          onClose={() => setDetailAttempt(null)}
          onEdit={() => { setEditEntry(detailAttempt); setDetailAttempt(null) }}
          onDelete={() => handleDelete(detailAttempt.id)}
          onAddQuestionMarks={() => setShowQPrompt(detailAttempt)}
        />
      )}
    </div>
  )
}

// ── Progress tab ─────────────────────────────────────────────────────────────
function ProgressTab({ attempts, subjectList, selSubject, setSelSubject }) {
  const activeSubject = selSubject || subjectList[0] || ''
  const data = useMemo(() => {
    return attempts.filter(a => a.subject === activeSubject && a.percentage != null)
      .sort((a, b) => (attemptDateOf(a) || 0) - (attemptDateOf(b) || 0))
      .map((a, i) => ({ attempt: i + 1, label: `P${a.paper} '${String(a.year).slice(2)}`, percentage: Math.round(a.percentage) }))
  }, [attempts, activeSubject])

  return (
    <div className="card">
      <div className="analytics-card-head" style={{ marginBottom: data.length < 2 ? 0 : 14 }}>
        <h4 className="analytics-card-title"><TrendingUp size={16} /> Score progression</h4>
        <select className="select" style={{ width: 'auto' }} value={activeSubject} onChange={e => setSelSubject(e.target.value)}>
          {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {data.length < 2 ? (
        <div className="empty-state" style={{ padding: '16px 0' }}><p>Log at least 2 papers for {activeSubject || 'a subject'} to see progression over time</p></div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={axisTick} unit="%" axisLine={false} tickLine={false} width={36} />
            <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── Paper detail panel ───────────────────────────────────────────────────────
function PaperDetailModal({ attempt, previous, topics, onClose, onEdit, onDelete, onAddQuestionMarks }) {
  const byTopic = useMemo(() => aggregateByTopic(attempt.questionMarks), [attempt.questionMarks])
  const weak = byTopic.filter(t => t.pct < 60)
  const trendPts = previous ? Math.round(attempt.percentage - previous.percentage) : null
  const name = paperName(attempt.board, attempt.qualification, attempt.subject, attempt.paper)
  const sourceUrl = getPastPaperSourceUrl(attempt.board, attempt.qualification)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Paper detail</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="paper-detail-head">
          <div className="paper-detail-eyebrow">
            <span className="papers-card-dot" style={{ background: SUBJECT_COLOURS?.[attempt.subject] || 'var(--accent)', display: 'inline-block', width: 8, height: 8, borderRadius: '50%' }} />
            {attempt.board} · {attempt.qualification}{attempt.tier && attempt.tier !== 'N/A' ? ` · ${attempt.tier}` : ''}
          </div>
          <h3 className="paper-detail-title">{attempt.subject} · Paper {attempt.paper} ({attempt.year})</h3>
          {name && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{name}</p>}
        </div>

        <div className="paper-detail-score-row">
          <div>
            <div className="paper-detail-score-big" style={{ color: attempt.grade ? gradeColour(attempt.grade) : 'var(--text-primary)' }}>
              {attempt.percentage != null ? `${Math.round(attempt.percentage)}%` : '–'}
            </div>
            {trendPts !== null ? (
              <span className="paper-trend" style={{ color: trendPts >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {trendPts >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trendPts >= 0 ? '+' : ''}{trendPts}% from last attempt
              </span>
            ) : (
              <span className="paper-trend" style={{ color: 'var(--text-muted)' }}>First logged attempt for this subject</span>
            )}
          </div>
          <div className="paper-detail-score-stats">
            <div>
              <div className="paper-detail-stat-val">{attempt.score}/{attempt.maxMarks}</div>
              <div className="paper-detail-stat-label">Marks</div>
            </div>
            <div>
              <div className="paper-detail-stat-val" style={{ color: attempt.grade ? gradeColour(attempt.grade) : undefined }}>{attempt.grade || '–'}</div>
              <div className="paper-detail-stat-label">{attempt.gradeEstimated ? 'Grade (est.)' : 'Grade'}</div>
            </div>
            <div>
              <div className="paper-detail-stat-val">{fmtDate(attempt)}</div>
              <div className="paper-detail-stat-label">Attempted</div>
            </div>
          </div>
        </div>
        {attempt.gradeEstimated && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: -10, marginBottom: 18 }}>
            This grade is estimated from your percentage on this paper alone — published boundaries cover the whole subject across all papers, not just this one.
          </p>
        )}

        <h4 className="paper-detail-section-title"><Brain size={15} /> Performance by topic</h4>
        {byTopic.length === 0 ? (
          <div className="paper-topic-empty">
            <p>Add your marks question-by-question to see which topics cost you the most marks on this paper.</p>
            <button className="btn btn-secondary btn-sm" onClick={onAddQuestionMarks}>Add performance by topic</button>
          </div>
        ) : (
          <div>
            {byTopic.map((t, i) => {
              const match = findTopicMatch(topics, attempt.subject, t.topic)
              const href = match ? `/topics/${match.id}` : `/topics?subject=${encodeURIComponent(attempt.subject)}`
              const colour = t.pct >= 70 ? 'var(--success)' : t.pct >= 50 ? 'var(--warning)' : 'var(--danger)'
              return (
                <div key={i} className="paper-topic-row">
                  <div className="paper-topic-row-top">
                    <Link to={href}>{t.topic}</Link>
                    <span className="pct" style={{ color: colour }}>{t.pct}%</span>
                  </div>
                  <div className="thin-progress"><div className="thin-progress-fill" style={{ width: `${t.pct}%`, background: colour }} /></div>
                </div>
              )
            })}
            {weak.length > 0 && (
              <div className="paper-weak-chips">
                {weak.map((t, i) => {
                  const match = findTopicMatch(topics, attempt.subject, t.topic)
                  const href = match ? `/topics/${match.id}` : `/topics?subject=${encodeURIComponent(attempt.subject)}`
                  return <Link key={i} className="paper-weak-chip" to={href}><AlertCircle size={12} /> {t.topic}</Link>
                })}
              </div>
            )}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={onAddQuestionMarks}>Edit topic breakdown</button>
          </div>
        )}

        {attempt.notes && (
          <div style={{ marginTop: 18 }}>
            <h4 className="paper-detail-section-title" style={{ marginBottom: 8 }}><FileText size={15} /> Notes</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{attempt.notes}</p>
          </div>
        )}

        <div className="paper-detail-actions">
          {sourceUrl && (
            <a className="btn btn-secondary" href={sourceUrl} target="_blank" rel="noreferrer">Review paper <ExternalLink size={14} /></a>
          )}
          <button className="btn btn-secondary" onClick={onEdit}><Edit2 size={14} /> Edit</button>
          <button className="btn btn-ghost" style={{ color: 'var(--danger)', marginLeft: 'auto' }} onClick={onDelete}><Trash2 size={14} /> Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Add attempt modal ────────────────────────────────────────────────────────
function AddAttemptModal({ profile, onClose, onSave }) {
  const subjects = profile?.subjects || []
  const [form, setForm] = useState({
    subject: subjects[0]?.name || '', board: subjects[0]?.board || 'AQA', tier: '', paper: '1',
    year: AVAILABLE_YEARS[0], score: '', maxMarks: '', attemptDate: new Date().toISOString().slice(0, 10), notes: '',
  })
  const [autoSpec, setAutoSpec] = useState(null)
  const [autoBoundary, setAutoBoundary] = useState(null)
  const [saving, setSaving] = useState(false)

  const activeSubject = subjects.find(s => s.name === form.subject)
  const qualification = getSubjectQualification(activeSubject, profile)
  const tiered = isTiered(form.subject)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!form.subject || !form.board) return
      const spec = await getMergedPaperSpec(form.board, form.subject, form.tier || null, form.paper, qualification)
      const bounds = await getMergedBoundaries(form.board, form.subject, form.tier || null, form.year, qualification)
      if (cancelled) return
      setAutoSpec(spec)
      setAutoBoundary(bounds)
      if (spec?.maxMarks && !form.maxMarks) setForm(f => ({ ...f, maxMarks: spec.maxMarks }))
    }
    load()
    return () => { cancelled = true }
  }, [form.subject, form.board, form.tier, form.paper, form.year]) // eslint-disable-line react-hooks/exhaustive-deps

  const scoreNum = parseFloat(form.score)
  const maxNum = parseFloat(form.maxMarks)
  const percentage = (!Number.isNaN(scoreNum) && maxNum > 0) ? (scoreNum / maxNum) * 100 : null
  const livePreviewGrade = (percentage != null && autoBoundary?.boundaries) ? gradeFromBoundaries(percentage, autoBoundary) : null
  const gradeIsEstimated = isEstimatedGrade(autoBoundary, maxNum)

  async function submit(e) {
    e.preventDefault()
    if (!form.subject || !form.score || !form.maxMarks) { toast.error('Fill in subject, score and total marks'); return }
    setSaving(true)
    const grade = autoBoundary?.boundaries ? gradeFromBoundaries(percentage, autoBoundary) : null
    await onSave({
      subject: form.subject, board: form.board, tier: tiered ? form.tier : 'N/A', paper: form.paper,
      year: form.year, score: scoreNum, maxMarks: maxNum, percentage, grade, gradeEstimated: gradeIsEstimated,
      qualification, attemptDate: form.attemptDate, notes: form.notes.trim(), questionMarks: [],
    })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Log a paper</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Subject</label>
            <select className="select" value={form.subject} onChange={e => {
              const sub = subjects.find(s => s.name === e.target.value)
              setForm(f => ({ ...f, subject: e.target.value, board: sub?.board || f.board, tier: '' }))
            }}>
              {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div>
              <label className="label">Board</label>
              <select className="select" value={form.board} onChange={e => setForm(f => ({ ...f, board: e.target.value }))}>
                {['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <select className="select" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label className="label">Paper</label>
              <input className="input" value={form.paper} onChange={e => setForm(f => ({ ...f, paper: e.target.value }))} placeholder="1" />
            </div>
            {tiered && (
              <div>
                <label className="label">Tier</label>
                <select className="select" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                  <option value="">Select tier</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Higher">Higher</option>
                </select>
              </div>
            )}
          </div>
          <div className="grid-2">
            <div>
              <label className="label">Score</label>
              <input className="input" type="number" min="0" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="68" />
            </div>
            <div>
              <label className="label">Total marks</label>
              <input className="input" type="number" min="1" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} placeholder="100" />
            </div>
          </div>
          {percentage != null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{Math.round(percentage)}%</span>
                {livePreviewGrade && <span className="badge" style={{ background: 'transparent', border: `1px solid ${gradeColour(livePreviewGrade)}`, color: gradeColour(livePreviewGrade) }}>Grade {livePreviewGrade}</span>}
                {autoBoundary?.note === 'admin-edited' && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Using admin-set boundaries</span>}
                {!autoBoundary?.boundaries && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No grade boundaries on file for this paper yet</span>}
              </div>
              {livePreviewGrade && gradeIsEstimated && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Estimated from this paper's percentage — published boundaries are for the whole subject ({autoBoundary.maxMarks} marks across all papers), not this paper alone.
                </p>
              )}
            </div>
          )}
          <div>
            <label className="label">Date attempted</label>
            <input className="input" type="date" value={form.attemptDate} onChange={e => setForm(f => ({ ...f, attemptDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ran out of time on Section B..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save attempt'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit entry modal ─────────────────────────────────────────────────────────
function EditEntryModal({ attempt, onClose, onSave }) {
  const [score, setScore] = useState(attempt.score)
  const [maxMarks, setMaxMarks] = useState(attempt.maxMarks)
  const [attemptDate, setAttemptDate] = useState(attempt.attemptDate || '')
  const [notes, setNotes] = useState(attempt.notes || '')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const scoreNum = parseFloat(score), maxNum = parseFloat(maxMarks)
    const percentage = maxNum > 0 ? (scoreNum / maxNum) * 100 : null
    // Recompute the grade against fresh boundaries rather than leaving the old (possibly wrong,
    // pre-fix) value in place — score or marks changing should always update the grade with it.
    let grade = attempt.grade, gradeEstimated = attempt.gradeEstimated || false
    if (percentage != null) {
      const bounds = await getMergedBoundaries(attempt.board, attempt.subject, attempt.tier === 'N/A' ? null : attempt.tier, attempt.year, attempt.qualification)
      grade = bounds?.boundaries ? gradeFromBoundaries(percentage, bounds) : null
      gradeEstimated = isEstimatedGrade(bounds, maxNum)
    }
    await onSave({ score: scoreNum, maxMarks: maxNum, percentage, grade, gradeEstimated, attemptDate, notes: notes.trim() })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit attempt</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>{attempt.subject} · Paper {attempt.paper} ({attempt.year})</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div><label className="label">Score</label><input className="input" type="number" value={score} onChange={e => setScore(e.target.value)} /></div>
            <div><label className="label">Total marks</label><input className="input" type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} /></div>
          </div>
          <div><label className="label">Date attempted</label><input className="input" type="date" value={attemptDate} onChange={e => setAttemptDate(e.target.value)} /></div>
          <div><label className="label">Notes</label><textarea className="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Question-by-question marks modal ─────────────────────────────────────────
function QuestionMarksModal({ attempt, onSkip, onClose, onSave, progress }) {
  const existing = attempt.questionMarks?.length ? attempt.questionMarks : null
  const [count, setCount] = useState(existing?.length || 10)
  const [rows, setRows] = useState(() =>
    existing || Array.from({ length: 10 }, (_, i) => ({ num: i + 1, marks: '', scored: '', topic: '' }))
  )
  const suggestions = useMemo(() => {
    try { return getAllTopicsFlat(attempt.board, attempt.subject, attempt.qualification).map(t => t.name) }
    catch { return [] }
  }, [attempt.board, attempt.subject, attempt.qualification])
  const listId = `topic-suggestions-${attempt.id}`

  function setRowCount(n) {
    setCount(n)
    setRows(prev => {
      const next = [...prev]
      while (next.length < n) next.push({ num: next.length + 1, marks: '', scored: '', topic: '' })
      return next.slice(0, n)
    })
  }
  function updateRow(i, field, value) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }
  function submit() {
    const cleaned = rows
      .filter(r => r.topic.trim() || Number(r.marks) > 0)
      .map(r => ({ num: r.num, marks: Number(r.marks) || 0, scored: Number(r.scored) || 0, topic: r.topic.trim() }))
    onSave(cleaned)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 className="modal-title">Performance by topic</h3>
            {progress && <span className="badge badge-grey">{progress.current} of {progress.total}</span>}
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
          {attempt.subject} · {attempt.board} Paper {attempt.paper} ({attempt.year})
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
          Enter the marks available and marks scored for each question, and which topic it tested. This powers the "performance by topic" and weak-topic breakdown for this paper — skip it and add it later any time from the paper's detail view.
        </p>
        <div className="qmarks-count-row">
          <span>Number of questions:</span>
          <select className="select" style={{ width: 'auto' }} value={count} onChange={e => setRowCount(parseInt(e.target.value))}>
            {[...new Set([5, 8, 10, 12, 15, 20, 25, 30, count])].sort((a, b) => a - b).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="qmarks-grid">
          <div className="qmarks-row"><span>#</span><span style={{ textAlign: 'left' }}>Topic</span><span>Available</span><span>Scored</span></div>
          {rows.map((r, i) => (
            <div key={i} className="qmarks-row">
              <span>{r.num}</span>
              <input className="input" list={listId} value={r.topic} onChange={e => updateRow(i, 'topic', e.target.value)} placeholder="e.g. Cell Structure" />
              <input className="input" type="number" min="0" value={r.marks} onChange={e => updateRow(i, 'marks', e.target.value)} />
              <input className="input" type="number" min="0" value={r.scored} onChange={e => updateRow(i, 'scored', e.target.value)} />
            </div>
          ))}
        </div>
        {suggestions.length > 0 && (
          <datalist id={listId}>{suggestions.map((s, i) => <option key={i} value={s} />)}</datalist>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onSkip}>{progress ? 'Skip this one' : 'Skip for now'}</button>
          <button className="btn btn-primary" onClick={submit}><Check size={15} /> Save breakdown</button>
        </div>
      </div>
    </div>
  )
}

// ── Grade boundary editor ────────────────────────────────────────────────────
function BoundaryEditorModal({ profile, onClose }) {
  const subjects = profile?.subjects || []
  const [subject, setSubject] = useState(subjects[0]?.name || '')
  const [year, setYear] = useState(AVAILABLE_YEARS[0])
  const [boundaries, setBoundaries] = useState([])
  const [saving, setSaving] = useState(false)
  const activeSubject = subjects.find(s => s.name === subject)
  const qualification = getSubjectQualification(activeSubject, profile)
  const board = activeSubject?.board || 'AQA'
  const grades = getGradeOptions(subject, qualification)
  const boundaryCount = Math.max(0, grades.length - 1) // every scale ends in 'U', which has no boundary of its own

  useEffect(() => {
    let cancelled = false
    getMergedBoundaries(board, subject, null, year, qualification).then(b => {
      if (cancelled) return
      if (b?.boundaries?.length) setBoundaries(b.boundaries.map(v => v == null ? '' : String(v)))
      else setBoundaries(Array(boundaryCount).fill(''))
    })
    return () => { cancelled = true }
  }, [subject, year, board, qualification]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    setSaving(true)
    try {
      await saveBoundaryOverride(board, qualification, subject, {
        maxMarks: null,
        boundaries: boundaries.map(v => v === '' ? null : Number(v)),
      })
      toast.success('Grade boundaries saved')
      onClose()
    } catch (e) {
      toast.error('Could not save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Grade boundaries</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
          Set the minimum mark needed for each grade. {year === 2026 ? '2026 boundaries are provisional until exam boards publish them after results day in August — using the most recent confirmed year as an estimate is reasonable until then.' : ''}
        </p>
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <div>
            <label className="label">Subject</label>
            <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select className="select" value={year} onChange={e => setYear(parseInt(e.target.value))}>
              {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
          {grades.slice(0, boundaryCount).map((g, i) => (
            <div key={g} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: gradeColour(g) }}>{g}</span>
              <input className="input" type="number" min="0" value={boundaries[i] || ''} onChange={e => setBoundaries(prev => prev.map((v, idx) => idx === i ? e.target.value : v))} placeholder="Min. mark" />
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>Below the lowest mark above counts as U — no boundary needed for that one.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save boundaries'}</button>
        </div>
      </div>
    </div>
  )
}
