// src/utils/miniTimerState.js
// What the pop-out timer (the small widget in the sidebar / mobile top bar) should show, given the
// shared timer state from TimerContext. Returns null when there is nothing worth showing - a timer
// that has not been started, or is back at its full length, never pops out.

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0'), ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function miniTimerState(t) {
  if (!t) return null
  if (t.alarmFired) return { kind: 'alarm', running: false, seconds: 0, label: 'Alarm' }
  if (t.cdFinished) return { kind: 'finished', running: false, seconds: 0, label: "Time's up" }
  const session = !!t.linkedSessionId
  const countdownPaused = !t.cdRunning && t.cdRemaining < t.cdTotal
  if (t.cdRunning || countdownPaused) {
    return { kind: 'countdown', running: !!t.cdRunning, seconds: t.cdRemaining, label: session ? 'Session timer' : 'Countdown' }
  }
  if (t.swRunning || t.swElapsed > 0) {
    return { kind: 'stopwatch', running: !!t.swRunning, seconds: t.swElapsed, label: session ? 'Session timer' : 'Stopwatch' }
  }
  return null
}
