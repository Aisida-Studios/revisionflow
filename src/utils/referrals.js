// src/utils/referrals.js
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'

export function generateReferralCode(uid) {
  return uid.slice(0, 8).toUpperCase()
}

// Link goes directly to /signup so the referral code field is pre-filled
export function getReferralUrl(uid) {
  const code = generateReferralCode(uid)
  return `https://www.revisionflow.co.uk/signup?ref=${code}`
}

async function callReferralApi(action, params = {}) {
  let idToken = ''
  try {
    if (auth.currentUser) idToken = await auth.currentUser.getIdToken()
  } catch (e) { console.warn('[referrals] could not get ID token:', e.message) }

  try {
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify({ action, ...params }),
    })
    return await res.json()
  } catch (e) {
    // A referral is a bonus on top of signup, never something that should block or error out
    // account creation itself if the network hiccups.
    console.warn('[referrals] API call failed:', e.message)
    return { found: false, applied: false }
  }
}

// Looks up just the referrer's display name — public, no auth needed (used on the signup page
// before the visitor has an account). See netlify/functions/referral.js for why this can't be a
// direct client-side Firestore query.
export async function lookupReferrer(code) {
  if (!code || code.length < 8) return { found: false }
  try { return await callReferralApi('lookup', { code }) }
  catch (e) { return { found: false } }
}

// Applies a referral code for the CURRENTLY AUTHENTICATED user (new signup or existing user
// entering one later) and grants rewards to both sides. This used to write directly to the
// referrer's Firestore document from the client — which Firestore rules correctly block, since
// a user can only write their own document — causing "Missing or insufficient permissions" partway
// through signup. Now goes through /api/referral (Admin SDK, server-side) instead.
export async function applyReferralCode(newUid, referralCode) {
  if (!referralCode) return false
  const result = await callReferralApi('apply', { code: referralCode })
  return !!result.applied
}

export async function applyReferralCodeForExistingUser(uid, referralCode) {
  if (!referralCode) return false
  const result = await callReferralApi('apply', { code: referralCode })
  return !!result.applied
}

export async function ensureReferralCode(uid) {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.data()?.referralCode) {
    await setDoc(ref, { referralCode: generateReferralCode(uid) }, { merge: true })
  }
}

export function captureReferralFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const ref    = params.get('ref')
  if (ref) {
    sessionStorage.setItem('pendingReferral', ref)
    localStorage.setItem('pendingReferralFallback', ref)
  }
}

export function getPendingReferral() {
  return sessionStorage.getItem('pendingReferral') || localStorage.getItem('pendingReferralFallback')
}

export function clearPendingReferral() {
  sessionStorage.removeItem('pendingReferral')
  localStorage.removeItem('pendingReferralFallback')
}

// Legacy aliases
export const getPendingReferralWithFallback = getPendingReferral
export const clearAllPendingReferrals       = clearPendingReferral
