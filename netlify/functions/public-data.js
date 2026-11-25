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
//
// What this version adds (each was a confirmed gap in the previous one):
//   * The settings a student chose are enforced HERE, not only in the browser. "Show me as Anonymous on leaderboards" used to be
//     applied by Leaderboard.jsx after the API had already sent the real name, avatar, username and uid to everyone, so anyone
//     calling the API saw it. Now a hidden student's row carries no name, username or avatar and (on the global board) no uid.
//     A private profile (settings.profilePublic === false) is also left out of name search, as it already was for profile links.
//   * friend-profiles answered for ANY uid a signed-in student asked about (up to 200 at a time): a profile lookup by guessed id.
//     It now answers only for the caller's own friends, which is all the Friends page ever asks for.
//   * Avatar links are passed on only when they are https links to a Google photo host, and names are cleaned (lib/profile.js).
//   * Inputs are validated (a malformed handle used to be a 500), results are bounded, every action is rate limited, CORS is
//     limited to the app's own origins and errors are generic.
//
// Not changed here (owner decisions, listed in CHANGES-EXPLAINED.md under "Decisions that are yours"): profiles are public unless a student turns that off; usernames are
// not unique, so two students can hold the same one; name search only looks at the first 50 profiles in alphabetical order.

'use strict'

const { route, parseJsonBody, respond, HttpError } = require('./lib/http')
const { getAdmin, verifyUser, enforceAppCheck } = require('./lib/auth')
const { enforceRateLimit } = require('./lib/rateLimit')
// Period keys are computed in each user's own timezone (xpTz), matching the client - see lib/periods.js.
const { periodFields } = require('./lib/periods')
const { cleanName, safeAvatarUrl } = require('./lib/profile')

const UID_RE = /^[A-Za-z0-9_-]{1,128}$/
const MAX_HANDLE = 128
const MAX_USERNAME = 50
const MAX_LEADERBOARD_ROWS = 100
const MAX_FRIENDS_READ = 200            // friends considered for the friends board / friend-profiles
const MAX_SEARCH_TERM = 50
const MIN_SEARCH_TERM = 2
const ANONYMOUS = 'Anonymous'

const isUid = (v) => typeof v === 'string' && UID_RE.test(v)
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})

// Did this student choose to appear as Anonymous on leaderboards? (Stored on the root document, or on the older nested profile.)
const isHidden = (d) => d.hideNameFromLeaderboard === true || asObject(d.profile).hideNameFromLeaderboard === true
// Is this student's profile private (not viewable by link, not findable by name)?
const isPrivate = (d) => asObject(d.settings).profilePublic === false

// The only fields ever sent back for a user who isn't the caller. Deliberately excludes email,
// stripe*, pushSubscription, examDates, betaUser/isPro and anything else not already shown by
// PublicProfile.jsx / Leaderboard.jsx / Friends.jsx today.
//   anonymise  -> the student chose to be Anonymous on leaderboards: no name, username or avatar.
function safeFields(uid, d, { includeBadgesAndSubjects = false, anonymise = false } = {}) {
  const profile = asObject(d.profile)
  const out = {
    uid,
    displayName:             anonymise ? ANONYMOUS : (cleanName(d.displayName || profile.displayName || profile.name) || ANONYMOUS),
    username:                anonymise ? null : (typeof d.username === 'string' && d.username ? d.username.slice(0, MAX_USERNAME) : null),
    avatarUrl:               anonymise ? '' : safeAvatarUrl(d.avatarUrl || profile.avatarUrl),
    xp:                      num(d.xp),
    streak:                  num(d.streak),
    profileIcon:             typeof d.profileIcon === 'string' && d.profileIcon ? d.profileIcon.slice(0, 40) : null,
    hideNameFromLeaderboard: isHidden(d),
  }
  if (includeBadgesAndSubjects) {
    out.badges = Array.isArray(d.badges) ? d.badges.filter((b) => typeof b === 'string').slice(0, 150) : []
    out.subjects = (asObject(d.settings).friendsCanSeeGrades !== false && Array.isArray(d.subjects))
      ? d.subjects.map((s) => ({ name: cleanName(asObject(s).name) })).filter((s) => s.name).slice(0, 30)
      : []
  }
  return out
}

// ── Public profile page — no sign-in required (shared profile links work for logged-out visitors). Tries the handle as a uid
// first, then as a username. A private profile and an unknown handle look the same.
async function profile(db, handle) {
  let uid, data
  if (UID_RE.test(handle)) {
    const byId = await db.collection('users').doc(handle).get()
    if (byId.exists) { uid = byId.id; data = byId.data() }
  }
  if (!data && handle.length <= MAX_USERNAME) {
    const q = await db.collection('users').where('username', '==', handle).limit(1).get()
    if (!q.empty) { uid = q.docs[0].id; data = q.docs[0].data() }
  }
  if (!data || isPrivate(data)) throw new HttpError(404, 'not found', 'not_found')
  return safeFields(uid, data, { includeBadgesAndSubjects: true })
}

async function readUser(db, uid) {
  const snap = await db.collection('users').doc(uid).get()
  return { snap, data: snap.exists ? snap.data() : {} }
}
const friendsOf = (data) => [...new Set((Array.isArray(data.friends) ? data.friends : []).filter(isUid))].slice(0, MAX_FRIENDS_READ)

