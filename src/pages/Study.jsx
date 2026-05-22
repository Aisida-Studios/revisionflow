// src/pages/Study.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  checkAndAwardBadge, autoCompleteQuest,
  saveFlashcardSet, getFlashcardSets, deleteFlashcardSet,
  getPublicFlashcardSets, updateFlashcardSetVisibility, updateFlashcardSet,
} from '../utils/firestore'
import { generateFlashcards, generatePredictedQuestions, markAnswer } from '../utils/ai'
import AIOutput from '../components/AIOutput'
import toast from 'react-hot-toast'
import {
  Zap, BookOpen, Brain, ChevronLeft, ChevronRight,
  RotateCcw, Copy, Check, Download, Shuffle, X, Plus,
  ClipboardList, Globe, Lock, Trash2, Edit3, Save,
  Users, ChevronDown,
} from 'lucide-react'

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function parseFlashcards(text) {
  const cards = []
  let current = null
  for (const line of (text || '').split('\n')) {
    const q = line.match(/^Q:\s*(.+)/)
    const a = line.match(/^A:\s*(.+)/)
    if (q) { if (current?.q && current?.a) cards.push(current); current = { q: q[1].trim(), a: '' } }
    else if (a && current) current.a = a[1].trim()
    else if (current && line.trim() && !current.a) current.a += line.trim()
    else if (current && line.trim() && current.a) current.a += ' ' + line.trim()
  }
  if (current?.q && current?.a) cards.push(current)
  return cards.filter(c => c.q && c.a)
}

/* ── Flip card ─────────────────────────────────────────────────────────────── */
function FlipCard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false)
  useEffect(() => setFlipped(false), [index])
  return (
    <div onClick={() => setFlipped(f => !f)} style={{ cursor: 'pointer', perspective: 1200, width: '100%', height: 280, userSelect: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 16, background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(168,85,247,0.08))', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 32px', gap: 16 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Question {index + 1} of {total}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.55 }}>{card.q}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Tap to reveal answer</div>
        </div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 16, background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.06))', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 32px', gap: 16 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Answer</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.65 }}>{card.a}</div>
        </div>
      </div>
    </div>
  )
}

function ConfidenceBar({ onRate }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {[{ label: "Didn't know", color: 'var(--danger)', val: 1 }, { label: 'Partially', color: 'var(--warning)', val: 2 }, { label: 'Got it!', color: 'var(--success)', val: 3 }].map(b => (
        <button key={b.val} onClick={() => onRate(b.val)} style={{ padding: '8px 20px', borderRadius: 999, border: '1px solid ' + b.color, background: b.color + '22', color: b.color, fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem' }}>{b.label}</button>
      ))}
    </div>
  )
}

/* ── Study session ─────────────────────────────────────────────────────────── */
function StudySession({ cards: initCards, title, subject, onClose, onSave }) {
  const [cards, setCards] = useState(initCards)
  const [idx, setIdx] = useState(0)
  const [scores, setScores] = useState([])
  const [mode, setMode] = useState('study')
  const [copied, setCopied] = useState(false)

  function handleRate(val) {
    const s = [...scores]; s[idx] = val; setScores(s)
    if (idx < cards.length - 1) setIdx(i => i + 1)
    else setMode('results')
  }

  function quizletCopy() {
    navigator.clipboard.writeText(cards.map(c => c.q + '\t' + c.a).join('\n'))
    setCopied(true)
    toast.success('Copied! Go to Quizlet → Create → Import → Paste → Tab between term/definition → Import')
    setTimeout(() => setCopied(false), 3000)
  }

  function downloadCSV() {
    const csv = 'Question,Answer\n' + cards.map(c => '"' + c.q.replace(/"/g, '""') + '","' + c.a.replace(/"/g, '""') + '"').join('\n')
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: (subject || 'flashcards') + '.csv' })
    a.click()
  }

  const got = scores.filter(s => s === 3).length
  const partial = scores.filter(s => s === 2).length
  const missed = scores.filter(s => s === 1).length

  if (mode === 'results') return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>{got / cards.length >= 0.8 ? '🎉' : got / cards.length >= 0.5 ? '💪' : '📚'}</div>
        <h3 style={{ marginBottom: 4 }}>Session complete!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{title}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
          {[{ label: 'Got it', count: got, color: 'var(--success)' }, { label: 'Partial', count: partial, color: 'var(--warning)' }, { label: 'Missed', count: missed, color: 'var(--danger)' }].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px 20px', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => { setIdx(0); setScores([]); setMode('study') }}><RotateCcw size={15} /> Study again</button>
          {onSave && <button className="btn btn-secondary" onClick={onSave}><Save size={15} /> Save set</button>}
          <button className="btn btn-secondary" onClick={quizletCopy}>{copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Quizlet import</>}</button>
          <button className="btn btn-secondary" onClick={downloadCSV}><Download size={14} /> CSV</button>
          <button className="btn btn-ghost" onClick={onClose}><X size={14} /> Exit</button>
        </div>
        <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--accent-light)' }}>Import to Quizlet:</strong> Click "Quizlet import" → quizlet.com/create → Import → Paste → Tab between term/definition → Import
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h4 style={{ marginBottom: 4 }}>All cards</h4>
        {cards.map((c, i) => (
          <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid ' + (scores[i] === 3 ? 'var(--success)' : scores[i] === 1 ? 'var(--danger)' : 'var(--border)') }}>
            <div style={{ fontWeight: 600, fontSize: '0.84rem', marginBottom: 4 }}>{c.q}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.a}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><ChevronLeft size={15} /> Back</button>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setCards([...cards].sort(() => Math.random() - .5)); setIdx(0); setScores([]) }} title="Shuffle"><Shuffle size={14} /></button>
          <button className="btn btn-ghost btn-sm" onClick={quizletCopy} title="Quizlet import">{copied ? <Check size={14} /> : <Copy size={14} />}</button>
          <button className="btn btn-ghost btn-sm" onClick={downloadCSV} title="Download CSV"><Download size={14} /></button>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>{idx + 1} / {cards.length}</span>
          <span>{Math.round(((idx) / cards.length) * 100)}%</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: ((idx + 1) / cards.length * 100) + '%', background: 'linear-gradient(90deg,var(--purple-700),var(--purple-400))', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>
      <FlipCard card={cards[idx]} index={idx} total={cards.length} />
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>Tap card to flip · Rate your confidence:</p>
        <ConfidenceBar onRate={handleRate} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}><ChevronLeft size={15} /> Prev</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setIdx(i => Math.min(cards.length - 1, i + 1))} disabled={idx === cards.length - 1}>Next <ChevronRight size={15} /></button>
      </div>
    </div>
  )
}

