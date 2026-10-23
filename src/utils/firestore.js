// src/utils/firestore.js

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  where,
  limit,
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { auth, db, getAppCheckHeader } from '../firebase'
import { BADGE_MAP } from '../data/badges'
import { getDailyQuests } from '../data/badges'
import { levelFromXP } from '../data/subjects'
import { buildTopicId, isLegacyTopicId } from './topicId'
import { buildSubjectKey, isCurrentSubjectInstance } from './subjectKey'
import { createNotification } from './notificationFeed'
import { submitContentForReview } from './adminApi'
import { todayLocalStr, localWeekStartStr, localMonthStartStr } from './localDate'

export { auth, db }

/* =========================
   AUTH
========================= */

const googleProvider = new GoogleAuthProvider()

// signInWithPopup relies on the popup window being able to message back to the window that
// opened it. That relationship doesn't hold up once the app is running as an installed/standalone
// PWA rather than a normal browser tab — the popup either fails to open or its result never makes
// it back, which is why Google sign-in didn't work from the installed app. signInWithRedirect
// sidesteps that entirely by navigating the whole app to Google and back instead of opening a
// second window; AuthContext.jsx's getRedirectResult() call picks up the result once it returns.
function isStandalonePWA() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone === true
}
export const loginWithGoogle  = ()       => isStandalonePWA() ? signInWithRedirect(auth, googleProvider) : signInWithPopup(auth, googleProvider)
export const loginWithEmail   = (e, p)   => signInWithEmailAndPassword(auth, e, p)
export const signupWithEmail  = (e, p)   => createUserWithEmailAndPassword(auth, e, p)
export const resetPassword    = (e)      => sendPasswordResetEmail(auth, e)
export const logout           = ()       => signOut(auth)

/* =========================
   USER / PROFILE
========================= */

export async function ensureUser(uid, initialData = {}) {
  const ref          = doc(db, 'users', uid)
  const snap         = await getDoc(ref)
  // Referral code is always the first 8 chars of uid — deterministic, no query needed
  const referralCode = uid.slice(0, 8).toUpperCase()

  if (!snap.exists()) {
    await setDoc(ref, {
      createdAt:    serverTimestamp(),
      xp:           0,
      streak:       0,
      lastLogin:    null,
      badges:       [],
      friends:      [],
      referralCode,
      displayName:  initialData.displayName || '',
      avatarUrl:    initialData.avatarUrl   || '',
      profile: {
        displayName: initialData.displayName || '',
        email:       initialData.email       || '',
        avatarUrl:   initialData.avatarUrl   || '',
      },
    })
  } else {
    // Patch any fields missing from old accounts
    const existing = snap.data()
    const patches  = {}
    if (!existing.referralCode)                                    patches.referralCode           = referralCode
    if (!existing.displayName  && initialData.displayName)         patches.displayName             = initialData.displayName
    if (!existing.profile?.displayName && initialData.displayName) patches['profile.displayName'] = initialData.displayName
    // Refresh on every login (not just "if missing") — a Google photo can change, or wasn't
    // available yet if the account was originally created with email/password.
    if (initialData.avatarUrl && existing.avatarUrl !== initialData.avatarUrl) patches.avatarUrl = initialData.avatarUrl
    if (Object.keys(patches).length > 0) await updateDoc(ref, patches)
  }
}

// Write top-level fields directly (not nested under profile:{})
export const updateUserProfile = (uid, updates) =>
  updateDoc(doc(db, 'users', uid), updates)

// Unlock a specific profile icon (stored as unlockedIcons array)
export const unlockReferralIcon = async (uid) => {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const current = snap.data().unlockedIcons || []
  if (!current.includes('rocket')) {
    await updateDoc(ref, { unlockedIcons: [...current, 'rocket'] })
  }
}

/* =========================
   TIMETABLE (school timetable — lesson + free periods)
========================= */
// Same users/{uid}/settings/{docId} subcollection CalendarGenerator.jsx already reads/writes
// for 'calendarPrefs' — a new document in an existing, already-permitted subcollection, not a
// new top-level collection, so it needs no separate security rule.

const DEFAULT_TIMETABLE_ROTATION = { enabled: false, evenWeekLabel: 'A' }

// Returns { days, rotation } — NOT just the days map (changed when fortnight rotation was
// added). rotation: { enabled, evenWeekLabel } — see weekLabelForDate in scheduler.js for
// how evenWeekLabel is used; defaults to "no rotation" for any timetable saved before this
// existed, so old data reads back exactly as it did (every period applies every week).
export const getUserTimetable = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'timetable'))
  if (!snap.exists()) return { days: {}, rotation: DEFAULT_TIMETABLE_ROTATION }
  const data = snap.data()
  return {
    days: data.days || {},
    rotation: data.rotation || DEFAULT_TIMETABLE_ROTATION,
  }
}

// `days`: { Monday: [{ id, type:'lesson'|'free', label, startTime, endTime, week? }], ... }
// `week` on a period is 'A' | 'B' | absent (absent = every week — untouched by rotation).
// `rotation`: { enabled, evenWeekLabel } — omit to leave rotation settings unchanged.
export const saveUserTimetable = async (uid, days, rotation) => {
  const update = { days, updatedAt: serverTimestamp() }
  if (rotation !== undefined) update.rotation = rotation
  await setDoc(doc(db, 'users', uid, 'settings', 'timetable'), update, { merge: true })
}

/* =========================
   STREAK
========================= */

export async function updateStreakOnLogin(uid) {
  // Login alone does NOT extend the streak.
  // Only recordActivityStreak() does — called when user logs real activity.
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data     = snap.data()
  const todayStr = new Date().toDateString()
  const lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : null
  if (!lastLogin || lastLogin.toDateString() !== todayStr) {
    await updateDoc(ref, { lastLogin: serverTimestamp() })
  }
}

// Streak freeze allowance — free users get 1/week, Pro (or beta) gets 3/week. A freeze
// covers exactly one missed day; missing two or more days in a row still breaks the streak.
const STREAK_FREEZE_ALLOWANCE = { free: 1, pro: 3 }

