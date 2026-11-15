// src/utils/studySounds.js
// Short success and failure sounds for study questions, made with the Web Audio API (no audio files, no network).
// Call unlockSounds() from a click or key handler, then playCorrect() or playIncorrect() when a question is marked.
// The "Question sounds" setting is passed in with setSoundsEnabled(); it is stored on the profile, not here.

let ctx = null
let enabled = true
let lastPlayed = -Infinity

function context() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) {
    try { ctx = new AudioCtx() } catch { return null }
  }
  return ctx
}

export function setSoundsEnabled(on) { enabled = !!on }
export function soundsEnabled() { return enabled }

export function unlockSounds() {
  const c = context()
  if (c && c.state === 'suspended') c.resume().catch(() => {})
}

function tone(c, { freq, at, duration, type = 'sine', volume = 0.12 }) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  const start = c.currentTime + at
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function play(notes) {
  if (!enabled) return
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  const c = context()
  if (!c) return
  const now = performance.now()
  if (now - lastPlayed < 150) return
  lastPlayed = now
  if (c.state === 'suspended') c.resume().catch(() => {})
  notes.forEach(n => tone(c, n))
}

export function playCorrect() {
  play([{ freq: 660, at: 0, duration: 0.11 }, { freq: 880, at: 0.1, duration: 0.18 }])
}

export function playIncorrect() {
  play([{ freq: 247, at: 0, duration: 0.14, type: 'triangle' }, { freq: 196, at: 0.12, duration: 0.2, type: 'triangle' }])
}
