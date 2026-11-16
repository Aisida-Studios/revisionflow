// src/utils/accountMethods.js
// The ways a person can sign in to an account (email and password, Google) and the confirmation email for an email
// address. Used by components/SignInMethods.jsx (Settings) and components/EmailVerifyBanner.jsx (Dashboard).
// signup() in AuthContext calls sendVerificationEmail, so a new email sign-up is sent its confirmation email straight away.
// Adding a method LINKS it to the signed-in account (same account, same data); it never creates a second account.
import { EmailAuthProvider, GoogleAuthProvider, linkWithCredential, linkWithPopup, linkWithRedirect, sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { isStandaloneApp } from './authUi'

export function signInMethods(user) {
  const ids = ((user && user.providerData) || []).map(p => p.providerId)
  return { password: ids.includes('password'), google: ids.includes('google.com') }
}

// An email-and-password account whose address has not been confirmed yet. Google confirms its own addresses.
export function needsEmailConfirmation(user) {
  return !!user && !!user.email && user.emailVerified === false && signInMethods(user).password
}

// Re-reads the account from Firebase so emailVerified and the list of methods are current. Offline, it keeps what it has.
export async function refreshUser() {
  const user = auth.currentUser
  if (user) {
    try { await user.reload() } catch { /* offline or signed out: keep the current copy */ }
  }
  return auth.currentUser
}

// Sends the confirmation email. The link brings the person back to the Dashboard when the address is an authorised
// domain; on any other address (a preview site) Firebase refuses the return link, so it is sent again without one.
export async function sendVerificationEmail(user) {
  const target = user || auth.currentUser
  if (!target) throw Object.assign(new Error('Not signed in.'), { code: 'auth/no-current-user' })
  try {
    await sendEmailVerification(target, { url: window.location.origin + '/dashboard' })
  } catch (e) {
    if (e && /continue-uri/.test(e.code || '')) await sendEmailVerification(target)
    else throw e
  }
}

// Gives a Google account a password, so the same email can sign in either way.
export async function addPassword(user, password) {
  if (!user || !user.email) throw Object.assign(new Error('This account has no email address.'), { code: 'rf/no-email' })
  await linkWithCredential(user, EmailAuthProvider.credential(user.email, password))
  await refreshUser()
}

// Connects a Google account to the signed-in account. In the installed app the page leaves for Google and the answer is
// read when it comes back (AuthContext), so this resolves with 'redirect' only if the page is somehow still here.
export async function connectGoogle(user) {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  if (isStandaloneApp()) {
    await linkWithRedirect(user, provider)
    return 'redirect'
  }
  await linkWithPopup(user, provider)
  await refreshUser()
  return 'done'
}
