// src/components/CalendarGenerator.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collection, serverTimestamp, getDocs, query, where, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { generateSchedule, buildSubjectsFromProfile } from '../utils/scheduler'
import { downloadICS } from '../utils/calendar'
import { format, addMonths, addWeeks } from 'date-fns'
import toast from 'react-hot-toast'
import { X, ChevronRight, ChevronLeft, Download, Check, Clock, Calendar, AlertCircle, Plus, Trash2 } from 'lucide-react'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const STEP_LABELS = [
  'Exam Dates',
  'Dates',
  'Availability',
  'Session Preferences',
  'Subject Settings',
  'Review & Generate',
  'Result',
]

export default function CalendarGenerator({ onClose, onGenerated }) {
  const { user, profile } = useAuth()
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  // ── Step 0: Exam dates check ─────────────────────────────────────────────
  const examDates = profile?.examDates || []
  const hasExamDates = examDates.length > 0

  // ── Step 1: Date range ───────────────────────────────────────────────────
  const defaultEnd = examDates.length
    ? format(new Date(Math.max(...examDates.map(e => new Date(e.examDate)))), 'yyyy-MM-dd')
    : format(addMonths(new Date(), 3), 'yyyy-MM-dd')

  const [startDate,     setStartDate]     = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate,       setEndDate]       = useState(defaultEnd)
  const [extendedDate,  setExtendedDate]  = useState('')

  // ── Step 2: Availability ────────────────────────────────────────────────
  const defaultAvail = profile?.availability || Object.fromEntries(
    DAYS.map(d => [d, {
      enabled:   d !== 'Sunday',
      startTime: d === 'Wednesday' ? '16:00' : d === 'Saturday' ? '12:00' : '17:00',
      endTime:   '21:00'
    }])
  )
  const [availability, setAvailability] = useState(defaultAvail)

  // ── Step 3: Session preferences ─────────────────────────────────────────
  const [contentRatio,    setContentRatio]    = useState(2)
  const [examRatio,       setExamRatio]       = useState(1)
  const [contentDuration, setContentDuration] = useState(45)
  const [sessionGap,      setSessionGap]      = useState(30)
  const [emergencySessions, setEmergency]     = useState(true)
  const [dayCap,          setDayCap]          = useState('none') // 'none' | day name
  const [dayCapCount,     setDayCapCount]     = useState(1)
  const [useTopicFocus,   setUseTopicFocus]   = useState(true)
  const [holidays, setHolidays] = useState([])
  const [newHol,   setNewHol]   = useState({ start:'', end:'', label:'' })

  // ── Step 4: Subject settings ─────────────────────────────────────────────
  const subjects = profile?.subjects || []
  const [subjectRatios, setSubjectRatios] = useState(
    Object.fromEntries(subjects.map(s => [s.name, 'global']))
  )
  const [subjectRatioValues, setSubjectRatioValues] = useState(
    Object.fromEntries(subjects.map(s => {
      if (s.name === 'English Language') return [s.name, [0, 1]]
      if (s.name === 'English Literature') return [s.name, [1, 2]]
      return [s.name, [2, 1]]
    }))
  )
  const [prioritySubjects, setPrioritySubjects] = useState([])

  // Load saved preferences
  React.useEffect(() => {
    if (!user) return
    const loadPrefs = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'settings', 'calendarPrefs'))
        if (snap.exists()) {
          const d = snap.data()
          if (d.contentRatio !== undefined) setContentRatio(d.contentRatio)
          if (d.examRatio !== undefined) setExamRatio(d.examRatio)
          if (d.contentDuration !== undefined) setContentDuration(d.contentDuration)
          if (d.sessionGap !== undefined) setSessionGap(d.sessionGap)
          if (d.emergencySessions !== undefined) setEmergency(d.emergencySessions)
          if (d.dayCap !== undefined) setDayCap(d.dayCap)
          if (d.dayCapCount !== undefined) setDayCapCount(d.dayCapCount)
          if (d.useTopicFocus !== undefined) setUseTopicFocus(d.useTopicFocus)
          if (d.subjectRatios) setSubjectRatios(d.subjectRatios)
          if (d.subjectRatioValues) setSubjectRatioValues(d.subjectRatioValues)
          if (d.prioritySubjects) setPrioritySubjects(d.prioritySubjects)
        }
      } catch (err) { console.error('Failed to load prefs', err) }
    }
    loadPrefs()
  }, [user])

  // ── Step 5: Replace mode ─────────────────────────────────────────────────
  const [replaceChoice, setReplaceChoice] = useState(null)

  function addHoliday() {
    if (!newHol.start || !newHol.end) return
    setHolidays(h => [...h, { ...newHol, id: Date.now().toString() }])
    setNewHol({ start:'', end:'', label:'' })
  }

  async function generate() {
    const builtSubjects = buildSubjectsFromProfile(profile).map(s => ({
      ...s,
      ratio: subjectRatios[s.name] === 'global' ? [contentRatio, examRatio] : subjectRatioValues[s.name],
      priority: prioritySubjects.includes(s.name),
    }))

    if (!builtSubjects.length) { toast.error('Add subjects first'); return }

    setLoading(true)
    let topicFocus = {}
    if (useTopicFocus) {
      try {
        const { getTopicsWithConfidence } = await import('../utils/firestore')
        const { getTopicsForSubject } = await import('../data/topics')
        const confTopics = await getTopicsWithConfidence(user.uid, profile?.subjects || [])
        for (const s of builtSubjects) {
          const papers = getTopicsForSubject(s.board || 'AQA', s.name, s.qualification || 'GCSE') || {}
          for (const paperNum of s.papers) {
            const paperTopics = papers[paperNum] || papers[String(paperNum)]
            if (!paperTopics?.length) continue
            // Weakest real topic on this specific paper — same "confidence<=2, ignore the
            // unrated default of 3" rule computeWeakTopics/Recommendations already use, so
            // this can't surface a topic nobody has actually rated as if it were evidence.
            const rated = confTopics
              .filter(t => t.subjectId === s.name && paperTopics.includes(t.name) && t.confidence > 0 && t.confidence <= 2)
              .sort((a, b) => a.confidence - b.confidence)
            if (rated.length) topicFocus[`${s.name}-${paperNum}`] = rated[0].name
          }
        }
      } catch (e) { /* graceful degradation — generation still works without topic focus */ }
    }

    const sessions = generateSchedule({
      subjects: builtSubjects,
      availability,
      startDate:          new Date(startDate),
      endDate:            new Date(endDate),
      holidays,
      contentRatio,
      examRatio,
      contentDuration,
      sessionGap,
      cappedDay:          dayCap,
      cappedDayMax:       dayCapCount,
      extendedFromDate:   extendedDate ? new Date(extendedDate) : null,
      includeEmergency:   emergencySessions,
      topicFocus,
    })
    setLoading(false)
    setPreview(sessions)
    setStep(6)
  }

  async function saveToCalendar() {
    setLoading(true)
    try {
      const BATCH_SIZE = 400 // Firestore caps a single batch at 500 ops — chunk well under that

      if (replaceChoice === 'replace') {
        const snap = await getDocs(
          query(collection(db,'users',user.uid,'sessions'), where('source','==','generated'))
        )
        // Only within this generation's date range — not every generated session ever
        // created. Filtered client-side (rather than a date range where() clause) to avoid
        // needing a new composite index on source+date for this collection.
        const toDelete = snap.docs.filter(d => {
          const date = d.data().date
          return date && date >= startDate && date <= endDate
        })
        for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
          const delBatch = writeBatch(db)
          toDelete.slice(i, i + BATCH_SIZE).forEach(d => delBatch.delete(doc(db,'users',user.uid,'sessions',d.id)))
          await delBatch.commit()
        }
      }

      // Was `preview.slice(0, 500)` — silently dropped anything past the first 500 generated
      // sessions with no error and no warning (a full term's worth, multiple sessions a day,
      // easily clears that). Chunking through writeBatch instead saves everything and is fewer
      // network round-trips than the old one-addDoc-at-a-time loop besides.
      for (let i = 0; i < preview.length; i += BATCH_SIZE) {
        const addBatch = writeBatch(db)
        preview.slice(i, i + BATCH_SIZE).forEach(s => {
          addBatch.set(doc(collection(db,'users',user.uid,'sessions')), { ...s, createdAt: serverTimestamp() })
        })
        await addBatch.commit()
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'settings', 'calendarPrefs'), {
          contentRatio, examRatio, contentDuration, sessionGap, emergencySessions, dayCap, dayCapCount, useTopicFocus,
          subjectRatios, subjectRatioValues, prioritySubjects: prioritySubjects || []
        }, { merge: true })
      } catch (err) { console.error('Failed to save prefs', err) }

      toast.success(`Added ${preview.length} session${preview.length !== 1 ? 's' : ''} to your calendar!`)
      onGenerated?.()
      onClose()
    } catch(err) { toast.error('Failed to save: ' + err.message) }
    finally { setLoading(false) }
  }

  const stats = preview ? {
    total:     preview.length,
    content:   preview.filter(s => s.type === 'Content Revision').length,
    exam:      preview.filter(s => s.type === 'Exam Practice').length,
    emergency: preview.filter(s => s.isEmergency).length,
    subjects:  [...new Set(preview.map(s => s.subject))].length,
  } : null

  const canProceed = {
    0: true,
    1: !!startDate && !!endDate,
    2: Object.values(availability).some(v => v.enabled),
    3: contentRatio + examRatio > 0,
    4: true,
    5: !!replaceChoice,
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:600,maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" style={{display:'flex',alignItems:'center',gap:8}}>
            <Calendar size={16} color="var(--accent-light)"/> Generate Revision Schedule
          </span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Progress */}
        <div style={{display:'flex',gap:3,marginBottom:6}}>
          {STEP_LABELS.map((_,i) => (
            <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?'var(--accent)':'var(--bg-hover)'}}/>
          ))}
        </div>
        <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:18}}>
          Step {step+1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
        </div>

        {/* ── Step 0: Exam dates ── */}
        {step === 0 && (
          <div>
            <h4 style={{marginBottom:8}}>Do you have exam dates set?</h4>
            <p style={{fontSize:'0.875rem',marginBottom:16}}>
              Exam dates allow the generator to add emergency revision sessions the day before each exam
              and lock the schedule onto the correct paper in exam week. You can still generate without them.
            </p>

            {hasExamDates ? (
              <div>
                <div style={{padding:12,background:'var(--success-pale)',border:'1px solid var(--success-border)',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                  <Check size={16} color="var(--success)"/>
                  <span style={{fontSize:'0.875rem',fontWeight:600}}>
                    {examDates.length} exam date{examDates.length!==1?'s':''} found — emergency sessions will be added automatically.
                  </span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:5,maxHeight:160,overflowY:'auto',marginBottom:14}}>
                  {examDates.slice(0,8).map(e=>(
                    <div key={e.id} style={{display:'flex',justifyContent:'space-between',padding:'5px 10px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',fontSize:'0.82rem'}}>
                      <span>{e.subject} Paper {e.paper}{e.paperName?` (${e.paperName})`:''}</span>
                      <span style={{color:'var(--text-muted)'}}>{e.examDate}</span>
                    </div>
                  ))}
                  {examDates.length > 8 && <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>...and {examDates.length-8} more</span>}
                </div>
              </div>
            ) : (
              <div style={{padding:14,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'var(--radius-md)',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <AlertCircle size={16} color="var(--warning)"/>
                  <span style={{fontWeight:600,fontSize:'0.875rem'}}>No exam dates found</span>
                </div>
                <p style={{fontSize:'0.82rem',marginBottom:10}}>
                  Without exam dates, emergency revision sessions won't be added and the schedule
                  won't prioritise papers by exam proximity. We recommend adding exam dates first.
                </p>
                <div style={{display:'flex',gap:8}}>
                  <Link to="/exams" onClick={onClose} className="btn btn-primary btn-sm">
                    <Plus size={13}/> Add exam dates
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setStep(1)}>
                    Continue without exam dates
                  </button>
                </div>
              </div>
            )}

            {hasExamDates && (
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button className="btn btn-primary" onClick={()=>setStep(1)}>
                  Continue <ChevronRight size={15}/>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Date range ── */}
        {step === 1 && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <h4 style={{marginBottom:0}}>When should your schedule run?</h4>
            <div className="grid-2" style={{gap:12}}>
              <div>
                <label className="label">Start date</label>
                <input className="input" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
              </div>
              <div>
                <label className="label">End date</label>
                <input className="input" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}/>
                {hasExamDates && <span style={{fontSize:'0.72rem',color:'var(--success)',display:'block',marginTop:3}}>Auto-set to your last exam date</span>}
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <label className="label">Extended end time from (optional)</label>
                <input className="input" type="date" value={extendedDate} onChange={e=>setExtendedDate(e.target.value)}/>
                <span style={{fontSize:'0.72rem',color:'var(--text-muted)',display:'block',marginTop:3}}>
                  From this date, sessions can run until a later end time (e.g. during study leave).
                </span>
              </div>
            </div>

            {/* Holidays */}
            <div>
              <label className="label">Holiday / unavailable periods (optional)</label>
              {holidays.map(h=>(
                <div key={h.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 10px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',fontSize:'0.82rem',marginBottom:5}}>
                  <span>{h.label||'Holiday'}: {h.start} → {h.end}</span>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>setHolidays(hs=>hs.filter(x=>x.id!==h.id))}><Trash2 size={12}/></button>
                </div>
              ))}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'flex-end'}}>
                <div style={{flex:1,minWidth:100}}>
                  <input className="input" placeholder="Label (e.g. Easter)" value={newHol.label} onChange={e=>setNewHol(h=>({...h,label:e.target.value}))} style={{fontSize:'0.8rem',padding:'5px 8px'}}/>
                </div>
                <input className="input" type="date" value={newHol.start} onChange={e=>setNewHol(h=>({...h,start:e.target.value}))} style={{flex:1,fontSize:'0.8rem',padding:'5px 8px'}}/>
                <input className="input" type="date" value={newHol.end} onChange={e=>setNewHol(h=>({...h,end:e.target.value}))} style={{flex:1,fontSize:'0.8rem',padding:'5px 8px'}}/>
                <button className="btn btn-secondary btn-sm" onClick={addHoliday} disabled={!newHol.start||!newHol.end}><Plus size={13}/></button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Availability ── */}
        {step === 2 && (
          <div>
            <h4 style={{marginBottom:4}}>When are you available to revise?</h4>
            <p style={{fontSize:'0.82rem',marginBottom:14}}>Set your start and end time for each day. Leave a day unticked for rest days.</p>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {DAYS.map(day => (
                <div key={day} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                  <input type="checkbox" checked={availability[day]?.enabled||false}
                    onChange={e=>setAvailability(a=>({...a,[day]:{...a[day],enabled:e.target.checked}}))}
                    style={{width:15,height:15,accentColor:'var(--accent)',flexShrink:0}}/>
                  <span style={{width:92,fontWeight:500,fontSize:'0.85rem',flexShrink:0}}>{day}</span>
                  {availability[day]?.enabled ? (
                    <>
                      <input type="time" className="input" style={{flex:1,padding:'3px 6px',fontSize:'0.82rem'}}
                        value={availability[day]?.startTime||'17:00'}
                        onChange={e=>setAvailability(a=>({...a,[day]:{...a[day],startTime:e.target.value}}))}/>
                      <span style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>to</span>
                      <input type="time" className="input" style={{flex:1,padding:'3px 6px',fontSize:'0.82rem'}}
                        value={availability[day]?.endTime||'21:00'}
                        onChange={e=>setAvailability(a=>({...a,[day]:{...a[day],endTime:e.target.value}}))}/>
                    </>
                  ) : <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Rest day</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Session preferences ── */}
        {step === 3 && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <h4 style={{marginBottom:0}}>How do you want to structure your sessions?</h4>

            {/* Ratio */}
            <div>
              <label className="label">Content vs exam practice ratio</label>
              <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:8}}>
                For every cycle: how many content sessions before one exam practice session?
              </p>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:3}}>Content</div>
                  <select className="select" style={{width:70}} value={contentRatio} onChange={e=>setContentRatio(parseInt(e.target.value))}>
                    {[0,1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <span style={{color:'var(--text-muted)',paddingTop:16}}>:</span>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:3}}>Exam practice</div>
                  <select className="select" style={{width:70}} value={examRatio} onChange={e=>setExamRatio(parseInt(e.target.value))}>
                    {[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <span style={{fontSize:'0.82rem',color:'var(--text-muted)',paddingTop:16}}>
                  = every {contentRatio+examRatio} sessions, {examRatio} will be exam practice
                </span>
              </div>
            </div>

            {/* Session duration */}
            <div>
              <label className="label">Session length (minutes)</label>
              <select className="select" style={{width:'auto'}} value={contentDuration} onChange={e=>setContentDuration(parseInt(e.target.value))}>
                {[30,45,60,90].map(n=><option key={n} value={n}>{n} minutes</option>)}
              </select>
            </div>

            {/* Gap */}
            <div>
              <label className="label">Break between sessions (minutes)</label>
              <select className="select" style={{width:'auto'}} value={sessionGap} onChange={e=>setSessionGap(parseInt(e.target.value))}>
                {[15,20,30,45,60].map(n=><option key={n} value={n}>{n} minutes</option>)}
              </select>
            </div>

            {/* Day cap */}
            <div>
              <label className="label">Session cap on a specific day (optional)</label>
              <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:8}}>
                Useful if one day has less time available (e.g. limit Wednesday to 1 session).
              </p>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <select className="select" style={{width:'auto'}} value={dayCap} onChange={e=>setDayCap(e.target.value)}>
                  <option value="none">No cap</option>
                  {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                {dayCap !== 'none' && (
                  <>
                    <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>max</span>
                    <select className="select" style={{width:70}} value={dayCapCount} onChange={e=>setDayCapCount(parseInt(e.target.value))}>
                      {[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                    <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>session{dayCapCount!==1?'s':''}</span>
                  </>
                )}
              </div>
            </div>

            {/* Emergency sessions */}
            <div>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={emergencySessions} onChange={e=>setEmergency(e.target.checked)}
                  style={{width:16,height:16,accentColor:'var(--accent)'}}/>
                <div>
                  <span style={{fontWeight:600,fontSize:'0.875rem'}}>Add emergency revision sessions</span>
                  <p style={{fontSize:'0.78rem',color:'var(--text-muted)',margin:0}}>
                    Adds a focused 45-minute session the day before each exam (requires exam dates).
                  </p>
                </div>
              </label>
            </div>

            {/* Topic focus */}
            <div>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={useTopicFocus} onChange={e=>setUseTopicFocus(e.target.checked)}
                  style={{width:16,height:16,accentColor:'var(--accent)'}}/>
                <div>
                  <span style={{fontWeight:600,fontSize:'0.875rem'}}>Focus content sessions on your weakest topics</span>
                  <p style={{fontSize:'0.78rem',color:'var(--text-muted)',margin:0}}>
                    Where a paper has topics you've rated low confidence on, names that session after the
                    specific topic instead of a generic "Content Revision" block. Falls back to generic
                    when there's no confidence data for a paper.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ── Step 4: Subject settings ── */}
        {step === 4 && (
          <div>
            <h4 style={{marginBottom:4}}>Subject-specific settings</h4>
            <p style={{fontSize:'0.82rem',marginBottom:14}}>
              Override the global ratio for individual subjects, or mark subjects as high priority.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {subjects.map(s=>(
                <div key={s.name} style={{padding:12,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,gap:10,flexWrap:'wrap'}}>
                    <span style={{fontWeight:600,fontSize:'0.875rem'}}>{s.name}</span>
                    <label style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.78rem',cursor:'pointer'}}>
                      <input type="checkbox" checked={prioritySubjects.includes(s.name)}
                        onChange={e=>setPrioritySubjects(ps=>e.target.checked?[...ps,s.name]:ps.filter(x=>x!==s.name))}
                        style={{accentColor:'var(--warning)'}}/>
                      High priority
                    </label>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                    <label style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Ratio:</label>
                    <select className="select" style={{fontSize:'0.78rem',padding:'3px 6px'}} value={subjectRatios[s.name]}
                      onChange={e=>setSubjectRatios(r=>({...r,[s.name]:e.target.value}))}>
                      <option value="global">Use global ({contentRatio}:{examRatio})</option>
                      <option value="custom">Custom</option>
                    </select>
                    {subjectRatios[s.name]==='custom'&&(
                      <div style={{display:'flex',gap:4,alignItems:'center'}}>
                        <select className="select" style={{width:55,fontSize:'0.78rem',padding:'3px 4px'}}
                          value={subjectRatioValues[s.name]?.[0]||2}
                          onChange={e=>setSubjectRatioValues(v=>({...v,[s.name]:[parseInt(e.target.value),v[s.name]?.[1]||1]}))}>
                          {[0,1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
                        </select>
                        <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>:</span>
                        <select className="select" style={{width:55,fontSize:'0.78rem',padding:'3px 4px'}}
                          value={subjectRatioValues[s.name]?.[1]||1}
                          onChange={e=>setSubjectRatioValues(v=>({...v,[s.name]:[v[s.name]?.[0]||2,parseInt(e.target.value)]}))}>
                          {[1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 5: Review settings ── */}
        {step === 5 && (
          <div>
            <h4 style={{marginBottom:12}}>Review your preferences</h4>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16,fontSize:'0.875rem'}}>
              {[
                ['Date range', `${startDate} → ${endDate}`],
                ['Available days', Object.entries(availability).filter(([,v])=>v.enabled).map(([k])=>k.slice(0,3)).join(', ')],
                ['Ratio', `${contentRatio} content : ${examRatio} exam practice`],
                ['Session length', `${contentDuration} minutes`],
                ['Session gap', `${sessionGap} minutes`],
                ['Day cap', dayCap==='none'?'None':`${dayCap} max ${dayCapCount} session${dayCapCount!==1?'s':''}`],
                ['Emergency sessions', emergencySessions?`Yes (${examDates.length} exams)`:'No'],
                ['Topic focus', useTopicFocus?'On — uses your weakest topics':'Off — generic titles'],
                ['Holidays', holidays.length?holidays.map(h=>h.label||'Holiday').join(', '):'None'],
              ].map(([label, val])=>(
                <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'6px 12px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
                  <span style={{color:'var(--text-muted)'}}>{label}</span>
                  <span style={{fontWeight:600,textAlign:'right',maxWidth:'60%'}}>{val}</span>
                </div>
              ))}
            </div>

            {/* Replace or add */}
            <label className="label">What should happen to your existing calendar?</label>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {[
                {val:'replace',label:'Replace existing generated sessions',desc:`Removes previous auto-generated sessions between ${startDate} and ${endDate} only — manually added sessions and anything outside this range are kept`},
                {val:'add',label:'Add to existing calendar',desc:'All current sessions are kept — new ones are added on top'},
              ].map(opt=>(
                <button key={opt.val} onClick={()=>setReplaceChoice(opt.val)}
                  style={{padding:'10px 14px',borderRadius:'var(--radius-md)',border:`2px solid ${replaceChoice===opt.val?'var(--accent)':'var(--border)'}`,background:replaceChoice===opt.val?'var(--accent-pale)':'var(--bg-surface)',textAlign:'left',cursor:'pointer',width:'100%'}}>
                  <div style={{fontWeight:600,fontSize:'0.875rem',marginBottom:2}}>{opt.label}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 6: Result ── */}
        {step === 6 && stats && (
          <div>
            <h4 style={{marginBottom:12}}>Schedule generated</h4>
            <div className="grid-4" style={{gap:8,marginBottom:14}}>
              {[
                {l:'Total',     v:stats.total,     c:'var(--accent-light)'},
                {l:'Content',   v:stats.content,   c:'#0d9488'},
                {l:'Exam prac.',v:stats.exam,       c:'var(--info)'},
                {l:'Emergency', v:stats.emergency,  c:'var(--danger)'},
              ].map(s=>(
                <div key={s.l} style={{padding:'8px 10px',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid var(--border)',textAlign:'center'}}>
                  <div style={{fontWeight:800,fontSize:'1.3rem',color:s.c}}>{s.v}</div>
                  <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{maxHeight:200,overflowY:'auto',marginBottom:14,borderRadius:'var(--radius-md)',border:'1px solid var(--border)'}}>
              {preview.slice(0,10).map((s,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'5px 10px',borderBottom:'1px solid var(--border)',fontSize:'0.78rem',alignItems:'center'}}>
                  <span style={{color:'var(--text-muted)',flexShrink:0,minWidth:68}}>{s.date}</span>
                  <span style={{color:'var(--text-muted)',flexShrink:0,minWidth:42}}>{s.start}</span>
                  <span style={{flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:s.isEmergency?'var(--danger)':'var(--text-primary)',fontStyle:s.isEmergency?'italic':'normal'}}>{s.title}</span>
                </div>
              ))}
              {preview.length>10&&<div style={{padding:'4px 10px',fontSize:'0.72rem',color:'var(--text-muted)'}}>…and {preview.length-10} more sessions</div>}
            </div>

            <div style={{display:'flex',gap:8,justifyContent:'space-between',flexWrap:'wrap'}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>downloadICS(preview,'revision-schedule.ics')}>
                <Download size={13}/> Download ICS
              </button>
              <button className="btn btn-primary" onClick={saveToCalendar} disabled={loading}>
                {loading?'Saving…':<><Check size={15}/> Save to calendar</>}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step !== 0 && step !== 6 && (
          <div style={{display:'flex',justifyContent:'space-between',marginTop:20}}>
            <button className="btn btn-secondary" onClick={()=>setStep(s=>s-1)}>
              <ChevronLeft size={15}/> Back
            </button>
            {step < 5 ? (
              <button className="btn btn-primary" onClick={()=>setStep(s=>s+1)} disabled={!canProceed[step]}>
                Continue <ChevronRight size={15}/>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={generate} disabled={!replaceChoice || loading}>
                {loading ? 'Generating…' : <><Clock size={15}/> Generate schedule</>}
              </button>
            )}
          </div>
        )}
        {step === 6 && (
          <div style={{display:'flex',justifyContent:'flex-start',marginTop:12}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setStep(5)}>
              <ChevronLeft size={13}/> Back to settings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
