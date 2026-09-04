// src/pages/TopicDetail.jsx
//
// Individual-topic drill-down page (Topics list → one specific topic). New page,
// new route (/topics/:topicId — see App.jsx), linked from a topic row in Topics.jsx.
//
// Sub-topics are a genuinely new, additive Firestore field (`subtopics` on the
// existing topic doc) — user-managed, not pre-seeded from src/data/topics.js.
// That file lists exam-board content at exactly this page's granularity already
// (e.g. 'B1 – Cell Structure: Eukaryotic and Prokaryotic Cells' IS a topic doc,
// not a parent with children), so a predefined sub-topic taxonomy would mean
// authoring new curriculum content across 40+ subjects — out of scope here, and
// not something to guess at. What this page CAN do honestly with real data: let
// students break any topic into their own checklist, generate real AI practice
// questions/advice/guides scoped to it, keep notes scoped to it, cross-reference
// past paper questions already tagged with a matching topic, and build a real
// confidence trend from here on.
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  getTopicAdvice, generatePredictedQuestions,
  getTopicNoteFromCache, generateTopicNote, saveTopicNoteToCache, incrementTopicNoteViews,
} from '../utils/ai'
import {
  getNotes, saveNote, deleteNote, getPaperAttempts, autoCompleteQuest, awardXP,
  runBadgeAudit, checkTopicNoteLimit, incrementTopicNoteUsage,
} from '../utils/firestore'
import { resolveTopicResources } from '../data/resourceLinks'
import { subjectColour } from '../data/subjects'
import { componentForSubject } from '../data/illustrationThemes'
import { paperName } from '../data/paperNames'
import { CONF_LABELS, CONF_COLOURS, parseCategory } from '../utils/topicDisplay'
import AIOutput from '../components/AIOutput'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Plus, X, Trash2, ExternalLink, Brain, StickyNote, Pencil,
  ClipboardList, TrendingUp, TrendingDown, Layers, CheckCircle2, Circle,
  BookOpen, Sparkles, RotateCcw, Eye, EyeOff,
} from 'lucide-react'
import { format } from 'date-fns'
import './Topics.css'

const TABS = [
  { id: 'overview', label: 'Overview',    icon: Layers },
  { id: 'guide',    label: 'Guide',       icon: BookOpen },
  { id: 'notes',    label: 'Notes',       icon: StickyNote },
  { id: 'questions',label: 'Questions',   icon: Brain },
  { id: 'papers',   label: 'Past Papers', icon: ClipboardList },
  { id: 'progress', label: 'Progress',    icon: TrendingUp },
]

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Real week-over-week trend from confidenceHistory (never invented): compares the latest
// rating to the most recent one at least 6 days older, falling back to the earliest known
// rating if nothing's that old yet. Returns null when there isn't enough real history to
// say something honest.
function computeTrend(history) {
  if (!history || history.length < 2) return null
  const latest = history[history.length - 1]
  const latestDate = new Date(latest.date)
  let reference = null
  for (let i = history.length - 2; i >= 0; i--) {
    const d = new Date(history[i].date)
    if ((latestDate - d) / 86400000 >= 6) { reference = history[i]; break }
  }
  if (!reference) reference = history[0]
  if (reference === latest) return null
  const diff = latest.value - reference.value
  if (diff === 0) return null
  return { dir: diff > 0 ? 'up' : 'down', diff: Math.abs(diff) }
}

