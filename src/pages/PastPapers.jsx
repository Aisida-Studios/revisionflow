// src/pages/PastPapers.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { savePaperAttempt, getPaperAttempts, getPaperStructures, deletePaperAttempt, updatePaperAttempt, getTopicsWithConfidence } from '../utils/firestore'
import { buildQuestions, distributionTotal, validateDistribution, validateScores, lostMarks, MAX_QUESTIONS } from '../utils/paperQuestions'
import { analyseWeaknesses } from '../utils/ai'
import { gradeColour } from '../utils/calendar'
import { scaleBoundariesToPaper, AVAILABLE_YEARS } from '../data/paperDatabase'
import { gradePaper, staleGradeFix, customBoundarySetFor } from '../utils/attemptGrade'
import { getMergedPaperSpec, getMergedBoundaries } from '../data/overrides'
import { isTiered } from '../data/examDates2026'
import { SUBJECT_COLOURS, getGradeOptions, getSubjectQualification } from '../data/subjects'
import { canonicalBoard, boardLabel } from '../data/boards'
import BoardOptions from '../components/BoardOptions'
import { buildSubjectKey, filterToCurrentSubjectInstance } from '../utils/subjectKey'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Plus, X, Brain, FileText, Trash2, Edit2, Check } from 'lucide-react'
import { todayLocalStr } from '../utils/localDate'

