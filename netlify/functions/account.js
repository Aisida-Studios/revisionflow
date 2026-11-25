// netlify/functions/account.js
// Permanent account deletion, done on the server.
//
//   POST /api/account  { action: 'delete' }   start or resume the deletion of the SIGNED-IN student's account
//   POST /api/account  { action: 'status' }   where that deletion has got to
//
// WHY ON THE SERVER: the browser could only delete the Firebase Auth record (auth.currentUser.delete()). That left every
// Firestore document behind (profile, sessions, notes, flashcards, XP...), left a paid Stripe subscription billing a person
// whose account no longer existed, and left their name inside other students' friend lists. It also reported success even when
// only part of it had worked.
//
// WHAT HAPPENS, in this order. Each step is idempotent and recorded, so the whole job can be repeated or resumed safely:
//   1 subscription     cancel every Stripe subscription for the student and CONFIRM each one is cancelled. If billing cannot be
//                      stopped the job stops here, before anything is deleted. The Stripe customer record is kept (invoices and
//                      payments are financial records we are obliged to retain); only the subscription is ended.
//   2 friend_links     remove the student from other students' friend lists
//   3 friend_requests  delete requests sent by or to the student
//   4 friend_pairs     delete the records that stop the friend reward being paid twice
//   5 shared_content   delete flashcard sets the student shared with the community
//   6 referrals        clear the "referred by" link on students the account referred
//   7 shared_cache     remove the student's id from entries they stored in the shared AI-flashcard cache (createdBy). The cards
//                      are generated content that other students use, so the entry stays; only the link to the student goes
//   8 account_data     recursively delete users/{uid} and EVERY subcollection (profile, sessions, notes, flashcards, ...)
//   9 sign_in_record   delete the Firebase Authentication account - last, so that if anything earlier fails the student can
//                      still sign in and press delete again
//  10 final_sweep      delete users/{uid} once more, in case another open tab re-created an empty profile in the meantime
// "completed" is only ever reported after all of them have succeeded.
//
// SAFETY
//   * The uid is the verified token's uid. Nothing in the body can name another account.
//   * Deleting needs a sign-in from the last 5 minutes (the token's auth_time) and a non-revoked token, so a left-open or stolen
//     session cannot do it; the client asks the student to confirm their password / Google account first.
//   * One run at a time per student (a lease), a rate limit, and a time budget per call: if the work does not fit in one call
//     the answer is 202 "running" and the client calls again; progress is never lost.
//   * The job record (accountDeletions/{hash}) holds a salted hash, a state, a step name and timings: no uid, e-mail or content.
//
// KNOWN LIMIT: a Firebase ID token already issued stays valid for rules for up to an hour after the Auth record is deleted, so a
// second device that was still signed in could re-create an empty profile document in that window. The final sweep removes one
// that appears during the job; the client signs out and clears local data on completion.
'use strict'

const crypto = require('crypto')
const { route, parseJsonBody, respond, HttpError } = require('./lib/http')
const { getAdmin, verifyUser, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')

const RECENT_LOGIN_SECONDS = 5 * 60
const LEASE_MS = 2 * 60 * 1000
const RECORD_TTL_MS = 90 * 24 * 60 * 60 * 1000
const PAGE = 400            // documents per batch (Firestore allows 500 writes per batch)
const MAX_PAGES = 200       // hard stop for any paging loop
const DEFAULT_BUDGET_MS = 8000
const STEPS = ['subscription', 'friend_links', 'friend_requests', 'friend_pairs', 'shared_content', 'referrals', 'shared_cache', 'account_data', 'sign_in_record', 'final_sweep']

const jobIdFor = (uid) => crypto.createHash('sha256').update(`${process.env.RATE_LIMIT_SALT || 'revisionflow'}|account|${uid}`).digest('hex').slice(0, 40)
const budgetMs = () => { const n = Number(process.env.ACCOUNT_DELETE_BUDGET_MS); return Number.isFinite(n) && n >= 0 ? n : DEFAULT_BUDGET_MS }

class StepError extends Error {
  constructor(step, cause) {
    super(`step ${step} failed`)
    this.step = step
    this.causeCode = String((cause && (cause.code || cause.type)) || 'error').slice(0, 60)
  }
}

let _stripe = null
function getStripe() {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new HttpError(503, 'Payments are not available right now.', 'not_configured')
  _stripe = require('stripe')(key)
  return _stripe
}

// ── paging helpers ───────────────────────────────────────────────────────────
// Repeatedly read a bounded page of a query, apply `apply(batch, doc)` to each result and commit, until nothing is left.
async function forEachPage(db, makeQuery, apply) {
  for (let page = 0; page < MAX_PAGES; page++) {
    const snap = await makeQuery().limit(PAGE).get()
    if (snap.empty) return
    const batch = db.batch()
    snap.docs.forEach((doc) => apply(batch, doc))
    await batch.commit()
    if (snap.size < PAGE) return
  }
  throw new Error('too_many_pages')
}

// ── steps ────────────────────────────────────────────────────────────────────
async function stepSubscription({ db, uid }) {
  const snap = await db.collection('users').doc(uid).get()
  const user = snap.exists ? snap.data() : {}
  const customerId = typeof user.stripeCustomerId === 'string' && user.stripeCustomerId ? user.stripeCustomerId : null
  const subId = typeof user.stripeSubId === 'string' && user.stripeSubId ? user.stripeSubId : null
  if (!customerId && !subId) return                     // never paid: nothing to cancel, Stripe is not needed
  const stripe = getStripe()                            // billing cannot be confirmed stopped without Stripe: the job fails here

  const found = new Map()
  if (customerId) {
    let startingAfter
    for (let page = 0; page < 10; page++) {
      let list
      try {
        list = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) })
      } catch (err) {
        if (err && err.code === 'resource_missing') break   // customer id from another Stripe mode: nothing billable here
        throw err
      }
      list.data.forEach((s) => found.set(s.id, s))
      if (!list.has_more || !list.data.length) break
      startingAfter = list.data[list.data.length - 1].id
    }
  }
  if (subId && !found.has(subId)) {
    try { found.set(subId, await stripe.subscriptions.retrieve(subId)) } catch (err) { if (!(err && err.code === 'resource_missing')) throw err }
  }
  for (const sub of found.values()) {
    if (sub.status === 'canceled' || sub.status === 'incomplete_expired') continue
    await stripe.subscriptions.cancel(sub.id)
    const after = await stripe.subscriptions.retrieve(sub.id)          // never assume: confirm it really ended
    if (after.status !== 'canceled') throw new Error('subscription_not_cancelled')
  }
}

