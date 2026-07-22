// netlify/functions/referral.js
// Handles referral codes end to end, server-side, with the Admin SDK.
//
// WHY THIS EXISTS (both actions):
//   - action: "lookup"  — shows "Referred by [name]" while filling in the signup form, before
//     the visitor has a Firebase Auth session at all. A signed-out `where()` query against the
//     users collection is a Firestore `list` operation, which the rules correctly deny pre-login
//     (only a direct get-by-id is public — that's what powers public profiles).
//   - action: "apply"   — grants XP + a badge + the rocket icon to the REFERRER when someone
//     signs up with their code. This was previously done directly from the new user's own
//     authenticated client session (src/utils/referrals.js), which tried to update the
//     REFERRER's document (someone else's uid) while authenticated as the new user. Firestore
//     rules only allow `request.auth.uid == userId` (or the narrow friends-array exception) —
//     so every referral signup was throwing "Missing or insufficient permissions" partway
//     through, after the account had already been created, leaving the user on an error message
//     and the referrer never actually rewarded.
//
// CommonJS — netlify/functions/package.json sets "type":"commonjs"

const REFERRAL_BADGE = { id: 'referral', xp: 200 } // mirrors BADGE_MAP.referral in src/data/badges.js

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

async function unlockRocketIcon(db, uid) {
  const ref = db.collection('users').doc(uid)
  const snap = await ref.get()
  if (!snap.exists) return
  const current = snap.data().unlockedIcons || []
  if (!current.includes('rocket')) {
    await ref.update({ unlockedIcons: [...current, 'rocket'] })
  }
}

async function awardReferralBadge(db, uid) {
  const ref = db.collection('users').doc(uid)
  const snap = await ref.get()
  if (!snap.exists) return
  const earned = snap.data().badges || []
  if (earned.includes(REFERRAL_BADGE.id)) return
  const admin = await getAdmin()
  await ref.update({
    badges: [...earned, REFERRAL_BADGE.id],
    xp: admin.firestore.FieldValue.increment(REFERRAL_BADGE.xp),
  })
}

async function awardXP(db, uid, amount) {
  const admin = await getAdmin()
  await db.collection('users').doc(uid).update({ xp: admin.firestore.FieldValue.increment(amount) })
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

  const action = body.action
  const code = String(body.code || '').trim().toUpperCase()

  // ── Public lookup — no auth required, matches signup-page usage before login ──
  if (action === 'lookup') {
    if (!/^[A-Z0-9]{8}$/.test(code)) return respond(200, { found: false })
    try {
      const admin = await getAdmin()
      const db = admin.firestore()
      const snap = await db.collection('users').where('referralCode', '==', code).limit(1).get()
      if (snap.empty) return respond(200, { found: false })
      return respond(200, { found: true, displayName: snap.docs[0].data().displayName || 'a friend' })
    } catch (e) {
      console.error('[referral lookup]', e.message)
      return respond(200, { found: false })
    }
  }

  // ── Apply — requires the caller to be a verified, currently-authenticated user ──
  if (action === 'apply') {
    let decoded
    try {
      decoded = await verifyUserToken(event)
    } catch (e) {
      return respond(403, { error: 'Forbidden' })
    }
    const uid = decoded.uid
    if (!/^[A-Z0-9]{8}$/.test(code)) return respond(200, { applied: false, reason: 'invalid_code' })

    try {
      const admin = await getAdmin()
      const db = admin.firestore()

      const ownCode = uid.slice(0, 8).toUpperCase()
      if (code === ownCode) return respond(200, { applied: false, reason: 'self_referral' })

      const userRef = db.collection('users').doc(uid)
      const userSnap = await userRef.get()
      if (userSnap.data()?.referredBy) return respond(200, { applied: false, reason: 'already_referred' })

      const refSnap = await db.collection('users').where('referralCode', '==', code).limit(1).get()
      if (refSnap.empty) return respond(200, { applied: false, reason: 'code_not_found' })

      const referrerId = refSnap.docs[0].id
      if (referrerId === uid) return respond(200, { applied: false, reason: 'self_referral' })

      await userRef.set({ referredBy: referrerId, referredAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

      // Reward the referrer
      await awardXP(db, referrerId, 200)
      await awardReferralBadge(db, referrerId)
      await unlockRocketIcon(db, referrerId)

      // Reward the new/existing user
      await awardXP(db, uid, 100)
      await unlockRocketIcon(db, uid)

      return respond(200, { applied: true })
    } catch (e) {
      console.error('[referral apply]', e.message)
      return respond(500, { applied: false, reason: 'server_error' })
    }
  }

  return respond(400, { error: 'Unknown action' })
}
