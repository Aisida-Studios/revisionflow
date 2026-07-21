// src/pages/Onboarding.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { awardXP } from '../utils/firestore'
import { db } from '../firebase'
import { generateCalendarPlan } from '../utils/ai'
import {
  GCSE_SUBJECTS, ALEVEL_SUBJECTS, AS_LEVEL_SUBJECTS, BTEC_L2_SUBJECTS, BTEC_L3_SUBJECTS,
  EXAM_BOARDS, getGradeOptions, SUBJECT_COLOURS,
} from '../data/subjects'
import { isTiered, EXAM_DATES_2026 } from '../data/examDates2026'
import { getAllTopicsFlat } from '../data/topics'
import { buildTopicId } from '../utils/topicId'
import toast from 'react-hot-toast'
import { Zap, Plus, X, ChevronRight, ChevronLeft, Check, Users, Brain, Sparkles, Star } from 'lucide-react'

const STEPS   = ['Welcome', 'Qualification', 'Subjects', 'Targets', 'Availability', 'AI Plan', 'Friends', 'Done']
const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DEFAULT_TIMES = {
  Monday:'17:00', Tuesday:'17:00', Wednesday:'16:00',
  Thursday:'17:00', Friday:'17:00', Saturday:'12:00', Sunday:'Rest day',
}

const STEP_ICONS = ['👋','🎓','📚','🎯','📅','🤖','👥','🎉']

// Tiny inline confetti
function Confetti() {
  const colours = ['#7c3aed','#a855f7','#f59e0b','#22c55e','#3b82f6','#ec4899']
  const pieces  = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 1.5 + Math.random() * 1,
    colour: colours[i % colours.length],
    size: 6 + Math.random() * 6,
  }))
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', borderRadius:16 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:'absolute', left: p.x+'%', top:'-10px',
          width: p.size, height: p.size, borderRadius: p.size/2,
          background: p.colour,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
      <style>{`@keyframes confettiFall { to { transform: translateY(500px) rotate(720deg); opacity:0; } }`}</style>
    </div>
  )
}

