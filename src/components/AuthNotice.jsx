// src/components/AuthNotice.jsx
// Inline message for Login and Signup. Unlike a toast it stays until the next attempt, and it scrolls
// into view so it is not missed below the fold on a phone.
import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'

export default function AuthNotice({ message, style }) {
  const ref = useRef(null)

  useEffect(() => {
    if (message && ref.current && ref.current.scrollIntoView) ref.current.scrollIntoView({ block: 'nearest' })
  }, [message])

  if (!message) return null
  return (
    <div
      ref={ref}
      role="alert"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)',
        background: 'var(--bg-surface)', color: 'var(--text-primary)',
        fontSize: '0.85rem', lineHeight: 1.5, scrollMarginTop: 16, scrollMarginBottom: 16, ...style,
      }}
    >
      <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
      <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{message}</span>
    </div>
  )
}
