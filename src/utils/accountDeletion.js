// src/utils/accountDeletion.js
// Permanent account deletion, browser side: confirm it is really the account holder, ask the server to delete everything
// (netlify/functions/account.js does the work), and only when that is finished sign out and clear what this browser holds.
// The logic that needs no Firebase is in accountDeletionCore.js, where it is tested.
import { EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, reauthenticateWithRedirect, signOut } from 'firebase/auth'
import { auth, googleProvider, getAppCheckHeader } from '../firebase'
import { isStandaloneApp } from './authUi'
import { requestAccountDeletion, clearBrowserData, markReauthStarted, peekReturnedReauth, clearReauthMark } from './accountDeletionCore'

export { reauthMessage } from './accountDeletionCore'

// This tab's session storage, or null when the browser will not give it out. Only a short-lived "I am back from Google" mark is
// kept there (see accountDeletionCore.js); nothing about the account is.
function tabStorage() {
  try { return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null } catch { return null }
}

// True when this page has just come back from Google after the student confirmed it is them (installed app only; see below).
export function returnedFromGoogleConfirmation() {
  const storage = tabStorage()
  return storage ? peekReturnedReauth(storage) : false
}
export function forgetGoogleConfirmation() {
  const storage = tabStorage()
  if (storage) clearReauthMark(storage)
}

// How this account signs in: 'password', 'google', or 'other' (not supported for deletion from here).
export function signInMethod(user) {
  const ids = ((user && user.providerData) || []).map((p) => p && p.providerId)
  if (ids.includes('password')) return 'password'
  if (ids.includes('google.com')) return 'google'
  return 'other'
}

// Ask the account holder to prove it is them (the server also insists on a sign-in from the last five minutes). Throws a Firebase
// Auth error, or one with a code starting "rf/", for reauthMessage() to explain.
export async function confirmIdentity(user, { password } = {}) {
  if (!user) throw Object.assign(new Error('not signed in'), { code: 'rf/unsupported-provider' })
  const method = signInMethod(user)
  if (method === 'password') {
    if (!password) throw Object.assign(new Error('password required'), { code: 'rf/password-required' })
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
    return
  }
  if (method === 'google') {
    // In the installed app a pop-up cannot report back, so the page leaves for Google and the dialog finishes the job when it
    // comes back (returnedFromGoogleConfirmation). That call never returns when the redirect works. The redirect is only used
    // when the "I am back" mark could be stored, otherwise the student would be sent round again on every attempt.
    const storage = tabStorage()
    if (isStandaloneApp() && storage && markReauthStarted(storage)) {
      try { await reauthenticateWithRedirect(user, googleProvider) } catch (err) { clearReauthMark(storage); throw err }
      return
    }
    await reauthenticateWithPopup(user, googleProvider)
    return
  }
  throw Object.assign(new Error('unsupported sign-in method'), { code: 'rf/unsupported-provider' })
}

// Firebase says these when the account behind a token no longer exists.
const GONE_CODES = new Set(['auth/user-token-expired', 'auth/user-not-found', 'auth/user-disabled', 'auth/invalid-user-token'])

// true: Firebase says the account is gone. false: it still exists. null: cannot tell (offline, or nobody is signed in here).
async function accountGone() {
  const user = auth.currentUser
  if (!user) return null
  try { await user.getIdToken(true); return false } catch (err) { return GONE_CODES.has(err && err.code) ? true : null }
}

// Delete the signed-in account. `onProgress({ state: 'running', call })` is called while the server is still working. On
// { ok: true } the browser has been signed out and cleared: the caller should navigate away. Never throws.
export async function deleteMyAccount({ onProgress } = {}) {
  const result = await requestAccountDeletion({
    getToken: async (forceRefresh) => {
      const user = auth.currentUser
      if (!user) throw new Error('not signed in')
      return user.getIdToken(forceRefresh)
    },
    accountGone,
    fetchFn: (...args) => fetch(...args),
    appCheckHeaders: getAppCheckHeader,
    onProgress,
  })
  if (result.ok) {
    try { await signOut(auth) } catch { /* the account is gone either way */ }
    await clearBrowserData()
  }
  return result
}
