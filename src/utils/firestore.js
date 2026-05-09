// src/utils/firestore.js

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth'
import {
  getFirestore,
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
  limit
} from 'firebase/firestore'
import { BADGE_MAP } from '../data/badges'

/* =========================
   INIT
========================= */

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

/* =========================
   AUTH
========================= */

const googleProvider = new GoogleAuthProvider()

export const loginWithGoogle  = ()       => signInWithPopup(auth, googleProvider)
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

// Call whenever user logs real revision activity (session, paper, task, note, mistake).
export async function recordActivityStreak(uid) {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data            = snap.data()
  const now             = new Date()
  const todayStr        = now.toDateString()
  const lastActivityStr = data.lastActivityDate || null

  if (lastActivityStr === todayStr) return // already counted today

  const yesterday    = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const currentStreak = data.streak || 0
  const newStreak     = lastActivityStr === yesterdayStr ? currentStreak + 1 : 1

  await updateDoc(ref, { streak: newStreak, lastActivityDate: todayStr })
  await awardXP(uid, 10, 'Daily streak')
  if (newStreak === 3)   await checkAndAwardBadge(uid, 'streak_3')
  if (newStreak === 7)   await checkAndAwardBadge(uid, 'streak_7')
  if (newStreak === 14)  await checkAndAwardBadge(uid, 'streak_14')
  if (newStreak === 30)  await checkAndAwardBadge(uid, 'streak_30')
  if (newStreak === 100) await checkAndAwardBadge(uid, 'streak_100')
}


export function xpForLevel(n) {
  return Math.floor(100 * Math.pow(1.15, n - 1))
}

export function levelFromXP(totalXP) {
  let level = 1, cumulative = 0
  while (true) {
    const needed = xpForLevel(level)
    if (cumulative + needed > totalXP) break
    cumulative += needed
    level++
  }
  return level
}

export const awardXP = async (uid, amount, reason = '') => {
  if (!uid || !amount || amount <= 0) return
  await updateDoc(doc(db, 'users', uid), { xp: increment(amount) })
  // Fire browser event so XPToast component can show the popup
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xp-awarded', { detail: { amount, reason } }))
  }
}

export const awardTimerXP = async (uid, seconds) => {
  const xp = Math.min(Math.floor(seconds / 60), 100)
  if (xp > 0) await awardXP(uid, xp, 'Timer session')
}

export const checkAndAwardBadge = async (uid, badgeId) => {
  if (!uid || !badgeId) return
  const badge = BADGE_MAP[badgeId]
  if (!badge) return

  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const earned = snap.data().badges || []
  if (earned.includes(badgeId)) return

  await updateDoc(ref, {
    badges: [...earned, badgeId],
    xp:     increment(badge.xp || 0),
  })
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
  check_topics:    10,
}

export const autoCompleteQuest = async (uid, questId) => {
  if (!uid || !questId) return

  // Use same date key format as DailyQuests.jsx component
  const today = new Date().toDateString().replace(/ /g, '_')
  const ref   = doc(db, 'users', uid, 'quests', today)
  const snap  = await getDoc(ref)
  const data  = snap.exists() ? snap.data() : {}

  // DailyQuests.jsx stores completion as { [questId]: true } flat keys
  if (data[questId]) return // already marked complete

  const xp = QUEST_XP[questId] || 10
  await setDoc(ref, { [questId]: true, updatedAt: serverTimestamp() }, { merge: true })
  await awardXP(uid, xp, 'Daily quest')

  // Count how many quests are now done to check for all-3 bonus
  const updatedData = { ...data, [questId]: true }
  const doneCount   = Object.keys(QUEST_XP).filter(id => updatedData[id]).length
  if (doneCount >= 3 && !data.bonusAwarded) {
    await setDoc(ref, { bonusAwarded: true }, { merge: true })
    await awardXP(uid, 50, 'All quests complete!')
    await checkAndAwardBadge(uid, 'quests_complete')
  }
}

/* =========================
   LEADERBOARD
========================= */

export const getLeaderboard = async (friendUids, currentUid) => {
  if (!friendUids || friendUids.length === 0) return []

  const uids     = [...new Set([...friendUids, currentUid].filter(Boolean))]
  const profiles = await Promise.all(
    uids.map(async uid => {
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        if (!snap.exists()) return null
        const d = snap.data()
        return {
          uid,
          displayName:             d.displayName || d.profile?.displayName || d.profile?.name || 'Anonymous',
          xp:                      d.xp || 0,
          streak:                  d.streak || 0,
          profileIcon:             d.profileIcon || null,
          hideNameFromLeaderboard: d.hideNameFromLeaderboard || d.profile?.hideNameFromLeaderboard || false,
          isCurrentUser:           uid === currentUid,
        }
      } catch { return null }
    })
  )

  return profiles.filter(Boolean).sort((a, b) => b.xp - a.xp)
}

