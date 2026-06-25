
import React from 'react';
import { motion } from 'motion/react';

const PaymentMethods = () => {
  return (
    <div className="flex flex-col items-center mt-16 px-6 py-12 bg-surface2/30 rounded-[3rem] border border-surface2">
      <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-8">
        Metode Pembayaran
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/dana.png" alt="DANA" className="h-8 cursor-pointer" />
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/gopay.png" alt="GoPay" className="h-8 cursor-pointer" />
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/ovo.png" alt="OVO" className="h-8 cursor-pointer" />
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/shopeepay.png" alt="ShopeePay" className="h-8 cursor-pointer" />
        <div className="relative">
          <motion.img whileHover={{ scale: 1.1 }} src="/payment/qris.png" alt="QRIS" className="h-10 cursor-pointer" />
          <span className="absolute -top-1 -right-2 bg-green-500 text-text text-[8px] font-bold px-1 rounded-full whitespace-nowrap">
            Secure
          </span>
        </div> 
      </div>
      <div className="flex flex-wrap justify-center items-center gap-6">
        <span className="text-sm font-bold text-text-muted">Virtual Account:</span>
        <span className="text-sm font-bold text-text">BCA, Mandiri, BNI, BRI</span>
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/mastercard.png" alt="MasterCard" className="h-6 cursor-pointer" />
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/visa.png" alt="Visa" className="h-6 cursor-pointer" />
        <motion.img whileHover={{ scale: 1.1 }} src="/payment/paypal.png" alt="PayPal" className="h-6 cursor-pointer" />
      </div>
    </div>
  );
};

export default PaymentMethods;
