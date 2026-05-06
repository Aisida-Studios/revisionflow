// src/pages/Study.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { checkAndAwardBadge, autoCompleteQuest } from '../utils/firestore'
import { generateFlashcards, generatePredictedQuestions } from '../utils/ai'
import AIOutput from '../components/AIOutput'
import toast from 'react-hot-toast'
import {
  Zap, BookOpen, Brain, ChevronLeft, ChevronRight,
  RotateCcw, Copy, Check, Download, Shuffle, X,
  ClipboardList, Lightbulb, Target
} from 'lucide-react'

// ── Flashcard flip card ───────────────────────────────────────────────────────
function FlipCard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => setFlipped(false), [index])

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{
        cursor: 'pointer',
        perspective: 1200,
        width: '100%',
        height: 280,
        userSelect: 'none',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front — Question */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(168,85,247,0.08))',
          border: '1px solid rgba(124,58,237,0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 32px',
          gap: 16,
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Question {index + 1} of {total}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.55 }}>
            {card.q}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Tap to reveal answer
          </div>
        </div>

        {/* Back — Answer */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))',
          border: '1px solid rgba(16,185,129,0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 32px',
          gap: 16,
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Answer
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.65 }}>
            {card.a}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Confidence buttons shown after reveal ─────────────────────────────────────
