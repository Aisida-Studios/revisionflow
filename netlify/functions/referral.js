// netlify/functions/referral.js
// Referral codes, server-side, with the Admin SDK.
//
//   action "lookup" (no sign-in)  - shows "Referred by [name]" while someone is filling in the sign-up form, before they have a
//                                   Firebase session. A signed-out where() query is a Firestore `list`, which the rules refuse,
//                                   so this narrow lookup is done here and returns ONLY a display name.
//   action "apply"  (signed in)   - links the signed-in student to a referrer and pays the rewards. It touches the REFERRER's
//                                   document, which the rules never let a browser write.
//
// What changed from the first version, and why:
//   * apply was a series of separate read-then-write calls. Two simultaneous calls could both see "not referred yet" and both pay
//     out; a failure half-way left rewards paid but no link recorded (or the reverse). It is now ONE transaction: the link, both
//     students' XP, the badge and the icon all happen together or not at all, and a second call finds "already referred".
//   * Nothing limited how many rewards one referrer could collect from throw-away accounts. Rewards now stop after
//     MAX_REWARDED_REFERRALS per referrer (the link is still recorded, so the new student is not told off, but no XP is paid).
//   * lookup was an unlimited, unauthenticated code -> name oracle. It is now rate limited per caller address.
//   * A code is only honoured for the account it really belongs to. The stored `referralCode` field is writable by its owner,
//     so a student could copy someone else's code into their own profile and the old `where('referralCode','==',code).limit(1)`
//     might have paid the rewards to the copier. A code is the first 8 characters of the uid, upper-cased (the same rule as
//     src/utils/referrals.js), so the server accepts a match only when the matched document's id produces the code.
//   * The caller's identity is the verified ID token only. CORS is limited to the app's own origins.
//
// Known limit (documented, not hidden): a determined person can still make someone else's code stop resolving by stuffing that
// code into more than MAX_CODE_CANDIDATES throw-away profiles, because the lookup reads at most that many candidates. That is a
// nuisance (the link shows no "Referred by"), not a way to earn XP. Removing it needs a server-owned code index; see
// CHANGES-EXPLAINED.md, "Decisions that are yours".
// CommonJS - netlify/functions/package.json sets "type":"commonjs"
'use strict'

const { route, parseJsonBody, respond, HttpError } = require('./lib/http')
const { getAdmin, verifyUser, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')
const { xpPeriodPatch } = require('./lib/periods')

const CODE_RE = /^[A-Z0-9]{8}$/
const REFERRAL_BADGE = { id: 'referral', xp: 200 }   // mirrors BADGE_MAP.referral in src/data/badges.js
const REFERRER_XP = 200
const REFERRED_XP = 100
const MAX_REWARDED_REFERRALS = 25                    // 25 x 200 = 5,000 XP (plus the badge) at most per referrer
const MAX_CODE_CANDIDATES = 100                      // most profiles read when looking for the real owner of a code

// The code a uid produces. Keep in step with generateReferralCode() in src/utils/referrals.js.
const codeOf = (uid) => String(uid).slice(0, 8).toUpperCase()
const cleanName = (v) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100)

// The user document that genuinely owns `code`, or null. A document that merely STORES the code does not count unless its
// id produces it.
async function findOwner(db, code) {
  if (!CODE_RE.test(code)) return null
  const snap = await db.collection('users').where('referralCode', '==', code).limit(MAX_CODE_CANDIDATES).get()
  return snap.docs.find((d) => codeOf(d.id) === code) || null
}

async function lookup(db, code) {
  const owner = await findOwner(db, code)
  if (!owner) return { found: false }
  return { found: true, displayName: cleanName(owner.data().displayName) || 'a friend' }
}

async function apply(db, admin, uid, code) {
  if (!CODE_RE.test(code)) return { applied: false, reason: 'invalid_code' }
  if (code === codeOf(uid)) return { applied: false, reason: 'self_referral' }
  const owner = await findOwner(db, code)
  if (!owner) return { applied: false, reason: 'code_not_found' }
  const referrerId = owner.id
  if (referrerId === uid) return { applied: false, reason: 'self_referral' }

  const FieldValue = admin.firestore.FieldValue
  const meRef = db.collection('users').doc(uid)
  const referrerRef = db.collection('users').doc(referrerId)

  return db.runTransaction(async (tx) => {
    const [meSnap, referrerSnap] = await Promise.all([tx.get(meRef), tx.get(referrerRef)])
    // The referrer must still exist and still hold the code (it could have been deleted or edited since the lookup).
    if (!referrerSnap.exists || referrerSnap.data().referralCode !== code) return { applied: false, reason: 'code_not_found' }
    const me = meSnap.exists ? meSnap.data() : {}
    if (me.referredBy) return { applied: false, reason: 'already_referred' }
    const referrer = referrerSnap.data()
    const already = await tx.get(db.collection('users').where('referredBy', '==', referrerId).limit(MAX_REWARDED_REFERRALS))
    const rewarded = already.size < MAX_REWARDED_REFERRALS

    const mePatch = { referredBy: referrerId, referredAt: FieldValue.serverTimestamp() }
    if (rewarded) {
      Object.assign(mePatch, { xp: FieldValue.increment(REFERRED_XP), unlockedIcons: FieldValue.arrayUnion('rocket'), ...xpPeriodPatch(admin, me, REFERRED_XP) })
      const hasBadge = Array.isArray(referrer.badges) && referrer.badges.includes(REFERRAL_BADGE.id)
      const total = REFERRER_XP + (hasBadge ? 0 : REFERRAL_BADGE.xp)
      const referrerPatch = { xp: FieldValue.increment(total), unlockedIcons: FieldValue.arrayUnion('rocket'), ...xpPeriodPatch(admin, referrer, total) }
      if (!hasBadge) referrerPatch.badges = FieldValue.arrayUnion(REFERRAL_BADGE.id)
      tx.update(referrerRef, referrerPatch)
    }
    tx.set(meRef, mePatch, { merge: true })
    return { applied: true, rewarded }
  })
}

module.exports.handler = route('referral', async (event) => {
  await enforceAppCheck(event)
  const body = parseJsonBody(event, { maxBytes: 1024, allowEmpty: false })
  // Strings only: String() would turn ['OWNERAB1'] or {toString} into something that looks like a code.
  const action = typeof body.action === 'string' ? body.action : ''
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  const admin = getAdmin()
  const db = admin.firestore()

  if (action === 'lookup') {
    await enforceRateLimit(db, event, { route: 'referral.lookup', by: 'ip', limit: 30, windowSec: 60, message: 'Too many lookups. Please wait a moment.' })
    return respond(200, await lookup(db, code), event)
  }

  if (action === 'apply') {
    const decoded = await verifyUser(event)
    await enforceRateLimit(db, event, { route: 'referral.apply', uid: decoded.uid, limit: 10, windowSec: 3600 })
    return respond(200, await apply(db, admin, decoded.uid, code), event)
  }

  throw new HttpError(400, 'Unknown action.', 'unknown_action')
})

// Exported for tests only.
module.exports._internals = { MAX_REWARDED_REFERRALS, MAX_CODE_CANDIDATES, REFERRER_XP, REFERRED_XP, REFERRAL_BADGE, codeOf }
