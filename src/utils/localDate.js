// src/utils/localDate.js
// Canonical helpers for LOCAL calendar dates ("YYYY-MM-DD").
// Never use new Date('YYYY-MM-DD') (parses as UTC midnight) or toISOString().slice(0, 10)
// (converts to UTC, so the date is wrong for part of every day in non-UTC zones, e.g. UK
// summer time) for a local calendar day. Use these instead.

const pad = n => String(n).padStart(2, '0')

/** Date -> 'YYYY-MM-DD' using LOCAL year/month/day. */
export function toLocalDateStr(d = new Date()) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/** 'YYYY-MM-DD' (or longer ISO-ish string) -> Date at LOCAL midnight; null if invalid. */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const parts = String(dateStr).slice(0, 10).split('-').map(Number)
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

export const todayLocalStr = () => toLocalDateStr(new Date())

/** Add whole calendar days (DST-safe: uses calendar arithmetic, not 24h multiples). */
export function addLocalDays(dateOrStr, days) {
  const base = typeof dateOrStr === 'string' ? parseLocalDate(dateOrStr) : new Date(dateOrStr)
  base.setDate(base.getDate() + days)
  return base
}

/** Monday (ISO week start) of the local week containing `now`, as 'YYYY-MM-DD'. */
export function localWeekStartStr(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = d.getDay() // 0=Sun..6=Sat
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return toLocalDateStr(d)
}

/** First day of the local month containing `now`, as 'YYYY-MM-01'. */
export function localMonthStartStr(now = new Date()) {
  return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-01'
}

/** Whole calendar days from a to b (b - a), independent of DST shifts. */
export function diffLocalDays(a, b) {
  const da = typeof a === 'string' ? parseLocalDate(a) : a
  const db = typeof b === 'string' ? parseLocalDate(b) : b
  const ua = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())
  const ub = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate())
  return Math.round((ub - ua) / 86400000)
}
