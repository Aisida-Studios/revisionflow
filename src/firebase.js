// src/firebase.js
// Replace the config object below with your own Firebase project config.
// Get it from: Firebase Console → Project Settings → Your Apps → SDK setup and configuration

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
// Explicitly set local persistence so users stay signed in on mobile/PWA
setPersistence(auth, browserLocalPersistence).catch(e => console.warn('Auth persistence:', e))
// Firestore's realtime channel can be rejected or reset (a 400 on .../Listen/channel) behind some proxies, VPNs,
// school networks and ad blockers. Auto-detecting long polling lets the SDK fall back to a transport those
// networks allow, instead of retrying a stream that keeps failing. Falls back to the default instance if
// Firestore was already initialised (hot reload in development).
let firestore
try { firestore = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }) } catch { firestore = getFirestore(app) }
export const db = firestore
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// ── App Check (bot protection) — TEMPORARILY DISABLED ───────────────────────
// initializeAppCheck() hooks into Firestore/Auth automatically — once called, every single
// Firestore request first tries to fetch an App Check token, which depends on the reCAPTCHA
// Enterprise script loading. The CSP in netlify.toml doesn't allow that script yet, so the
// token-fetch hung, which hung every Firestore call in the app, which is what took the whole
// site down. Left disabled here until the CSP is fixed AND verified working — re-enabling is a
// one-line change (see below) once that's confirmed, not before.
export let appCheck = null
// const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
// if (recaptchaSiteKey) {
//   if (import.meta.env.DEV) {
//     self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true
//   }
//   try {
//     appCheck = initializeAppCheck(app, {
//       provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
//       isTokenAutoRefreshEnabled: true,
//     })
//   } catch (e) {
//     console.warn('App Check failed to initialize:', e.message)
//   }
// }

// Named export as well as the default: several admin components dynamically import the named `app`,
// which used to be undefined because only the default existed.
export { app }
export default app

// Used by every fetch() call to a Netlify function to attach the App Check token, when App
// Check is configured — returns {} harmlessly otherwise, so every call site stays safe whether
// or not VITE_RECAPTCHA_SITE_KEY has been set.
export async function getAppCheckHeader() {
  if (!appCheck) return {}
  try {
    const { getToken } = await import('firebase/app-check')
    const result = await getToken(appCheck, false)
    return { 'X-Firebase-AppCheck': result.token }
  } catch (e) {
    return {}
  }
}
