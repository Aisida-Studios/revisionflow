// netlify/functions/lib/periods.js
// Weekly / monthly XP period keys, computed in the USER's timezone.
//
// The client (src/utils/firestore.js awardXP) stamps xpWeekStart / xpMonthStart as LOCAL calendar
// dates and records the user's IANA timezone beside them as `xpTz`. Server functions that read or
// add to those fields (friends, referral, public-data) must roll periods over at the same moment
// the client does, so they compute the keys in that same timezone. Computing them in UTC instead
// disagrees with the client for several hours a week (every Sunday night for a US user, the first
// hour of each Monday and of each month for the UK in summer), and a server-side award landing in
// that window would reset the user's weekly XP to the award amount.
//
// A user doc with no `xpTz` was last written by older code that used UTC, so it is read as UTC.
// This is the single copy for all three functions; keep the client's currentWeekStart() /
// currentMonthStart() (local-time versions) in step with it.
'use strict'

function ymdIn(now, tz) {
  const opts = { year: 'numeric', month: '2-digit', day: '2-digit' }
  let parts
  try {
    parts = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: tz || 'UTC' }).formatToParts(now)
  } catch (e) {
    parts = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).formatToParts(now) // unknown tz name
  }
  const get = (type) => parts.find(p => p.type === type).value
  return get('year') + '-' + get('month') + '-' + get('day')
}

// Monday (ISO week start) of the week containing `now` in `tz`, as 'YYYY-MM-DD'.
function currentWeekStart(now = new Date(), tz = 'UTC') {
  const [y, m, d] = ymdIn(now, tz).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d)) // pure calendar arithmetic on the user's local date
  const dow = dt.getUTCDay()                 // 0 = Sunday
  dt.setUTCDate(dt.getUTCDate() + (dow === 0 ? -6 : 1 - dow))
  return dt.toISOString().slice(0, 10)       // dt was built from UTC parts, so this is exact
}

// First day of the month containing `now` in `tz`, as 'YYYY-MM-01'.
function currentMonthStart(now = new Date(), tz = 'UTC') {
  return ymdIn(now, tz).slice(0, 7) + '-01'
}

// Firestore update that adds `amount` to a user's weekly and monthly XP, starting a fresh period
// (value = amount) when the stored period key no longer matches the user's current one.
function xpPeriodPatch(admin, existingData, amount, now = new Date()) {
  const tz         = existingData && existingData.xpTz
  const weekStart  = currentWeekStart(now, tz)
  const monthStart = currentMonthStart(now, tz)
  const inc = admin.firestore.FieldValue.increment(amount)
  return {
    xpWeekStart:  weekStart,
    xpMonthStart: monthStart,
    xpThisWeek:   existingData && existingData.xpWeekStart  === weekStart  ? inc : amount,
    xpThisMonth:  existingData && existingData.xpMonthStart === monthStart ? inc : amount,
  }
}

// A stored xpThisWeek / xpThisMonth is only trusted if its stamped period start matches the user's
// CURRENT period; otherwise they have earned nothing since it rolled over, whatever the field says.
function effectivePeriodXP(d, period, now = new Date()) {
  const tz = d && d.xpTz
  if (period === 'week')  return d.xpWeekStart  === currentWeekStart(now, tz)  ? (d.xpThisWeek  || 0) : 0
  if (period === 'month') return d.xpMonthStart === currentMonthStart(now, tz) ? (d.xpThisMonth || 0) : 0
  return d.xp || 0
}

// The two period values a leaderboard row needs, recomputed against the user's CURRENT period.
// The leaderboard page reads entry.xpThisWeek / entry.xpThisMonth for the selected tab, so every
// row a server function returns must carry both (the global board used to send only `xp`, which
// is why its This week / This month tabs showed zero for everyone).
function periodFields(d, now = new Date()) {
  return { xpThisWeek: effectivePeriodXP(d, 'week', now), xpThisMonth: effectivePeriodXP(d, 'month', now) }
}

module.exports = { ymdIn, currentWeekStart, currentMonthStart, xpPeriodPatch, effectivePeriodXP, periodFields }
