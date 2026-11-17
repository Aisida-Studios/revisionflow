// src/components/SignInMethods.jsx
// Settings, under the email field: the ways this account can be signed in to (Google, email and password) and a way to
// add the one that is missing. Adding a method links it to this same account, so every rating, note and streak stays
// where it is. Someone whose email is not confirmed yet can also send the confirmation email from here.
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthNotice from './AuthNotice'
import { authErrorMessage, isStandaloneApp, REDIRECT_WAIT_MS } from '../utils/authUi'
import { signInMethods, needsEmailConfirmation, addPassword, connectGoogle, sendVerificationEmail, refreshUser } from '../utils/accountMethods'

const ROW_STYLE = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }

function Row({ title, detail, children }) {
  return (
    <div style={ROW_STYLE}>
      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}>{detail}</div>
      </div>
      {children ? <div style={{ marginLeft: 'auto' }}>{children}</div> : null}
    </div>
  )
}

export default function SignInMethods() {
  const { user, redirectError, clearRedirectError } = useAuth()
  const [, setTick] = useState(0)
  const [adding, setAdding] = useState(false)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const handback = useRef(null)

  useEffect(() => {
    if (!user) return undefined
    let live = true
    refreshUser().then(() => { if (live) setTick(n => n + 1) })
    return () => { live = false }
  }, [user])

  useEffect(() => () => { if (handback.current) clearTimeout(handback.current) }, [])

  useEffect(() => {
    if (!redirectError) return
    setError(authErrorMessage({ code: redirectError }, 'link'))
    if (clearRedirectError) clearRedirectError()
  }, [redirectError, clearRedirectError])

  if (!user) return null

  const methods = signInMethods(user)
  const googleEmail = ((user.providerData || []).find(p => p.providerId === 'google.com') || {}).email
  const unconfirmed = needsEmailConfirmation(user)

  function closeForm() {
    setAdding(false)
    setPw('')
    setPw2('')
    setShowPw(false)
    setError('')
  }

  async function submitPassword(e) {
    e.preventDefault()
    if (busy) return
    if (pw.length < 6) { setError('Choose a password with at least 6 characters.'); return }
    if (pw !== pw2) { setError('The two passwords do not match.'); return }
    setBusy('password')
    setError('')
    try {
      await addPassword(user, pw)
      toast.success('Password added. You can now sign in with your email and password.')
      setAdding(false)
      setPw('')
      setPw2('')
      setShowPw(false)
    } catch (err) {
      setError(authErrorMessage(err, 'link'))
    }
    setBusy('')
  }

  async function connect() {
    if (busy) return
    setBusy('google')
    setError('')
    // In the installed app the page leaves for Google. If it is still here after a while, hand the button back.
    if (isStandaloneApp()) handback.current = setTimeout(() => { setBusy(''); setError('Google did not open. Try again.') }, REDIRECT_WAIT_MS)
    try {
      const how = await connectGoogle(user)
      if (how === 'done') toast.success('Google connected. You can now sign in with Google too.')
    } catch (err) {
      setError(authErrorMessage(err, 'link'))
    }
    if (handback.current) { clearTimeout(handback.current); handback.current = null }
    setBusy('')
  }

  async function sendConfirmation() {
    if (busy) return
    setBusy('verify')
    setError('')
    try {
      await sendVerificationEmail(user)
      setSentTo(user.email)
    } catch (err) {
      setError(authErrorMessage(err, 'verify'))
    }
    setBusy('')
  }

  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <div className="label" id="rf-sign-in-methods">Ways to sign in</div>
      <div role="group" aria-labelledby="rf-sign-in-methods" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Row title="Google" detail={methods.google ? (googleEmail || 'Connected') : 'Not connected'}>
          {methods.google
            ? <span className="badge badge-green">Connected</span>
            : <button type="button" className="btn btn-secondary btn-sm" style={{ minHeight: 44 }} onClick={connect} disabled={!!busy}>{busy === 'google' ? 'Opening Google…' : 'Connect Google'}</button>}
        </Row>

        <Row title="Email and password" detail={methods.password ? user.email : 'No password set'}>
          {methods.password
            ? <span className="badge badge-green">Set</span>
            : (!adding && <button type="button" className="btn btn-secondary btn-sm" style={{ minHeight: 44 }} onClick={() => { setAdding(true); setError('') }} disabled={!!busy}>Add a password</button>)}
        </Row>

        {adding && (
          <form onSubmit={submitPassword} style={{ ...ROW_STYLE, flexDirection: 'column', alignItems: 'stretch', flexWrap: 'nowrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="rf-new-password">New password</label>
              <div style={{ position: 'relative' }}>
                <input id="rf-new-password" className="input" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  value={pw} onChange={e => setPw(e.target.value)} style={{ minHeight: 44, paddingRight: 48, width: '100%' }} />
                <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 0, top: 0, minWidth: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="rf-new-password-2">Repeat the password</label>
              <input id="rf-new-password-2" className="input" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                value={pw2} onChange={e => setPw2(e.target.value)} style={{ minHeight: 44, width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" style={{ minHeight: 44 }} onClick={closeForm} disabled={!!busy}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ minHeight: 44 }} disabled={!!busy}>{busy === 'password' ? 'Adding…' : 'Add password'}</button>
            </div>
          </form>
        )}

        {unconfirmed && (
          <Row title="Email not confirmed" detail={sentTo ? 'Sent to ' + sentTo + '. Check your spam folder too.' : 'Confirm it so you can always reset your password.'}>
            <button type="button" className="btn btn-secondary btn-sm" style={{ minHeight: 44 }} onClick={sendConfirmation} disabled={!!busy}>
              {busy === 'verify' ? 'Sending…' : sentTo ? 'Send again' : 'Send confirmation email'}
            </button>
          </Row>
        )}

        <AuthNotice message={error} />
      </div>
    </div>
  )
}
