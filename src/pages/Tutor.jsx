// src/pages/Tutor.jsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ProGate from '../components/ProGate'
import AIOutput from '../components/AIOutput'
import { solveMathsProblem, parseMathsSteps, getEssayFeedback } from '../utils/ai'
import { autoCompleteQuest } from '../utils/firestore'
import PhotoCapture from '../components/PhotoCapture'
import { Calculator, PenTool } from 'lucide-react'

const MATHS_LEVELS = ['GCSE', 'A-Level', 'Further Maths']
const ESSAY_LEVELS = ['GCSE', 'A-Level']
const ESSAY_TYPES = ['Literature analysis', 'Language analysis', 'Creative writing', 'Persuasive / transactional writing']
const MAX_ESSAY_CHARS = 8000

export default function Tutor() {
  const { user, profile } = useAuth()
  const [mode, setMode] = useState('maths')

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2>Tutor</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', margin:'4px 0 0' }}>
            Step-by-step Maths help and structured English essay feedback.
          </p>
        </div>
      </div>

      <ProGate feature="the AI Tutor">
        <div className="tabs" style={{ marginBottom:20, padding:4, flexWrap:'wrap' }}>
          <button className={'tab' + (mode==='maths' ? ' active' : '')} onClick={() => setMode('maths')}>
            <Calculator size={15} /> Maths
          </button>
          <button className={'tab' + (mode==='english' ? ' active' : '')} onClick={() => setMode('english')}>
            <PenTool size={15} /> English
          </button>
        </div>

        {mode === 'maths' && <MathsSolver uid={user?.uid} profile={profile} />}
        {mode === 'english' && <EssayFeedback uid={user?.uid} profile={profile} />}
      </ProGate>
    </div>
  )
}

/* ── Maths — step-by-step solver ────────────────────────────────────
   Reveals one step at a time rather than dumping the full solution, so this
   teaches the method instead of just being an answer machine. */
function MathsSolver({ uid, profile }) {
  const mathsSubj = (profile?.subjects || []).find(s => /math/i.test(s.name))
  const [level, setLevel] = useState(mathsSubj?.qualification || 'GCSE')
  const [problem, setProblem] = useState('')
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState(null)
  const [finalAnswer, setFinalAnswer] = useState('')
  const [revealed, setRevealed] = useState(0)
  const [error, setError] = useState('')

  async function handleSolve() {
    if (!problem.trim()) return
    setLoading(true); setError(''); setSteps(null); setFinalAnswer(''); setRevealed(0)
    try {
      const res = await solveMathsProblem(problem.trim(), level, uid)
      if (res.error) { setError(res.error); return }
      const parsed = parseMathsSteps(res.text || '')
      if (!parsed.steps.length) {
        setError('Could not read a step-by-step solution from that — try rephrasing the problem')
        return
      }
      setSteps(parsed.steps)
      setFinalAnswer(parsed.finalAnswer)
      setRevealed(1) // show the first step immediately, no extra click needed
      if (uid) await autoCompleteQuest(uid, 'use_ai')
    } catch (e) {
      setError('Something went wrong: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom:16 }}>
        <label className="label">Level</label>
        <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
          {MATHS_LEVELS.map(l => (
            <button key={l} className={`btn btn-sm ${level===l ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>

        <label className="label">The problem</label>
        <textarea className="textarea" rows={3} placeholder="e.g. Solve 2x^2 - 5x - 3 = 0"
          value={problem} onChange={e => setProblem(e.target.value)} />
        <div style={{ marginTop:8 }}>
          <PhotoCapture uid={uid} kind="question" onExtracted={setProblem} label="scans straight into the box above — check it before solving" />
        </div>

        <button className="btn btn-primary" style={{ marginTop:10 }} onClick={handleSolve} disabled={loading || !problem.trim()}>
          {loading ? 'Working it out…' : 'Solve step by step'}
        </button>
        {error && <p style={{ color:'var(--danger)', fontSize:'0.82rem', marginTop:8 }}>{error}</p>}
      </div>

      {steps && steps.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {steps.slice(0, revealed).map(s => (
            <div key={s.number} className="card" style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span className="badge badge-purple">Step {s.number}</span>
                <span style={{ fontWeight:700, fontSize:'0.88rem' }}>{s.title}</span>
              </div>
              <AIOutput text={s.content} compact />
            </div>
          ))}

          {revealed < steps.length && (
            <button className="btn btn-secondary" onClick={() => setRevealed(r => r + 1)}>
              Show next step ({revealed}/{steps.length})
            </button>
          )}

          {revealed >= steps.length && finalAnswer && (
            <div className="card" style={{ padding:'14px 16px', border:'2px solid var(--success)', background:'rgba(16,185,129,0.06)' }}>
              <div style={{ fontWeight:800, fontSize:'0.72rem', color:'var(--success)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
                Final answer
              </div>
              <AIOutput text={finalAnswer} compact />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── English — essay feedback ───────────────────────────────────────
   Read as a whole, not revealed progressively — unlike the maths steps, feedback
   on an essay isn't really sequential, so it's just rendered straight through. */
function EssayFeedback({ uid, profile }) {
  const englishSubj = (profile?.subjects || []).find(s => /english/i.test(s.name))
  const [level, setLevel] = useState(englishSubj?.qualification || 'GCSE')
  const [essayType, setEssayType] = useState(ESSAY_TYPES[0])
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const overLimit = essay.length > MAX_ESSAY_CHARS

  async function handleGetFeedback() {
    if (!essay.trim() || overLimit) return
    setLoading(true); setError(''); setFeedback('')
    try {
      const res = await getEssayFeedback(essay.trim(), essayType, level, uid)
      if (res.error) { setError(res.error); return }
      setFeedback(res.text || '')
      if (uid) await autoCompleteQuest(uid, 'use_ai')
    } catch (e) {
      setError('Something went wrong: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12 }}>
          <div style={{ flex:1, minWidth:180 }}>
            <label className="label">Level</label>
            <div style={{ display:'flex', gap:6 }}>
              {ESSAY_LEVELS.map(l => (
                <button key={l} className={`btn btn-sm ${level===l ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLevel(l)}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ flex:2, minWidth:220 }}>
            <label className="label">Essay type</label>
            <select className="select" value={essayType} onChange={e => setEssayType(e.target.value)}>
              {ESSAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <label className="label">Paste your essay</label>
        <textarea className="textarea" rows={12} placeholder="Paste your essay here…"
          value={essay} onChange={e => setEssay(e.target.value)} />
        <div style={{ marginTop:8 }}>
          <PhotoCapture uid={uid} kind="essay" onExtracted={setEssay} label="handwriting welcome — check the transcription before submitting" />
        </div>
        <div style={{ marginTop:6 }}>
          <span style={{ fontSize:'0.72rem', color: overLimit ? 'var(--danger)' : 'var(--text-muted)' }}>
            {essay.length.toLocaleString()} / {MAX_ESSAY_CHARS.toLocaleString()} characters
            {overLimit ? ' — a bit too long, try one section at a time' : ''}
          </span>
        </div>

        <button className="btn btn-primary" style={{ marginTop:10 }} onClick={handleGetFeedback} disabled={loading || !essay.trim() || overLimit}>
          {loading ? 'Reading your essay…' : 'Get feedback'}
        </button>
        {error && <p style={{ color:'var(--danger)', fontSize:'0.82rem', marginTop:8 }}>{error}</p>}
      </div>

      {feedback && (
        <div className="card" style={{ padding:'18px 20px' }}>
          <AIOutput text={feedback} />
        </div>
      )}
    </div>
  )
}