export default function PastPapers() {
  const { user, profile } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [structures, setStructures] = useState([])
  const [selSubject, setSelSubject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showQPrompt, setShowQPrompt] = useState(null)  // attempt to enter question marks for
  const [expandedId, setExpandedId] = useState(null)    // attempt whose question breakdown is open
  const [showBoundaryEditor, setShowBoundaryEditor] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [tab, setTab] = useState('attempts')
  const [selected,   setSelected]   = useState([])
  const [sortCol,    setSortCol]    = useState('attemptDate')
  const [sortDir,    setSortDir]    = useState('desc')
  const [editEntry,  setEditEntry]  = useState(null)

  const subjects = profile?.subjects?.map(s=>s.name) || []

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function sortIcon(col) {
    if (sortCol !== col) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  useEffect(() => {
    if (!user) return
    getPaperAttempts(user.uid, selSubject||null).then(setAttempts)
    getPaperStructures({}).then(setStructures)
  }, [user, selSubject])

  // Re-grade an attempt after its score, total or year was edited. A grade comes from the same
  // boundaries it was first given: the student's own (if they entered any and they were saved),
  // otherwise the board boundaries for the (possibly changed) year. If the student's own boundaries
  // were never saved (older entries) the grade is left as it was rather than guessed.
  async function regradeEdited(att, updated) {
    const own = customBoundarySetFor(att)
    if (own) return gradePaper({ score: updated.score, maxMarks: updated.maxMarks, boundarySet: own, custom: true, year: updated.year })
    if (att.gradeProvenance?.source === 'Student-entered boundaries') return {}
    const set = await getMergedBoundaries(att.board, att.subject, att.tier, updated.year, att.qualification || 'GCSE')
    const r = gradePaper({ score: updated.score, maxMarks: updated.maxMarks, boundarySet: set, year: updated.year })
    return r.grade ? r : {}
  }

  // Repairs grades saved by the old behaviour, which compared a paper's raw mark with boundaries for
  // the WHOLE subject (75/80 measured against marks out of 240 came out as a 4). Only a grade that
  // matches exactly what the old behaviour would have saved is changed; each attempt is checked once.
  const repairChecked = useRef(new Set())
  const mounted = useRef(true)
  useEffect(() => () => { mounted.current = false }, [])
  useEffect(() => {
    if (!user || !attempts.length) return
    const todo = attempts.filter(a => !repairChecked.current.has(a.id))
    if (!todo.length) return
    todo.forEach(a => repairChecked.current.add(a.id))
    ;(async () => {
      const cache = new Map()
      const fixes = []
      for (const a of todo) {
        const level = a.qualification || 'GCSE'
        const key = [a.board, level, a.subject, a.tier, a.year].join('|')
        if (!cache.has(key)) cache.set(key, await getMergedBoundaries(a.board, a.subject, a.tier, a.year, level).catch(() => null))
        const set = cache.get(key)
        const fix = staleGradeFix(a, set)
        if (!fix) continue
        const r = gradePaper({ score: a.score, maxMarks: a.maxMarks, boundarySet: set, year: a.year })
        fixes.push({ id: a.id, grade: fix.grade, ...(r.gradeProvenance ? { gradeProvenance: r.gradeProvenance } : {}) })
      }
      if (!fixes.length) return
      await Promise.all(fixes.map(({ id, ...patch }) => updatePaperAttempt(user.uid, id, patch).catch(() => {})))
      if (!mounted.current) return
      setAttempts(list => list.map(x => { const f = fixes.find(y => y.id === x.id); return f ? { ...x, grade: f.grade, ...(f.gradeProvenance ? { gradeProvenance: f.gradeProvenance } : {}) } : x }))
      toast.success('Corrected ' + fixes.length + ' past paper grade' + (fixes.length === 1 ? '' : 's') + ' that had been measured against the whole subject instead of the paper.')
    })()
  }, [attempts, user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id) {
    await deletePaperAttempt(user.uid, id)
    setAttempts(a=>a.filter(x=>x.id!==id))
    toast.success('Paper deleted')
  }

  async function handleBulkDelete() {
    await Promise.all(selected.map(id=>deletePaperAttempt(user.uid, id)))
    setAttempts(a=>a.filter(x=>!selected.includes(x.id)))
    setSelected([])
    toast.success(`Deleted ${selected.length} paper${selected.length!==1?'s':''} (-${selected.length*100} XP)`)
  }

  async function handleAnalyse() {
    setAiLoading(true)
    const res = await analyseWeaknesses(currentAttempts, selSubject)
    setAiAnalysis(res.text||res.error||'')
    setAiLoading(false)
  }

  // Computed live against the student's current subjects every render, rather than trusting
  // the archived flag alone — see filterToCurrentSubjectInstance in utils/subjectKey.js. This is
  // the one place that decides what counts as "current" for this whole page; everything below
  // reads from this, not the raw attempts fetch, so nothing here can accidentally skip the check
  // the way the old "only filter when a subject is selected" logic used to.
  const currentAttempts = filterToCurrentSubjectInstance(attempts, profile)

  const filtered = (selSubject ? currentAttempts.filter(a=>a.subject===selSubject) : [...currentAttempts])
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const map = {
        subject: [a.subject, b.subject],
        qualification: [a.qualification||'GCSE', b.qualification||'GCSE'],
        paper:   [a.paper, b.paper],
        board:   [a.board, b.board],
        year:    [a.year, b.year],
        score:   [a.score, b.score],
        percentage: [a.percentage, b.percentage],
        grade:   [a.grade, b.grade],
        attemptDate: [a.attemptDate, b.attemptDate],
      }
      const [av, bv] = map[sortCol] || [a[sortCol], b[sortCol]]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  const chartData = [...filtered].reverse().map(a=>({ name:`${a.subject} P${a.paper} ${a.year}`, percentage:a.percentage, grade:a.grade }))

  const subjectAverages = subjects.map(s=>{
    const sub = currentAttempts.filter(a=>a.subject===s)
    const avg = sub.length ? Math.round(sub.reduce((sum,a)=>sum+a.percentage,0)/sub.length) : null
    return { subject:s, avg, count:sub.length, latest:sub[0] }
  })

  function toggleSelect(id) { setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]) }

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <h2>Past Papers</h2>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {selected.length>0 && <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><Trash2 size={14}/> Delete {selected.length}</button>}
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowBoundaryEditor(true)}><Edit2 size={14}/> Grade boundaries</button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={14}/> Log paper</button>
        </div>
      </div>

      <div className="tabs" style={{marginBottom:16}}>
        {['attempts','progress','analyse'].map(t=>(
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t==='attempts'?'Attempts':t==='progress'?'Progress':'Analysis'}
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        <button className={`btn btn-sm ${!selSubject?'btn-primary':'btn-secondary'}`} onClick={()=>setSelSubject('')}>All</button>
        {subjects.map(s=><button key={s} className={`btn btn-sm ${selSubject===s?'btn-primary':'btn-secondary'}`} onClick={()=>setSelSubject(s)}>{s}</button>)}
      </div>

      {tab==='attempts' && (
        <>
          <div className="grid-3" style={{marginBottom:16}}>
            {subjectAverages.filter(s=>s.count>0).map(s=>(
              <div key={s.subject} className="card stat-card" style={{cursor:'pointer'}} onClick={()=>setSelSubject(s.subject)}>
                <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:6}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:SUBJECT_COLOURS[s.subject]||'var(--accent)'}}/>
                  <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>{s.subject}</span>
                </div>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:gradeColour(s.latest?.grade||'')}}>{s.avg}%</div>
                <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{s.count} paper{s.count!==1?'s':''} · Grade {s.latest?.grade||'?'}</div>
              </div>
            ))}
          </div>

          {filtered.length===0 ? (
            <div className="empty-state"><FileText size={40} style={{opacity:0.3}}/><h4>No papers logged</h4><button className="btn btn-primary" onClick={()=>setShowAdd(true)}>Log your first paper</button></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th><input type="checkbox" checked={selected.length===filtered.length&&filtered.length>0} onChange={e=>setSelected(e.target.checked?filtered.map(x=>x.id):[])} style={{accentColor:'var(--accent)'}}/></th>
                  {[
                    {col:'subject',label:'Subject'},
                    {col:'qualification',label:'Level'},
                    {col:'paper',label:'Paper'},
                    {col:'board',label:'Board'},
                    {col:'year',label:'Year'},
                    {col:'score',label:'Score'},
                    {col:'percentage',label:'%'},
                    {col:'grade',label:'Grade'},
                    {col:'attemptDate',label:'Date'},
                  ].map(({col,label})=>(
                    <th key={col} onClick={()=>toggleSort(col)}
                      style={{cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>
                      {label}{sortIcon(col)}
                    </th>
                  ))}
                  <th></th>
                </tr></thead>
                <tbody>
                  {filtered.map(a=>(
                    <React.Fragment key={a.id}>
                    <tr style={{background:selected.includes(a.id)?'rgba(34,197,94,0.08)':undefined}}>
                      <td><input type="checkbox" checked={selected.includes(a.id)} onChange={()=>toggleSelect(a.id)} style={{accentColor:'var(--accent)'}}/></td>
                      <td><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:7,height:7,borderRadius:'50%',background:SUBJECT_COLOURS[a.subject]||'var(--accent)',flexShrink:0}}/>{a.subject}</div></td>
                      <td><span className="badge badge-accent" style={{fontSize:'0.68rem'}}>{a.qualification||'GCSE'}</span></td>
                      <td>P{a.paper}</td>
                      <td>{boardLabel(a.board)}</td>
                      <td>{a.year}</td>
                      <td>{a.score}/{a.maxMarks}</td>
                      <td>{a.percentage}%</td>
                      <td><span style={{fontWeight:800,color:gradeColour(a.grade||''),fontSize:'1rem'}}>{a.grade||'–'}</span></td>
                      <td style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{a.attemptDate||'–'}</td>
                      <td style={{display:'flex',gap:4}}>
                        <button className="btn btn-ghost btn-sm" style={{fontSize:'0.72rem',whiteSpace:'nowrap'}}
                          onClick={()=> a.questionMarks?.length ? setExpandedId(expandedId===a.id?null:a.id) : setShowQPrompt(a)}>
                          {a.questionMarks?.length ? (expandedId===a.id?'Hide questions':'Questions') : 'Add questions'}
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--accent-light)'}} onClick={()=>setEditEntry(a)} title="Edit"><Edit2 size={13}/></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(a.id)} title="Delete"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                    {expandedId===a.id && a.questionMarks?.length>0 && (
                      <tr>
                        <td colSpan={11} style={{background:'var(--bg-surface)'}}>
                          <div style={{fontSize:'0.74rem',color:'var(--text-muted)',marginBottom:6}}>
                            Question breakdown{a.questionStructure?.verified ? ' (verified structure)' : a.questionStructure?.source==='student-entered' ? ' (entered by you, not official)' : ''}
                          </div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                            {a.questionMarks.map(q=>(
                              <div key={q.num} className="card" style={{padding:'6px 10px',minWidth:96}}>
                                <div style={{fontWeight:700,fontSize:'0.82rem'}}>Q{q.num}: {q.scored}/{q.marks}</div>
                                {q.topic && <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{q.topic}</div>}
                                {lostMarks(q)>0 && (
                                  <Link to={`/mistakes?attempt=${encodeURIComponent(a.id)}&q=${encodeURIComponent(q.num)}`} style={{fontSize:'0.72rem'}}>
                                    Log mistake ({lostMarks(q)} lost)
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab==='progress' && (
        chartData.length<2 ? (
          <div className="empty-state"><p>Log at least 2 papers to see a progress graph</p></div>
        ) : (
          <div className="card">
            <h4 style={{marginBottom:16}}>Score progression</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:'var(--text-muted)'}} interval="preserveStartEnd"/>
                <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fontSize:11,fill:'var(--text-muted)'}}/>
                <Tooltip formatter={v=>`${v}%`} contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8}}/>
                <Line type="monotone" dataKey="percentage" stroke="var(--accent-light)" strokeWidth={2} dot={{fill:'var(--accent)',strokeWidth:0,r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      )}

      {tab==='analyse' && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <h4 style={{display:'flex',alignItems:'center',gap:8}}><Brain size={18} color="var(--accent-light)"/> Analysis</h4>
            <button className="btn btn-primary btn-sm" onClick={handleAnalyse} disabled={aiLoading||filtered.length===0}>
              {aiLoading?'Analysing…':'Analyse'}
            </button>
          </div>
          {filtered.length===0&&<p>Log at least one paper to get an analysis.</p>}
          {aiLoading&&<div className="loading-center"><div className="spinner"/></div>}
          {aiAnalysis&&<div style={{whiteSpace:'pre-wrap',fontSize:'0.875rem',lineHeight:1.8}}>{aiAnalysis}</div>}
        </div>
      )}

      {showAdd && (
        <AddAttemptModal user={user} profile={profile} structures={structures}
          onClose={()=>setShowAdd(false)}
          onSave={async(a,promptQ)=>{
            const id = await savePaperAttempt(user.uid,a)
            await getPaperAttempts(user.uid,null).then(setAttempts)
            setShowAdd(false)
            toast.success('Paper logged')
            if(promptQ) setShowQPrompt({...a, id})
          }}/>
      )}

      {showQPrompt && (
        <QuestionMarksModal attempt={showQPrompt} user={user} profile={profile}
          onClose={()=>setShowQPrompt(null)}
          onSave={async (questions) => {
            const questionStructure = { source: 'student-entered', verified: false }
            await updatePaperAttempt(user.uid, showQPrompt.id, { questionMarks: questions, questionStructure })
            setAttempts(a => a.map(x => x.id === showQPrompt.id ? { ...x, questionMarks: questions, questionStructure } : x))
            setExpandedId(showQPrompt.id)
            setShowQPrompt(null)
            toast.success('Question marks saved')
          }}/>
      )}

      {editEntry && (
        <EditEntryModal
          attempt={editEntry}
          onClose={()=>setEditEntry(null)}
          onSave={async (updated) => {
            // Changing the score, total or year changes the grade too (it used to stay as it was).
            const regrade = await regradeEdited(editEntry, updated).catch(() => ({}))
            const patch = { ...updated, ...regrade }
            await updatePaperAttempt(user.uid, editEntry.id, patch)
            setAttempts(a => a.map(x => x.id === editEntry.id ? {...x, ...patch} : x))
            setEditEntry(null)
            toast.success('Entry updated')
          }}/>
      )}
      {showBoundaryEditor && (
        <BoundaryEditorModal profile={profile} onClose={()=>setShowBoundaryEditor(false)}/>
      )}
    </div>
  )
}

function AddAttemptModal({ user, profile, structures, onClose, onSave }) {
  const subjects = profile?.subjects || []
  const [form, setForm] = useState({ subject:'', board:'AQA', tier:'N/A', year:2024, paper:1, score:'', maxMarks:'', attemptDate:todayLocalStr() })
  const [autoSpec, setAutoSpec] = useState(null)
  const [autoBoundary, setAutoBoundary] = useState(null)
  // One id per open modal: a double click or a retry after a network error re-saves the SAME
  // attempt document and can never create a second record or a second XP award.
  const attemptIdRef = useRef(null)
  if (!attemptIdRef.current) attemptIdRef.current = 'pa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  const [saving, setSaving] = useState(false)
  const [questionMarks, setQMarks] = useState([])
  const [useQ, setUseQ] = useState(false)
  const [customBoundaries, setCustomBoundaries] = useState([])
  const [useCustom, setUseCustom] = useState(false)

  const selSubjMeta = subjects.find(s=>s.name===form.subject)
  const defaultQual = getSubjectQualification(selSubjMeta, profile)
  // Same reasoning as BoundaryEditorModal: previously formQual was only ever silently derived —
  // if a student had e.g. both an AS-Level and an A-Level entry sharing a subject name, whichever
  // one `.find()` happened to return first decided which paper spec and boundaries got auto-filled,
  // with no way to see or correct it. Now it's shown and overridable, defaulting to the derived value.
  const [levelOverride, setLevelOverride] = useState(null)
  const formQual = levelOverride || defaultQual
  useEffect(() => { setLevelOverride(null) }, [form.subject]) // reset override when subject changes

  useEffect(() => {
    if (!form.subject || !form.board || !form.paper) return
    const subj = subjects.find(s=>s.name===form.subject)
    const tier = subj?.tier||'N/A'
    setForm(f=>({...f,tier}))
    let cancelled = false
    ;(async () => {
      const spec = await getMergedPaperSpec(form.board, form.subject, tier, form.paper, formQual)
      if (cancelled) return
      setAutoSpec(spec)
      if (spec) {
        setForm(f=>({...f, maxMarks: spec.maxMarks || f.maxMarks}))
        if (spec.questions) { setQMarks(spec.questions.map(q=>({...q,scored:0}))); setUseQ(true) }
      }
      const bounds = await getMergedBoundaries(form.board, form.subject, tier, form.year, formQual)
      if (!cancelled) setAutoBoundary(bounds)
    })()
    return () => { cancelled = true }
  }, [form.subject, form.board, form.paper, form.year, formQual])

  const totalScored = questionMarks.reduce((s,q)=>s+parseInt(q.scored||0),0)
  // Boundary sets are usually for the whole subject (e.g. out of 240); show them in this paper's marks.
  const gridBoundary = scaleBoundariesToPaper(autoBoundary, parseInt(form.maxMarks) || autoSpec?.maxMarks || 0)

  async function submit(e) {
    e.preventDefault()
    if (saving) return
    const score   = useQ ? totalScored : parseInt(form.score)
    const max     = parseInt(form.maxMarks)
    const pct     = Math.round((score/max)*100)
    const grades  = autoBoundary?.grades || getGradeOptions(form.subject, formQual, form.tier)
    // A blank custom box means "no boundary for this grade", not a boundary of 0 marks.
    const customSet = customBoundaries.map(b => (b === '' || b == null ? null : Number(b)))
    const bounds  = useCustom ? { boundaries: customSet, maxMarks: max, grades } : autoBoundary
    // Graded by PERCENTAGE of this paper: whole-subject boundaries are converted to the paper's total.
    const { grade, gradeProvenance } = gradePaper({ score, maxMarks: max, boundarySet: bounds, custom: useCustom, year: form.year })
    const subjectKey = buildSubjectKey({ board: form.board, qualification: formQual, subject: form.subject, tier: form.tier })
    setSaving(true)
    try {
      await onSave({ ...form, attemptId: attemptIdRef.current, score, maxMarks:max, percentage:pct, grade, gradeProvenance, qualification:formQual, subjectKey, ...(useCustom ? { customBoundaries: customSet, customBoundariesMax: max, customGrades: grades } : {}), questionMarks: useQ?questionMarks:[], ...(useQ && autoSpec?.questions ? { questionStructure: { source: 'verified', verified: true } } : {}) }, !(useQ && questionMarks.length > 0))
    } catch (err) {
      toast.error('Could not save the paper: ' + (err?.message || 'unknown error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Log paper attempt</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div className="grid-2" style={{gap:10}}>
            <div><label className="label">Subject</label>
              <select className="select" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} required>
                <option value="">Select…</option>
                {subjects.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
              </select></div>
            <div><label className="label">Board</label>
              <select className="select" value={canonicalBoard(form.board)} onChange={e=>setForm(f=>({...f,board:e.target.value}))}>
                <BoardOptions current={form.board} />
              </select></div>
            <div><label className="label">Level</label>
              <select className="select" value={formQual} onChange={e=>setLevelOverride(e.target.value)}>
                {['GCSE','AS-Level','A-Level'].map(l=><option key={l} value={l}>{l}</option>)}
              </select></div>
            {form.subject && isTiered(form.subject) && formQual === 'GCSE' && (
              <div><label className="label">Tier</label>
                <select className="select" value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))}>
                  <option value="Higher">Higher</option><option value="Foundation">Foundation</option>
                </select></div>
            )}
            <div><label className="label">Year</label>
              <select className="select" value={form.year} onChange={e=>setForm(f=>({...f,year:parseInt(e.target.value)}))}>
                {AVAILABLE_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select></div>
            <div><label className="label">Paper</label>
              <select className="select" value={form.paper} onChange={e=>setForm(f=>({...f,paper:parseInt(e.target.value)}))}>
                {[1,2,3,4].map(p=><option key={p} value={p}>Paper {p}</option>)}
              </select></div>
            <div><label className="label">Date attempted</label>
              <input className="input" type="date" value={form.attemptDate} onChange={e=>setForm(f=>({...f,attemptDate:e.target.value}))}/></div>
          </div>

          {/* Auto-filled spec info */}
          {autoSpec && (
            <div style={{padding:'8px 12px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'var(--radius-md)',fontSize:'0.8rem',display:'flex',alignItems:'center',gap:8}}>
              <Check size={14} color="var(--success)"/>
              Auto-filled: {autoSpec.maxMarks} marks · {autoSpec.duration} min
            </div>
          )}

          {/* Grade boundaries — show both marks and % */}
          {(autoBoundary || useCustom) && (
            <div style={{padding:'10px 12px',background:'rgba(34,197,94,0.06)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:'0.8rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontWeight:600}}>
                  Grade boundaries ({form.year}){useCustom?' — custom':' — auto-filled'}
                </span>
                {!useCustom ? (
                  <button type="button" style={{background:'none',border:'none',fontSize:'0.75rem',color:'var(--accent-light)',cursor:'pointer'}}
                    onClick={()=>{setUseCustom(true);setCustomBoundaries((gridBoundary?.boundaries||[]).map(b=>b||''))}}>
                    Edit
                  </button>
                ) : (
                  <button type="button" style={{background:'none',border:'none',fontSize:'0.75rem',color:'var(--text-muted)',cursor:'pointer'}}
                    onClick={()=>setUseCustom(false)}>
                    Reset to auto
                  </button>
                )}
              </div>

              {!useCustom && autoBoundary ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))',gap:4}}>
                  {(autoBoundary.grades || ['9','8','7','6','5','4','3','2','1']).map((g,i)=>{
                    const marks = gridBoundary.boundaries[i]
                    if (marks === null || marks === undefined) return null
                    const pct = Math.round((autoBoundary.boundaries[i] / autoBoundary.maxMarks)*100)
                    return (
                      <div key={g} style={{textAlign:'center',padding:'4px 2px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                        <div style={{fontWeight:800,color:gradeColour(g),fontSize:'0.9rem'}}>{g.startsWith('G') || g.includes('-') || g.includes('*') || /^[A-Z]$/.test(g) ? g : `G${g}`}</div>
                        <div style={{fontSize:'0.72rem',fontWeight:600}}>{marks}/{gridBoundary.maxMarks}</div>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{pct}%</div>
                      </div>
                    )
                  })}
                  {gridBoundary.scaledFrom && (
                    <p style={{gridColumn:'1 / -1',fontSize:'0.72rem',margin:'4px 0 0',color:'var(--text-muted)'}}>
                      These are whole-subject boundaries (out of {gridBoundary.scaledFrom}) converted to this paper (out of {gridBoundary.maxMarks}) by percentage.
                    </p>
                  )}
                  {autoBoundary.provenance && (
                    <p style={{gridColumn:'1 / -1',fontSize:'0.72rem',margin:'4px 0 0',color:autoBoundary.provenance.verified?'var(--text-muted)':'var(--warning)'}}>
                      {autoBoundary.provenance.label}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:6}}>
                    Enter the minimum marks needed for each grade (out of {form.maxMarks||autoSpec?.maxMarks||80}):
                  </p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))',gap:4}}>
                    {(autoBoundary?.grades || getGradeOptions(form.subject, profile?.qualification || 'GCSE', form.tier)).map((g,i)=>(
                      <div key={g} style={{textAlign:'center'}}>
                        <div style={{fontSize:'0.68rem',color:gradeColour(g),fontWeight:700,marginBottom:2}}>{g}</div>
                        <input className="input" type="number" min={0} max={form.maxMarks||80}
                          style={{padding:'3px',textAlign:'center',fontSize:'0.75rem'}}
                          value={customBoundaries[i]||''} onChange={e=>{const b=[...customBoundaries];b[i]=e.target.value;setCustomBoundaries(b)}}/>
                        {customBoundaries[i] && form.maxMarks && (
                          <div style={{fontSize:'0.62rem',color:'var(--text-muted)',marginTop:1}}>
                            {Math.round((parseInt(customBoundaries[i])/(parseInt(form.maxMarks)||80))*100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score entry */}
          {useQ && questionMarks.length > 0 ? (
            <div style={{background:'var(--bg-surface)',padding:12,borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:'0.875rem'}}>
                <span style={{fontWeight:600}}>Marks per question{autoSpec?.questions ? <span style={{marginLeft:8,fontSize:'0.72rem',fontWeight:600,color:'var(--success)'}}>Verified structure</span> : null}</span>
                <span style={{color:'var(--accent-light)',fontWeight:700}}>{totalScored}/{form.maxMarks||autoSpec?.maxMarks}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(72px,1fr))',gap:6}}>
                {questionMarks.map((q,i)=>(
                  <div key={i} style={{textAlign:'center'}}>
                    <div style={{fontSize:'0.68rem',color:'var(--text-muted)',marginBottom:2}}>Q{q.num} /{q.marks}</div>
                    <input className="input" type="number" min={0} max={q.marks} value={q.scored}
                      onChange={e=>setQMarks(qs=>qs.map((qx,j)=>j===i?{...qx,scored:Math.min(parseInt(e.target.value)||0,qx.marks)}:qx))}
                      style={{textAlign:'center',padding:'4px',fontSize:'0.85rem'}}/>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={()=>setUseQ(false)}>Enter total score instead</button>
            </div>
          ) : (
            <div className="grid-2" style={{gap:10}}>
              <div><label className="label">Score</label>
                <input className="input" type="number" min={0} value={form.score} onChange={e=>setForm(f=>({...f,score:e.target.value}))} required={!useQ}/></div>
              <div><label className="label">Max marks{autoSpec?<span style={{color:'var(--success)',marginLeft:4,fontSize:'0.75rem'}}>auto-filled</span>:null}</label>
                <input className="input" type="number" min={1} value={form.maxMarks} onChange={e=>setForm(f=>({...f,maxMarks:e.target.value}))} required/></div>
            </div>
          )}

          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save paper'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Break a logged paper down by question. The student describes how the paper's marks are split
// (e.g. 5 questions of 4 marks), then enters what they scored on each. Nothing is assumed: the split
// must add up to the paper's real total, the scores must add up to the score already logged, and
// the result is saved as student-entered - never presented as an official paper structure.
function QuestionMarksModal({ attempt, user, profile, onClose, onSave }) {
  const existing = attempt.questionMarks?.length ? attempt.questionMarks : null
  const [step, setStep] = useState(existing ? 'scores' : 'structure')
  const [groups, setGroups] = useState([{ count: '', marks: '' }])
  const [questions, setQuestions] = useState(existing || [])
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)
  const [topicNames, setTopicNames] = useState([])
  const qualification = attempt.qualification || 'GCSE'
  const maxMarks = Number(attempt.maxMarks)

  // Topics for THIS subject in the student's current course, so a question can be tied to a real topic.
  useEffect(() => {
    let cancelled = false
    getTopicsWithConfidence(user.uid, profile).then(ts => {
      if (cancelled) return
      setTopicNames([...new Set(ts.filter(t => t.subjectId === attempt.subject).map(t => t.name))].sort())
    }).catch(() => {})
    return () => { cancelled = true }
  }, [user.uid, attempt.subject]) // eslint-disable-line react-hooks/exhaustive-deps

  const parsed = groups.map(g => ({ count: Number(g.count), marks: Number(g.marks) }))
  const planned = distributionTotal(parsed)
  const scoreCheck = validateScores(questions, { score: attempt.score })

  function continueToScores() {
    const v = validateDistribution(parsed, { maxMarks, qualification, subject: attempt.subject })
    setErrors(v.errors)
    if (!v.ok) return
    setQuestions(buildQuestions(parsed))
    setStep('scores')
  }

  async function save() {
    const v = validateScores(questions, { score: attempt.score })
    setErrors(v.errors)
    if (!v.ok || saving) return
    setSaving(true)
    try { await onSave(questions.map(q => ({ num: q.num, marks: q.marks, scored: Number(q.scored), topic: q.topic || '' }))) }
    catch (err) { setErrors(['Could not save: ' + (err?.message || 'unknown error')]); setSaving(false) }
  }

  const setGroup = (i, key, val) => setGroups(gs => gs.map((g, j) => j === i ? { ...g, [key]: val } : g))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:600}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Question breakdown</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <p style={{marginBottom:14,fontSize:'0.875rem'}}>
          {attempt.subject} paper {attempt.paper}: {attempt.score}/{attempt.maxMarks}. Add the questions to see where marks were lost. You can skip this and add it later.
        </p>

        {step === 'structure' && (
          <>
            <p style={{fontSize:'0.82rem',color:'var(--text-secondary)',marginBottom:8}}>
              How are the {maxMarks} marks split? For example 5 questions of 4 marks, then 1 question of 6 marks.
            </p>
            {groups.map((g, i) => (
              <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                <input className="input" type="number" min={1} max={MAX_QUESTIONS} placeholder="How many" value={g.count} onChange={e=>setGroup(i,'count',e.target.value)} style={{width:110}}/>
                <span style={{fontSize:'0.85rem'}}>questions of</span>
                <input className="input" type="number" min={1} placeholder="Marks each" value={g.marks} onChange={e=>setGroup(i,'marks',e.target.value)} style={{width:110}}/>
                <span style={{fontSize:'0.85rem'}}>marks</span>
                {groups.length > 1 && <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={()=>setGroups(gs=>gs.filter((_,j)=>j!==i))} title="Remove group"><X size={14}/></button>}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setGroups(gs=>[...gs,{count:'',marks:''}])}>Add another group</button>
            <p style={{margin:'10px 0',fontSize:'0.85rem',fontWeight:600,color:planned===maxMarks?'var(--success)':'var(--text-secondary)'}}>
              {planned} of {maxMarks} marks accounted for
            </p>
          </>
        )}

        {step === 'scores' && (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8,maxHeight:320,overflowY:'auto',marginBottom:12}}>
              {questions.map((q,i)=>(
                <div key={q.num} style={{padding:8,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:4}}>Q{q.num}</div>
                  <div style={{display:'flex',gap:4,alignItems:'center',marginBottom:4}}>
                    <input className="input" type="number" min={0} max={q.marks} value={q.scored}
                      onChange={e=>setQuestions(qs=>qs.map((x,j)=>j===i?{...x,scored:e.target.value===''?'':Math.min(Number(e.target.value),x.marks)}:x))}
                      style={{flex:1,padding:'3px',textAlign:'center',fontSize:'0.82rem'}}/>
                    <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>/{q.marks}</span>
                  </div>
                  {topicNames.length>0 ? (
                    <select className="select" value={q.topic||''} onChange={e=>setQuestions(qs=>qs.map((x,j)=>j===i?{...x,topic:e.target.value}:x))} style={{fontSize:'0.72rem',padding:'3px 6px'}}>
                      <option value="">No topic</option>
                      {topicNames.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input className="input" placeholder="Topic (optional)" value={q.topic||''}
                      onChange={e=>setQuestions(qs=>qs.map((x,j)=>j===i?{...x,topic:e.target.value}:x))} style={{fontSize:'0.72rem',padding:'3px 6px'}}/>
                  )}
                </div>
              ))}
            </div>
            <p style={{margin:'0 0 10px',fontSize:'0.85rem',fontWeight:600,color:scoreCheck.ok?'var(--success)':'var(--text-secondary)'}}>
              {scoreCheck.total} of {attempt.score} marks entered
            </p>
          </>
        )}

        {errors.length > 0 && (
          <ul style={{margin:'0 0 12px',paddingLeft:18,fontSize:'0.8rem',color:'var(--danger)'}}>
            {errors.map((e,i)=><li key={i}>{e}</li>)}
          </ul>
        )}
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={onClose}>Skip for now</button>
          {step === 'scores' && !existing && <button className="btn btn-secondary" onClick={()=>{setErrors([]);setStep('structure')}}>Back</button>}
          {step === 'structure'
            ? <button className="btn btn-primary" onClick={continueToScores}>Continue</button>
            : <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save question marks'}</button>}
        </div>
      </div>
    </div>
  )
}

function BoundaryEditorModal({ profile, onClose }) {
  const subjects = profile?.subjects || []
  const [selSubj, setSelSubj] = useState(subjects[0]?.name||'')
  const [selBoard, setSelBoard] = useState(subjects[0]?.board||'AQA')
  const [selYear, setSelYear] = useState(2024)

  const selSubjMeta = subjects.find(s=>s.name===selSubj)
  const defaultQual = getSubjectQualification(selSubjMeta, profile)
  // Level defaults from the subject's own stored qualification but is separately overridable —
  // a student can have e.g. "Chemistry" saved as A-Level while wanting to sanity-check what the
  // AS-Level boundary looked like, and previously there was no way to see or change this at all;
  // it was silently baked into selSubjMeta with no UI control, same underlying issue as selBoard.
  const [selLevel, setSelLevel] = useState(defaultQual)
  useEffect(() => { setSelLevel(defaultQual) }, [selSubj]) // eslint-disable-line react-hooks/exhaustive-deps

  const selTier = selLevel === 'GCSE' ? (selSubjMeta?.tier || 'Higher') : 'N/A'
  const [bounds, setBounds] = useState(null)
  useEffect(() => {
    let cancelled = false
    getMergedBoundaries(selBoard, selSubj, selTier, selYear, selLevel).then(b => { if (!cancelled) setBounds(b) })
    return () => { cancelled = true }
  }, [selBoard, selSubj, selTier, selYear, selLevel])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Grade boundaries reference</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="grid-2" style={{gap:10,marginBottom:16}}>
          <div><label className="label">Subject</label>
            <select className="select" value={selSubj} onChange={e=>setSelSubj(e.target.value)}>
              {subjects.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
            </select></div>
          <div><label className="label">Board</label>
            <select className="select" value={canonicalBoard(selBoard)} onChange={e=>setSelBoard(e.target.value)}>
              <BoardOptions current={selBoard} />
            </select></div>
          <div><label className="label">Level</label>
            <select className="select" value={selLevel} onChange={e=>setSelLevel(e.target.value)}>
              {['GCSE','AS-Level','A-Level'].map(l=><option key={l} value={l}>{l}</option>)}
            </select></div>
          <div><label className="label">Year</label>
            <select className="select" value={selYear} onChange={e=>setSelYear(parseInt(e.target.value))}>
              {AVAILABLE_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select></div>
        </div>
        {bounds ? (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,flexWrap:'wrap'}}>
              <span className="badge badge-accent">{selLevel}</span>
              <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Total marks: {bounds.maxMarks}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))',gap:6,textAlign:'center'}}>
              {(bounds.grades || ['9','8','7','6','5','4','3','2','1']).map((g,i)=>(
                <div key={g} style={{padding:8,background:'rgba(34,197,94,0.08)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                  <div style={{fontWeight:800,color:gradeColour(g),fontSize:'1.1rem'}}>{g}</div>
                  <div style={{fontSize:'0.75rem',marginTop:2}}>{bounds.boundaries[i]??'–'}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:12}}>
              {bounds.provenance?.label || 'Boundary source not recorded'}
              {bounds.note ? ` (${bounds.note.replace('~','approx. ')})` : ''}.
              {bounds.provenance && !bounds.provenance.verified ? ' Treat these as estimates, not official boundaries.' : ''}
            </p>
          </div>
        ) : (
          <div className="empty-state" style={{padding:'24px 0'}}><p>No boundary data found for {boardLabel(selBoard)} {selSubj} at {selLevel}{selTier!=='N/A'?` (${selTier})`:''}.</p></div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Entry Modal ──────────────────────────────────────────────────────────
function EditEntryModal({ attempt, onClose, onSave }) {
  const [form, setForm] = useState({
    score:       attempt.score || 0,
    maxMarks:    attempt.maxMarks || 80,
    year:        attempt.year || 2024,
    attemptDate: attempt.attemptDate || '',
    notes:       attempt.notes || '',
  })

  function submit(e) {
    e.preventDefault()
    const score      = parseInt(form.score)
    const maxMarks   = parseInt(form.maxMarks)
    const percentage = Math.round((score / maxMarks) * 100)
    onSave({ ...form, score, maxMarks, percentage })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            Edit entry — {attempt.subject} ({attempt.qualification||'GCSE'}) P{attempt.paper} {attempt.year}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
          <div className="grid-2" style={{gap:10}}>
            <div>
              <label className="label">Score</label>
              <input className="input" type="number" min={0} max={form.maxMarks}
                value={form.score} onChange={e=>setForm(f=>({...f,score:e.target.value}))} required/>
            </div>
            <div>
              <label className="label">Max marks</label>
              <input className="input" type="number" min={1}
                value={form.maxMarks} onChange={e=>setForm(f=>({...f,maxMarks:e.target.value}))} required/>
            </div>
            <div>
              <label className="label">Year (paper year)</label>
              <select className="select" value={form.year} onChange={e=>setForm(f=>({...f,year:parseInt(e.target.value)}))}>
                {[2024,2023,2022,2021,2020,2019,2018,2017].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date attempted</label>
              <input className="input" type="date" value={form.attemptDate}
                onChange={e=>setForm(f=>({...f,attemptDate:e.target.value}))}/>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="textarea" style={{minHeight:55}} value={form.notes}
              onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
              placeholder="Topics to revisit, things that went well…"/>
          </div>
          {form.score && form.maxMarks && (
            <div style={{padding:'6px 12px',background:'rgba(34,197,94,0.08)',borderRadius:'var(--radius-md)',fontSize:'0.82rem'}}>
              {Math.round((form.score/form.maxMarks)*100)}% — this will update the percentage. The grade will remain unless the paper had grade boundaries set during entry.
            </div>
          )}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