// generatePredictedQuestions() (src/utils/ai.js) always writes its output in a fixed,
// explicit format — each block starting on its own '---QUESTION N--- [X marks]' line,
// containing a 'MARK SCHEME:' section and an 'EXAMINER TIP:' section. That's a real
// contract the prompt enforces ("CRITICAL REQUIREMENTS... Each block MUST start with
// ---QUESTION N--- on its own line"), not something being guessed at here — this just
// parses it. Returns [] if the text doesn't contain any markers at all, so the caller can
// fall back to showing the raw text rather than an empty page on the rare occasion the
// model doesn't follow the format.
function parseQuestionBlocks(text) {
  if (!text) return []
  const markerRe = /---QUESTION\s+(\d+)---\s*\[([^\]]*)\]/gi
  const markers = [...text.matchAll(markerRe)]
  if (!markers.length) return []
  const blocks = []
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index + markers[i][0].length
    const end   = i + 1 < markers.length ? markers[i + 1].index : text.length
    const body  = text.slice(start, end)
    const msIdx  = body.search(/MARK SCHEME:/i)
    const tipIdx = body.search(/EXAMINER TIP:/i)
    const questionText = (msIdx >= 0 ? body.slice(0, msIdx) : body).trim()
    let markScheme = '', tip = ''
    if (msIdx >= 0) {
      const msEnd = tipIdx > msIdx ? tipIdx : body.length
      markScheme = body.slice(msIdx, msEnd).replace(/^MARK SCHEME:\s*/i, '').trim()
    }
    if (tipIdx >= 0) tip = body.slice(tipIdx).replace(/^EXAMINER TIP:\s*/i, '').trim()
    blocks.push({ number: markers[i][1], marks: markers[i][2].trim(), question: questionText, markScheme, tip })
  }
  return blocks
}

