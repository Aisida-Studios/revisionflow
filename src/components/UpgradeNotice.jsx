// src/components/UpgradeNotice.jsx
// The soft "this needs Pro" prompt for a feature that has a free allowance (a timetable, a Maths solve...). It is what the app
// shows when the server answers LIFETIME_EXHAUSTED or PRO_REQUIRED (see utils/entitlementsClient.js). The wording comes from the
// server's message, so it reads the same everywhere. Same look as ProGate's lock card, but it says what was used.
import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'

export default function UpgradeNotice({ message, compact = false }) {
  if (compact) {
    return (
      <div role="note" style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        padding: '8px 14px', borderRadius: 10,
        background: 'var(--gold-pale)', border: '1px solid var(--gold-border)',
      }}>
        <Crown size={13} color="var(--gold)" />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', minWidth: 0 }}>{message}</span>
        <Link to="/pro" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)' }}>See Pro →</Link>
      </div>
    )
  }
  return (
    <div role="note" style={{ padding: '28px 20px', borderRadius: 14, textAlign: 'center', background: 'var(--gold-pale)', border: '1px solid var(--gold-border)' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
      }}>
        <Crown size={20} color="#fff" />
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', maxWidth: 340, margin: '0 auto 16px', lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/pro" className="btn btn-primary" style={{ minHeight: 44 }}><Crown size={14} /> Upgrade to Pro</Link>
        <Link to="/pro" className="btn btn-ghost btn-sm" style={{ minHeight: 44 }}>See what Pro includes →</Link>
      </div>
    </div>
  )
}
