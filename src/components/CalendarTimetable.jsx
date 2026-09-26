// src/components/CalendarTimetable.jsx
// School timetable editor — lesson periods and free periods, per weekday. Free periods
// marked here are what CalendarGenerator.jsx's "Also schedule revision inside my free
// periods" toggle (and scheduler.js's scheduleFreePeriods()) read from.
import React, { useState, useEffect } from 'react'
import { getISOWeek } from 'date-fns'
import { getUserTimetable, saveUserTimetable } from '../utils/firestore'
import { weekLabelForDate } from '../utils/scheduler'
import { formatDuration } from '../utils/calendar'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, X, BookOpen, Coffee, Repeat } from 'lucide-react'

const DEFAULT_ROTATION = { enabled: false, evenWeekLabel: 'A' }

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function rangeMinutes(start, end) {
  const [sh, sm] = String(start || '0:0').split(':').map(Number)
  const [eh, em] = String(end   || '0:0').split(':').map(Number)
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
}

function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export default function CalendarTimetable({ user, profile }) {
  const [timetable, setTimetable] = useState({})
  const [rotation,  setRotation]  = useState(DEFAULT_ROTATION)
  const [viewingWeek, setViewingWeek] = useState('A') // which week's periods are shown/edited
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(null) // { day, period? } | null

  useEffect(() => {
    if (!user) return
    getUserTimetable(user.uid)
      .then(({ days, rotation: savedRotation }) => {
        setTimetable(days || {})
        const r = savedRotation || DEFAULT_ROTATION
        setRotation(r)
        // Default to whichever week it actually is today, so opening the tab shows the
        // relevant week's periods first rather than always defaulting to "A".
        if (r.enabled) setViewingWeek(weekLabelForDate(new Date(), r) || 'A')
      })
      .catch(() => toast.error('Could not load your timetable'))
      .finally(() => setLoading(false))
  }, [user])

  const hasSixthForm = (profile?.subjects || []).some(
    s => s.qualification === 'A-Level' || s.qualification === 'AS-Level'
  )
  const subjectNames = [...new Set((profile?.subjects || []).map(s => s.name))]

  async function persist(next) {
    setTimetable(next) // update immediately — saving happens in the background
    try {
      await saveUserTimetable(user.uid, next) // rotation omitted -> stays as currently saved
    } catch {
      toast.error('Could not save your timetable — please try again')
    }
  }

  async function updateRotation(next) {
    setRotation(next)
    try {
      await saveUserTimetable(user.uid, timetable, next)
    } catch {
      toast.error('Could not save your rotation settings — please try again')
    }
  }

  // "Is this week Week A or Week B?" is a one-off, relative-to-today question — from the
  // answer plus today's actual ISO week parity, evenWeekLabel (which label applies on
  // even-numbered ISO weeks) is fixed for good, so any future date can be resolved without
  // re-asking.
  function enableRotation(todayIsWhichWeek) {
    const todayIsEvenISOWeek = getISOWeek(new Date()) % 2 === 0
    const evenWeekLabel = todayIsEvenISOWeek
      ? todayIsWhichWeek
      : (todayIsWhichWeek === 'A' ? 'B' : 'A')
    updateRotation({ enabled: true, evenWeekLabel })
    setViewingWeek(todayIsWhichWeek)
  }

  function disableRotation() {
    updateRotation({ ...rotation, enabled: false })
  }

  function savePeriod(day, period) {
    const existing = timetable[day] || []
    const alreadyThere = existing.some(p => p.id === period.id)
    const updatedDay = alreadyThere
      ? existing.map(p => (p.id === period.id ? period : p))
      : [...existing, period]
    persist({ ...timetable, [day]: updatedDay })
    setEditing(null)
  }

  function deletePeriod(day, id) {
    persist({ ...timetable, [day]: (timetable[day] || []).filter(p => p.id !== id) })
  }

  const allFreePeriods = Object.values(timetable).flat().filter(p => p && p.type === 'free')
  const totalFreeMins  = allFreePeriods.reduce((sum, p) => sum + rangeMinutes(p.startTime, p.endTime), 0)

  if (loading) {
    return (
      <div className="rf-timetable-panel">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading your timetable…</p>
      </div>
    )
  }

  return (
    <div className="rf-timetable-panel">
      <div className="rf-timetable-intro">
        <h4 style={{ marginBottom: 4 }}>Your school timetable</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 0 }}>
          Log your lessons and free periods for each day.
          {hasSixthForm && ' Mark study or free periods as "Free period" so the schedule generator can offer to revise in them.'}
          {allFreePeriods.length > 0 && ` You've got ${allFreePeriods.length} free period${allFreePeriods.length !== 1 ? 's' : ''} set up (${formatDuration(totalFreeMins)} total).`}
        </p>

        <div className="rf-timetable-rotation">
          {rotation.enabled ? (
            <label className="rf-timetable-rotation-toggle">
              <input type="checkbox" checked onChange={disableRotation}
                style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
              <Repeat size={13} />
              <span>Two-week (A/B) rotation is on</span>
            </label>
          ) : (
            <div className="rf-timetable-rotation-setup">
              <span><Repeat size={13} /> Does your school use a two-week (A/B) timetable?</span>
              <div className="rf-timetable-rotation-buttons">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => enableRotation('A')}>This week is A</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => enableRotation('B')}>This week is B</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {rotation.enabled && (
        <div className="tabs rf-timetable-week-toggle" style={{ padding: 3, alignSelf: 'flex-start' }}>
          <button className={`tab${viewingWeek === 'A' ? ' active' : ''}`} onClick={() => setViewingWeek('A')}>Week A</button>
          <button className={`tab${viewingWeek === 'B' ? ' active' : ''}`} onClick={() => setViewingWeek('B')}>Week B</button>
        </div>
      )}

      <div className="rf-timetable-days">
        {DAYS.map(day => {
          const dayPeriods = [...(timetable[day] || [])].sort((a, b) =>
            (a.startTime || '').localeCompare(b.startTime || ''))
          // With rotation off, every period applies (none should carry a week tag anyway).
          // With rotation on, show periods for every week PLUS whichever single week is
          // tagged and currently being viewed.
          const periods = rotation.enabled
            ? dayPeriods.filter(p => !p.week || p.week === viewingWeek)
            : dayPeriods
          return (
            <div key={day} className="card rf-timetable-day-card">
              <div className="rf-timetable-day-head">
                <h5>{day}</h5>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing({ day })}
                  aria-label={`Add period to ${day}`}>
                  <Plus size={14} />
                </button>
              </div>
              {periods.length === 0 ? (
                <p className="rf-timetable-empty">No periods added</p>
              ) : (
                <div className="rf-timetable-period-list">
                  {periods.map(p => (
                    <div key={p.id} className={`rf-timetable-period${p.type === 'free' ? ' is-free' : ''}`}>
                      {p.type === 'free' ? <Coffee size={13} /> : <BookOpen size={13} />}
                      <span className="rf-timetable-period-label">
                        {p.label || (p.type === 'free' ? 'Free period' : 'Lesson')}
                      </span>
                      {rotation.enabled && p.week && <span className="rf-timetable-period-week">Wk {p.week}</span>}
                      <span className="rf-timetable-period-time">{p.startTime}–{p.endTime}</span>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing({ day, period: p })}
                        aria-label="Edit period">
                        <Pencil size={11} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}
                        onClick={() => deletePeriod(day, p.id)} aria-label="Delete period">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editing && (
        <PeriodModal
          day={editing.day}
          period={editing.period}
          subjects={subjectNames}
          rotationEnabled={rotation.enabled}
          defaultWeek={viewingWeek}
          onClose={() => setEditing(null)}
          onSave={period => savePeriod(editing.day, period)}
        />
      )}
    </div>
  )
}

function PeriodModal({ day, period, subjects, rotationEnabled, defaultWeek, onClose, onSave }) {
  const [type, setType]           = useState(period?.type || 'lesson')
  const [label, setLabel]         = useState(period?.label || '')
  const [startTime, setStartTime] = useState(period?.startTime || '09:00')
  const [endTime, setEndTime]     = useState(period?.endTime || '10:00')
  // '' means "every week" — the pre-rotation default, and what any period keeps unless
  // explicitly set to one week. Editing an existing period reflects its actual current
  // scope (so an untagged, every-week period doesn't silently get narrowed just because a
  // particular week tab happens to be open); only a brand NEW period defaults to whichever
  // week is currently being viewed, since that's the context the "+" was clicked from.
  const [week, setWeek] = useState(
    period ? (period.week || '') : (rotationEnabled ? defaultWeek : '')
  )
  const [error, setError]         = useState('')

  function submit(e) {
    e.preventDefault()
    if (!startTime || !endTime || endTime <= startTime) {
      setError('End time must be after start time')
      return
    }
    const saved = {
      id: period?.id || makeId(),
      type,
      label: label.trim() || (type === 'free' ? 'Free Period' : 'Lesson'),
      startTime,
      endTime,
    }
    if (week) saved.week = week
    onSave(saved)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{period ? `Edit period — ${day}` : `Add period — ${day}`}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rf-kind-toggle">
            <button type="button" className={`rf-kind-btn${type === 'lesson' ? ' is-active' : ''}`}
              onClick={() => setType('lesson')}>
              <BookOpen size={15} /> Lesson
            </button>
            <button type="button" className={`rf-kind-btn${type === 'free' ? ' is-active' : ''}`}
              onClick={() => setType('free')}>
              <Coffee size={15} /> Free period
            </button>
          </div>
          <div>
            <label className="label">{type === 'free' ? 'Label (optional)' : 'Subject / label'}</label>
            <input className="input" list="rf-timetable-subjects" value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={type === 'free' ? 'Free Period' : 'e.g. Maths, Registration, PE'} />
            {subjects.length > 0 && (
              <datalist id="rf-timetable-subjects">
                {subjects.map(s => <option key={s} value={s} />)}
              </datalist>
            )}
          </div>
          {rotationEnabled && (
            <div>
              <label className="label">Which week?</label>
              <select className="select" value={week} onChange={e => setWeek(e.target.value)}>
                <option value="">Every week</option>
                <option value="A">Week A only</option>
                <option value="B">Week B only</option>
              </select>
            </div>
          )}
          <div className="grid-2" style={{ gap: 10 }}>
            <div><label className="label">Start time</label>
              <input className="input" type="time" value={startTime}
                onChange={e => setStartTime(e.target.value)} required /></div>
            <div><label className="label">End time</label>
              <input className="input" type="time" value={endTime}
                onChange={e => setEndTime(e.target.value)} required /></div>
          </div>
          {error && <p style={{ fontSize: '0.78rem', color: 'var(--danger)', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{period ? 'Save changes' : 'Add period'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
