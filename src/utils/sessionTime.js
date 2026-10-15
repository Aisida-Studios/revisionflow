// src/utils/sessionTime.js
// How long a session really took, with no invented defaults.
//   - actualDuration (minutes) is written by the timer when a linked session is completed, so it
//     is measured time and wins whenever it exists (including 0).
//   - otherwise the planned duration is used: that is the student's own plan for a session they
//     ticked off by hand, not a guess made by the app.
//   - a session with neither contributes 0 minutes. It is never silently treated as 45.
export function sessionMinutes(s) {
  if (s && s.actualDuration != null) {
    const actual = Number(s.actualDuration)
    if (Number.isFinite(actual) && actual >= 0) return actual
  }
  const planned = Number(s?.duration)
  return Number.isFinite(planned) && planned > 0 ? planned : 0
}

// True when the minutes for this session come from the timer rather than the plan.
export const isMeasuredSession = (s) => s?.actualDuration != null && Number.isFinite(Number(s.actualDuration))
