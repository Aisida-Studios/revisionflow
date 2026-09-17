// src/firebase.js
// Replace the config object below with your own Firebase project config.
// Get it from: Firebase Console → Project Settings → Your Apps → SDK setup and configuration

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
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
export const db = getFirestore(app)
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