async function leaderboardFriends(db, callerUid) {
  const me = await readUser(db, callerUid)
  const uids = [...new Set([...friendsOf(me.data), callerUid])]
  const rows = await Promise.all(uids.map(async (uid) => {
    try {
      const self = uid === callerUid
      const d = self ? (me.snap.exists ? me.data : null) : (await db.collection('users').doc(uid).get()).data()
      if (!d) return null
      return { ...safeFields(uid, d, { anonymise: !self && isHidden(d) }), ...periodFields(d), isCurrentUser: self }
    } catch { return null }
  }))
  return rows.filter(Boolean)
}

async function leaderboardGlobal(db, callerUid, body) {
  const period = body.period === 'week' || body.period === 'month' ? body.period : 'allTime'
  const requested = Number.isInteger(body.maxResults) ? body.maxResults : MAX_LEADERBOARD_ROWS
  const maxResults = Math.min(Math.max(requested, 1), MAX_LEADERBOARD_ROWS)

  // Every row carries xp (all time) AND xpThisWeek / xpThisMonth: the page reads the field
  // that matches the selected tab. Sending the period value only as `xp` left those two tabs at zero.
  // Someone who chose to be Anonymous is shown as such to everyone else, with a placeholder id; their own row keeps their uid so
  // the page can still find "you".
  let anonymousCount = 0
  const row = (doc) => {
    const d = doc.data()
    if (doc.id !== callerUid && isHidden(d)) {
      anonymousCount += 1
      return { ...safeFields(`anonymous-${anonymousCount}`, d, { anonymise: true }), ...periodFields(d) }
    }
    return { ...safeFields(doc.id, d), ...periodFields(d) }
  }

  if (period === 'allTime') {
    const snap = await db.collection('users').orderBy('xp', 'desc').limit(maxResults).get()
    return snap.docs.map(row)
  }

  // "Oversample the raw counter, recompute the real period-aware value, drop zeros, re-sort":
  // the raw stored counter can be stale for someone who was active last period and has done
  // nothing since it rolled over.
  const periodKey = period === 'week' ? 'xpThisWeek' : 'xpThisMonth'
  const snap = await db.collection('users').orderBy(periodKey, 'desc').limit(maxResults * 3).get()
  return snap.docs.map(row).filter((u) => u[periodKey] > 0).sort((a, b) => b[periodKey] - a[periodKey]).slice(0, maxResults)
}

// Only the caller's own friends: the Friends page passes profile.friends, which is exactly this list.
async function friendProfiles(db, callerUid, body) {
  const requested = Array.isArray(body.uids) ? body.uids.filter(isUid).slice(0, MAX_FRIENDS_READ) : []
  if (!requested.length) return []
  const me = await readUser(db, callerUid)
  const friends = new Set(friendsOf(me.data))
  const allowed = [...new Set(requested)].filter((uid) => friends.has(uid))
  const rows = await Promise.all(allowed.map(async (uid) => {
    try {
      const snap = await db.collection('users').doc(uid).get()
      return snap.exists ? safeFields(uid, snap.data()) : null
    } catch { return null }
  }))
  return rows.filter(Boolean)
}

async function searchUsers(db, callerUid, body) {
  const term = typeof body.term === 'string' ? body.term.toLowerCase().trim() : ''
  if (term.length < MIN_SEARCH_TERM || term.length > MAX_SEARCH_TERM) return []
  const snap = await db.collection('users').orderBy('displayName').limit(50).get()
  return snap.docs
    .filter((d) => d.id !== callerUid && !isPrivate(d.data()) && String(d.data().displayName || '').toLowerCase().includes(term))
    .slice(0, 10)
    .map((d) => safeFields(d.id, d.data()))
}

module.exports.handler = route('public-data', async (event) => {
  await enforceAppCheck(event)
  const body = parseJsonBody(event, { allowEmpty: false })
  const action = typeof body.action === 'string' ? body.action : ''
  const db = getAdmin().firestore()

  if (action === 'profile') {
    await enforceRateLimit(db, event, { route: 'public-data.profile', by: 'ip', limit: 60, windowSec: 60, message: 'Too many requests. Please wait a moment.' })
    if (body.handle === undefined || body.handle === null || body.handle === '') throw new HttpError(400, 'handle required', 'bad_request')
    const handle = typeof body.handle === 'string' ? body.handle.trim() : ''
    if (!handle || handle.length > MAX_HANDLE) throw new HttpError(404, 'not found', 'not_found')
    return respond(200, await profile(db, handle), event)
  }

  // Everything below requires a signed-in caller — mirrors the old rules' `if auth != null`.
  const decoded = await verifyUser(event)
  const uid = decoded.uid
  await enforceRateLimit(db, event, { route: 'public-data.read', uid, limit: 60, windowSec: 60, message: 'Too many requests. Please wait a moment.' })

  if (action === 'leaderboard-friends') return respond(200, await leaderboardFriends(db, uid), event)
  if (action === 'leaderboard-global') return respond(200, await leaderboardGlobal(db, uid, body), event)
  if (action === 'friend-profiles') return respond(200, await friendProfiles(db, uid, body), event)
  if (action === 'search-users') {
    await enforceRateLimit(db, event, { route: 'public-data.search', uid, limit: 20, windowSec: 60, message: 'Too many searches. Please wait a moment.' })
    return respond(200, await searchUsers(db, uid, body), event)
  }

  throw new HttpError(400, 'Unknown action', 'unknown_action')
})

// Exported for tests only.
module.exports._internals = { safeFields, MAX_LEADERBOARD_ROWS, MAX_FRIENDS_READ }
