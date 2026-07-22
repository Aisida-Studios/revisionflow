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
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// 1. Re-export Firebase Auth and Firestore instances
export { auth, db };

// 2. Authentication Helper Functions
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

// 3. User Profile & Settings Firestore Helpers
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

// 4. Quiz Results Firestore Helpers
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
