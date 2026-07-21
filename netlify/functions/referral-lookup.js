// netlify/functions/referral-lookup.js
// Public, unauthenticated lookup of a referral code -> the referrer's display name only.
//
// WHY THIS EXISTS:
// Signup.jsx wants to show "🚀 Referred by [name]" while someone is filling in the signup
// form — i.e. before they have a Firebase Auth session. Firestore rules correctly only allow
// unauthenticated reads of a SPECIFIC known document by id (`allow get: true`, which is what
// powers public profiles), not open-ended queries like `where('referralCode','==',code)`
// (`allow list: if request.auth != null`). A signed-out visitor querying by referralCode is a
// `list` operation, so it was always being silently denied — the referrer's name never showed,
// with no visible error, since the client code swallowed the permission error.
//
// This function does that one narrow lookup server-side with the Admin SDK (which bypasses
// client rules) and returns ONLY a display name — never the referrer's uid, email, or any other
// field — so opening this endpoint up publicly doesn't expose anything beyond what the referrer
// already shares by handing out their invite link.
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

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  }
}

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return respond(400, { error: 'Invalid JSON' }) }

  const code = String(body.code || '').trim().toUpperCase()
  // Referral codes are always exactly 8 characters (see generateReferralCode in referrals.js) —
  // reject anything else before touching Firestore at all.
  if (!/^[A-Z0-9]{8}$/.test(code)) return respond(200, { found: false })

  try {
    const admin = await getAdmin()
    const db = admin.firestore()
    const snap = await db.collection('users').where('referralCode', '==', code).limit(1).get()
    if (snap.empty) return respond(200, { found: false })
    const displayName = snap.docs[0].data().displayName || 'a friend'
    return respond(200, { found: true, displayName })
  } catch (e) {
    console.error('[referral-lookup]', e.message)
    return respond(200, { found: false })
  }
}
