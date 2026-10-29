// src/utils/sessionRecord.js
// What a session record should say once a student has actually done it with the timer.
// The calendar holds the PLAN (a date, a start time, a duration). When the timer completes a linked session,
// the record should say what really happened: the real start time and the real time studied. The plan is kept
// alongside (planned*) so nothing is lost, and analytics read the measured minutes (see sessionTime.js).
import { toLocalDateStr } from './localDate'

const pad = (n) => String(n).padStart(2, '0')

/**
 * session: the stored session. Returns the fields to write (no undefined values: Firestore rejects them).
 * Without a measured time nothing about the plan is touched. With a measured time of at least a minute the
 * duration becomes the measured minutes; a start time is only recorded when the timer really ran.
 */
export function actualSessionPatch(session = {}, { actualMinutes, startedAtMs, endedAtMs } = {}) {
  const patch = {}
  if (!Number.isFinite(actualMinutes)) return patch
  patch.actualDuration = Math.max(0, Math.round(actualMinutes))
  if (!(actualMinutes > 0) || !Number.isFinite(startedAtMs)) return patch
  const started = new Date(startedAtMs)
  const ended = new Date(Number.isFinite(endedAtMs) ? endedAtMs : startedAtMs + actualMinutes * 60000)
  patch.plannedDate      = session.plannedDate      ?? session.date      ?? null
  patch.plannedStart     = session.plannedStart     ?? session.start     ?? null
  patch.plannedStartTime = session.plannedStartTime ?? session.startTime ?? null
  patch.plannedEndTime   = session.plannedEndTime   ?? session.endTime   ?? null
  patch.plannedDuration  = session.plannedDuration  ?? session.duration  ?? null
  patch.date      = toLocalDateStr(started)
  patch.start     = `${pad(started.getHours())}:${pad(started.getMinutes())}`
  patch.startTime = started.toISOString()
  patch.endTime   = ended.toISOString()
  if (patch.actualDuration >= 1) patch.duration = patch.actualDuration
  return patch
}
