// src/components/DeleteAccountDialog.jsx
// The "Delete account" flow on the Settings page. Three things happen in order, and the dialog never says "deleted" before the
// second one has really finished:
//   1. the student proves it is them (password, or Google: a pop-up, or in the installed app a trip to Google and back to this
//      dialog; the server insists on a sign-in from the last five minutes),
//   2. the server deletes the account (netlify/functions/account.js; this can take several calls, shown as "working"),
//   3. only then is the browser signed out and cleared, and the page reloaded onto the home page.
// What the server removes and keeps is described from its own header comment (netlify/functions/account.js), nothing more.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { signInMethod, confirmIdentity, deleteMyAccount, reauthMessage, returnedFromGoogleConfirmation, forgetGoogleConfirmation } from '../utils/accountDeletion'
import { isStandaloneApp, REDIRECT_WAIT_MS } from '../utils/authUi'
import './DeleteAccountDialog.css'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export default function DeleteAccountDialog({ onClose }) {
  const { user } = useAuth()
  const method = signInMethod(user)                       // 'password' | 'google' | 'other'
  const [phase, setPhase] = useState('confirm')           // confirm | working | done
  const [step, setStep] = useState('confirming')          // while working: confirming | deleting
  const [understood, setUnderstood] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')              // why the last attempt did not finish, or ''
  const [slow, setSlow] = useState(false)                 // the server has said "still working" at least once
  // Installed app, Google account: the student has just come back from Google, having confirmed it is them. (Only looks; the mark
  // is cleared when an attempt starts or the dialog is closed.)
  const [returned, setReturned] = useState(() => returnedFromGoogleConfirmation())
  const dialogRef = useRef(null)
  const stalledRef = useRef(null)                         // the "Google did not open" timer, installed app only
  const busy = phase === 'working'
  const locked = busy || phase === 'done'                 // closing is not offered while the work is in progress

  const close = useCallback(() => { if (!locked) { forgetGoogleConfirmation(); onClose() } }, [locked, onClose])
  useEffect(() => () => clearTimeout(stalledRef.current), [])

  // Focus the dialog when it opens and whenever its content is replaced; give focus back to the button that opened it on close.
  useEffect(() => {
    const opener = document.activeElement
    return () => { if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus() }
  }, [])
  useEffect(() => {
    const el = dialogRef.current
    if (el && !el.contains(document.activeElement)) el.focus()
  }, [phase])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Keep Tab inside the dialog: it is a destructive confirmation, and the page behind it must not be reachable.
  function trapTab(e) {
    if (e.key !== 'Tab' || !dialogRef.current) return
    const nodes = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
    if (nodes.length === 0) { e.preventDefault(); dialogRef.current.focus(); return }
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === dialogRef.current)) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus() }
  }

  const needsPassword = method === 'password'
  const canStart = understood && !busy && (!needsPassword || password.length > 0)

  async function start() {
    if (!canStart) return
    setMessage('')
    setSlow(false)
    setStep('confirming')
    setPhase('working')
    const alreadyConfirmed = returned && method === 'google'
    // In the installed app the page leaves for Google and confirmIdentity never returns. If the page is still here after a while,
    // the redirect did not happen: hand the dialog back.
    if (method === 'google' && !alreadyConfirmed && isStandaloneApp()) {
      stalledRef.current = setTimeout(() => {
        forgetGoogleConfirmation()
        setPhase('confirm')
        setMessage(reauthMessage({ code: 'rf/redirect-stalled' }))
      }, REDIRECT_WAIT_MS)
    }
    try {
      if (method !== 'other' && !alreadyConfirmed) await confirmIdentity(user, { password })
    } catch (err) {
      clearTimeout(stalledRef.current)
      setPassword('')
      setPhase('confirm')
      setMessage(reauthMessage(err))
      return
    }
    clearTimeout(stalledRef.current)
    forgetGoogleConfirmation()                             // this attempt uses it up
    setPassword('')                                        // not kept in memory a moment longer than needed
    setStep('deleting')
    // Never throws. On { ok: true } the browser has already been signed out and cleared.
    const result = await deleteMyAccount({ onProgress: () => setSlow(true) })
    if (result.ok) {
      setPhase('done')
      // A full page load, not a router navigation: it drops everything this tab still holds in memory. Registered here rather
      // than in an effect, because signing out can unmount this dialog before this line runs.
      setTimeout(() => window.location.replace('/'), 2500)
      return
    }
    setPhase('confirm')
    // Too long since the sign-in: the next press must ask Google (or the password) again.
    if (result.reason === 'recent_login_required') setReturned(false)
    // A fresh sign-in cannot be asked for from here for a sign-in method this page does not know how to confirm.
    setMessage(result.reason === 'recent_login_required' && method === 'other' ? reauthMessage({ code: 'rf/unsupported-provider' }) : result.message)
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal dad" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="dad-title"
        onClick={(e) => e.stopPropagation()} onKeyDown={trapTab}>

        {phase === 'done' ? (
          <>
            <div className="dad-head"><h3 className="dad-title" id="dad-title">Your account has been deleted</h3></div>
            <div role="status" className="dad-status">
              <div className="dad-status-text">
                <p className="dad-status-main">Everything has been removed and you have been signed out.</p>
                <p className="dad-status-sub">Taking you back to the home page…</p>
              </div>
            </div>
            <div className="dad-actions" style={{ marginTop: 14 }}>
              <button type="button" className="btn btn-secondary" onClick={() => window.location.replace('/')}>Go to the home page</button>
            </div>
          </>
        ) : phase === 'working' ? (
          <>
            <div className="dad-head"><h3 className="dad-title" id="dad-title">Deleting your account</h3></div>
            <div role="status" className="dad-status">
              <span className="dad-spin" aria-hidden="true" />
              <div className="dad-status-text">
                <p className="dad-status-main">{step === 'confirming' ? 'Confirming it is you…' : slow ? 'Still working…' : 'Deleting your account…'}</p>
                <p className="dad-status-sub">
                  {step === 'confirming'
                    ? 'Follow any prompt from your sign-in provider.'
                    : slow
                      ? 'Your data is being removed in stages. Please keep this window open until it finishes.'
                      : 'This can take a minute. Please keep this window open.'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dad-head">
              <h3 className="dad-title" id="dad-title">Delete your account?</h3>
              <button type="button" className="dad-close" aria-label="Close" onClick={close}><X size={18} /></button>
            </div>
            <p className="dad-lead">This permanently deletes your RevisionFlow account. It cannot be undone.</p>
            <p className="dad-list-title">What will be deleted</p>
            <ul className="dad-list">
              <li>Your profile, subjects, exam dates, study history, notes and flashcards</li>
              <li>Your XP, streak and badges</li>
              <li>Your friend connections, and any flashcard sets you shared with the community</li>
              <li>Your sign-in. If you have a paid plan it is cancelled first, so you are not billed again.</li>
            </ul>
            <p className="dad-kept">
              Payment records held by our payment provider are kept, because we are required to retain financial records.
              We also keep a note that the deletion happened, with no personal details, for 90 days.
            </p>

            {needsPassword && (
              <div className="form-group dad-field">
                <label className="label" htmlFor="dad-password">Confirm your password</label>
                <input id="dad-password" className="input" type="password" autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); start() } }} />
              </div>
            )}
            {method === 'google' && (
              <p className="dad-note">
                {returned
                  ? 'Google has confirmed it is you. Tick the box, then press Delete to finish.'
                  : isStandaloneApp()
                    ? 'This app will open Google to confirm it is you, then bring you back here to finish.'
                    : 'You will be asked to confirm with your Google account.'}
              </p>
            )}
            {method === 'other' && <p className="dad-note">Your most recent sign-in must have been in the last few minutes. If this does not work, sign out, sign back in and try again straight away.</p>}

            <label className="dad-check">
              <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
              <span>I understand this cannot be undone.</span>
            </label>

            {message && <p className="dad-error" role="alert">{message}</p>}

            <div className="dad-actions">
              <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={start} disabled={!canStart}>
                <Trash2 size={14} /> Delete my account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
