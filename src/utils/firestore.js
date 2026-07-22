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
  serverTimestamp 
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

// Creates a user document in Firestore if they don't already exist
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
        lastLogin: new Date().toISOString(),
        badges: []
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
// 4. Gamification (Streaks & Badges)
// ==========================================

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
      
      // If logged in yesterday, increment. If missed a day, reset to 1.
      if (lastLoginDate === yesterdayString) {
        newStreak += 1;
      } else if (lastLoginDate !== todayString) {
        newStreak = 1; 
      }

      // Only update database if they haven't logged in yet today
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

export const runBadgeAudit = async (userId) => {
  if (!userId) return;
  try {
    // Implement badge calculation logic here in the future.
    // Kept as a safe placeholder to satisfy AuthContext imports.
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    
    // Example: const stats = snap.data();
    // if (stats.quizzesTaken > 10 && !stats.badges.includes("Quiz Master")) { ... }
    
  } catch (error) {
    console.error('Error running badge audit:', error);
  }
};

// ==========================================
// 5. Quiz Results
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
