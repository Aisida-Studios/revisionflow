// netlify/functions/public-data.js
// Serves the *safe subset* of another user's data — public profile pages, leaderboards,
// friend search/lookup — via the Firebase Admin SDK, which bypasses Firestore security rules.
// CommonJS — netlify/functions/package.json sets "type":"commonjs"
//
// WHY THIS EXISTS:
//   Firestore rules can only allow or deny a read of a WHOLE document — there's no way to say
//   "let anyone read this document, but only these three fields." The users/{uid} document also
//   stores stripeCustomerId, pushSubscription, email, etc. alongside the public stuff (xp, streak,
//   badges, displayName). The rules previously let ANY signed-in user list/query the entire users
//   collection, and let ANYONE — signed in or not — get() any single user's complete document by
//   uid. That meant the whole platform's user data (a children's education product) was readable
//   at scale by any free account, and a stranger's full profile was one guessed/found uid away
//   from anyone at all. Firestore rules now restrict users/{uid} reads to the document's own
//   owner (see firestore.rules) — this function is what public profile pages, leaderboards, and
//   friend search now call instead, returning only the fields those features actually show.

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
async function getDb() {
  const admin = await getAdmin()
  return admin.firestore()
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck',
    },
    body: JSON.stringify(body),
  }
}

// ── App Check (bot protection) — monitor mode, see notify.js for the full explanation.
async function checkAppCheck(event) {
  const token = event.headers['x-firebase-appcheck']
  if (!token) { console.log('[app-check] missing'); return false }
  try {
    const admin = await getAdmin()
    await admin.appCheck().verifyToken(token)
    return true
  } catch (e) {
    console.log('[app-check] invalid:', e.message)
    return false
  }
}

// ── Same week/month rollover logic as src/utils/firestore.js (currentWeekStart /
// currentMonthStart / effectivePeriodXP) — duplicated here because Netlify Functions run in a
// separate CommonJS context from the Vite/ESM frontend. Keep these three in sync if that logic
// ever changes.
function currentWeekStart(now = new Date()) {
  const d = new Date(now)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return d.toISOString().slice(0, 10)
}
function currentMonthStart(now = new Date()) {
  return now.toISOString().slice(0, 7) + '-01'
}
function effectivePeriodXP(d, period) {
  if (period === 'week')  return d.xpWeekStart  === currentWeekStart()  ? (d.xpThisWeek  || 0) : 0
  if (period === 'month') return d.xpMonthStart === currentMonthStart() ? (d.xpThisMonth || 0) : 0
  return d.xp || 0
}

// The only fields ever sent back for a user who isn't the caller. Deliberately excludes email,
// stripe*, pushSubscription, examDates, betaUser/isPro and anything else not already shown by
// PublicProfile.jsx / Leaderboard.jsx / Friends.jsx today.
function safeFields(uid, d, { includeBadgesAndSubjects = false } = {}) {
  const out = {
    uid,
    displayName:             d.displayName || d.profile?.displayName || d.profile?.name || 'Anonymous',
    username:                d.username || null,
    avatarUrl:               d.avatarUrl || d.profile?.avatarUrl || '',
    xp:                      d.xp || 0,
    streak:                  d.streak || 0,
    profileIcon:             d.profileIcon || null,
    hideNameFromLeaderboard: d.hideNameFromLeaderboard || d.profile?.hideNameFromLeaderboard || false,
  }
  if (includeBadgesAndSubjects) {
    out.badges = d.badges || []
    out.subjects = (d.settings?.friendsCanSeeGrades !== false) ? (d.subjects || []).map(s => ({ name: s.name })) : []
  }
  return out
}

