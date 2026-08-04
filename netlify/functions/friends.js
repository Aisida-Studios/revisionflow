// netlify/functions/friends.js
// Handles friend-request accept and friend removal server-side with the Admin SDK.
//
// WHY THIS EXISTS: both actions need to write to a SECOND user's document (their friends
// array, and — for accept — their XP/badges too). Firestore rules only let a user write their
// own document, plus one narrow exception: a friends-array update on someone else's doc that
// only ADDS uids, never removes them. That exception covered exactly half of each operation,
// which is why both bugs looked like partial successes rather than clean failures:
//
//   - accept: both friends-array adds succeeded (the exception covers additions) and the
//     request doc delete succeeded (sender or recipient may always delete it) — but awarding
//     XP to the OTHER user writes an `xp` field on their doc, which isn't covered by the
//     friends-only exception, so it threw "Missing or insufficient permissions" right after
//     the friend link had already been made.
//   - remove: the caller's own friends-array update succeeded (self-writes are always
//     allowed), but removing yourself from the OTHER person's friends array fails silently
//     against hasAll() — that check only ever allows the array to grow — so they still showed
//     up as a friend on the other side.
//
// Both actions now run atomically here instead. Once nothing client-side needs to touch
// another user's `friends` field, the add-only exception in firestore.rules for /users/{userId}
// can be dropped too — it existed purely to make the old client-side half-fix work.
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const BADGE_MAP = { first_friend: { xp: 50 } } // mirrors BADGE_MAP.first_friend in src/data/badges.js

let _admin = null
async function getAdmin() {
  if (_admin) return _admin
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({ credential: admin.credential.cert(sa) })
  }
  _admin = admin
  return admin
}

// Verifies the bearer token is a real, currently-valid Firebase user (any user — this is not
// an admin-only check) and returns their decoded token (with .uid).
async function verifyUserToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) throw new Error('No authorization token provided')
  const admin = await getAdmin()
  return admin.auth().verifyIdToken(token)
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  }
}

async function awardXP(db, admin, uid, amount) {
  if (!amount || amount <= 0) return
  await db.collection('users').doc(uid).update({ xp: admin.firestore.FieldValue.increment(amount) })
}

async function awardBadge(db, admin, uid, badgeId) {
  const badge = BADGE_MAP[badgeId]
  if (!badge) return
  const ref = db.collection('users').doc(uid)
  const snap = await ref.get()
  if (!snap.exists) return
  const earned = snap.data().badges || []
  if (earned.includes(badgeId)) return
  await ref.update({
    badges: [...earned, badgeId],
    xp: admin.firestore.FieldValue.increment(badge.xp || 0),
  })
}

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    }
  }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let decoded
  try {
    decoded = await verifyUserToken(event)
  } catch (e) {
    return respond(403, { error: 'Forbidden' })
  }
  const callerUid = decoded.uid

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return respond(400, { error: 'Invalid JSON' }) }

  const action = body.action
  const admin  = await getAdmin()
  const db     = admin.firestore()

  // ── Accept a friend request ──────────────────────────────────────────────────
  if (action === 'accept') {
    const requestId = String(body.requestId || '')
    const fromUid    = String(body.fromUid || '')
    if (!requestId || !fromUid) return respond(400, { error: 'requestId and fromUid are required' })

    try {
      const reqRef  = db.collection('friendRequests').doc(requestId)
      const reqSnap = await reqRef.get()
      if (!reqSnap.exists) return respond(404, { error: 'Request no longer exists' })
      const reqData = reqSnap.data()
      // Using the Admin SDK bypasses the Firestore rules entirely, so this check is doing the
      // job the rules would normally do: only the actual recipient can accept, and the
      // fromUid the client sent has to match what's really on the request.
      if (reqData.to !== callerUid || reqData.from !== fromUid) return respond(403, { error: 'Forbidden' })

      const toUid = callerUid
      await db.collection('users').doc(fromUid).update({ friends: admin.firestore.FieldValue.arrayUnion(toUid) })
      await db.collection('users').doc(toUid).update({ friends: admin.firestore.FieldValue.arrayUnion(fromUid) })
      await reqRef.delete()

      await awardXP(db, admin, fromUid, 25)
      await awardXP(db, admin, toUid,   25)
      await awardBadge(db, admin, fromUid, 'first_friend')
      await awardBadge(db, admin, toUid,   'first_friend')

      return respond(200, { accepted: true })
    } catch (e) {
      console.error('[friends accept]', e.message)
      return respond(500, { error: 'Could not accept the request. Try again.' })
    }
  }

  // ── Remove a friend, symmetrically on both sides ─────────────────────────────
  if (action === 'remove') {
    const friendUid = String(body.friendUid || '')
    if (!friendUid) return respond(400, { error: 'friendUid is required' })

    try {
      await db.collection('users').doc(callerUid).update({ friends: admin.firestore.FieldValue.arrayRemove(friendUid) })
      await db.collection('users').doc(friendUid).update({ friends: admin.firestore.FieldValue.arrayRemove(callerUid) })
      return respond(200, { removed: true })
    } catch (e) {
      console.error('[friends remove]', e.message)
      return respond(500, { error: 'Could not remove this friend. Try again.' })
    }
  }

  return respond(400, { error: 'Unknown action' })
}
