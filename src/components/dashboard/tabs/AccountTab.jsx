import React, { useState } from 'react';
import { User, LogOut, Trash2, HeartHandshake, Phone, Share2, Copy, Check } from 'lucide-react';
import { logout } from '../../../lib/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AccountTab = ({ user, refreshUser }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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
    const refLink = `https://shinerva.id/?ref=${user?.uid?.substring(0, 8) || 'creator'}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("Link berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const hasGenerated = (user?.generation_count || 0) > 0;
  const isPhoneVerified = false; // Placeholder for future phone verification

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Section */}
      <div className="bg-surface rounded-3xl p-6 md:p-8 border border-surface2 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl border border-zinc-700">
          {user?.email ? user.email.charAt(0).toUpperCase() : <User />}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white mb-1">{user?.name || 'Kreator Shinerva'}</h2>
          <p className="text-zinc-400 font-medium mb-4">{user?.email}</p>
          <div className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300">
            Paket: {user?.tier || 'FREE'}
          </div>
        </div>
      </div>

      {/* Referral Section (Community) */}
      <div className="bg-gradient-to-br from-terracotta/10 to-transparent rounded-3xl p-6 md:p-8 border border-terracotta/20 relative overflow-hidden">
        <HeartHandshake className="absolute -right-4 -bottom-4 w-32 h-32 text-terracotta opacity-10" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white mb-2">Bagikan Shinerva</h3>
          <p className="text-zinc-400 mb-6 max-w-lg">
            Bantu kreator lain bikin konten lebih mudah. Kamu dan temanmu sama-sama dapat <strong className="text-terracotta">15.000 kredit tambahan</strong> saat mereka menggunakan Shinerva.
          </p>

          {!hasGenerated ? (
            <div className="bg-dark/50 rounded-2xl p-4 border border-zinc-800 inline-block">
              <p className="text-sm font-bold text-zinc-500">
                🔒 Buat 1 suara pertamamu di tab Generate untuk membuka fitur referral.
              </p>
            </div>
          ) : !isPhoneVerified ? (
            <div className="bg-dark/50 rounded-2xl p-4 border border-zinc-800 max-w-md">
              <p className="text-sm font-bold text-zinc-300">
                Verifikasi nomor akan tersedia untuk unlock referral rewards.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 max-w-md">
              <div className="flex-1 bg-dark/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 truncate">
                shinerva.id/?ref={user?.uid?.substring(0, 8)}
              </div>
              <button 
                onClick={copyReferral}
                className="bg-white text-black p-3 rounded-xl hover:bg-zinc-200 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings / Actions */}
      <div className="space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-surface rounded-2xl border border-surface2 hover:bg-zinc-800 transition-colors group"
        >
          <div className="flex items-center gap-3 text-zinc-300 group-hover:text-white font-bold">
            <LogOut className="w-5 h-5" />
            Keluar dari Akun
          </div>
        </button>
        
        <button 
          onClick={() => toast("Fitur hapus akun sedang dalam pengembangan.")}
          className="w-full flex items-center justify-between p-4 bg-surface rounded-2xl border border-surface2 hover:bg-red-500/10 transition-colors group"
        >
          <div className="flex items-center gap-3 text-zinc-500 group-hover:text-red-500 font-bold">
            <Trash2 className="w-5 h-5" />
            Hapus Akun Permanen
          </div>
        </button>
      </div>

    </div>
  );
};

export default AccountTab;
