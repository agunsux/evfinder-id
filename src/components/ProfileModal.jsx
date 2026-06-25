import React from 'react';
import { User, X, ShieldCheck, CheckCircle, Gift } from 'lucide-react';
import { logout } from '../lib/authService';

const ProfileModal = ({ 
  user, 
  remainingCredits, 
  setIsProfileModalOpen, 
  handleResendVerification, 
  setIsReferralOpen 
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark/95 backdrop-blur-md"
        onClick={() => setIsProfileModalOpen(false)}
      ></div>
      <div className="bg-dark border border-surface2 rounded-3xl md:rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar border-gradient animate-in zoom-in duration-300">
         <div className="p-6 sm:p-8 md:p-10">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 text-text-muted hover:text-text cursor-pointer bg-surface2/50 hover:bg-surface2 p-2 rounded-full transition-all border-none"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-terracotta/20 relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-terracotta" />
                )}
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-dark"></div>
              </div>
              <h2 className="text-3xl font-black text-text mb-2">{user.name || user.displayName || "Pengguna Shinerva"}</h2>
              <p className="text-text-muted font-medium">{user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
               <div className="bg-surface2/30 p-5 rounded-3xl border border-surface2">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Paket Saat Ini</p>
                  <p className="text-2xl font-black text-terracotta">{user.tier || "FREE"}</p>
               </div>
               <div className="bg-surface2/30 p-5 rounded-3xl border border-surface2">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Sisa Karakter</p>
                  <p className={`text-2xl font-black ${remainingCredits < 1000 ? "text-red-500" : "text-text"}`}>
                    {remainingCredits?.toLocaleString("id-ID") || 0}
                  </p>
                  {remainingCredits < 1000 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">Kredit Hampir Habis!</p>
                  )}
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark/50 rounded-2xl border border-surface2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Status Verifikasi</p>
                    <p className="text-xs text-text-muted">{user.emailVerified ? "Email Terverifikasi" : "Belum Verifikasi"}</p>
                  </div>
                </div>
                {user.emailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <button onClick={handleResendVerification} className="text-xs font-black text-terracotta hover:underline bg-transparent border-none cursor-pointer">Verifikasi Sekarang</button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-dark/50 rounded-2xl border border-surface2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center">
                     <Gift className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Referral Aktif</p>
                    <p className="text-xs text-text-muted">{user.valid_referrals || 0} teman terdaftar</p>
                  </div>
                </div>
                <button onClick={() => {setIsReferralOpen(true); setIsProfileModalOpen(false);}} className="text-xs font-black text-terracotta hover:underline bg-transparent border-none cursor-pointer">Detail</button>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  document.getElementById('pricing-temporarily-renamed')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-terracotta hover:bg-trdark text-text font-black py-4 rounded-2xl transition-all shadow-xl shadow-terracotta/20 border-none cursor-pointer"
              >
                Upgrade Keanggotaan
              </button>
              <button
                onClick={async () => {
                  await logout();
                  setIsProfileModalOpen(false);
                }}
                className="w-full bg-transparent hover:bg-red-500/10 text-red-500 font-bold py-3 rounded-2xl transition-all border border-red-500/20 cursor-pointer"
              >
                Keluar Akun
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProfileModal;
