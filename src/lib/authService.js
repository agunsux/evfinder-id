import { auth } from '../lib/firebase';
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
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signup = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return await signOut(auth);
};

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};
