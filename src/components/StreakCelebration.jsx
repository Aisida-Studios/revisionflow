// src/components/StreakCelebration.jsx
// Shown when the student extends their streak. Plain on purpose: the streak picture, the number, one line and the
// next milestone. No confetti, no motion, nothing that closes itself. Usage:
//   <StreakCelebration streak={7} onClose={() => setShowStreak(false)} />

import { useEffect, useRef } from 'react'
import { LazyIllustration } from './illustrations/lazy'

const MILESTONES = [3, 7, 14, 30, 60, 100]

function lineFor(streak) {
  if (streak >= 30) return 'A month of revising every day.'
  if (streak >= 14) return 'Two weeks of revising every day.'
  if (streak >= 7)  return 'A full week of revising every day.'
  if (streak >= 3)  return 'Three days in a row.'
  return 'Come back tomorrow to keep your streak going.'
}

export default function StreakCelebration({ streak, onClose }) {
  const dialogRef = useRef(null)
  const next = MILESTONES.find(m => m > streak)
  const left = next ? next - streak : 0

  useEffect(() => {
    if (dialogRef.current) dialogRef.current.focus()
    function onKey(e) { if (e.key === 'Escape' && onClose) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="streak-title"
        style={{ maxWidth: 360, textAlign: 'center', padding: '1.75rem', outline: 'none' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <LazyIllustration name="streak" width={200} />
        </div>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--accent-light)' }}>{streak}</div>
        <h3 id="streak-title" style={{ margin: '6px 0 4px' }}>Day streak</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 18px' }}>{lineFor(streak)}</p>
        {next && (
          <div style={{ marginBottom: 18 }}>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: Math.round((streak / next) * 100) + '%' }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {left + (left === 1 ? ' day' : ' days') + ' to ' + next}
            </p>
          </div>
        )}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Continue</button>
      </div>
    </div>
  )
}
