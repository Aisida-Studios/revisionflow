// netlify/functions/lib/entitlementLogic.js
// CommonJS. The Free / Pro entitlement model, shared by the Netlify functions. Not a function itself (it lives in lib/).
//
// THREE TIERS
//   Core free   always available, subject to the existing daily AI limits in tutor.js. Not handled here.
//   Capped      Pro features a free account may try a few times. Each has a LIFETIME allowance per account that never
//               resets (and, for some, a stricter DAILY allowance on top). Pro and beta accounts have no lifetime cap.
//   Pro only    no free trial at all.
// All the numbers are in entitlementConfig.json, the single place to tune them. The browser reads the same file
// (src/utils/entitlementsCore.js), so the two cannot disagree about a limit.
//
// STORAGE. One document per account, users/{uid}/usage/lifetime, written ONLY here through the Admin SDK (firestore.rules
// gives students read access and no write access):
//   { mathsSolver: 3, timetable: 1, ..., daily: { mathsSolver: { day: '2026-11-05', n: 1 } }, updatedAt }
// The per-day counters that tutor.js already keeps (usage/aiCalls and usage/{feature}) are separate and still apply on top.
//
// Every function that touches Firestore takes the Admin Firestore handle as its first argument, so this file never has
// to initialise Firebase itself and can be tested with a fake.

const CONFIG = require('./entitlementConfig.json')

const DONE = 'LIFETIME_EXHAUSTED', DAILY = 'DAILY_LIMIT', PRO = 'PRO_REQUIRED'
const STATUS_FOR = { [DONE]: 402, [PRO]: 402, [DAILY]: 429, UNKNOWN_FEATURE: 400 }

// Pro means isPro OR betaUser (a beta user has lifetime free Pro access).
const isProUser = (userDoc) => !!userDoc && (userDoc.isPro === true || userDoc.betaUser === true)
const utcDay = (now = new Date()) => now.toISOString().slice(0, 10)
const nonNeg = (n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0)
const isCapped = (feature) => Object.prototype.hasOwnProperty.call(CONFIG.free, feature)
const isProOnly = (feature) => Object.prototype.hasOwnProperty.call(CONFIG.proOnly, feature)

// ── wording. Soft by design: never "quota", "rate limit" or "throttled"; Pro is "more", never "unlimited". ──────────
function messageFor(code, feature) {
  const f = CONFIG.free[feature]
  if (code === PRO) return `${CONFIG.proOnly[feature] || (f && f.label) || 'This'} is a Pro feature.`
  if (!f) return 'That is not available right now.'
  if (code === DONE) {
    const used = f.lifetime === 1 ? `your free ${f.single}` : `all ${f.lifetime} of your free ${f.plural}`
    return `You've used ${used}. ${f.upgradeHint || 'Upgrade to Pro to keep going.'}`
  }
  if (code === DAILY) return `You've used today's free ${f.plural}. More opens up tomorrow, or upgrade to Pro for more.`
  return 'That is not available right now.'
}

// ── pure decisions (no I/O) ──────────────────────────────────────────────────────────────────────────────────────
// What the account's usage looks like for one capped feature.
function describeStatus(feature, doc, { pro = false, day = utcDay() } = {}) {
  const f = CONFIG.free[feature]
  if (!f) return null
  if (pro) return { feature, pro: true, lifetime: null, usedLifetime: null, remainingLifetime: null, dailyLimit: null, dailyUsed: null, dailyRemaining: null, exhausted: false }
  const d = doc || {}
  const usedLifetime = nonNeg(d[feature])
  const rec = d.daily && d.daily[feature]
  const dailyUsed = rec && rec.day === day ? nonNeg(rec.n) : 0
  const remainingLifetime = Math.max(0, f.lifetime - usedLifetime)
  return {
    feature, pro: false, lifetime: f.lifetime, usedLifetime, remainingLifetime,
    dailyLimit: f.daily || null, dailyUsed: f.daily ? dailyUsed : null,
    dailyRemaining: f.daily ? Math.max(0, f.daily - dailyUsed) : null,
    exhausted: remainingLifetime === 0,
  }
}

// Would one more use be allowed? If so, `write` is what to merge into the document. Lifetime is checked before the daily
// cap, so a student who has used everything is told to upgrade, not to come back tomorrow.
function decideConsume(feature, doc, { pro = false, day = utcDay() } = {}) {
  const f = CONFIG.free[feature]
  if (!f) return { allowed: false, code: 'UNKNOWN_FEATURE', message: messageFor('UNKNOWN_FEATURE', feature) }
  if (pro) return { allowed: true, pro: true, usedLifetime: null, remainingLifetime: null, dailyRemaining: null }
  const s = describeStatus(feature, doc, { pro: false, day })
  if (s.remainingLifetime <= 0) return { allowed: false, code: DONE, message: messageFor(DONE, feature), usedLifetime: s.usedLifetime, remainingLifetime: 0, dailyRemaining: s.dailyRemaining }
  if (f.daily && s.dailyUsed >= f.daily) return { allowed: false, code: DAILY, message: messageFor(DAILY, feature), usedLifetime: s.usedLifetime, remainingLifetime: s.remainingLifetime, dailyRemaining: 0 }
  const usedLifetime = s.usedLifetime + 1
  const write = { [feature]: usedLifetime }
  if (f.daily) write.daily = { [feature]: { day, n: s.dailyUsed + 1 } }
  return { allowed: true, usedLifetime, remainingLifetime: f.lifetime - usedLifetime, dailyRemaining: f.daily ? f.daily - (s.dailyUsed + 1) : null, write }
}