// data.freezeWeekStart and the day strings below are all .toDateString() output, which
// (unlike a bare 'YYYY-MM-DD' string) parses back through `new Date()` as local time, not
// UTC — so this never drifts a day near a timezone boundary the way new Date('2026-08-10')
// would. Keep using this format for any new date fields on the profile doc.
function daysBetweenDateStrings(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

// Call whenever user logs real revision activity (session, paper, task, note, mistake, quiz).
export async function recordActivityStreak(uid) {
  const ref      = doc(db, 'users', uid)
  const now      = new Date()
  const todayStr = now.toDateString()

  // The "already counted today?" check and the streak write happen in ONE transaction, so two
  // activities finishing together (e.g. a session completing and the timer ending) can't both
  // extend the streak or both pay the daily streak XP.
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return null

    const data            = snap.data()
    const lastActivityStr = data.lastActivityDate || null
    if (lastActivityStr === todayStr) return null // already counted today

    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()
    const twoDaysAgo = new Date(now); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toDateString()

    const currentStreak = data.streak || 0
    const updates = { lastActivityDate: todayStr }
    let newStreak
    let freezeUsed = false

    if (!lastActivityStr || lastActivityStr === yesterdayStr) {
      // First-ever activity, or a normal consecutive day
      newStreak = lastActivityStr ? currentStreak + 1 : 1
    } else if (lastActivityStr === twoDaysAgoStr && currentStreak > 0) {
      // Exactly one day was missed — a streak freeze can cover this
      const isPro     = data.isPro === true || data.betaUser === true
      const allowance = isPro ? STREAK_FREEZE_ALLOWANCE.pro : STREAK_FREEZE_ALLOWANCE.free
      const weekStart = data.freezeWeekStart || null
      const freshWeek  = !weekStart || daysBetweenDateStrings(weekStart, todayStr) >= 7
      const usedThisWeek = freshWeek ? 0 : (data.freezesUsedThisWeek || 0)

      if (usedThisWeek < allowance) {
        freezeUsed = true
        newStreak = currentStreak + 1 // the missed day is "filled in" — streak continues
        updates.freezesUsedThisWeek = usedThisWeek + 1
        updates.freezeWeekStart = freshWeek ? todayStr : weekStart
        updates.lastFreezeUsedDate = todayStr
      } else {
        newStreak = 1 // no freeze left this week — streak breaks as normal
      }
    } else {
      newStreak = 1 // missed two or more days — a single freeze doesn't cover that
    }

    updates.streak     = newStreak
    updates.bestStreak = Math.max(newStreak, data.bestStreak || 0)
    tx.update(ref, updates)
    return { newStreak, freezeUsed }
  })
  if (!result) return
  const { newStreak, freezeUsed } = result

  // Keyed to the calendar day: the daily streak XP can only ever be paid once per day.
  await awardXP(uid, 10, 'Daily streak', { eventId: 'streak:' + todayStr.replace(/ /g, '_') })

  // Same pattern as awardXP's 'xp-awarded' event below — XPToast.jsx listens for both.
  if (freezeUsed && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('streak-freeze-used', { detail: { streak: newStreak } }))
  }
  // The event above only reaches someone who's in the app at that moment —
  // this persists the same information so it's still visible in the feed
  // if they check later.
  if (freezeUsed) {
    createNotification(uid, {
      type: 'streak',
      title: 'Streak freeze used',
      body: `You missed a day, but a freeze kept your ${newStreak}-day streak going.`,
      link: '/dashboard',
    }).catch(() => {})
  }

  if (newStreak === 3)   await checkAndAwardBadge(uid, 'streak_3')
  if (newStreak === 7)   await checkAndAwardBadge(uid, 'streak_7')
  if (newStreak === 14)  await checkAndAwardBadge(uid, 'streak_14')
  if (newStreak === 30)  await checkAndAwardBadge(uid, 'streak_30')
  if (newStreak === 100) await checkAndAwardBadge(uid, 'streak_100')
}


// xpForLevel/levelFromXP used to be defined here too (and, separately, duplicated again in
// Layout.jsx and Dashboard.jsx for their own XP-bar displays) — three different copies of the
// same idea, all using the old, easier 1.15 curve, none of them actually wired into awardXP. This
// copy was dead code (never called). Consolidated into one canonical version — LEVELS/levelFromXP
// in subjects.js, imported above — and Layout.jsx/Dashboard.jsx now import it too instead of
// keeping their own copies, so the sidebar, dashboard, and Profile page can never disagree about
// what level a given XP total actually is.

// ── XP period tracking (this week / this month) ──────────────────────────────
// Backs the Leaderboard's This week/This month tabs. Deliberately has no scheduled reset job —
// a cron-based reset is one more thing that can silently fail and leave stale numbers with
// nothing to flag it. Instead, the "period start" (the Monday of the current ISO week, or the
// 1st of the current month) is recomputed fresh from today's date every time XP is awarded,
// and compared against what's stored on the user doc:
//  - same period  → increment the running total, same as `xp` itself
//  - different (or missing) period → the period has rolled over; start the counter fresh at
//    just this award, and stamp the new period start
// getLeaderboard/getGlobalLeaderboard below do the read-side half of this: any entry whose
// stored period start doesn't match the CURRENT period is treated as 0 for that period,
// regardless of what number is sitting in xpThisWeek/xpThisMonth — so an inactive user's stale
// total from a previous period never has to be reset by anything, it's just never trusted.
// IANA name of the user's current timezone, stored beside XP period keys (see xpTz above).
function localTimeZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' }
}

