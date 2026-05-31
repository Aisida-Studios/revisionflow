// src/pages/Study.jsx
import React, { useState, useEffect, useRef } from 'react'
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
function FlipCard({ card, index, total, onRate, showRate }) {
  const [flipped, setFlipped] = useState(false)
  useEffect(() => setFlipped(false), [index])
  return (
    <div style={{ width:'100%', maxWidth:560 }}>
      <div onClick={() => setFlipped(f => !f)} style={{ cursor:'pointer', perspective:1200, width:'100%', height:260, userSelect:'none', marginBottom:16 }}>
        <div style={{ position:'relative', width:'100%', height:'100%', transformStyle:'preserve-3d', transition:'transform 0.42s cubic-bezier(0.4,0,0.2,1)', transform:flipped?'rotateY(180deg)':'rotateY(0deg)' }}>
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:16, background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.06))', border:'1px solid rgba(124,58,237,0.3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 32px', gap:14 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--accent-light)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Card {index+1} of {total}</div>
            <div style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--text-primary)', textAlign:'center', lineHeight:1.55 }}>{card.q}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:6 }}>Tap to flip</div>
          </div>
          <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:16, background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.04))', border:'1px solid rgba(16,185,129,0.3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 32px', gap:14 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--success)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Answer</div>
            <div style={{ fontSize:'1rem', color:'var(--text-primary)', textAlign:'center', lineHeight:1.65 }}>{card.a}</div>
          </div>
        </div>
      </div>
      {showRate && flipped && onRate && (
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          {[{label:"Didn't know",c:'var(--danger)',v:1},{label:'Partially',c:'var(--warning)',v:2},{label:'Got it!',c:'var(--success)',v:3}].map(b => (
            <button key={b.v} onClick={() => onRate(b.v)}
              style={{ padding:'8px 18px', borderRadius:999, border:`1px solid ${b.c}`, background:b.c+'22', color:b.c, fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LearnMode({ cards, onDone }) {
  const [queue,setQueue]     = useState(() => cards.map((c,i) => ({...c,_i:i,attempts:0})))
  const [idx,setIdx]         = useState(0)
  const [shown,setShown]     = useState(false)
  const [done,setDone]       = useState([])
  const [mastered,setMastered]= useState(new Set())
  function rate(val) {
    const card = queue[idx]
    const correct = val === 3
    if (correct) {
      const nm = new Set(mastered); nm.add(card._i); setMastered(nm)
      setDone(d => [...d, {...card,correct:true}])
      const rest = queue.filter((_,i)=>i!==idx)
      if (!rest.length) { onDone(done.length+1, cards.length); return }
      setQueue(rest); setIdx(i=>Math.min(i,rest.length-1))
    } else {
      const updated = queue.filter((_,i)=>i!==idx)
      updated.splice(Math.min(idx+3,updated.length),0,{...card,attempts:card.attempts+1})
      setQueue(updated); setDone(d=>[...d,{...card,correct:false}]); setIdx(i=>Math.min(i,updated.length-1))
    }
    setShown(false)
  }
  if (!queue.length) return null
  const card = queue[idx]
  return (
    <div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:5 }}>
          <span>{mastered.size}/{cards.length} mastered</span><span>{queue.length} remaining</span>
        </div>
        <div style={{ height:6, background:'var(--bg-hover)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:Math.round(mastered.size/cards.length*100)+'%', background:'var(--accent)', borderRadius:3, transition:'width 0.4s' }} />
        </div>
      </div>
      <div style={{ padding:'24px 28px', borderRadius:16, background:'var(--bg-surface)', border:'1px solid var(--border)', marginBottom:14, minHeight:160 }}>
        <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--accent-light)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>
          {card.attempts>0?`Revisiting (seen ${card.attempts}x)`:'Term'}
        </div>
        <div style={{ fontSize:'1.1rem', fontWeight:600, lineHeight:1.55, marginBottom:shown?16:0 }}>{card.q}</div>
        {shown && <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, marginTop:4 }}>
          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--success)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Definition</div>
          <div style={{ fontSize:'0.95rem', lineHeight:1.6 }}>{card.a}</div>
        </div>}
      </div>
      {!shown ? (
        <button className="btn btn-primary" style={{ width:'100%' }} onClick={()=>setShown(true)}>Show answer</button>
      ) : (
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {[{label:"Didn't know",c:'var(--danger)',v:1},{label:'Almost',c:'var(--warning)',v:2},{label:'Got it!',c:'var(--success)',v:3}].map(b=>(
            <button key={b.v} onClick={()=>rate(b.v)} style={{ flex:1, minWidth:100, padding:'10px 14px', borderRadius:12, border:`1px solid ${b.c}`, background:b.c+'18', color:b.c, fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>{b.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function AIWriteMarker({ question, correctAnswer, studentAnswer, uid, onResult, autoMark = false }) {
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [disputed,setDisputed]= useState(false)
  const [disputeNote,setDisputeNote]= useState('')
  const [disputeResult,setDisputeResult]= useState(null)
  const [disputeLoading,setDisputeLoading]= useState(false)

  // Auto-trigger marking when mounted with autoMark prop
  useEffect(() => {
    if (autoMark && !result && !loading) mark()
  }, [autoMark])

  async function mark() {
    setLoading(true)
    try {
      const { callAI } = await import('../utils/ai')
      const prompt = `You are marking a student's written answer for a flashcard exercise. Be lenient — accept synonyms, paraphrases, and partial answers where the key concept is clearly demonstrated.

Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${studentAnswer}

Respond in this exact format:
VERDICT: CORRECT or INCORRECT
SCORE: 1 or 0
FEEDBACK: One sentence explaining your verdict.`
      const res = await callAI(prompt, null, 300, uid)
      if (res.error) { onResult(false, 'AI error'); return }
      const text = res.text || ''
      const correct = /VERDICT:\s*CORRECT/i.test(text)
      const feedback = (text.match(/FEEDBACK:\s*(.+)/i) || [])[1] || (correct ? 'Good answer!' : 'Not quite right.')
      setResult({ correct, feedback })
      onResult(correct, feedback)
    } catch(e) { onResult(false, 'Could not mark') }
    finally { setLoading(false) }
  }

  async function dispute() {
    if (!disputeNote.trim()) return
    setDisputeLoading(true)
    try {
      const { callAI } = await import('../utils/ai')
      const prompt = `A student is disputing their flashcard answer marking. Reconsider carefully.

Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${studentAnswer}
Student's dispute: ${disputeNote}

Be open-minded. If the student makes a valid point, change the verdict.
Respond in this exact format:
VERDICT: CORRECT or INCORRECT
FEEDBACK: One sentence.`
      const res = await callAI(prompt, null, 200, uid)
      const text = res.text || ''
      const correct = /VERDICT:\s*CORRECT/i.test(text)
      const feedback = (text.match(/FEEDBACK:\s*(.+)/i) || [])[1] || 'Decision stands.'
      setDisputeResult({ correct, feedback })
      onResult(correct, feedback)
    } catch(e) {}
    finally { setDisputeLoading(false) }
  }

  if (!result && !loading) return (
    <button className="btn btn-secondary btn-sm" onClick={mark} style={{ display:'flex', alignItems:'center', gap:6 }}>
      <Zap size={13} /> AI Mark
    </button>
  )
  if (loading) return <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Marking…</span>

  const final = disputeResult || result
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ padding:'10px 14px', borderRadius:10,
        background: final.correct?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.08)',
        border:`1px solid ${final.correct?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.25)'}`,
        marginBottom:8 }}>
        <div style={{ fontWeight:700, color:final.correct?'var(--success)':'var(--danger)', fontSize:'0.85rem', marginBottom:4 }}>
          {final.correct ? '✓ Correct' : '✗ Incorrect'}
        </div>
        <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{final.feedback}</div>
      </div>
      {!disputeResult && !final.correct && !disputed && (
        <button className="btn btn-ghost btn-sm" onClick={() => setDisputed(true)} style={{ fontSize:'0.78rem' }}>
          ⚖️ Dispute this mark
        </button>
      )}
      {disputed && !disputeResult && (
        <div style={{ display:'flex', gap:6, alignItems:'flex-start' }}>
          <input className="input" style={{ fontSize:'0.82rem', padding:'6px 10px' }}
            value={disputeNote} onChange={e=>setDisputeNote(e.target.value)}
            placeholder="Why do you think your answer is correct?" />
          <button className="btn btn-secondary btn-sm" onClick={dispute} disabled={disputeLoading || !disputeNote.trim()}>
            {disputeLoading ? '…' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  )
}

function WriteMode({ cards, onDone, uid }) {
  const [deck]              = useState(() => [...cards].sort(()=>Math.random()-.5))
  const [idx,setIdx]        = useState(0)
  const [input,setInput]    = useState('')
  const [checked,setChecked]= useState(null) // null | 'pending' | 'correct' | 'wrong'
  const [scores,setScores]  = useState([])
  const inputRef = useRef(null)

  useEffect(()=>{ setInput(''); setChecked(null); inputRef.current?.focus() },[idx])

  function handleAIResult(correct) {
    // Called by AIWriteMarker with the AI verdict — sets final state and records score
    setScores(s => {
      const ns = [...s]
      ns[idx] = correct ? 1 : 0
      return ns
    })
    setChecked(correct ? 'correct' : 'wrong')
  }

  function next() {
    if (idx >= deck.length-1) { onDone(scores.filter(Boolean).length, deck.length); return }
    setIdx(i=>i+1)
  }

  const card = deck[idx]

  return (
    <div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:5 }}>
          <span>{idx+1}/{deck.length}</span><span style={{color:'var(--success)'}}>{scores.filter(Boolean).length} correct</span>
        </div>
        <div style={{ height:5, background:'var(--bg-hover)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:Math.round(idx/deck.length*100)+'%', background:'var(--accent)', borderRadius:3, transition:'width 0.3s' }} />
        </div>
      </div>
      <div style={{ padding:'20px 24px', borderRadius:16, background:'var(--bg-surface)', border:'1px solid var(--border)', marginBottom:14 }}>
        <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--accent-light)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Write the definition</div>
        <div style={{ fontSize:'1.05rem', fontWeight:600, lineHeight:1.55, marginBottom:16 }}>{card.q}</div>
        <textarea ref={inputRef} className="textarea"
          style={{ minHeight:80, fontSize:'0.9rem', borderColor:checked==='correct'?'var(--success)':checked==='wrong'?'var(--danger)':undefined }}
          value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&e.ctrlKey&&!checked)check()}}
          placeholder="Type your answer… (Ctrl+Enter to check)" disabled={!!checked} />
        {/* AI marking shown once answer is submitted */}
        {checked && (
          <div style={{ marginTop:10 }}>
            <AIWriteMarker question={card.q} correctAnswer={card.a} studentAnswer={input} uid={uid}
              onResult={(correct) => handleAIResult(correct)} autoMark />
          </div>
        )}
      </div>
      {!checked && (
        <button className="btn btn-primary" style={{width:'100%'}} onClick={()=>setChecked('pending')} disabled={!input.trim()}>
          Submit answer
        </button>
      )}
      {checked && checked !== 'pending' && (
        <button className="btn btn-primary" style={{width:'100%'}} onClick={next}>{idx>=deck.length-1?'See results':'Next'}</button>
      )}
    </div>
  )
}

function MatchMode({ cards, onDone }) {
  const n = Math.min(6, cards.length)
  function makeBoard() {
    const picked = [...cards].sort(()=>Math.random()-.5).slice(0,n)
    const terms = picked.map((c,i)=>({id:'t'+i,text:c.q,pairId:i,type:'term'}))
    const defs  = picked.map((c,i)=>({id:'d'+i,text:c.a,pairId:i,type:'def'}))
    return [...terms,...defs].sort(()=>Math.random()-.5)
  }
  const [tiles,setTiles]       = useState(makeBoard)
  const [selected,setSelected] = useState(null)
  const [matched,setMatched]   = useState(new Set())
  const [wrong,setWrong]       = useState(new Set())
  const [moves,setMoves]       = useState(0)
  const [start]                = useState(Date.now())
  const [elapsed,setElapsed]   = useState(0)
  const [done,setDone]         = useState(false)
  function pad2(n){return String(n).padStart(2,'0')}
  useEffect(()=>{ if(done)return; const t=setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),500); return()=>clearInterval(t) },[done])
  function select(tile) {
    if(matched.has(tile.id)||wrong.has(tile.id))return
    if(!selected){setSelected(tile);return}
    if(selected.id===tile.id){setSelected(null);return}
    setMoves(m=>m+1)
    if(selected.pairId===tile.pairId&&selected.type!==tile.type){
      const nm=new Set(matched);nm.add(selected.id);nm.add(tile.id);setMatched(nm);setSelected(null)
      if(nm.size===tiles.length){setDone(true);onDone(n,n)}
    } else {
      setWrong(new Set([selected.id,tile.id]))
      setTimeout(()=>{setWrong(new Set());setSelected(null)},800)
    }
  }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, fontSize:'0.85rem', color:'var(--text-muted)' }}>
        <span>Time: {Math.floor(elapsed/60)}:{pad2(elapsed%60)}</span>
        <span>{matched.size/2}/{n} matched</span>
        <span>{moves} moves</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {tiles.map(tile=>{
          const isM=matched.has(tile.id),isW=wrong.has(tile.id),isS=selected?.id===tile.id
          return <button key={tile.id} onClick={()=>!isM&&select(tile)}
            style={{ padding:'14px 12px', borderRadius:12, border:'none', cursor:isM?'default':'pointer',
              fontWeight:600, fontSize:'0.82rem', lineHeight:1.4, textAlign:'center', transition:'all 0.2s',
              background:isM?'rgba(16,185,129,0.15)':isW?'rgba(239,68,68,0.12)':isS?'rgba(124,58,237,0.2)':'var(--bg-surface)',
              border:`2px solid ${isM?'rgba(16,185,129,0.5)':isW?'rgba(239,68,68,0.5)':isS?'var(--accent)':'var(--border)'}`,
              color:isM?'var(--success)':isW?'var(--danger)':isS?'var(--accent-light)':'var(--text-primary)',
              transform:isS?'scale(1.03)':'scale(1)', opacity:isM?.6:1 }}>
            {tile.text}
          </button>
        })}
      </div>
      {done&&<div style={{ marginTop:16, padding:'14px 18px', borderRadius:12, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', textAlign:'center' }}>
        <span style={{ fontWeight:700, color:'var(--success)' }}>All matched in {Math.floor(elapsed/60)}:{pad2(elapsed%60)} with {moves} moves!</span>
      </div>}
    </div>
  )
}

function SpellMode({ cards, onDone }) {
  const [deck]              = useState(()=>[...cards].sort(()=>Math.random()-.5))
  const [idx,setIdx]        = useState(0)
  const [input,setInput]    = useState('')
  const [checked,setChecked]= useState(null)
  const [scores,setScores]  = useState([])
  const inputRef = useRef(null)
  useEffect(()=>{setInput('');setChecked(null);inputRef.current?.focus()},[idx])
  const card=deck[idx]
  const hint=card.a[0]+'_'.repeat(Math.max(0,card.a.length-1))
  function check(){const ok=input.toLowerCase().trim()===card.a.toLowerCase().trim();setChecked(ok?'correct':'wrong');setScores(s=>[...s,ok?1:0])}
  function next(){if(idx>=deck.length-1){onDone(scores.filter(Boolean).length,deck.length);return}setIdx(i=>i+1)}
  return (
    <div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:5 }}>
          <span>{idx+1}/{deck.length}</span><span style={{color:'var(--success)'}}>{scores.filter(Boolean).length} correct</span>
        </div>
        <div style={{ height:5, background:'var(--bg-hover)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:Math.round(idx/deck.length*100)+'%', background:'var(--accent)', borderRadius:3 }} />
        </div>
      </div>
      <div style={{ padding:'20px 24px', borderRadius:14, background:'var(--bg-surface)', border:'1px solid var(--border)', marginBottom:14 }}>
        <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--accent-light)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Spell the definition</div>
        <div style={{ fontSize:'1.05rem', fontWeight:600, lineHeight:1.55, marginBottom:12 }}>{card.q}</div>
        <div style={{ fontFamily:'monospace', fontSize:'1rem', color:'var(--text-muted)', letterSpacing:'0.15em', marginBottom:14, padding:'8px 12px', background:'var(--bg-hover)', borderRadius:8 }}>{hint}</div>
        <input ref={inputRef} className="input"
          style={{ borderColor:checked==='correct'?'var(--success)':checked==='wrong'?'var(--danger)':undefined }}
          value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!checked)check()}}
          placeholder="Spell out the full definition…" disabled={!!checked} />
        {checked==='wrong'&&<div style={{ marginTop:10, fontSize:'0.85rem', color:'var(--danger)', padding:'8px 12px', background:'rgba(239,68,68,0.08)', borderRadius:8, border:'1px solid rgba(239,68,68,0.2)' }}>
          Correct spelling: <strong>{card.a}</strong>
        </div>}
        {checked==='correct'&&<div style={{ marginTop:10, fontSize:'0.85rem', color:'var(--success)' }}>Correct!</div>}
      </div>
      {!checked?<button className="btn btn-primary" style={{width:'100%'}} onClick={check} disabled={!input.trim()}>Check spelling</button>
        :<button className="btn btn-primary" style={{width:'100%'}} onClick={next}>{idx>=deck.length-1?'See results':'Next'}</button>}
    </div>
  )
}

function TestMode({ cards, onDone, uid }) {
  // AI generates plausible wrong answers for MC questions
  async function buildWithAI() {
    // Build initial deck with real-card distractors as fallback
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    const deck = shuffled.map((card, i) => {
      if (i % 3 === 2) return { type: 'write', card, answer: '', checked: null, opts: [] }
      const realWrong = cards.filter(c => c.a !== card.a).sort(() => Math.random() - 0.5).slice(0, 3)
      const opts = [...realWrong, card].sort(() => Math.random() - 0.5)
      return { type: 'mc', card, opts, selected: null, checked: null, aiOpts: false }
    })
    return deck
  }

  async function loadAIDistractors(deck, setQs) {
    // For each MC question, generate AI distractors in the background
    const mcIndices = deck.map((q, i) => q.type === 'mc' ? i : -1).filter(i => i >= 0)
    if (!mcIndices.length) return
    try {
      const { callAI } = await import('../utils/ai')
      // Batch all questions into one AI call for efficiency
      const questions = mcIndices.map(i => `Q${i}: ${deck[i].card.q} | Answer: ${deck[i].card.a}`).join('\n')
      const prompt = `You are generating multiple choice distractors for a flashcard quiz. For each question below, generate exactly 3 wrong answer options.

RULES for good distractors:
- Same length and style as the real answer (if the answer is 2 sentences, make distractors 2 sentences)
- Use correct subject terminology — they must sound like they could be right
- Change 1-2 key facts, numbers, or concepts to make them wrong (e.g. wrong direction of movement, wrong organ, wrong date, wrong formula)
- Do NOT make them obviously wrong or silly
- Do NOT use "None of the above" or "All of the above"
- If the correct answer is very short (under 6 words), make distractors equally short but with a plausible wrong fact

Return ONLY a valid JSON array of arrays — no markdown, no explanation, no backticks:
[["distractor1","distractor2","distractor3"],["distractor1","distractor2","distractor3"],...]

Questions and correct answers:
${questions}`
      const res = await callAI(prompt, null, 600, uid)
      if (res.error || !res.text) return
      const text = res.text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) return
      const updated = [...deck]
      mcIndices.forEach((deckIdx, arrayIdx) => {
        const wrongs = parsed[arrayIdx]
        if (!Array.isArray(wrongs) || wrongs.length < 3) return
        const opts = [
          ...wrongs.slice(0, 3).map(a => ({ ...deck[deckIdx].card, a })),
          deck[deckIdx].card,
        ].sort(() => Math.random() - 0.5)
        updated[deckIdx] = { ...updated[deckIdx], opts, aiOpts: true }
      })
      setQs(updated)
    } catch(e) { /* silently use fallback distractors */ }
  }

  const [qs, setQs]         = useState([])
  const [idx, setIdx]       = useState(0)
  const [finished, setFin]  = useState(false)
  const [building, setBuilding] = useState(true)

  useEffect(() => {
    buildWithAI().then(deck => {
      setQs(deck)
      setBuilding(false)
      loadAIDistractors(deck, setQs)
    })
  }, [])

  function selectMC(opt) {
    if (qs[idx].checked !== null) return
    const u = [...qs]
    u[idx] = { ...u[idx], selected: opt, checked: opt.a === u[idx].card.a ? 'correct' : 'wrong' }
    setQs(u)
  }

  function submitWrite() {
    // Set to 'pending' so the AI marker shows — it will call handleWriteAI with the real verdict
    const u = [...qs]; u[idx] = { ...u[idx], checked: 'pending' }; setQs(u)
  }

  function handleWriteAI(correct) {
    const u = [...qs]; u[idx] = { ...u[idx], checked: correct ? 'correct' : 'wrong' }; setQs(u)
  }

  function next() {
    if (idx >= qs.length - 1) {
      const sc = qs.filter(q => q.checked === 'correct').length
      setFin(true); onDone(sc, qs.length); return
    }
    setIdx(i => i + 1)
  }

  if (building || !qs.length) return (
    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '0.9rem' }}>Building your test…</div>
    </div>
  )
  if (finished) return null

  const q = qs[idx]
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>
          <span>Q{idx+1}/{qs.length}</span>
          <span>{qs.filter(q => q.checked === 'correct').length} correct</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: Math.round(idx/qs.length*100)+'%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ padding: '18px 22px', borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {q.type === 'mc' ? 'Multiple choice' : 'Written answer'}
          </div>
          {q.type === 'mc' && q.aiOpts && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>✨ AI options</span>}
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.55, marginBottom: 16 }}>{q.card.q}</div>
        {q.type === 'mc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.opts.map((opt, i) => {
              const isC = opt.a === q.card.a, isSel = q.selected?.a === opt.a, ch = q.checked !== null
              return (
                <button key={i} onClick={() => selectMC(opt)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: 'none', cursor: ch ? 'default' : 'pointer',
                    textAlign: 'left', fontSize: '0.88rem', lineHeight: 1.4, fontWeight: isSel ? 700 : 500, transition: 'all 0.2s',
                    background: !ch ? (isSel ? 'rgba(124,58,237,0.15)' : 'var(--bg-hover)') : isC ? 'rgba(16,185,129,0.15)' : isSel ? 'rgba(239,68,68,0.12)' : 'var(--bg-hover)',
                    border: `1.5px solid ${!ch ? (isSel ? 'var(--accent)' : 'var(--border)') : isC ? 'rgba(16,185,129,0.5)' : isSel ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                    color: !ch ? 'var(--text-primary)' : isC ? 'var(--success)' : isSel ? 'var(--danger)' : 'var(--text-muted)' }}>
                  <span style={{ marginRight: 8, opacity: .6 }}>{['A','B','C','D'][i]}.</span>{opt.a}
                  {ch && isC && ' ✓'}{ch && isSel && !isC && ' ✗'}
                </button>
              )
            })}
          </div>
        )}
        {q.type === 'write' && (
          <div>
            <textarea className="textarea"
              style={{ minHeight: 70, fontSize: '0.9rem', borderColor: q.checked === 'correct' ? 'var(--success)' : q.checked === 'wrong' ? 'var(--danger)' : undefined }}
              value={q.answer}
              onChange={e => { const u = [...qs]; u[idx] = { ...u[idx], answer: e.target.value }; setQs(u) }}
              placeholder="Type your answer…" disabled={q.checked !== null} />
            {q.checked && (
              <div style={{ marginTop: 8 }}>
                <AIWriteMarker question={q.card.q} correctAnswer={q.card.a} studentAnswer={q.answer} uid={uid}
                  onResult={(correct) => handleWriteAI(correct)} autoMark />
              </div>
            )}
          </div>
        )}
      </div>
      {q.checked === null && q.type === 'write' && (
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={submitWrite} disabled={!q.answer.trim()}>
          Submit answer
        </button>
      )}
      {q.checked !== null && q.checked !== 'pending' && (
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={next}>
          {idx >= qs.length - 1 ? 'Finish test' : 'Next'}
        </button>
      )}
    </div>
  )
}

function StudySession({ cards: initCards, title, subject, onClose, onSave, uid }) {
  const [cards,setCards]   = useState(()=>[...initCards])
  const [mode,setMode]     = useState('select')
  const [results,setResults]= useState(null)
  const [idx,setIdx]       = useState(0)
  const [scores,setScores] = useState([])
  const [copied,setCopied] = useState(false)

  function handleFlashRate(val) {
    const s=[...scores]; s[idx]=val; setScores(s)
    if(idx<cards.length-1) setIdx(i=>i+1)
    else { setResults({got:s.filter(v=>v===3).length,total:cards.length,mode:'flash',scores:s}); setMode('results') }
  }
  function handleSubDone(correct,total) { setResults({got:correct,total,mode}); setMode('results') }
  function restart(m) { setIdx(0); setScores([]); setResults(null); setMode(m||'select') }
  function shuffle() { setCards(c=>[...c].sort(()=>Math.random()-.5)); setIdx(0); setScores([]) }
  function quizletCopy() { navigator.clipboard.writeText(cards.map(c=>c.q+'\t'+c.a).join('\n')); setCopied(true); toast.success('Copied!'); setTimeout(()=>setCopied(false),3000) }
  function downloadCSV() {
    const csv='Question,Answer\n'+cards.map(c=>'"'+c.q.replace(/"/g,'""')+'","'+c.a.replace(/"/g,'""')+'"').join('\n')
    const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:(subject||'flashcards')+'.csv'}); a.click()
  }

  const MODES=[
    {id:'flash', label:'Flash',  icon:'🃏', desc:'Flip cards, rate yourself'},
    {id:'learn', label:'Learn',  icon:'🧠', desc:'Active recall until mastered'},
    {id:'write', label:'Write',  icon:'✍️', desc:'Type the definition'},
    {id:'spell', label:'Spell',  icon:'🔤', desc:'Spell out the answer'},
    {id:'match', label:'Match',  icon:'🎯', desc:'Match terms to definitions'},
    {id:'test',  label:'Test',   icon:'📝', desc:'Mixed quiz with score'},
  ]

  const TopBar = () => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
      <button className="btn btn-ghost btn-sm" onClick={mode==='select'?onClose:()=>setMode('select')}>
        <ChevronLeft size={15}/> {mode==='select'?'Back':'Modes'}
      </button>
      <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontWeight:600, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</span>
      <div style={{ display:'flex', gap:5 }}>
        {mode==='flash'&&<button className="btn btn-ghost btn-sm" onClick={shuffle}><Shuffle size={14}/></button>}
        <button className="btn btn-ghost btn-sm" onClick={quizletCopy}>{copied?<Check size={14}/>:<Copy size={14}/>}</button>
        <button className="btn btn-ghost btn-sm" onClick={downloadCSV}><Download size={14}/></button>
      </div>
    </div>
  )

  if (mode==='select') return (
    <div style={{ maxWidth:560, margin:'0 auto' }}>
      <TopBar />
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
        <span className="badge badge-purple">{cards.length} cards</span>
        {subject&&<span className="badge badge-grey">{subject}</span>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{ padding:'16px 14px', borderRadius:14, border:'1px solid var(--border)', background:'var(--bg-surface)', cursor:'pointer', textAlign:'left', transition:'all 0.18s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='rgba(124,58,237,0.05)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-surface)'}}>
            <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{m.icon}</div>
            <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:3 }}>{m.label}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.4 }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )

  if (mode==='results'&&results) {
    const pct=Math.round(results.got/results.total*100)
    const emoji=pct>=90?'🏆':pct>=70?'🎉':pct>=50?'💪':'📚'
    return (
      <div style={{ maxWidth:520, margin:'0 auto' }}>
        <TopBar />
        <div className="card" style={{ textAlign:'center', padding:'28px 24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:10 }}>{emoji}</div>
          <h3 style={{ marginBottom:4 }}>Session complete!</h3>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--accent)', margin:'12px 0' }}>
            {results.got}/{results.total} <span style={{ fontSize:'1rem', fontWeight:600, color:'var(--text-muted)' }}>{pct}%</span>
          </div>
          {results.scores&&(
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:20 }}>
              {[{label:'Got it',count:results.scores.filter(v=>v===3).length,c:'var(--success)'},
                {label:'Partial',count:results.scores.filter(v=>v===2).length,c:'var(--warning)'},
                {label:'Missed',count:results.scores.filter(v=>v===1).length,c:'var(--danger)'}].map(s=>(
                <div key={s.label} style={{ textAlign:'center', padding:'8px 16px', background:'var(--bg-surface)', borderRadius:10, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.c }}>{s.count}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={()=>restart(results.mode)}><RotateCcw size={14}/> Try again</button>
            <button className="btn btn-secondary" onClick={()=>restart('select')}>Change mode</button>
            {onSave&&<button className="btn btn-secondary" onClick={onSave}><Save size={14}/> Save set</button>}
            <button className="btn btn-ghost" onClick={onClose}><X size={14}/> Exit</button>
          </div>
        </div>
        {results.mode==='flash'&&results.scores&&(
          <div style={{ marginTop:14 }}>
            <h4 style={{ marginBottom:10, fontSize:'0.9rem' }}>All cards</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {cards.map((c,i)=>(
                <div key={i} style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-surface)',
                  border:`1px solid ${results.scores[i]===3?'rgba(16,185,129,0.4)':results.scores[i]===1?'rgba(239,68,68,0.4)':'var(--border)'}` }}>
                  <div style={{ fontWeight:600, fontSize:'0.84rem', marginBottom:3 }}>{c.q}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{c.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (mode==='flash') return (
    <div style={{ maxWidth:560, margin:'0 auto' }}>
      <TopBar />
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:4 }}>
          <span>{idx+1}/{cards.length}</span><span>{Math.round(idx/cards.length*100)}%</span>
        </div>
        <div style={{ height:5, background:'var(--bg-hover)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:((idx+1)/cards.length*100)+'%', background:'linear-gradient(90deg,var(--purple-700),var(--purple-400))', borderRadius:3, transition:'width 0.3s' }} />
        </div>
      </div>
      <FlipCard card={cards[idx]} index={idx} total={cards.length} showRate onRate={handleFlashRate} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
        <button className="btn btn-ghost btn-sm" onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0}><ChevronLeft size={15}/> Prev</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>{if(idx<cards.length-1)setIdx(i=>i+1);else{setResults({got:scores.filter(v=>v===3).length,total:cards.length,mode:'flash',scores});setMode('results')}}}>
          {idx<cards.length-1?<>Next <ChevronRight size={15}/></>:'Finish'}
        </button>
      </div>
    </div>
  )

  if (mode==='learn') return <div style={{maxWidth:560,margin:'0 auto'}}><TopBar /><LearnMode cards={cards} onDone={handleSubDone} /></div>
  if (mode==='write') return <div style={{maxWidth:560,margin:'0 auto'}}><TopBar /><WriteMode cards={cards} onDone={handleSubDone} uid={uid} /></div>
  if (mode==='spell') return <div style={{maxWidth:520,margin:'0 auto'}}><TopBar /><SpellMode cards={cards} onDone={handleSubDone} /></div>
  if (mode==='match') return <div style={{maxWidth:600,margin:'0 auto'}}><TopBar /><MatchMode cards={cards} onDone={handleSubDone} /></div>
  if (mode==='test')  return <div style={{maxWidth:560,margin:'0 auto'}}><TopBar /><TestMode  cards={cards} onDone={handleSubDone} uid={uid} /></div>
  return null
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
    return text.split(/\r?\n/)
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
      for (const line of (res.text || '').split('\n')) {
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
                placeholder={"photosynthesis\tthe process by which plants convert light into energy\nmitosis\tcell division producing two identical daughter cells"}
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

/* ── Quiz tab ───────────────────────────────────────────────────────────────── */
function QuizTab({ mySets, uid, profile }) {
  const [selectedSet, setSelectedSet] = useState(null)
  const [quizMode,    setQuizMode]    = useState('mc')    // 'mc' | 'write' | 'mixed'
  const [questionCount, setQCount]    = useState(10)
  const [started,     setStarted]     = useState(false)
  const [results,     setResults]     = useState(null)

  const subjects = profile?.subjects?.map(s => s.name) || []

  if (results) return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '28px 24px' }}>
        {(() => {
          const pct = Math.round(results.got / results.total * 100)
          const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'
          return (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 10 }}>{emoji}</div>
              <h3 style={{ marginBottom: 4 }}>Quiz complete!</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', margin: '12px 0' }}>
                {results.got}/{results.total}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 8 }}>{pct}%</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.875rem' }}>
                from <strong>{selectedSet?.title}</strong>
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => { setResults(null); setStarted(false) }}>
                  <RotateCcw size={14} /> Try again
                </button>
                <button className="btn btn-secondary" onClick={() => { setResults(null); setStarted(false); setSelectedSet(null) }}>
                  Change set
                </button>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )

  if (started && selectedSet) {
    const quizCards = [...selectedSet.cards].sort(() => Math.random() - 0.5).slice(0, questionCount)
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setStarted(false)}>
            <ChevronLeft size={15} /> Back
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{selectedSet.title}</span>
          <span className="badge badge-purple">{quizCards.length} questions</span>
        </div>
        {(quizMode === 'mc' || quizMode === 'mixed') && (
          <TestMode cards={quizCards} uid={uid}
            onDone={(got, total) => setResults({ got, total })} />
        )}
        {quizMode === 'write' && (
          <WriteMode cards={quizCards} uid={uid}
            onDone={(got, total) => setResults({ got, total })} />
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 6 }}>Quiz</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Test yourself on a flashcard set. Premade quizzes coming soon.
        </p>
      </div>

      {/* Set picker */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 14, fontSize: '0.95rem' }}>1. Choose a set</h4>
        {mySets.length === 0 ? (
          <div className="empty-state" style={{ padding: '16px 0' }}>
            <BookOpen size={32} style={{ opacity: 0.3 }} />
            <p>No saved sets yet — generate or create flashcards first</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mySets.map(set => (
              <button key={set.id} onClick={() => setSelectedSet(set)}
                style={{ padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${selectedSet?.id === set.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: selectedSet?.id === set.id ? 'rgba(124,58,237,0.06)' : 'var(--bg-surface)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{set.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {set.subject} · {set.cards?.length || 0} cards
                    </div>
                  </div>
                  {selectedSet?.id === set.id && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quiz options */}
      {selectedSet && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 14, fontSize: '0.95rem' }}>2. Quiz settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Question format</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'mc',    label: 'Multiple choice', desc: 'Pick the right answer' },
                  { id: 'write', label: 'Written',         desc: 'Type your answer (AI marked)' },
                  { id: 'mixed', label: 'Mixed',           desc: 'Both formats' },
                ].map(m => (
                  <button key={m.id} onClick={() => setQuizMode(m.id)}
                    style={{ flex: 1, minWidth: 130, padding: '10px 12px', borderRadius: 10,
                      border: `1.5px solid ${quizMode === m.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: quizMode === m.id ? 'rgba(124,58,237,0.06)' : 'var(--bg-surface)',
                      cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Number of questions</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[5, 10, 15, 20, selectedSet.cards?.length].filter((n, i, a) => n && a.indexOf(n) === i && n <= (selectedSet.cards?.length || 0)).map(n => (
                  <button key={n} onClick={() => setQCount(n)}
                    style={{ padding: '6px 14px', borderRadius: 20,
                      border: `1px solid ${questionCount === n ? 'var(--accent)' : 'var(--border)'}`,
                      background: questionCount === n ? 'var(--accent)' : 'var(--bg-card)',
                      color: questionCount === n ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    {n === selectedSet.cards?.length ? `All (${n})` : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start button */}
      {selectedSet && (
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}
          onClick={() => setStarted(true)}>
          Start quiz — {Math.min(questionCount, selectedSet.cards?.length || 0)} questions
        </button>
      )}

      {/* Coming soon */}
      <div className="card" style={{ marginTop: 20, opacity: 0.6 }}>
        <h4 style={{ marginBottom: 8, fontSize: '0.9rem' }}>Coming soon</h4>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['📚 Premade quizzes by topic', '🏆 Timed challenge mode', '📊 Quiz history & scores', '🤝 Public quiz sets'].map(f => (
            <span key={f} className="badge badge-grey" style={{ fontSize: '0.75rem' }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Mark scheme reveal (controlled state, no <details>) ────────── */
function MarkSchemeReveal({ text }) {
  const [shown, setShown] = useState(false)
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setShown(s => !s)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          background: 'rgba(16,185,129,0.07)', borderRadius: 7,
          border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', width: '100%' }}>
        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: shown ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        {shown ? 'Hide mark scheme' : 'Reveal mark scheme'}
      </button>
      {shown && (
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.05)',
          borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
          <AIOutput text={text} label="Mark scheme" compact />
        </div>
      )}
    </div>
  )
}

/* ── Topic Notes Tab ────────────────────────────────────────────────────────── */
function TopicNotesTab({ profile, uid }) {
  const urlParams    = new URLSearchParams(window.location.search)
  const [subject,    setSubject]    = useState(urlParams.get('subject') || '')
  const [board,      setBoard]      = useState(urlParams.get('board')   || '')
  const [level,      setLevel]      = useState(urlParams.get('level')   || 'GCSE')
  const [topic,      setTopic]      = useState(urlParams.get('topic')   || '')
  const [note,       setNote]       = useState(null)   // { text, cached, slug }
  const [loading,    setLoading]    = useState(false)
  const [remaining,  setRemaining]  = useState(null)
  const [topicList,  setTopicList]  = useState([])
  const [topicSearch,setTopicSearch]= useState('')

  const subjects = profile?.subjects || []
  const selectedSubject = subjects.find(s => s.name === subject)

  // Load topic list when subject changes
  useEffect(() => {
    if (!subject) return
    import('../data/topics').then(({ getTopicsForSubject }) => {
      const sb = selectedSubject?.board || board || 'AQA'
      const lv = selectedSubject?.qualification || level || 'GCSE'
      // getTopicsForSubject returns {1:[...],2:[...]} — flatten to deduped array
      const papers = getTopicsForSubject(sb, subject, lv) || {}
      const flat = Object.values(papers).flat().filter(t => typeof t === 'string' && t.trim())
      const topics = [...new Set(flat)]
      setTopicList(topics)
    })
  }, [subject, board, level])

  // Auto-load if topic pre-selected from URL
  useEffect(() => {
    if (topic && subject && board) {
      loadNote(topic, false)
    }
  }, [])

  async function loadNote(topicName, forceGenerate = false) {
    setLoading(true)
    setNote(null)
    const t = topicName || topic
    const b = selectedSubject?.board || board
    const lv = selectedSubject?.qualification || level

    try {
      const { getTopicNoteFromCache, generateTopicNote, saveTopicNoteToCache, incrementTopicNoteViews } = await import('../utils/ai')
      const { checkTopicNoteLimit, incrementTopicNoteUsage } = await import('../utils/firestore')

      // Check cache first (unless force regenerating)
      if (!forceGenerate) {
        const cached = await getTopicNoteFromCache(b, lv, subject, t)
        if (cached) {
          setNote({ text: cached.text, cached: true, slug: cached.slug, generatedAt: cached.generatedAt })
          incrementTopicNoteViews(cached.slug).catch(() => {})
          setLoading(false)
          return
        }
      }

      // Check rate limit
      const limit = await checkTopicNoteLimit(uid, profile)
      setRemaining(limit.remaining)
      if (!limit.allowed) {
        toast.error('Daily limit reached (5/day on free plan). Upgrade to Pro for unlimited notes.')
        setLoading(false)
        return
      }

      // Generate
      const res = await generateTopicNote({ subject, board: b, level: lv, topic: t, uid })
      if (res.error) { toast.error(res.error); setLoading(false); return }

      // Save to global cache
      const slug = await saveTopicNoteToCache(b, lv, subject, t, res.text)
      await incrementTopicNoteUsage(uid)
      setNote({ text: res.text, cached: false, slug })
      setRemaining(r => r !== null ? Math.max(0, r - 1) : null)
    } catch(e) {
      toast.error('Failed to load note: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredTopics = topicList.filter(t =>
    !topicSearch || t.toLowerCase().includes(topicSearch.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 4 }}>Topic Revision Guides</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          AI-generated revision guides cached globally — generated once, available to all students.
          {remaining !== null && remaining !== Infinity && (
            <span style={{ marginLeft: 8, color: remaining > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {remaining > 0 ? `${remaining} generations left today` : 'Daily limit reached — upgrade to Pro for unlimited'}
            </span>
          )}
        </p>
      </div>

      {/* Subject / board selectors */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          <div>
            <label className="label">Subject</label>
            <select className="select" value={subject} onChange={e => { setSubject(e.target.value); setTopic(''); setNote(null) }}>
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          {subject && (
            <>
              <div>
                <label className="label">Board</label>
                <select className="select" value={selectedSubject?.board || board}
                  onChange={e => setBoard(e.target.value)}>
                  {['AQA','Edexcel','OCR','WJEC','Eduqas','CCEA'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Level</label>
                <select className="select" value={selectedSubject?.qualification || level}
                  onChange={e => setLevel(e.target.value)}>
                  {['GCSE','A-Level','AS-Level'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Topic picker + note viewer */}
      {subject && (
        <div style={{ display: 'grid', gridTemplateColumns: note ? '280px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>

          {/* Topic list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', maxHeight: note ? 'calc(100vh - 220px)' : 'none' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
              <input className="input" placeholder="Search topics..." value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)} style={{ fontSize: '0.82rem' }} />
            </div>
            <div style={{ overflowY: 'auto', maxHeight: note ? 'calc(100vh - 290px)' : 400 }}>
              {topicList.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {topicList.length === 0 ? 'Select a subject to see topics' : 'No topics found'}
                </div>
              ) : filteredTopics.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matching topics</div>
              ) : (
                filteredTopics.map((t, i) => (
                  <button key={i} onClick={() => { setTopic(t); loadNote(t) }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px',
                      background: topic === t ? 'rgba(124,58,237,0.1)' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--border)',
                      cursor: 'pointer', fontSize: '0.82rem', lineHeight: 1.4,
                      color: topic === t ? 'var(--accent-light)' : 'var(--text-primary)',
                      fontWeight: topic === t ? 600 : 400,
                      transition: 'background 0.15s',
                    }}>
                    {t}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Note viewer */}
          {note && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{topic}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {selectedSubject?.board || board} {selectedSubject?.qualification || level} {subject}
                    {note.cached && <span style={{ marginLeft: 8, color: 'var(--success)' }}>● Cached</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => loadNote(topic, true)} disabled={loading}
                    style={{ fontSize: '0.75rem' }}>
                    {loading ? '...' : '↺ Regenerate'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setNote(null)} style={{ fontSize: '0.75rem' }}>
                    ✕ Close
                  </button>
                </div>
              </div>
              <div style={{ padding: '16px 18px', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
                <AIOutput text={note.text} />
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && !note && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '3px solid var(--bg-hover)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Generating revision guide...</div>
                <div>This may take 15-20 seconds for a comprehensive guide.</div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !note && subject && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12, textAlign: 'center' }}>
              <BookOpen size={40} style={{ opacity: 0.25 }} />
              <div style={{ fontWeight: 600 }}>Select a topic to view its revision guide</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 280 }}>
                Guides are generated by AI and cached globally. Once generated for a topic, all students can access it instantly.
              </div>
            </div>
          )}
        </div>
      )}

      {!subject && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <BookOpen size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Choose a subject to get started</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Select a subject above to browse topics and generate revision guides.
            Guides are cached globally — your generations help everyone.
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function Study() {
  const { user, profile } = useAuth()
  // Read URL params — Topics page links here with ?tab=notes&topic=...&subject=...
  const urlParams  = new URLSearchParams(window.location.search)
  const initTab    = urlParams.get('tab') || 'flashcards'
  const [tab, setTab] = useState(initTab)
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
      <StudySession cards={studyCards} title={studyTitle} subject={studySubj} onClose={() => setStudyCards(null)} onSave={() => setShowSave(true)} uid={user?.uid} />
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
      <div className="tabs" style={{ marginBottom: 24, padding: 4, flexWrap: 'wrap' }}>
        <button className={'tab' + (tab === 'notes' ? ' active' : '')} onClick={() => setTab('notes')}><BookOpen size={15} /> Topic Notes</button>
        <button className={'tab' + (tab === 'flashcards' ? ' active' : '')} onClick={() => setTab('flashcards')}><BookOpen size={15} /> Flashcards</button>
        <button className={'tab' + (tab === 'quiz' ? ' active' : '')} onClick={() => setTab('quiz')}><ClipboardList size={15} /> Quiz</button>
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

      {/* ── TOPIC NOTES ── */}
      {tab === 'notes' && (
        <TopicNotesTab profile={profile} uid={user?.uid} />
      )}

      {/* ── QUIZ ── */}
      {tab === 'quiz' && (
        <QuizTab mySets={mySets} uid={user?.uid} profile={profile} />
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
                          <MarkSchemeReveal text={schemePart} />
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