/* ── Save set modal ────────────────────────────────────────────────────────── */
function SaveSetModal({ cards, subject, topic, onSave, onClose }) {
  const [title, setTitle] = useState((subject || '') + (topic ? ' — ' + topic : '') + ' Flashcards')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title, isPublic })
    setSaving(false)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title"><Save size={16} /> Save flashcard set</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">Set title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Biology — Cell Biology" /></div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cards.length} cards · {subject}</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Make public</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Other RevisionFlow students can discover and use your set</div>
            </div>
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !title.trim()}>{saving ? 'Saving…' : 'Save set'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Custom set editor ─────────────────────────────────────────────────────── */
function CustomSetEditor({ subjects, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(subjects[0] || '')
  const [topic, setTopic] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [cards, setCards] = useState([{ q: '', a: '' }])
  const [saving, setSaving] = useState(false)

  function addCard() { setCards(cs => [...cs, { q: '', a: '' }]) }
  function removeCard(i) { setCards(cs => cs.filter((_, j) => j !== i)) }
  function updateCard(i, field, val) { setCards(cs => cs.map((c, j) => j === i ? { ...c, [field]: val } : c)) }

  async function handleSave() {
    const valid = cards.filter(c => c.q.trim() && c.a.trim())
    if (!title || valid.length === 0) { toast.error('Add a title and at least one card'); return }
    setSaving(true)
    await onSave({ title, subject, topic, cards: valid, isPublic })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title"><Edit3 size={16} /> Create flashcard set</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="grid-2" style={{ gap: 10 }}>
            <div><label className="label">Set title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Organic Chemistry Key Terms" /></div>
            <div><label className="label">Subject</label>
              <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label className="label">Topic <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label><input className="input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Alkanes" /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.83rem' }}>Make public — other students can use this set</span>
          </label>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
              <button className="btn btn-secondary btn-sm" onClick={addCard}><Plus size={13} /> Add card</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
              {cards.map((card, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'start', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div><label className="label" style={{ fontSize: '0.68rem' }}>Term / Question</label><textarea className="textarea" style={{ minHeight: 60, fontSize: '0.82rem' }} value={card.q} onChange={e => updateCard(i, 'q', e.target.value)} placeholder="Question…" /></div>
                  <div><label className="label" style={{ fontSize: '0.68rem' }}>Definition / Answer</label><textarea className="textarea" style={{ minHeight: 60, fontSize: '0.82rem' }} value={card.a} onChange={e => updateCard(i, 'a', e.target.value)} placeholder="Answer…" /></div>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)', marginTop: 20 }} onClick={() => removeCard(i)} disabled={cards.length === 1}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save ' + cards.filter(c => c.q && c.a).length + ' cards'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Edit existing set modal ───────────────────────────────────────────────── */
function EditSetModal({ set, subjects, onSave, onClose }) {
  const [title,    setTitle]    = useState(set.title || '')
  const [subject,  setSubject]  = useState(set.subject || subjects[0] || '')
  const [topic,    setTopic]    = useState(set.topic || '')
  const [isPublic, setIsPublic] = useState(set.isPublic || false)
  const [cards,    setCards]    = useState(set.cards?.length ? set.cards.map(c => ({ q: c.q || '', a: c.a || '' })) : [{ q: '', a: '' }])
  const [saving,   setSaving]   = useState(false)

  function addCard() { setCards(cs => [...cs, { q: '', a: '' }]) }
  function removeCard(i) { setCards(cs => cs.filter((_, j) => j !== i)) }
  function updateCard(i, field, val) { setCards(cs => cs.map((c, j) => j === i ? { ...c, [field]: val } : c)) }

  async function handleSave() {
    const valid = cards.filter(c => c.q.trim() && c.a.trim())
    if (!title || valid.length === 0) { toast.error('Add a title and at least one card'); return }
    setSaving(true)
    await onSave({ title, subject, topic, cards: valid, isPublic })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title"><Edit3 size={16} /> Edit set</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="grid-2" style={{ gap: 10 }}>
            <div><label className="label">Set title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><label className="label">Subject</label>
              <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label className="label">Topic <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label><input className="input" value={topic} onChange={e => setTopic(e.target.value)} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.83rem' }}>Make public — other students can use this set</span>
          </label>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
              <button className="btn btn-secondary btn-sm" onClick={addCard}><Plus size={13} /> Add card</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
              {cards.map((card, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'start', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div><label className="label" style={{ fontSize: '0.68rem' }}>Term / Question</label><textarea className="textarea" style={{ minHeight: 60, fontSize: '0.82rem' }} value={card.q} onChange={e => updateCard(i, 'q', e.target.value)} /></div>
                  <div><label className="label" style={{ fontSize: '0.68rem' }}>Definition / Answer</label><textarea className="textarea" style={{ minHeight: 60, fontSize: '0.82rem' }} value={card.a} onChange={e => updateCard(i, 'a', e.target.value)} /></div>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)', marginTop: 20 }} onClick={() => removeCard(i)} disabled={cards.length === 1}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Paste import modal (Quizlet-style) ─────────────────────────────────────── */
function PasteImportModal({ subjects, onImport, onClose }) {
  const [mode,       setMode]       = useState('paste')   // 'paste' | 'ai'
  const [pasteText,  setPasteText]  = useState('')
  const [aiNotes,    setAiNotes]    = useState('')
  const [separator,  setSeparator]  = useState('tab')     // 'tab' | 'dash' | 'colon'
  const [preview,    setPreview]    = useState([])
  const [title,      setTitle]      = useState('')
  const [subject,    setSubject]    = useState(subjects[0] || '')
  const [aiLoading,  setAiLoading]  = useState(false)

  const SEP = { tab: '	', dash: ' - ', colon: ': ' }

  function parsePaste(text, sep) {
    return text.split('
')
      .map(line => {
        const idx = sep === '	' ? line.indexOf('	') : line.indexOf(sep)
        if (idx === -1) return null
        return { q: line.slice(0, idx).trim(), a: line.slice(idx + sep.length).trim() }
      })
      .filter(c => c && c.q && c.a)
  }

  function handlePasteChange(text) {
    setPasteText(text)
    setPreview(parsePaste(text, SEP[separator]))
  }

  function handleSepChange(sep) {
    setSeparator(sep)
    setPreview(parsePaste(pasteText, SEP[sep]))
  }

  async function handleAIConvert() {
    if (!aiNotes.trim()) return
    setAiLoading(true)
    try {
      const { callAI } = await import('../utils/ai')
      const prompt = 'Convert these notes into flashcard pairs. Return ONLY in this exact format, one card per line:\nQ: [question]\nA: [answer]\n\nNotes:\n' + aiNotes.slice(0, 8000)
      const res = await callAI(prompt, null, 4096, null)
      if (res.error) { toast.error(res.error); return }
      // Parse Q:/A: format
      const parsed = []
      let current = null
      for (const line of (res.text || '').split('
')) {
        const q = line.match(/^Q:\s*(.+)/)
        const a = line.match(/^A:\s*(.+)/)
        if (q) { if (current?.q && current?.a) parsed.push(current); current = { q: q[1].trim(), a: '' } }
        else if (a && current) current.a = a[1].trim()
      }
      if (current?.q && current?.a) parsed.push(current)
      setPreview(parsed)
      if (!parsed.length) toast.error('Could not extract cards — try the paste tab with structured text')
    } catch (e) { toast.error('Failed: ' + e.message) }
    finally { setAiLoading(false) }
  }

  function handleImport() {
    if (!preview.length) { toast.error('No cards to import'); return }
    if (!title.trim()) { toast.error('Add a set title'); return }
    onImport({ title, subject, cards: preview })
    toast.success(preview.length + ' cards imported!')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📋 Import flashcards</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button className={'btn btn-sm ' + (mode === 'paste' ? 'btn-primary' : 'btn-secondary')} onClick={() => setMode('paste')}>📋 Paste text</button>
          <button className={'btn btn-sm ' + (mode === 'ai' ? 'btn-primary' : 'btn-secondary')} onClick={() => setMode('ai')}>✨ AI from notes</button>
        </div>

        {mode === 'paste' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Term/definition separator</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['tab','Tab (Quizlet default)'],['dash',' - (dash)'],['colon',': (colon)']].map(([v,l]) => (
                  <button key={v} className={'btn btn-sm ' + (separator === v ? 'btn-primary' : 'btn-secondary')} onClick={() => handleSepChange(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Paste your terms and definitions</label>
              <textarea className="textarea" style={{ minHeight: 160, fontFamily: 'monospace', fontSize: '0.82rem' }}
                placeholder={'photosynthesis	the process by which plants convert light into energy
mitosis	cell division producing two identical daughter cells'}
                value={pasteText} onChange={e => handlePasteChange(e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Copy directly from Quizlet (Ctrl+A, Ctrl+C on a set) or paste tab-separated text. One card per line.
              </div>
            </div>
          </div>
        )}

        {mode === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Paste your notes</label>
              <textarea className="textarea" style={{ minHeight: 180, fontSize: '0.82rem' }}
                placeholder="Paste your revision notes, textbook content, or any text and AI will extract key terms and definitions…"
                value={aiNotes} onChange={e => setAiNotes(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleAIConvert} disabled={aiLoading || !aiNotes.trim()}>
              {aiLoading ? 'Converting…' : '✨ Convert to flashcards'}
            </button>
          </div>
        )}

        {preview.length > 0 && (
          <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>{preview.length} cards detected</div>
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {preview.slice(0, 10).map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '7px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.q}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.a}</span>
                </div>
              ))}
              {preview.length > 10 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>+{preview.length - 10} more cards</div>}
            </div>
            <div className="grid-2" style={{ gap: 10, marginBottom: 12 }}>
              <div><label className="label">Set title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Biology Key Terms" /></div>
              <div><label className="label">Subject</label>
                <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={!title.trim()}>Import {preview.length} cards</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function Study() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('flashcards')
  const [flashTab, setFlashTab] = useState('generate')
  const [studyCards, setStudyCards] = useState(null)
  const [studyTitle, setStudyTitle] = useState('')
  const [studySubj, setStudySubj] = useState('')
  const [studyTopic, setStudyTopic] = useState('')
  const [showSave,   setShowSave]   = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit,   setShowEdit]   = useState(null)   // set object being edited
  const [showPaste,  setShowPaste]  = useState(false)

  // Generate
  const [fcSubject, setFcSubject] = useState('')
  const [fcTopic, setFcTopic] = useState('')
  const [fcCount, setFcCount] = useState(10)
  const [fcLoading, setFcLoading] = useState(false)

  // My sets
  const [mySets, setMySets] = useState([])
  const [pubSets, setPubSets] = useState([])
  const [setsLoad, setSetsLoad] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  // Exam questions
  const [eqSubject, setEqSubject] = useState('')
  const [eqTopic, setEqTopic] = useState('')
  const [eqBoard, setEqBoard] = useState('AQA')
  const [eqLevel, setEqLevel] = useState('GCSE')
  const [eqMarks, setEqMarks] = useState(20)
  const [eqCount, setEqCount] = useState(3)
  const [eqLoading, setEqLoading] = useState(false)
  const [eqParsed, setEqParsed] = useState([])
  const [eqResult, setEqResult] = useState('')
  const [eqExpanded, setEqExpanded] = useState(null)

  // Answer marker
  const [mkSubject, setMkSubject] = useState('')
  const [mkBoard, setMkBoard] = useState('AQA')
  const [mkLevel, setMkLevel] = useState('GCSE')
  const [mkPaper, setMkPaper] = useState('')
  const [mkQuestion, setMkQuestion] = useState('')
  const [mkMarks, setMkMarks] = useState('')
  const [mkAnswer, setMkAnswer] = useState('')
  const [mkResult, setMkResult] = useState('')
  const [mkLoading, setMkLoading] = useState(false)
  const [mkHistory, setMkHistory] = useState([])

  const subjects = profile?.subjects?.map(s => s.name) || []

  useEffect(() => {
    if (subjects.length) {
      if (!fcSubject) setFcSubject(subjects[0])
      if (!eqSubject) {
        setEqSubject(subjects[0])
        const s = profile?.subjects?.[0]
        if (s?.board) setEqBoard(s.board)
        setEqLevel(profile?.qualification || 'GCSE')
      }
    }
  }, [subjects.length])

  useEffect(() => { if (user) loadMySets() }, [user])
  useEffect(() => { if (flashTab === 'public') loadPublicSets() }, [flashTab])

  async function loadMySets() {
    setSetsLoad(true)
    try { setMySets(await getFlashcardSets(user.uid)) } catch {}
    setSetsLoad(false)
  }

  async function loadPublicSets(subject) {
    setSetsLoad(true)
    try { setPubSets(await getPublicFlashcardSets(subject || null)) } catch {}
    setSetsLoad(false)
  }

  async function handleGenerate() {
    if (!fcSubject) { toast.error('Select a subject first'); return }
    setFcLoading(true)
    try {
      const res = await generateFlashcards(fcSubject, fcTopic, fcCount, user?.uid)
      if (res.error) { toast.error(res.error); return }
      const parsed = parseFlashcards(res.text || '')
      if (!parsed.length) { toast.error('Could not parse flashcards — try again'); return }
      setStudyCards(parsed)
      setStudyTitle(fcSubject + (fcTopic ? ' — ' + fcTopic : '') + ' (AI)')
      setStudySubj(fcSubject)
      setStudyTopic(fcTopic)
      await checkAndAwardBadge(user.uid, 'flashcard_gen')
      await autoCompleteQuest(user.uid, 'use_ai')
    } catch (e) {
      toast.error('Generation failed: ' + e.message)
    } finally { setFcLoading(false) }
  }

  async function handleSaveSet({ title, isPublic }) {
    try {
      await saveFlashcardSet(user.uid, { title, subject: studySubj, topic: studyTopic, cards: studyCards, isPublic })
      toast.success('Set saved!' + (isPublic ? ' It\'s now public.' : ''))
      setShowSave(false)
      loadMySets()
    } catch (e) { toast.error('Save failed: ' + e.message) }
  }

  async function handleCreateSet({ title, subject, topic, cards, isPublic }) {
    try {
      await saveFlashcardSet(user.uid, { title, subject, topic, cards, isPublic })
      toast.success('Set created!')
      setShowCreate(false)
      loadMySets()
      setFlashTab('my-sets')
    } catch (e) { toast.error('Failed: ' + e.message) }
  }

  async function handleDeleteSet(set) {
    if (!confirm('Delete "' + set.title + '"?')) return
    await deleteFlashcardSet(user.uid, set.id, set.isPublic)
    loadMySets()
    toast.success('Set deleted')
  }

  async function handleTogglePublic(set) {
    await updateFlashcardSetVisibility(user.uid, set.id, !set.isPublic)
    toast.success(set.isPublic ? 'Set is now private' : 'Set is now public')
    loadMySets()
  }

  async function handleEditSet({ title, subject, topic, cards, isPublic }) {
    try {
      await updateFlashcardSet(user.uid, showEdit.id, { title, subject, topic, cards, isPublic })
      toast.success('Set updated!')
      setShowEdit(null)
      loadMySets()
    } catch (e) { toast.error('Update failed: ' + e.message) }
  }

  async function handlePasteImport({ title, subject, cards }) {
    try {
      await saveFlashcardSet(user.uid, { title, subject, topic: '', cards, isPublic: false })
      toast.success(cards.length + ' cards saved to My Sets!')
      setShowPaste(false)
      loadMySets()
      setFlashTab('my-sets')
    } catch (e) { toast.error('Import failed: ' + e.message) }
  }

  function studySet(set) {
    setStudyCards(set.cards)
    setStudyTitle(set.title)
    setStudySubj(set.subject)
    setStudyTopic(set.topic || '')
  }

  async function handleGenEQ() {
    if (!eqSubject || !eqTopic) { toast.error('Fill in subject and topic'); return }
    setEqLoading(true); setEqResult(''); setEqParsed([]); setEqExpanded(null)
    try {
      const subj = profile?.subjects?.find(s => s.name === eqSubject)
      const board = eqBoard || subj?.board || 'AQA'
      const res = await generatePredictedQuestions(eqSubject, board, eqLevel, eqTopic, eqMarks, eqCount, user?.uid)
      if (res.error) { toast.error(res.error); return }
      const text = res.text || ''
      setEqResult(text)
      const blocks = text.split(/---QUESTION\s*\d+---/i).filter(b => b && b.trim().length > 10)
      setEqParsed(blocks.map((b, i) => ({ id: i, text: b.trim(), marks: (b.match(/\[(\d+)\s*mark/i) || [])[1] || '?' })))
      await autoCompleteQuest(user.uid, 'use_ai')
    } catch (e) { toast.error('Generation failed: ' + e.message) }
    finally { setEqLoading(false) }
  }

  async function handleMark() {
    if (!mkSubject || !mkQuestion.trim() || !mkAnswer.trim() || !mkMarks) return
    setMkLoading(true); setMkResult('')
    try {
      const res = await markAnswer(mkSubject, mkBoard, mkLevel, mkPaper || null, mkQuestion.trim(), parseInt(mkMarks) || 6, mkAnswer.trim(), user?.uid)
      if (res.error) { toast.error(res.error); return }
      const text = res.text || 'Could not mark answer.'
      setMkResult(text)
      setMkHistory(h => [{ question: mkQuestion.slice(0, 80) + (mkQuestion.length > 80 ? '…' : ''), subject: mkSubject, marks: mkMarks, result: text, time: new Date().toLocaleTimeString() }, ...h].slice(0, 10))
      await autoCompleteQuest(user.uid, 'use_ai')
    } catch (e) { toast.error('Error: ' + e.message) }
    finally { setMkLoading(false) }
  }

  // If studying a set
  if (studyCards) return (
    <div className="fade-in">
      <StudySession cards={studyCards} title={studyTitle} subject={studySubj} onClose={() => setStudyCards(null)} onSave={() => setShowSave(true)} />
      {showSave && <SaveSetModal cards={studyCards} subject={studySubj} topic={studyTopic} onSave={handleSaveSet} onClose={() => setShowSave(false)} />}
    </div>
  )

  const filteredMy = mySets.filter(s => !searchQ || s.title?.toLowerCase().includes(searchQ.toLowerCase()))
  const filteredPub = pubSets.filter(s => !searchQ || s.title?.toLowerCase().includes(searchQ.toLowerCase()) || s.subject?.toLowerCase().includes(searchQ.toLowerCase()))

  return (
    <div className="fade-in">
      {showSave   && <SaveSetModal cards={studyCards || []} subject={studySubj} topic={studyTopic} onSave={handleSaveSet} onClose={() => setShowSave(false)} />}
      {showCreate && <CustomSetEditor subjects={subjects} onSave={handleCreateSet} onClose={() => setShowCreate(false)} />}
      {showEdit   && <EditSetModal set={showEdit} subjects={subjects} onSave={handleEditSet} onClose={() => setShowEdit(null)} />}
      {showPaste  && <PasteImportModal subjects={subjects} onImport={handlePasteImport} onClose={() => setShowPaste(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Study Tools</h2>
          <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Flashcards, exam questions, and answer marking</p>
        </div>
      </div>

      {/* Main tabs */}
      <div className="tabs" style={{ marginBottom: 24, padding: 4 }}>
        <button className={'tab' + (tab === 'flashcards' ? ' active' : '')} onClick={() => setTab('flashcards')}><BookOpen size={15} /> Flashcards</button>
        <button className={'tab' + (tab === 'examqs' ? ' active' : '')} onClick={() => setTab('examqs')}><ClipboardList size={15} /> Exam Questions</button>
        <button className={'tab' + (tab === 'marker' ? ' active' : '')} onClick={() => setTab('marker')}><Brain size={15} /> Answer Marker</button>
      </div>

      {/* ── FLASHCARDS ── */}
      {tab === 'flashcards' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ k: 'generate', label: 'Generate' }, { k: 'my-sets', label: 'My Sets (' + mySets.length + ')' }, { k: 'public', label: 'Public Sets' }].map(t => (
                <button key={t.k} className={'btn btn-sm ' + (flashTab === t.k ? 'btn-primary' : 'btn-secondary')} onClick={() => setFlashTab(t.k)}>{t.label}</button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={14} /> Create set</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPaste(true)}>📋 Import</button>
          </div>

          {flashTab === 'generate' && (
            <div className="card" style={{ maxWidth: 560 }}>
              <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} color="var(--accent-light)" /> AI Flashcard Generator</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label className="label">Subject</label>
                  <select className="select" value={fcSubject} onChange={e => setFcSubject(e.target.value)}>
                    <option value="">Select…</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="label">Topic <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional — blank = mixed)</span></label>
                  <input className="input" placeholder="e.g. Organic chemistry, World War One…" value={fcTopic} onChange={e => setFcTopic(e.target.value)} />
                </div>
                <div><label className="label">Number of cards</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[5, 10, 15, 20].map(n => <button key={n} onClick={() => setFcCount(n)} className={'btn btn-sm ' + (fcCount === n ? 'btn-primary' : 'btn-secondary')}>{n}</button>)}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleGenerate} disabled={fcLoading || !fcSubject}>
                  {fcLoading ? 'Generating…' : 'Generate ' + fcCount + ' flashcards'}
                </button>
              </div>
            </div>
          )}

          {flashTab === 'my-sets' && (
            <div>
              {setsLoad ? <div className="loading-center"><div className="spinner" /></div>
                : filteredMy.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '2.5rem' }}>📚</div>
                    <p>No saved sets yet</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => setFlashTab('generate')}>Generate with AI</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(true)}>Create manually</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowPaste(true)}>📋 Import</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                    {filteredMy.map(set => (
                      <div key={set.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{set.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{set.subject}{set.topic ? ' · ' + set.topic : ''} · {set.cardCount || set.cards?.length || 0} cards</div>
                          </div>
                          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Edit set" onClick={() => setShowEdit(set)}><Edit3 size={13} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" title={set.isPublic ? 'Make private' : 'Make public'} onClick={() => handleTogglePublic(set)}>
                              {set.isPublic ? <Globe size={13} style={{ color: 'var(--success)' }} /> : <Lock size={13} />}
                            </button>
                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteSet(set)}><Trash2 size={13} /></button>
                          </div>
                        </div>
                        {set.isPublic && <span className="badge badge-purple" style={{ alignSelf: 'flex-start', fontSize: '0.68rem' }}>🌐 Public</span>}
                        <button className="btn btn-primary btn-sm" onClick={() => studySet(set)}>Study this set →</button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {flashTab === 'public' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <input className="input" placeholder="Search public sets…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
                <select className="select" style={{ width: 'auto' }} onChange={e => loadPublicSets(e.target.value || null)}>
                  <option value="">All subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {setsLoad ? <div className="loading-center"><div className="spinner" /></div>
                : filteredPub.length === 0 ? (
                  <div className="empty-state"><Users size={32} style={{ opacity: 0.3 }} /><p>No public sets yet — be the first to share one!</p></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                    {filteredPub.map(set => (
                      <div key={set.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{set.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{set.subject}{set.topic ? ' · ' + set.topic : ''} · {set.cardCount || set.cards?.length || 0} cards</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => studySet(set)}>Study →</button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* ── EXAM QUESTIONS ── */}
      {tab === 'examqs' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={18} color="var(--accent-light)" /> Generate Exam Questions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
              <div><label className="label">Subject</label>
                <select className="select" value={eqSubject} onChange={e => { setEqSubject(e.target.value); const s = profile?.subjects?.find(x => x.name === e.target.value); if (s?.board) setEqBoard(s.board) }}>
                  <option value="">Select…</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="label">Topic</label><input className="input" placeholder="e.g. Photosynthesis" value={eqTopic} onChange={e => setEqTopic(e.target.value)} /></div>
              <div><label className="label">Board</label>
                <select className="select" value={eqBoard} onChange={e => setEqBoard(e.target.value)}>
                  {['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div><label className="label">Level</label>
                <select className="select" value={eqLevel} onChange={e => setEqLevel(e.target.value)}>
                  <option value="GCSE">GCSE</option><option value="A-Level">A-Level</option>
                </select>
              </div>
              <div><label className="label">Total marks</label>
                <select className="select" value={eqMarks} onChange={e => setEqMarks(Number(e.target.value))}>
                  {[10, 15, 20, 30, 40, 50].map(m => <option key={m} value={m}>{m} marks</option>)}
                </select>
              </div>
              <div><label className="label">Questions</label>
                <select className="select" value={eqCount} onChange={e => setEqCount(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleGenEQ} disabled={eqLoading || !eqSubject || !eqTopic} style={{ marginTop: 16 }}>
              {eqLoading ? 'Generating realistic questions…' : 'Generate exam questions'}
            </button>
          </div>
          {eqLoading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}><div className="spinner" style={{ margin: '0 auto 16px' }} /><p>Generating {eqBoard} {eqLevel} {eqSubject} questions on {eqTopic}…</p></div>}
          {eqParsed.length > 0 && !eqLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <h4>{eqParsed.length} question{eqParsed.length !== 1 ? 's' : ''} — {eqBoard} {eqLevel} {eqSubject}: {eqTopic}</h4>
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(eqResult); toast.success('Copied') }}><Copy size={13} /> Copy all</button>
              </div>
              {eqParsed.map((q, i) => (
                <div key={q.id} className="card" style={{ borderLeft: '3px solid var(--accent)', cursor: 'pointer' }} onClick={() => setEqExpanded(eqExpanded === i ? null : i)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{i + 1}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Question {i + 1}{q.marks !== '?' && <span className="badge badge-purple" style={{ marginLeft: 8 }}>[{q.marks} marks]</span>}</span>
                    </div>
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: eqExpanded === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>
                  {eqExpanded === i && (() => {
                    const msIdx = q.text.search(/mark scheme|indicative content|accept:|award.*mark/i)
                    const questionPart = msIdx > 0 ? q.text.slice(0, msIdx).trim() : q.text
                    const schemePart = msIdx > 0 ? q.text.slice(msIdx).trim() : null
                    return (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                        <AIOutput text={questionPart} label={'Question ' + (i + 1)} compact />
                        {schemePart && (
                          <details style={{ marginTop: 12 }}>
                            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', userSelect: 'none', padding: '6px 10px', background: 'rgba(16,185,129,0.07)', borderRadius: 7, border: '1px solid rgba(16,185,129,0.2)', listStyle: 'none' }}>
                              ▶ Reveal mark scheme
                            </summary>
                            <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.05)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
                              <AIOutput text={schemePart} label="Mark scheme" compact />
                            </div>
                          </details>
                        )}
                      </div>
                    )
                  })()}
                </div>
              ))}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Generated in {eqBoard} {eqLevel} style. Cross-reference with official past papers from your exam board's website.</p>
            </div>
          )}
          {!eqResult && !eqLoading && (
            <div className="empty-state"><div style={{ fontSize: '2.5rem' }}>📝</div><h4>Generate realistic exam questions</h4><p style={{ maxWidth: 400, textAlign: 'center', fontSize: '0.875rem' }}>Mark scheme is hidden until you choose to reveal it.</p></div>
          )}
        </div>
      )}

      {/* ── ANSWER MARKER ── */}
      {tab === 'marker' && (
        <div>
          <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="card">
                <h4 style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Brain size={18} color="var(--accent-light)" /> Mark My Answer</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><label className="label">Subject</label>
                      <select className="select" value={mkSubject} onChange={e => { setMkSubject(e.target.value); const s = profile?.subjects?.find(x => x.name === e.target.value); if (s?.board) setMkBoard(s.board); setMkLevel(profile?.qualification || 'GCSE') }}>
                        <option value="">Select…</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Board</label>
                      <select className="select" value={mkBoard} onChange={e => setMkBoard(e.target.value)}>
                        {['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA'].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Level</label>
                      <select className="select" value={mkLevel} onChange={e => setMkLevel(e.target.value)}>
                        <option value="GCSE">GCSE</option><option value="A-Level">A-Level</option>
                      </select>
                    </div>
                    <div><label className="label">Marks <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.7rem' }}>required</span></label>
                      <input className="input" type="number" min={1} max={40} value={mkMarks} onChange={e => setMkMarks(e.target.value)} placeholder="e.g. 6" />
                    </div>
                    <div><label className="label">Year <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                      <input className="input" type="number" min={2015} max={2026} value={''} onChange={() => {}} placeholder="e.g. 2023" />
                    </div>
                    <div><label className="label">Paper <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                      <select className="select" value={mkPaper} onChange={e => setMkPaper(e.target.value)}>
                        <option value="">Any</option>{[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="label">Exam question</label>
                    <textarea className="textarea" style={{ minHeight: 90 }} value={mkQuestion} onChange={e => setMkQuestion(e.target.value)} placeholder="Paste the exam question exactly as it appears on the paper…" />
                  </div>
                  <div><label className="label">Your answer</label>
                    <textarea className="textarea" style={{ minHeight: 140 }} value={mkAnswer} onChange={e => setMkAnswer(e.target.value)} placeholder="Write your full answer here — the more detail you give, the better the feedback…" />
                  </div>
                  <button className="btn btn-primary" onClick={handleMark} disabled={mkLoading || !mkSubject || !mkQuestion.trim() || !mkAnswer.trim() || !mkMarks}>
                    {mkLoading ? 'Marking your answer…' : mkMarks ? 'Mark my answer (/' + mkMarks + ' marks)' : 'Enter marks available to continue'}
                  </button>
                </div>
              </div>
              <div className="card" style={{ padding: '12px 14px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-light)', marginBottom: 8 }}>Tips for best results</div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li>Paste the exact question text from the paper</li>
                  <li>Include the mark allocation — it changes how marks are awarded</li>
                  <li>Write your full answer, not a summary</li>
                  <li>Set the correct board — marking criteria vary significantly</li>
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mkLoading && <div className="card" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto 16px' }} /><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Marking as a {mkBoard} {mkLevel} {mkSubject} examiner…</p></div>}
              {mkResult && !mkLoading && (
                <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}><Check size={15} color="var(--success)" /> Marking feedback</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(mkResult); toast.success('Copied') }}><Copy size={12} /> Copy</button>
                  </div>
                  <AIOutput text={mkResult} label="Examiner feedback" compact />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setMkAnswer(''); setMkResult('') }}>Try again</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setMkQuestion(''); setMkAnswer(''); setMkResult('') }}>New question</button>
                  </div>
                </div>
              )}
              {!mkResult && !mkLoading && (
                <div className="card empty-state" style={{ padding: '32px 20px' }}>
                  <Brain size={32} style={{ opacity: 0.3 }} />
                  <p style={{ fontSize: '0.875rem', maxWidth: 300, textAlign: 'center' }}>Paste an exam question and your answer. The AI marks it like a real {mkBoard} examiner — awarding marks, flagging gaps, AO breakdown, and showing what a top answer looks like.</p>
                </div>
              )}
              {mkHistory.length > 0 && (
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>This session</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {mkHistory.map((h, i) => (
                      <button key={i} onClick={() => setMkResult(h.result)} style={{ textAlign: 'left', padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', width: '100%' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 2 }}>{h.subject}{h.marks ? ' · ' + h.marks + ' marks' : ''}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.question} · {h.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
