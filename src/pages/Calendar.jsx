// src/pages/Calendar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Skeleton from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import {
  completeSession, completeTask, updateSession, deleteSession,
  addTask, updateTask, deleteTask,
  getTopicsWithConfidence, getMistakes, resolveMistake,
  updateUserProfile,
} from '../utils/firestore'
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { getMonthDays, getWeekDays, sessionsForDay, downloadICS, parseICS, parseCSV } from '../utils/calendar'
import { filterUpcomingExams, countdownLabel, countdownUrgency } from '../utils/examUtils'
import { getSubjectIcon } from '../utils/subjectIcons'
import { computeTopicRecommendations } from '../utils/recommendations'
import CalendarGenerator from '../components/CalendarGenerator'
import toast from 'react-hot-toast'
import { format, addMonths, subMonths, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Plus, Download, Upload, Zap, X,
  CheckCircle2, Clock, Trash2, AlertTriangle, Check, Eye,
  CalendarDays, GraduationCap, ListTodo, ArrowLeft, CalendarX2,
  Lightbulb, AlertCircle, Info, BookOpen, ClipboardCheck,
} from 'lucide-react'
import { subjectColour } from '../data/subjects'
import './Calendar.css'

// 'Flashcard Session' and 'Past Paper Practice' added per the calendar-as-planning-engine
// brief ("eventually support: past papers, flashcard sessions..."). They're plain labelled
// session types for now — not yet deep-linked to a specific set/paper the way "Start
// session" launches a real study session elsewhere in the app. See the delivery notes.
const SESSION_TYPES = ['Content Revision', 'Exam Practice', 'Flashcard Session', 'Past Paper Practice', 'Emergency Revision']
const TASK_PRIORITIES = ['high', 'medium', 'low']

// Local YYYY-MM-DD for "today" — never new Date().toISOString() (that's UTC and can be
// a day off from the user's actual local date near midnight). Every session/task/exam
// date in this app is already a local "YYYY-MM-DD" string, so comparisons stay in that
// same local, lexicographically-sortable format throughout.
function localDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