export const getGlobalLeaderboard = async (maxResults = 100) => {
  try {
    const q    = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(maxResults))
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data()
      return {
        uid:                     d.id,
        displayName:             data.displayName || data.profile?.displayName || data.profile?.name || 'Anonymous',
        xp:                      data.xp || 0,
        streak:                  data.streak || 0,
        profileIcon:             data.profileIcon || null,
        hideNameFromLeaderboard: data.hideNameFromLeaderboard || data.profile?.hideNameFromLeaderboard || false,
      }
    })
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const completeSession = async (uid, id, notes = '') => {
  // Mark the session complete
  await updateDoc(doc(db, 'users', uid, 'sessions', id), {
    completed: true,
    notes:     notes || '',
  })
  // Award XP: base 50, +25 if session is 60+ mins
  const snap = await getDoc(doc(db, 'users', uid, 'sessions', id))
  const dur  = snap.exists() ? (snap.data().duration || 0) : 0
  const xp   = dur >= 60 ? 75 : 50
  await awardXP(uid, xp, 'Session complete')
  await autoCompleteQuest(uid, 'log_session')
  await recordActivityStreak(uid)
  await checkAndAwardBadge(uid, 'first_session')
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
  if (done) await awardXP(uid, 20, 'Task done')
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
  const ref = await addDoc(collection(db, 'users', uid, 'notes'), {
    ...note,
    createdAt: serverTimestamp(),
  })
  await awardXP(uid, 10, 'Note saved')
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

export const addMistake = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'mistakes'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  await awardXP(uid, 10, 'Mistake logged')
  return ref.id
}

export const getMistakes = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'mistakes'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const resolveMistake = async (uid, id) => {
  await updateDoc(doc(db, 'users', uid, 'mistakes', id), { resolved: true })
  await awardXP(uid, 20, 'Mistake resolved')
  await autoCompleteQuest(uid, 'resolve_mistake')
  await recordActivityStreak(uid)
}

/* =========================
   PAPER ATTEMPTS
   XP: +100 on save
========================= */

export const savePaperAttempt = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'paperAttempts'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  await awardXP(uid, 100, 'Past paper logged')
  await autoCompleteQuest(uid, 'log_paper')
  await recordActivityStreak(uid)
  await checkAndAwardBadge(uid, 'first_paper')
  return ref.id
}

export const getPaperAttempts = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'paperAttempts'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updatePaperAttempt = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'paperAttempts', id), data)

export const deletePaperAttempt = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'paperAttempts', id))

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
   FRIENDS SYSTEM
========================= */

export const sendFriendRequest = async (fromUid, toUid) => {
  await addDoc(collection(db, 'friendRequests'), {
    from:      fromUid,
    to:        toUid,
    createdAt: serverTimestamp(),
  })
}

export const getReceivedRequests = async (uid) => {
  const q    = query(collection(db, 'friendRequests'), where('to', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const acceptFriendRequest = async (requestId, fromUid, toUid) => {
  await updateDoc(doc(db, 'users', fromUid), { friends: increment(1) })
  await updateDoc(doc(db, 'users', toUid),   { friends: increment(1) })
  await deleteDoc(doc(db, 'friendRequests', requestId))
  // Award XP to both
  await awardXP(fromUid, 25, 'New friend')
  await awardXP(toUid,   25, 'New friend')
}

export const declineFriendRequest = (requestId) =>
  deleteDoc(doc(db, 'friendRequests', requestId))

export const removeFriend    = async () => {}
export const getFriendProfiles  = async () => []
export const getUserByUsername  = async () => null
export const searchUsersByName  = async () => []

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

export const saveFlashcardSet = async (uid, { title, subject, topic, cards, isPublic = false }) => {
  const data = {
    uid, title, subject, topic: topic || '',
    cards, isPublic,
    cardCount: cards.length,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  // Save to user's private collection
  const ref = await addDoc(collection(db, 'users', uid, 'flashcardSets'), data)
  // If public, also save to global collection so others can find it
  if (isPublic) {
    await setDoc(doc(db, 'publicFlashcards', ref.id), { ...data, setId: ref.id })
  }
  return ref.id
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

export const getPublicFlashcardSets = async (subject = null, limitN = 50) => {
  let q = subject
    ? query(collection(db, 'publicFlashcards'), where('subject', '==', subject), limit(limitN))
    : query(collection(db, 'publicFlashcards'), orderBy('createdAt', 'desc'), limit(limitN))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
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
