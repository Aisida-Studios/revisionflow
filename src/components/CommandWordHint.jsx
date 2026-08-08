// src/components/CommandWordHint.jsx
import React, { useState, useEffect } from 'react'
import { detectCommandWord } from '../utils/commandWords'

export default function CommandWordHint({ questionText }) {
  const [open, setOpen] = useState(false)
  const match = detectCommandWord(questionText)

  // Collapse again when the question changes so a stale hint doesn't linger
  useEffect(() => { setOpen(false) }, [match?.word])

  if (!match) return null

  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-light)',
        }}>
        <span style={{
          padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem',
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)',
          color: 'var(--accent-light)', textTransform: 'capitalize',
        }}>
          {match.word}
        </span>
        {open ? 'Hide what this means' : 'What does this command word need?'}
      </button>
      {open && (
        <div style={{
          marginTop: 8, padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)',
          fontSize: '0.82rem', lineHeight: 1.55,
        }}>
          <div style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{match.meaning}</div>
          <div style={{ color: 'var(--text-muted)' }}>{match.technique}</div>
        </div>
      )}
    </div>
  )
}
