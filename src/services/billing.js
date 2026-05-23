import { toast } from 'react-hot-toast';
import { handleApiError, checkResponse } from '../lib/errorUtils';
import { auth } from '../lib/firebase';

export const handlePurchase = async (planId, billingCycle, setPurchaseLoading, refreshUser, language) => {
  if (!auth?.currentUser) {
    toast.error(language === 'ID' ? "Silakan login terlebih dahulu untuk melakukan pembelian." : "Please login first to make a purchase.");
    return false; // indicates auth is needed
  }

  setPurchaseLoading(planId);
  try {
    const idToken = await auth.currentUser.getIdToken();
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        planId,
        billingCycle
      }),
    };
    const res = await fetch("/api/payment/create", options);

    const data = await checkResponse(res, 0, options);
    
    if (data.token && window.snap) {
      window.snap.pay(data.token, {
        onSuccess: (result) => {
          console.log('success', result);
          toast.success(language === 'ID' ? "Pembayaran berhasil! Kredit Anda akan segera diperbarui." : "Payment successful! Your credits will be updated shortly.");
          refreshUser();
        },
        onPending: (result) => {
          console.log('pending', result);
          toast(language === 'ID' ? "Pembayaran pending. Silakan selesaikan pembayaran Anda." : "Payment pending. Please complete your payment.", { icon: '⏳' });
        },
        onError: (result) => {
          console.log('error', result);
          toast.error(language === 'ID' ? "Pembayaran gagal. Silakan coba lagi." : "Payment failed. Please try again.");
        },
        onClose: () => {
          console.log('customer closed the popup without finishing the payment');
        }
      });
    }
    return true;
  } catch (err) {
    handleApiError(err, language === 'ID' ? "Gagal memulai proses pembayaran." : "Failed to initiate payment process.");
    return true;
  } finally {
    setPurchaseLoading(null);
  }
};
