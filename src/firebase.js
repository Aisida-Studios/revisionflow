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

// ── App Check (bot protection) ───────────────────────────────────────────────
// Entirely inert until VITE_RECAPTCHA_SITE_KEY is set in Netlify's environment variables —
// initializeAppCheck() is simply never called without it, so nothing about how the app behaves
// today changes until that's added. See the setup notes shared alongside this file for the
// Google Cloud Console + Firebase Console steps, and why this should stay in monitor mode
// (Firebase Console → App Check → Authentication → "Unenforced") until real traffic is
// confirmed to be passing before switching it to "Enforced".
export let appCheck = null
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
if (recaptchaSiteKey) {
  // Debug token so App Check doesn't block your own `npm run dev` — without this, every
  // request from localhost fails attestation since reCAPTCHA can't run the same way there.
  // Firebase logs a fresh debug token to the browser console the first time this runs; add it
  // to Firebase Console → App Check → Apps → (this app) → Manage debug tokens, or set
  // VITE_APPCHECK_DEBUG_TOKEN once you have one so it's consistent across restarts.
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true
  }
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  } catch (e) {
    console.warn('App Check failed to initialize:', e.message)
  }
}

export default app
