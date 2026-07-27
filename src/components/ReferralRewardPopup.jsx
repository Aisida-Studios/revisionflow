// src/components/ReferralRewardPopup.jsx
// Covers both sides of a referral (see netlify/functions/referral.js for the actual reward
// values this mirrors: referrer +200 XP + Recruiter badge + Rocket icon; referred +100 XP +
// Rocket icon). Built as one component with two variants rather than two separate components,
// since the visual shell and dismiss behaviour are identical — only the copy and reward list differ.
import { Gift, X } from 'lucide-react'

const COPY = {
  referrer: {
    emoji: '📣',
    title: 'Referral successful!',
    body: 'Someone just joined RevisionFlow using your link.',
    rewards: [
      { icon: '⚡', label: '+200 XP' },
      { icon: '📣', label: 'Recruiter badge earned' },
      { icon: '🚀', label: 'Rocket icon unlocked' },
    ],
  },
  referred: {
    emoji: '🚀',
    title: 'Referral applied!',
    body: "You've been credited for signing up with a referral link.",
    rewards: [
      { icon: '⚡', label: '+100 XP' },
      { icon: '🚀', label: 'Rocket icon unlocked' },
    ],
  },
}

export default function ReferralRewardPopup({ variant, onClose }) {
  const copy = COPY[variant] || COPY.referred

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ position: 'absolute', top: 14, right: 14 }}>
          <X size={18} />
        </button>

        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{copy.emoji}</div>
        <h3 style={{ marginBottom: 6 }}>{copy.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>{copy.body}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {copy.rewards.map(r => (
            <div key={r.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 14px', background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--r-md)',
              fontWeight: 700, fontSize: '0.9rem',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{r.icon}</span> {r.label}
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
          <Gift size={15} /> Nice!
        </button>
      </div>
    </div>
  )
}
