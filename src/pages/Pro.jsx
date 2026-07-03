// src/pages/Pro.jsx
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { Zap, Check, Lock, Star, Crown, ArrowLeft, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const FREE_FEATURES = [
  '5 AI topic note generations per day',
  'Up to 20 flashcards per AI generation',
  '3 quiz modes (no timed challenge)',
  'Default theme only',
  '5 profile icons',
  'Unlimited sessions, papers, topics',
  'All core revision tools',
  'Leaderboard & friends',
  'Public profile page',
]

const PRO_FEATURES = [
  { label: 'Unlimited AI topic note generations', highlight: true },
  { label: 'Up to 50 flashcards per AI generation', highlight: true },
  { label: 'Timed challenge quiz mode', highlight: true },
  { label: 'All 10 colour themes unlocked', highlight: true },
  { label: 'All 12 profile icons unlocked', highlight: true },
  { label: 'Priority AI responses', highlight: false },
  { label: 'Everything in the free plan', highlight: false },
  { label: 'Cancel any time', highlight: false },
  { label: 'Supports independent development', highlight: false },
]

async function startCheckout(uid, plan) {
  const res = await fetch('/api/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create-checkout', uid, plan }),
  })
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
  } else {
    throw new Error(data.error || 'Checkout failed')
  }
}

export default function Pro() {
  const { user, profile } = useAuth()
  const { isPro, isBeta } = useIsPro()
  const [plan,    setPlan]    = useState('annual')
  const [loading, setLoading] = useState(false)
  const [params]              = useSearchParams()
  const success               = params.get('success') === '1' || window.location.pathname.includes('success')

  async function handleUpgrade() {
    if (!user) { window.location.href = '/signup'; return }
    setLoading(true)
    try {
      await startCheckout(user.uid, plan)
    } catch(e) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success || isPro) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', padding: 24,
      }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Crown size={32} color="#fff" />
          </div>
          <h2 style={{ marginBottom: 8 }}>
            {isBeta ? 'You have lifetime Pro access ✨' : 'Welcome to RevisionFlow Pro! 🎉'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
            {isBeta
              ? 'As a beta user you have lifetime free access to all Pro features — including all themes, unlimited AI, and timed quiz mode.'
              : 'Your Pro subscription is active. All Pro features are now unlocked. Thank you for supporting RevisionFlow!'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, textAlign: 'left' }}>
            {PRO_FEATURES.filter(f => f.highlight).map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'rgba(124,58,237,0.07)',
                borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)',
                fontSize: '0.875rem', fontWeight: 600,
              }}>
                <Check size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                {f.label}
              </div>
            ))}
          </div>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
            Go to dashboard →
          </Link>
        </div>
      </div>
    )
  }

  const monthlyPrice = 3.99
  const annualPrice  = 29.99
  const annualMonthly = (annualPrice / 12).toFixed(2)
  const saving = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Back link */}
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 32 }}>
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px',
            borderRadius: 999, background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)', marginBottom: 16,
            fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-light)', letterSpacing: '0.06em',
          }}>
            <Sparkles size={12} /> REVISIONFLOW PRO
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: 10, lineHeight: 1.2 }}>
            Unlock your full potential
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
            Unlimited AI, all themes, timed quiz mode — everything you need to get the grade you want.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', background: 'var(--bg-surface)',
            borderRadius: 12, padding: 4, border: '1px solid var(--border)',
            gap: 4,
          }}>
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: 'annual',  label: 'Annual', badge: 'Save ' + saving + '%' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setPlan(opt.id)} style={{
                padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.88rem',
                background: plan === opt.id ? 'var(--accent)' : 'transparent',
                color: plan === opt.id ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {opt.label}
                {opt.badge && (
                  <span style={{
                    padding: '1px 7px', borderRadius: 999, fontSize: '0.65rem',
                    background: plan === 'annual' ? 'rgba(255,255,255,0.25)' : 'var(--success)',
                    color: plan === 'annual' ? '#fff' : '#fff',
                    fontWeight: 800,
                  }}>{opt.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>

          {/* Free */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4 }}>Free</div>
              <div style={{ fontSize: '2rem', fontWeight: 900 }}>£0</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>forever</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', alignItems: 'flex-start' }}>
                  <Check size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-hover)', borderRadius: 8,
              textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Your current plan
            </div>
          </div>

          {/* Pro */}
          <div style={{
            padding: 24, borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg,rgba(124,58,237,0.12) 0%,rgba(168,85,247,0.06) 100%)',
            border: '2px solid var(--accent)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              padding: '3px 14px', borderRadius: 999,
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              color: '#fff', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}>MOST POPULAR</div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Pro</span>
                <Zap size={15} color="var(--accent-light)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-light)' }}>
                  £{plan === 'annual' ? annualMonthly : monthlyPrice.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>/mo</span>
              </div>
              {plan === 'annual' ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  £{annualPrice}/year · billed annually
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>billed monthly</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {PRO_FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', alignItems: 'flex-start' }}>
                  <Check size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: f.highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: f.highlight ? 600 : 400 }}>{f.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 800 }}
            >
              {loading
                ? 'Redirecting to checkout…'
                : plan === 'annual'
                  ? `Upgrade for £${annualPrice}/year`
                  : `Upgrade for £${monthlyPrice}/month`}
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { icon: '🔒', text: 'Secure checkout via Stripe' },
            { icon: '↩️', text: 'Cancel any time — no lock-in' },
            { icon: '👨‍💻', text: 'Supports independent development' },
            { icon: '🎓', text: 'Built for UK students' },
          ].map(t => (
            <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>{t.icon}</span> {t.text}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h4 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Common questions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { q: 'What happens if I cancel?', a: 'Your Pro access continues until the end of the current billing period. After that you drop to the free plan — your data stays intact.' },
              { q: 'Am I a beta user with lifetime access?', a: 'If you signed up during the beta period, you have lifetime free access to all Pro features. Check your profile page — if it shows a Pro or Beta badge, you\'re all set and won\'t be charged.' },
              { q: 'Can I switch between monthly and annual?', a: 'Yes — contact us and we\'ll switch your plan at the next renewal.' },
              { q: 'Is this safe?', a: 'All payments are processed by Stripe. RevisionFlow never sees your card details.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{q}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
