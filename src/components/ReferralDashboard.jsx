import React, { useState, useEffect } from 'react';
import { Copy, Gift } from 'lucide-react';

const ReferralDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    referralCode: 'LOADING',
    referralLink: '',
    thisMonthCount: 0,
    totalBonusEarned: 0
  });

  // Fetch stats logic...

  return (
    <div className="p-6 bg-surface rounded-2xl border border-surface2">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Gift className="text-terracotta" /> Referral Program
      </h2>
      <div className="bg-surface2 p-4 rounded-xl mb-4">
        <p className="text-sm text-text-muted mb-1">Your Referral Link:</p>
        <div className="flex gap-2">
          <input 
            readOnly 
            value={`shinerva.id/ref/${stats.referralCode}`} 
            className="flex-grow bg-surface p-2 rounded border border-surface2"
          />
          <button 
            className="bg-terracotta text-white px-4 py-2 rounded font-bold"
            onClick={() => {
              navigator.clipboard.writeText(`https://shinerva.id/ref/${stats.referralCode}`);
              alert('Link telah disalin!');
            }}
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Monthly Progress ({stats.thisMonthCount} / 20)</span>
        </div>
        <div className="w-full bg-surface2 h-2 rounded-full overflow-hidden">
          <div 
            className={`${stats.thisMonthCount >= 15 ? 'bg-amber-500' : 'bg-terracotta'} h-full transition-all`} 
            style={{ width: `${Math.min((stats.thisMonthCount / 20) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      <p>Total Referral Bonuses: {stats.totalBonusEarned} characters</p>
    </div>
  );
};

export default ReferralDashboard;
