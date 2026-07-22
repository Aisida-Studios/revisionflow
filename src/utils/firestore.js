import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Saves a completed quiz result to the user's Firestore collection.
 * 
 * @param {string} userId - The Firebase Auth user ID.
 * @param {Object} quizData - Quiz metadata, score, subject, qualification, etc.
 */
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

/**
 * Helper to fetch past quiz results for a specific user.
 */
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
