
import React from 'react';

const PaymentMethods = () => {
  return (
    <div className="flex flex-col items-center mt-16 px-6 py-12 bg-surface2/30 rounded-[3rem] border border-surface2">
      <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-8">
        Metode Pembayaran
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
        <img src="/payment/dana.png" alt="DANA" className="h-8" />
        <img src="/payment/gopay.png" alt="GoPay" className="h-8" />
        <img src="/payment/ovo.png" alt="OVO" className="h-8" />
        <img src="/payment/shopee.png" alt="ShopeePay" className="h-8" />
        <img src="/payment/LinkAja.png" alt="LinkAja" className="h-8" />
        <img src="/payment/QRIS.png" alt="QRIS" className="h-10" /> 
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6">
        <img src="/payment/virtual account.png" alt="Virtual Account" className="h-6" />
        <span className="text-sm font-bold text-text">BCA, Mandiri, BNI, BRI</span>
        <img src="/payment/mastercard.png" alt="MasterCard" className="h-6" />
        <img src="/payment/Visa.png" alt="Visa" className="h-6" />
        <img src="/payment/paypal.png" alt="PayPal" className="h-6" />
      </div>
    </div>
  );
};

export default PaymentMethods;
