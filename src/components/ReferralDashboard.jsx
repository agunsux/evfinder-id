import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  Copy, 
  CheckCircle2, 
  Share2, 
  Twitter, 
  MessageCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralDashboard({ user, auth }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const fetchStats = async () => {
    if (!auth?.currentUser) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/user/referrals', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}?ref=${stats?.referral_code || ''}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Disalin ke papan klip!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Dapatkan 10.000 karakter gratis di Shinerva.id! Gunakan kode referral saya: ${stats?.referral_code} atau daftar lewat link ini: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTwitter = () => {
    const text = `Sintesis suara jadi teks pakai Bahasa Indonesia yang natural di Shinerva.id. Daftar pakai link saya buat dapet bonus 10k karakter! 🎙️🚀\n\n${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-terracotta/20 border-t-terracotta rounded-full animate-spin"></div>
        <p className="mt-4 text-text-muted text-sm font-medium">Memuat data referral...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface1 p-8 rounded-3xl border border-surface2 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-terracotta/10 rounded-full blur-3xl group-hover:bg-terracotta/20 transition-colors duration-500"></div>
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Gift className="text-terracotta" size={32} />
            Program Referral <span className="text-terracotta italic font-serif">Shinerva</span>
          </h2>
          <p className="text-text-muted text-sm max-w-md">
            Undang temanmu dan dapatkan karakter tambahan secara gratis saat mereka melakukan generasi suara pertama mereka.
          </p>
        </div>

        <div className="relative z-10 bg-dark/50 backdrop-blur-md p-4 rounded-2xl border border-surface2/5 flex flex-col items-center gap-3 min-w-[200px]">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Kode Referral Anda</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-text tracking-widest leading-none">
              {stats?.referral_code || '---'}
            </span>
            <button 
              onClick={() => copyToClipboard(stats?.referral_code)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-muted hover:text-text"
            >
              {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users className="text-blue-400" />} 
          label="Teman Diundang" 
          value={stats?.invite_count || 0} 
          description="Total pendaftaran baru"
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-400" />} 
          label="Referral Sukses" 
          value={stats?.valid_referrals || 0} 
          description="Selesai generasi pertama"
        />
        <StatCard 
          icon={<Award className="text-terracotta" />} 
          label="Bonus Didapat" 
          value={`${(stats?.bonus_earned || 0).toLocaleString()} Chars`} 
          description="Kredit tambahan gratis"
          highlight
        />
      </div>

      {/* Actions & Sharing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Section */}
        <div className="bg-surface1 p-8 rounded-3xl border border-surface2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Share2 size={24} className="text-text-muted" />
            Bagikan Sekarang
          </h3>
          
          <div className="space-y-4">
            <div className="bg-dark/40 p-4 rounded-xl border border-surface2/5 flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted truncate max-w-[200px]">{referralLink}</span>
              <button 
                onClick={() => copyToClipboard(referralLink)}
                className="text-xs font-bold text-terracotta hover:underline flex items-center gap-1"
              >
                Salin Link <Copy size={12} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={shareWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-text font-bold py-3 rounded-xl transition-all"
              >
                <MessageCircle size={18} /> WhatsApp
              </button>
              <button 
                onClick={shareTwitter}
                className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#0c85d0] text-text font-bold py-3 rounded-xl transition-all"
              >
                <Twitter size={18} /> X / Twitter
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-br from-terracotta to-trdark p-8 rounded-3xl text-text space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={240} />
          </div>
          
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle size={24} />
            Cara Kerja
          </h3>

          <ul className="space-y-4 relative z-10">
            <Step 
              number="1" 
              text="Bagikan link atau kode referral ke teman-temanmu."
            />
            <Step 
              number="2" 
              text="Temanmu mendaftar & mendapat bonus 10.000 karakter."
            />
            <Step 
              number="3" 
              text="Saat 2 temanmu melakukan generasi audio pertama..."
            />
            <Step 
              number="4" 
              text="Kamu langsung dapat bonus 20.000 karakter gratis!"
              last
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description, highlight }) {
  return (
    <div className={`p-6 rounded-3xl border ${highlight ? 'border-terracotta/30 bg-terracotta/5' : 'border-surface2 bg-surface1'} space-y-4`}>
      <div className="p-3 bg-dark/50 w-fit rounded-2xl border border-surface2/5">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-sm font-bold text-text-muted tracking-tight">{label}</div>
      </div>
      <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{description}</p>
    </div>
  );
}

function Step({ number, text, last }) {
  return (
    <li className="flex gap-4 items-start">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-white text-terracotta font-black text-xs flex items-center justify-center shrink-0">
          {number}
        </div>
        {!last && <div className="w-0.5 h-8 bg-white/20 my-1"></div>}
      </div>
      <p className="text-sm font-medium leading-tight pt-1">{text}</p>
    </li>
  );
}
