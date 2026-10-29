// public/timer-ticker.js
// A tiny Web Worker that posts a message every 250 ms. The timer uses it instead of a main-thread setInterval
// because browsers throttle main-thread timers in background tabs (down to once a minute after a few minutes
// hidden), which froze the live time in the tab title. Worker timers are not throttled that way.
let id = null
onmessage = (e) => {
  if (e.data === 'start') {
    clearInterval(id)
    id = setInterval(() => postMessage(1), 250)
  } else {
    clearInterval(id)
    id = null
  }
}
