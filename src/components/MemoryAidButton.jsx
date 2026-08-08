// src/components/MemoryAidButton.jsx
// On-demand memory aid for one flashcard. Ephemeral by design — no new Firestore field or
// collection, just a callAI request through the existing /api/tutor pipeline. "struggling"
// only changes the visual nudge; the button itself is always available on demand.
import React, { useState } from 'react'
import { generateMemoryAid } from '../utils/ai'

export default function MemoryAidButton({ front, back, subject, uid, struggling = false, compact = false }) {
  const [mnemonic, setMnemonic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(e) {
    e.stopPropagation()
    setLoading(true)
    setError('')
    try {
      const res = await generateMemoryAid(front, back, subject, uid)
      if (res.error) { setError(res.error); return }
      setMnemonic((res.text || '').trim())
    } catch (err) {
      setError('Could not generate a memory aid right now')
    } finally {
      setLoading(false)
    }
  }

  if (mnemonic) {
    return (
      <div onClick={e => e.stopPropagation()} style={{
        marginTop: compact ? 8 : 12, padding: '10px 12px', borderRadius: 10, textAlign: 'left',
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--warning)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Memory aid
        </div>
        <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{mnemonic}</div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
          {loading ? '…' : 'Try another'}
        </button>
      </div>
    )
  }

  return (
    <div onClick={e => e.stopPropagation()} style={{ marginTop: compact ? 8 : 12 }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={struggling ? '' : 'btn btn-ghost btn-sm'}
        style={struggling ? {
          padding: '7px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
          background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.4)', color: 'var(--warning)',
        } : { fontSize: '0.78rem' }}>
        {loading ? 'Thinking…' : struggling ? 'Still not sticking? Get a memory aid' : '💡 Memory aid'}
      </button>
      {error && <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--danger)' }}>{error}</div>}
    </div>
  )
}