export function currentWeekStart(now = new Date()) {
  return localWeekStartStr(now) // LOCAL Monday, 'YYYY-MM-DD'
}
export function currentMonthStart(now = new Date()) {
  return localMonthStartStr(now) // LOCAL 'YYYY-MM-01'
}
// Transaction-safe XP award. Reads the user doc and writes xp, level, weekly and monthly XP
// in ONE Firestore transaction, so two simultaneous awards can never overwrite each other
// (the old read-then-increment could compute a stale level or reset a period twice).
// Pass { eventId } to make the award idempotent: the event is recorded at
// users/{uid}/xpEvents/{eventId} inside the same transaction, and a repeat call with the same
// eventId is a no-op that returns { awarded: false }.
export const awardXP = async (uid, amount, reason = '', { eventId } = {}) => {
  if (!uid || !amount || amount <= 0) return { awarded: false }
  const userRef  = doc(db, 'users', uid)
  // Every award leaves a dated event record (keyed when idempotent, auto-id otherwise). That is
  // what the Analytics XP chart reads, so it shows real awards rather than an estimate.
  const eventRef = eventId
    ? doc(db, 'users', uid, 'xpEvents', String(eventId).replace(/\//g, '_'))
    : doc(collection(db, 'users', uid, 'xpEvents'))

  const result = await runTransaction(db, async (tx) => {
    // All reads first, then writes.
    const userSnap = await tx.get(userRef)
    if (eventId) {
      const ev = await tx.get(eventRef)
      if (ev.exists()) return { awarded: false }
    }
    const data       = userSnap.exists() ? userSnap.data() : {}
    const newXp      = (data.xp || 0) + amount
    const weekStart  = currentWeekStart()
    const monthStart = currentMonthStart()
    tx.set(userRef, {
      xp:           newXp,
      level:        levelFromXP(newXp),
      xpWeekStart:  weekStart,
      xpMonthStart: monthStart,
      xpTz:         localTimeZone(), // lets server functions roll periods over in THIS timezone
      xpThisWeek:   data.xpWeekStart  === weekStart  ? (data.xpThisWeek  || 0) + amount : amount,
      xpThisMonth:  data.xpMonthStart === monthStart ? (data.xpThisMonth || 0) + amount : amount,
    }, { merge: true })
    tx.set(eventRef, { amount, reason, day: todayLocalStr(), createdAt: serverTimestamp() })
    return { awarded: true, amount }
  })

  // Fire browser event so XPToast component can show the popup (only for real awards)
  if (result.awarded && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xp-awarded', { detail: { amount, reason } }))
  }
  return result
}

// XP awards recorded on or after `sinceDay` ('YYYY-MM-DD', local), oldest first. These are real
// awards written by awardXP(); XP paid by server functions (friends, referrals) isn't included.
export const getXpEvents = async (uid, sinceDay) => {
  const snap = await getDocs(query(collection(db, 'users', uid, 'xpEvents'), where('day', '>=', sinceDay)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
}

export const awardTimerXP = async (uid, seconds, { eventId } = {}) => {
  const xp = Math.min(Math.floor(seconds / 60), 100)
  if (xp > 0) await awardXP(uid, xp, 'Timer session', eventId ? { eventId } : {})
  // timer_25 was defined in DAILY_QUEST_POOL with an XP value but nothing ever called
  // autoCompleteQuest for it — meaning it was literally impossible to complete on any day it
  // happened to be selected, short of the removed manual "Done" button in DailyQuests.jsx.
  if (seconds >= 25 * 60) await autoCompleteQuest(uid, 'timer_25')
}

export const checkAndAwardBadge = async (uid, badgeId) => {
  if (!uid || !badgeId) return
  const badge = BADGE_MAP[badgeId]
  if (!badge) return

  const ref = doc(db, 'users', uid)
  // Transactional and idempotent: the "already earned?" check and the write happen atomically,
  // so concurrent calls can't both award the badge's XP.
  const awarded = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return false
    const data   = snap.data()
    const earned = data.badges || []
    if (earned.includes(badgeId)) return false
    const bonus      = badge.xp || 0
    if (bonus > 0) {
      tx.set(doc(db, 'users', uid, 'xpEvents', 'badge_' + badgeId), { amount: bonus, reason: 'Badge: ' + badge.name, day: todayLocalStr(), createdAt: serverTimestamp() })
    }
    const newXp      = (data.xp || 0) + bonus
    const weekStart  = currentWeekStart()
    const monthStart = currentMonthStart()
    tx.update(ref, {
      badges:       [...earned, badgeId],
      xp:           newXp,
      level:        levelFromXP(newXp),
      xpWeekStart:  weekStart,
      xpMonthStart: monthStart,
      xpTz:         localTimeZone(),
      xpThisWeek:   data.xpWeekStart  === weekStart  ? (data.xpThisWeek  || 0) + bonus : bonus,
      xpThisMonth:  data.xpMonthStart === monthStart ? (data.xpThisMonth || 0) + bonus : bonus,
    })
    return true
  })
  if (!awarded) return

  // Single choke point for every badge source (streak milestones, quest
  // completion, first session, first paper, etc.) — one call here covers
  // all of them rather than a notification call at each award site.
  createNotification(uid, {
    type: 'badge',
    title: `Badge earned: ${badge.name}`,
    body: badge.description || '',
    link: '/profile',
  }).catch(() => {}) // best-effort — a failed notification write shouldn't undo the badge award above
}

/* =========================
   DAILY QUESTS
========================= */

const QUEST_XP = {
  log_session:     30,
  rate_topics:     20,
  log_paper:       40,
  use_ai:          15,
  timer_25:        25,
  resolve_mistake: 20,
  add_note:        15,
  add_friend:      20,
}

// Previously accepted ANY of the 8 possible quest ids unconditionally — completing a session
// always paid out the log_session "Daily quest" bonus even on a day where log_session wasn't one
// of today's 3 selected quests (see DAILY_QUEST_POOL/getDailyQuests in data/badges.js), because
// nothing here ever checked against that selection. Same bug affected the "all 3 done" bonus below,
// which counted completions against the full 8-item pool rather than today's actual 3.
export const autoCompleteQuest = async (uid, questId) => {
  if (!uid || !questId) return

  const todaysQuestIds = getDailyQuests(uid).map(q => q.id)
  if (!todaysQuestIds.includes(questId)) return // not one of today's quests — no bonus for it today

  // Use same date key format as DailyQuests.jsx component
  const today = new Date().toDateString().replace(/ /g, '_')
  const ref   = doc(db, 'users', uid, 'quests', today)

  // The "already complete?" check and the completion flag are written in one transaction, so a
  // double-fire can't pay the quest (or the all-quests bonus) twice. DailyQuests.jsx stores
  // completion as flat { [questId]: true } keys, which this keeps.
  const outcome = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.exists() ? snap.data() : {}
    if (data[questId]) return { newlyDone: false }
    const updated = { ...data, [questId]: true }
    // Bonus for completing all of TODAY's quests (not the full pool).
    const allDone = todaysQuestIds.every(id => updated[id])
    const bonus   = allDone && !data.bonusAwarded
    tx.set(ref, { [questId]: true, ...(bonus ? { bonusAwarded: true } : {}), updatedAt: serverTimestamp() }, { merge: true })
    return { newlyDone: true, bonus }
  })
  if (!outcome.newlyDone) return

  await awardXP(uid, QUEST_XP[questId] || 10, 'Daily quest', { eventId: 'quest:' + today + ':' + questId })
  if (outcome.bonus) {
    await awardXP(uid, 50, 'All quests complete!', { eventId: 'quest-bonus:' + today })
    await checkAndAwardBadge(uid, 'quests_complete')
  }
}

/* =========================
   LEADERBOARD
========================= */

// ── netlify/functions/public-data.js client ─────────────────────────────────
// Firestore rules only allow a user to read their OWN users/{uid} document now (see
// firestore.rules) — reading anyone else's profile, for a leaderboard, a public profile page,
// or friend search, goes through this instead. The function uses the Admin SDK server-side and
// returns only a safe field subset (never email, stripe*, pushSubscription, exam dates, etc.).
async function callPublicDataApi(action, params = {}, { requireAuth = true } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(await getAppCheckHeader()) }
  if (requireAuth) {
    const idToken = await auth.currentUser?.getIdToken()
    headers['Authorization'] = 'Bearer ' + (idToken || '')
  }
  const res = await fetch('/api/public-data', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...params }),
  })
  if (!res.ok) throw new Error('public-data request failed: ' + res.status)
  return res.json()
}

export const getLeaderboard = async (friendUids, currentUid, period = 'allTime') => {
  if (!friendUids || friendUids.length === 0) return []
  try {
    const profiles = await callPublicDataApi('leaderboard-friends')
    const field = { allTime: 'xp', week: 'xpThisWeek', month: 'xpThisMonth' }
    const key   = field[period] || 'xp'
    return profiles.filter(Boolean).sort((a, b) => b[key] - a[key])
  } catch { return [] }
}

export const getGlobalLeaderboard = async (maxResults = 100, period = 'allTime') => {
  try {
    return await callPublicDataApi('leaderboard-global', { maxResults, period })
  } catch { return [] }
}

/* =========================
   SESSIONS
   XP: +50 on complete, +bonus for long sessions
========================= */

export const addSession = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'sessions'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getSessions = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'sessions'))
  // The real Firestore document id must win over any stray `id` field stored inside the
  // document — session links (/timer?sessionId=…) and completion are keyed on it.
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _docId: d.id }))
}

// Idempotent: the completed flag flips inside a transaction, and XP is keyed to the session id,
// so completing the same session twice (double-click, retry, timer + calendar) pays out once.
export const completeSession = async (uid, id, notes = '', { actualDurationMinutes } = {}) => {
  const ref = doc(db, 'users', uid, 'sessions', id)
  const outcome = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return { missing: true }
    const d = snap.data()
    if (d.completed) return { alreadyCompleted: true }
    const patch = { completed: true, completedAt: serverTimestamp(), notes: notes || d.notes || '' }
    if (Number.isFinite(actualDurationMinutes)) patch.actualDuration = Math.max(0, Math.round(actualDurationMinutes))
    tx.update(ref, patch)
    return { planned: d.duration || 0 }
  })
  if (outcome.missing || outcome.alreadyCompleted) return { completed: !outcome.missing, alreadyCompleted: !!outcome.alreadyCompleted }

  // Award XP: base 50, +25 if the session lasted 60+ mins (actual time when known)
  const dur = Number.isFinite(actualDurationMinutes) ? actualDurationMinutes : outcome.planned
  const xp  = dur >= 60 ? 75 : 50
  await awardXP(uid, xp, 'Session complete', { eventId: 'session:' + id })
  await autoCompleteQuest(uid, 'log_session')
  await recordActivityStreak(uid)
  await checkAndAwardBadge(uid, 'first_session')
  return { completed: true, alreadyCompleted: false }
}

export const updateSession = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'sessions', id), data)

export const deleteSession = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'sessions', id))

/* =========================
   TASKS
   XP: +20 on complete
========================= */

export const addTask = async (uid, task) => {
  const ref = await addDoc(collection(db, 'users', uid, 'tasks'), task)
  return ref.id
}

export const getTasks = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'tasks'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const completeTask = async (uid, id, done = true) => {
  await updateDoc(doc(db, 'users', uid, 'tasks', id), { completed: done })
  // Keyed to the task id: un-ticking and re-ticking cannot farm XP.
  if (done) await awardXP(uid, 20, 'Task done', { eventId: 'task:' + id })
}

