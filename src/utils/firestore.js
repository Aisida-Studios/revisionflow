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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

/* =========================
   AUTH
========================= */

const googleProvider = new GoogleAuthProvider()

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider)
export const loginWithEmail = (e, p) => signInWithEmailAndPassword(auth, e, p)
export const signupWithEmail = (e, p) => createUserWithEmailAndPassword(auth, e, p)
export const resetPassword = (e) => sendPasswordResetEmail(auth, e)
export const logout = () => signOut(auth)

/* =========================
   USER / PROFILE
========================= */

export async function ensureUser(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      createdAt: serverTimestamp(),
      xp: 0,
      streak: 0,
      lastLogin: null,
      badges: [],
      profile: {},
      friends: []
    })
  }
}

export const updateUserProfile = (uid, updates) =>
  updateDoc(doc(db, 'users', uid), updates)

/* =========================
   STREAK
========================= */

export async function updateStreakOnLogin(uid) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data()
  const now = new Date()
  const today = now.toDateString()
  const lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : null
  const lastLoginStr = lastLogin ? lastLogin.toDateString() : null

  // Already logged in today — don't update streak
  if (lastLoginStr === today) return

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const currentStreak = data.streak || 0
  const newStreak = lastLoginStr === yesterdayStr ? currentStreak + 1 : 1

  await updateDoc(ref, {
    streak: newStreak,
    lastLogin: serverTimestamp()
  })
}

/* =========================
   XP / LEVELS / BADGES
========================= */

// Infinite level formula — matches LEVELS array formula in subjects.js
export function xpForLevel(n) {
  return Math.floor(100 * Math.pow(1.15, n - 1))
}

export function levelFromXP(totalXP) {
  let level = 1
  let cumulative = 0
  while (true) {
    const needed = xpForLevel(level)
    if (cumulative + needed > totalXP) break
    cumulative += needed
    level++
  }
  return level
}

export const awardXP = async (uid, amount) => {
  if (!uid || !amount) return
  await updateDoc(doc(db, 'users', uid), { xp: increment(amount) })
}

export const awardTimerXP = async (uid, seconds) => {
  // 1 XP per minute, max 100 XP per session
  const xp = Math.min(Math.floor(seconds / 60), 100)
  if (xp > 0) await awardXP(uid, xp)
}

export const checkAndAwardBadge = async (uid, badgeId) => {
  if (!uid || !badgeId) return
  const badge = BADGE_MAP[badgeId]
  if (!badge) return

  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data()
  const earned = data.badges || []
  if (earned.includes(badgeId)) return // already has it

  await updateDoc(ref, {
    badges: [...earned, badgeId],
    xp: increment(badge.xp || 0)
  })
}

/* =========================
   DAILY QUESTS
========================= */

export const autoCompleteQuest = async (uid, questId) => {
  if (!uid || !questId) return

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const ref = doc(db, 'users', uid, 'quests', today)
  const snap = await getDoc(ref)

  const data = snap.exists() ? snap.data() : { completed: [] }
  const completed = data.completed || []

  if (completed.includes(questId)) return // already done

  const newCompleted = [...completed, questId]

  // XP per quest
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
  const xp = QUEST_XP[questId] || 10

  await setDoc(ref, { completed: newCompleted }, { merge: true })
  await awardXP(uid, xp)

  // Bonus 50 XP for completing all 3 quests
  if (newCompleted.length >= 3) {
    const bonusRef = doc(db, 'users', uid, 'quests', today)
    const bonusSnap = await getDoc(bonusRef)
    const bonusData = bonusSnap.exists() ? bonusSnap.data() : {}
    if (!bonusData.bonusAwarded) {
      await setDoc(bonusRef, { bonusAwarded: true }, { merge: true })
      await awardXP(uid, 50)
      await checkAndAwardBadge(uid, 'quests_complete')
    }
  }
}

/* =========================
   LEADERBOARD
========================= */

export const getLeaderboard = async (friendUids, currentUid) => {
  if (!friendUids || friendUids.length === 0) return []

  const uids = [...new Set([...friendUids, currentUid].filter(Boolean))]
  const profiles = await Promise.all(
    uids.map(async uid => {
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        if (!snap.exists()) return null
        const d = snap.data()
        return {
          uid,
          displayName: d.profile?.displayName || d.profile?.name || 'Anonymous',
          xp: d.xp || 0,
          streak: d.streak || 0,
          profileIcon: d.profileIcon || null,
          hideNameFromLeaderboard: d.profile?.hideNameFromLeaderboard || false,
          isCurrentUser: uid === currentUid,
        }
      } catch {
        return null
      }
    })
  )

  return profiles
    .filter(Boolean)
    .sort((a, b) => b.xp - a.xp)
}

export const getGlobalLeaderboard = async (maxResults = 100) => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(maxResults)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data()
      return {
        uid: d.id,
        displayName: data.profile?.displayName || data.profile?.name || 'Anonymous',
        xp: data.xp || 0,
        streak: data.streak || 0,
        profileIcon: data.profileIcon || null,
        hideNameFromLeaderboard: data.profile?.hideNameFromLeaderboard || false,
      }
    })
  } catch {
    return []
  }
}

/* =========================
   SESSIONS
========================= */

export const addSession = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'sessions'), {
    ...data,
    createdAt: serverTimestamp()
  })
  return ref.id
}

export const getSessions = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'sessions'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const completeSession = (uid, id) =>
  updateDoc(doc(db, 'users', uid, 'sessions', id), { completed: true })

export const updateSession = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'sessions', id), data)

export const deleteSession = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'sessions', id))

/* =========================
   TASKS
========================= */

export const addTask = async (uid, task) => {
  const ref = await addDoc(collection(db, 'users', uid, 'tasks'), task)
  return ref.id
}

export const getTasks = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'tasks'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const completeTask = (uid, id) =>
  updateDoc(doc(db, 'users', uid, 'tasks', id), { completed: true })

export const updateTask = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'tasks', id), data)

export const deleteTask = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'tasks', id))

/* =========================
   NOTES
========================= */

export const saveNote = async (uid, note) => {
  const ref = await addDoc(collection(db, 'users', uid, 'notes'), note)
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
========================= */

export const addMistake = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'mistakes'), data)
  return ref.id
}

export const getMistakes = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'mistakes'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const resolveMistake = (uid, id) =>
  updateDoc(doc(db, 'users', uid, 'mistakes', id), { resolved: true })

/* =========================
   PAPER ATTEMPTS
========================= */

export const savePaperAttempt = async (uid, data) => {
  const ref = await addDoc(collection(db, 'users', uid, 'paperAttempts'), data)
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
    from: fromUid,
    to: toUid,
    createdAt: serverTimestamp()
  })
}

export const getReceivedRequests = async (uid) => {
  const q = query(collection(db, 'friendRequests'), where('to', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const acceptFriendRequest = async (requestId, fromUid, toUid) => {
  await updateDoc(doc(db, 'users', fromUid), { friends: increment(1) })
  await updateDoc(doc(db, 'users', toUid), { friends: increment(1) })
  await deleteDoc(doc(db, 'friendRequests', requestId))
}

export const declineFriendRequest = (requestId) =>
  deleteDoc(doc(db, 'friendRequests', requestId))

export const removeFriend = async () => {
  // placeholder
}

export const getFriendProfiles = async () => {
  return []
}

export const getUserByUsername = async () => {
  return null
}

export const searchUsersByName = async () => {
  return []
}
