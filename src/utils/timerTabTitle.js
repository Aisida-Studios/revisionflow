// src/utils/timerTabTitle.js
// What the browser tab should say, the way a Google timer does it: the live clock sits right in
// the tab, so a countdown stays visible while the student works in another tab, a PDF viewer or
// a past-paper site. Pure function — TimerContext decides when to apply it (see the "Browser tab
// title" effect in TimerContext.jsx), so this stays trivially testable.

import { formatClock } from './miniTimerState'

export const BASE_TITLE = 'RevisionFlow'

/**
 * @returns {string|null} the tab title to show, or null when no clock is worth advertising
 *   (nothing started, or a countdown sitting untouched at its full length).
 */
export function buildTimerTabTitle({
  cdRemaining = 0,
  cdTotal = 0,
  cdRunning = false,
  cdFinished = false,
  cdPaused = false,
  swElapsed = 0,
  swRunning = false,
  alarmFired = false,
} = {}) {
  if (alarmFired) return `⏰ Alarm — ${BASE_TITLE}`
  if (cdFinished) return `⏰ Time's up — ${BASE_TITLE}`

  // Mid-run only: a countdown at full length hasn't started, so there is nothing to show.
  // cdPaused catches the "started then paused within the same second" case, where the rounded
  // remaining time still equals the full duration but the clock really is part-way through.
  const countdownLive = cdRunning
    || (cdPaused && cdRemaining > 0)
    || (cdRemaining > 0 && cdRemaining < cdTotal)
  if (countdownLive) {
    const time = formatClock(cdRemaining)
    return cdRunning ? `${time} · Countdown — ${BASE_TITLE}` : `⏸ ${time} · Paused — ${BASE_TITLE}`
  }

  if (swRunning || swElapsed > 0) {
    const time = formatClock(swElapsed)
    return swRunning ? `${time} · Stopwatch — ${BASE_TITLE}` : `${time} · Stopwatch paused — ${BASE_TITLE}`
  }

  return null
}