// Give one use back. Never below zero, and today's daily count only goes down if it belongs to today.
function decideRefund(feature, doc, { day = utcDay() } = {}) {
  const f = CONFIG.free[feature]
  const d = doc || {}
  const used = nonNeg(d[feature])
  if (!f || used <= 0) return { refunded: false }
  const write = { [feature]: used - 1 }
  const rec = d.daily && d.daily[feature]
  if (f.daily && rec && rec.day === day && nonNeg(rec.n) > 0) write.daily = { [feature]: { day, n: nonNeg(rec.n) - 1 } }
  return { refunded: true, usedLifetime: used - 1, remainingLifetime: f.lifetime - (used - 1), write }
}

// ── Firestore (Admin SDK). `db` is the Admin Firestore instance. ─────────────────────────────────────────────────
const userRef = (db, uid) => db.collection('users').doc(uid)
const lifetimeRef = (db, uid) => userRef(db, uid).collection('usage').doc('lifetime')

async function loadUser(db, uid) {
  const snap = await userRef(db, uid).get()
  return snap.exists ? snap.data() : null
}

// Use one of the account's free uses of a capped feature, in a transaction so two requests at once cannot both take the
// last one. Pro and beta accounts are never counted. Returns { allowed, code?, message?, usedLifetime, remainingLifetime,
// dailyRemaining }.
//   seedUsed  optional async () => number. For an account that has never been counted for this feature, how many uses it has
//             ALREADY had (the timetable: an account that already has a generated schedule has used its free one).
async function consumeLifetimeUse(db, uid, feature, { now = new Date(), seedUsed = null, userDoc } = {}) {
  if (!isCapped(feature)) return decideConsume(feature, null)
  const user = userDoc === undefined ? await loadUser(db, uid) : userDoc
  if (isProUser(user)) return decideConsume(feature, null, { pro: true })
  const ref = lifetimeRef(db, uid)
  const day = utcDay(now)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    let doc = snap.exists ? snap.data() : {}
    let seeded = false
    if (doc[feature] === undefined && seedUsed) {
      const already = nonNeg(await seedUsed())
      if (already > 0) { doc = { ...doc, [feature]: already }; seeded = true }
    }
    const decision = decideConsume(feature, doc, { pro: false, day })
    if (decision.allowed) tx.set(ref, { ...decision.write, updatedAt: now.toISOString() }, { merge: true })
    else if (seeded) tx.set(ref, { [feature]: doc[feature], updatedAt: now.toISOString() }, { merge: true })   // remember it, so nobody has to ask again
    const { write, ...out } = decision
    return out
  })
}

// Give a use back after our own error (the AI call failed, the save did not happen). A student must never lose a free use
// to a failure that was not theirs. Nothing to refund for Pro and beta accounts, who were never counted.
async function refundLifetimeUse(db, uid, feature, { now = new Date() } = {}) {
  if (!isCapped(feature)) return { refunded: false }
  const user = await loadUser(db, uid)
  if (isProUser(user)) return { refunded: false, pro: true }
  const ref = lifetimeRef(db, uid)
  const day = utcDay(now)
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const decision = decideRefund(feature, snap.exists ? snap.data() : {}, { day })
    if (decision.refunded) tx.set(ref, { ...decision.write, updatedAt: now.toISOString() }, { merge: true })
    const { write, ...out } = decision
    return out
  })
}

// Reject a free account for a feature that has no free trial.
async function requireProFeature(db, uid, feature, { userDoc } = {}) {
  const user = userDoc === undefined ? await loadUser(db, uid) : userDoc
  if (isProUser(user)) return { allowed: true, pro: true }
  return { allowed: false, code: PRO, message: messageFor(PRO, feature) }
}

// The status of every capped feature for this account, for the browser to display.
async function getStatus(db, uid, { now = new Date(), seeds = {}, userDoc } = {}) {
  const user = userDoc === undefined ? await loadUser(db, uid) : userDoc
  const pro = isProUser(user)
  const snap = pro ? null : await lifetimeRef(db, uid).get()
  const doc = snap && snap.exists ? snap.data() : {}
  const day = utcDay(now)
  const features = {}
  for (const feature of Object.keys(CONFIG.free)) {
    // an account that has never been counted for a feature but has already used it (seeds) shows as used
    const d = (!pro && doc[feature] === undefined && seeds[feature]) ? { ...doc, [feature]: seeds[feature] } : doc
    features[feature] = describeStatus(feature, d, { pro, day })
  }
  return { pro, features, proOnly: Object.keys(CONFIG.proOnly) }
}

// The HTTP status and body for a decision that was NOT allowed: { error, code, remaining... }. The browser reads `code`.
function denialResponse(decision) {
  return {
    status: STATUS_FOR[decision.code] || 403,
    body: { error: decision.message, code: decision.code, remainingLifetime: decision.remainingLifetime ?? null, dailyRemaining: decision.dailyRemaining ?? null },
  }
}

module.exports = {
  CONFIG, CODES: { LIFETIME_EXHAUSTED: DONE, DAILY_LIMIT: DAILY, PRO_REQUIRED: PRO },
  isProUser, utcDay, isCapped, isProOnly, messageFor,
  describeStatus, decideConsume, decideRefund,
  consumeLifetimeUse, refundLifetimeUse, requireProFeature, getStatus, denialResponse,
}