export const updateTask = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'tasks', id), data)

export const deleteTask = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'tasks', id))

/* =========================
   NOTES
   XP: +10 on save
========================= */

export const saveNote = async (uid, note) => {
  const { id, ...data } = note
  if (id) {
    // Editing an existing note. Previously this always went through addDoc below, which
    // ignored the id field entirely (addDoc always creates a new document) — every "edit"
    // was silently creating a duplicate note and awarding another +10 XP for it, leaving the
    // original note orphaned in Firestore. Update in place instead; no XP for editing your
    // own existing note, since that isn't a new piece of revision activity.
    await updateDoc(doc(db, 'users', uid, 'notes', id), data)
    return id
  }
  const ref = await addDoc(collection(db, 'users', uid, 'notes'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  // A trivial/empty note shouldn't earn the same XP as a real one — previously this fired
  // unconditionally on every save with no length check at all.
  if ((data.content || '').trim().length >= 20) {
    await awardXP(uid, 10, 'Note saved')
  }
  await autoCompleteQuest(uid, 'add_note')
  await recordActivityStreak(uid)
  return ref.id
}

export const getNotes = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'notes'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const deleteNote = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'notes', id))

/* =========================
   MISTAKES
   XP: +10 on log, +20 on resolve
========================= */

// Pass { id } (one per open "Log mistake" form) so a double click or a retry re-saves the SAME
// document instead of logging the mistake twice; the logging XP is keyed to that id and pays once.
// Returns { id, xpAwarded }.
export const addMistake = async (uid, data, { id } = {}) => {
  const col = collection(db, 'users', uid, 'mistakes')
  const ref = id ? doc(col, String(id)) : doc(col)
  const existing = id ? await getDoc(ref) : null
  if (!existing?.exists()) {
    await setDoc(ref, { ...data, resolved: false, createdAt: serverTimestamp() })
  }
  // Same principle as the saveNote fix above - no content-length check here meant a one-word
  // "description" earned the same +10 XP as a real, reflective mistake entry.
  let xpAwarded = false
  if ((data.description || '').trim().length >= 10) {
    const res = await awardXP(uid, 10, 'Mistake logged', { eventId: 'mistake-logged:' + ref.id })
    xpAwarded = !!res.awarded
  }
  return { id: ref.id, xpAwarded }
}

export const getMistakes = async (uid, subject = null) => {
  const snap = await getDocs(collection(db, 'users', uid, 'mistakes'))
  const rows = snap.docs.map(d => ({ ...d.data(), id: d.id }))
  return subject ? rows.filter(r => r.subject === subject) : rows
}

// Daily briefing cache — one doc per user, regenerated once per calendar
// day rather than on every Dashboard load, which would mean an AI call
// per page view. getDailyAdvice() itself (utils/ai.js) has no caching of
// its own; this is that layer, at the same users/{uid}/dailyBriefing/latest
// path the badge-check code already reads from.
export const getCachedDailyBriefing = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'dailyBriefing', 'latest'))
    if (!snap.exists()) return null
    const data = snap.data()
    const generatedAt = data.generatedAt?.toDate ? data.generatedAt.toDate() : null
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (!generatedAt || generatedAt < today) return null // yesterday or older — stale
    return data.text || null
  } catch {
    return null
  }
}

export const saveDailyBriefing = async (uid, text) => {
  try {
    await setDoc(doc(db, 'users', uid, 'dailyBriefing', 'latest'), {
      text, generatedAt: serverTimestamp(),
    })
  } catch {
    // Non-fatal — the briefing still displays even if caching fails, it'll just regenerate next load.
  }
}

// Cached AI-generated quiz distractors for a saved flashcard SET, keyed by the set's own doc
// id. Reuses flashcardCache (already writable by any signed-in user, no rules change needed) —
// whoever quizzes on a given public/official set first generates it once; everyone after gets
// the cached version instantly instead of waiting on a fresh AI call. cardCount is stored
// alongside so an edited set (cards added/removed) is correctly treated as stale rather than
// silently returning mismatched distractors.
export const getCachedDistractors = async (setId, cardCount) => {
  try {
    const snap = await getDoc(doc(db, 'flashcardCache', 'distractors_' + setId))
    if (!snap.exists()) return null
    const data = snap.data()
    if (data.cardCount !== cardCount) return null
    return data.distractors || null
  } catch {
    return null
  }
}

export const saveCachedDistractors = async (setId, cardCount, distractors) => {
  try {
    await setDoc(doc(db, 'flashcardCache', 'distractors_' + setId), {
      cardCount, distractors, generatedAt: serverTimestamp(),
    })
  } catch {
    // Non-fatal — the quiz still works, it just regenerates for the next person too.
  }
}

// Idempotent: resolving an already-resolved mistake changes nothing and pays no XP.
export const resolveMistake = async (uid, id) => {
  const ref = doc(db, 'users', uid, 'mistakes', id)
  const changed = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists() || snap.data().resolved) return false
    tx.update(ref, { resolved: true, resolvedAt: serverTimestamp() })
    return true
  })
  if (!changed) return { resolved: true, alreadyResolved: true }
  await awardXP(uid, 20, 'Mistake resolved', { eventId: 'mistake:' + id })
  await autoCompleteQuest(uid, 'resolve_mistake')
  await recordActivityStreak(uid)
  return { resolved: true, alreadyResolved: false }
}

/* =========================
   PAPER ATTEMPTS
   XP: +100 on save
========================= */

// Persists the attempt, then awards XP exactly once per attempt id. Pass data.attemptId to make
// a retry safe: the same id re-saves the same document and the XP event key blocks a second award.
export const savePaperAttempt = async (uid, data) => {
  const { attemptId, ...rest } = data || {}
  const col = collection(db, 'users', uid, 'paperAttempts')
  const ref = attemptId ? doc(col, String(attemptId)) : doc(col)
  const existing = await getDoc(ref)
  await setDoc(ref, {
    ...rest,
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: true })
  // Everything below is idempotent (XP is keyed to the attempt id, quests/badges/streak are
  // once-only), so a retry after a partial failure completes whatever was missed without ever
  // paying twice.
  await awardXP(uid, 100, 'Past paper logged', { eventId: 'paper:' + ref.id })
  await autoCompleteQuest(uid, 'log_paper')
  await recordActivityStreak(uid)
  await checkAndAwardBadge(uid, 'first_paper')
  return ref.id
}

// Optional second argument: a subject name to filter to. Callers already pass one
// (PastPapers, Analytics, Profile); it used to be silently ignored.
export const getPaperAttempts = async (uid, subject = null) => {
  const snap = await getDocs(collection(db, 'users', uid, 'paperAttempts'))
  // The real document id wins over any `id` field stored inside the document.
  const rows = snap.docs.map(d => ({ ...d.data(), id: d.id }))
  return subject ? rows.filter(r => r.subject === subject) : rows
}

export const updatePaperAttempt = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'paperAttempts', id), data)

export const deletePaperAttempt = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'paperAttempts', id))

/* =========================
   QUIZ RESULTS
   Feeds the dashboard's predicted-grade widget alongside paper attempts and topic
   confidence — see utils/gradeInsights.js. Mirrors the paperAttempts pattern above.
========================= */

export const saveQuizResult = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'quizResults'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  await awardXP(uid, 20, 'Quiz completed')
  await recordActivityStreak(uid)
  return ref.id
}

export const getQuizResults = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'quizResults'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/* =========================
   QUALIFICATION SWITCH ARCHIVING
   When a subject's qualification changes (see qualificationSwitch.js + Settings.jsx), the
   Past Papers attempts and quiz results logged under the old qualification need to stop
   counting toward current-qualification views (Predicted Grades, Past Papers subject
   breakdown) — without being deleted, since they still count toward lifetime stats.
========================= */

