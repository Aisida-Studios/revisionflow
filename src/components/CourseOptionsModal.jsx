// src/components/CourseOptionsModal.jsx
// "Choose your options": the chooser itself (CourseOptionsPicker), the chooser with its Save / Not now buttons
// (CourseOptionsForm, used inline in onboarding) and a dialog around that (default export, used on the Topics page
// and the profile). It only collects a valid choice; whoever opens it saves it (saveSubjectOptions in
// utils/courseOptions.js). Usage:
//   <CourseOptionsModal subject={subjectEntry} profile={profile} onSave={options => ...} onClose={() => ...} />

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { slotsForSubject, chosenMap, applicableSlots, isSlotComplete, toggleOption } from '../utils/courseOptions'
import { getSubjectQualification } from '../data/subjects'
import './CourseOptionsModal.css'

function initialValue(subject, slots) {
  return chosenMap(subject, slots)
}

export function CourseOptionsPicker({ slots, value, onChange }) {
  const [note, setNote] = useState('')

  function toggle(slot, id) {
    const res = toggleOption(slot, value[slot.id] || [], id)
    setNote(res.note)
    onChange({ ...value, [slot.id]: res.ids })
  }

  return (
    <div className="co-picker">
      {applicableSlots(slots, value).map(slot => {
        const ids = value[slot.id] || []
        const pick = slot.pick || 1
        const done = isSlotComplete(slot, ids)
        return (
          <fieldset key={slot.id} className="co-slot">
            <legend className="co-slot-title">{slot.label}</legend>
            <p className="co-slot-count">
              <span>{pick === 1 ? 'Choose 1' : 'Choose ' + pick + ' of ' + slot.options.length}</span>
              <span className={'co-slot-state' + (done ? ' is-done' : '')}>{ids.length + ' of ' + pick + ' chosen'}</span>
            </p>
            {slot.rule && <p className="co-slot-rule">{slot.rule}</p>}
            <div className="co-options">
              {slot.options.map(o => {
                const on = ids.includes(o.id)
                const needs = (o.requires || []).map(r => (slot.options.find(x => x.id === r) || {}).label).filter(Boolean)
                const count = (o.topics || []).length
                const meta = [count === 1 ? '1 topic' : count > 1 ? count + ' topics' : '', needs.length ? 'needs ' + needs.join(', ') : ''].filter(Boolean).join(' · ')
                return (
                  <label key={o.id} className={'co-option' + (on ? ' is-on' : '')}>
                    <input type={pick === 1 ? 'radio' : 'checkbox'} name={'co-' + slot.id} checked={on} onChange={() => toggle(slot, o.id)} />
                    <span className="co-mark" aria-hidden="true">{on && <Check size={14} strokeWidth={3} />}</span>
                    <span className="co-text">
                      <span className="co-label">{o.label}</span>
                      {meta && <span className="co-meta">{meta}</span>}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )
      })}
      <p className="co-note" role="status" aria-live="polite">{note}</p>
    </div>
  )
}

export function CourseOptionsForm({ subject, profile, onSave, onCancel, cancelLabel = 'Not now', saving = false }) {
  const slots = slotsForSubject(subject, profile)
  const [value, setValue] = useState(() => initialValue(subject, slots))
  const asked = applicableSlots(slots, value)
  const complete = asked.length > 0 && asked.every(s => isSlotComplete(s, value[s.id] || []))
  return (
    <div>
      <p className="co-sub">
        Topics from the options you do not choose are hidden from your lists and progress. Your ratings and notes for
        them are kept, and come back if you change your choice.
      </p>
      <CourseOptionsPicker slots={slots} value={value} onChange={setValue} />
      <div className="co-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="btn btn-primary" disabled={!complete || saving} onClick={() => onSave(value)}>
          {saving ? 'Saving…' : 'Save choices'}
        </button>
      </div>
    </div>
  )
}

export default function CourseOptionsModal({ subject, profile, onSave, onClose, saving = false }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (dialogRef.current) dialogRef.current.focus()
    function onKey(e) { if (e.key === 'Escape' && onClose) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal co-modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="co-title"
        onClick={e => e.stopPropagation()}>
        <div className="co-head">
          <div>
            <h3 id="co-title">Choose your options</h3>
            <p className="co-course">{subject.name + ' · ' + (subject.board || '') + ' ' + getSubjectQualification(subject, profile)}</p>
          </div>
          <button type="button" className="co-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <CourseOptionsForm subject={subject} profile={profile} onSave={onSave} onCancel={onClose} saving={saving} />
      </div>
    </div>
  )
}
