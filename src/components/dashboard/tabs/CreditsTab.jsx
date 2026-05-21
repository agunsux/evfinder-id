import React from 'react';
import { Coins, Zap, CreditCard, Sparkles } from 'lucide-react';

const CreditsTab = ({ user }) => {
  const totalChars = (user?.monthly_chars || 0) + (user?.signup_bonus_chars || 0) + (user?.earned_chars || 0);
  const usedChars = user?.used_chars || 0;
  const remainingChars = Math.max(0, totalChars - usedChars);
  
  // Rough estimate: 1 minute of speech ~ 1000 characters
  const estimatedMinutes = Math.floor(remainingChars / 1000);
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const remainingMins = estimatedMinutes % 60;
  
  const timeEstimate = estimatedHours > 0 
    ? `≈ ${estimatedHours} jam ${remainingMins} menit narasi` 
    : `≈ ${estimatedMinutes} menit narasi`;

  const packages = [
    { name: 'Starter', hours: '45 Menit', price: 'Rp 29.000', chars: '40.000 kredit', popular: false },
    { name: 'Creator', hours: '2+ Jam', price: 'Rp 79.000', chars: '120.000 kredit', popular: true },
    { name: 'Pro', hours: '6 Jam', price: 'Rp 249.000', chars: '350.000 kredit', popular: false },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-[2rem] p-8 md:p-12 border border-surface2 mb-12 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 opacity-5">
          <Coins className="w-96 h-96" />
        </div>
        
        <h2 className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-4">Sisa Kredit</h2>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            {remainingChars.toLocaleString('id-ID')}
          </h1>
        </div>
        <p className="text-terracotta font-bold text-lg md:text-xl flex items-center gap-2 relative z-10">
          <Sparkles className="w-5 h-5" />
          {timeEstimate}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-white mb-6">Top-up Kredit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, idx) => (
            <div key={idx} className={`relative bg-surface rounded-3xl p-6 border ${pkg.popular ? 'border-terracotta' : 'border-surface2'} flex flex-col`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Paling Populer
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
              <p className="text-zinc-400 text-sm font-medium mb-6">{pkg.chars} (≈ {pkg.hours} narasi)</p>
              
              <div className="mt-auto">
                <div className="text-2xl font-black text-white mb-4">{pkg.price}</div>
                <button className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  pkg.popular 
                    ? 'bg-white text-black hover:bg-zinc-200' 
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}>
                  Beli Paket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CreditsTab;
