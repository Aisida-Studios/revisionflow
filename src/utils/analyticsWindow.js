// src/utils/analyticsWindow.js
// Which records Analytics counts.
//
// Every account's analytics start on 1 September 2026 (the start of this academic year): sessions,
// papers and XP from before that day are not counted, and everything from that day on is. This is a
// fixed date, not a rolling window, so the same activity counts for everyone and nothing disappears
// because of how a record happened to be tagged. (A previous version also dropped every record that
// had never been stamped with a course, which removed far more than intended.)
import { toLocalDateStr, parseLocalDate, diffLocalDays, addLocalDays } from './localDate'
import { isCurrentSubjectInstance } from './subjectKey'

export const ANALYTICS_START_DATE = '2026-09-01'

// The local calendar day ('YYYY-MM-DD') a record belongs to, or null if it has no usable date.
// A session's own `date` and a paper's `attemptDate` are the student's calendar day and win; failing
// that a start time or a saved/created timestamp is converted to the LOCAL day it fell on.
export function recordDay(r) {
  if (!r) return null
  for (const k of ['date', 'attemptDate']) {
    if (typeof r[k] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(r[k])) return r[k].slice(0, 10)
  }
  if (r.startTime) {
    const d = new Date(r.startTime)
    if (!Number.isNaN(d.getTime())) return toLocalDateStr(d)
  }
  const ts = r.createdAt ?? r.completedAt
  let ms = null
  if (ts && ts.seconds != null) ms = ts.seconds * 1000
  else if (ts instanceof Date) ms = ts.getTime()
  else if (typeof ts === 'string') ms = Date.parse(ts)
  return Number.isFinite(ms) ? toLocalDateStr(new Date(ms)) : null
}

export const inAnalyticsWindow = (record) => {
  const day = recordDay(record)
  return !!day && day >= ANALYTICS_START_DATE
}

// Keep a record unless it is hidden (archived) or is clearly stamped for a course the student is not
// on now. A record with no course stamp at all (older data) cannot be told apart, so it is kept.
export function currentOrUnstamped(records, profile) {
  return (records || []).filter(r => {
    if (!r || r.archived) return false
    if (!r.subjectKey && !r.qualification) return true
    return isCurrentSubjectInstance(r, profile)
  })
}

// First day of an analytics range: `rangeDays` days back, never earlier than the start date.
// 0 (or nothing) means "since the start date". Returns a Date at local midnight.
export function analyticsRangeStart(rangeDays, now = new Date()) {
  const floor = parseLocalDate(ANALYTICS_START_DATE)
  if (!rangeDays) return floor
  const wanted = addLocalDays(toLocalDateStr(now), -Number(rangeDays))
  return wanted > floor ? wanted : floor
}

// Calendar days from `start` to today, counting both ends (never less than 1) - used to average per day.
export function analyticsRangeDays(start, now = new Date()) {
  return Math.max(1, diffLocalDays(start, toLocalDateStr(now)) + 1)
}
