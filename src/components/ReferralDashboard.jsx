import React, { useState, useEffect } from 'react';
import { Copy, Gift, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const ReferralDashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    referralCode: '...',
    thisMonthCount: 0,
    totalBonusEarned: 0,
    history: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const getReferralStats = httpsCallable(getFunctions(), 'getReferralStats');
        const res = await getReferralStats();
        setStats(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-6 bg-surface rounded-2xl border border-surface2">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Gift className="text-terracotta" /> Referral Program
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface2 p-4 rounded-xl">
          <p className="text-sm text-text-muted mb-1">Your Referral Link:</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={`shinerva.id/ref/${stats.referralCode}`} 
              className="flex-grow bg-surface p-2 rounded border border-surface2"
            />
            <button 
              className="bg-terracotta text-white px-4 py-2 rounded font-bold hover:bg-trdark transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(`https://shinerva.id/ref/${stats.referralCode}`);
                alert('Link telah disalin!');
              }}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="bg-surface2 p-4 rounded-xl">
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Monthly Progress ({stats.thisMonthCount} / 20)</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
              <div 
                className={`${stats.thisMonthCount >= 15 ? 'bg-amber-500' : 'bg-terracotta'} h-full transition-all`} 
                style={{ width: `${Math.min((stats.thisMonthCount / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm">Total Bonus: <strong>{stats.totalBonusEarned}</strong> characters</p>
        </div>
      </div>
      {/* History table remains similar but maybe populated from Firebase too if implemented */}
    </div>
  );
};
export default ReferralDashboard;
