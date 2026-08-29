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
// questions/advice scoped to it, keep notes scoped to it, cross-reference past
// paper questions already tagged with a matching topic, and build a real
// confidence trend from here on.
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getTopicAdvice, generatePredictedQuestions } from '../utils/ai'
import { getNotes, saveNote, deleteNote, getPaperAttempts, autoCompleteQuest, awardXP } from '../utils/firestore'
import { resolveTopicResources } from '../data/resourceLinks'
import { SUBJECT_COLOURS } from '../data/subjects'
import { componentForSubject } from '../data/illustrationThemes'
import AIOutput from '../components/AIOutput'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Plus, X, Trash2, ExternalLink, Brain, StickyNote,
  ClipboardList, TrendingUp, Layers, CheckCircle2, Circle,
} from 'lucide-react'
import { format } from 'date-fns'

const CONF_LABELS  = ['', 'Struggling', 'Needs work', 'Getting there', 'Good', 'Strong']
const CONF_COLOURS = ['', 'var(--danger)', '#f97316', 'var(--warning)', '#84cc16', 'var(--success)']
const TABS = [
  { id: 'overview', label: 'Overview',    icon: Layers },
  { id: 'notes',    label: 'Notes',       icon: StickyNote },
  { id: 'questions',label: 'Questions',   icon: Brain },
  { id: 'papers',   label: 'Past Papers', icon: ClipboardList },
  { id: 'progress', label: 'Progress',    icon: TrendingUp },
]

// 'B1 – Cell Structure: Eukaryotic and Prokaryotic Cells' -> 'Cell Structure'.
// Many (not all) topic names follow this "unit – category: specific" convention
// from src/data/topics.js. Falls back to the full name when it doesn't apply.
function parseCategory(name) {
  if (!name) return null
  const afterDash = name.includes(' – ') ? name.split(' – ')[1] : name
  if (!afterDash?.includes(':')) return null
  return afterDash.split(':')[0].trim() || null
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export default function TopicDetail() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

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

  const [newSubtopic, setNewSubtopic] = useState('')
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })
  const [editingNote, setEditingNote] = useState(null)
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (!user || !topicId) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, topicId])

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
  const { verified, hub, search } = resolveTopicResources(topic.subjectId, topic.name)
  const history = topic.confidenceHistory || []

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

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, flexWrap: 'wrap' }}>
        <Link to="/topics" style={{ color: 'inherit', textDecoration: 'none' }}>Topics</Link>
        <span>/</span>
        <span>{topic.subjectId}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayName}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ marginBottom: category ? 4 : 0 }}>{displayName}</h2>
          {category && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{topic.name}</p>}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/topics')}>
          <ChevronLeft size={14} /> Back to topics
        </button>
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
          <style>{`
            .topic-overview-grid { display:grid; grid-template-columns: minmax(0,2fr) minmax(0,1fr); gap:16px; }
            @media (max-width: 720px) { .topic-overview-grid { grid-template-columns: 1fr; } }
          `}</style>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
              {[
                { label: 'Confidence',   val: `${conf * 20}%`,                          col: CONF_COLOURS[conf] },
                { label: 'Sub-topics',   val: subtopics.length ? `${subtopicsDone}/${subtopics.length}` : '—', col: 'var(--info)' },
                { label: 'Notes',        val: notes.length,                              col: 'var(--accent-light)' },
                { label: 'Past papers',  val: matched.length,                            col: 'var(--warning)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Confidence */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>How confident are you?</span>
                <span style={{ fontSize: '0.8rem', color: CONF_COLOURS[conf], fontWeight: 700 }}>{CONF_LABELS[conf]}</span>
              </div>
              <div className="conf-dots" style={{ gap: 8, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} className={`conf-dot${conf >= n ? ` filled-${n}` : ''}`} style={{ width: 22, height: 22, cursor: 'pointer' }}
                    onClick={() => updateConf(n)} title={CONF_LABELS[n]} />
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadAdvice} disabled={loadingAdvice}>
                <Brain size={13} /> {loadingAdvice ? 'Thinking…' : 'Get advice for this topic'}
              </button>
              {advice && (
                <div style={{ marginTop: 12 }}>
                  <AIOutput
                    text={advice}
                    label={`Advice — ${displayName}`}
                    onSummarise={async (text) => {
                      const res = await getTopicAdvice(topic.subjectId, topic.name, 3, ['SUMMARY_MODE'], user.uid)
                      return res.text || res.error
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sub-topics */}
            <div className="card">
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: 10 }}>Break it down</span>
              {subtopics.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Split this topic into your own checklist — sections, past-paper areas, anything you want to track separately.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {subtopics.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10, background: 'var(--bg-surface)' }}>
                    <button onClick={() => toggleSubtopic(s.id)} className="btn-ghost btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: s.done ? 'var(--success)' : 'var(--text-muted)', display: 'flex' }}>
                      {s.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    </button>
                    <span style={{ flex: 1, fontSize: '0.85rem', textDecoration: s.done ? 'line-through' : 'none', color: s.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{s.text}</span>
                    <button onClick={() => removeSubtopic(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
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
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg,var(--accent-pale),var(--bg-muted))' }}>
              <TopicIllustration size={120} style={{ margin: '0 auto' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                {subtopicsDone === subtopics.length && subtopics.length > 0 ? 'All sub-topics checked off — nice work.' : 'Keep chipping away at this one.'}
              </p>
            </div>

            <div className="card">
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: 10 }}>Resources</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...verified.map(l => ({ ...l, tag: 'Verified' })), ...hub.slice(0, 2), ...search.slice(0, 2).map(s => ({ name: s.site, url: s.url }))]
                  .slice(0, 6).map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-surface)', textDecoration: 'none', color: 'inherit', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span>{l.name}</span>
                      <ExternalLink size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                    </a>
                  ))}
              </div>
            </div>
          </div>
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
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditingNote(n); setNoteForm({ title: n.title, content: n.content }) }}><StickyNote size={12} /></button>
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
            <AIOutput text={questions} label={`Practice questions — ${displayName}`} />
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
          {matched.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <ClipboardList size={28} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No logged past-paper questions tagged with this topic yet</p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/papers')}>Log a past paper</button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                Matched against the topic you tagged per-question when logging a paper — a loose text match, not exact.
              </p>
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
            </>
          )}
        </div>
      )}

      {tab === 'progress' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
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
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {history.slice(-14).map((h, i) => (
                <div key={i} title={`${h.value}/5 — ${format(new Date(h.date), 'd MMM')}`}
                  style={{ flex: 1, height: `${h.value * 20}%`, minHeight: 6, borderRadius: 4, background: CONF_COLOURS[h.value] }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