async function stepFriendLinks({ db, admin, uid }) {
  await forEachPage(db, () => db.collection('users').where('friends', 'array-contains', uid),
    (batch, doc) => batch.update(doc.ref, { friends: admin.firestore.FieldValue.arrayRemove(uid) }))
}

async function stepFriendRequests({ db, uid }) {
  for (const field of ['from', 'to']) {
    await forEachPage(db, () => db.collection('friendRequests').where(field, '==', uid), (batch, doc) => batch.delete(doc.ref))
  }
}

async function stepFriendPairs({ db, uid }) {
  await forEachPage(db, () => db.collection('friendPairs').where('members', 'array-contains', uid), (batch, doc) => batch.delete(doc.ref))
}

async function stepSharedContent({ db, uid }) {
  await forEachPage(db, () => db.collection('publicFlashcards').where('uid', '==', uid), (batch, doc) => batch.delete(doc.ref))
}

async function stepReferrals({ db, admin, uid }) {
  const del = admin.firestore.FieldValue.delete()
  await forEachPage(db, () => db.collection('users').where('referredBy', '==', uid),
    (batch, doc) => batch.update(doc.ref, { referredBy: del, referredAt: del }))
}

// The firestore.rules let a student record themselves (and only themselves) as the author of a shared-cache entry. The app does
// not write that field today, but the rules allow it, so deletion must not leave a student's id behind in it.
async function stepSharedCache({ db, admin, uid }) {
  const del = admin.firestore.FieldValue.delete()
  await forEachPage(db, () => db.collection('flashcardCache').where('createdBy', '==', uid), (batch, doc) => batch.update(doc.ref, { createdBy: del }))
}

async function stepAccountData({ db, uid }) {
  await db.recursiveDelete(db.collection('users').doc(uid))
}

async function stepSignInRecord({ admin, uid }) {
  try { await admin.auth().deleteUser(uid) } catch (err) { if (!(err && err.code === 'auth/user-not-found')) throw err }
}

// Best effort, and deliberately unable to fail the job: by now the profile data has been deleted and the sign-in record is gone,
// so there is nothing left that a retry could usefully do (and the student can no longer call this endpoint to retry).
async function stepFinalSweep({ db, uid }) {
  try { await db.recursiveDelete(db.collection('users').doc(uid)) } catch (err) {
    console.warn(`[account] final sweep did not complete (${String((err && (err.code || err.type)) || 'error').slice(0, 60)})`)
  }
}

const STEP_FNS = {
  subscription: stepSubscription, friend_links: stepFriendLinks, friend_requests: stepFriendRequests, friend_pairs: stepFriendPairs,
  shared_content: stepSharedContent, referrals: stepReferrals, shared_cache: stepSharedCache, account_data: stepAccountData, sign_in_record: stepSignInRecord, final_sweep: stepFinalSweep,
}

