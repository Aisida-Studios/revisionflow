// src/pages/Pro.jsx
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsPro } from '../components/ProGate'
import { Check, Lock, Crown, ArrowLeft, RotateCcw, Code2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import './AccountPages.css'

const FREE_FEATURES = [
  '5 Topic Note generations per day',
  'Up to 20 flashcards per generation',
  '30 AI Advisor messages per day',
  '3 essay feedback requests per day',
  '5 photo scans per day',
  '3 quiz modes (no timed challenge)',
  'Predicted grade for 1 subject',
  '1 streak freeze per week',
  'Default theme only',
  '5 profile icons',
  'Unlimited sessions, papers, topics',
  'All core revision tools — Practice (spaced repetition), Answer Marker, command-word coaching, memory aids',
  'Leaderboard & friends',
  'Public profile page',
]

const PRO_FEATURES = [
  { label: 'AI Tutor — Maths step-by-step solver & English essay feedback', highlight: true },
  { label: 'Predicted grade for every subject', highlight: true },
  { label: 'Unlimited Topic Note generations', highlight: true },
  { label: 'Up to 50 flashcards per generation', highlight: true },
  { label: 'Timed challenge quiz mode', highlight: true },
  { label: '150 AI Advisor messages/day + longer, more detailed study plans', highlight: true },
  { label: '15 essay feedback requests per day', highlight: false },
  { label: '25 photo scans per day', highlight: false },
  { label: '3 streak freezes per week', highlight: false },
  { label: 'All 10 colour themes unlocked', highlight: false },
  { label: 'All 12 profile icons unlocked', highlight: false },
  { label: 'Everything in the free plan', highlight: false },
  { label: 'Cancel any time', highlight: false },
  { label: 'Supports independent development', highlight: false },
]

const TRUST_SIGNALS = [
  { icon: Lock,          text: 'Secure checkout via Stripe' },
  { icon: RotateCcw,     text: 'Cancel any time — no lock-in' },
  { icon: Code2,         text: 'Supports independent development' },
  { icon: GraduationCap, text: 'Built for UK students' },
]

const FAQ = [
  { q: 'What happens if I cancel?', a: 'Your Pro access continues until the end of the current billing period. After that you drop to the free plan — your data stays intact.' },
  { q: 'Am I a beta user with lifetime access?', a: 'If you signed up during the beta period, you have lifetime free access to all Pro features. Check your profile page — if it shows a Pro or Beta badge, you\'re all set and won\'t be charged.' },
  { q: 'Can I switch between monthly and annual?', a: 'Yes — contact us and we\'ll switch your plan at the next renewal.' },
  { q: 'Is this safe?', a: 'All payments are processed by Stripe. RevisionFlow never sees your card details.' },
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
            width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)',
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
          <div className="card gold-card" style={{ textAlign: 'left', marginBottom: 24 }}>
            <div className="ap-plan-features" style={{ margin: 0 }}>
              {PRO_FEATURES.filter(f => f.highlight).map(f => (
                <div key={f.label} className="ap-plan-feature">
                  <Check size={15} color="var(--success)" className="ap-plan-feature-icon" />
                  {f.label}
                </div>
              ))}
            </div>
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
      <div className="ap-page" style={{ maxWidth: 760 }}>

        {/* Back link */}
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: 32 }}>
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="badge badge-gold" style={{ marginBottom: 16, letterSpacing: '0.06em' }}>
            <Crown size={12} /> REVISIONFLOW PRO
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: 12, marginBottom: 10, lineHeight: 1.2 }}>
            Unlock your full potential
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
            Unlimited AI, all themes, timed quiz mode — everything you need to get the grade you want.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div className="tabs" style={{ display: 'inline-flex' }}>
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: 'annual',  label: 'Annual', badge: 'Save ' + saving + '%' },
            ].map(opt => (
              <button key={opt.id} className={`tab${plan === opt.id ? ' active' : ''}`} onClick={() => setPlan(opt.id)}>
                {opt.label}
                {opt.badge && (
                  <span className="badge badge-green" style={{ padding: '1px 7px', fontSize: '0.63rem' }}>{opt.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="ap-pricing-grid" style={{ marginBottom: 32 }}>

          {/* Free */}
          <div className="card ap-plan-card">
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Free</div>
              <div className="ap-plan-price">
                <span className="ap-plan-price-num">£0</span>
              </div>
              <div className="ap-plan-price-period">forever</div>
            </div>
            <div className="ap-plan-features">
              {FREE_FEATURES.map(f => (
                <div key={f} className="ap-plan-feature">
                  <Check size={13} color="var(--success)" className="ap-plan-feature-icon" />
                  {f}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', background: 'var(--bg-hover)', borderRadius: 'var(--r-sm)',
              textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Your current plan
            </div>
          </div>

          {/* Pro */}
          <div className="card ap-plan-card ap-plan-card--featured">
            <span className="ap-plan-ribbon">MOST POPULAR</span>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Pro</span>
                <Crown size={15} color="var(--gold)" />
              </div>
              <div className="ap-plan-price">
                <span className="ap-plan-price-num" style={{ color: 'var(--gold)' }}>
                  £{plan === 'annual' ? annualMonthly : monthlyPrice.toFixed(2)}
                </span>
                <span className="ap-plan-price-period">/mo</span>
              </div>
              <div className="ap-plan-price-period">
                {plan === 'annual' ? `£${annualPrice}/year · billed annually` : 'billed monthly'}
              </div>
            </div>

            <div className="ap-plan-features">
              {PRO_FEATURES.map(f => (
                <div key={f.label} className="ap-plan-feature" style={{
                  color: f.highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: f.highlight ? 600 : 400,
                }}>
                  <Check size={13} color="var(--success)" className="ap-plan-feature-icon" />
                  {f.label}
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
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {TRUST_SIGNALS.map(t => (
            <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <t.icon size={14} /> {t.text}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h4 className="card-eyebrow">Common questions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQ.map(({ q, a }) => (
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