// A grade string that's exclusive to one qualification's scale. Numeric grades (and Combined
// filterToCurrentQualification (qualification-string-only, with grade-format/nearest-neighbour
// guessing for untagged records) used to live here. Superseded by
// isCurrentSubjectInstance/filterToCurrentSubjectInstance (utils/subjectKey.js), which checks
// board and tier too — not just qualification — so two different boards' data for the same
// subject name (e.g. AQA Physics vs OCR Physics, both GCSE) is no longer treated as
// interchangeable, and never guesses an untagged record's qualification from its grade format
// or from the nearest timestamped record; untagged records are simply left out of current views
// instead, same as any other data too ambiguous to place safely.

// Shared by archiveSupersededAttempts and deleteSubjectAttempts below: finds every
// paperAttempts/quizResults doc ref for this user + subject that belongs to a DIFFERENT subject
// instance (board/qualification/tier) than newInstance, without doing anything to them yet.
// newInstance is {board, qualification, tier, subjectKey} — the instance to KEEP — or null if
// the subject was dropped entirely (everything for this name is then superseded).
//
// A doc's own subjectKey is compared directly where present; one with board+qualification but
// no subjectKey (predates that field) has one derived the same way subjectKey.js would; one
// with only qualification (predates board tracking entirely) falls back to a qualification-only
// comparison, matching this flow's older, less granular behaviour for exactly those older
// records rather than suddenly leaving them unclassified. A doc with NONE of subjectKey, board
// or qualification is left untouched — no grade-format or nearest-neighbour guessing — same
// "don't guess, leave it as a legacy case rather than silently archive/delete it" principle as
// isCurrentSubjectInstance (utils/subjectKey.js) uses for display filtering.
async function findSupersededRefs(uid, subjectName, newInstance) {
  const [papersSnap, quizzesSnap] = await Promise.all([
    getDocs(query(collection(db, 'users', uid, 'paperAttempts'), where('subject', '==', subjectName))),
    getDocs(query(collection(db, 'users', uid, 'quizResults'), where('subject', '==', subjectName))),
  ])

  const allDocs = [
    ...papersSnap.docs.map(d => ({ ref: d.ref, ...d.data() })),
    ...quizzesSnap.docs.map(d => ({ ref: d.ref, ...d.data() })),
  ].filter(d => !d.archived)

  const superseded = []
  for (const d of allDocs) {
    if (!newInstance) { superseded.push(d.ref); continue } // subject dropped — nothing is current

    if (d.subjectKey) {
      if (d.subjectKey !== newInstance.subjectKey) superseded.push(d.ref)
      continue
    }
    if (d.board && d.qualification) {
      const derived = buildSubjectKey({ board: d.board, qualification: d.qualification, subject: subjectName, tier: d.tier })
      if (derived !== newInstance.subjectKey) superseded.push(d.ref)
      continue
    }
    if (d.qualification) {
      if (d.qualification !== newInstance.qualification) superseded.push(d.ref)
      continue
    }
    // No subjectKey, board or qualification at all — leave it, same as before this rewrite.
  }

  return { superseded, checked: allDocs.length }
}

// Hides superseded history without deleting it (archived: true) — still counts toward
// lifetime stats, just excluded from current views. Safe to call more than once —
// already-archived docs are left as-is. Used when a student chooses to keep their
// old-instance history after a switch (see the Settings.jsx switch-choice dialog).
// newInstance: {board, qualification, tier, subjectKey} to keep, or null if the subject was
// dropped entirely (see detectQualificationSwitches in utils/qualificationSwitch.js).
export const archiveSupersededAttempts = async (uid, subjectName, newInstance) => {
  const { superseded, checked } = await findSupersededRefs(uid, subjectName, newInstance)
  const batchSize = 400
  for (let i = 0; i < superseded.length; i += batchSize) {
    const batch = writeBatch(db)
    superseded.slice(i, i + batchSize).forEach(ref => batch.update(ref, { archived: true }))
    await batch.commit()
  }
  return { archived: superseded.length, checked }
}

// Permanently removes superseded history instead of archiving it — used when a student
// chooses NOT to keep their old-instance history after a switch. Irreversible, unlike
// archiving, so this should only ever run after explicit confirmation in the UI.
export const deleteSubjectAttempts = async (uid, subjectName, newInstance) => {
  const { superseded, checked } = await findSupersededRefs(uid, subjectName, newInstance)
  const batchSize = 400
  for (let i = 0; i < superseded.length; i += batchSize) {
    const batch = writeBatch(db)
    superseded.slice(i, i + batchSize).forEach(ref => batch.delete(ref))
    await batch.commit()
  }
  return { deleted: superseded.length, checked }
}

/* =========================
   TOPICS (read)
   Topics.jsx does its own CRUD directly against users/{uid}/topics for editing. This is
   just a read-only helper for pages — currently the dashboard's weak-topics and
   predicted-grade widgets — that only need the confidence data, not the full edit flow.
========================= */

// Only returns topics for the student's CURRENT subject instance — a topic logged before a
// GCSE -> AS-Level/A-Level switch, OR before a board switch (e.g. AQA -> OCR Physics, same
// qualification), is excluded here at the source, so every consumer (the dashboard's
// weak-topics and predicted-grade widgets) is automatically current-subject-safe without
// needing its own filter. profile: the student's full profile (needed for
// isCurrentSubjectInstance's qualification fallback, not just its subjects array).
export const getTopicsWithConfidence = async (uid, profile) => {
  const snap = await getDocs(collection(db, 'users', uid, 'topics'))
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return all.filter(t => isCurrentSubjectInstance({ ...t, subject: t.subjectId }, profile))
}

/* =========================
   PAPER STRUCTURES
========================= */

export const getPaperStructures = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'paperStructures'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const submitPaperStructure = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'paperStructures'), data)
  return ref.id
}

/* =========================
   TOPIC ID MIGRATION
   Old topic docs were keyed `${subject}_${topic}` with no board or qualification, so switching
   board or qualification for a subject could silently collide with (or overwrite) an unrelated
   topic's confidence rating. buildTopicId() (src/utils/topicId.js) is the new, collision-safe
   scheme. This runs automatically, once, the first time a user's topics load after this update —
   silently re-keying anything still in the old format. See src/pages/Topics.jsx for the call site.
========================= */

/**
 * Given topic docs already fetched from Firestore (array of { id, ...data }), finds any still on
 * the legacy id scheme, re-keys them to the new board+qualification-scoped id, and keeps the
 * matching `priorities` doc (same id scheme, see PriorityContext) in sync. Returns the corrected
 * array — callers should render/use this return value, not the array they passed in, since ids
 * may have changed. Safe to call on every load: once nothing is legacy, it's a single read and a
 * no-op loop.
 */
