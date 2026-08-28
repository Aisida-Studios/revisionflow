// src/components/OnboardingRecapPopup.jsx
// Previously rendered locally inside Onboarding.jsx, shown the instant saving finished — before
// the tour even started. Moved here as its own global popup, shown once the tour actually
// completes (see AuthContext.jsx's tourComplete-transition detection), using the XP breakdown
// Onboarding.jsx stashes on the profile at save time rather than local component state, since
// this component may render long after Onboarding.jsx itself has unmounted.
import { Zap } from 'lucide-react'

export default function OnboardingRecapPopup({ breakdown, displayName, onClose }) {
  const firstName = (displayName || '').split(' ')[0] || 'friend'

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
        <h3 style={{ marginBottom: 4 }}>You're in, {firstName}!</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
          Here's the XP you've already earned before doing a single revision session:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', fontSize: '0.85rem' }}>
            <span>Setting up your account</span><strong>+{breakdown.base} XP</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', fontSize: '0.85rem' }}>
            <span>{breakdown.subjectCount} subject{breakdown.subjectCount !== 1 ? 's' : ''} added</span><strong>+{breakdown.subjects} XP</strong>
          </div>
          {breakdown.plan > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', fontSize: '0.85rem' }}>
              <span>AI revision plan generated</span><strong>+{breakdown.plan} XP</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--r-md)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-light)' }}>
            <span>Total</span><span>+{breakdown.total} XP</span>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
          <Zap size={15} /> Let's go
        </button>
      </div>
    </div>
  )
}