module.exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck' }, body: '' }
  }
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' })

  const appCheckValid = await checkAppCheck(event)
  if (process.env.APP_CHECK_ENFORCE === 'true' && !appCheckValid) {
    return respond(401, { error: 'Request verification failed.' })
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return respond(400, { error: 'Invalid JSON' }) }
  const { action } = body

  try {
    const db = await getDb()

    // ── Public profile page — no auth required, matches the existing "logged-out visitors can
    // view a shared profile link" behaviour. Tries handle as a uid first, then as a username.
    if (action === 'profile') {
      const { handle } = body
      if (!handle) return respond(400, { error: 'handle required' })

      let uid, data
      const byId = await db.collection('users').doc(handle).get()
      if (byId.exists) {
        uid = byId.id; data = byId.data()
      } else {
        const q = await db.collection('users').where('username', '==', handle).limit(1).get()
        if (q.empty) return respond(404, { error: 'not found' })
        uid = q.docs[0].id; data = q.docs[0].data()
      }
      if (data.settings?.profilePublic === false) return respond(404, { error: 'not found' })
      return respond(200, safeFields(uid, data, { includeBadgesAndSubjects: true }))
    }

    // Everything below requires a signed-in caller — mirrors the old rules' `if auth != null`.
    let decoded
    try { decoded = await verifyUserToken(event) } catch (e) {
      return respond(401, { error: 'Please sign in.' })
    }

    if (action === 'leaderboard-friends') {
      const meSnap = await db.collection('users').doc(decoded.uid).get()
      const meData = meSnap.exists ? meSnap.data() : {}
      const friendUids = Array.isArray(meData.friends) ? meData.friends : []
      const uids = [...new Set([...friendUids, decoded.uid])].filter(Boolean)

      const results = await Promise.all(uids.map(async uid => {
        try {
          const snap = uid === decoded.uid ? meSnap : await db.collection('users').doc(uid).get()
          if (!snap.exists) return null
          const d = snap.data()
          return {
            ...safeFields(uid, d),
            xpThisWeek:  effectivePeriodXP(d, 'week'),
            xpThisMonth: effectivePeriodXP(d, 'month'),
            isCurrentUser: uid === decoded.uid,
          }
        } catch { return null }
      }))
      return respond(200, results.filter(Boolean))
    }

    if (action === 'leaderboard-global') {
      const period     = body.period || 'allTime'
      const maxResults = Math.min(body.maxResults || 100, 100)

      if (period === 'allTime') {
        const snap = await db.collection('users').orderBy('xp', 'desc').limit(maxResults).get()
        return respond(200, snap.docs.map(d => safeFields(d.id, d.data())))
      }

      // Same "oversample the raw counter, recompute the real period-aware value, drop zeros,
      // re-sort" approach as the client-side version this replaces — the raw stored counter can
      // be stale for someone who was active last period and has done nothing since it rolled over.
      const rawField = period === 'week' ? 'xpThisWeek' : 'xpThisMonth'
      const snap = await db.collection('users').orderBy(rawField, 'desc').limit(maxResults * 3).get()
      const withEffective = snap.docs.map(d => ({ ...safeFields(d.id, d.data()), xp: effectivePeriodXP(d.data(), period) }))
      return respond(200, withEffective.filter(u => u.xp > 0).sort((a, b) => b.xp - a.xp).slice(0, maxResults))
    }

    if (action === 'friend-profiles') {
      const uids = (Array.isArray(body.uids) ? body.uids : []).slice(0, 200)
      const results = await Promise.all(uids.map(async uid => {
        try {
          const snap = await db.collection('users').doc(uid).get()
          if (!snap.exists) return null
          return safeFields(uid, snap.data())
        } catch { return null }
      }))
      return respond(200, results.filter(Boolean))
    }

    if (action === 'search-users') {
      const term = (body.term || '').toLowerCase().trim()
      if (!term) return respond(200, [])
      const snap = await db.collection('users').orderBy('displayName').limit(50).get()
      const matches = snap.docs
        .filter(d => (d.data().displayName || '').toLowerCase().includes(term))
        .slice(0, 10)
        .map(d => safeFields(d.id, d.data()))
      return respond(200, matches)
    }

    return respond(400, { error: 'Unknown action' })
  } catch (e) {
    console.error('[public-data]', body?.action, e.message)
    return respond(500, { error: 'Server error' })
  }
}
