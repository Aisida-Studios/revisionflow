import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// ── Service worker registration ─────────────────────────────────────────────
// public/sw.js already existed (caching + web push handling) but was never actually
// registered anywhere, so navigator.serviceWorker.ready — used throughout notifications.js,
// Settings.jsx and usePushNotifications.js — could only ever hang forever, and the app was
// never installable as a PWA (an active service worker is a standard installability
// requirement alongside the manifest). Registered after 'load' so it never competes with the
// initial page render for bandwidth/CPU.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only treat a controllerchange as "there's an update, reload" if a service worker was
    // already controlling this page before — otherwise this fires on every first-ever visit
    // too (no previous controller to update from) and would reload the page for no reason.
    const hadController = !!navigator.serviceWorker.controller

    navigator.serviceWorker.register('/sw.js').catch(err => {
      // Never let a failed SW registration break the app itself
      console.warn('Service worker registration failed:', err)
    })

    // sw.js already calls self.skipWaiting() + self.clients.claim() unconditionally, so a new
    // version takes control as soon as it's installed — reload once when that happens so the
    // update actually applies, instead of leaving the user on stale cached assets.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || !hadController) return
      refreshing = true
      window.location.reload()
    })
  })
}
