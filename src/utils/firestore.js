// src/utils/firestore.js

import {
  GoogleAuthProvider,
  signInWithPopup,
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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { BADGE_MAP } from '../data/badges'
import { buildTopicId, isLegacyTopicId } from './topicId'

export { auth, db }

/* =========================
   AUTH
========================= */

const googleProvider = new GoogleAuthProvider()

export const loginWithGoogle  = ()       => signInWithPopup(auth, googleProvider)
export const loginWithEmail   = (e, p)   => signInWithEmailAndPassword(auth, e, p)
export const signupWithEmail  = (e, p)   => createUserWithEmailAndPassword(auth, e, p)
export const resetPassword    = (e)      => sendPasswordResetEmail(auth, e)
export const logout           = ()       => signOut(auth)
export const logoutUser       = ()       => signOut(auth)

/* =========================
   USER / PROFILE
========================= */

export async function ensureUser(uid, initialData = {}) {
  // Support both object user syntax ensureUser(user) and ensureUser(uid, initialData)
  const userId = typeof uid === 'object' && uid !== null ? uid.uid : uid
  if (!userId) return

  const ref          = doc(db, 'users', userId)
  const snap         = await getDoc(ref)
  const referralCode = userId.slice(0, 8).toUpperCase()

  const defaultDisplayName = typeof uid === 'object' ? (uid.displayName || '') : (initialData.displayName || '')
  const defaultEmail = typeof uid === 'object' ? (uid.email || '') : (initialData.email || '')

  if (!snap.exists()) {
    await setDoc(ref, {
      createdAt:    serverTimestamp(),
      xp:           0,
      streak:       0,
      lastLogin:    null,
      badges:       [],
      friends:      [],
      referralCode,
      displayName:  defaultDisplayName,
      profile: {
        displayName: defaultDisplayName,
        email:       defaultEmail,
        avatarUrl:   initialData.avatarUrl || '',
      },
    })
  } else {
    // Patch any fields missing from old accounts
    const existing = snap.data()
    const patches  = {}
    if (!existing.referralCode) patches.referralCode = referralCode
    if (!existing.displayName && defaultDisplayName) patches.displayName = defaultDisplayName
    if (!existing.profile?.displayName && defaultDisplayName) patches['profile.displayName'] = defaultDisplayName
    if (Object.keys(patches).length > 0) await updateDoc(ref, patches)
  }
}

export async function getUserProfile(userId) {
  if (!userId) return null
  try {
    const userDocRef = doc(db, 'users', userId)
    const docSnap = await getDoc(userDocRef)
    return docSnap.exists() ? docSnap.data() : null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Write top-level fields directly (not nested under profile:{})
export const updateUserProfile = (uid, updates) =>
  updateDoc(doc(db, 'users', uid), updates)

// Unlock a specific profile icon (stored as unlockedIcons array)
export const unlockReferralIcon = async (uid, iconId = 'rocket') => {
  if (!uid) return
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const current = snap.data().unlockedIcons || []
  const iconToAdd = iconId || 'rocket'
  if (!current.includes(iconToAdd)) {
    await updateDoc(ref, { unlockedIcons: arrayUnion(iconToAdd) })
  }
}

/* =========================
   STREAK
========================= */

export async function updateStreakOnLogin(uid) {
  if (!uid) return
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data      = snap.data()
  const todayStr = new Date().toDateString()
  const lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : null
  if (!lastLogin || lastLogin.toDateString() !== todayStr) {
    await updateDoc(ref, { lastLogin: serverTimestamp() })
  }
}

// Call whenever user logs real revision activity (session, paper, task, note, mistake).
export async function recordActivityStreak(uid) {
  if (!uid) return
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

  const bestStreak = Math.max(newStreak, data.bestStreak || 0)
  await updateDoc(ref, { streak: newStreak, bestStreak, lastActivityDate: todayStr })
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
    badges: arrayUnion(badgeId),
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

  const today = new Date().toDateString().replace(/ /g, '_')
  const ref   = doc(db, 'users', uid, 'quests', today)
  const snap  = await getDoc(ref)
  const data  = snap.exists() ? snap.data() : {}

  if (data[questId]) return // already marked complete

  const xp = QUEST_XP[questId] || 10
  await setDoc(ref, { [questId]: true, updatedAt: serverTimestamp() }, { merge: true })
  await awardXP(uid, xp, 'Daily quest')

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
  await updateDoc(doc(db, 'users', uid, 'sessions', id), {
    completed: true,
    notes:     notes || '',
  })
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
   QUIZZES
========================= */

export const saveQuizResult = async (userId, quizData) => {
  if (!userId) return
  try {
    const quizResultsRef = collection(db, 'users', userId, 'quizResults')
    await addDoc(quizResultsRef, {
      ...quizData,
      createdAt: serverTimestamp(),
      timestamp: quizData.timestamp || new Date().toISOString()
    })
    await awardXP(userId, 25, 'Quiz complete')
    await recordActivityStreak(userId)
  } catch (error) {
    console.error('Error saving quiz result to Firestore:', error)
    throw error
  }
}

export const getUserQuizResults = async (userId) => {
  if (!userId) return []
  try {
    const quizResultsRef = collection(db, 'users', userId, 'quizResults')
    const q = query(quizResultsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return []
  }
}

/* =========================
   TOPIC ID MIGRATION
========================= */

export const migrateLegacyTopicDocs = async (uid, topicDocs, subjects, profileQualification) => {
  if (!uid || !topicDocs?.length) return topicDocs || []
  const corrected = []
  for (const t of topicDocs) {
    if (!isLegacyTopicId(t.id)) { corrected.push(t); continue }
    const subjectMeta = subjects?.find(s => s.name === t.subjectId)
    if (!subjectMeta) { corrected.push(t); continue }
    const board = subjectMeta.board || 'AQA'
    const qualification = subjectMeta.qualification || profileQualification || 'GCSE'
    const newId = buildTopicId(board, qualification, t.subjectId, t.name)
    if (newId === t.id) { corrected.push(t); continue }
    try {
      const newRef = doc(db, 'users', uid, 'topics', newId)
      const existing = await getDoc(newRef)
      if (existing.exists()) {
        await deleteDoc(doc(db, 'users', uid, 'topics', t.id))
        corrected.push({ id: newId, ...existing.data() })
        continue
      }
      const { id: _oldId, ...data } = t
      await setDoc(newRef, { ...data, board, qualification, updatedAt: serverTimestamp() })
      await deleteDoc(doc(db, 'users', uid, 'topics', t.id))

      const oldPriRef = doc(db, 'users', uid, 'priorities', t.id)
      const oldPriSnap = await getDoc(oldPriRef)
      if (oldPriSnap.exists()) {
        await setDoc(doc(db, 'users', uid, 'priorities', newId), { ...oldPriSnap.data(), topicId: newId })
        await deleteDoc(oldPriRef)
      }
      corrected.push({ ...t, id: newId, board, qualification })
    } catch (err) {
      console.error('Topic ID migration failed for', t.id, err)
      corrected.push(t)
    }
  }
  return corrected
}

/* =========================
   FRIENDS SYSTEM
========================= */

export const sendFriendRequest = async (fromUid, toUid) => {
  let fromName = ''
  try {
    const snap = await getDoc(doc(db, 'users', fromUid))
    if (snap.exists()) {
      const d = snap.data()
      fromName = d.displayName || d.profile?.displayName || ''
    }
  } catch {}
  await addDoc(collection(db, 'friendRequests'), {
    from:      fromUid,
    fromName,
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
  await updateDoc(doc(db, 'users', fromUid), { friends: arrayUnion(toUid) })
  await updateDoc(doc(db, 'users', toUid),   { friends: arrayUnion(fromUid) })
  await deleteDoc(doc(db, 'friendRequests', requestId))
  await awardXP(fromUid, 25, 'New friend')
  await awardXP(toUid,   25, 'New friend')
  await checkAndAwardBadge(fromUid, 'first_friend')
  await checkAndAwardBadge(toUid,   'first_friend')
}

export const declineFriendRequest = (requestId) =>
  deleteDoc(doc(db, 'friendRequests', requestId))

export const removeFriend = async (uid, friendUid) => {
  await updateDoc(doc(db, 'users', uid),       { friends: arrayRemove(friendUid) })
  await updateDoc(doc(db, 'users', friendUid), { friends: arrayRemove(uid) })
}

export const getFriendProfiles = async (friendUids) => {
  if (!friendUids || friendUids.length === 0) return []
  const profiles = await Promise.all(
    friendUids.map(async uid => {
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        if (!snap.exists()) return null
        const d = snap.data()
        return {
          uid,
          displayName: d.displayName || d.profile?.displayName || 'Anonymous',
          xp:          d.xp || 0,
          streak:      d.streak || 0,
          profileIcon: d.profileIcon || null,
        }
      } catch { return null }
    })
  )
  return profiles.filter(Boolean)
}

export const getUserByUsername = async (username) => {
  if (!username) return null
  try {
    const q1    = query(collection(db, 'users'), where('username', '==', username), limit(1))
    const snap1 = await getDocs(q1)
    if (!snap1.empty) {
      const d = snap1.docs[0]
      return { uid: d.id, ...d.data() }
    }
    const snap2 = await getDoc(doc(db, 'users', username))
    if (snap2.exists()) return { uid: snap2.id, ...snap2.data() }
    return null
  } catch { return null }
}

export const searchUsersByName = async (searchTerm) => {
  if (!searchTerm) return []
  try {
    const q    = query(collection(db, 'users'), orderBy('displayName'), limit(50))
    const snap = await getDocs(q)
    const lower = searchTerm.toLowerCase()
    return snap.docs
      .map(d => ({ uid: d.id, ...d.data() }))
      .filter(u => (u.displayName || '').toLowerCase().includes(lower))
      .slice(0, 10)
  } catch { return [] }
}

/* =========================
   BADGE AUDIT
========================= */

export async function runBadgeAudit(uid) {
  if (!uid) return { awarded: [] }

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

  const checks = []

  if (completedSessions.length >= 1)  checks.push('first_session')
  if (completedSessions.length >= 10) checks.push('ten_sessions')
  if (papers.length >= 1)              checks.push('first_paper')
  if (papers.length >= 10)             checks.push('ten_papers')
  if (papers.length >= 50)             checks.push('fifty_papers')
  if ((user.profile?.displayName || user.displayName) &&
      (user.subjects || []).length > 0 &&
      (user.examDates || []).length > 0) checks.push('profile_complete')

  if (streak >= 3)   checks.push('streak_3')
  if (streak >= 7)   checks.push('streak_7')
  if (streak >= 14)  checks.push('streak_14')
  if (streak >= 30)  checks.push('streak_30')
  if (streak >= 100) checks.push('streak_100')

  const gradeOrder = ['U','G','F','E','D','C','B','A','A*','9','8','7','6','5','4','3','2','1']
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

  if (papers.some(p => (p.percentage || 0) >= 90)) checks.push('full_marks')

  const highTopics = topics.filter(t => (t.confidence || 0) >= 4)
  if (highTopics.length > 0 && resolvedMistakes.length > 0) checks.push('comeback')

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

  const weekendDays = new Set()
  completedSessions.forEach(s => {
    const d = s.date || s.startTime?.split?.('T')?.[0]
    if (!d) return
    const day = new Date(d).getDay()
    if (day === 0 || day === 6) {
      const dt  = new Date(d)
      const wk  = `${dt.getFullYear()}-W${Math.ceil(dt.getDate() / 7)}`
      weekendDays.add(`${wk}-${day}`)
    }
  })
  const weekKeys = {}
  weekendDays.forEach(k => {
    const [week, day] = k.split(/-(?=\d$)/)
    if (!weekKeys[week]) weekKeys[week] = new Set()
    weekKeys[week].add(day)
  })
  const weekendWarrior = Object.values(weekKeys).some(days => days.has('6') && days.has('0'))
  if (weekendWarrior) checks.push('weekend_warrior')

  if (completedSessions.some(s => (s.duration || 0) >= 120)) checks.push('marathon_session')

  if (friendCount >= 1) checks.push('first_friend')
  if (friendCount >= 3) checks.push('three_friends')

  try {
    const aiSnap = await getDoc(doc(db, 'users', uid, 'dailyBriefing', 'latest'))
    if (aiSnap.exists()) checks.push('first_ai')
  } catch {}

  const alreadyEarned = new Set(user.badges || [])
  const toAward       = checks.filter(id => !alreadyEarned.has(id))
  const awarded       = []

  for (const badgeId of toAward) {
    await checkAndAwardBadge(uid, badgeId)
    awarded.push(badgeId)
  }

  await updateDoc(doc(db, 'users', uid), {
    lastBadgeAudit: serverTimestamp(),
  })

  return { awarded }
}

/* =========================
   FLASHCARD SETS
========================= */

export const saveFlashcardSet = async (uid, { title, subject, topic, cards, isPublic = false, author, authorType }) => {
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
  let refId
  const isOfficial = authorType === 'official'
  if (uid && !isOfficial) {
    const ref = await addDoc(collection(db, 'users', uid, 'flashcardSets'), data)
    refId = ref.id
  }
  if (isPublic || isOfficial) {
    if (refId) {
      await setDoc(doc(db, 'publicFlashcards', refId), { ...data, setId: refId })
    } else {
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
    ...(prev.authorType !== 'official' && { author: prev.author }),
  }
  await updateDoc(ref, updates)

  if (isPublic) {
    await setDoc(doc(db, 'publicFlashcards', setId), { ...prev, ...updates, uid, setId })
  } else if (prev.isPublic && !isPublic) {
    await deleteDoc(doc(db, 'publicFlashcards', setId))
  }
}

export const deleteFlashcardSet = async (uid, setId) => {
  if (uid) {
    await deleteDoc(doc(db, 'users', uid, 'flashcardSets', setId))
  }
  await deleteDoc(doc(db, 'publicFlashcards', setId))
}

export const getFlashcardSets = async (uid) => {
  if (!uid) return []
  const snap = await getDocs(collection(db, 'users', uid, 'flashcardSets'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getPublicFlashcardSets = async () => {
  const snap = await getDocs(collection(db, 'publicFlashcards'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
