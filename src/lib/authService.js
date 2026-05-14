import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export const login = async (email, password) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please check your configuration.");
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signup = async (email, password) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please check your configuration.");
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please check your configuration.");
  return await signOut(auth);
};

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please check your configuration.");
  return await signInWithPopup(auth, googleProvider);
};

export const resetPassword = async (email) => {
  if (!auth) throw new Error("Firebase Auth is not initialized. Please check your configuration.");
  return await sendPasswordResetEmail(auth, email);
};
