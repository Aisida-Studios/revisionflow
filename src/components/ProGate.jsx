// src/components/ProGate.jsx
// Wrap any Pro-only feature with this component.
// Free users see an upgrade prompt; Pro/beta users see the feature.
//
// Usage:
//   <ProGate feature="timed quiz mode">
//     <TimedQuizComponent />
//   </ProGate>
//
//   // Or as a hook:
//   const { isPro } = useIsPro()

import { Link } from 'react-router-dom'
import { Crown, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function useIsPro() {
  const { profile } = useAuth()
  return {
    isPro: !!(profile?.isPro || profile?.betaUser),
    isBeta: !!profile?.betaUser,
    isStripe: !!profile?.isPro && !profile?.betaUser,
  }
}

// Inline lock badge — drop onto any element to show it's Pro.
// Gold + Crown to match the Pro identity used in Layout.jsx's sidebar
// (upgrade CTA, name-tag badge).
export function ProBadge({ style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 999,
      background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      color: '#fff', fontSize: '0.65rem', fontWeight: 800,
      letterSpacing: '0.04em', verticalAlign: 'middle',
      ...style,
    }}>
      <Crown size={9} /> PRO
    </span>
  )
}

// Full gate — replaces children for free users
export default function ProGate({ children, feature = 'this feature', compact = false }) {
  const { isPro } = useIsPro()
  if (isPro) return children

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 10,
        background: 'var(--gold-pale)', border: '1px solid var(--gold-border)',
      }}>
        <Lock size={13} color="var(--gold)" />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {feature} is Pro-only.
        </span>
        <Link to="/pro" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)' }}>
          Upgrade →
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      padding: '32px 24px', borderRadius: 14, textAlign: 'center',
      background: 'linear-gradient(135deg,var(--gold-pale),var(--bg-muted))',
      border: '1px solid var(--gold-border)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
      }}>
        <Crown size={22} color="#fff" />
      </div>
      <h4 style={{ marginBottom: 6 }}>
        {feature.charAt(0).toUpperCase() + feature.slice(1)} is a Pro feature
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 300, margin: '0 auto 20px', lineHeight: 1.6 }}>
        Upgrade to RevisionFlow Pro for unlimited AI generations, all themes, timed quiz mode, and more.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/pro" className="btn btn-primary" style={{ padding: '10px 24px' }}>
          <Crown size={14} /> Upgrade to Pro — from £3.99/mo
        </Link>
        <Link to="/pro" className="btn btn-ghost btn-sm">See all features →</Link>
      </div>
    </div>
  )
}
