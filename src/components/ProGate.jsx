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
import { Zap, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function useIsPro() {
  const { profile } = useAuth()
  return {
    isPro: !!(profile?.isPro || profile?.betaUser),
    isBeta: !!profile?.betaUser,
    isStripe: !!profile?.isPro && !profile?.betaUser,
  }
}

// Inline lock badge — drop onto any element to show it's Pro
export function ProBadge({ style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 999,
      background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
      color: '#fff', fontSize: '0.65rem', fontWeight: 800,
      letterSpacing: '0.04em', verticalAlign: 'middle',
      ...style,
    }}>
      <Zap size={9} /> PRO
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
        background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)',
      }}>
        <Lock size={13} color="var(--accent-light)" />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {feature} is Pro-only.
        </span>
        <Link to="/pro" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-light)' }}>
          Upgrade →
        </Link>
      </div>
    )
  }

  return (
    <div style={{
      padding: '32px 24px', borderRadius: 14, textAlign: 'center',
      background: 'linear-gradient(135deg,rgba(124,58,237,0.08) 0%,rgba(168,85,247,0.04) 100%)',
      border: '1px solid rgba(124,58,237,0.2)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
      }}>
        <Zap size={22} color="#fff" />
      </div>
      <h4 style={{ marginBottom: 6 }}>
        {feature.charAt(0).toUpperCase() + feature.slice(1)} is a Pro feature
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 300, margin: '0 auto 20px', lineHeight: 1.6 }}>
        Upgrade to RevisionFlow Pro for unlimited AI generations, all themes, timed quiz mode, and more.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/pro" className="btn btn-primary" style={{ padding: '10px 24px' }}>
          <Zap size={14} /> Upgrade to Pro — from £3.99/mo
        </Link>
        <Link to="/pro" className="btn btn-ghost btn-sm">See all features →</Link>
      </div>
    </div>
  )
}
