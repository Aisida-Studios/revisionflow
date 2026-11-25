// netlify/functions/entitlements.js
// CommonJS (netlify/functions/package.json sets "type":"commonjs").
//
// POST /api/entitlements   { action, feature }
//   status    the account's free-use counts for every capped feature, for the browser to display
//   consume   use one free use of a feature the browser runs itself (timetable, timedChallenge, recommendedTopics)
//   refund    give a timetable use back when the schedule was not saved
//
// WHAT IS COUNTED WHERE (checked against the code, not assumed): this endpoint counts only the three features above. The Maths
// solver, essay feedback and photo-scan marking are counted by tutor.js itself, in the same request as the AI call (see
// "FREE USES" in its header and lib/entitlementLogic.js), so the browser cannot skip the count. `status` reports all of them
// from the same counters and the same lib/entitlementConfig.json, so the app can show how many free uses are left, and this
// endpoint refuses to count those three (NOT_CONSUMABLE_HERE) so that one use can never be taken twice.
//
// SECURITY MODEL: every request needs a valid Firebase ID token. The uid is taken from the verified token only, never from
// the body. All counters are written here through the Admin SDK; firestore.rules lets a student read them and never write.
// Anything unexpected FAILS CLOSED: the request is refused, never waved through. Requests are limited per account and per
// action, input is small and typed, and errors and logs carry no personal data (lib/http.js).
'use strict'

const ent = require('./lib/entitlementLogic')
const { route, parseJsonBody, respond, HttpError, scrub } = require('./lib/http')
const { getAdmin, verifyUser, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')

// Features the browser may ask to have counted (the rest are not counted here; see above).
const BROWSER_CONSUMED = new Set(['timetable', 'timedChallenge', 'recommendedTopics'])
const ACTIONS = new Set(['status', 'consume', 'refund'])
const HOURLY_LIMIT = { status: 300, consume: 120, refund: 60 }   // per account: far above anything a real student does
const MAX_BODY_BYTES = 2 * 1024
const PLAN_CHECK_FAILED = 'Could not check your plan just now. Please try again.'

// How "has this account already used its free timetable" is worked out for accounts that were never counted: a schedule is
// the set of sessions the generator saved (source: 'generated'), so an account that has any has already used its free one.
// Nothing is deleted or changed; the first request for such an account just records that fact.
async function generatedScheduleCount(db, uid) {
  const snap = await db.collection('users').doc(uid).collection('sessions').where('source', '==', 'generated').limit(1).get()
  return snap.empty ? 0 : 1
}
const seedFor = (db, uid, feature) => feature === 'timetable' ? () => generatedScheduleCount(db, uid) : null

module.exports.handler = route('entitlements', async (event) => {
  await enforceAppCheck(event)                       // monitor-only unless APP_CHECK_ENFORCE=true
  const decoded = await verifyUser(event)
  const body = parseJsonBody(event, { maxBytes: MAX_BODY_BYTES })
  const uid = decoded.uid                            // the verified account, never anything in the body
  const { action, feature } = body
  if (typeof action !== 'string' || !ACTIONS.has(action)) throw new HttpError(400, 'Unknown action.', 'bad_request')

  const db = getAdmin().firestore()
  await enforceRateLimit(db, event, { route: 'entitlements.' + action, uid, limit: HOURLY_LIMIT[action], windowSec: 3600 })

  try {
    if (action === 'status') {
      const userDoc = (await db.collection('users').doc(uid).get()).data() || null
      const seeds = ent.isProUser(userDoc) ? {} : { timetable: await generatedScheduleCount(db, uid) }
      return respond(200, { ok: true, ...(await ent.getStatus(db, uid, { userDoc, seeds })) }, event)
    }

    if (action === 'consume') {
      if (typeof feature !== 'string' || !BROWSER_CONSUMED.has(feature)) return respond(400, { error: 'That is counted elsewhere.', code: 'NOT_CONSUMABLE_HERE' }, event)
      const decision = await ent.consumeLifetimeUse(db, uid, feature, { seedUsed: seedFor(db, uid, feature) })
      if (!decision.allowed) { const r = ent.denialResponse(decision); return respond(r.status, r.body, event) }
      return respond(200, { ok: true, ...decision }, event)
    }

    if (action === 'refund') {
      // Only the timetable can be given back by the browser, and only when the schedule really was not saved: if the
      // account has generated sessions, the use was spent.
      if (feature !== 'timetable') return respond(400, { error: 'That cannot be given back here.', code: 'NOT_REFUNDABLE' }, event)
      if (await generatedScheduleCount(db, uid) > 0) return respond(409, { error: 'Your timetable was saved, so there is nothing to give back.', code: 'NOT_REFUNDABLE' }, event)
      return respond(200, { ok: true, ...(await ent.refundLifetimeUse(db, uid, 'timetable')) }, event)
    }

    throw new HttpError(400, 'Unknown action.', 'bad_request')
  } catch (err) {
    if (err instanceof HttpError) throw err
    // Fail closed: if the plan cannot be checked the answer is no, not yes.
    console.error(`[entitlements] ${action} failed: ${scrub(err && err.message)}`)
    throw new HttpError(500, PLAN_CHECK_FAILED, 'plan_check_failed')
  }
})