export const migrateLegacyTopicDocs = async (uid, topicDocs, subjects, profileQualification) => {
  if (!uid || !topicDocs?.length) return topicDocs || []
  const corrected = []
  for (const t of topicDocs) {
    if (!isLegacyTopicId(t.id)) { corrected.push(t); continue }
    const subjectMeta = subjects?.find(s => s.name === t.subjectId)
    if (!subjectMeta) { corrected.push(t); continue } // subject no longer selected — leave it, don't guess
    const board = subjectMeta.board || 'AQA'
    const qualification = subjectMeta.qualification || profileQualification || 'GCSE'
    const newId = buildTopicId(board, qualification, t.subjectId, t.name)
    if (newId === t.id) { corrected.push(t); continue }
    try {
      const newRef = doc(db, 'users', uid, 'topics', newId)
      const existing = await getDoc(newRef)
      if (existing.exists()) {
        // A doc already lives at the new id — don't clobber it, just adopt it going forward and
        // quietly retire the legacy one.
        await deleteDoc(doc(db, 'users', uid, 'topics', t.id))
        corrected.push({ id: newId, ...existing.data() })
        continue
      }
      const { id: _oldId, ...data } = t
      await setDoc(newRef, { ...data, board, qualification, updatedAt: serverTimestamp() })
      await deleteDoc(doc(db, 'users', uid, 'topics', t.id))

      // Priority docs are keyed by the same topicId (see PriorityContext.setPriority) — keep them
      // pointed at a topic that still exists.
      const oldPriRef = doc(db, 'users', uid, 'priorities', t.id)
      const oldPriSnap = await getDoc(oldPriRef)
      if (oldPriSnap.exists()) {
        await setDoc(doc(db, 'users', uid, 'priorities', newId), { ...oldPriSnap.data(), topicId: newId })
        await deleteDoc(oldPriRef)
      }
      corrected.push({ ...t, id: newId, board, qualification })
    } catch (err) {
      console.error('Topic ID migration failed for', t.id, err)
      corrected.push(t) // fail safe — keep the old doc visible rather than losing it from view
    }
  }
  return corrected
}

/* =========================
   FRIENDS SYSTEM
========================= */

export const sendFriendRequest = async (fromUid, toUid) => {
  let fromName = ''
  let fromAvatarUrl = ''
  try {
    const snap = await getDoc(doc(db, 'users', fromUid))
    if (snap.exists()) {
      const d = snap.data()
      fromName = d.displayName || d.profile?.displayName || ''
      fromAvatarUrl = d.avatarUrl || d.profile?.avatarUrl || ''
    }
  } catch {}
  await addDoc(collection(db, 'friendRequests'), {
    from:      fromUid,
    fromName,
    fromAvatarUrl,
    to:        toUid,
    createdAt: serverTimestamp(),
  })
}

