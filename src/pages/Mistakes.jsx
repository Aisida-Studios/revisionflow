// src/pages/Mistakes.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { addMistake, getMistakes, resolveMistake } from '../utils/firestore'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { SUBJECT_COLOURS } from '../data/subjects'
import toast from 'react-hot-toast'
import MathSymbolToolbar from '../components/MathSymbolToolbar'
import { Plus, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'

export default function Mistakes() {
  const { user, profile } = useAuth()
  const [mistakes, setMistakes] = useState([])
  const [filter, setFilter] = useState({ subject:'', resolved:false })
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({ subject:'', topic:'', description:'', source:'', priority:'medium' })
  const descriptionRef = useRef(null)

  const subjects = profile?.subjects?.map(s=>s.name)||[]

  useEffect(() => { if(user) getMistakes(user.uid, filter.subject||null).then(setMistakes) }, [user, filter.subject])

  async function handleAdd() {
    if (!form.subject||!form.description) return
    await addMistake(user.uid, form)
    await getMistakes(user.uid, null).then(setMistakes)
    setForm({ subject:'', topic:'', description:'', source:'', priority:'medium' })
    setShowAdd(false)
    toast.success('Mistake logged +15 XP')
  }

  async function handleResolve(id) {
    await resolveMistake(user.uid, id)
    setMistakes(ms=>ms.map(m=>m.id===id?{...m,resolved:true}:m))
    toast.success('Resolved ✓')
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db,'users',user.uid,'mistakes',id))
    setMistakes(ms=>ms.filter(m=>m.id!==id))
  }

  async function handleBulkDelete() {
    await Promise.all(selected.map(id=>deleteDoc(doc(db,'users',user.uid,'mistakes',id))))
    setMistakes(ms=>ms.filter(m=>!selected.includes(m.id)))
    setSelected([])
    toast.success(`Deleted ${selected.length} mistake${selected.length!==1?'s':''}`)
  }

  function toggleSelect(id) { setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]) }

  const visible = mistakes.filter(m=>filter.resolved?true:!m.resolved)
  const pCol = p=>p==='high'?'var(--danger)':p==='medium'?'var(--warning)':'var(--info)'

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h2>Mistake Log</h2><p>Track errors to avoid repeating them</p></div>
        <div style={{display:'flex',gap:8}}>
          {selected.length>0&&<button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><Trash2 size={14}/> Delete {selected.length}</button>}
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={14}/> Log mistake</button>
        </div>
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16,alignItems:'center'}}>
        <button className={`btn btn-sm ${!filter.subject?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f=>({...f,subject:''}))}>All</button>
        {subjects.map(s=><button key={s} className={`btn btn-sm ${filter.subject===s?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f=>({...f,subject:s}))}>{s}</button>)}
        <label style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.875rem',cursor:'pointer',marginLeft:'auto'}}>
          <input type="checkbox" checked={filter.resolved} onChange={e=>setFilter(f=>({...f,resolved:e.target.checked}))} style={{accentColor:'var(--accent)'}}/>
          Show resolved
        </label>
      </div>

      <div className="grid-3" style={{marginBottom:16}}>
        {[{l:'Total',v:mistakes.length,c:'var(--accent-light)'},{l:'Unresolved',v:mistakes.filter(m=>!m.resolved).length,c:'var(--danger)'},{l:'Resolved',v:mistakes.filter(m=>m.resolved).length,c:'var(--success)'}].map(s=>(
          <div key={s.l} className="card stat-card">
            <div style={{fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase'}}>{s.l}</div>
            <div style={{fontSize:'2rem',fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {visible.length===0 ? (
        <div className="empty-state"><AlertCircle size={40} style={{opacity:0.3}}/><h4>No mistakes logged</h4><button className="btn btn-primary" onClick={()=>setShowAdd(true)}>Log first mistake</button></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {visible.map(m=>(
            <div key={m.id} className="card" style={{opacity:m.resolved?0.6:1,borderLeft:`3px solid ${pCol(m.priority)}`}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                <div style={{display:'flex',gap:8,alignItems:'flex-start',flex:1}}>
                  <input type="checkbox" checked={selected.includes(m.id)} onChange={()=>toggleSelect(m.id)}
                    style={{width:15,height:15,accentColor:'var(--accent)',marginTop:3,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5,flexWrap:'wrap'}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:SUBJECT_COLOURS[m.subject]||'var(--accent)',flexShrink:0}}/>
                      <span style={{fontWeight:600,fontSize:'0.875rem'}}>{m.subject}</span>
                      {m.topic&&<span className="badge badge-grey">{m.topic}</span>}
                      <span className={`badge badge-${m.priority==='high'?'red':m.priority==='medium'?'amber':'blue'}`}>{m.priority}</span>
                      {m.resolved&&<span className="badge badge-green">Resolved</span>}
                    </div>
                    <p style={{fontSize:'0.875rem',color:'var(--text-primary)',lineHeight:1.6,marginBottom:m.source?4:0}}>{m.description}</p>
                    {m.source&&<p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Source: {m.source}</p>}
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  {!m.resolved&&<button className="btn btn-secondary btn-sm" onClick={()=>handleResolve(m.id)}><CheckCircle2 size={13}/> Resolve</button>}
                  <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(m.id)}><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Log a mistake</span><button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}><X size={18}/></button></div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="grid-2" style={{gap:10}}>
                <div><label className="label">Subject</label>
                  <select className="select" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} required>
                    <option value="">Select…</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                  </select></div>
                <div><label className="label">Topic</label><input className="input" placeholder="e.g. Integration" value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))}/></div>
              </div>
              <div><label className="label">What went wrong?</label><textarea ref={descriptionRef} className="textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the mistake and correct approach…" required/>
                <MathSymbolToolbar fieldRef={descriptionRef} value={form.description} onChange={val=>setForm(f=>({...f,description:val}))} />
              </div>
              <div className="grid-2" style={{gap:10}}>
                <div><label className="label">Source</label><input className="input" placeholder="e.g. AQA 2023 P2 Q5" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}/></div>
                <div><label className="label">Priority</label>
                  <select className="select" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                    {['high','medium','low'].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select></div>
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd} disabled={!form.subject||!form.description}>Log mistake</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
