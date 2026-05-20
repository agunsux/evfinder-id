import React from 'react';

const PaymentMethods = () => {
  return (
    <div className="flex flex-col items-center mt-16 px-6 py-12 bg-surface2/30 rounded-[3rem] border border-surface2">
      <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-8">
        Metode Pembayaran
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
        <img src="/logo DANA.png" alt="DANA" className="h-8 object-contain" />
        <img src="/logo gopay.png" alt="GoPay" className="h-8 object-contain" />
        <img src="/Logo Shopee Pay.png" alt="ShopeePay" className="h-8 object-contain" />
        <img src="/LOGO QRIS.png" alt="QRIS" className="h-10 object-contain" /> 
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6">
        <img src="/logo mastercard.png" alt="MasterCard" className="h-6 object-contain" />
        <img src="/logo visa.png" alt="Visa" className="h-6 object-contain" />
        <img src="/logo paypal.png" alt="PayPal" className="h-6 object-contain" />
      </div>
    </div>
  );
};

export default PaymentMethods;
