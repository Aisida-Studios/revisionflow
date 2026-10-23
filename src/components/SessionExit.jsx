// src/components/SessionExit.jsx
// Shared by every study session: the "Save progress" button, the "Save before you leave?" prompt and a
// browser warning if the tab is closed with unsaved progress.
import { useEffect, useRef } from 'react'
import { Save, Check } from 'lucide-react'
import './SessionExit.css'

/** "Save progress"; reads "Saved" when there is nothing left to save. */
export function SaveProgressButton({ saved, saving, onClick, className = 'btn btn-secondary btn-sm' }) {
  return (
    <button type="button" className={className} onClick={onClick} disabled={saving || saved}
      aria-label={saved ? 'Progress saved' : 'Save progress'} title={saved ? 'Everything is saved' : 'Save your progress'}>
      {saved ? <Check size={14} /> : <Save size={14} />}
      <span className="rf-save-label">{saved ? 'Saved' : saving ? 'Saving…' : 'Save progress'}</span>
    </button>
  )
}

/**
 * kind 'set': the set itself is not saved yet. kind 'progress': a saved set with progress not yet stored.
 * onSave / onLeave / onStay are the three ways out; Esc and a click outside mean "keep studying".
 */
export function ExitPrompt({ open, kind, saving, onSave, onLeave, onStay }) {
  const primaryRef = useRef(null)
  useEffect(() => { if (open) primaryRef.current?.focus() }, [open])
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onStay() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onStay])
  if (!open) return null
  const isSet = kind === 'set'
  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onStay() }}>
      <div className="modal rf-exit-modal" role="dialog" aria-modal="true" aria-labelledby="rf-exit-title">
        <div className="modal-title" id="rf-exit-title">{isSet ? 'Save this set before you leave?' : 'Save your progress?'}</div>
        <p className="rf-exit-text">
          {isSet
            ? 'This set is not saved to My sets yet, so it will be lost if you leave now.'
            : 'You have progress in this session that has not been saved yet.'}
        </p>
        <div className="rf-exit-actions">
          <button ref={primaryRef} type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : isSet ? 'Save set' : 'Save and exit'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onLeave} disabled={saving}>Leave without saving</button>
          <button type="button" className="btn btn-ghost" onClick={onStay} disabled={saving}>Keep studying</button>
        </div>
      </div>
    </div>
  )
}

/** Asks the browser to warn before the tab is closed or reloaded while `active`. */
export function useUnloadWarning(active) {
  useEffect(() => {
    if (!active) return undefined
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active])
}
