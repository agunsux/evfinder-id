import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

// Safe wrapper for auth operations
const handleAuthOperation = async (operation) => {
  if (!auth) {
    console.error("[Auth] Firebase Auth not initialized.");
    throw new Error("Sistem autentikasi sedang tidak tersedia. Harap periksa koneksi internet Anda.");
  }
  try {
    return await operation();
  } catch (error) {
    console.error("[Auth] Error:", error.code, error.message);
    const errorCode = error.code;
    
    // Map common Firebase errors to user-friendly messages
    switch (errorCode) {
      case 'auth/invalid-email':
        throw new Error("Format email tidak valid.");
      case 'auth/user-disabled':
        throw new Error("Akun ini telah dinonaktifkan.");
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        throw new Error("Email atau kata sandi salah.");
      case 'auth/email-already-in-use':
        throw new Error("Email sudah terdaftar. Silakan login atau gunakan email lain.");
      case 'auth/weak-password':
        throw new Error("Kata sandi terlalu lemah. Gunakan minimal 6 karakter.");
      case 'auth/popup-closed-by-user':
        throw new Error("Proses login Google dibatalkan.");
      case 'auth/too-many-requests':
        throw new Error("Terlalu banyak percobaan gagal. Silakan tunggu sebentar.");
      case 'auth/network-request-failed':
        throw new Error("Kesalahan jaringan. Periksa koneksi internet Anda.");
      default:
        throw new Error(error.message || "Terjadi kesalahan pada sistem autentikasi.");
    }
  }
};

export const login = async (email, password) => {
  const userCredential = await handleAuthOperation(() => signInWithEmailAndPassword(auth, email, password));
  
  if (userCredential.user && !userCredential.user.emailVerified) {
    // If not verified, sign out immediately and throw error
    await signOut(auth);
    throw new Error("Email belum diverifikasi. Silakan cek inbox Anda untuk mengaktifkan akun.");
  }
  
  return userCredential;
};

export const signup = async (email, password, name) => {
  return handleAuthOperation(async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      // Automatically send verification email
      await sendEmailVerification(userCredential.user);
    }
    return userCredential;
  });
};

export const logout = () => 
  handleAuthOperation(() => signOut(auth));

export const loginWithGoogle = () => 
  handleAuthOperation(() => signInWithRedirect(auth, googleProvider));

export const getGoogleRedirectResult = () =>
  handleAuthOperation(() => getRedirectResult(auth));

export const resetPassword = (email) => 
  handleAuthOperation(() => sendPasswordResetEmail(auth, email));

export const verifyEmail = () => {
  if (auth.currentUser) {
    return handleAuthOperation(() => sendEmailVerification(auth.currentUser));
  }
  throw new Error("Tidak ada pengguna yang sedang login.");
};
