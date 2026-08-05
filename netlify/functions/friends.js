// netlify/functions/friends.js
// Handles friend request accept/remove server-side, with the Admin SDK.
//
// WHY THIS EXISTS: acceptFriendRequest and removeFriend in src/utils/firestore.js both need to
// write to TWO users' documents — the caller's own, and the other party's. Firestore rules only
// allow `request.auth.uid == userId` (plus a narrow friends-array exception that doesn't cover
// both directions of this), so the half of each operation touching the OTHER user's document was
// being rejected with "Missing or insufficient permissions" — while the caller's own half (which
// IS allowed) could still go through, which is why a removed friend disappeared from the remover's
// own list but not the other person's, and why accepting produced an error yet still appeared to
// partially work. This mirrors referral.js's existing fix for the exact same class of problem
// (that file's own header comment documents it) — same getAdmin/verifyUserToken/respond pattern.
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

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

async function addFriendPair(db, uidA, uidB) {
  const admin = await getAdmin()
  const refA = db.collection('users').doc(uidA)
  const refB = db.collection('users').doc(uidB)
  await refA.update({ friends: admin.firestore.FieldValue.arrayUnion(uidB) })
  await refB.update({ friends: admin.firestore.FieldValue.arrayUnion(uidA) })
}

async function removeFriendPair(db, uidA, uidB) {
  const admin = await getAdmin()
  const refA = db.collection('users').doc(uidA)
  const refB = db.collection('users').doc(uidB)
  await refA.update({ friends: admin.firestore.FieldValue.arrayRemove(uidB) })
  await refB.update({ friends: admin.firestore.FieldValue.arrayRemove(uidA) })
}

async function awardXP(db, uid, amount, reason) {
  const admin = await getAdmin()
  await db.collection('users').doc(uid).update({ xp: admin.firestore.FieldValue.increment(amount) })
}

// Mirrors checkAndAwardBadge's 'first_friend' case in src/utils/firestore.js — duplicated
// narrowly here (just this one badge, not the whole badge system) since this function runs with
// Admin credentials in a different runtime and can't import client-side firestore.js.
// BADGE_XP mirrors BADGE_MAP.first_friend.xp in src/data/badges.js — checkAndAwardBadge always
// grants a badge's XP alongside the badge itself; this duplicate needs to as well, or a badge
// earned through this path (as opposed to the client-side badge audit) pays out less than it
// should.
const BADGE_XP = { first_friend: 50 }
async function awardFirstFriendBadge(db, admin, uid) {
  const ref  = db.collection('users').doc(uid)
  const snap = await ref.get()
  if (!snap.exists) return
  const earned = snap.data().badges || []
  if (earned.includes('first_friend')) return
  await ref.update({
    badges: [...earned, 'first_friend'],
    xp:     admin.firestore.FieldValue.increment(BADGE_XP.first_friend),
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

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return respond(400, { error: 'Invalid JSON' }) }

  let decoded
  try {
    decoded = await verifyUserToken(event)
  } catch (e) {
    return respond(403, { error: 'Forbidden' })
  }
  const callerUid = decoded.uid
  const action = body.action

  try {
    const admin = await getAdmin()
    const db = admin.firestore()

    // ── Accept — caller must be the request's actual recipient ──────────────────
    if (action === 'accept') {
      const requestId = String(body.requestId || '')
      if (!requestId) return respond(400, { error: 'Missing requestId' })

      const reqRef  = db.collection('friendRequests').doc(requestId)
      const reqSnap = await reqRef.get()
      if (!reqSnap.exists) return respond(200, { accepted: false, reason: 'not_found' })

      const { from, to } = reqSnap.data()
      // The request's own `to` field decides who's allowed to accept it — never trust a
      // client-supplied fromUid/toUid pair, since that would let anyone accept anyone's request.
      if (to !== callerUid) return respond(403, { error: 'Forbidden' })

      await addFriendPair(db, from, to)
      await reqRef.delete()
      await awardXP(db, from, 25, 'New friend')
      await awardXP(db, to,   25, 'New friend')
      await awardFirstFriendBadge(db, admin, from)
      await awardFirstFriendBadge(db, admin, to)

      return respond(200, { accepted: true })
    }

    // ── Decline — same ownership check, no friend-array writes needed ───────────
    if (action === 'decline') {
      const requestId = String(body.requestId || '')
      if (!requestId) return respond(400, { error: 'Missing requestId' })

      const reqRef  = db.collection('friendRequests').doc(requestId)
      const reqSnap = await reqRef.get()
      if (!reqSnap.exists) return respond(200, { declined: true }) // already gone — fine

      if (reqSnap.data().to !== callerUid) return respond(403, { error: 'Forbidden' })
      await reqRef.delete()
      return respond(200, { declined: true })
    }

    // ── Remove — caller removes an existing friend; only valid for the caller's own list ──
    if (action === 'remove') {
      const friendUid = String(body.friendUid || '')
      if (!friendUid) return respond(400, { error: 'Missing friendUid' })
      await removeFriendPair(db, callerUid, friendUid)
      return respond(200, { removed: true })
    }

    return respond(400, { error: 'Unknown action' })
  } catch (e) {
    console.error('[friends]', action, e.message)
    return respond(500, { error: 'Server error' })
  }
}