// "YYYY-MM-DD" -> local Date at midnight. Never new Date(dateString) — that parses as
// UTC and can land on the wrong local day near a midnight boundary.
function parseLocalDate(dateStr) {
  const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function Calendar() {
  const { user, profile } = useAuth()
  const [view,         setView]         = useState('month')
  const [current,      setCurrent]      = useState(new Date())
  const [sessions,     setSessions]     = useState([])
  const [backlogTasks, setBacklogTasks] = useState([])   // tasks with no date at all
  const [mistakes,     setMistakes]     = useState([])
  const [topics,       setTopics]       = useState([])
  const [selected,     setSelected]     = useState(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [addPrefill,   setAddPrefill]   = useState(null)
  const [showEdit,     setShowEdit]     = useState(null)
  const [showComplete, setShowComplete] = useState(null)
  const [showGen,      setShowGen]      = useState(false)
  const [showClear,    setShowClear]    = useState(false)
  const [showImport,   setShowImport]   = useState(false)
  const [importParsed, setImportParsed] = useState([])
  const [importing,    setImporting]    = useState(false)
  const [clearing,     setClearing]     = useState(false)
  const [loading,      setLoading]      = useState(true)
  // Recommendations default ON (matches the brief's checked "Include recommendations") but
  // are fully controllable — persisted to the profile so the choice survives across devices,
  // same as any other setting. Never auto-schedules anything; see the "Schedule" action below.
  const [recsEnabled,  setRecsEnabled]  = useState(profile?.calendarRecsEnabled !== false)
  const [recsOnGrid,   setRecsOnGrid]   = useState(profile?.calendarRecsOnGrid !== false)
  const fileRef = useRef()

  useEffect(() => { loadSessions() }, [user])
  useEffect(() => { setRecsEnabled(profile?.calendarRecsEnabled !== false) }, [profile?.calendarRecsEnabled])
  useEffect(() => { setRecsOnGrid(profile?.calendarRecsOnGrid !== false) }, [profile?.calendarRecsOnGrid])

  async function loadSessions() {
    if (!user) return
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'sessions'))
      // Use the Firestore document ID (snap.id) — not any field inside the document
      const sessionsData = snap.docs.map(d => ({
        _docId: d.id,
        ...d.data(),
        id: d.id,
      }))
      
      const tSnap = await getDocs(collection(db, 'users', user.uid, 'tasks'))
      const allTasks = tSnap.docs.filter(d => !d.data().completed)
      // Expand multi-day tasks into an entry for each day in the range
      const tasksData = []
      const undated = []
      allTasks.forEach(d => {
        const data = d.data()
        const start = data.startDate || data.dueDate
        const end   = data.dueDate || data.startDate
        if (!start) { undated.push({ _docId: d.id, ...data, id: d.id, isTask: true }); return }
        const startDate = new Date(start)
        const endDate   = new Date(end)
        // Create one entry per day in the task range
        const current = new Date(startDate)
        while (current <= endDate) {
          tasksData.push({
            _docId: d.id, ...data, id: d.id,
            isTask: true,
            isMultiDay: start !== end,
            taskStartDate: start, taskEndDate: end,
            date: current.toISOString().slice(0, 10),
            title: data.title,
            type: 'Task',
            taskColor: data.priority === 'high' ? 'var(--danger)' : data.priority === 'medium' ? 'var(--warning)' : 'var(--success)',
          })
          current.setDate(current.getDate() + 1)
        }
      })
      
      setSessions([...sessionsData, ...tasksData])
      setBacklogTasks(undated)

      // Best-effort — recommendations degrade gracefully to "nothing to show" if either of
      // these fails, they're not load-bearing for the calendar's core session/task features.
      try {
        const [t, m] = await Promise.all([
          getTopicsWithConfidence(user.uid, profile?.subjects || []),
          getMistakes(user.uid),
        ])
        setTopics(t || [])
        setMistakes(m || [])
      } catch (e) { /* recommendations just won't have data this load */ }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleRecs(enabled) {
    setRecsEnabled(enabled)
    if (user) updateUserProfile(user.uid, { calendarRecsEnabled: enabled }).catch(() => {})
  }

  async function handleToggleRecsOnGrid(enabled) {
    setRecsOnGrid(enabled)
    if (user) updateUserProfile(user.uid, { calendarRecsOnGrid: enabled }).catch(() => {})
  }

  async function handleResolveMistakeFromCalendar(id) {
    if (!user) return
    await resolveMistake(user.uid, id)
    setMistakes(ms => ms.map(m => m.id === id ? { ...m, resolved: true } : m))
    toast.success('Marked resolved +20 XP')
  }

  async function handleCompleteBacklogTask(task) {
    await completeTask(user.uid, task.id, true)
    setBacklogTasks(ts => ts.filter(t => t.id !== task.id))
    toast.success('Task completed!')
  }

  async function handleDeleteBacklogTask(task) {
    await deleteTask(user.uid, task.id)
    setBacklogTasks(ts => ts.filter(t => t.id !== task.id))
    toast.success('Task deleted')
  }

  async function handleComplete(session, notes) {
    if (session.isTask) {
      await completeTask(user.uid, session.id, true)
      toast.success('Task completed!')
    } else {
      await completeSession(user.uid, session.id, notes)
      toast.success('Session completed! +50 XP 🎉')
    }
    await loadSessions()
    setShowComplete(null)
  }

  // ── Delete a single session ───────────────────────────────────────────────
  async function handleDeleteSession(session) {
    try {
      const docId = session._docId || session.id
      if (!docId) { toast.error('Cannot delete: missing ID'); return }
      if (session.isTask) {
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', docId))
        setSessions(s => s.filter(x => (x._docId || x.id) !== docId))
        toast.success('Task deleted')
      } else {
        await deleteSession(user.uid, docId)
        setSessions(s => s.filter(x => (x._docId || x.id) !== docId))
        toast.success(session.completed ? 'Session deleted (-50 XP)' : 'Session deleted')
      }
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
      console.error(err)
    }
  }

  // ── Clear calendar ────────────────────────────────────────────────────────
  async function clearCalendar(mode) {
    if (!user) { toast.error('Not logged in'); return }
    const uid = user.uid
    setClearing(true)
    setShowClear(false)
    console.log('[clearCalendar] starting, mode:', mode, 'uid:', uid)
    try {
      const colRef = collection(db, 'users', uid, 'sessions')
      const snap   = await getDocs(colRef)
      console.log('[clearCalendar] fetched', snap.docs.length, 'docs')
      if (snap.empty) {
        toast('Calendar is already empty')
        setClearing(false)
        return
      }
      let toDelete = snap.docs
      if (mode !== 'all') {
        toDelete = snap.docs.filter(d => {
          const data = d.data()
          return (
            data.source === 'generated' ||
            data.source === 'import' ||
            (typeof data.title === 'string' && (
              data.title.includes('Content Revision') ||
              data.title.includes('Exam Practice') ||
              data.title.includes('EMERGENCY')
            ))
          )
        })
      }
      console.log('[clearCalendar] toDelete count:', toDelete.length)
      if (!toDelete.length) {
        toast("No generated sessions found — try 'Clear everything'")
        setClearing(false)
        return
      }
      const BATCH_SIZE = 400
      let deleted = 0
      for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
        const batch = writeBatch(db)
        const chunk = toDelete.slice(i, i + BATCH_SIZE)
        chunk.forEach(d => batch.delete(doc(db, 'users', uid, 'sessions', d.id)))
        await batch.commit()
        deleted += chunk.length
        console.log('[clearCalendar] deleted so far:', deleted)
      }
      await loadSessions()
      toast.success(`Cleared ${deleted} session${deleted !== 1 ? 's' : ''}`)
    } catch (err) {
      console.error('[clearCalendar] ERROR:', err)
      toast.error('Clear failed: ' + err.message)
    } finally {
      setClearing(false)
    }
  }

  // ── Import file → review modal ────────────────────────────────────────────
  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text   = await file.text()
      const parsed = file.name.toLowerCase().endsWith('.ics')
        ? parseICS(text)
        : parseCSV(text)

      if (!parsed.length) {
        toast.error('No events found in this file')
        return
      }
      setImportParsed(parsed)
      setShowImport(true)
    } catch (err) {
      toast.error('Failed to read file: ' + err.message)
      console.error(err)
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Save imported sessions ────────────────────────────────────────────────
  async function handleImportConfirm(approved, mode) {
    setShowImport(false)
    setImporting(true)
    try {
      if (mode === 'replace') {
        const snap = await getDocs(collection(db, 'users', user.uid, 'sessions'))
        // Was a single writeBatch with no chunking — unlike CalendarGenerator.jsx's session-save
        // loop (plain addDoc calls, no real 500 limit), this IS a genuine Firestore writeBatch,
        // which does hard-cap at 500 operations. A user with more than 500 existing sessions
        // choosing "replace" on import would have hit that limit and the whole operation would
        // throw. Chunked the same way clearCalendar() above already does.
        const BATCH_SIZE = 400
        for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
          const batch = writeBatch(db)
          const chunk = snap.docs.slice(i, i + BATCH_SIZE)
          chunk.forEach(d => batch.delete(doc(db, 'users', user.uid, 'sessions', d.id)))
          await batch.commit()
        }
      }

      for (const ev of approved) {
        const start = ev.start instanceof Date && !isNaN(ev.start) ? ev.start : null
        await addDoc(collection(db, 'users', user.uid, 'sessions'), {
          title:      ev.title || `${ev.subject || 'Revision'} – ${ev.type || 'Session'}`,
          subject:    ev.subject    || '',
          type:       ev.type       || 'Content Revision',
          paper:      ev.paper      || '',
          board:      ev.board      || '',
          isEmergency: ev.isEmergency || false,
          startTime:  start ? start.toISOString() : null,
          endTime:    ev.end instanceof Date && !isNaN(ev.end) ? ev.end.toISOString() : null,
          duration:   ev.duration   || 45,
          date:       start ? format(start, 'yyyy-MM-dd') : '',
          start:      start ? format(start, 'HH:mm')      : '',
          notes:      ev.description || '',
          source:     'import',
          completed:  false,
          createdAt:  serverTimestamp(),
        })
      }

      await loadSessions()
      toast.success(`Imported ${approved.length} session${approved.length !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error('Import failed: ' + err.message)
      console.error(err)
    } finally {
      setImporting(false)
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function navigate(dir) {
    if (view === 'month') setCurrent(dir > 0 ? addMonths(current, 1) : subMonths(current, 1))
    else setCurrent(dir > 0 ? addWeeks(current, 1) : subWeeks(current, 1))
  }

  const days = view === 'month'
    ? getMonthDays(current.getFullYear(), current.getMonth())
    : getWeekDays(current).map(d => ({ date: d, otherMonth: false }))

  const dayNames         = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const selectedSessions = selected ? sessionsForDay(sessions, selected) : []

  // ── Upcoming feed for the sidebar — real exam dates (profile.examDates, the same
  // source Dashboard's "Upcoming exams" card reads via examUtils) merged with this
  // user's own upcoming, not-yet-completed sessions/tasks. Nothing here is invented —
  // it's the calendar finally surfacing data the rest of the app already has.
  const todayStr = localDateStr(new Date())
  // Full history (not just "upcoming") so a past exam date doesn't vanish from the grid
  // once it's done — only the sidebar's "Upcoming" list is future-only.
  const examsByDate = {}
  for (const e of profile?.examDates || []) {
    if (!e.examDate) continue
    ;(examsByDate[e.examDate] ||= []).push(e)
  }
  const upcomingExams = filterUpcomingExams(profile?.examDates || [])
    .sort((a, b) => (a.examDate || '').localeCompare(b.examDate || ''))
    .map(e => ({
      kind: 'exam',
      id: 'exam-' + (e.id || e.subject + e.examDate),
      date: e.examDate,
      subject: e.subject,
      title: e.subject,
      meta: `Paper ${e.paper}${e.paperName ? ' · ' + e.paperName : ''}`,
      raw: e,
    }))
  const upcomingLogged = sessions
    .filter(s => !s.completed && s.date && s.date >= todayStr)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.start || '').localeCompare(b.start || ''))
    .map(s => ({
      kind: s.isTask ? 'task' : 'session',
      id: s._docId || s.id,
      date: s.date,
      subject: s.subject,
      title: s.title || s.subject || (s.isTask ? 'Task' : 'Study session'),
      meta: s.isTask ? 'Task' : (s.start ? `${s.start} · ${s.type || 'Session'}` : (s.type || 'Session')),
      raw: s,
    }))
  const upcomingItems = [...upcomingExams, ...upcomingLogged]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  const recommendations = recsEnabled
    ? computeTopicRecommendations({ topics, mistakes, examDates: profile?.examDates || [], sessions, limit: 6 })
    : []
  const unresolvedMistakes = mistakes.filter(m => !m.resolved)

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="rf-cal-head">
        <div>
          <h2>Calendar</h2>
          <p className="rf-cal-subtitle">Your revision sessions, tasks and exam dates in one place</p>
        </div>
        <div className="rf-cal-actions">
          <button className="btn btn-secondary btn-sm" onClick={()=>fileRef.current.click()} disabled={importing}>
            <Upload size={14}/> {importing ? 'Reading…' : 'Import'}
          </button>
          <input ref={fileRef} type="file" accept=".ics,.csv" style={{display:'none'}} onChange={handleFileSelect}/>
          <button className="btn btn-secondary btn-sm" onClick={()=>downloadICS(sessions)}>
            <Download size={14}/> Export
          </button>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowClear(true)}>
            <Trash2 size={14}/> Clear
          </button>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowGen(true)}>
            <Zap size={14}/> Generate
          </button>
          <button className="btn btn-primary btn-sm" onClick={()=>{ setSelected(selected||new Date()); setAddPrefill(null); setShowAdd(true) }}>
            <Plus size={14}/> Add event
          </button>
        </div>
      </div>

      {/* Toolbar: month/week nav + view toggle */}
      <div className="rf-cal-toolbar">
        <div className="rf-cal-nav-group">
          <button className="btn btn-ghost btn-icon" onClick={()=>navigate(-1)} aria-label="Previous"><ChevronLeft size={18}/></button>
          <button className="btn btn-ghost btn-icon" onClick={()=>navigate(1)} aria-label="Next"><ChevronRight size={18}/></button>
        </div>
        <span className="rf-cal-toolbar-title">
          {view === 'month'
            ? format(current, 'MMMM yyyy')
            : `${format(days[0].date,'d MMM')} – ${format(days[6].date,'d MMM yyyy')}`}
        </span>
        <button className="btn btn-ghost btn-sm rf-cal-today-btn" onClick={()=>setCurrent(new Date())}>Today</button>
        <div className="tabs rf-cal-view-toggle" style={{padding:3}}>
          <button className={`tab${view==='month'?' active':''}`} onClick={()=>setView('month')}>Month</button>
          <button className={`tab${view==='week'?' active':''}`} onClick={()=>setView('week')}>Week</button>
        </div>
        <span className="rf-cal-count">
          {loading ? <Skeleton width={60} height={14} /> : `${sessions.length} session${sessions.length!==1?'s':''}`}
        </span>
      </div>

      <div className="rf-cal-layout">
        {/* Calendar grid */}
        <div className="card rf-cal-grid-card">
          <div className="rf-cal-weekdays">
            {dayNames.map(d => <div key={d} className="rf-cal-weekday">{d}</div>)}
          </div>
          <div className={`rf-cal-grid${view==='week'?' is-week':''}`}>
            {days.map(({date,otherMonth},i)=>{
              const dateStr  = format(date,'yyyy-MM-dd')
              const ds       = sessionsForDay(sessions, date)
              const dayExams = examsByDate[dateStr] || []
              const isSel    = selected && isSameDay(date, selected)
              const totalDots = dayExams.length + ds.length
              return (
                <div key={i}
                  className={`rf-cal-cell${isToday(date)?' is-today':''}${otherMonth?' is-other-month':''}${isSel?' is-selected':''}`}
                  onClick={()=>setSelected(date)}>
                  <span className="rf-cal-date">{format(date,'d')}</span>

                  {dayExams.length > 0 && (
                    <div className="rf-cal-chips">
                      {dayExams.slice(0,2).map((e,ei)=>(
                        <span key={ei} className="rf-cal-chip is-exam" style={{background:subjectColour(e.subject)}}>
                          <GraduationCap size={8}/> {e.subject}
                        </span>
                      ))}
                      {dayExams.length>2 && <span className="rf-cal-chip is-exam" style={{background:'var(--text-muted)'}}>+{dayExams.length-2} more</span>}
                    </div>
                  )}

                  {/* Recommended topics, projected only onto today — dynamic (recomputed
                      from live data every render, nothing cached/stored) and fully optional
                      via the two toggles above. Clicking opens the Add modal pre-filled;
                      nothing is ever written to the calendar without that explicit step. */}
                  {isToday(date) && recsEnabled && recsOnGrid && recommendations.length > 0 && (
                    <div className="rf-cal-chips">
                      {recommendations.slice(0,2).map((rec,ri)=>(
                        <span key={'rec'+ri} className="rf-cal-chip is-suggested"
                          onClick={(ev)=>{ ev.stopPropagation(); setAddPrefill({kind:'session', subject:rec.subject, topic:rec.topic, type:'Content Revision'}); setShowAdd(true) }}
                          title={rec.reasons[0]}>
                          <Lightbulb size={8}/> {rec.topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {totalDots > 0 && (
                    <div className="rf-cal-dots">
                      {dayExams.slice(0,2).map((e,ei)=>(
                        <div key={'e'+ei} className="rf-cal-dot is-exam"
                          style={{background:subjectColour(e.subject), color:subjectColour(e.subject)}}
                          title={`${e.subject} exam`}/>
                      ))}
                      {ds.slice(0,3).map((s,si)=>(
                        <div key={si} className={`rf-cal-dot${s.isTask?' is-task':''}`}
                          style={{background:s.isTask ? s.taskColor : subjectColour(s.subject), opacity:s.completed?0.4:1}}
                          title={s.title}/>
                      ))}
                      {totalDots>5 && <span className="rf-cal-more">+{totalDots-5}</span>}
                    </div>
                  )}

                  {view==='week' && totalDots>0 && (
                    <div className="rf-cal-week-agenda">
                      {dayExams.slice(0,1).map((e,ei)=>(
                        <div key={'we'+ei} className="rf-cal-week-item" style={{borderLeftColor:subjectColour(e.subject)}}>
                          <span className="t">Exam</span><span className="s">{e.subject} · Paper {e.paper}</span>
                        </div>
                      ))}
                      {ds.slice(0,2).map((s,si)=>(
                        <div key={si} className="rf-cal-week-item" style={{borderLeftColor:s.isTask?s.taskColor:subjectColour(s.subject)}}>
                          <span className="t">{s.isTask ? 'Task' : (s.start || s.type || 'Session')}</span>
                          <span className="s">{s.title || s.subject}</span>
                        </div>
                      ))}
                      {(dayExams.length+ds.length) > 3 && <span className="rf-cal-more">+{(dayExams.length+ds.length)-3} more</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="rf-cal-legend">
            <span className="rf-cal-legend-item">
              <span className="rf-cal-legend-swatch"><span style={{width:7,height:7,borderRadius:'50%',background:'currentColor',display:'block'}}/></span>
              Revision session
            </span>
            <span className="rf-cal-legend-item">
              <span className="rf-cal-legend-swatch"><span style={{width:7,height:7,borderRadius:2,background:'currentColor',display:'block'}}/></span>
              Task
            </span>
            <span className="rf-cal-legend-item">
              <span className="rf-cal-legend-swatch"><GraduationCap size={12}/></span>
              Exam
            </span>
            <span className="rf-cal-legend-item">
              <span className="rf-cal-legend-swatch"><span style={{width:7,height:7,borderRadius:'50%',background:'currentColor',display:'block',opacity:0.4}}/></span>
              Completed
            </span>
            {recsEnabled && recsOnGrid && (
              <span className="rf-cal-legend-item">
                <span className="rf-cal-legend-swatch"><Lightbulb size={12}/></span>
                Suggested (today only)
              </span>
            )}
          </div>
        </div>

        {/* Sidebar — "Upcoming" by default, a specific day's detail once one is selected */}
        <div className="card rf-side-card">
          {selected ? (
            <>
              <div className="rf-side-head">
                <button className="rf-side-back" onClick={()=>setSelected(null)}>
                  <ArrowLeft size={14}/> Upcoming
                </button>
                <button className="btn btn-primary btn-sm" onClick={()=>{setAddPrefill(null);setShowAdd(true)}}>
                  <Plus size={13}/> Add
                </button>
              </div>
              <h4 style={{marginBottom:12}}>{format(selected,'EEEE, d MMMM')}</h4>
              {loading ? (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {[1,2,3].map(i => <Skeleton key={i} height={60} />)}
                </div>
              ) : (selectedSessions.length===0 && (examsByDate[format(selected,'yyyy-MM-dd')]||[]).length===0) ? (
                <div className="empty-state" style={{padding:'28px 0'}}>
                  <CalendarX2 size={28} style={{opacity:0.35}}/>
                  <p style={{fontSize:'0.875rem'}}>Nothing scheduled on this day</p>
                  <button className="btn btn-primary btn-sm" onClick={()=>{setAddPrefill(null);setShowAdd(true)}}>Add session</button>
                </div>
              ) : (
                <div className="rf-day-list">
                  {(examsByDate[format(selected,'yyyy-MM-dd')]||[]).map(e=>(
                    <div key={'exam-'+(e.id||e.subject)} className="rf-upcoming-item">
                      <div className="rf-upcoming-icon" style={{background:subjectColour(e.subject)}}><GraduationCap size={15}/></div>
                      <div className="rf-upcoming-main">
                        <div className="rf-upcoming-title">{e.subject} exam</div>
                        <div className="rf-upcoming-meta">Paper {e.paper}{e.paperName?` · ${e.paperName}`:''}</div>
                      </div>
                    </div>
                  ))}
                  {selectedSessions.map(s=>(
                    <SessionCard key={s._docId||s.id} session={s}
                      onEdit={()=>setShowEdit(s)}
                      onComplete={()=>s.isTask ? handleComplete(s, '') : setShowComplete(s)}
                      onDelete={()=>handleDeleteSession(s)}/>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rf-side-head">
                <h4><CalendarDays size={16} color="var(--accent)"/> Upcoming</h4>
              </div>
              {loading ? (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {[1,2,3].map(i => <Skeleton key={i} height={54} />)}
                </div>
              ) : upcomingItems.length === 0 ? (
                <div className="empty-state" style={{padding:'28px 0'}}>
                  <CalendarDays size={28} style={{opacity:0.35}}/>
                  <p style={{fontSize:'0.875rem'}}>Nothing coming up yet</p>
                  <p style={{fontSize:'0.78rem'}}>Add a session, or set your exam dates so they show up here.</p>
                </div>
              ) : (
                <div className="rf-upcoming-list">
                  {upcomingItems.map(item => {
                    const ItemIcon = item.kind==='exam' ? GraduationCap : item.kind==='task' ? ListTodo : getSubjectIcon(item.subject)
                    const urgency  = item.kind==='exam' ? countdownUrgency(item.date) : null
                    return (
                      <button key={item.id} className="rf-upcoming-item"
                        style={{cursor:'pointer', width:'100%', textAlign:'left', font:'inherit'}}
                        onClick={()=>setSelected(parseLocalDate(item.date))}>
                        <div className="rf-upcoming-icon" style={{background: item.subject ? subjectColour(item.subject) : 'var(--text-muted)'}}>
                          <ItemIcon size={15}/>
                        </div>
                        <div className="rf-upcoming-main">
                          <div className="rf-upcoming-title">{item.title}</div>
                          <div className="rf-upcoming-meta">{item.meta}</div>
                        </div>
                        <span className={`rf-upcoming-when${urgency==='urgent'?' is-urgent':urgency==='soon'?' is-soon':''}`}>
                          {item.kind==='exam' ? countdownLabel(item.date) : format(parseLocalDate(item.date), 'd MMM')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="rf-side-footer">
                <button className="btn btn-primary" onClick={()=>{ setSelected(new Date()); setAddPrefill(null); setShowAdd(true) }}>
                  <Plus size={15}/> Add event
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recommended topics — optional and controllable; a suggestion is only ever added to
          the calendar when the student explicitly clicks "Schedule" and confirms the modal. */}
      <div className="card rf-recs-panel">
        <div className="rf-recs-head">
          <h4><Lightbulb size={16} color="var(--accent)"/> Recommended topics</h4>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            <label className="rf-recs-toggle">
              <input type="checkbox" checked={recsEnabled} onChange={e=>handleToggleRecs(e.target.checked)} style={{accentColor:'var(--accent)'}}/>
              Show recommendations
            </label>
            {recsEnabled && (
              <label className="rf-recs-toggle">
                <input type="checkbox" checked={recsOnGrid} onChange={e=>handleToggleRecsOnGrid(e.target.checked)} style={{accentColor:'var(--accent)'}}/>
                Show on today's date
              </label>
            )}
          </div>
        </div>
        {recsEnabled && (
          <>
            <p className="rf-recs-sub">Based on your confidence ratings, exam dates and logged mistakes — recalculated live, and nothing is added to your calendar unless you choose to. {recsOnGrid && "Today's top picks also show as dashed suggestions on the calendar itself."}</p>
            {loading ? (
              <div className="rf-recs-grid">{[1,2,3].map(i=><Skeleton key={i} height={104}/>)}</div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state" style={{padding:'18px 0'}}>
                <CheckCircle2 size={26} style={{opacity:0.35}}/>
                <p style={{fontSize:'0.85rem'}}>Nothing stands out right now — rate a few topics in Topics to get personalised suggestions here.</p>
              </div>
            ) : (
              <div className="rf-recs-grid">
                {recommendations.map(rec=>(
                  <div key={rec.id} className="rf-rec-card">
                    <div className="rf-rec-card-top">
                      <div className="rf-rec-icon" style={{background:subjectColour(rec.subject)}}>
                        {React.createElement(getSubjectIcon(rec.subject), {size:15})}
                      </div>
                      <div style={{minWidth:0}}>
                        <div className="rf-rec-title">{rec.topic}</div>
                        <div className="rf-rec-subject">{rec.subject}</div>
                      </div>
                    </div>
                    <div className="rf-rec-reasons">
                      {rec.reasons.map((r,i)=>(
                        <div key={i} className="rf-rec-reason"><Info size={11}/> <span>{r}</span></div>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={()=>{
                      setAddPrefill({ kind:'session', subject:rec.subject, topic:rec.topic, type:'Content Revision' })
                      setShowAdd(true)
                    }}>
                      <Plus size={13}/> Schedule this
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Backlog — tasks with no date, and unresolved mistakes, absorbed from Tasks.jsx /
          Mistakes.jsx so they're manageable here without needing a separate page. */}
      <div className="rf-backlog-panel">
        <div className="card rf-backlog-card">
          <div className="rf-backlog-head">
            <h4><ListTodo size={15} color="var(--accent)"/> Tasks without a date</h4>
            <button className="btn btn-ghost btn-sm" onClick={()=>{ setAddPrefill({ kind:'task' }); setShowAdd(true) }}>
              <Plus size={13}/> Add task
            </button>
          </div>
          {loading ? <Skeleton height={70}/> : backlogTasks.length === 0 ? (
            <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Nothing undated — any task without a due date will show up here.</p>
          ) : (
            <div className="rf-backlog-list">
              {backlogTasks.map(t=>(
                <div key={t.id} className="rf-backlog-item">
                  <button className="rf-backlog-check" onClick={()=>handleCompleteBacklogTask(t)} title="Mark complete">
                    <Check size={12} style={{color:'var(--text-muted)'}}/>
                  </button>
                  <span className="rf-backlog-title">{t.title}</span>
                  {t.subject && <span className="badge badge-grey" style={{fontSize:'0.65rem',flexShrink:0}}>{t.subject}</span>}
                  <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)',flexShrink:0}} onClick={()=>handleDeleteBacklogTask(t)}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card rf-backlog-card">
          <div className="rf-backlog-head">
            <h4><AlertCircle size={15} color="var(--warning)"/> Unresolved mistakes</h4>
            <Link to="/mistakes" className="btn btn-ghost btn-sm">Log one <ChevronRight size={13}/></Link>
          </div>
          {loading ? <Skeleton height={70}/> : unresolvedMistakes.length === 0 ? (
            <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Nothing unresolved — nice work staying on top of things.</p>
          ) : (
            <div className="rf-backlog-list">
              {unresolvedMistakes.slice(0, 6).map(m=>(
                <div key={m.id} className="rf-backlog-item">
                  <div style={{width:7,height:7,borderRadius:'50%',background:subjectColour(m.subject),flexShrink:0}}/>
                  <span className="rf-backlog-title">{m.topic ? `${m.subject} — ${m.topic}` : m.subject}</span>
                  <button className="btn btn-ghost btn-sm" style={{flexShrink:0,fontSize:'0.72rem'}} onClick={()=>handleResolveMistakeFromCalendar(m.id)}>
                    Resolve
                  </button>
                </div>
              ))}
              {unresolvedMistakes.length > 6 && (
                <Link to="/mistakes" className="rf-backlog-meta" style={{textAlign:'center',padding:'4px 0'}}>
                  +{unresolvedMistakes.length - 6} more in Mistake Log
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAdd&&(
        <AddEventModal user={user} profile={profile} selectedDate={selected} prefill={addPrefill}
          onClose={()=>{setShowAdd(false);setAddPrefill(null)}}
          onSaveSession={async s=>{
            await addDoc(collection(db,'users',user.uid,'sessions'),{
              ...s, completed:false, source:'manual', createdAt:serverTimestamp()
            })
            await loadSessions()
            setShowAdd(false); setAddPrefill(null)
            toast.success('Session added')
          }}
          onSaveTask={async t=>{
            await addTask(user.uid, t)
            await loadSessions()
            setShowAdd(false); setAddPrefill(null)
            toast.success('Task added')
          }}/>
      )}
      {showEdit&&(
        <EditSessionModal user={user} profile={profile} session={showEdit}
          onClose={()=>setShowEdit(null)}
          onSaveSession={async data=>{
            await updateSession(user.uid, showEdit.id, data)
            await loadSessions()
            setShowEdit(null)
            toast.success('Session updated')
          }}
          onSaveTask={async data=>{
            await updateTask(user.uid, showEdit.id, data)
            await loadSessions()
            setShowEdit(null)
            toast.success('Task updated')
          }}/>
      )}
      {showComplete&&(
        <CompleteModal session={showComplete}
          onClose={()=>setShowComplete(null)}
          onComplete={(notes)=>handleComplete(showComplete, notes)}/>
      )}
      {showGen&&(
        <CalendarGenerator
          onClose={()=>setShowGen(false)}
          onGenerated={()=>{loadSessions();toast.success('Schedule generated!')}}/>
      )}
      {showClear&&(
        <ClearModal sessions={sessions} clearing={clearing}
          onClose={()=>setShowClear(false)}
          onClear={clearCalendar}/>
      )}
      {showImport&&(
        <ImportReviewModal
          parsed={importParsed}
          profile={profile}
          existingCount={sessions.length}
          onClose={()=>setShowImport(false)}
          onConfirm={handleImportConfirm}/>
      )}
    </div>
  )
}

// ── Session Card ──────────────────────────────────────────────────────────────
function SessionCard({ session:s, onComplete, onDelete, onEdit }) {
  const Icon   = s.isTask ? ListTodo : getSubjectIcon(s.subject)
  const accent = s.isTask ? (s.taskColor || 'var(--text-muted)') : subjectColour(s.subject)
  return (
    <div style={{display:'flex',gap:10,padding:12,borderRadius:'var(--radius-md)',background:'var(--bg-surface)',
      border:`1px solid ${s.completed?'var(--success)':s.isEmergency?'var(--danger)':'var(--border)'}`,
      opacity:s.completed?0.72:1}}>
      <div style={{width:32,height:32,borderRadius:9,background:accent,flexShrink:0,
        display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
        <Icon size={15}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
          <div style={{fontWeight:700,fontSize:'0.85rem',marginBottom:5,
            color:s.isEmergency?'var(--danger)':'var(--text-primary)'}}>
            {s.title||s.subject}
          </div>
          {s.completed && <CheckCircle2 size={15} style={{color:'var(--success)',flexShrink:0}}/>}
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:s.completed?0:8}}>
          {s.start&&<span className="badge badge-grey"><Clock size={9}/> {s.start}</span>}
          {s.duration&&<span className="badge badge-grey">{s.duration}min</span>}
          {s.type&&<span className={`badge badge-${s.isEmergency?'red':s.type.includes('Exam')?'blue':'purple'}`}>{s.type}</span>}
        </div>
        {!s.completed&&(
          <div style={{display:'flex',gap:6}}>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}>Edit</button>
            <button className="btn btn-secondary btn-sm" onClick={onComplete}>
              <CheckCircle2 size={13}/> Done
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)',marginLeft:'auto'}} onClick={onDelete}>
              <Trash2 size={13}/>
            </button>
          </div>
        )}
      </div>
      {s.completed && (
        <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)',flexShrink:0,alignSelf:'flex-start'}} onClick={onDelete}>
          <Trash2 size={13}/>
        </button>
      )}
    </div>
  )
}

// ── Edit Session/Task Modal ────────────────────────────────────────────────────────
function EditSessionModal({ user, profile, session, onClose, onSaveSession, onSaveTask }) {
  const subjects = profile?.subjects?.map(s=>s.name)||[]
  const isTask = !!session.isTask
  const [form,setForm] = useState({
    subject: session.subject||'',
    type: session.type  || 'Content Revision',
    date: session.date  || format(new Date(), 'yyyy-MM-dd'),
    start: session.start|| '17:00',
    duration: session.duration||45,
    paper: session.paper||'',
    notes: session.notes||'',
  })
  const [taskForm,setTaskForm] = useState({
    title: session.title || '',
    subject: session.subject || '',
    startDate: session.taskStartDate || '',
    dueDate: session.taskEndDate || session.date || '',
    priority: session.priority || 'medium',
    notes: session.notes || '',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    const startDt = new Date(`${form.date}T${form.start}`)
    await onSaveSession({
      ...form,
      duration: parseInt(form.duration),
      title: `${form.subject}${form.paper?' P'+form.paper:''} – ${form.type}`,
      startTime: startDt.toISOString(),
      endTime: new Date(startDt.getTime()+parseInt(form.duration)*60000).toISOString(),
    })
  }
  async function handleTaskSubmit(e) {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    await onSaveTask(taskForm)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isTask ? 'Edit task' : 'Edit session'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        {isTask ? (
          <form onSubmit={handleTaskSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label className="label">Title</label>
              <input className="input" value={taskForm.title} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))} required autoFocus/></div>
            <div className="grid-2" style={{gap:10}}>
              <div><label className="label">Subject (optional)</label>
                <select className="select" value={taskForm.subject} onChange={e=>setTaskForm(f=>({...f,subject:e.target.value}))}>
                  <option value="">None</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="label">Priority</label>
                <select className="select" value={taskForm.priority} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value}))}>
                  {TASK_PRIORITIES.map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}
                </select></div>
              <div><label className="label">Start date</label>
                <input className="input" type="date" value={taskForm.startDate} onChange={e=>setTaskForm(f=>({...f,startDate:e.target.value}))}/></div>
              <div><label className="label">Due date</label>
                <input className="input" type="date" value={taskForm.dueDate} onChange={e=>setTaskForm(f=>({...f,dueDate:e.target.value}))}/></div>
            </div>
            <div><label className="label">Notes</label>
              <textarea className="textarea" style={{minHeight:55}} value={taskForm.notes} onChange={e=>setTaskForm(f=>({...f,notes:e.target.value}))}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="grid-2" style={{gap:10}}>
              <div><label className="label">Subject</label>
                <select className="select" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} required>
                  <option value="">Select…</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="label">Type</label>
                <select className="select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {SESSION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="label">Paper</label>
                <input className="input" placeholder="1, 2…" value={form.paper} onChange={e=>setForm(f=>({...f,paper:e.target.value}))}/></div>
              <div><label className="label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required/></div>
              <div><label className="label">Start time</label>
                <input className="input" type="time" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))} required/></div>
              <div><label className="label">Duration (min)</label>
                <input className="input" type="number" min={15} max={300} value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} required/></div>
            </div>
            <div><label className="label">Notes</label>
              <textarea className="textarea" style={{minHeight:55}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Clear Modal ───────────────────────────────────────────────────────────────
function ClearModal({ sessions, clearing, onClose, onClear }) {
  const genCount    = sessions.filter(s =>
    s.source==='generated' || s.source==='import' ||
    (s.title&&(s.title.includes('Content Revision')||s.title.includes('Exam Practice')||s.title.includes('EMERGENCY')))
  ).length
  const manualCount = sessions.length - genCount

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" style={{display:'flex',alignItems:'center',gap:8}}>
            <Trash2 size={16} color="var(--danger)"/> Clear calendar
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <p style={{marginBottom:20,fontSize:'0.875rem'}}>Choose what to clear. This cannot be undone.</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <button className="card"
            style={{textAlign:'left',cursor:clearing?'not-allowed':'pointer',padding:14,border:'2px solid var(--border)',background:'var(--bg-card)',opacity:clearing?0.6:1}}
            onClick={()=>!clearing&&onClear('generated')}>
            <div style={{fontWeight:600,marginBottom:3}}>Clear generated &amp; imported sessions</div>
            <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>
              Removes ~{genCount} auto-generated and imported session{genCount!==1?'s':''}. Keeps {manualCount} manually added.
            </div>
          </button>
          <button className="card"
            style={{textAlign:'left',cursor:clearing?'not-allowed':'pointer',padding:14,border:'2px solid var(--danger)',background:'rgba(239,68,68,0.06)',opacity:clearing?0.6:1}}
            onClick={()=>!clearing&&onClear('all')}>
            <div style={{fontWeight:600,marginBottom:3,color:'var(--danger)'}}>Clear everything</div>
            <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>
              Removes all {sessions.length} session{sessions.length!==1?'s':''} including manually added ones.
            </div>
          </button>
        </div>
        {clearing&&<div style={{textAlign:'center',marginTop:14,color:'var(--text-muted)',fontSize:'0.875rem'}}>Clearing…</div>}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
          <button className="btn btn-secondary" onClick={onClose} disabled={clearing}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Import Review Modal ───────────────────────────────────────────────────────
function ImportReviewModal({ parsed, profile, existingCount, onClose, onConfirm }) {
  const subjects = profile?.subjects?.map(s=>s.name)||[]
  const [items, setItems] = useState(
    parsed.map((ev,i)=>({
      ...ev, _id:i, _include:true,
      _subject: ev.subject||'',
      _type:    ev.type||'Content Revision',
    }))
  )
  const [mode, setMode] = useState('add')

  const included     = items.filter(e=>e._include)
  const unrecognised = items.filter(e=>!e.subject||e.subjectUnrecognised)

  const formatDate = ev => {
    if (ev.start instanceof Date && !isNaN(ev.start)) {
      try { return format(ev.start,'EEE d MMM HH:mm') } catch { return '—' }
    }
    return ev.date||'—'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:680,maxHeight:'92vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" style={{display:'flex',alignItems:'center',gap:8}}>
            <Eye size={16} color="var(--accent-light)"/> Review import
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
          {[{l:'Found',v:items.length,c:'var(--accent-light)'},{l:'Selected',v:included.length,c:'var(--success)'},{l:'Unassigned',v:unrecognised.length,c:'var(--warning)'}].map(s=>(
            <div key={s.l} style={{padding:'6px 14px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',textAlign:'center',flex:1}}>
              <div style={{fontWeight:800,color:s.c,fontSize:'1.2rem'}}>{s.v}</div>
              <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{s.l}</div>
            </div>
          ))}
        </div>

        {unrecognised.length>0&&(
          <div style={{padding:'8px 12px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'var(--radius-md)',fontSize:'0.82rem',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
            <AlertTriangle size={14} color="var(--warning)"/>
            {unrecognised.length} session{unrecognised.length!==1?'s':''} couldn't be matched to a subject — assign below or leave as unassigned.
          </div>
        )}

        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>setItems(it=>it.map(e=>({...e,_include:true})))}>Select all</button>
          <button className="btn btn-secondary btn-sm" onClick={()=>setItems(it=>it.map(e=>({...e,_include:false})))}>Deselect all</button>
        </div>

        <div style={{maxHeight:320,overflowY:'auto',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',marginBottom:14}}>
          {items.map((ev,i)=>(
            <div key={ev._id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:i<items.length-1?'1px solid var(--border)':'none',background:ev._include?'var(--bg-card)':'var(--bg-surface)',opacity:ev._include?1:0.5}}>
              <input type="checkbox" checked={ev._include} onChange={()=>setItems(it=>it.map(x=>x._id===ev._id?{...x,_include:!x._include}:x))}
                style={{width:14,height:14,accentColor:'var(--accent)',flexShrink:0}}/>
              <div style={{flex:1,overflow:'hidden',minWidth:0}}>
                <div style={{fontWeight:600,fontSize:'0.8rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {ev.title||'(no title)'}
                  {(ev.subjectUnrecognised||!ev.subject)&&<span className="badge badge-amber" style={{marginLeft:6,fontSize:'0.62rem'}}>unassigned</span>}
                </div>
                <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{formatDate(ev)}</div>
              </div>
              <select className="select" style={{fontSize:'0.75rem',padding:'2px 5px',width:130,flexShrink:0}}
                value={ev._subject} onChange={e=>setItems(it=>it.map(x=>x._id===ev._id?{...x,_subject:e.target.value,subject:e.target.value,subjectUnrecognised:false}:x))}>
                <option value="">Unassigned</option>
                {subjects.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <select className="select" style={{fontSize:'0.75rem',padding:'2px 5px',width:120,flexShrink:0}}
                value={ev._type} onChange={e=>setItems(it=>it.map(x=>x._id===ev._id?{...x,_type:e.target.value,type:e.target.value}:x))}>
                {SESSION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{marginBottom:14}}>
          <label className="label">What should happen to your existing {existingCount} sessions?</label>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[{val:'add',label:'Add to existing calendar',desc:'Keep all current sessions'},
              {val:'replace',label:'Replace existing calendar',desc:'Delete all current sessions first'}].map(opt=>(
              <button key={opt.val} onClick={()=>setMode(opt.val)}
                style={{padding:'9px 14px',borderRadius:'var(--radius-md)',cursor:'pointer',textAlign:'left',width:'100%',
                  border:`2px solid ${mode===opt.val?'var(--accent)':'var(--border)'}`,
                  background:mode===opt.val?'var(--accent-pale)':'var(--bg-surface)'}}>
                <span style={{fontWeight:600,fontSize:'0.875rem'}}>{opt.label}</span>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)',marginLeft:8}}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onConfirm(included,mode)} disabled={!included.length}>
            <Check size={15}/> Import {included.length} session{included.length!==1?'s':''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Session Modal ─────────────────────────────────────────────────────────
function AddEventModal({ user, profile, selectedDate, prefill, onClose, onSaveSession, onSaveTask }) {
  const subjects = profile?.subjects?.map(s=>s.name)||[]
  const [kind,setKind] = useState(prefill?.kind==='task' ? 'task' : 'session')
  const dateStr = selectedDate?format(selectedDate,'yyyy-MM-dd'):format(new Date(),'yyyy-MM-dd')
  const [form,setForm] = useState({
    subject: prefill?.subject || subjects[0]||'', type: prefill?.type || 'Content Revision',
    topic: prefill?.topic || '',
    date:dateStr, start:'17:00',duration:45,paper:'',notes:'',
  })
  const [taskForm,setTaskForm] = useState({
    title: prefill?.topic ? `Revise ${prefill.topic}` : '', subject: prefill?.subject || '',
    startDate:'', dueDate:selectedDate?dateStr:'', priority:'medium', notes:'',
  })
  // Paper section — subject + a specific real paper number + (optionally) which topics on
  // that paper to focus on. Topics come from topics.js's own per-paper breakdown (the same
  // data Topic Notes already reads), not an invented "Section A/B" structure — this app's
  // paper data doesn't have formal sections, so grounding this in real per-paper topics is
  // the honest version of "paper sections".
  const [paperForm,setPaperForm] = useState({
    subject: prefill?.subject || subjects[0]||'', paperNum:'', topics:[],
    date:dateStr, start:'17:00', duration:60, notes:'',
  })
  const [paperTopicsByPaper, setPaperTopicsByPaper] = useState({})
  const [paperTopicsLoading, setPaperTopicsLoading] = useState(false)

  useEffect(() => {
    if (kind!=='paper' || !paperForm.subject) { setPaperTopicsByPaper({}); return }
    setPaperTopicsLoading(true)
    const subjMeta = profile?.subjects?.find(s=>s.name===paperForm.subject)
    import('../data/topics').then(({ getTopicsForSubject }) => {
      const sb = subjMeta?.board || 'AQA'
      const lv = subjMeta?.qualification || 'GCSE'
      const papers = getTopicsForSubject(sb, paperForm.subject, lv) || {}
      setPaperTopicsByPaper(papers)
      setPaperTopicsLoading(false)
      const firstPaper = Object.keys(papers)[0]
      if (firstPaper) setPaperForm(f=>f.paperNum ? f : ({...f, paperNum:firstPaper}))
    })
  }, [kind, paperForm.subject])

  function togglePaperTopic(t) {
    setPaperForm(f => ({...f, topics: f.topics.includes(t) ? f.topics.filter(x=>x!==t) : [...f.topics, t]}))
  }

  async function submitSession(e) {
    e.preventDefault()
    const startDt = new Date(`${form.date}T${form.start}`)
    await onSaveSession({
      ...form,
      duration:  parseInt(form.duration),
      title:     form.topic ? `${form.subject} — ${form.topic}` : `${form.subject}${form.paper?' P'+form.paper:''} – ${form.type}`,
      startTime: startDt.toISOString(),
      endTime:   new Date(startDt.getTime()+parseInt(form.duration)*60000).toISOString(),
    })
  }
  async function submitTask(e) {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    await onSaveTask(taskForm)
  }
  async function submitPaper(e) {
    e.preventDefault()
    if (!paperForm.subject || !paperForm.paperNum) return
    const startDt = new Date(`${paperForm.date}T${paperForm.start}`)
    const topicCount = paperForm.topics.length
    await onSaveSession({
      subject: paperForm.subject,
      type: 'Past Paper Practice',
      paper: paperForm.paperNum,
      topics: paperForm.topics,
      notes: paperForm.notes,
      title: `${paperForm.subject} Paper ${paperForm.paperNum}${topicCount ? ` — ${topicCount} topic${topicCount>1?'s':''}` : ' — full paper'}`,
      duration: parseInt(paperForm.duration),
      startTime: startDt.toISOString(),
      endTime: new Date(startDt.getTime()+parseInt(paperForm.duration)*60000).toISOString(),
    })
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Add to calendar</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button></div>
        <div className="rf-kind-toggle">
          <button type="button" className={`rf-kind-btn${kind==='session'?' is-active':''}`} onClick={()=>setKind('session')}>
            <BookOpen size={15}/> Session
          </button>
          <button type="button" className={`rf-kind-btn${kind==='paper'?' is-active':''}`} onClick={()=>setKind('paper')}>
            <ClipboardCheck size={15}/> Paper section
          </button>
          <button type="button" className={`rf-kind-btn${kind==='task'?' is-active':''}`} onClick={()=>setKind('task')}>
            <ListTodo size={15}/> Task
          </button>
        </div>
        {kind==='session' && (
          <form onSubmit={submitSession} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="grid-2" style={{gap:10}}>
              <div><label className="label">Subject</label>
                <select className="select" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} required>
                  <option value="">Select…</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="label">Type</label>
                <select className="select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {SESSION_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="label">Topic (optional)</label>
                <input className="input" placeholder="e.g. Photosynthesis" value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))}/></div>
              <div><label className="label">Paper</label>
                <input className="input" placeholder="1, 2…" value={form.paper} onChange={e=>setForm(f=>({...f,paper:e.target.value}))}/></div>
              <div><label className="label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required/></div>
              <div><label className="label">Start time</label>
                <input className="input" type="time" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))} required/></div>
              <div><label className="label">Duration (min)</label>
                <input className="input" type="number" min={15} max={300} value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} required/></div>
            </div>
            <div><label className="label">Notes</label>
              <textarea className="textarea" style={{minHeight:55}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add session</button>
            </div>
          </form>
        )}
        {kind==='paper' && (
          <form onSubmit={submitPaper} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="grid-2" style={{gap:10}}>
              <div><label className="label">Subject</label>
                <select className="select" value={paperForm.subject}
                  onChange={e=>setPaperForm(f=>({...f,subject:e.target.value,paperNum:'',topics:[]}))} required>
                  <option value="">Select…</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="label">Paper</label>
                <select className="select" value={paperForm.paperNum} disabled={!Object.keys(paperTopicsByPaper).length}
                  onChange={e=>setPaperForm(f=>({...f,paperNum:e.target.value,topics:[]}))}>
                  <option value="">{paperTopicsLoading?'Loading…':Object.keys(paperTopicsByPaper).length?'Select…':'No paper data'}</option>
                  {Object.keys(paperTopicsByPaper).map(p=><option key={p} value={p}>Paper {p}</option>)}
                </select></div>
              <div><label className="label">Date</label>
                <input className="input" type="date" value={paperForm.date} onChange={e=>setPaperForm(f=>({...f,date:e.target.value}))} required/></div>
              <div><label className="label">Start time</label>
                <input className="input" type="time" value={paperForm.start} onChange={e=>setPaperForm(f=>({...f,start:e.target.value}))} required/></div>
              <div><label className="label">Duration (min)</label>
                <input className="input" type="number" min={15} max={300} value={paperForm.duration} onChange={e=>setPaperForm(f=>({...f,duration:e.target.value}))} required/></div>
            </div>
            {paperForm.paperNum && paperTopicsByPaper[paperForm.paperNum]?.length > 0 && (
              <div>
                <label className="label">Focus topics (optional — leave blank to cover the whole paper)</label>
                <div style={{maxHeight:170,overflowY:'auto',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:9,display:'flex',flexDirection:'column',gap:5,background:'var(--bg-surface)'}}>
                  {paperTopicsByPaper[paperForm.paperNum].map(t=>(
                    <label key={t} style={{display:'flex',alignItems:'flex-start',gap:7,fontSize:'0.78rem',cursor:'pointer',lineHeight:1.4}}>
                      <input type="checkbox" checked={paperForm.topics.includes(t)} onChange={()=>togglePaperTopic(t)} style={{marginTop:2,flexShrink:0}}/>
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
                {paperForm.topics.length>0 && <p style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:5}}>{paperForm.topics.length} topic{paperForm.topics.length>1?'s':''} selected</p>}
              </div>
            )}
            <div><label className="label">Notes</label>
              <textarea className="textarea" style={{minHeight:55}} value={paperForm.notes} onChange={e=>setPaperForm(f=>({...f,notes:e.target.value}))}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!paperForm.subject||!paperForm.paperNum}>Add paper section</button>
            </div>
          </form>
        )}
        {kind==='task' && (
          <form onSubmit={submitTask} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label className="label">Title</label>
              <input className="input" value={taskForm.title} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))} required autoFocus/></div>
            <div className="grid-2" style={{gap:10}}>
              <div><label className="label">Subject (optional)</label>
                <select className="select" value={taskForm.subject} onChange={e=>setTaskForm(f=>({...f,subject:e.target.value}))}>
                  <option value="">None</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="label">Priority</label>
                <select className="select" value={taskForm.priority} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value}))}>
                  {TASK_PRIORITIES.map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}
                </select></div>
              <div><label className="label">Start date (optional)</label>
                <input className="input" type="date" value={taskForm.startDate} onChange={e=>setTaskForm(f=>({...f,startDate:e.target.value}))}/></div>
              <div><label className="label">Due date (optional)</label>
                <input className="input" type="date" value={taskForm.dueDate} onChange={e=>setTaskForm(f=>({...f,dueDate:e.target.value}))}/></div>
            </div>
            <div><label className="label">Notes</label>
              <textarea className="textarea" style={{minHeight:55}} value={taskForm.notes} onChange={e=>setTaskForm(f=>({...f,notes:e.target.value}))}/></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add task</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Complete Modal ────────────────────────────────────────────────────────────
function CompleteModal({ session, onClose, onComplete }) {
  const [notes,    setNotes]    = useState('')
  const [showNotes,setShowNotes]= useState(false)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Mark complete</span><button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button></div>
        <p style={{marginBottom:16,fontWeight:500}}>{session.title}</p>
        <div style={{marginBottom:14}}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={()=>setShowNotes(o=>!o)}
            style={{fontSize:'0.82rem',color:'var(--text-muted)',padding:'4px 0',display:'flex',alignItems:'center',gap:6}}
          >
            {showNotes ? '▲' : '▼'} {showNotes ? 'Hide notes' : 'Add session notes (optional)'}
          </button>
          {showNotes && (
            <textarea
              className="textarea"
              style={{marginTop:8,minHeight:80}}
              value={notes}
              onChange={e=>setNotes(e.target.value)}
              placeholder="What did you cover? Any topics to revisit? How did it go?"
              autoFocus
            />
          )}
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onComplete(notes)}>
            <CheckCircle2 size={15}/> Complete +50 XP
          </button>
        </div>
      </div>
    </div>
  )
}