// XP preview pill — animates up when xp changes
function XPPill({ xp }) {
  const prev = useRef(xp)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (xp !== prev.current) { setFlash(true); prev.current = xp; setTimeout(() => setFlash(false), 600) }
  }, [xp])
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px',
      borderRadius:999, border:'1px solid rgba(124,58,237,0.3)',
      background: flash ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.08)',
      transition:'background 0.3s', fontSize:'0.82rem', fontWeight:700,
      color:'var(--accent-light)',
    }}>
      <Zap size={13} /> +{xp} XP preview
    </div>
  )
}

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate  = useNavigate()
  const [step,    setStep]    = useState(0)
  const [dir,     setDir]     = useState(1)   // 1 = forward, -1 = back
  const [saving,  setSaving]  = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan,    setAiPlan]    = useState('')
  const [planDone,  setPlanDone]  = useState(false)

  const [qual,    setQual]    = useState('GCSE')
  const [subjects, setSubjects] = useState([])
  const [newSubj, setNewSubj] = useState({ name:'', board:'AQA', tier:'N/A', currentGrade:'', targetGrade:'' })
  const [globalTarget, setGlobalTarget] = useState(() => getGradeOptions('','GCSE','N/A')[0] || '9')
  const [availability, setAvailability] = useState(
    Object.fromEntries(DAYS.map(d => [d, { enabled: d !== 'Sunday', startTime: DEFAULT_TIMES[d], endTime:'21:00' }]))
  )
  const [username, setUsername] = useState('')

  useEffect(() => {
    const opts = getGradeOptions('', qual, 'N/A')
    setGlobalTarget(opts[0] || '9')
  }, [qual])

  const subjectList = qual==='A-Level' ? ALEVEL_SUBJECTS
    : qual==='AS-Level' ? AS_LEVEL_SUBJECTS
    : qual==='BTEC-L2' ? BTEC_L2_SUBJECTS
    : qual==='BTEC-L3' ? BTEC_L3_SUBJECTS
    : GCSE_SUBJECTS

  const gradeOptions       = getGradeOptions(newSubj.name, qual, newSubj.tier)
  const globalGradeOptions = getGradeOptions('', qual, 'N/A')

  // XP preview: 100 per subject + 50 for AI plan + 25 base
  const xpPreview = 25 + subjects.length * 100 + (planDone ? 50 : 0)

  function onSubjName(name) {
    setNewSubj(s => ({ ...s, name, tier: (isTiered(name) && qual === 'GCSE') ? 'Higher' : 'N/A' }))
  }

  function addSubject() {
    if (!newSubj.name || subjects.find(s => s.name === newSubj.name)) return
    const opts   = getGradeOptions(newSubj.name, qual, newSubj.tier)
    const target = newSubj.targetGrade || (opts.includes(globalTarget) ? globalTarget : opts[0])
    setSubjects(s => [...s, { ...newSubj, qualification: qual, targetGrade: target, id: Date.now().toString() }])
    setNewSubj({ name:'', board:'AQA', tier:'N/A', currentGrade:'', targetGrade:'' })
  }

  function updateSubj(id, field, val) {
    setSubjects(s => s.map(x => x.id === id ? { ...x, [field]: val } : x))
  }

  function go(delta) {
    setDir(delta)
    setStep(s => s + delta)
  }

  async function generatePlan() {
    setAiLoading(true)
    const res = await generateCalendarPlan({
      subjects: subjects.map(s => ({ name:s.name, board:s.board, qualification:s.qualification||qual, currentGrade:s.currentGrade, targetGrade:s.targetGrade })),
      availableDays: Object.entries(availability).filter(([,v]) => v.enabled).map(([k]) => k),
      startTimes: Object.fromEntries(Object.entries(availability).map(([k,v]) => [k, v.startTime])),
      endTime:'21:00', ratio:'2:1', weeksUntilExams:12,
    })
    setAiPlan(res.text || res.error || '')
    setPlanDone(true)
    setAiLoading(false)
  }

  async function seedTopics(uid) {
    for (const s of subjects) {
      const subjQual = s.qualification || qual
      const topics = getAllTopicsFlat(s.board, s.name, subjQual)
      for (const t of topics) {
        const id = buildTopicId(s.board, subjQual, s.name, t.name)
        await setDoc(doc(db,'users',uid,'topics',id), {
          name:t.name, paper:t.paper, subjectId:s.name, board:s.board, qualification:subjQual,
          confidence:3, notes:'', createdAt:serverTimestamp(), updatedAt:serverTimestamp(),
        }, { merge:true })
      }
    }
  }

  async function finish() {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db,'users',user.uid), {
        qualification:qual, subjects,
        startingGrades: Object.fromEntries(subjects.map(s => [s.name, s.currentGrade])),
        targetGrades:   Object.fromEntries(subjects.map(s => [s.name, s.targetGrade||globalTarget])),
        availability,
        username: username || user.uid.slice(0,8),
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      })
      await seedTopics(user.uid)
      await awardXP(user.uid, xpPreview, 'Onboarding complete')
      await refreshProfile()
      navigate('/dashboard')
      toast.success('Welcome to RevisionFlow! 🎉')
    } catch(err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const canContinue = !(step === 2 && subjects.length === 0)

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, background:'var(--bg-base)',
    }}>
      <div style={{ width:'100%', maxWidth:580 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{
            width:44, height:44, borderRadius:12,
            background:'linear-gradient(135deg,#7c3aed,#a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px',
          }}>
            <Zap size={22} color="#fff"/>
          </div>
          <span style={{ fontWeight:800, fontSize:'1.05rem' }}>RevisionFlow</span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:6 }}>
          <div style={{ display:'flex', gap:3 }}>
            {STEPS.map((_,i) => (
              <div key={i} style={{
                flex:1, height:5, borderRadius:3,
                background: i < step ? 'var(--accent)' : i === step ? 'var(--accent-light)' : 'var(--bg-hover)',
                transition:'background 0.4s',
              }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:'0.72rem', color:'var(--text-muted)' }}>
            <span>{STEPS[step]}</span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <XPPill xp={xpPreview} />
              <span>Step {step+1}/{STEPS.length}</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding:28, minHeight:420, position:'relative', overflow:'hidden' }}>

          {/* Step 0 — Welcome */}
          {step===0 && (
            <div className="fade-in" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'3.5rem', marginBottom:12 }}>👋</div>
              <h2 style={{ marginBottom:8 }}>Let&apos;s set you up</h2>
              <p style={{ marginBottom:6, color:'var(--text-secondary)', lineHeight:1.7 }}>
                5 minutes. We&apos;ll pre-load all your spec topics, auto-fill your exam dates,
                and generate a personalised AI revision plan.
              </p>
              <div style={{ display:'flex', justifyContent:'center', gap:16, margin:'20px 0', flexWrap:'wrap' }}>
                {[['📚','Topics pre-loaded'],['📅','Exam dates auto-filled'],['🤖','AI study plan'],['🏆','Start earning XP']].map(([e,t]) => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', fontWeight:600, color:'var(--text-secondary)' }}>
                    <span>{e}</span> {t}
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ textAlign:'left', marginBottom:0 }}>
                <label className="label">Choose a username (optional)</label>
                <input className="input" placeholder="e.g. femi_revision" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} />
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4, display:'block' }}>
                  Your public profile: revision-flow.netlify.app/u/{username || 'yourname'}
                </span>
              </div>
            </div>
          )}

          {/* Step 1 — Qualification */}
          {step===1 && (
            <div className="fade-in">
              <h3 style={{ marginBottom:4 }}>What are you studying?</h3>
              <p style={{ marginBottom:16, fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                Choose your qualification. You can mix-and-match in Settings later.
              </p>

              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>
                Secondary school (Year 10–11)
              </div>
              {[
                { id:'GCSE',    label:'GCSE',                       desc:'Grades 9–1 · Most common UK qualification at 16' },
                { id:'BTEC-L2', label:'BTEC Tech Award (Level 2)',  desc:'Grades D*–P · Vocational, taken alongside GCSEs' },
              ].map(({ id:q, label, desc }) => (
                <button key={q} onClick={() => setQual(q)} style={{
                  width:'100%', textAlign:'left', cursor:'pointer', marginBottom:8,
                  border:`2px solid ${qual===q ? 'var(--accent)' : 'var(--border)'}`,
                  background: qual===q ? 'rgba(124,58,237,0.08)' : 'var(--bg-card)',
                  borderRadius:'var(--radius-md)', padding:'14px 16px',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  transition:'all 0.15s',
                }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{label}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{desc}</div>
                  </div>
                  {qual===q && <Check size={16} color="var(--accent-light)" />}
                </button>
              ))}

              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8, marginTop:16 }}>
                Sixth form / college (Year 12–13)
              </div>
              {[
                { id:'AS-Level', label:'AS-Level',                  desc:'Grades A–E · Standalone one-year qualification, separate from A-Level' },
                { id:'A-Level', label:'A-Level',                    desc:'Grades A*–E · Two-year, university entrance qualification' },
                { id:'BTEC-L3', label:'BTEC National (Level 3)',    desc:'Grades D*D*–U · Vocational, equivalent to A-Levels' },
              ].map(({ id:q, label, desc }) => (
                <button key={q} onClick={() => setQual(q)} style={{
                  width:'100%', textAlign:'left', cursor:'pointer', marginBottom:8,
                  border:`2px solid ${qual===q ? 'var(--accent)' : 'var(--border)'}`,
                  background: qual===q ? 'rgba(124,58,237,0.08)' : 'var(--bg-card)',
                  borderRadius:'var(--radius-md)', padding:'14px 16px',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  transition:'all 0.15s',
                }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{label}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{desc}</div>
                  </div>
                  {qual===q && <Check size={16} color="var(--accent-light)" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Subjects */}
          {step===2 && (
            <div className="fade-in">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <h3 style={{ margin:0 }}>Add your subjects</h3>
                {subjects.length > 0 && (
                  <span style={{ fontSize:'0.78rem', color:'var(--success)', fontWeight:700 }}>
                    {subjects.length} added · +{subjects.length * 100} XP
                  </span>
                )}
              </div>
              <p style={{ marginBottom:14, fontSize:'0.82rem', color:'var(--text-muted)' }}>
                Topics auto-load · exam dates auto-fill · add as many as you take
              </p>

              {/* Subject chips — appear as you add each one */}
              {subjects.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14 }}>
                  {subjects.map(s => (
                    <div key={s.id} style={{
                      display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
                      borderRadius:999, fontWeight:700, fontSize:'0.8rem',
                      background: (SUBJECT_COLOURS[s.name] || 'var(--accent)') + '22',
                      border: `1px solid ${SUBJECT_COLOURS[s.name] || 'var(--accent)'}55`,
                      color: SUBJECT_COLOURS[s.name] || 'var(--accent)',
                      animation:'chipIn 0.25s ease',
                    }}>
                      {s.name}
                      <span style={{ fontSize:'0.68rem', opacity:0.7, fontWeight:400 }}>{s.board}</span>
                      <button onClick={() => setSubjects(ss => ss.filter(x => x.id !== s.id))}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:0, lineHeight:1, opacity:0.6, color:'inherit' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <style>{`@keyframes chipIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }`}</style>
                </div>
              )}

              {/* Add form */}
              <div style={{ background:'var(--bg-surface)', padding:14, borderRadius:12, border:'1px solid var(--border)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  <div>
                    <label className="label">Subject</label>
                    <select className="select" value={newSubj.name} onChange={e => onSubjName(e.target.value)}>
                      <option value="">Select…</option>
                      {subjectList.filter(s => !subjects.find(x => x.name === s)).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Exam board</label>
                    <select className="select" value={newSubj.board} onChange={e => setNewSubj(s => ({ ...s, board:e.target.value }))}>
                      {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {newSubj.name && isTiered(newSubj.name) && qual === 'GCSE' && (
                    <div>
                      <label className="label">Tier</label>
                      <select className="select" value={newSubj.tier} onChange={e => setNewSubj(s => ({ ...s, tier:e.target.value }))}>
                        <option value="Higher">Higher</option>
                        <option value="Foundation">Foundation</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="label">Current grade</label>
                    <select className="select" value={newSubj.currentGrade} onChange={e => setNewSubj(s => ({ ...s, currentGrade:e.target.value }))}>
                      <option value="">Unknown</option>
                      {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={addSubject} disabled={!newSubj.name}>
                  <Plus size={14}/> Add subject
                </button>
              </div>

              {subjects.length === 0 && (
                <p style={{ marginTop:10, fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center' }}>
                  Add at least one subject to continue
                </p>
              )}
            </div>
          )}

          {/* Step 3 — Targets */}
          {step===3 && (
            <div className="fade-in">
              <h3 style={{ marginBottom:4 }}>Set your grade targets</h3>
              <p style={{ marginBottom:14, fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                The AI uses these to prioritise what you revise and predict your progress.
              </p>
              <div style={{ padding:12, background:'rgba(124,58,237,0.07)', borderRadius:10, border:'1px solid rgba(124,58,237,0.2)', marginBottom:14 }}>
                <label className="label">Apply one target to all subjects</label>
                <select className="select" value={globalTarget} onChange={e => {
                  const val = e.target.value
                  setGlobalTarget(val)
                  setSubjects(s => s.map(x => {
                    const opts = getGradeOptions(x.name, qual, x.tier)
                    return { ...x, targetGrade: opts.includes(val) ? val : opts[0] || val }
                  }))
                }}>
                  {globalGradeOptions.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {subjects.map(s => (
                  <div key={s.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px', background:'var(--bg-surface)', borderRadius:10,
                    border:'1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{s.name}</div>
                      {s.currentGrade && (
                        <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>Currently: {s.currentGrade}</div>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Target →</span>
                      <select className="select" style={{ width:'auto', fontWeight:700 }}
                        value={s.targetGrade || globalTarget}
                        onChange={e => updateSubj(s.id, 'targetGrade', e.target.value)}>
                        {getGradeOptions(s.name, qual, s.tier).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Availability */}
          {step===4 && (
            <div className="fade-in">
              <h3 style={{ marginBottom:4 }}>When can you revise?</h3>
              <p style={{ marginBottom:14, fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                Used for AI schedule generation. Change any time in Settings.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {DAYS.map(day => (
                  <div key={day} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
                    background:'var(--bg-surface)', borderRadius:10, border:'1px solid var(--border)',
                  }}>
                    <input type="checkbox" checked={availability[day].enabled}
                      onChange={e => setAvailability(a => ({ ...a, [day]:{ ...a[day], enabled:e.target.checked } }))}
                      style={{ width:15, height:15, accentColor:'var(--accent)', flexShrink:0 }} />
                    <span style={{ width:92, fontWeight:600, fontSize:'0.85rem', flexShrink:0 }}>{day}</span>
                    {availability[day].enabled ? (
                      <>
                        <input type="time" className="input" style={{ flex:1, padding:'4px 7px', fontSize:'0.84rem' }}
                          value={availability[day].startTime}
                          onChange={e => setAvailability(a => ({ ...a, [day]:{ ...a[day], startTime:e.target.value } }))} />
                        <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>–</span>
                        <input type="time" className="input" style={{ flex:1, padding:'4px 7px', fontSize:'0.84rem' }}
                          value={availability[day].endTime}
                          onChange={e => setAvailability(a => ({ ...a, [day]:{ ...a[day], endTime:e.target.value } }))} />
                      </>
                    ) : (
                      <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Rest day</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — AI Plan */}
          {step===5 && (
            <div className="fade-in">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <Brain size={20} color="var(--accent-light)"/>
                <h3 style={{ margin:0 }}>Your AI revision plan</h3>
              </div>
              <p style={{ marginBottom:16, fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                Built around your {subjects.length} subject{subjects.length!==1?'s':''}, targets, and availability using AI.
              </p>
              {!planDone ? (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ fontSize:'3rem', marginBottom:12 }}>🤖</div>
                  <button className="btn btn-primary" onClick={generatePlan} disabled={aiLoading} style={{ padding:'11px 28px' }}>
                    {aiLoading ? 'Generating your plan…' : <><Sparkles size={15}/> Generate my AI study plan</>}
                  </button>
                  {aiLoading && (
                    <div style={{ marginTop:16 }}>
                      <div className="spinner" style={{ margin:'0 auto' }}/>
                      <p style={{ marginTop:8, fontSize:'0.8rem', color:'var(--text-muted)' }}>~15 seconds…</p>
                    </div>
                  )}
                  <div style={{ marginTop:14 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => go(1)}>Skip for now →</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)',
                    borderRadius:10, padding:14, maxHeight:260, overflowY:'auto',
                    fontSize:'0.82rem', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:10,
                  }}>
                    {aiPlan}
                  </div>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    ✓ Plan generated. You can also generate a calendar in the app after setup.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 6 — Friends */}
          {step===6 && (
            <div className="fade-in" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>👥</div>
              <h3 style={{ marginBottom:8 }}>RevisionFlow is better with friends</h3>
              <p style={{ marginBottom:20, color:'var(--text-secondary)', fontSize:'0.9rem' }}>
                Compete on leaderboards, share streaks, and stay accountable together.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20, textAlign:'left' }}>
                {[
                  ['🏆','XP leaderboard with your friends'],
                  ['🔥','See each other\'s streaks'],
                  ['🌐','Share your profile link'],
                  ['📊','Compare grade progress'],
                ].map(([e, t]) => (
                  <div key={t} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                    background:'var(--bg-surface)', borderRadius:10, border:'1px solid var(--border)',
                    fontSize:'0.875rem',
                  }}>
                    <span style={{ fontSize:'1.2rem' }}>{e}</span> {t}
                  </div>
                ))}
              </div>
              <div style={{ padding:'10px 14px', background:'rgba(124,58,237,0.06)', borderRadius:10, border:'1px solid rgba(124,58,237,0.2)', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                Your profile link: <strong style={{ color:'var(--accent-light)' }}>revision-flow.netlify.app/u/{username || user?.uid?.slice(0,8)}</strong>
              </div>
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:10 }}>Add friends from the Friends page after setup.</p>
            </div>
          )}

          {/* Step 7 — Done */}
          {step===7 && (
            <div className="fade-in" style={{ textAlign:'center', position:'relative' }}>
              <Confetti />
              <div style={{ fontSize:'4rem', marginBottom:12, position:'relative', zIndex:1 }}>🎉</div>
              <h2 style={{ marginBottom:8, position:'relative', zIndex:1 }}>You&apos;re all set!</h2>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:999, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', marginBottom:20, position:'relative', zIndex:1 }}>
                <Zap size={15} color="var(--accent-light)" />
                <span style={{ fontWeight:800, color:'var(--accent-light)', fontSize:'0.9rem' }}>+{xpPreview} XP waiting for you</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:20, textAlign:'left', position:'relative', zIndex:1 }}>
                {[
                  { label:`${subjects.length} subject${subjects.length!==1?'s':''} added`, icon:'📚' },
                  { label:'All spec topics pre-loaded', icon:'✅' },
                  { label:'Grade targets set', icon:'🎯' },
                  { label:'AI advisor ready to use', icon:'🤖' },
                  { label:'Streak tracking starts today', icon:'🔥' },
                  { label:`Revision schedule ${planDone ? 'generated' : 'ready to generate in Calendar'}`, icon:'📅' },
                ].map(({ label, icon }) => (
                  <div key={label} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                    background:'var(--bg-surface)', borderRadius:10, border:'1px solid var(--border)', fontSize:'0.875rem',
                  }}>
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, gap:10 }}>
            <button className="btn btn-secondary" onClick={() => go(-1)}
              style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
              <ChevronLeft size={15}/> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => go(1)} disabled={!canContinue}
                style={{ padding:'10px 24px' }}>
                {step === STEPS.length - 2 ? 'Almost done' : 'Continue'} <ChevronRight size={15}/>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={finish} disabled={saving}
                style={{ padding:'10px 24px', fontSize:'0.95rem' }}>
                {saving ? 'Setting up…' : '🚀 Go to dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