export default function TopicDetail() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [notes, setNotes] = useState([])
  const [attempts, setAttempts] = useState([])

  const [advice, setAdvice] = useState('')
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [questions, setQuestions] = useState('')
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [qCount, setQCount] = useState(3)

  const [guide, setGuide] = useState(null)           // { text, cached, slug }
  const [loadingGuide, setLoadingGuide] = useState(false)
  const [guideRemaining, setGuideRemaining] = useState(null)

  const [newSubtopic, setNewSubtopic] = useState('')
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })
  const [editingNote, setEditingNote] = useState(null)
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (!user || !topicId) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, topicId])

  // Auto-check the cache (free, doesn't touch the daily limit) the first time the Guide tab
  // is opened, generating only if nothing's cached yet — mirrors how Study.jsx's own guide
  // picker behaves when a topic is selected there.
  useEffect(() => {
    if (tab === 'guide' && topic && !guide && !loadingGuide) loadGuide(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, topic])

  async function load() {
    setLoading(true)
    const snap = await getDoc(doc(db, 'users', user.uid, 'topics', topicId))
    setTopic(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    const [allNotes, allAttempts] = await Promise.all([
      getNotes(user.uid),
      getPaperAttempts(user.uid),
    ])
    setNotes(allNotes.filter(n => n.topicId === topicId))
    setAttempts(allAttempts)
    setLoading(false)
  }

  async function patchTopic(fields) {
    await updateDoc(doc(db, 'users', user.uid, 'topics', topicId), { ...fields, updatedAt: serverTimestamp() })
    setTopic(t => ({ ...t, ...fields }))
  }

  async function updateConf(n) {
    const history = Array.isArray(topic.confidenceHistory) ? topic.confidenceHistory.slice(-29) : []
    const nextHistory = [...history, { value: n, date: new Date().toISOString() }]
    await patchTopic({ confidence: n, confidenceHistory: nextHistory })
    await autoCompleteQuest(user.uid, 'rate_topics')
    // Mastery/Comeback badges (Getting There, Almost There, Subject Master, Comeback Kid) are
    // aggregate checks only runBadgeAudit computes — fire-and-forget so rating a topic never
    // waits on it, errors swallowed since this is a background bonus check.
    runBadgeAudit(user.uid).catch(() => {})
  }

  async function addSubtopic() {
    if (!newSubtopic.trim()) return
    const next = [...(topic.subtopics || []), { id: uid(), text: newSubtopic.trim(), done: false }]
    await patchTopic({ subtopics: next })
    await awardXP(user.uid, 5, 'Sub-topic added')
    setNewSubtopic('')
  }
  async function toggleSubtopic(id) {
    const target = (topic.subtopics || []).find(s => s.id === id)
    if (!target) return
    const completingFirstTime = !target.done && !target.xpAwarded
    const next = (topic.subtopics || []).map(s => s.id === id
      ? { ...s, done: !s.done, xpAwarded: s.xpAwarded || completingFirstTime }
      : s)
    await patchTopic({ subtopics: next })
    // Only the FIRST time a given sub-topic is checked off pays out — xpAwarded is a permanent
    // flag on the item itself, so toggling it off and back on again never re-triggers it. A plain
    // done/undone flag alone would let someone farm XP just by flicking a checkbox back and forth.
    if (completingFirstTime) await awardXP(user.uid, 5, 'Sub-topic completed')
  }
  async function removeSubtopic(id) {
    const next = (topic.subtopics || []).filter(s => s.id !== id)
    await patchTopic({ subtopics: next })
  }

  async function loadAdvice() {
    setLoadingAdvice(true)
    const res = await getTopicAdvice(topic.subjectId, topic.name, topic.confidence || 3, [], user.uid)
    setAdvice(res.text || res.error || 'Could not load advice — check your connection')
    setLoadingAdvice(false)
  }

  async function loadQuestions() {
    setLoadingQuestions(true)
    const board = topic.board || 'AQA'
    const level = topic.qualification || 'GCSE'
    const res = await generatePredictedQuestions(topic.subjectId, board, level, topic.name, 6, qCount, user.uid)
    setQuestions(res.text || res.error || 'Could not generate questions — check your connection')
    if (!res.error) await autoCompleteQuest(user.uid, 'use_ai')
    setLoadingQuestions(false)
  }

  // Same cache -> rate-limit -> generate -> save-to-cache flow as Study.jsx's guide picker,
  // reusing the exact same shared utility functions (so it's one real cache, one real daily
  // limit — not a second, separate implementation) rather than needing to open Study.jsx to
  // get a guide for a topic already open right here.
  async function loadGuide(forceGenerate) {
    setLoadingGuide(true)
    if (forceGenerate) setGuide(null)
    const board = topic.board || 'AQA'
    const level = topic.qualification || 'GCSE'
    try {
      if (!forceGenerate) {
        const cached = await getTopicNoteFromCache(board, level, topic.subjectId, topic.name)
        if (cached) {
          setGuide({ text: cached.text, cached: true, slug: cached.slug })
          incrementTopicNoteViews(cached.slug).catch(() => {})
          setLoadingGuide(false)
          return
        }
      }
      const limit = await checkTopicNoteLimit(user.uid, profile)
      setGuideRemaining(limit.remaining)
      if (!limit.allowed) {
        toast.error("You've used today's 5 free guides. Upgrade to Pro for unlimited, or come back tomorrow.")
        setLoadingGuide(false)
        return
      }
      const res = await generateTopicNote({ subject: topic.subjectId, board, level, topic: topic.name, uid: user.uid })
      if (res.error) { toast.error(res.error); setLoadingGuide(false); return }
      const slug = await saveTopicNoteToCache(board, level, topic.subjectId, topic.name, res.text)
      await incrementTopicNoteUsage(user.uid)
      setGuide({ text: res.text, cached: false, slug })
      setGuideRemaining(r => (r !== null ? Math.max(0, r - 1) : null))
    } catch (e) {
      toast.error('Failed to load guide: ' + e.message)
    } finally {
      setLoadingGuide(false)
    }
  }

  async function handleSaveNote() {
    if (!noteForm.title) return
    setSavingNote(true)
    try {
      if (editingNote) {
        await saveNote(user.uid, { ...editingNote, ...noteForm, subject: topic.subjectId, topicId, updatedAt: new Date().toISOString() })
      } else {
        await saveNote(user.uid, { ...noteForm, subject: topic.subjectId, topicId, createdAt: new Date().toISOString() })
      }
      setNoteForm({ title: '', content: '' })
      setEditingNote(null)
      const allNotes = await getNotes(user.uid)
      setNotes(allNotes.filter(n => n.topicId === topicId))
      toast.success('Note saved')
    } catch (e) { toast.error('Failed to save note') }
    setSavingNote(false)
  }
  async function handleDeleteNote(id) {
    await deleteNote(user.uid, id)
    setNotes(ns => ns.filter(n => n.id !== id))
  }

  if (loading) {
    return (
      <div className="fade-in">
        <div className="skeleton-pulse" style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 20 }} />
        <div className="skeleton-pulse" style={{ height: 180, borderRadius: 16 }} />
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="fade-in empty-state">
        <ClipboardList size={32} style={{ opacity: 0.35 }} />
        <p>That topic couldn't be found — it may have been deleted.</p>
        <button className="btn btn-primary" onClick={() => navigate('/topics')}>Back to topics</button>
      </div>
    )
  }

  const conf = topic.confidence || 3
  const subtopics = topic.subtopics || []
  const subtopicsDone = subtopics.filter(s => s.done).length
  const category = parseCategory(topic.name)
  const displayName = category || topic.name
  const TopicIllustration = componentForSubject(topic.subjectId)
  const subjColour = subjectColour(topic.subjectId)
  const topicBoard = topic.board || 'AQA'
  const topicLevel = topic.qualification || 'GCSE'
  const { verified, hub, search } = resolveTopicResources(topic.subjectId, topic.name, topicBoard, topicLevel)
  const history = topic.confidenceHistory || []
  const trend = computeTrend(history)
  const paperLabel = topic.paper != null && topic.paper !== '' ? paperName(topicBoard, topicLevel, topic.subjectId, String(topic.paper)) : null

  // Best-effort cross-reference: past-paper questions the student tagged with a
  // topic string that overlaps this one. Free-text tagging means this is fuzzy,
  // not authoritative — labelled as such in the UI.
  const needle = (category || topic.name).toLowerCase()
  const matched = attempts
    .map(a => {
      const qmarks = (a.questionMarks || []).filter(m => {
        const t = (m.topic || '').toLowerCase().trim()
        return t && (t.includes(needle) || needle.includes(t))
      })
      return qmarks.length ? { ...a, matchedMarks: qmarks } : null
    })
    .filter(Boolean)

  const resourceRows = [
    ...verified.map(l => ({ ...l, tag: l.site || 'Verified' })),
    ...hub.slice(0, 4).map(l => ({ ...l, tag: l.site || 'Hub' })),
    ...search.slice(0, 2).map(s => ({ name: s.site, url: s.url, tag: 'Search' })),
  ].slice(0, 8)

  const questionBlocks = questions ? parseQuestionBlocks(questions) : []

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <Link to="/topics" style={{ color: 'inherit', textDecoration: 'none' }}>Topics</Link>
          <span>/</span>
          <Link to={`/topics?subject=${encodeURIComponent(topic.subjectId)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{topic.subjectId}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayName}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/topics')}>
          <ChevronLeft size={14} /> Back to topics
        </button>
      </div>

      {/* Hero */}
      <div className="card topic-hero" style={{ marginBottom: 18 }}>
        <div className="topic-hero-illustration"><TopicIllustration size={84} /></div>
        <div className="topic-hero-info">
          <h2 style={{ marginBottom: 0 }}>{displayName}</h2>
          {category && <p className="topic-hero-raw-name">{topic.name}</p>}
          <div className="topic-hero-tags">
            <span className="badge" style={{ background: `${subjColour}1a`, color: subjColour, borderColor: 'transparent' }}>{topic.subjectId}</span>
            <span className="badge badge-grey">{topicBoard} · {topicLevel}</span>
            {topic.paper != null && topic.paper !== '' && (
              <span className="badge badge-grey">Paper {topic.paper}{paperLabel ? ` — ${paperLabel}` : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stat row — visible on every tab, not just Overview */}
      <div className="topic-stat-row" style={{ marginBottom: 20 }}>
        <div className="card topic-stat-card">
          <div className="topic-stat-val" style={{ color: CONF_COLOURS[conf] }}>{conf * 20}%</div>
          <div className="topic-stat-label">Confidence</div>
          {trend && (
            <div className="topic-stat-trend" style={{ color: trend.dir === 'up' ? 'var(--success)' : 'var(--danger)' }}>
              {trend.dir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trend.dir === 'up' ? 'improving' : 'dipped'}
            </div>
          )}
        </div>
        <div className="card topic-stat-card">
          <div className="topic-stat-val" style={{ color: 'var(--info)' }}>{subtopics.length ? `${subtopicsDone}/${subtopics.length}` : '—'}</div>
          <div className="topic-stat-label">Sub-topics</div>
        </div>
        <div className="card topic-stat-card">
          <div className="topic-stat-val" style={{ color: 'var(--accent-light)' }}>{notes.length}</div>
          <div className="topic-stat-label">Notes</div>
        </div>
        <div className="card topic-stat-card">
          <div className="topic-stat-val" style={{ color: 'var(--warning)' }}>{matched.length}</div>
          <div className="topic-stat-label">Past papers</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="topic-overview-grid">
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Confidence */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>How confident are you?</span>
                <span style={{ fontSize: '0.8rem', color: CONF_COLOURS[conf], fontWeight: 700 }}>{CONF_LABELS[conf]}</span>
              </div>
              <div className="conf-dots" style={{ gap: 8, marginBottom: 12 }} role="radiogroup" aria-label="Confidence rating">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" className={`conf-dot${conf >= n ? ` active-${n}` : ''}`} style={{ width: 22, height: 22 }}
                    onClick={() => updateConf(n)} title={CONF_LABELS[n]} aria-label={CONF_LABELS[n]} aria-pressed={conf >= n} />
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadAdvice} disabled={loadingAdvice}>
                <Brain size={13} /> {loadingAdvice ? 'Thinking…' : 'Get advice for this topic'}
              </button>
              {advice && (
                <div style={{ marginTop: 12 }}>
                  <AIOutput text={advice} label={`Advice — ${displayName}`} />
                </div>
              )}
            </div>

            {/* Sub-topics */}
            <div className="card">
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>Break it down</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Your own checklist for this topic — not official exam-board sub-topics, just a way to
                split it into pieces you want to track separately.
              </p>
              {subtopics.length > 0 && (
                <div className="subtopic-progress-line">
                  <CheckCircle2 size={13} style={{ color: subtopicsDone === subtopics.length ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0 }} />
                  {subtopicsDone === subtopics.length ? 'All sub-topics checked off — nice work.' : `${subtopicsDone} of ${subtopics.length} checked off — keep going.`}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {subtopics.map(s => (
                  <div key={s.id} className="subtopic-row">
                    <button onClick={() => toggleSubtopic(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: s.done ? 'var(--success)' : 'var(--text-muted)', display: 'flex' }}
                      aria-label={s.done ? 'Mark not done' : 'Mark done'}>
                      {s.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    </button>
                    <span style={{ flex: 1, fontSize: '0.85rem', textDecoration: s.done ? 'line-through' : 'none', color: s.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{s.text}</span>
                    <button onClick={() => removeSubtopic(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} aria-label="Remove">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="input" style={{ flex: 1 }} placeholder="Add a sub-topic…" value={newSubtopic}
                  onChange={e => setNewSubtopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtopic()} />
                <button className="btn btn-primary btn-sm" onClick={addSubtopic} disabled={!newSubtopic.trim()}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: 10 }}>Resources</span>
              {resourceRows.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No resources found for this topic yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {resourceRows.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer" className="resource-row">
                      <span>{l.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="resource-row-tag">{l.tag}</span>
                        <ExternalLink size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'guide' && (
        <div>
          {!guide && loadingGuide && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '3px solid var(--bg-hover)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Writing your guide…</div>
                <div>This can take 15–20 seconds for a new topic — instant if someone's already generated it.</div>
              </div>
            </div>
          )}
          {!guide && !loadingGuide && (
            <div className="empty-state">
              <BookOpen size={32} style={{ opacity: 0.3 }} />
              <p>Couldn't load a guide for this topic — check your connection and try again.</p>
              <button className="btn btn-primary btn-sm" onClick={() => loadGuide(false)}>Try again</button>
            </div>
          )}
          {guide && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: guide.cached ? 'var(--success)' : 'var(--text-muted)' }}>
                  {guide.cached ? '● Shared guide — generated once, cached for everyone' : '● Freshly generated for you'}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => loadGuide(true)} disabled={loadingGuide}>
                  <RotateCcw size={12} /> Regenerate
                </button>
              </div>
              <AIOutput text={guide.text} label={`Study guide — ${displayName}`} />
            </div>
          )}
          {guideRemaining !== null && guideRemaining !== Infinity && (
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
              {guideRemaining > 0 ? `${guideRemaining} new guide generations left today` : 'Daily free generations used — already-cached guides are always free to view'}
            </p>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Note title…" value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="textarea" style={{ minHeight: 100 }} placeholder={`Write your notes on ${displayName}…`} value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {editingNote && <button className="btn btn-ghost btn-sm" onClick={() => { setEditingNote(null); setNoteForm({ title: '', content: '' }) }}>Cancel</button>}
                <button className="btn btn-primary btn-sm" onClick={handleSaveNote} disabled={savingNote || !noteForm.title}>
                  {savingNote ? 'Saving…' : editingNote ? 'Update note' : 'Save note'}
                </button>
              </div>
            </div>
          </div>
          {notes.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <StickyNote size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No notes yet on {displayName}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notes.map(n => (
                <div key={n.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{n.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{n.content}</div>
                      {n.createdAt && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>{format(new Date(n.createdAt), 'd MMM yyyy')}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingNote(n); setNoteForm({ title: n.title, content: n.content }) }}><Pencil size={12} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteNote(n.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'questions' && (
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <label className="label" style={{ margin: 0 }}>How many questions?</label>
              <select className="select" style={{ width: 90 }} value={qCount} onChange={e => setQCount(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={loadQuestions} disabled={loadingQuestions}>
                <Brain size={13} /> {loadingQuestions ? 'Generating…' : 'Generate practice questions'}
              </button>
            </div>
          </div>
          {questions ? (
            questionBlocks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {questionBlocks.map(b => <QuestionCard key={b.number} block={b} />)}
              </div>
            ) : (
              // Format didn't parse — fall back to the raw output rather than showing nothing.
              <AIOutput text={questions} label={`Practice questions — ${displayName}`} />
            )
          ) : (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <Brain size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>Generate exam-style questions for exactly this topic</p>
            </div>
          )}
        </div>
      )}

      {tab === 'papers' && (
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            Past-paper questions you've logged on the Past Papers page, where the topic you tagged
            that question with matches this one. It's a loose text match on what you typed at the
            time, not an official cross-reference — a real gut-check of your exam performance on
            this exact topic, not a claim that it's exhaustive.
          </p>
          {matched.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <ClipboardList size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No logged past-paper questions tagged with this topic yet</p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/papers')}>Log a past paper</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matched.map(a => {
                const got = a.matchedMarks.reduce((s, m) => s + (Number(m.scored) || 0), 0)
                const max = a.matchedMarks.reduce((s, m) => s + (Number(m.marks) || 0), 0)
                return (
                  <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.subject} — {a.board} Paper {a.paper} ({a.year})</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.matchedMarks.length} matching question{a.matchedMarks.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: max > 0 && got / max >= 0.7 ? 'var(--success)' : 'var(--warning)' }}>{got}/{max}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'progress' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: CONF_COLOURS[conf] }}>{conf * 20}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current confidence</div>
            </div>
            {topic.updatedAt?.toDate && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Last rated {format(topic.updatedAt.toDate(), 'd MMM yyyy')}
              </div>
            )}
          </div>
          {history.length < 2 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your trend builds up here each time you re-rate this topic's confidence — check back after a few study sessions.
            </p>
          ) : (
            <div className="confidence-trend-chart">
              {history.slice(-14).map((h, i) => (
                <div key={i} title={`${h.value}/5 — ${format(new Date(h.date), 'd MMM')}`}
                  className="confidence-trend-bar" style={{ height: `${h.value * 20}%`, background: CONF_COLOURS[h.value] }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── One generated question, mark scheme hidden until asked for ─────────────────
function QuestionCard({ block }) {
  const [showMS, setShowMS] = useState(false)
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Question {block.number}</span>
        {block.marks && <span className="badge badge-grey">{block.marks}</span>}
      </div>
      <AIOutput text={block.question} compact />
      {(block.markScheme || block.tip) && (
        <div style={{ marginTop: 12, borderTop: '1px dashed var(--border)', paddingTop: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMS(s => !s)}>
            {showMS ? <><EyeOff size={13} /> Hide mark scheme</> : <><Eye size={13} /> Show mark scheme</>}
          </button>
          {showMS && (
            <div style={{ marginTop: 10 }}>
              {block.markScheme && (
                <div style={{ marginBottom: block.tip ? 10 : 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    Mark scheme
                  </div>
                  <AIOutput text={block.markScheme} compact />
                </div>
              )}
              {block.tip && (
                <div style={{ padding: '8px 10px', background: 'var(--accent-pale)', borderRadius: 8, fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong>Examiner tip:</strong> {block.tip}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
