import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  doc,
  query, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  increment 
} from 'firebase/firestore';

// ==========================================
// 1. Core Firebase Exports
// ==========================================
export { auth, db };

// ==========================================
// 2. Authentication Helpers
// ==========================================
export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signupWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const logout = async () => {
  return await signOut(auth);
};

// ==========================================
// 3. User Profile & Lifecycle Helpers
// ==========================================

export const ensureUser = async (user) => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || '',
        createdAt: serverTimestamp(),
        streak: 0,
        xp: 0,
        badges: [],
        unlockedIcons: [],
        lastLogin: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error ensuring user document:', error);
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, data) => {
  if (!userId) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ==========================================
// 4. Gamification (XP, Badges, Icons & Streaks)
// ==========================================

export const awardXP = async (userId, amount) => {
  if (!userId || !amount) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      xp: increment(amount)
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
};

export const checkAndAwardBadge = async (userId, badgeId) => {
  if (!userId || !badgeId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      badges: arrayUnion(badgeId)
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
};

export const unlockReferralIcon = async (userId, iconId) => {
  if (!userId || !iconId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      unlockedIcons: arrayUnion(iconId)
    });
  } catch (error) {
    console.error('Error unlocking referral icon:', error);
  }
};

export const updateStreakOnLogin = async (userId) => {
  if (!userId) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      const data = snap.data();
      const lastLoginDate = data.lastLogin ? new Date(data.lastLogin).toDateString() : null;
      const today = new Date();
      const todayString = today.toDateString();
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newStreak = data.streak || 0;
      
      if (lastLoginDate === yesterdayString) {
        newStreak += 1;
      } else if (lastLoginDate !== todayString) {
        newStreak = 1; 
      }

      if (lastLoginDate !== todayString) {
        await updateDoc(userRef, {
          streak: newStreak,
          lastLogin: today.toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

// Exported for src/utils/ai.js and active study session trackers
export const recordActivityStreak = async (userId) => {
  if (!userId) return;
  try {
    await updateStreakOnLogin(userId);
  } catch (error) {
    console.error('Error recording activity streak:', error);
  }
};

export const runBadgeAudit = async (userId) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
  } catch (error) {
    console.error('Error running badge audit:', error);
  }
};

// ==========================================
// 5. Quizzes & Study Sessions
// ==========================================

export const saveQuizResult = async (userId, quizData) => {
  if (!userId) {
    console.warn('saveQuizResult: No userId provided.');
    return;
  }

  try {
    const quizResultsRef = collection(db, 'users', userId, 'quizResults');
    await addDoc(quizResultsRef, {
      ...quizData,
      createdAt: serverTimestamp(),
      timestamp: quizData.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving quiz result to Firestore:', error);
    throw error;
  }
};

export const getUserQuizResults = async (userId) => {
  if (!userId) return [];

  try {
    const quizResultsRef = collection(db, 'users', userId, 'quizResults');
    const q = query(quizResultsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return [];
  }
};
