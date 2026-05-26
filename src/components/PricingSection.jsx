import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PaymentMethods from './PaymentMethods';
import { PLANS } from '../lib/plans';
import { handlePurchase } from '../services/billing';
import { useStudio } from '../context/StudioContext';

const PricingSection = ({ refreshUser, setAuthMode, setIsAuthOpen }) => {
  const { language } = useStudio();
  const [purchaseLoading, setPurchaseLoading] = useState(null);

  const onPurchase = (planId) => {
    handlePurchase(planId, 'monthly', setPurchaseLoading, refreshUser, language).then((needsAuth) => {
      if (needsAuth === false) {
        setAuthMode("signup");
        setIsAuthOpen(true);
      }
    });
  };

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          {language === 'ID' ? 'Pilih Paket Kredit Suara' : 'Choose Your Voice Credit Plan'}
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto mb-8 text-lg">
          {language === 'ID' 
            ? 'Beli paket sesuai kebutuhan. Tanpa langganan, kredit rollover otomatis selama masa aktif. Lebih fleksibel, lebih adil.'
            : 'Buy a plan according to your needs. No subscription, automatic rollover credits during active period. More flexible, fairer.'}
        </p>

        {/* Payment methods */}
        <PaymentMethods />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[PLANS.FREE, PLANS.STARTER, PLANS.KREATOR, PLANS.PRODUKTIF].map((plan) => (
          <div key={plan.id} className={`bg-surface border p-6 rounded-3xl flex flex-col relative ${plan.isPopular ? 'border-terracotta shadow-[0_0_30px_rgba(226,114,91,0.15)]' : 'border-surface2'}`}>
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-terracotta text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-10">
                Paling Populer
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 text-text">{plan.name}</h3>
            <div className="text-2xl font-black text-text mb-6">
              {plan.price === 0 ? "Gratis" : `Rp ${(plan.price/1000).toLocaleString("id-ID")}rb`}
            </div>
            <div className="text-xs text-text-muted bg-surface2 px-3 py-2 rounded-lg mb-6 font-medium">
              {plan.credits.toLocaleString("id-ID")} Kredit Suara<br/>
              Masa aktif: {plan.validityDays} hari
            </div>
            <button 
              onClick={() => onPurchase(plan.id)}
              disabled={purchaseLoading === plan.id || plan.price === 0}
              className={`w-full font-bold py-3 text-sm rounded-xl transition-all flex justify-center items-center cursor-pointer border-none ${
                purchaseLoading === plan.id
                  ? "bg-surface2 text-text-muted" 
                  : plan.price === 0 
                  ? "bg-transparent border border-surface2 text-text"
                  : "bg-terracotta hover:bg-trdark text-text"
              }`}
            >
              {plan.price === 0 ? "Mulai Gratis" : purchaseLoading === plan.id ? <Loader2 className="animate-spin w-4 h-4" /> : "Beli Sekarang"}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-20"></div>
    </section>
  );
};

export default PricingSection;
