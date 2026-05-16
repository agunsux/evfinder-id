import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
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
    const customError = new Error();
    customError.code = errorCode;
    
    switch (errorCode) {
      case 'auth/invalid-email':
        customError.message = "Format email tidak valid.";
        break;
      case 'auth/user-disabled':
        customError.message = "Akun ini telah dinonaktifkan.";
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        customError.message = "Email atau kata sandi salah.";
        break;
      case 'auth/email-already-in-use':
        customError.message = "Email sudah terdaftar. Silakan login atau gunakan email lain.";
        break;
      case 'auth/weak-password':
        customError.message = "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
        break;
      case 'auth/popup-closed-by-user':
        customError.message = "Proses login Google dibatalkan.";
        break;
      case 'auth/too-many-requests':
        customError.message = "Terlalu banyak percobaan gagal. Silakan tunggu sebentar.";
        break;
      case 'auth/network-request-failed':
        customError.message = "Kesalahan jaringan. Periksa koneksi internet Anda.";
        break;
      default:
        customError.message = error.message || "Terjadi kesalahan pada sistem autentikasi.";
    }
    throw customError;
  }
};

export const login = async (email, password) => {
  const userCredential = await handleAuthOperation(() => signInWithEmailAndPassword(auth, email, password));
  
  if (userCredential.user && !userCredential.user.emailVerified) {
    // If not verified, sign out immediately and throw specific error code
    await signOut(auth);
    const error = new Error("Akun Anda belum diverifikasi. Silakan cek email masuk (termasuk folder spam) untuk memverifikasi akun Anda.");
    error.code = 'auth/email-not-verified';
    throw error;
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
      // Automatically send verification email via Backend (Hostinger SMTP)
      try {
        await resendVerificationEmail(email);
      } catch (e) {
        console.warn("Initial verification email via backend failed, falling back to Firebase:", e);
        await sendEmailVerification(userCredential.user);
      }
    }
    return userCredential;
  });
};

export const logout = () => 
  handleAuthOperation(() => signOut(auth));

export const loginWithGoogle = () => 
  handleAuthOperation(() => signInWithPopup(auth, googleProvider));

export const getGoogleRedirectResult = () =>
  handleAuthOperation(() => getRedirectResult(auth));

export const resetPassword = (email) => 
  forgotPassword(email);

export const verifyEmail = () => {
  if (auth.currentUser) {
    return handleAuthOperation(() => sendEmailVerification(auth.currentUser));
  }
  throw new Error("Tidak ada pengguna yang sedang login.");
};

// New Backend-based email triggers (via Hostinger SMTP)
export const resendVerificationEmail = async (email) => {
  const base = import.meta.env.VITE_BACKEND_URL || '';
  const response = await fetch(`${base}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    let errMsg = 'Gagal mengirim email verifikasi.';
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await response.json();
      errMsg = data.error || errMsg;
    } else {
      const txt = await response.text();
      errMsg = txt || errMsg;
    }
    throw new Error(errMsg);
  }
  return await response.json();
};

export const forgotPassword = async (email) => {
  const base = import.meta.env.VITE_BACKEND_URL || '';
  const response = await fetch(`${base}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    let errMsg = 'Gagal mengirim email reset password.';
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await response.json();
      errMsg = data.error || errMsg;
    } else {
      const txt = await response.text();
      errMsg = txt || errMsg;
    }
    throw new Error(errMsg);
  }
  return await response.json();
};
