// src/components/EmailVerifyBanner.jsx
// Dashboard: asks someone who signed up with an email address to confirm it, so they can always get back in (password
// reset emails go to that address). It never blocks anything. Google accounts are confirmed by Google and never see it.
// Coming back from the email app checks again by itself, and "Not now" hides it until the next visit.
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { MailCheck, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthNotice from './AuthNotice'
import { authErrorMessage } from '../utils/authUi'
import { needsEmailConfirmation, sendVerificationEmail, refreshUser } from '../utils/accountMethods'

const DISMISS_KEY = 'email-confirm-dismissed'
const RESEND_WAIT_S = 30

function readDismissed() {
  try { return sessionStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

function writeDismissed() {
  try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { return }
}

export default function EmailVerifyBanner({ style }) {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(readDismissed)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)
  const announced = useRef(false)

  const waiting = needsEmailConfirmation(user) && !confirmed

  useEffect(() => {
    if (!waiting) return undefined
    let live = true
    async function check() {
      const fresh = await refreshUser()
      if (live && fresh && fresh.emailVerified && !announced.current) {
        announced.current = true
        setConfirmed(true)
        toast.success('Email confirmed. Thank you.')
      }
    }
    function onVisible() { if (document.visibilityState === 'visible') check() }
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      live = false
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [waiting])

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait(w => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  if (!waiting || dismissed) return null

  async function send() {
    if (busy || wait > 0) return
    setBusy(true)
    setError('')
    try {
      await sendVerificationEmail(user)
      setSentTo(user.email)
      setWait(RESEND_WAIT_S)
    } catch (e) {
      setError(authErrorMessage(e, 'verify'))
    }
    setBusy(false)
  }

  function dismiss() {
    writeDismissed()
    setDismissed(true)
  }

  const label = busy ? 'Sending…' : sentTo ? (wait > 0 ? 'Send again in ' + wait + 's' : 'Send again') : 'Send confirmation email'

  return (
    <div className="card" role="region" aria-label="Confirm your email address"
      style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, padding: '12px 8px 12px 16px', marginBottom: 16, ...style }}>
      <MailCheck size={20} aria-hidden="true" style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Confirm your email address</div>
        <div aria-live="polite" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflowWrap: 'anywhere' }}>
          {sentTo
            ? 'Sent to ' + sentTo + '. Open it to confirm, and check your spam folder too.'
            : 'It lets you reset your password if you ever forget it. If you just signed up, a message is already on its way to ' + user.email + '.'}
        </div>
        <AuthNotice message={error} style={{ marginTop: 8 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
        <button className="btn btn-secondary" style={{ minHeight: 44 }} onClick={send} disabled={busy || wait > 0}>{label}</button>
        <button className="btn btn-ghost btn-icon" onClick={dismiss} aria-label="Not now" style={{ minWidth: 44, minHeight: 44 }}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
