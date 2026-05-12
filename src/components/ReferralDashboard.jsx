import React, { useState, useEffect } from 'react';
import { Copy, Gift, Clock, AlertCircle } from 'lucide-react';

const ReferralDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    referralCode: 'LOADING',
    thisMonthCount: 0,
    totalBonusEarned: 0,
    history: [] // Added history
  });

  // Mock fetching stats and history for implementation
  useEffect(() => {
    // In production, fetch from Firebase
    setStats({
      referralCode: 'SHI12345',
      thisMonthCount: 5,
      totalBonusEarned: 50000,
      history: [
        { date: '2026-05-10', referee: 'r***@gmail.com', status: 'completed', bonus: 10000 },
        { date: '2026-05-11', referee: 'a***@gmail.com', status: 'completed', bonus: 10000 },
      ]
    });
  }, []);

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

      <h3 className="text-lg font-bold mb-4">History</h3>
      {stats.history.length === 0 ? (
        <div className="text-center py-8 text-text-muted border-2 border-dashed border-surface2 rounded-xl">
          <Clock className="mx-auto mb-2 opacity-50" />
          <p>Belum ada referral.</p>
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-text-muted">
            <tr>
              <th className="pb-2">Tanggal</th>
              <th className="pb-2">Referee</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {stats.history.map((h, i) => (
              <tr key={i} className="border-t border-surface2">
                <td className="py-3">{h.date}</td>
                <td className="py-3">{h.referee}</td>
                <td className="py-3 capitalize text-terracotta">{h.status}</td>
                <td className="py-3">+{h.bonus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReferralDashboard;
