// src/utils/authUi.js
// Used by Login.jsx and Signup.jsx: plain-language sign-in errors and the installed-app check.

// True when RevisionFlow is running as an installed app (home-screen icon) rather than in a browser tab.
// Same test utils/firestore.js uses to choose between the Google redirect and the Google popup.
export function isStandaloneApp() {
  if (typeof window === 'undefined') return false
  try {
    return !!(window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone === true)
  } catch {
    return false
  }
}

// In the installed app Google sign-in is a redirect: the page is replaced and the sign-in promise never settles.
// If the page is still here after this long, the redirect did not happen and the form is handed back.
export const REDIRECT_WAIT_MS = 15000

export const CONSENT_FLAG = 'rf_consent'
const REDIRECT_FLAG = 'rf_google_redirect'

export function markRedirectStarted() {
  try { sessionStorage.setItem(REDIRECT_FLAG, String(Date.now())) } catch { return }
}

// True when this page load is the return from a Google redirect that started in this tab less than two
// minutes ago, so the person is back on a sign-in page without a session.
export function consumeFailedRedirect() {
  try {
    const started = Number(sessionStorage.getItem(REDIRECT_FLAG))
    sessionStorage.removeItem(REDIRECT_FLAG)
    return !!started && Date.now() - started < 120000 && performance.now() < 20000
  } catch {
    return false
  }
}

const INVALID_LOGIN = 'That email and password do not match. Check them or reset your password.'
const NO_CONNECTION = 'No connection. Check your internet, then try again.'
const GOOGLE_UNAVAILABLE = 'Google sign-in is not available right now. Use your email and password instead.'
const GOOGLE_NOT_IN_BROWSER = 'Google sign-in is not available in this browser. Use your email and password, or open RevisionFlow in your browser.'
const GENERIC = 'Something went wrong. Check your connection and try again.'

const ANY_CONTEXT = {
  'auth/invalid-credential': INVALID_LOGIN,
  'auth/invalid-login-credentials': INVALID_LOGIN,
  'auth/wrong-password': INVALID_LOGIN,
  'auth/user-not-found': INVALID_LOGIN,
  'auth/invalid-email': 'That email address does not look right. Check it and try again.',
  'auth/missing-password': 'Enter your password.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Choose a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/user-disabled': 'This account has been disabled. If you think this is a mistake, email admin@revisionflow.co.uk.',
  'auth/network-request-failed': NO_CONNECTION,
  'unavailable': NO_CONNECTION,
}

const GOOGLE_ONLY = {
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site, or use your email and password instead.',
  'auth/account-exists-with-different-credential': 'This email is already registered with a different sign-in method. Sign in with that method instead.',
  'auth/operation-not-supported-in-this-environment': GOOGLE_NOT_IN_BROWSER,
  'auth/web-storage-unsupported': GOOGLE_NOT_IN_BROWSER,
  'auth/unauthorized-domain': GOOGLE_UNAVAILABLE,
  'auth/operation-not-allowed': GOOGLE_UNAVAILABLE,
  'auth/internal-error': GOOGLE_UNAVAILABLE,
  'rf/redirect-stalled': 'Google sign-in did not finish. Try again, or use your email and password instead.',
}

// Closing the Google window is a choice, not an error.
const SILENT = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
])

// Returns a calm, specific message for a sign-in or sign-up error, or '' when nothing should be shown.
// context: 'login' | 'signup' | 'google' | 'reset'. Raw Firebase text is never returned.
export function authErrorMessage(err, context) {
  const code = (err && err.code) || ''
  if (SILENT.has(code)) return ''
  if (context === 'reset' && code === 'auth/user-not-found') {
    return 'No account uses that email. Check the spelling, or create an account.'
  }
  if (ANY_CONTEXT[code]) return ANY_CONTEXT[code]
  if (context === 'google' && GOOGLE_ONLY[code]) return GOOGLE_ONLY[code]
  if (code === 'auth/web-storage-unsupported') {
    return 'Your browser is blocking the storage that sign-in needs. Turn off private browsing or allow site data for RevisionFlow, then try again.'
  }
  return GENERIC
}
