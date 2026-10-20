// src/utils/analyticsWindow.js
// Which records Analytics counts, and from when.
//
// The student chooses the day their analytics start counting from (profile.analyticsStart: a
// 'YYYY-MM-DD' day, or 'all' for everything recorded). Until they choose, analytics start at the
// beginning of the current academic year (the most recent 1 September). Nothing is deleted or
// hidden for good: records before the start day are simply not counted, and moving the day brings
// them back. (An earlier version fixed the start for everyone and also dropped every record that
// had never been stamped with a course, which removed far more than intended.)
import { toLocalDateStr, parseLocalDate, diffLocalDays, addLocalDays } from './localDate'
import { isCurrentSubjectInstance } from './subjectKey'

export const ALL_TIME = 'all'

const isRealDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toLocalDateStr(parseLocalDate(s)) === s

/** The most recent 1 September on or before `now`, as 'YYYY-MM-DD' (the UK academic year starts then). */
export function academicYearStart(now = new Date()) {
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1   // September is month 8
  return `${year}-09-01`
}

/**
 * The day analytics count from: the student's choice, otherwise the start of the academic year.
 * Returns '' for "all time" (no start day). An unreadable stored value falls back to the default.
 */
export function resolveAnalyticsStart(profile, now = new Date()) {
  const chosen = profile?.analyticsStart
  if (chosen === ALL_TIME) return ''
  if (isRealDay(chosen)) return chosen
  return academicYearStart(now)
}

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

/** Is this record on or after the start day? `start` '' means all time. A record with no usable date is not counted. */
export const inAnalyticsWindow = (record, start = '') => {
  const day = recordDay(record)
  return !!day && (!start || day >= start)
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

/** The earliest day any of these records belongs to ('YYYY-MM-DD'), or null. */
export function earliestRecordDay(records) {
  let min = null
  for (const r of records || []) {
    const d = recordDay(r)
    if (d && (!min || d < min)) min = d
  }
  return min
}

// First day of an analytics range: `rangeDays` days back, never earlier than the start day.
// 0 (or nothing) means "the whole period". With no start day (all time) the whole period begins on
// the earliest recorded day, or today when there is nothing yet. Returns a Date at local midnight.
export function analyticsRangeStart(rangeDays, { start = '', earliestDay = null, now = new Date() } = {}) {
  const today = toLocalDateStr(now)
  const floor = parseLocalDate(start || earliestDay || today)
  if (!rangeDays) return floor
  const wanted = addLocalDays(today, -Number(rangeDays))
  return wanted > floor ? wanted : floor
}

// Calendar days from `start` to today, counting both ends (never less than 1) - used to average per day.
export function analyticsRangeDays(start, now = new Date()) {
  return Math.max(1, diffLocalDays(start, toLocalDateStr(now)) + 1)
}
