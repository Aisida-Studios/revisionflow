// src/utils/referralReward.js
// The REFERRED side of a referral: has the signed-in user just been credited for signing up with someone's link?
// netlify/functions/referral.js stamps referredBy and referredAt on the new account the moment the code is applied, and
// AuthContext shows the "Referral applied" popup from its profile listener (the Signup page unmounts as soon as the
// profile exists, so it cannot show it itself). Pure, so it is covered by tests/utils.test.js.

// A referral counts as new for this long either side of "now" (the window is symmetric so a device clock that is a
// little wrong still works, while an account referred days ago never matches).
export const FRESH_REFERRAL_MS = 10 * 60 * 1000

// A Firestore Timestamp, { seconds, nanoseconds }, a Date or a number of milliseconds, as milliseconds. 0 when unknown.
export function timestampMs(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.seconds === 'number') return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6)
  if (value instanceof Date) return value.getTime()
  return typeof value === 'number' ? value : 0
}

// True once, for a profile that was referred in the last few minutes and has not been shown the popup yet.
// referredRewardShown is written by AuthContext after it shows the popup, so another device does not repeat it.
export function isFreshReferral(profile, nowMs = Date.now()) {
  if (!profile || !profile.referredBy || profile.referredRewardShown) return false
  const at = timestampMs(profile.referredAt)
  if (!at) return false
  const age = nowMs - at
  return age > -FRESH_REFERRAL_MS && age <= FRESH_REFERRAL_MS
}
