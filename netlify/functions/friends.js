// netlify/functions/friends.js
// Friend requests, accepting, declining and removing friends, all server-side with the Admin SDK.
//
// WHY THIS EXISTS: a friendship touches TWO users' documents, and Firestore rules (rightly) only let a student write their own.
// So accept and remove were moved here earlier. Sending a request now lives here too, for three reasons that were real
// problems in the version where the browser wrote friendRequests directly:
//   * nothing limited how many requests one student could fire at others, or stopped the same request being created again and
//     again (the rules cannot rate-limit or enforce uniqueness);
//   * the sender's name and avatar came from the browser, so a request could claim to be from "RevisionFlow Support" and carry
//     any image URL: here they are read from the sender's own profile;
//   * accepting paid 25 XP (+ the first-friend badge) to BOTH students every time, so remove -> request -> accept repeated for
//     unlimited XP. The reward is now paid once per pair of students (friendPairs) and for a bounded number of friendships.
//
// Identity is the verified ID token only; no uid in the body is trusted to say who is calling.
// CommonJS - netlify/functions/package.json sets "type":"commonjs"
'use strict'

const crypto = require('crypto')
const { route, parseJsonBody, respond, HttpError } = require('./lib/http')
const { getAdmin, verifyUser, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')
const { xpPeriodPatch } = require('./lib/periods')
const { cleanName, safeAvatarUrl } = require('./lib/profile')

const UID_RE = /^[A-Za-z0-9_-]{1,128}$/
const REQUEST_ID_RE = /^[A-Za-z0-9_-]{1,300}$/
const MAX_OUTGOING_PENDING = 20      // requests one student can have waiting for an answer
const MAX_INCOMING_PENDING = 50      // requests that can be waiting for one student
const FRIEND_XP = 25                 // paid to each student, once per pair
const MAX_REWARDED_FRIENDSHIPS = 25  // friendships per student that pay the reward (25 x 25 = 625 XP at most)
const FIRST_FRIEND_BADGE = { id: 'first_friend', xp: 50 } // mirrors BADGE_MAP.first_friend in src/data/badges.js

const isUid = (v) => typeof v === 'string' && UID_RE.test(v)
// Hashed so the document id says nothing about who the pair is and cannot be confused by an "_" inside a uid.
const pairId = (a, b) => crypto.createHash('sha256').update([a, b].sort().join('|')).digest('hex').slice(0, 32)

const cleanAvatar = safeAvatarUrl   // https and a Google photo host only (lib/profile.js)

// ── Send a request ───────────────────────────────────────────────────────────
async function sendRequest(db, admin, caller, toUid) {
  if (!isUid(toUid)) throw new HttpError(400, 'Choose a student to add.', 'bad_request')
  if (toUid === caller) throw new HttpError(400, "You can't add yourself.", 'bad_request')

  // Bounded queries, run before the transaction (a count inside it is not needed for correctness: the deterministic request id
  // below is what stops duplicates, and the rate limit bounds anything that slips through).
  const outgoing = await db.collection('friendRequests').where('from', '==', caller).limit(MAX_OUTGOING_PENDING).get()
  if (outgoing.size >= MAX_OUTGOING_PENDING) return { sent: false, reason: 'too_many_pending' }
  const incoming = await db.collection('friendRequests').where('to', '==', toUid).limit(MAX_INCOMING_PENDING).get()
  if (incoming.size >= MAX_INCOMING_PENDING) return { sent: false, reason: 'recipient_unavailable' }

  const reqRef = db.collection('friendRequests').doc(`${caller}_${toUid}`)
  const reverseRef = db.collection('friendRequests').doc(`${toUid}_${caller}`)
  const fromRef = db.collection('users').doc(caller)
  const toRef = db.collection('users').doc(toUid)

  return db.runTransaction(async (tx) => {
    const [fromSnap, toSnap, reqSnap, reverseSnap] = await Promise.all([tx.get(fromRef), tx.get(toRef), tx.get(reqRef), tx.get(reverseRef)])
    if (!fromSnap.exists || !toSnap.exists) return { sent: false, reason: 'not_found' }
    const from = fromSnap.data()
    if (Array.isArray(from.friends) && from.friends.includes(toUid)) return { sent: false, reason: 'already_friends' }
    if (reverseSnap.exists) return { sent: false, reason: 'incoming_pending' }
    if (reqSnap.exists) return { sent: true, duplicate: true }
    const profile = (from.profile && typeof from.profile === 'object') ? from.profile : {}
    tx.create(reqRef, {
      from: caller,
      fromName: cleanName(from.displayName || profile.displayName),
      fromAvatarUrl: cleanAvatar(from.avatarUrl || profile.avatarUrl),
      to: toUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return { sent: true }
  })
}

// ── Accept ───────────────────────────────────────────────────────────────────
// Everything happens in one transaction: both friend lists, the reward and the removal of the request succeed together or not
// at all (the old code updated the two students one after the other, so a failure part-way left a one-sided friendship).
async function acceptRequest(db, admin, caller, requestId) {
  const reqRef = db.collection('friendRequests').doc(requestId)
  const FieldValue = admin.firestore.FieldValue
  return db.runTransaction(async (tx) => {
    const reqSnap = await tx.get(reqRef)
    if (!reqSnap.exists) return { accepted: false, reason: 'not_found' }
    const { from, to } = reqSnap.data()
    // The request's own `to` decides who may accept it, never a uid supplied by the client.
    if (to !== caller) throw new HttpError(403, 'Forbidden.', 'forbidden')
    if (!isUid(from) || from === to) { tx.delete(reqRef); return { accepted: false, reason: 'invalid' } }

    const fromRef = db.collection('users').doc(from)
    const toRef = db.collection('users').doc(to)
    const pairRef = db.collection('friendPairs').doc(pairId(from, to))
    const [fromSnap, toSnap, pairSnap] = await Promise.all([tx.get(fromRef), tx.get(toRef), tx.get(pairRef)])
    if (!fromSnap.exists || !toSnap.exists) { tx.delete(reqRef); return { accepted: false, reason: 'sender_gone' } }

    let rewarded = false
    if (!pairSnap.exists) {
      const pairsOf = (uid) => db.collection('friendPairs').where('members', 'array-contains', uid).limit(MAX_REWARDED_FRIENDSHIPS)
      const [a, b] = await Promise.all([tx.get(pairsOf(from)), tx.get(pairsOf(to))])
      rewarded = a.size < MAX_REWARDED_FRIENDSHIPS && b.size < MAX_REWARDED_FRIENDSHIPS
    }

    const patchFor = (data, otherUid) => {
      const patch = { friends: FieldValue.arrayUnion(otherUid) }
      if (!rewarded) return patch
      const earned = Array.isArray(data.badges) ? data.badges : []
      const giveBadge = !earned.includes(FIRST_FRIEND_BADGE.id)
      const total = FRIEND_XP + (giveBadge ? FIRST_FRIEND_BADGE.xp : 0)
      patch.xp = FieldValue.increment(total)
      Object.assign(patch, xpPeriodPatch(admin, data, total))
      if (giveBadge) patch.badges = FieldValue.arrayUnion(FIRST_FRIEND_BADGE.id)
      return patch
    }
    tx.update(fromRef, patchFor(fromSnap.data(), to))
    tx.update(toRef, patchFor(toSnap.data(), from))
    tx.delete(reqRef)
    if (rewarded) tx.create(pairRef, { members: [from, to], createdAt: FieldValue.serverTimestamp() })
    return { accepted: true, xpAwarded: rewarded }
  })
}

// ── Decline / withdraw ───────────────────────────────────────────────────────
async function declineRequest(db, caller, requestId) {
  const reqRef = db.collection('friendRequests').doc(requestId)
  const snap = await reqRef.get()
  if (!snap.exists) return { declined: true } // already gone: fine
  const { from, to } = snap.data()
  // Either person involved may remove a request (the recipient declines, the sender withdraws).
  if (to !== caller && from !== caller) throw new HttpError(403, 'Forbidden.', 'forbidden')
  await reqRef.delete()
  return { declined: true }
}

// ── Remove a friend ──────────────────────────────────────────────────────────
// Removes the caller from the friend's list and the friend from the caller's. The friendPairs record stays, so removing and
// re-adding someone never pays the reward again.
async function removeFriend(db, admin, caller, friendUid) {
  if (!isUid(friendUid) || friendUid === caller) throw new HttpError(400, 'Choose a friend to remove.', 'bad_request')
  const FieldValue = admin.firestore.FieldValue
  const myRef = db.collection('users').doc(caller)
  const theirRef = db.collection('users').doc(friendUid)
  await db.runTransaction(async (tx) => {
    const [mine, theirs] = await Promise.all([tx.get(myRef), tx.get(theirRef)])
    if (mine.exists) tx.update(myRef, { friends: FieldValue.arrayRemove(friendUid) })
    if (theirs.exists) tx.update(theirRef, { friends: FieldValue.arrayRemove(caller) })
  })
  return { removed: true }
}

module.exports.handler = route('friends', async (event) => {
  await enforceAppCheck(event)
  const decoded = await verifyUser(event)
  const caller = decoded.uid
  const body = parseJsonBody(event, { maxBytes: 4096, allowEmpty: false })
  const action = String(body.action || '')
  const admin = getAdmin()
  const db = admin.firestore()

  if (action === 'request') {
    await enforceRateLimit(db, event, { route: 'friends.request', uid: caller, limit: 20, windowSec: 3600, message: 'You have sent a lot of friend requests. Please try again later.' })
    return respond(200, await sendRequest(db, admin, caller, body.toUid), event)
  }

  if (action === 'accept' || action === 'decline') {
    const requestId = String(body.requestId || '')
    if (!REQUEST_ID_RE.test(requestId)) throw new HttpError(400, 'Missing request.', 'bad_request')
    await enforceRateLimit(db, event, { route: 'friends.respond', uid: caller, limit: 60, windowSec: 3600 })
    const result = action === 'accept' ? await acceptRequest(db, admin, caller, requestId) : await declineRequest(db, caller, requestId)
    return respond(200, result, event)
  }

  if (action === 'remove') {
    await enforceRateLimit(db, event, { route: 'friends.remove', uid: caller, limit: 60, windowSec: 3600 })
    return respond(200, await removeFriend(db, admin, caller, String(body.friendUid || '')), event)
  }

  throw new HttpError(400, 'Unknown action.', 'unknown_action')
})

// Exported for tests only.
module.exports._internals = { pairId, MAX_OUTGOING_PENDING, MAX_REWARDED_FRIENDSHIPS, FRIEND_XP }
