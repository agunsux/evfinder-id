/**
 * useAuth — React hook for Firebase Authentication state
 *
 * Wraps Firebase Auth state and provides:
 * - user: Firebase User object or null
 * - loading: true while checking auth state
 * - error: last auth error message
 * - loginWithGoogle(): Sign in via Google popup
 * - logout(): Sign out current user
 * - refreshUser(): Re-fetch user profile from backend
 * - sendVerificationEmail(): Resend email verification
 * - reloadVerificationStatus(): Check if email is now verified
 *
 * Usage:
 *   const { user, loading, loginWithGoogle, logout } = useAuth();
 */

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { loginWithGoogle, logout as authLogout } from '../lib/authService';

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Sync user profile from backend
  const refreshUser = useCallback(async () => {
    if (!user) return null;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn('[useAuth] refreshUser failed:', err.message);
    }
    return null;
  }, [user]);

  // Sign in with Google
  const loginWithGoogleAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // onAuthStateChanged will fire and update `user`
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    setError(null);
    try {
      await authLogout();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Resend email verification
  const sendVerification = useCallback(async () => {
    if (!user) throw new Error('No user logged in');
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        action: "verifyEmail",
        continueUrl: window.location.origin,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.detail || "Gagal mengirim email verifikasi.");
  }, [user]);

  // Reload and check if email verified
  const reloadVerificationStatus = useCallback(async () => {
    if (!user) return false;
    await reload(user);
    return user.emailVerified;
  }, [user]);

  // Listen to Firebase auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError('Firebase Auth not initialized');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Fetch profile in background
        refreshUser().catch(() => {});
      } else {
        setUserProfile(null);
      }
    }, (err) => {
      console.error('[useAuth] onAuthStateChanged error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUser]);

  return {
    user,               // Firebase User object
    userProfile,         // Backend Firestore user data
    loading,             // Auth state still loading
    error,               // Last error message
    isAuthenticated: !!user,
    loginWithGoogle: loginWithGoogleAuth,
    logout,
    refreshUser,
    sendVerification,
    reloadVerificationStatus,
  };
}

export default useAuth;
