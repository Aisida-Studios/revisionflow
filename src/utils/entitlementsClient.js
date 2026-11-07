// src/utils/entitlementsClient.js
// The browser's calls to /api/entitlements (the server's answer is the authority) plus everything from
// entitlementsCore.js (the numbers, the wording and the display helpers, which need no network).
import { auth, getAppCheckHeader } from '../firebase'

export * from './entitlementsCore'

// Ask the server. Never throws: the answer is always { ok, code?, message?, ...fields }. If the plan cannot be checked
// (offline, server error) the result is NOT ok, so a feature is never unlocked just because the check failed.
async function call(action, feature) {
  const user = auth.currentUser
  if (!user) return { ok: false, code: 'SIGNED_OUT', message: 'Please sign in first.' }
  try {
    const idToken = await user.getIdToken()
    const res = await fetch('/api/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + idToken, ...(await getAppCheckHeader()) },
      body: JSON.stringify({ action, feature }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok) return data
    return { ...data, ok: false, code: data.code || 'UNAVAILABLE', message: data.error || 'Could not check your plan just now. Please try again.' }
  } catch (e) {
    return { ok: false, code: 'UNAVAILABLE', message: 'Could not check your plan. Check your connection and try again.' }
  }
}

export const fetchEntitlementStatus = () => call('status')             // { ok, pro, features: { [feature]: status }, proOnly: [...] }
export const consumeFeatureUse = (feature) => call('consume', feature) // timetable, timedChallenge, recommendedTopics
export const refundFeatureUse = (feature) => call('refund', feature)   // timetable only, and only if the schedule was not saved