export const getReceivedRequests = async (uid) => {
  const q    = query(collection(db, 'friendRequests'), where('to', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function callFriendsApi(action, params = {}) {
  let idToken = ''
  try {
    if (auth.currentUser) idToken = await auth.currentUser.getIdToken()
  } catch (e) { console.warn('[friends] could not get ID token:', e.message) }

  const res = await fetch('/api/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken, ...(await getAppCheckHeader()) },
    body: JSON.stringify({ action, ...params }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// Previously did two client-side updateDoc calls — one to the caller's own /users/{uid} doc
// (allowed) and one to the OTHER party's /users/{uid} doc (not allowed under rules that only
// permit request.auth.uid == userId), which is exactly what "Missing or insufficient permissions"
// on accept, and a friend disappearing from only one side on remove, both came from. Moved
// server-side — see netlify/functions/friends.js for the full explanation and the Admin SDK writes
// that now handle both sides of each operation correctly.
export const acceptFriendRequest = async (requestId) => {
  await callFriendsApi('accept', { requestId })
  if (auth.currentUser) await autoCompleteQuest(auth.currentUser.uid, 'add_friend')
}

export const declineFriendRequest = async (requestId) => {
  await callFriendsApi('decline', { requestId })
}

export const removeFriend = async (friendUid) => {
  await callFriendsApi('remove', { friendUid })
}

export const getFriendProfiles = async (friendUids) => {
  if (!friendUids || friendUids.length === 0) return []
  try {
    const profiles = await callPublicDataApi('friend-profiles', { uids: friendUids })
    return profiles.map(p => ({ ...p, level: levelFromXP(p.xp || 0) }))
  } catch { return [] }
}

export const getUserByUsername = async (handle) => {
  if (!handle) return null
  try {
    const p = await callPublicDataApi('profile', { handle }, { requireAuth: false })
    return { ...p, level: levelFromXP(p.xp || 0) }
  } catch { return null }
}

export const searchUsersByName = async (searchTerm) => {
  if (!searchTerm) return []
  try {
    const matches = await callPublicDataApi('search-users', { term: searchTerm })
    return matches.map(u => ({ ...u, level: levelFromXP(u.xp || 0) }))
  } catch { return [] }
}

/* =========================
   BADGE AUDIT
   Retroactively awards any badges the user has earned
   but not yet received. Safe to call multiple times —
   checkAndAwardBadge is idempotent.
========================= */

export async function runBadgeAudit(uid) {
  if (!uid) return { awarded: [] }

  // Fetch everything in parallel
  const [userSnap, sessionsSnap, papersSnap, mistakesSnap, notesSnap, topicsSnap] =
    await Promise.all([
      getDoc(doc(db, 'users', uid)),
      getDocs(collection(db, 'users', uid, 'sessions')),
      getDocs(collection(db, 'users', uid, 'paperAttempts')),
      getDocs(collection(db, 'users', uid, 'mistakes')),
      getDocs(collection(db, 'users', uid, 'notes')),
      getDocs(collection(db, 'users', uid, 'topics')),
    ])

  if (!userSnap.exists()) return { awarded: [] }

  const user      = userSnap.data()
  const sessions  = sessionsSnap.docs.map(d => d.data())
  const papers    = papersSnap.docs.map(d => d.data())
  const mistakes  = mistakesSnap.docs.map(d => d.data())
  const notes     = notesSnap.docs.map(d => d.data())
  const topics    = topicsSnap.docs.map(d => d.data())

  const completedSessions = sessions.filter(s => s.completed)
  const resolvedMistakes  = mistakes.filter(m => m.resolved)
  const streak            = user.streak || 0
  const friendCount       = Array.isArray(user.friends) ? user.friends.length : (user.friends || 0)

  // Build candidates: { badgeId, condition }
  const checks = []

  // ── Milestones ───────────────────────────────────────────────────────────────
  if (completedSessions.length >= 1)  checks.push('first_session')
  if (completedSessions.length >= 10) checks.push('ten_sessions')
  if (papers.length >= 1)             checks.push('first_paper')
  if (papers.length >= 10)            checks.push('ten_papers')
  if (papers.length >= 50)            checks.push('fifty_papers')
  if ((user.profile?.displayName || user.displayName) &&
      (user.subjects || []).length > 0 &&
      (user.examDates || []).length > 0) checks.push('profile_complete')

  // ── Streaks ──────────────────────────────────────────────────────────────────
  if (streak >= 3)   checks.push('streak_3')
  if (streak >= 7)   checks.push('streak_7')
  if (streak >= 14)  checks.push('streak_14')
  if (streak >= 30)  checks.push('streak_30')
  if (streak >= 100) checks.push('streak_100')

  // ── Improvement ──────────────────────────────────────────────────────────────
  // grade_up: improved grade on same subject+paper vs earlier attempt
  const gradeOrder = ['U','G','F','E','D','C','B','A','A*','9','8','7','6','5','4','3','2','1']
  // Sort lowest grade first
  const gradeIndex = g => {
    const idx = gradeOrder.indexOf(String(g))
    return idx === -1 ? -1 : idx
  }
  const bySubjectPaper = {}
  papers.forEach(p => {
    const key = `${p.subject}|${p.paper}`
    if (!bySubjectPaper[key]) bySubjectPaper[key] = []
    bySubjectPaper[key].push(p)
  })
  let gradeUp = false
  Object.values(bySubjectPaper).forEach(attempts => {
    if (attempts.length < 2) return
    const sorted = [...attempts].sort((a, b) => {
      const da = a.attemptDate ? new Date(a.attemptDate) : new Date((a.createdAt?.seconds || 0) * 1000)
      const db2 = b.attemptDate ? new Date(b.attemptDate) : new Date((b.createdAt?.seconds || 0) * 1000)
      return da - db2
    })
    for (let i = 1; i < sorted.length; i++) {
      if (gradeIndex(sorted[i].grade) > gradeIndex(sorted[i - 1].grade)) { gradeUp = true; break }
    }
  })
  if (gradeUp) checks.push('grade_up')

  // full_marks: 90%+
  if (papers.some(p => (p.percentage || 0) >= 90)) checks.push('full_marks')

  // comeback: topic went from confidence 1 → 4 or 5 (can't fully detect without history,
  // so check if any topic is now 4+ after having any old low-confidence record — approximate)
  // We check if user has any topic at 4+ and also has any resolved mistake (shows improvement)
  const highTopics = topics.filter(t => (t.confidence || 0) >= 4)
  if (highTopics.length > 0 && resolvedMistakes.length > 0) checks.push('comeback')

  // ── Subject Mastery ───────────────────────────────────────────────────────────
  // Group topics by subject
  const topicsBySubject = {}
  topics.forEach(t => {
    const subj = t.subjectId || t.subject || 'unknown'
    if (!topicsBySubject[subj]) topicsBySubject[subj] = []
    topicsBySubject[subj].push(t)
  })
  let maxHighConfidence = 0
  let anySubjectAllHigh = false
  Object.values(topicsBySubject).forEach(subTopics => {
    const high = subTopics.filter(t => (t.confidence || 0) >= 4).length
    if (high > maxHighConfidence) maxHighConfidence = high
    if (high === subTopics.length && subTopics.length > 0) anySubjectAllHigh = true
  })
  if (maxHighConfidence >= 10)    checks.push('mastery_bronze')
  if (maxHighConfidence >= 20)    checks.push('mastery_silver')
  if (anySubjectAllHigh)          checks.push('mastery_gold')

  // ── Consistency ───────────────────────────────────────────────────────────────
  // early_bird: any session started before 08:00
  const earlyBird = completedSessions.some(s => {
    const time = s.start || s.startTime || ''
    if (typeof time === 'string' && time.includes('T')) {
      const h = parseInt(time.split('T')[1]?.split(':')[0] || '12')
      return h < 8
    }
    if (typeof time === 'string' && time.includes(':')) {
      return parseInt(time.split(':')[0]) < 8
    }
    return false
  })
  if (earlyBird) checks.push('early_bird')

  // night_owl: any session started after 22:00
  const nightOwl = completedSessions.some(s => {
    const time = s.start || s.startTime || ''
    if (typeof time === 'string' && time.includes('T')) {
      const h = parseInt(time.split('T')[1]?.split(':')[0] || '0')
      return h >= 22
    }
    if (typeof time === 'string' && time.includes(':')) {
      return parseInt(time.split(':')[0]) >= 22
    }
    return false
  })
  if (nightOwl) checks.push('night_owl')

  // weekend_warrior: sessions on both Saturday and Sunday in the same week
  const weekendDays = new Set()
  completedSessions.forEach(s => {
    const d = s.date || s.startTime?.split?.('T')?.[0]
    if (!d) return
    const day = new Date(d).getDay()
    if (day === 0 || day === 6) {
      // Use ISO week + year as key, day as distinguisher
      const dt  = new Date(d)
      const wk  = `${dt.getFullYear()}-W${Math.ceil(dt.getDate() / 7)}`
      weekendDays.add(`${wk}-${day}`)
    }
  })
  // Check if both Sat (6) and Sun (0) appear in the same week
  const weekKeys = {}
  weekendDays.forEach(k => {
    const [week, day] = k.split(/-(?=\d$)/)
    if (!weekKeys[week]) weekKeys[week] = new Set()
    weekKeys[week].add(day)
  })
  const weekendWarrior = Object.values(weekKeys).some(days => days.has('6') && days.has('0'))
  if (weekendWarrior) checks.push('weekend_warrior')

  // marathon_session: any timer session >= 120 minutes
  if (completedSessions.some(s => (s.duration || 0) >= 120)) checks.push('marathon_session')

  // ── Social ────────────────────────────────────────────────────────────────────
  if (friendCount >= 1) checks.push('first_friend')
  if (friendCount >= 3) checks.push('three_friends')

  // ── Notes ─────────────────────────────────────────────────────────────────────
  // (no specific badge, but add_note quest handled elsewhere)

  // ── first_ai: check if user has any AI briefing cached (proxy for having used AI) ──
  try {
    const aiSnap = await getDoc(doc(db, 'users', uid, 'dailyBriefing', 'latest'))
    if (aiSnap.exists()) checks.push('first_ai')
  } catch {}

  // ── emergency_mode: check if user has ever opened emergency mode ──
  // We can't retroactively detect this, so skip in audit (real-time trigger handles it)

  // ── top_three: can't check without querying global board — skip in audit ──
  // (real-time trigger in Leaderboard.jsx handles this)

  // ── ten_sessions ──────────────────────────────────────────────────────────────
  if (completedSessions.length >= 10) checks.push('ten_sessions')

  // ── ten_papers / fifty_papers ─────────────────────────────────────────────────
  if (papers.length >= 10) checks.push('ten_papers')
  if (papers.length >= 50) checks.push('fifty_papers')

  // ── Award any missing badges ──────────────────────────────────────────────────
  const alreadyEarned = new Set(user.badges || [])
  const toAward       = checks.filter(id => !alreadyEarned.has(id))
  const awarded       = []

  for (const badgeId of toAward) {
    await checkAndAwardBadge(uid, badgeId)
    awarded.push(badgeId)
  }

  // Stamp last audit time so we don't run constantly
  await updateDoc(doc(db, 'users', uid), {
    lastBadgeAudit: serverTimestamp(),
  })

  return { awarded }
}

/* =========================
   FLASHCARD SETS
   Stored at: users/{uid}/flashcardSets/{id}
   Public sets also stored at: publicFlashcards/{id}
========================= */

export const saveFlashcardSet = async (uid, { title, subject, topic, cards, isPublic = false, author, authorType, board, level }) => {  // Resolve display name for author
  let resolvedAuthor = author
  if (!resolvedAuthor && uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists()) resolvedAuthor = snap.data().displayName || 'Anonymous'
    } catch(e) {}
  }
  const data = {
    uid: uid || 'official',
    title, subject, topic: topic || '',
    cards, isPublic,
    cardCount: cards.length,
    author: resolvedAuthor || author || 'RevisionFlow',
    authorType: authorType || 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  // Only regular (non-official) saves need this — official sets already always pass both via
  // saveOfficialFlashcardSet. Storing this at save time (rather than only ever guessing it later
  // from whoever happens to be viewing the set) is what makes the public browser's level filter
  // work for sets other than the viewer's own — see deriveSetBoardLevel in Study.jsx.
  if (board) data.board = board
  if (level) data.level = level
  let refId
  const isOfficial = authorType === 'official'
  if (uid && !isOfficial) {
    // Save to user's private collection (skip for official/admin bulk sets)
    const ref = await addDoc(collection(db, 'users', uid, 'flashcardSets'), data)
    refId = ref.id
  }
  if (isOfficial) {
    // Official sets must go through the admin review queue, never a direct client write.
    refId = await saveOfficialFlashcardSet(board, level, subject, topic, cards)
  } else if (isPublic) {
    // Community set: published by its owner (uid is stamped on `data`).
    if (refId) {
      await setDoc(doc(db, 'publicFlashcards', refId), { ...data, setId: refId })
    } else {
      // Official sets with no user subcollection entry
      const ref = await addDoc(collection(db, 'publicFlashcards'), { ...data, setId: null })
      await updateDoc(ref, { setId: ref.id })
      refId = ref.id
    }
  }
  if (uid) {
    await recordActivityStreak(uid)
    await autoCompleteQuest(uid, 'use_ai')
  }
  return refId
}

// ── Official flashcard sets (deterministic ID) ──────────────────────────────
// Used by the admin auto-generate pipeline instead of saveFlashcardSet's addDoc (random ID)
// path, specifically so "does an official set already exist for this board+level+subject+topic"
// is a cheap, always-indexed single-document get — not a multi-field query that risks needing a
// composite index. Kept separate from saveFlashcardSet so regular user-created sets (which can
// legitimately share a title) are untouched.
export const getOfficialFlashcardSet = async (board, level, subject, topic) => {
  const id = officialSetId(board, level, subject, topic)
  const snap = await getDoc(doc(db, 'publicFlashcards', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const saveOfficialFlashcardSet = async (board, level, subject, topic, cards) => {
  // Official content is never written from the client. This submits a DRAFT to the admin
  // review queue (/api/admin); it only becomes an official set after an admin approves it.
  // Sets produced by the AI generator are flagged so reviewers know they need checking.
  const id = officialSetId(board, level, subject, topic)
  await submitContentForReview('officialFlashcard', id, {
    setId: id,
    title: `${board} ${level} ${subject}${topic ? ' — ' + topic : ''}`,
    subject, topic: topic || '', board, level,
    cards, cardCount: cards.length,
    author: 'RevisionFlow',
    origin: 'ai-generated-draft',
  })
  return id
}

function officialSetId(board, level, subject, topic) {
  const raw = `official_${board}_${level}_${subject}_${topic || 'general'}`
  return raw.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 180)
}

const OFFICIAL_TITLE_BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Eduqas', 'CCEA']
const OFFICIAL_TITLE_LEVELS = ['GCSE', 'AS-Level', 'A-Level']

// Old runBulkFlashcards (pre-fix) saved official sets as `{board} {level} {subject} — {topic}`
// with no separate board/level fields — only ai.js/Admin.jsx's newer code stamps those. This
// parses that predictable, code-generated (not user-typed) format back out.
function parseOfficialTitle(title) {
  if (!title) return null
  for (const board of OFFICIAL_TITLE_BOARDS) {
    if (!title.startsWith(board + ' ')) continue
    const rest = title.slice(board.length + 1)
    for (const level of OFFICIAL_TITLE_LEVELS) {
      if (!rest.startsWith(level + ' ')) continue
      const afterLevel = rest.slice(level.length + 1)
      const [subject, topic] = afterLevel.split(' — ')
      if (!subject) continue
      return { board, level, subject: subject.trim(), topic: (topic || '').trim() }
    }
  }
  return null
}

// Old official flashcard sets keep their board and level only in the title. The browser can never write
// official content (the Firestore rules reject it), so this asks the admin function to stamp the
// fields on the server. Idempotent; reports how many sets were fixed. Admin screens call it before a
// bulk run; if the call fails (not an admin, offline) it reports zero and the run carries on.
export const migrateLegacyOfficialFlashcardSets = async () => {
  try {
    const { migrateOfficialSets } = await import('./adminApi')
    const { summary } = await migrateOfficialSets()
    return { migrated: summary.stamped, skipped: summary.alreadyFine, unparseable: summary.unreadable }
  } catch {
    return { migrated: 0, skipped: 0, unparseable: 0 }
  }
}

export const updateFlashcardSet = async (uid, setId, { title, subject, topic, cards, isPublic }) => {
  const ref  = doc(db, 'users', uid, 'flashcardSets', setId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const prev = snap.data()
  const updates = {
    title, subject, topic: topic || '',
    cards, isPublic,
    cardCount: cards.length,
    updatedAt: serverTimestamp(),
    // preserve existing author — don't overwrite official sets
    ...(prev.authorType !== 'official' && { author: prev.author }),
  }
  await updateDoc(ref, updates)
  // Sync public collection
  if (isPublic) {
    await setDoc(doc(db, 'publicFlashcards', setId), { ...prev, ...updates, uid, setId })
  } else if (prev.isPublic && !isPublic) {
    try { await deleteDoc(doc(db, 'publicFlashcards', setId)) } catch {}
  }
  await recordActivityStreak(uid)
}

export const getFlashcardSets = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'flashcardSets'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const deleteFlashcardSet = async (uid, setId, isPublic = false) => {
  await deleteDoc(doc(db, 'users', uid, 'flashcardSets', setId))
  if (isPublic) {
    try { await deleteDoc(doc(db, 'publicFlashcards', setId)) } catch {}
  }
}

// Public sets (official and community) for browsing. `subject` narrows the query; `limitN` is how
// many to fetch (the browser asks for more with "Load more"). Always newest first, whichever query
// ran. Whether a set is official, community or unverified is decided by utils/provenance.js.
export const getPublicFlashcardSets = async (subject = null, limitN = 50) => {
  const col = collection(db, 'publicFlashcards')
  const ts = (d) => d.createdAt?.seconds || d.updatedAt?.seconds || 0
  const rows = new Map()
  const add = (snap) => snap.docs.forEach(d => rows.set(d.id, { ...d.data(), id: d.id }))
  if (subject) {
    // No orderBy here: ordering by createdAt would silently drop any set stored without that field.
    add(await getDocs(query(col, where('subject', '==', subject), limit(limitN))))
  } else {
    // "All subjects": the newest sets, plus the admin-reviewed official sets queried on their own,
    // because orderBy('createdAt') excludes any set that has no createdAt (admin-generated sets).
    const [recent, official] = await Promise.all([
      getDocs(query(col, orderBy('createdAt', 'desc'), limit(limitN))),
      getDocs(query(col, where('authorType', '==', 'official'), limit(limitN))).catch(() => null),
    ])
    add(recent)
    if (official) add(official)
  }
  return [...rows.values()].sort((a, b) => ts(b) - ts(a))
}

export const updateFlashcardSetVisibility = async (uid, setId, isPublic) => {
  const ref  = doc(db, 'users', uid, 'flashcardSets', setId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  await updateDoc(ref, { isPublic, updatedAt: serverTimestamp() })
  if (isPublic) {
    await setDoc(doc(db, 'publicFlashcards', setId), { ...snap.data(), isPublic: true, setId })
  } else {
    try { await deleteDoc(doc(db, 'publicFlashcards', setId)) } catch {}
  }
}

/* ── Topic note rate limiting ────────────────────────────────────────────── */
// Free users: 5 topic note generations per day
// Pro/beta users: unlimited
// Usage tracked in users/{uid}/usage/topicNotes doc

export async function checkTopicNoteLimit(uid, profile) {
  if (profile?.isPro || profile?.betaUser) return { allowed: true, remaining: Infinity }

  const today = todayLocalStr()  // local YYYY-MM-DD
  const ref   = doc(db, 'users', uid, 'usage', 'topicNotes')
  try {
    const snap = await getDoc(ref)
    if (!snap.exists() || snap.data().date !== today) {
      // New day — reset counter
      await setDoc(ref, { date: today, count: 0 })
      return { allowed: true, remaining: 5 }
    }
    const count = snap.data().count || 0
    const remaining = Math.max(0, 5 - count)
    return { allowed: remaining > 0, remaining, count }
  } catch(e) {
    return { allowed: true, remaining: 5 }  // fail open
  }
}

export async function incrementTopicNoteUsage(uid) {
  const today = todayLocalStr()
  const ref   = doc(db, 'users', uid, 'usage', 'topicNotes')
  try {
    const snap = await getDoc(ref)
    if (!snap.exists() || snap.data().date !== today) {
      await setDoc(ref, { date: today, count: 1 })
    } else {
      await updateDoc(ref, { count: increment(snap.data().count + 1) })
    }
  } catch(e) {}
}
