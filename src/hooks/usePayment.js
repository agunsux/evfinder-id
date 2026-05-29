/**
 * usePayment — React hook for Midtrans Snap payment integration
 *
 * Handles:
 * - Initiating Midtrans Snap checkout for plan purchases
 * - Listening for payment success/pending/error callbacks
 * - Refreshing user credits after successful payment
 *
 * Requires: Midtrans Snap.js loaded globally (snap.js)
 *
 * Usage:
 *   const { initiatePayment, isProcessing, paymentResult } = usePayment(user, refreshUser);
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export function usePayment(user, onPaymentSuccess) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  /**
   * Initiates Midtrans Snap payment for a plan.
   * @param {string} planId - Plan ID from PLANS
   * @param {string} billingCycle - 'monthly' | 'yearly'
   */
  const initiatePayment = useCallback(async (planId, billingCycle = 'monthly') => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu.');
      return;
    }

    if (!window.snap) {
      toast.error('Midtrans belum dimuat. Silakan refresh halaman.');
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const idToken = await user.getIdToken();

      // Request Snap token from backend
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const { token } = await res.json();

      // Open Midtrans Snap popup
      window.snap.pay(token, {
        onSuccess(result) {
          console.log('[Payment] Success:', result);
          setPaymentResult({ status: 'success', result });
          toast.success('Pembayaran berhasil! Kredit Anda akan segera diperbarui.');
          if (onPaymentSuccess) onPaymentSuccess(result);
        },
        onPending(result) {
          console.log('[Payment] Pending:', result);
          setPaymentResult({ status: 'pending', result });
          toast('Pembayaran pending. Silakan selesaikan pembayaran Anda.', { icon: '⏳' });
        },
        onError(result) {
          console.error('[Payment] Error:', result);
          setPaymentResult({ status: 'error', result });
          toast.error('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose() {
          console.log('[Payment] Snap popup closed');
          setIsProcessing(false);
        },
      });

      setIsProcessing(false);
    } catch (err) {
      console.error('[usePayment] initiatePayment error:', err);
      toast.error(err.message || 'Gagal memulai pembayaran.');
      setPaymentResult({ status: 'error', error: err.message });
      setIsProcessing(false);
    }
  }, [user, onPaymentSuccess]);

  /**
   * Clears the current payment result state.
   */
  const clearResult = useCallback(() => {
    setPaymentResult(null);
  }, []);

  return {
    initiatePayment,
    isProcessing,
    paymentResult,
    clearResult,
  };
}

export default usePayment;
