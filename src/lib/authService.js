import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
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
        throw new Error("Proses login Google dibatalkan atau jendela popup ditutup.");
      case 'auth/too-many-requests':
        throw new Error("Terlalu banyak percobaan gagal. Silakan tunggu sebentar.");
      case 'auth/operation-not-allowed':
        throw new Error("Metode login ini belum diaktifkan di konfigurasi sistem.");
      case 'auth/network-request-failed':
        throw new Error("Kesalahan jaringan (Firebase). Pastikan browser Anda mengizinkan cookie pihak ketiga atau coba buka di tab baru.");
      case 'auth/internal-error':
        throw new Error("Terjadi kesalahan internal Firebase. Ini biasanya karena domain belum diizinkan (whitelisted) atau browser memblokir popup. Silakan coba buka di tab baru (klik ikon panah di pojok kanan atas).");
      case 'auth/unauthorized-domain':
        throw new Error("Domain aplikasi ini belum terdaftar di Firebase Console. Silakan buka di tab baru atau hubungi pengembang.");
      default:
        throw new Error(error.message || "Terjadi kesalahan pada sistem autentikasi.");
    }
  }
};

export const login = (email, password) => 
  handleAuthOperation(() => signInWithEmailAndPassword(auth, email, password));

// Helper to get current origin or a safe fallback
const getAuthRedirectUrl = (path = '/') => {
  if (typeof window !== 'undefined') {
    return window.location.origin + path;
  }
  return 'https://shinerva.id' + path; // Fallback for non-browser environments
};

const getActionCodeSettings = () => ({
  // The URL to redirect back to after finishing the action.
  url: getAuthRedirectUrl(),
  // Must be true for email link sign-in.
  handleCodeInApp: true,
});

export const signup = async (email, password, name) => {
  return handleAuthOperation(async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    // Automatically send verification email on signup
    try {
      await sendEmailVerification(userCredential.user, getActionCodeSettings());
    } catch (verifErr) {
      console.warn("[Auth] Verification email failed to send:", verifErr);
    }
    return userCredential;
  });
};

export const logout = () => 
  handleAuthOperation(() => signOut(auth));

export const loginWithGoogle = () => 
  handleAuthOperation(() => signInWithPopup(auth, googleProvider));

export const resetPassword = (email) => {
  return handleAuthOperation(() => sendPasswordResetEmail(auth, email, getActionCodeSettings()));
};

export const verifyEmail = () => {
  if (auth.currentUser) {
    return handleAuthOperation(() => sendEmailVerification(auth.currentUser, getActionCodeSettings()));
  }
  throw new Error("Tidak ada pengguna yang sedang login.");
};
