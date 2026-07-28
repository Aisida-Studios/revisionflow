// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  addTask, getTasks, completeTask, deleteTask,
  getSessions, completeSession, getMistakes, resolveMistake,
} from '../utils/firestore'
import toast from 'react-hot-toast'
import { Plus, X, CheckSquare, Square, Trash2, Calendar, AlertTriangle, ExternalLink } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'

export default function Tasks() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tasks,    setTasks]    = useState([])
  const [sessions, setSessions] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title:'', subject:'', startDate:'', dueDate:'', priority:'medium', notes:'' })
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState([])

  const subjects = profile?.subjects?.map(s=>s.name)||[]

  function loadAll() {
    if (!user) return
    getTasks(user.uid).then(setTasks)
    getSessions(user.uid).then(setSessions)
    getMistakes(user.uid).then(setMistakes)
  }
  useEffect(loadAll, [user])

  // Auto-populated tasks, built fresh from calendar sessions and unresolved past-paper mistakes
  // every render rather than persisted as their own task docs — that keeps them always in sync
  // with the real session/mistake and avoids a second, driftable copy of the same data. Completing
  // one calls straight through to completeSession/resolveMistake (the same functions Calendar.jsx
  // and Mistakes.jsx themselves use), so it updates the real record — reflected consistently on
  // those pages too, not just here — and XP is awarded exactly the way it already is everywhere
  // else in the app (both functions call awardXP internally, which is what triggers the existing
  // XP toast — nothing new needed for that part).
  const sessionTasks = sessions
    .filter(s => !s.completed)
    .map(s => ({
      id:       'session-' + s.id,
      title:    s.title || (s.subject + (s.paper ? ' — Paper ' + s.paper : '') + ' revision'),
      subject:  s.subject,
      dueDate:  s.date || null,
      priority: s.isEmergency ? 'high' : 'medium',
      notes:    '',
      completed: false,
      auto:     true,
      source:   'session',
      sourceId: s.id,
      link:     '/calendar',
      linkLabel: 'View in Calendar',
    }))

  const mistakeTasks = mistakes
    .filter(m => !m.resolved)
    .map(m => ({
      id:       'mistake-' + m.id,
      title:    'Fix mistake: ' + (m.topic || m.subject || 'Untitled'),
      subject:  m.subject,
      dueDate:  null, // mistakes aren't date-bound the way sessions are — left unclassified rather than given a fake due date
      priority: m.priority || 'medium',
      notes:    m.description || '',
      completed: false,
      auto:     true,
      source:   'mistake',
      sourceId: m.id,
      link:     '/mistakes',
      linkLabel: 'View in Mistakes',
    }))

  const allTasks = [...tasks, ...sessionTasks, ...mistakeTasks]

  async function handleAdd(e) {
    e.preventDefault()
    await addTask(user.uid, form)
    getTasks(user.uid).then(setTasks)
    setForm({ title:'', subject:'', startDate:'', dueDate:'', priority:'medium', notes:'' })
    setShowAdd(false)
    toast.success('Task added')
  }

  async function handleToggle(task) {
    if (task.auto && task.source === 'session') {
      await completeSession(user.uid, task.sourceId)
      setSessions(ss => ss.map(s => s.id === task.sourceId ? { ...s, completed: true } : s))
      toast.success('Session done! ✓')
      return
    }
    if (task.auto && task.source === 'mistake') {
      await resolveMistake(user.uid, task.sourceId)
      setMistakes(ms => ms.map(m => m.id === task.sourceId ? { ...m, resolved: true } : m))
      toast.success('Mistake resolved! ✓')
      return
    }
    await completeTask(user.uid, task.id, !task.completed)
    setTasks(ts=>ts.map(t=>t.id===task.id?{...t,completed:!t.completed}:t))
    if (!task.completed) toast.success('Task done! ✓')
  }

  async function handleDelete(id) {
    await deleteTask(user.uid, id)
    setTasks(ts=>ts.filter(t=>t.id!==id))
  }

  async function handleBulkDelete() {
    // Auto tasks can't be bulk-deleted (nothing to delete — they're a view of a session/mistake
    // that lives on its own page), so only real task ids that were actually selected go through.
    const realIds = selected.filter(id => tasks.some(t => t.id === id))
    await Promise.all(realIds.map(id=>deleteTask(user.uid, id)))
    setTasks(ts=>ts.filter(t=>!realIds.includes(t.id)))
    setSelected([])
    toast.success(`Deleted ${realIds.length} task${realIds.length!==1?'s':''}`)
  }

  function toggleSelect(id) { setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]) }

  const visible = allTasks.filter(t=>filter==='all'?true:filter==='pending'?!t.completed:t.completed)
  const overdue = visible.filter(t=>t.dueDate&&isPast(new Date(t.dueDate))&&!isToday(new Date(t.dueDate))&&!t.completed)
  const dueSoon = visible.filter(t=>t.dueDate&&isToday(new Date(t.dueDate))&&!t.completed)
  const rest    = visible.filter(t=>!overdue.includes(t)&&!dueSoon.includes(t))

  const TaskItem = ({task}) => (
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 14px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:`1px solid ${task.completed?'var(--border)':isPast(new Date(task.dueDate||'9999'))&&!isToday(new Date(task.dueDate||'9999'))&&!task.completed?'rgba(239,68,68,0.3)':'var(--border)'}`,opacity:task.completed?0.6:1}}>
      {!task.auto && (
        <input type="checkbox" checked={selected.includes(task.id)} onChange={()=>toggleSelect(task.id)}
          style={{width:15,height:15,accentColor:'var(--accent)',marginTop:2,flexShrink:0}}/>
      )}
      <button className="btn btn-ghost btn-icon" style={{flexShrink:0,padding:2}} onClick={()=>handleToggle(task)}>
        {task.completed?<CheckSquare size={17} color="var(--success)"/>:<Square size={17}/>}
      </button>
      <div style={{flex:1,overflow:'hidden'}}>
        <div style={{fontWeight:600,fontSize:'0.875rem',textDecoration:task.completed?'line-through':'none'}}>{task.title}</div>
        <div style={{display:'flex',gap:5,marginTop:3,flexWrap:'wrap',alignItems:'center'}}>
          {task.auto && task.source==='session' && (
            <span className="badge badge-blue" style={{fontSize:'0.68rem'}}><Calendar size={10}/> Calendar</span>
          )}
          {task.auto && task.source==='mistake' && (
            <span className="badge badge-red" style={{fontSize:'0.68rem'}}><AlertTriangle size={10}/> Mistake</span>
          )}
          {task.subject&&<span className="badge badge-purple" style={{fontSize:'0.68rem'}}>{task.subject}</span>}
          {task.dueDate&&<span className={`badge badge-${isToday(new Date(task.dueDate))?'amber':isPast(new Date(task.dueDate))&&!task.completed?'red':'grey'}`} style={{fontSize:'0.68rem'}}>
            {isToday(new Date(task.dueDate))?'Today':format(new Date(task.dueDate),'d MMM')}
          </span>}
          <span className={`badge badge-${task.priority==='high'?'red':task.priority==='medium'?'amber':'blue'}`} style={{fontSize:'0.68rem'}}>{task.priority}</span>
          {task.auto && (
            <button
              onClick={() => navigate(task.link)}
              style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', alignItems:'center', gap:2, fontSize:'0.68rem', color:'var(--accent-light)', fontWeight:600 }}
            >
              {task.linkLabel} <ExternalLink size={10}/>
            </button>
          )}
        </div>
        {task.notes&&<p style={{fontSize:'0.75rem',marginTop:3}}>{task.notes}</p>}
      </div>
      {!task.auto && (
        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>handleDelete(task.id)} style={{color:'var(--danger)',flexShrink:0}}><Trash2 size={14}/></button>
      )}
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <h2>Tasks</h2>
        <div style={{display:'flex',gap:8}}>
          {selected.length>0&&<button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><Trash2 size={14}/> Delete {selected.length}</button>}
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={14}/> Add task</button>
        </div>
      </div>
      {(sessionTasks.length > 0 || mistakeTasks.length > 0) && (
        <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>
          {sessionTasks.length > 0 && `${sessionTasks.length} pending session${sessionTasks.length!==1?'s':''}`}
          {sessionTasks.length > 0 && mistakeTasks.length > 0 && ' and '}
          {mistakeTasks.length > 0 && `${mistakeTasks.length} unresolved mistake${mistakeTasks.length!==1?'s':''}`}
          {' '}pulled in automatically below.
        </p>
      )}
      <div className="tabs" style={{marginBottom:16}}>
        {['pending','completed','all'].map(f=><button key={f} className={`tab${filter===f?' active':''}`} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
      </div>
      {overdue.length>0&&<><div style={{fontSize:'0.75rem',fontWeight:700,color:'var(--danger)',marginBottom:6,textTransform:'uppercase'}}>Overdue</div><div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>{overdue.map(t=><TaskItem key={t.id} task={t}/>)}</div></>}
      {dueSoon.length>0&&<><div style={{fontSize:'0.75rem',fontWeight:700,color:'var(--warning)',marginBottom:6,textTransform:'uppercase'}}>Due today</div><div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>{dueSoon.map(t=><TaskItem key={t.id} task={t}/>)}</div></>}
      {rest.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6}}>{rest.map(t=><TaskItem key={t.id} task={t}/>)}</div>}
      {visible.length===0&&<div className="empty-state"><CheckSquare size={40} style={{opacity:0.3}}/><p>No tasks here</p><button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>Add a task</button></div>}

      {showAdd&&(
        <div className="modal-overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Add task</span><button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}><X size={18}/></button></div>
            <form onSubmit={handleAdd} style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label className="label">Task</label><input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Complete Chemistry Paper 2" required/></div>
              <div className="grid-2" style={{gap:10}}>
                <div><label className="label">Subject</label>
                  <select className="select" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
                    <option value="">None</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                  </select></div>
                <div><label className="label">Start date <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label><input className="input" type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/></div>
                <div><label className="label">Due date</label><input className="input" type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></div>
                <div><label className="label">Priority</label>
                  <select className="select" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                    {['high','medium','low'].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select></div>
              </div>
              <div><label className="label">Notes</label><textarea className="textarea" style={{minHeight:55}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button type="button" className="btn btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add task</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
