/**
 * billing.js — Shinerva Payment / Checkout Service
 * ============================================
 *
 * CRITICAL ARCHITECTURAL RULE:
 * Payment and checkout are 100% isolated from AI/TTS/Gemini/R2 infrastructure.
 * A missing GEMINI_API_KEY or broken TTS pipeline NEVER blocks payment.
 *
 * Flow:
 *  1. Check Firebase Auth
 *  2. POST /api/checkout/midtrans → isolated Midtrans Snap token (no AI deps)
 *  3. Dynamically load Snap.js if not already loaded
 *  4. snap.pay(token) → opens Midtrans popup
 *  5. Midtrans callbacks → Firestore webhook updates credits
 */

import { toast } from 'react-hot-toast';
import { auth } from '../lib/firebase';

export const DEFAULT_BILLING_CYCLE = 'monthly';

/**
 * Lazily loads Midtrans Snap.js once. Idempotent — subsequent calls
 * return the same promise. Subsequent calls when already loaded resolve immediately.
 */
let _snapPromise = null;

function loadSnapScript() {
  if (_snapPromise) return _snapPromise;
  if (window.snap) return Promise.resolve(window.snap);

  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  if (!clientKey || clientKey.includes('XXXXX')) {
    console.warn('[Checkout] VITE_MIDTRANS_CLIENT_KEY not set');
    _snapPromise = Promise.reject(new Error('Midtrans key not configured'));
    return _snapPromise;
  }

  _snapPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => {
      console.log('[Checkout] Snap.js loaded');
      resolve(window.snap);
    };
    script.onerror = () => {
      console.error('[Checkout] Snap.js load failed');
      _snapPromise = null; // Reset so retry can re-attempt loading
      reject(new Error('Snap.js failed to load'));
    };
    document.head.appendChild(script);
  });

  return _snapPromise;
}

/**
 * Initiates Midtrans checkout for a plan.
 *
 * @param {string} planId - e.g. "free", "starter", "kreator"
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @param {Function} setPurchaseLoading - setter: (planId) => void
 * @param {Function} refreshUser - () => Promise<void>
 * @param {'ID'|'EN'} language - UI language
 * @returns {Promise<boolean>} true = done (success or handled error), false = needs auth
 */
export async function handlePurchase(planId, billingCycle = DEFAULT_BILLING_CYCLE, setPurchaseLoading, refreshUser, language = 'ID') {
  if (!auth?.currentUser) {
    toast.error(
      language === 'ID'
        ? 'Silakan login terlebih dahulu untuk membeli paket.'
        : 'Please login first to purchase a plan.'
    );
    return false;
  }

  setPurchaseLoading(planId);

  let idToken;
  try {
    idToken = await auth.currentUser.getIdToken();
  } catch {
    toast.error(
      language === 'ID'
        ? 'Token autentikasi gagal dibuat. Buka di tab baru.'
        : 'Auth token failed. Try opening in a new tab.'
    );
    setPurchaseLoading(null);
    return true;
  }

  // ── Step 1: Fetch Snap token from isolated checkout route ─────────────────
  let snapToken, redirectUrl, serverMsg;
  try {
    const res = await fetch('/api/checkout/midtrans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ planId, billingCycle }),
    });

    const data = await res.json();

    // Structured error responses from our backend — show them directly
    if (!res.ok) {
      const msg = data?.error || `Server error (${res.status})`;
      const hint = data?.suggestion || '';
      toast.error(`${msg}${hint ? '\n' + hint : ''}`, { duration: 7000 });
      setPurchaseLoading(null);
      return true;
    }

    snapToken = data.token;
    redirectUrl = data.redirectUrl || null;
    serverMsg = data.message;
    console.log(`[Checkout] Token received: ${data.orderId}`);
  } catch (netErr) {
    console.error('[Checkout] Network error:', netErr);
    toast.error(
      language === 'ID'
        ? 'Tidak dapat menghubungi server pembayaran. Periksa koneksi.'
        : 'Cannot reach payment server. Check your connection.'
    );
    setPurchaseLoading(null);
    return true;
  }

  // ── Step 2: Load Snap.js (lazy, only when needed) ──────────────────────
  let snap;
  try {
    snap = await loadSnapScript();
  } catch {
    // Snap.js load failed — offer redirect URL as fallback
    if (redirectUrl) {
      toast(
        language === 'ID'
          ? 'Midtrans popup tidak tersedia. Mengalihkan ke halaman pembayaran...'
          : 'Midtrans popup unavailable. Redirecting to payment page...',
        { icon: '🔗', duration: 4000 }
      );
      setTimeout(() => window.open(redirectUrl, '_blank'), 2500);
    } else {
      toast.error(
        language === 'ID'
          ? 'Midtrans tidak dapat dimuat. Refresh halaman dan coba lagi.'
          : 'Midtrans could not be loaded. Refresh and try again.'
      );
    }
    setPurchaseLoading(null);
    return true;
  }

  // ── Step 3: Open Snap popup ───────────────────────────────────────────────
  if (snapToken && snap) {
    snap.pay(snapToken, {
      onSuccess(result) {
        console.log('[Checkout] Success:', result);
        toast.success(
          language === 'ID'
            ? 'Pembayaran berhasil! Kredit akan segera diperbarui.'
            : 'Payment successful! Credits will be updated shortly.'
        );
        setTimeout(() => refreshUser?.(), 2000);
      },
      onPending(result) {
        console.log('[Checkout] Pending:', result);
        toast(
          language === 'ID'
            ? 'Pembayaran pending. Selesaikan dalam waktu yang ditentukan.'
            : 'Payment pending. Complete within the given time.',
          { icon: '⏳', duration: 8000 }
        );
      },
      onError(result) {
        console.error('[Checkout] Error:', result);
        toast.error(
          language === 'ID'
            ? 'Pembayaran gagal. Silakan coba lagi.'
            : 'Payment failed. Please try again.'
        );
      },
      onClose() {
        // User closed without completing — not an error
        console.log('[Checkout] Snap closed by user');
      },
    });
  } else if (redirectUrl) {
    // Token missing but redirect URL available — fallback
    toast(
      language === 'ID'
        ? 'Tidak ada token popup. Mengalihkan ke halaman pembayaran.'
        : 'No popup token available. Redirecting to payment page.',
      { icon: '🔗', duration: 3000 }
    );
    setTimeout(() => window.open(redirectUrl, '_blank'), 2000);
  } else {
    toast.error(
      language === 'ID'
        ? 'Tidak ada sesi pembayaran. Hubungi support.'
        : 'No payment session available. Contact support.'
    );
  }

  setPurchaseLoading(null);
  return true;
}

/**
 * Opens Snap popup with an existing token.
 * Call this after loadSnapScript() resolves.
 */
export function openSnap(token, callbacks = {}, language = 'ID') {
  if (!window.snap) {
    toast.error(
      language === 'ID'
        ? 'Midtrans belum dimuat.'
        : 'Midtrans not loaded.'
    );
    return false;
  }
  window.snap.pay(token, callbacks);
  return true;
}