function ConfidenceBar({ onRate }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { label: "Didn't know", color: 'var(--danger)',  val: 1 },
        { label: 'Partially',   color: 'var(--warning)', val: 2 },
        { label: 'Got it!',     color: 'var(--success)', val: 3 },
      ].map(b => (
        <button
          key={b.val}
          onClick={() => onRate(b.val)}
          style={{
            padding: '8px 20px', borderRadius: 999, border: `1px solid ${b.color}`,
            background: `${b.color}22`, color: b.color, fontWeight: 700,
            cursor: 'pointer', fontSize: '0.83rem', transition: 'all 0.15s',
          }}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}

// ── Parse Q: / A: format from AI ─────────────────────────────────────────────
function parseFlashcards(text) {
  const cards = []
  const lines = text.split('\n')
  let current = null
  for (const line of lines) {
    const q = line.match(/^Q:\s*(.+)/)
    const a = line.match(/^A:\s*(.+)/)
    if (q) { if (current) cards.push(current); current = { q: q[1].trim(), a: '' } }
    else if (a && current) { current.a = a[1].trim() }
    else if (current && line.trim() && !current.a) { current.a += line.trim() + ' ' }
    else if (current && line.trim() && current.a && !q) { current.a += ' ' + line.trim() }
  }
  if (current?.q && current?.a) cards.push(current)
  return cards.filter(c => c.q && c.a)
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Study() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('flashcards')

  // Flashcard state
  const [fcSubject,  setFcSubject]  = useState('')
  const [fcTopic,    setFcTopic]    = useState('')
  const [fcCount,    setFcCount]    = useState(10)
  const [fcLoading,  setFcLoading]  = useState(false)
  const [cards,      setCards]      = useState([])
  const [cardIdx,    setCardIdx]    = useState(0)
  const [scores,     setScores]     = useState([]) // 1=no, 2=partial, 3=yes
  const [mode,       setMode]       = useState('generate') // generate | study | results
  const [shuffled,   setShuffled]   = useState(false)
  const [copied,     setCopied]     = useState(false)

  // Exam questions state
  const [eqSubject,  setEqSubject]  = useState('')
  const [eqTopic,    setEqTopic]    = useState('')
  const [eqBoard,    setEqBoard]    = useState('')
  const [eqLevel,    setEqLevel]    = useState('')
  const [eqMarks,    setEqMarks]    = useState(20)
  const [eqCount,    setEqCount]    = useState(3)
  const [eqLoading,  setEqLoading]  = useState(false)
  const [eqResult,   setEqResult]   = useState('')
  const [eqParsed,   setEqParsed]   = useState([])
  const [eqExpanded, setEqExpanded] = useState(null)

  const subjects = profile?.subjects?.map(s => s.name) || []

  // Initialise from profile defaults
  useEffect(() => {
    if (subjects.length && !fcSubject) setFcSubject(subjects[0])
    if (subjects.length && !eqSubject) {
      const s = subjects[0]
      setEqSubject(s)
      const subj = profile?.subjects?.find(x => x.name === s)
      if (subj?.board) setEqBoard(subj.board)
      setEqLevel(profile?.qualification || 'GCSE')
    }
  }, [subjects])

  // ── Flashcard generation ────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!fcSubject) { toast.error('Select a subject'); return }
    setFcLoading(true)
    setCards([])
    setMode('generate')
    try {
      const res = await generateFlashcards(fcSubject, fcTopic, fcCount)
      const parsed = parseFlashcards(res.text || '')
      if (!parsed.length) { toast.error('Could not parse flashcards — try again'); return }
      setCards(parsed)
      setCardIdx(0)
      setScores([])
      setMode('study')
      await checkAndAwardBadge(user.uid, 'flashcard_gen')
      await autoCompleteQuest(user.uid, 'use_ai')
    } catch (e) {
      toast.error('Generation failed: ' + e.message)
    } finally {
      setFcLoading(false)
    }
  }

  function handleRate(val) {
    const newScores = [...scores]
    newScores[cardIdx] = val
    setScores(newScores)
    if (cardIdx < cards.length - 1) {
      setCardIdx(i => i + 1)
    } else {
      setMode('results')
    }
  }

  function handleShuffle() {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setCardIdx(0)
    setScores([])
    setShuffled(true)
    setTimeout(() => setShuffled(false), 1000)
  }

  function handleRestart() {
    setCardIdx(0)
    setScores([])
    setMode('study')
  }

  // Quizlet import format: term\tdefinition (tab-separated, one per line)
  function handleQuizletCopy() {
    const text = cards.map(c => `${c.q}\t${c.a}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied in Quizlet import format! Go to Quizlet → Create → Import.')
    setTimeout(() => setCopied(false), 3000)
  }

  // Download as CSV
  function handleDownload() {
    const csv = 'Question,Answer\n' + cards.map(c =>
      `"${c.q.replace(/"/g, '""')}","${c.a.replace(/"/g, '""')}"`
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${fcSubject}-${fcTopic || 'flashcards'}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  // ── Exam questions generation ──────────────────────────────────────────────
  async function handleGenEQ() {
    if (!eqSubject || !eqTopic) { toast.error('Fill in subject and topic'); return }
    setEqLoading(true)
    setEqResult('')
    setEqParsed([])
    setEqExpanded(null)
    try {
      const subj  = profile?.subjects?.find(s => s.name === eqSubject)
      const board = eqBoard || subj?.board || 'AQA'
      const level = eqLevel || profile?.qualification || 'GCSE'
      const res   = await generatePredictedQuestions(eqSubject, board, eqTopic, level, eqMarks, eqCount)
      const text  = res.text || res.error || ''
      setEqResult(text)

      // Parse question blocks
      const blocks = text
        .split(/(?:---QUESTION\s*\d+---|(?:^|\n)(?:\*\*)?Question\s*\d+(?:\*\*)?[:\s])/i)
        .filter(b => b && b.trim().length > 10)
      setEqParsed(blocks.map((b, i) => ({
        id: i,
        text: b.trim(),
        marks: (b.match(/\[(\d+)\s*mark/i) || [])[1] || '?',
      })))
      await autoCompleteQuest(user.uid, 'use_ai')
    } catch (e) {
      toast.error('Generation failed: ' + e.message)
    } finally {
      setEqLoading(false)
    }
  }

  const got     = scores.filter(s => s === 3).length
  const partial = scores.filter(s => s === 2).length
  const missed  = scores.filter(s => s === 1).length

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Study Tools</h2>
          <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI-generated flashcards and exam practice questions</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabs" style={{ marginBottom: 24, padding: 4 }}>
        <button className={`tab${tab === 'flashcards' ? ' active' : ''}`} onClick={() => setTab('flashcards')}>
          <BookOpen size={15} /> Flashcards
        </button>
        <button className={`tab${tab === 'examqs' ? ' active' : ''}`} onClick={() => setTab('examqs')}>
          <ClipboardList size={15} /> Exam Questions
        </button>
      </div>

      {/* ── FLASHCARDS ── */}
      {tab === 'flashcards' && (
        <div>
          {mode === 'generate' && (
            <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="var(--accent-light)" /> Generate Flashcards
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">Subject</label>
                  <select className="select" value={fcSubject} onChange={e => setFcSubject(e.target.value)}>
                    <option value="">Select subject…</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Topic <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — leave blank for a mix)</span></label>
                  <input className="input" placeholder="e.g. Organic chemistry, World War 1…" value={fcTopic} onChange={e => setFcTopic(e.target.value)} />
                </div>
                <div>
                  <label className="label">Number of cards</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[5, 10, 15, 20].map(n => (
                      <button
                        key={n}
                        onClick={() => setFcCount(n)}
                        className={`btn btn-sm ${fcCount === n ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={fcLoading || !fcSubject}
                  style={{ marginTop: 4 }}
                >
                  {fcLoading ? 'Generating…' : `Generate ${fcCount} flashcards`}
                </button>
              </div>
            </div>
          )}

          {mode === 'study' && cards.length > 0 && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{fcSubject}{fcTopic ? ` — ${fcTopic}` : ''}</span>
                  <span>{cardIdx + 1} / {cards.length}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${((cardIdx + 1) / cards.length) * 100}%`,
                    background: 'linear-gradient(90deg, var(--purple-700), var(--purple-400))',
                    borderRadius: 3, transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>

              {/* Flip card */}
              <FlipCard card={cards[cardIdx]} index={cardIdx} total={cards.length} />

              {/* Confidence rating */}
              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Tap card to flip · Then rate your confidence:
                </p>
                <ConfidenceBar onRate={handleRate} />
              </div>

              {/* Navigation + controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setCardIdx(i => Math.max(0, i - 1))} disabled={cardIdx === 0}>
                  <ChevronLeft size={15} /> Prev
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleShuffle} title="Shuffle">
                    <Shuffle size={14} /> {shuffled ? 'Shuffled!' : 'Shuffle'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleQuizletCopy}
                    title="Copy in Quizlet import format"
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Quizlet</>}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleDownload} title="Download as CSV">
                    <Download size={14} /> CSV
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setMode('generate'); setCards([]) }}>
                    <X size={14} /> New set
                  </button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setCardIdx(i => Math.min(cards.length - 1, i + 1))} disabled={cardIdx === cards.length - 1}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {mode === 'results' && (
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                  {got / cards.length >= 0.8 ? '🎉' : got / cards.length >= 0.5 ? '💪' : '📚'}
                </div>
                <h3 style={{ marginBottom: 6 }}>Session complete!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{fcSubject}{fcTopic ? ` — ${fcTopic}` : ''}</p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
                  {[
                    { label: 'Got it', count: got,     color: 'var(--success)' },
                    { label: 'Partial', count: partial, color: 'var(--warning)' },
                    { label: 'Missed', count: missed,  color: 'var(--danger)' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={handleRestart}>
                    <RotateCcw size={15} /> Study again
                  </button>
                  <button className="btn btn-secondary" onClick={handleQuizletCopy}>
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy for Quizlet</>}
                  </button>
                  <button className="btn btn-secondary" onClick={handleDownload}>
                    <Download size={14} /> Download CSV
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setMode('generate'); setCards([]) }}>
                    New set
                  </button>
                </div>

                {/* Quizlet instructions */}
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--accent-light)' }}>Import to Quizlet:</strong> Click "Copy for Quizlet" → Go to Quizlet.com → Create set → Import → Paste → "Between term and definition: Tab" → Import
                </div>
              </div>

              {/* Card review */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h4 style={{ marginBottom: 4 }}>Review all cards</h4>
                {cards.map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: 'var(--bg-surface)', border: `1px solid ${scores[i] === 3 ? 'var(--success)' : scores[i] === 1 ? 'var(--danger)' : 'var(--border)'}`,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', marginBottom: 4 }}>{c.q}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EXAM QUESTIONS ── */}
      {tab === 'examqs' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--accent-light)" /> Generate Exam Questions
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label className="label">Subject</label>
                <select className="select" value={eqSubject} onChange={e => {
                  setEqSubject(e.target.value)
                  const subj = profile?.subjects?.find(s => s.name === e.target.value)
                  if (subj?.board) setEqBoard(subj.board)
                }}>
                  <option value="">Select…</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Topic</label>
                <input className="input" placeholder="e.g. Photosynthesis" value={eqTopic} onChange={e => setEqTopic(e.target.value)} />
              </div>
              <div>
                <label className="label">Exam board</label>
                <select className="select" value={eqBoard} onChange={e => setEqBoard(e.target.value)}>
                  {['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Level</label>
                <select className="select" value={eqLevel} onChange={e => setEqLevel(e.target.value)}>
                  {['GCSE', 'A-Level'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Total marks</label>
                <select className="select" value={eqMarks} onChange={e => setEqMarks(Number(e.target.value))}>
                  {[10, 15, 20, 30, 40, 50].map(m => <option key={m} value={m}>{m} marks</option>)}
                </select>
              </div>
              <div>
                <label className="label">Questions</label>
                <select className="select" value={eqCount} onChange={e => setEqCount(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleGenEQ}
              disabled={eqLoading || !eqSubject || !eqTopic}
              style={{ marginTop: 16 }}
            >
              {eqLoading ? 'Generating realistic questions…' : 'Generate exam questions'}
            </button>
          </div>

          {/* Questions display */}
          {eqLoading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p>Generating {eqBoard} {eqLevel} {eqSubject} questions on <em>{eqTopic}</em>…</p>
            </div>
          )}

          {eqParsed.length > 0 && !eqLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <h4>{eqParsed.length} question{eqParsed.length !== 1 ? 's' : ''} — {eqBoard} {eqLevel} {eqSubject}: {eqTopic}</h4>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(eqResult)
                    toast.success('Copied to clipboard')
                  }}
                >
                  <Copy size={13} /> Copy all
                </button>
              </div>
              {eqParsed.map((q, i) => (
                <div
                  key={q.id}
                  className="card"
                  style={{ borderLeft: '3px solid var(--accent)', cursor: 'pointer' }}
                  onClick={() => setEqExpanded(eqExpanded === i ? null : i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        Question {i + 1}
                        {q.marks !== '?' && (
                          <span className="badge badge-purple" style={{ marginLeft: 8 }}>[{q.marks} marks]</span>
                        )}
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)', transform: eqExpanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {eqExpanded === i && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                      <AIOutput text={q.text} label={`Question ${i + 1}`} compact />
                    </div>
                  )}
                </div>
              ))}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 4 }}>
                Questions generated as {eqBoard} {eqLevel} style. Always cross-reference with official past papers and mark schemes from your exam board's website.
              </p>
            </div>
          )}

          {!eqResult && !eqLoading && (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem' }}>📝</div>
              <h4>Generate realistic exam questions</h4>
              <p style={{ maxWidth: 400, textAlign: 'center', fontSize: '0.875rem' }}>
                Select your subject, topic, exam board and level. The AI generates questions in the style of real {eqLevel || 'GCSE'} exams with mark allocations and mark schemes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
