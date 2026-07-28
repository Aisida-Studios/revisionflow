// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import {
  auth, db, loginWithEmail, signupWithEmail,
  loginWithGoogle as _loginWithGoogle,
  resetPassword as _resetPassword,
  ensureUser, updateStreakOnLogin, runBadgeAudit,
} from '../utils/firestore'
import LoadingScreen from '../components/LoadingScreen'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,               setUser]               = useState(null)
  const [profile,            setProfile]            = useState(null)
  const [loading,            setLoading]            = useState(true)
  const [streakCelebration,  setStreakCelebration]  = useState(null) // { streak: N } when streak just went up
  const prevStreakRef = useRef(null)
  // Referrer-side referral reward. Mirrors the streak pattern: the 'referral' badge (see
  // src/data/badges.js) is awarded exactly once, server-side, the moment someone signs up with
  // this user's code (netlify/functions/referral.js) — so "badges array just gained 'referral'
  // since the last snapshot" is a reliable one-shot trigger, the same way "streak just went up" is.
  // The REFERRED side doesn't need this — they get an immediate response from the apply call and
  // are shown their popup locally, right where that happens (see Dashboard.jsx).
  const [referralReward,     setReferralReward]     = useState(null) // { variant: 'referrer' } when just earned
  const prevBadgesRef = useRef(null)
  // New incoming friend request. Friends.jsx only ever showed a passive badge count on its
  // Requests tab — nothing fired when a request actually arrived, and only while already on that
  // page. This needs its own listener (friendRequests is a top-level collection, not a field on
  // the user doc, so it can't piggyback on the profile snapshot above).
  const [newFriendRequest,   setNewFriendRequest]   = useState(null) // { id, from, fromName } when one just arrives
  const seenRequestIdsRef = useRef(null) // null until first snapshot resolves, then a Set

  useEffect(() => {
    let profileUnsub = () => {}
    let requestsUnsub = () => {}

    const authUnsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      profileUnsub()
      requestsUnsub()

      if (u) {
        try {
          await ensureUser(u.uid, {
            displayName: u.displayName || '',
            email:       u.email       || '',
            avatarUrl:   u.photoURL    || '',
          })
          await updateStreakOnLogin(u.uid)
          // Run badge audit if it hasn't run in the last 7 days
          try {
            const userSnap = await import('firebase/firestore').then(m =>
              m.getDoc(m.doc(db, 'users', u.uid))
            )
            const lastAudit = userSnap.data()?.lastBadgeAudit?.toDate?.()
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            if (!lastAudit || lastAudit < sevenDaysAgo) {
              runBadgeAudit(u.uid).catch(e => console.warn('[badge audit]', e))
            }
          } catch (e) { /* non-fatal */ }
        } catch (e) {
          console.error('[AuthContext] ensureUser/streak error:', e)
        }

        profileUnsub = onSnapshot(doc(db, 'users', u.uid), snap => {
          const data = snap.exists() ? { uid: u.uid, ...snap.data() } : null
          // Detect streak increase — fire celebration if streak went up
          if (data && prevStreakRef.current !== null) {
            const prev = prevStreakRef.current
            const curr = data.streak || 0
            if (curr > prev && curr > 0) {
              setStreakCelebration({ streak: curr })
            }
          }
          if (data) prevStreakRef.current = data.streak || 0
          // Detect the 'referral' badge newly appearing — this user just successfully referred
          // someone (see netlify/functions/referral.js: awardReferralBadge runs on the referrer's
          // doc the moment a new signup applies their code). Skipped on the very first snapshot
          // for the same reason the streak check is — otherwise every existing Recruiter would get
          // the popup again on their next login.
          if (data && prevBadgesRef.current !== null) {
            const prevBadges = prevBadgesRef.current
            const currBadges = data.badges || []
            if (currBadges.includes('referral') && !prevBadges.includes('referral')) {
              setReferralReward({ variant: 'referrer' })
            }
          }
          if (data) prevBadgesRef.current = data.badges || []
          setProfile(data)
          setLoading(false)
        }, e => {
          console.error('[AuthContext] profile listener error:', e)
          setLoading(false)
        })

        // Separate listener: friendRequests is a top-level collection (see firestore.js
        // sendFriendRequest), not a field on the user doc, so it needs its own subscription.
        requestsUnsub = onSnapshot(
          query(collection(db, 'friendRequests'), where('to', '==', u.uid)),
          snap => {
            const currIds = new Set(snap.docs.map(d => d.id))
            if (seenRequestIdsRef.current !== null) {
              const newDoc = snap.docs.find(d => !seenRequestIdsRef.current.has(d.id))
              if (newDoc) {
                setNewFriendRequest({ id: newDoc.id, ...newDoc.data() })
              }
            }
            seenRequestIdsRef.current = currIds
          },
          e => console.error('[AuthContext] friend requests listener error:', e)
        )
      } else {
        setProfile(null)
        setLoading(false)
        prevBadgesRef.current = null
        seenRequestIdsRef.current = null
      }
    })

    return () => { authUnsub(); profileUnsub(); requestsUnsub() }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { getDoc, doc: fsDoc } = await import('firebase/firestore')
    const snap = await getDoc(fsDoc(db, 'users', user.uid))
    if (snap.exists()) setProfile({ uid: user.uid, ...snap.data() })
  }, [user])

  const login = (email, pw) => loginWithEmail(email, pw)

  // signup: creates the Firebase Auth user AND sets displayName immediately
  const signup = async (email, pw, displayName) => {
    const cred = await signupWithEmail(email, pw)
    if (displayName && cred?.user) {
      // Set displayName on the Firebase Auth user object
      await updateProfile(cred.user, { displayName })
      // Also write it to Firestore immediately so leaderboard/referral queries work
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          displayName,
          'profile.displayName': displayName,
        }, { merge: true })
      } catch (e) {
        // Non-fatal — ensureUser will handle this
      }
    }
    return cred
  }

  const loginWithGoogle = () => _loginWithGoogle()
  const resetPassword   = email => _resetPassword(email)
  const logout          = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, resetPassword, logout, refreshProfile, streakCelebration, clearStreakCelebration: () => setStreakCelebration(null), referralReward, clearReferralReward: () => setReferralReward(null), newFriendRequest, clearNewFriendRequest: () => setNewFriendRequest(null) }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
