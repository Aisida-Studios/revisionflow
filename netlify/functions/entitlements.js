// netlify/functions/entitlements.js
// CommonJS (netlify/functions/package.json sets "type":"commonjs").
//
// POST /api/entitlements   { action, feature }
//   status    the account's free-use counts for every capped feature, for the browser to display
//   consume   use one free use of a feature the browser runs itself (timetable, timedChallenge, recommendedTopics)
//   refund    give a timetable use back when the schedule was not saved
// The Maths solver, essay feedback and photo-scan marking are counted inside tutor.js, in the same request as the AI
// call, so the browser cannot ask for those to be counted separately (or skip it).
//
// SECURITY MODEL: every request needs a valid Firebase ID token. The uid is taken from the verified token only, never from
// the body. All counters are written here through the Admin SDK; firestore.rules lets a student read them and never write.
// Anything unexpected FAILS CLOSED: the request is refused, never waved through.

const ent = require('./lib/entitlementLogic')

// Features the browser may ask to have counted (the rest are counted inside tutor.js).
const BROWSER_CONSUMED = new Set(['timetable', 'timedChallenge', 'recommendedTopics'])

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
async function getDb() { return (await getAdmin()).firestore() }

async function verifyUserToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) throw new Error('No authorization token provided')
  return (await getAdmin()).auth().verifyIdToken(token)
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    },
    body: JSON.stringify(body),
  }
}

// How "has this account already used its free timetable" is worked out for accounts that were never counted: a schedule is
// the set of sessions the generator saved (source: 'generated'), so an account that has any has already used its free one.
// Nothing is deleted or changed; the first request for such an account just records that fact.
async function generatedScheduleCount(db, uid) {
  const snap = await db.collection('users').doc(uid).collection('sessions').where('source', '==', 'generated').limit(1).get()
  return snap.empty ? 0 : 1
}
const seedFor = (db, uid, feature) => feature === 'timetable' ? () => generatedScheduleCount(db, uid) : null

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck' }, body: '' }
  }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  let uid
  try { uid = (await verifyUserToken(event)).uid } catch (e) {
    console.error('[entitlements] auth verification failed:', e.code || e.message || e)
    return respond(401, { error: 'Please sign in first.' })
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return respond(400, { error: 'Invalid JSON body' }) }
  const { action, feature } = body

  try {
    const db = await getDb()

    if (action === 'status') {
      const userDoc = (await db.collection('users').doc(uid).get()).data() || null
      const seeds = ent.isProUser(userDoc) ? {} : { timetable: await generatedScheduleCount(db, uid) }
      return respond(200, { ok: true, ...(await ent.getStatus(db, uid, { userDoc, seeds })) })
    }

    if (action === 'consume') {
      if (!BROWSER_CONSUMED.has(feature)) return respond(400, { error: 'That is counted elsewhere.', code: 'NOT_CONSUMABLE_HERE' })
      const decision = await ent.consumeLifetimeUse(db, uid, feature, { seedUsed: seedFor(db, uid, feature) })
      if (!decision.allowed) { const r = ent.denialResponse(decision); return respond(r.status, r.body) }
      return respond(200, { ok: true, ...decision })
    }

    if (action === 'refund') {
      // Only the timetable can be given back by the browser, and only when the schedule really was not saved: if the
      // account has generated sessions, the use was spent.
      if (feature !== 'timetable') return respond(400, { error: 'That cannot be given back here.', code: 'NOT_REFUNDABLE' })
      if (await generatedScheduleCount(db, uid) > 0) return respond(409, { error: 'Your timetable was saved, so there is nothing to give back.', code: 'NOT_REFUNDABLE' })
      return respond(200, { ok: true, ...(await ent.refundLifetimeUse(db, uid, 'timetable')) })
    }

    return respond(400, { error: 'Unknown action.' })
  } catch (e) {
    // Fail closed: if the plan cannot be checked the answer is no, not yes.
    console.error('[entitlements] error:', e)
    return respond(500, { error: 'Could not check your plan just now. Please try again.' })
  }
}
