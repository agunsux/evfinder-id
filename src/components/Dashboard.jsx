import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Activity, User, CreditCard, ShieldCheck, UserPlus, Copy } from 'lucide-react';
import { auth } from '../lib/firebase';
import { logout } from '../lib/authService';
import { toast } from 'react-hot-toast';

const Dashboard = ({ user, refreshUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success("Berhasil keluar.");
    } catch (error) {
      toast.error("Gagal keluar dari akun.");
    }
  };

  const copyReferral = () => {
    const refLink = `https://shinerva.id/?ref=${user?.uid?.substring(0, 8) || 'user'}`;
    navigator.clipboard.writeText(refLink);
    toast.success("Link referral disalin!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
        <p className="text-white mb-4">Anda belum login.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-terracotta text-white rounded-full font-bold">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const totalChars = (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0);
  const usedChars = user.used_chars || 0;
  const remainingChars = Math.max(0, totalChars - usedChars);
  const usagePercent = totalChars > 0 ? Math.min(100, (usedChars / totalChars) * 100) : 0;

  return (
    <div className="min-h-screen bg-dark pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface2">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-surface2 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black text-white">Dashboard Akun</h1>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile & Quota */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-surface rounded-3xl p-6 border border-surface2 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-terracotta to-orange-500 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg">
                  {user.email ? user.email.charAt(0).toUpperCase() : <User />}
                </div>
                <div>
                  <div className="font-bold text-lg text-white break-all">{user.email}</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface2 rounded-full mt-2 border border-surface2">
                    <ShieldCheck className="w-3 h-3 text-terracotta" />
                    <span className="text-xs font-black text-gray-300 uppercase tracking-wider">{user.tier || 'FREE'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quota Card */}
            <div className="bg-surface rounded-3xl p-6 border border-surface2 shadow-xl">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Pemakaian Kuota
              </h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-400 text-sm font-medium">Sisa Karakter</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{remainingChars.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="w-full bg-dark h-3 rounded-full overflow-hidden mb-2 border border-surface2">
                  <div 
                    className="bg-gradient-to-r from-terracotta to-orange-400 h-full rounded-full relative"
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Digunakan: {usedChars.toLocaleString('id-ID')}</span>
                  <span>Total: {totalChars.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-terracotta/10 text-terracotta border border-terracotta/20 hover:bg-terracotta/20 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Beli Kredit Tambahan
              </button>
            </div>
            
            {/* Referral Card */}
            <div className="bg-gradient-to-br from-surface to-surface2 rounded-3xl p-6 border border-terracotta/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <UserPlus className="w-24 h-24 text-terracotta" />
              </div>
              <h2 className="text-sm font-black text-terracotta uppercase tracking-wider mb-2 relative z-10 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Program Referral
              </h2>
              <p className="text-xs text-gray-400 mb-4 relative z-10 leading-relaxed">
                Ajak teman menggunakan Shinerva dan dapatkan <strong className="text-white">5.000 karakter gratis</strong> untuk setiap pengguna baru yang mendaftar.
              </p>
              
              <div className="bg-dark/50 border border-surface2 rounded-xl p-3 flex justify-between items-center relative z-10 backdrop-blur-sm">
                <span className="text-sm font-medium text-gray-300 truncate mr-2">
                  shinerva.id/?ref={user?.uid?.substring(0, 8) || 'user'}
                </span>
                <button 
                  onClick={copyReferral}
                  className="p-2 bg-surface2 hover:bg-terracotta hover:text-white rounded-lg transition-colors text-gray-400"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex justify-between text-xs font-bold text-gray-400 relative z-10">
                <span>Total Teman: 0</span>
                <span>Bonus Didapat: 0</span>
              </div>
            </div>

          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-3xl p-6 border border-surface2 shadow-xl h-full flex flex-col">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Riwayat Generasi Terakhir
              </h2>
              
              <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                {user.history && user.history.length > 0 ? (
                  <div className="space-y-3">
                    {user.history.map((item, index) => (
                      <div key={item.id || index} className="p-4 bg-dark/40 rounded-2xl border border-surface2 flex items-center justify-between hover:border-terracotta/30 transition-colors group">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-white text-sm">
                              {item.voice.replace('shinerva-', '').charAt(0).toUpperCase() + item.voice.replace('shinerva-', '').slice(1)}
                            </span>
                            <span className="px-2 py-0.5 bg-surface2 text-gray-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              {item.tier}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {new Date(item.date).toLocaleString('id-ID', { 
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-terracotta text-sm">-{item.credits_used}</div>
                          <div className="text-xs text-gray-500 font-medium">karakter</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">Belum ada riwayat penggunaan.</p>
                    <p className="text-gray-500 text-xs mt-1">Ganti teks menjadi suara untuk melihat riwayat di sini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