// ── job record and lease ─────────────────────────────────────────────────────
async function claimJob(db, jobRef) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(jobRef)
    const now = Date.now()
    if (!snap.exists) {
      tx.create(jobRef, { state: 'running', step: 'start', done: [], attempts: 1, startedAt: now, updatedAt: now, leaseUntil: now + LEASE_MS, expiresAt: new Date(now + RECORD_TTL_MS) })
      return { claim: 'run', done: [] }
    }
    const job = snap.data()
    if (job.state === 'completed') return { claim: 'completed' }
    if (job.state === 'running' && job.leaseUntil > now) return { claim: 'busy' }
    tx.update(jobRef, { state: 'running', attempts: (job.attempts || 0) + 1, updatedAt: now, leaseUntil: now + LEASE_MS })
    return { claim: 'run', done: Array.isArray(job.done) ? job.done : [] }
  })
}

async function runJob({ db, admin, uid, jobRef, done }) {
  const FieldValue = admin.firestore.FieldValue
  const deadline = Date.now() + budgetMs()
  const finished = new Set(done)
  let ran = 0
  for (const step of STEPS) {
    if (finished.has(step)) continue
    // The last step never pauses: once the sign-in record is deleted the student's token stops working, so a second call could
    // not be made to finish the job.
    if (ran > 0 && step !== 'final_sweep' && Date.now() >= deadline) {
      // Out of time for this call: stop between steps and RELEASE the lease so the client's next call carries straight on.
      await jobRef.update({ state: 'paused', updatedAt: Date.now(), leaseUntil: 0 })
      return 'paused'
    }
    await jobRef.update({ step, updatedAt: Date.now(), leaseUntil: Date.now() + LEASE_MS })
    try {
      await STEP_FNS[step]({ db, admin, uid })
    } catch (err) {
      throw new StepError(step, err)
    }
    await jobRef.update({ done: FieldValue.arrayUnion(step), updatedAt: Date.now() })
    ran++
  }
  const now = Date.now()
  await jobRef.update({ state: 'completed', step: 'done', completedAt: now, updatedAt: now, leaseUntil: 0, expiresAt: new Date(now + RECORD_TTL_MS) })
  return 'completed'
}

async function deleteAccount(db, admin, uid) {
  const jobRef = db.collection('accountDeletions').doc(jobIdFor(uid))
  const { claim, done } = await claimJob(db, jobRef)
  if (claim === 'completed') return { status: 200, body: { state: 'completed' } }
  if (claim === 'busy') return { status: 202, body: { state: 'running', retryAfterSeconds: 5 } }
  try {
    const outcome = await runJob({ db, admin, uid, jobRef, done })
    if (outcome === 'completed') return { status: 200, body: { state: 'completed' } }
    return { status: 202, body: { state: 'running', retryAfterSeconds: 2 } }
  } catch (err) {
    const step = err instanceof StepError ? err.step : 'unknown'
    const code = err instanceof StepError ? err.causeCode : 'error'
    console.error(`[account] job ${jobIdFor(uid).slice(0, 8)} failed at ${step} (${code})`)
    await jobRef.update({ state: 'failed', updatedAt: Date.now(), leaseUntil: 0, failure: { step, code } }).catch(() => {})
    throw new HttpError(503, 'We could not finish deleting your account yet. Nothing has been lost. Please try again in a few minutes.', 'deletion_incomplete', { body: { state: 'failed' } })
  }
}

async function deletionStatus(db, uid) {
  const snap = await db.collection('accountDeletions').doc(jobIdFor(uid)).get()
  if (!snap.exists) return { state: 'none' }
  const job = snap.data()
  // 'paused' = stopped between steps to fit the time limit, waiting for the next call; a 'running' record whose lease has
  // expired means the call that was running it was cut off.
  if (job.state === 'paused') return { state: 'running', step: job.step }
  const interrupted = job.state === 'running' && !(job.leaseUntil > Date.now())
  return { state: interrupted ? 'failed' : job.state, step: job.step }
}

module.exports.handler = route('account', async (event) => {
  await enforceAppCheck(event)
  const body = parseJsonBody(event, { maxBytes: 1024, allowEmpty: false })
  const action = String(body.action || '')
  if (action !== 'delete' && action !== 'status') throw new HttpError(400, 'Unknown action.', 'unknown_action')

  // checkRevoked: once the sign-in record is deleted, further calls are refused (the client treats that as "already deleted").
  const decoded = await verifyUser(event, { checkRevoked: true, maxAuthAgeSeconds: action === 'delete' ? RECENT_LOGIN_SECONDS : null })
  const uid = decoded.uid
  const admin = getAdmin()
  const db = admin.firestore()

  if (action === 'status') {
    await enforceRateLimit(db, event, { route: 'account.status', uid, limit: 120, windowSec: 3600 })
    return respond(200, await deletionStatus(db, uid), event)
  }
  await enforceRateLimit(db, event, { route: 'account.delete', uid, limit: 120, windowSec: 3600, message: 'Too many attempts. Please wait a while and try again.' })
  const result = await deleteAccount(db, admin, uid)
  return respond(result.status, result.body, event)
})

// Exported for tests only.
module.exports._internals = { STEPS, jobIdFor, RECENT_LOGIN_SECONDS }
