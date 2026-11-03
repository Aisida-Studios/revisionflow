// src/utils/pwaInstall.js
// Chrome fires beforeinstallprompt once, early in the page load. It is captured when this file is imported
// (App.jsx imports it, so it runs for every page) and handed to the install banner and card whenever they mount.

let deferred = null
let installed = false
const listeners = new Set()
const notify = () => listeners.forEach(fn => fn())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; notify() })
  window.addEventListener('appinstalled', () => { installed = true; deferred = null; notify() })
}

export const canPromptInstall = () => !!deferred
export const wasInstalled = () => installed

export function subscribeInstall(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function promptInstall() {
  if (!deferred) return false
  const event = deferred
  deferred = null
  event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') installed = true
  notify()
  return outcome === 'accepted'
}
