// src/pages/PastPapers.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { savePaperAttempt, getPaperAttempts, getPaperStructures, submitPaperStructure, deletePaperAttempt, updatePaperAttempt } from '../utils/firestore'
import { collection } from 'firebase/firestore'
import { db } from '../firebase'
import { analyseWeaknesses } from '../utils/ai'
import { gradeColour } from '../utils/calendar'
import { getPaperSpec, getBoundaries, calculateGradeFromBoundaries, AVAILABLE_YEARS, GRADE_BOUNDARIES } from '../data/paperDatabase'
import { isTiered } from '../data/examDates2026'
import { SUBJECT_COLOURS, getGradeOptions, getSubjectQualification } from '../data/subjects'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Plus, X, Brain, TrendingUp, FileText, Trash2, Edit2, Check } from 'lucide-react'

export default function PastPapers() {
  const { user, profile } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [structures, setStructures] = useState([])
  const [selSubject, setSelSubject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showQPrompt, setShowQPrompt] = useState(null)  // attempt to enter question marks for
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

  async function handleDelete(id) {
    await deletePaperAttempt(user.uid, id)
    setAttempts(a=>a.filter(x=>x.id!==id))
    toast.success('Paper deleted (-100 XP)')
  }

  async function handleBulkDelete() {
    await Promise.all(selected.map(id=>deletePaperAttempt(user.uid, id)))
    setAttempts(a=>a.filter(x=>!selected.includes(x.id)))
    setSelected([])
    toast.success(`Deleted ${selected.length} paper${selected.length!==1?'s':''} (-${selected.length*100} XP)`)
  }

  async function handleAnalyse() {
    setAiLoading(true)
    const res = await analyseWeaknesses(attempts, selSubject)
    setAiAnalysis(res.text||res.error||'')
    setAiLoading(false)
  }

  // Legacy attempts (logged before qualification was tagged) have no `.qualification` field —
  // treated as belonging to whatever's currently selected, since we can't know retroactively and
  // hiding them would look like data loss. Once tagged, an attempt only counts for a subject if
  // its qualification actually matches that subject's current one — otherwise switching from GCSE
  // to A-Level (or AS-Level to A-Level) would keep blending old grades into the new average.
  function matchesCurrentQualification(attempt, subjectName) {
    const subjMeta = profile?.subjects?.find(s => s.name === subjectName)
    const subjQual = getSubjectQualification(subjMeta, profile)
    return !attempt.qualification || attempt.qualification === subjQual
  }

  const filtered = (selSubject ? attempts.filter(a=>a.subject===selSubject && matchesCurrentQualification(a, selSubject)) : [...attempts])
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const map = {
        subject: [a.subject, b.subject],
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
    const sub = attempts.filter(a=>a.subject===s && matchesCurrentQualification(a, s))
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
            {t==='attempts'?'Attempts':t==='progress'?'Progress':'AI Analysis'}
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
                    <tr key={a.id} style={{background:selected.includes(a.id)?'rgba(124,58,237,0.08)':undefined}}>
                      <td><input type="checkbox" checked={selected.includes(a.id)} onChange={()=>toggleSelect(a.id)} style={{accentColor:'var(--accent)'}}/></td>
                      <td><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:7,height:7,borderRadius:'50%',background:SUBJECT_COLOURS[a.subject]||'var(--accent)',flexShrink:0}}/>{a.subject}</div></td>
                      <td>P{a.paper}</td>
                      <td>{a.board}</td>
                      <td>{a.year}</td>
                      <td>{a.score}/{a.maxMarks}</td>
                      <td>{a.percentage}%</td>
                      <td><span style={{fontWeight:800,color:gradeColour(a.grade||''),fontSize:'1rem'}}>{a.grade||'–'}</span></td>
                      <td style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{a.attemptDate||'–'}</td>
                      <td style={{display:'flex',gap:4}}>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--accent-light)'}} onClick={()=>setEditEntry(a)} title="Edit"><Edit2 size={13}/></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(a.id)} title="Delete"><Trash2 size={14}/></button>
                      </td>
                    </tr>
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
            <h4 style={{display:'flex',alignItems:'center',gap:8}}><Brain size={18} color="var(--accent-light)"/> AI Analysis</h4>
            <button className="btn btn-primary btn-sm" onClick={handleAnalyse} disabled={aiLoading||filtered.length===0}>
              {aiLoading?'Analysing…':'Analyse'}
            </button>
          </div>
          {filtered.length===0&&<p>Log at least one paper to get AI analysis.</p>}
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
            toast.success('Paper logged! +100 XP')
            if(promptQ) setShowQPrompt({...a, id})
          }}/>
      )}

      {showQPrompt && (
        <QuestionMarksModal attempt={showQPrompt} user={user}
          onClose={()=>setShowQPrompt(null)}
          onSave={async()=>{setShowQPrompt(null);toast.success('Question marks saved')}}/>
      )}

      {editEntry && (
        <EditEntryModal
          attempt={editEntry}
          onClose={()=>setEditEntry(null)}
          onSave={async (updated) => {
            await updatePaperAttempt(user.uid, editEntry.id, updated)
            setAttempts(a => a.map(x => x.id === editEntry.id ? {...x, ...updated} : x))
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
  const [form, setForm] = useState({ subject:'', board:'AQA', tier:'N/A', year:2024, paper:1, score:'', maxMarks:'', attemptDate:new Date().toISOString().slice(0,10) })
  const [autoSpec, setAutoSpec] = useState(null)
  const [autoBoundary, setAutoBoundary] = useState(null)
  const [questionMarks, setQMarks] = useState([])
  const [useQ, setUseQ] = useState(false)
  const [customBoundaries, setCustomBoundaries] = useState([])
  const [useCustom, setUseCustom] = useState(false)

  const selSubjMeta = subjects.find(s=>s.name===form.subject)
  const formQual = getSubjectQualification(selSubjMeta, profile)

  useEffect(() => {
    if (!form.subject || !form.board || !form.paper) return
    const subj = subjects.find(s=>s.name===form.subject)
    const tier = subj?.tier||'N/A'
    const subjQual = getSubjectQualification(subj, profile)
    setForm(f=>({...f,tier}))
    const spec = getPaperSpec(form.board, form.subject, tier, form.paper, subjQual)
    setAutoSpec(spec)
    if (spec) {
      setForm(f=>({...f, maxMarks: spec.maxMarks || f.maxMarks}))
      if (spec.questions) { setQMarks(spec.questions.map(q=>({...q,scored:0}))); setUseQ(true) }
    }
    const bounds = getBoundaries(form.board, form.subject, tier, form.year, subjQual)
    setAutoBoundary(bounds)
  }, [form.subject, form.board, form.paper, form.year])

  const totalScored = questionMarks.reduce((s,q)=>s+parseInt(q.scored||0),0)

  async function submit(e) {
    e.preventDefault()
    const score   = useQ ? totalScored : parseInt(form.score)
    const max     = parseInt(form.maxMarks)
    const pct     = Math.round((score/max)*100)
    const grades  = autoBoundary?.grades || getGradeOptions(form.subject, formQual, form.tier)
    const bounds  = useCustom ? { boundaries:customBoundaries.map(Number), maxMarks:max, grades } : autoBoundary
    const grade   = bounds ? calculateGradeFromBoundaries(score, bounds) : null
    await onSave({ ...form, score, maxMarks:max, percentage:pct, grade, qualification:formQual, questionMarks: useQ?questionMarks:[] }, !!autoSpec?.questions)
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
              <select className="select" value={form.board} onChange={e=>setForm(f=>({...f,board:e.target.value}))}>
                {['AQA','Edexcel','OCR','WJEC','CCEA'].map(b=><option key={b} value={b}>{b}</option>)}
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
            <div style={{padding:'10px 12px',background:'rgba(124,58,237,0.06)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',fontSize:'0.8rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontWeight:600}}>
                  Grade boundaries ({form.year}){useCustom?' — custom':' — auto-filled'}
                </span>
                {!useCustom ? (
                  <button type="button" style={{background:'none',border:'none',fontSize:'0.75rem',color:'var(--accent-light)',cursor:'pointer'}}
                    onClick={()=>{setUseCustom(true);setCustomBoundaries((autoBoundary?.boundaries||[]).map(b=>b||''))}}>
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
                    const marks = autoBoundary.boundaries[i]
                    if (marks === null || marks === undefined) return null
                    const pct = Math.round((marks / autoBoundary.maxMarks)*100)
                    return (
                      <div key={g} style={{textAlign:'center',padding:'4px 2px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                        <div style={{fontWeight:800,color:gradeColour(g),fontSize:'0.9rem'}}>{g.startsWith('G') || g.includes('-') || g.includes('*') || /^[A-Z]$/.test(g) ? g : `G${g}`}</div>
                        <div style={{fontSize:'0.72rem',fontWeight:600}}>{marks}/{autoBoundary.maxMarks}</div>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{pct}%</div>
                      </div>
                    )
                  })}
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
                <span style={{fontWeight:600}}>Marks per question</span>
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
            <button type="submit" className="btn btn-primary">Save paper</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QuestionMarksModal({ attempt, user, onClose, onSave }) {
  const [marks, setMarks] = useState(
    Array.from({length:20},(_,i)=>({num:i+1,marks:3,scored:0,topic:''}))
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Enter marks per question</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <p style={{marginBottom:14,fontSize:'0.875rem'}}>Track your performance per question to identify weak topics. You can do this now or skip and do it later.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8,maxHeight:300,overflowY:'auto',marginBottom:16}}>
          {marks.map((q,i)=>(
            <div key={i} style={{padding:8,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
              <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:4}}>Q{q.num}</div>
              <div style={{display:'flex',gap:4,alignItems:'center',marginBottom:4}}>
                <input className="input" type="number" min={0} max={q.marks} value={q.scored}
                  onChange={e=>setMarks(ms=>ms.map((m,j)=>j===i?{...m,scored:parseInt(e.target.value)||0}:m))}
                  style={{flex:1,padding:'3px',textAlign:'center',fontSize:'0.82rem'}}/>
                <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>/{q.marks}</span>
              </div>
              <input className="input" placeholder="Topic" value={q.topic}
                onChange={e=>setMarks(ms=>ms.map((m,j)=>j===i?{...m,topic:e.target.value}:m))}
                style={{fontSize:'0.75rem',padding:'3px 6px'}}/>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={onClose}>Skip for now</button>
          <button className="btn btn-primary" onClick={()=>onSave(marks)}>Save question marks</button>
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
  const selQual = getSubjectQualification(selSubjMeta, profile)
  const selTier = selQual === 'GCSE' ? (selSubjMeta?.tier || 'Higher') : 'N/A'
  const bounds = getBoundaries(selBoard, selSubj, selTier, selYear, selQual)

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
          <div><label className="label">Year</label>
            <select className="select" value={selYear} onChange={e=>setSelYear(parseInt(e.target.value))}>
              {AVAILABLE_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select></div>
        </div>
        {bounds ? (
          <div>
            <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:10}}>Total marks: {bounds.maxMarks}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))',gap:6,textAlign:'center'}}>
              {(bounds.grades || ['9','8','7','6','5','4','3','2','1']).map((g,i)=>(
                <div key={g} style={{padding:8,background:'rgba(124,58,237,0.08)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                  <div style={{fontWeight:800,color:gradeColour(g),fontSize:'1.1rem'}}>{g}</div>
                  <div style={{fontSize:'0.75rem',marginTop:2}}>{bounds.boundaries[i]??'–'}</div>
                </div>
              ))}
            </div>
            <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:12}}>Historical boundaries from real AQA results. 2026 boundaries will be published after results day in August.</p>
          </div>
        ) : (
          <div className="empty-state" style={{padding:'24px 0'}}><p>No boundary data found for this combination.</p></div>
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
            Edit entry — {attempt.subject} P{attempt.paper} {attempt.year}
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
            <div style={{padding:'6px 12px',background:'rgba(124,58,237,0.08)',borderRadius:'var(--radius-md)',fontSize:'0.82rem'}}>
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
