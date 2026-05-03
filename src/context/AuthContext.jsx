// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  auth, db, loginWithEmail, signupWithEmail,
  loginWithGoogle as _loginWithGoogle,
  resetPassword as _resetPassword,
  ensureUser, updateStreakOnLogin,
} from '../utils/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let profileUnsub = () => {}

    const authUnsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      profileUnsub()

      if (u) {
        try {
          await ensureUser(u.uid, {
            displayName: u.displayName || '',
            email:       u.email       || '',
            avatarUrl:   u.photoURL    || '',
          })
          await updateStreakOnLogin(u.uid)
        } catch (e) {
          console.error('[AuthContext] ensureUser/streak error:', e)
        }

        profileUnsub = onSnapshot(doc(db, 'users', u.uid), snap => {
          setProfile(snap.exists() ? { uid: u.uid, ...snap.data() } : null)
          setLoading(false)
        }, e => {
          console.error('[AuthContext] profile listener error:', e)
          setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => { authUnsub(); profileUnsub() }
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
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, resetPassword, logout, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
