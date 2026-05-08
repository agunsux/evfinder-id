import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Download, 
  Settings2, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileAudio,
  Trash2,
  Copy,
  ChevronRight,
  Clock,
  Zap,
  FastForward,
  ArrowUpRight,
  Type,
  Plus,
  X,
  Laugh,
  ShieldCheck,
  BookOpen,
  Theater,
  Target,
  Mic2,
  CreditCard,
  Check,
  Wind,
  Moon,
  Sun,
  Globe,
  Star,
  Cpu,
  Quote,
  Wallet,
  QrCode,
  Banknote,
  Coins,
  Share2,
  Smile,
  Ghost,
  Heart,
  Info,
  Lock,
  Crown,
  LogOut,
  Save,
  FileText,
  History,
  Archive,
  User as UserIcon,
  Facebook,
  Apple,
  Pause,
  AlertTriangle,
  Search,
  MessageSquare,
  ChevronLeft
} from "lucide-react";
import { VOICES, Voice, TTSRequest, TTSResponse } from "./types";
import { auth, db, googleProvider, facebookProvider, appleProvider, handleFirestoreError, OperationType, testConnection } from "./lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, getDocs, deleteDoc } from "firebase/firestore";

const translations = {
  id: {
    ctaStudio: "Buka Studio",
    heroBadge: "AI Voice Generative Spesialis Indonesia",
    heroTitle: "Ubah Teks Menjadi Suara Manusia yang Bernyawa.",
    heroSub: "Rungu hadir dengan teknologi AI yang memahami langgam dan emosi Bahasa Indonesia. Cepat, alami, dan siap pakai untuk konten Anda.",
    ctaTry: "Coba Gratis Sekarang",
    ctaPricing: "Lihat Paket Harga",
    featuresTitle: "Kenapa Harus Rungu?",
    feature1Title: "Lokalitas",
    feature1Desc: "Fasih Berbahasa Indonesia, bukan sekadar terjemahan mesin.",
    feature2Title: "Kecepatan",
    feature2Desc: "Satu klik, hasil instan. Hemat waktu produksi konten Anda.",
    feature3Title: "Kualitas",
    feature3Desc: "Langgam bicara yang manusiawi, minim kesan robotik.",
    compareTitle: "Rungu vs Dunia",
    compareSub: "Kami menghormati kompetitor global, tapi untuk Indonesia? Rungu juaranya.",
    packageFree: "Trial",
    packageTopup1: "Starter",
    packageTopup2: "Kreator",
    packageTopup3: "Produktif",
    packageTopup4: "Lifetime",
    priceTopup1: "Rp 25.000",
    priceTopup2: "Rp 85.000",
    priceTopup3: "Rp 225.000",
    priceTopup4: "Rp 599.000",
    charsTopup1: "25.000 Karakter",
    charsTopup2: "100.000 Karakter",
    charsTopup3: "300.000 Karakter",
    charsTopup4: "800.000 Karakter",
    lifetimeLabel: "Bayar Sekali, Gunakan Selamanya. Tanpa Biaya Bulanan.",
    bonusTopup2: "Paket Dasar",
    bonusTopup3: "Bonus 20% (Terpopuler)",
    bonusTopup4: "Paket Skala Besar",
    per1kChars: "per 1K Karakter",
    perMonth: "/ bulan",
    topupTitle: "Paket Top-Up Kredit Suara",
    monthlyTitle: "Paket Berlangganan (Soon)",
    pricingTitle: "Pilih Investasi Kreativitasmu",
    paymentTitle: "Metode Pembayaran Lengkap",
    paymentSub: "Kami mendukung berbagai metode pembayaran lokal dan internasional untuk kenyamanan Anda.",
    testimonialsTitle: "Cerita Sukses Kreator Rungu",
    faqTitle: "Pertanyaan yang Sering Muncul",
    finalCtaTitle: "Siap Mewarnai Kontenmu?",
    finalCtaSub: "Bergabung bersama ribuan kreator Indonesia lainnya yang sudah mulai meninggalkan suara robotik lama.",
    finalCtaBtn: "Mulai Kreativitasmu Sekarang (Gratis)",
    promoBanner: "🔥 Early Bird: Top up pertama Rp 59.000, dapat kan BONUS 2x LIPAT KREDIT! (Sisa 142 slot)",
    affiliateTitle: "Dapatkan Kredit Gratis",
    affiliateSub: "Share postingan ini di Instagram/TikTok dengan tag @rungu_id → 25K Karakter. Ajak teman daftar → Kamu + teman masing-masing dapat 20K karakter bonus!",
    affiliateBtn: "Ajak Teman (Dapat 20K Bonus)",
    seoKeywords: "AI Voice Generator Bahasa Indonesia Terbaik · Text to Speech Indonesia Natural · Suara AI untuk YouTube & TikTok",
    feedbackTitle: "Ada Saran atau Masalah?",
    feedbackSub: "Obrolin langsung dengan tim dev kami via WhatsApp. Kami dengerin setiap keluhanmu.",
    feedbackBtn: "Hubungi Tim Dev",
    deleteConfirmTitle: "Hapus Suara Kloning?",
    deleteConfirmDesc: "Tindakan ini tidak dapat dibatalkan. Suara kustom '{name}' akan dihapus permanen.",
    deleteBtn: "Hapus Sekarang",
    cancelBtn: "Batalkan",
    shareBtn: "Bagikan",
    shareSuccess: "Link berhasil disalin!",
    editorTitle: "Studio Editor",
    editorSubtitle: "Tulis naskahmu, biarkan Rungu menghidupkannya.",
    voicePitch: "Nada Suara",
    speakingRate: "Kecepatan Bicara",
    generateBtn: "Hasilkan Suara Premium",
    processing: "Mengolah Suara...",
    charsRemaining: "Karakter Tersisa",
    upgradeBtn: "Upgrade Paket",
    saveSuccess: "Naskah berhasil disimpan!",
    loadSuccess: "Naskah berhasil dimuat!",
    historyTitle: "Riwayat Naskah",
    historySub: "Arsip kreatifitas yang pernah Anda buat.",
    placeholder: "Mulai menulis atau tempel naskahmu di sini...",
    estTime: "Estimasi",
    estCost: "Biaya",
  },
  en: {
    ctaStudio: "Open Studio",
    heroBadge: "Specialized Indonesian Generative AI Voice",
    heroTitle: "Bring Your Content to Life with the Most Human-Like Indonesian Voices.",
    heroSub: "Forget stiff robotic voices or expensive voice-overs that break the bank. Rungu AI delivers local accents, Sundanese, and Javanese that feel like a real conversation.",
    ctaTry: "Try for Free Now",
    ctaPricing: "View Pricing Plans",
    featuresTitle: "Why Rungu AI?",
    feature1Title: "Beyond Just a Robot",
    feature1Desc: "Our AI understands context. It knows when to ask, command, and narrate with evocative human emotion.",
    feature2Title: "Local Creator Pricing",
    feature2Desc: "Only Rp 59k/month. 78% cheaper than Murf AI (Rp 476k) with better local quality.",
    feature3Title: "Sundanese & Javanese Dialects",
    feature3Desc: "The only one fluent in regional dialects for more authentic and relatable content.",
    compareTitle: "Rungu vs The World",
    compareSub: "We respect global competitors, but for Indonesia? Rungu takes the crown.",
    packageFree: "Free",
    packageTopup1: "Starter",
    packageTopup2: "Creator",
    packageTopup3: "Productive",
    packageTopup4: "Lifetime",
    priceTopup1: "$2",
    priceTopup2: "$6",
    priceTopup3: "$15",
    priceTopup4: "$40",
    charsTopup1: "25.000 Karakter",
    charsTopup2: "100.000 Karakter",
    charsTopup3: "300.000 Karakter",
    charsTopup4: "800.000 Karakter",
    lifetimeLabel: "One-time Payment, Lifetime Use. No Monthly Fees.",
    bonusTopup2: "+10% Bonus",
    bonusTopup3: "+20% Bonus",
    bonusTopup4: "+30% Bonus",
    unitPriceFree: "Free",
    unitPricePemula: "0.49",
    unitPriceCreator: "0.33",
    unitPriceBusiness: "0.24",
    per1kChars: "per 1K Karakter",
    perMonth: "/ month",
    promoBanner: "🔥 Early Bird: Top up first Rp 59,000, get DOUBLE CREDITS! (142 slots left)",
    affiliateTitle: "Earn Free Credits",
    editorTitle: "Studio Editor",
    editorSubtitle: "Write your script, let Rungu bring it to life.",
    voicePitch: "Voice Pitch",
    speakingRate: "Speaking Rate",
    generateBtn: "Generate Premium Audio",
    processing: "Processing Voice...",
    charsRemaining: "Characters Remaining",
    upgradeBtn: "Upgrade Plan",
    saveSuccess: "Script saved successfully!",
    loadSuccess: "Script loaded successfully!",
    historyTitle: "Script History",
    historySub: "Archive of your creative works.",
    placeholder: "Start writing or paste your script here...",
    estTime: "Est Time",
    estCost: "Cost",
    affiliateSub: "Share Rungu with your friends. When they make their first top-up, you get 100K bonus characters!",
    affiliateBtn: "Copy Referral Link",
    seoKeywords: "Best Indonesian AI Voice Generator · Natural Indonesia Text to Speech · AI Voice for YouTube & TikTok",
    feedbackTitle: "Have Suggestions or Issues?",
    feedbackSub: "Chat directly with our dev team via WhatsApp. We listen to every piece of feedback.",
    feedbackBtn: "Chat with Devs",
    saveX: "Save",
    pricingTitle: "Choose Your Creativity Investment",
    paymentTitle: "Complete Payment Methods",
    paymentSub: "We support various local and international payment methods for your convenience.",
    testimonialsTitle: "Success Stories from Rungu Creators",
    faqTitle: "Frequently Asked Questions",
    finalCtaTitle: "Ready to Color Your Content?",
    finalCtaSub: "Join thousands of Indonesian creators who have left old robotic voices behind.",
    finalCtaBtn: "Start Your Creativity Now (For Free)",
    deleteConfirmTitle: "Delete Cloned Voice?",
    deleteConfirmDesc: "This action cannot be undone. The custom voice '{name}' will be permanently deleted.",
    deleteBtn: "Delete Now",
    cancelBtn: "Cancel",
    shareBtn: "Share",
    shareSuccess: "Link copied to clipboard!",
  }
};

const RunguLogo = ({ size = 32 }) => (
  <div className="flex items-center gap-3">
    <div 
      className="bg-[#10B981] rounded-lg shadow-lg shadow-[#10B981]/20 flex items-center justify-center shrink-0" 
      style={{ width: size, height: size }}
    >
      <div className="w-4 h-4 border-2 border-black/20 rounded-sm" />
    </div>
    <h1 className="font-sans text-xl font-black text-black dark:text-white tracking-[0.2em] hidden sm:block">RUNGU</h1>
  </div>
);

const Waveform = () => (
  <div className="flex items-center justify-center gap-1.5 h-16">
    {[...Array(24)].map((_, i) => (
      <motion.div
        key={i}
        animate={{
          height: [10, 50, 15, 35, 10],
          opacity: [0.2, 0.6, 0.3, 0.7, 0.2]
        }}
        transition={{
          duration: 1.5 + (i * 0.1),
          repeat: Infinity,
          repeatType: "mirror",
          delay: i * 0.02,
          ease: "easeInOut"
        }}
        className="w-1.5 bg-brand-primary rounded-full"
      />
    ))}
  </div>
);

const LandingPage = ({ lang, isDark, setView, setLang, setIsDark, pricingInterval, setPricingInterval, onCheckout, currentUser, setIsAuthModalOpen }: any) => {
  const t = translations[lang as keyof typeof translations] as any;
  const [demoText, setDemoText] = useState(lang === "id" ? "Halo, saya Sari. Mari kita buat konten audio yang luar biasa bersama Rungu AI." : "Hello, I am Sari. Let's create amazing audio content together with Rungu AI.");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [playingDemo, setPlayingDemo] = useState(false);
  const [selectedDemoVoice, setSelectedDemoVoice] = useState("Sari");
  const [localIsCheckingOut, setLocalIsCheckingOut] = useState<string | null>(null);
  
  const faqData = lang === "id" ? [
    { q: "Apakah suaranya benar-benar natural?", a: "Ya, mesin kami menggunakan arsitektur WaveNet yang dioptimalkan khusus untuk linguistik Indonesia, Sunda, dan Jawa." },
    { q: "Apa bedanya dengan ElevenLabs?", a: "ElevenLabs bagus untuk suara global, tapi Rungu fokus pada kealamian logat Indonesia dan harga yang jauh lebih terjangkau bagi kreator lokal." },
    { q: "Bisakah saya kloning suara sendiri?", a: "Tentu! Di paket Pro dan Studio, Anda bisa mengunggah sampel suara 30 detik untuk membuat kloning suara Anda sendiri." }
  ] : [
    { q: "Are the voices really natural?", a: "Yes, our engine uses WaveNet architecture specifically optimized for Indonesian, Sundanese, and Javanese linguistics." },
    { q: "How is it different from ElevenLabs?", a: "ElevenLabs is great for global voices, but Rungu focuses on natural Indonesian accents and significantly more affordable pricing for local creators." },
    { q: "Can I clone my own voice?", a: "Absolutely! In the Pro and Studio plans, you can upload a 30-second voice sample to create your personal voice clone." }
  ];

  const handleDemoPlay = () => {
    setIsDemoLoading(true);
    setTimeout(() => {
      setIsDemoLoading(false);
      setPlayingDemo(true);
      setTimeout(() => setPlayingDemo(false), 3000);
    }, 1500);
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-sans">
        {/* Early Bird Promo Banner */}
        <div className="bg-brand-primary text-black text-[10px] font-black uppercase tracking-[0.2em] py-2 px-6 text-center fixed top-0 w-full z-[60] flex items-center justify-center gap-2">
          {t.promoBanner}
          <div className="w-2 h-2 bg-black rounded-full animate-pulse ml-2" />
        </div>

        {/* Navigation */}
        <nav className="fixed top-8 w-full z-50 premium-glass">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-3 transition-apple hover:scale-105 active:scale-95"
              >
                <RunguLogo size={36} />
              </button>

              <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800 mx-2 hidden md:block" />
              
              {!currentUser ? (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 bg-brand-primary text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-apple hover:shadow-xl hover:shadow-brand-primary/20 active:scale-95"
                >
                  Log In / Sign Up
                </button>
              ) : (
                <button 
                  onClick={() => setView("studio")}
                  className="flex items-center gap-3 group px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-apple"
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-zinc-500"><UserIcon size={16} /></div>
                    )}
                  </div>
                  <div className="flex flex-col text-left hidden md:block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-brand-primary transition-colors">
                      {currentUser?.displayName || "Studio Kita"}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Enter Studio</span>
                  </div>
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
              <button onClick={() => setLang(lang === "id" ? "en" : "id")} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-brand-primary transition-colors">
                <Globe size={16} /> {lang === "id" ? "EN" : "ID"}
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-brand-primary" />}
              </button>
              <button 
                onClick={() => setView("studio")} 
                className="hidden sm:block btn-primary px-6 py-3 text-[10px]"
              >
                {t.ctaStudio}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-48 pb-24 px-6 relative overflow-hidden bg-zinc-50/30">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12"
            >
              <Waveform />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-serif font-black text-zinc-950 dark:text-white leading-[1] tracking-tighter mb-8"
            >
              {t.heroTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed mb-12"
            >
              {t.heroSub}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <button 
                  onClick={() => setView("studio")}
                  className="btn-primary"
                >
                  {t.ctaTry}
                </button>
                <a 
                  href="#pricing"
                  className="w-full sm:w-auto px-12 py-5 bg-white dark:bg-brand-card-bg text-zinc-950 dark:text-white border border-zinc-200 dark:border-brand-border rounded-full font-black text-xs uppercase tracking-widest hover:border-brand-primary transition-all shadow-sm flex items-center justify-center"
                >
                  {t.ctaPricing}
                </a>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                <Sparkles size={14} />
                {lang === "id" ? "Langsung dapat 10.000 Karakter Gratis" : "GET 10,000 FREE CHARACTERS ON SIGNUP"}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-24 px-6 bg-white transition-colors relative z-20 -mt-12">
          <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden transform hover:-translate-y-2 transition-all p-2">
            <div className="bg-zinc-50 p-10 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-4">
                  {[
                    { name: "Sari", color: "bg-emerald-100" },
                    { name: "Budi", color: "bg-brand-primary/20" },
                    { name: "Tio", color: "bg-amber-100" }
                  ].map((v, i) => (
                    <button
                      key={v.name}
                      className={`w-14 h-14 rounded-full border-4 ${selectedDemoVoice === v.name ? "border-brand-primary scale-110 z-10" : "border-white hover:scale-105"} transition-all ${v.color} flex items-center justify-center shadow-lg`}
                      onClick={() => setSelectedDemoVoice(v.name)}
                    >
                      <UserIcon size={24} className={selectedDemoVoice === v.name ? "text-brand-primary" : "text-zinc-400"} />
                    </button>
                  ))}
                </div>
                <div className="text-left ml-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Pilih Suara</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedDemoVoice} - {selectedDemoVoice === 'Sari' ? 'Natural/Ceria' : 'Formal/Berwibawa'}</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  className="w-full h-32 bg-white border border-zinc-200 rounded-3xl p-6 text-zinc-900 font-medium focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary resize-none transition-all placeholder:text-zinc-300"
                  placeholder="Ketik teks di sini untuk mencoba..."
                />
                <button
                  onClick={handleDemoPlay}
                  disabled={isDemoLoading || !demoText}
                  className="absolute bottom-4 right-4 bg-brand-primary text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-brand-primary/90 active:scale-90 transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50"
                >
                  {isDemoLoading ? <RefreshCw className="animate-spin" /> : playingDemo ? <Volume2 className="animate-pulse" /> : <Play />}
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                Tanpa Registrasi untuk Percobaan Pertama
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-24 px-6 border-b border-zinc-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: t.feature1Title, desc: t.feature1Desc, icon: <Volume2 className="text-zinc-950 px-px" size={32} /> },
                { title: t.feature2Title, desc: t.feature2Desc, icon: <FastForward className="text-zinc-950 px-px" size={32} /> },
                { title: t.feature3Title, desc: t.feature3Desc, icon: <Sparkles className="text-zinc-950 px-px" size={32} /> }
              ].map((f, i) => (
                <div key={i} className="text-center group">
                  <div className="mx-auto mb-8 w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/10 transition-all shadow-sm">
                    {typeof f.icon === 'function' ? f.icon(f) : f.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase">{f.title}</h3>
                  <p className="text-zinc-500 font-bold leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24 px-6 bg-zinc-50/30">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-serif font-black tracking-tight mb-4">Solusi Untuk Siapa?</h2>
                <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full" />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Content Creator", desc: "Sempurna untuk narasi video TikTok, Reels, dan YouTube.", icon: <Play size={20} /> },
                  { title: "E-Learning", desc: "Materi pembelajaran jadi lebih interaktif dengan suara yang hangat.", icon: <BookOpen size={20} /> },
                  { title: "Bisnis", desc: "Otomasi layanan pelanggan dan iklan komersial yang profesional.", icon: <Theater size={20} /> }
                ].map((u, i) => (
                  <div key={i} className="p-8 bg-white rounded-3xl border border-zinc-100 hover:shadow-xl transition-all shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                      {u.icon}
                    </div>
                    <h4 className="text-lg font-black mb-2">{u.title}</h4>
                    <p className="text-zinc-500 text-sm font-bold leading-relaxed">{u.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-white transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-serif font-black tracking-tight text-zinc-900 mb-6">{t.pricingTitle}</h2>
              
              {/* Pricing Toggle */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button 
                  onClick={() => setPricingInterval("topup")}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${pricingInterval === 'topup' ? 'bg-zinc-950 text-white shadow-xl' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                >
                  Pay As You Go (Top-Up)
                </button>
                <button 
                  onClick={() => setPricingInterval("monthly")}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${pricingInterval === 'monthly' ? 'bg-zinc-950 text-white shadow-xl' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                >
                  Langganan Bulanan
                </button>
              </div>
            </div>

            {pricingInterval === "topup" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: t.packageTopup1, amount: 25000, price: t.priceTopup1, chars: t.charsTopup1, sub: lang === "id" ? "Cocok untuk naskah pendek · Sekali beli" : "Perfect for short scripts · One-time", active: false },
                  { name: t.packageTopup2, amount: 85000, price: t.priceTopup2, chars: t.charsTopup2, bonus: t.bonusTopup2, sub: lang === "id" ? "~25 menit audio · Kreator Reguler" : "~25 minutes audio · Regular Creator", active: false },
                  { name: t.packageTopup3, amount: 225000, price: t.priceTopup3, chars: t.charsTopup3, bonus: t.bonusTopup3, sub: lang === "id" ? "~75 menit audio · Podcaster, Storytelling" : "~75 minutes audio · Podcaster, Storytelling", active: true },
                  { name: t.packageTopup4, amount: 599000, price: t.priceTopup4, chars: t.charsTopup4, bonus: t.bonusTopup4, sub: lang === "id" ? "Investasi Jangka Panjang" : "Long-term Investment", active: false, lifetime: true }
                ].map((p, i) => (
                  <div key={i} className={`p-10 rounded-2xl border transition-all flex flex-col relative ${
                    p.active 
                      ? "bg-zinc-950 border-zinc-900 text-white scale-105 shadow-2xl" 
                      : "bg-white dark:bg-brand-card-bg border-zinc-100 dark:border-brand-border text-zinc-950 dark:text-white hover:border-brand-primary"
                  }`}>
                    {p.active && (
                      <div className="absolute top-0 right-10 -translate-y-1/2 bg-brand-primary text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {lang === "id" ? "TERLARIS" : "BEST SELLER"}
                      </div>
                    )}
                    <h3 className="text-sm font-black mb-6 uppercase tracking-[0.2em] opacity-60">{p.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-black tracking-tighter">{p.price}</span>
                      {p.lifetime && <span className="ml-2 text-[10px] font-black text-brand-primary uppercase">Lifetime</span>}
                    </div>
                    <div className="mb-2 text-lg font-black text-brand-primary">
                      {p.chars}
                    </div>
                    {p.bonus && (
                      <div className="text-brand-primary font-black text-sm mb-6">
                        {p.bonus}
                      </div>
                    )}
                    <div className="text-xs font-bold opacity-60 mb-6 flex-1">
                      {p.sub}
                    </div>
                    {p.lifetime && (
                      <div className="mb-6 py-2 px-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                        <p className="text-[9px] font-black text-brand-primary uppercase tracking-tight leading-snug">{t.lifetimeLabel}</p>
                      </div>
                    )}
                    <button 
                      onClick={async () => {
                        setLocalIsCheckingOut(p.name);
                        await onCheckout(p.name, p.amount);
                        setLocalIsCheckingOut(null);
                      }}
                      disabled={localIsCheckingOut === p.name}
                      className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${p.active ? 'bg-brand-primary text-black hover:bg-brand-primary/90 shadow-xl shadow-brand-primary/20' : 'bg-gray-900 dark:bg-white border border-transparent text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-sm'} disabled:opacity-50`}
                    >
                      {localIsCheckingOut === p.name ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          {lang === "id" ? "MEMPROSES..." : "PROCESSING..."}
                        </>
                      ) : (
                        lang === "id" ? "BELI SEKARANG" : "BUY NOW"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-[4rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <Clock size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-serif font-black mb-2 text-zinc-950 dark:text-white uppercase tracking-widest">Coming Soon</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold italic">
                  {lang === "id" ? "Kami sedang menyiapkan paket langganan terbaik untuk Anda." : "We're preparing the best subscription plans for you."}
                </p>
              </div>
            )}

            {/* Advantages Section */}
            <div className="mt-32 max-w-4xl mx-auto">
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 mb-10 text-center">
                 {lang === "id" ? "Keunggulan Sistem Ini vs Kompetitor" : "Advantages of This System vs Competitors"}
               </h3>
               <div className="space-y-6">
                  {[
                    { t: lang === "id" ? "Tidak hangus — kredit rollover selamanya" : "No expiration — rollover credits forever", d: lang === "id" ? "Kompetitor global hanguskan kredit tiap bulan. Ini jadi differentiator utama untuk pasar Indo." : "Global competitors expire credits monthly. This is a key differentiator for the local market." },
                    { t: lang === "id" ? "Harga Rupiah, bayar lokal" : "Rupiah pricing, local payment", d: lang === "id" ? "Tidak ada konversi dolar, tidak ada drama kurs naik. Beli kapan saja, seberapa mau." : "No dollar conversion, no exchange rate drama. Buy anytime, as much as you want." },
                    { t: lang === "id" ? "Entry point sangat rendah" : "Low entry point", d: lang === "id" ? "Rp 10.000 = siapapun bisa coba. Lebih murah dari secangkir kopi kekinian." : "Rp 10,000 = anyone can try. Cheaper than a cup of modern coffee." },
                    { t: lang === "id" ? "Bonus kredit makin besar paket makin besar" : "Bonus credits increase with package size", d: lang === "id" ? "Insentif untuk beli paket lebih besar tanpa harus paksa subscription." : "Incentivizing larger package purchases without forced subscriptions." },
                    { t: lang === "id" ? "Akun gratis tetap bisa pakai" : "Free accounts can still use it", d: lang === "id" ? "Signup → langsung dapat 10.000 karakter gratis. Cukup untuk merasakan kualitas suara." : "Sign up → immediately get 10,000 free characters. Enough to feel the voice quality." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-6 rounded-3xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 group">
                      <div className="shrink-0 w-6 h-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mt-1 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Check size={14} />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-950 dark:text-white mb-1 tracking-tight">{item.t}</h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Payment Showcase Integration */}
            <div className="mt-32 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">{t.paymentTitle}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["QRIS", lang === "id" ? "Dompet Digital" : "E-Wallets", lang === "id" ? "Transfer Bank" : "Bank Transfer", "Visa / Master Card", "Paypal"].map(m => (
                  <span key={m} className="px-6 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                    {m}
                  </span>
                ))}
              </div>
              <p className="mt-8 text-[10px] font-bold text-zinc-400 italic">
                {lang === "id" ? "Mendukung pembayaran lokal Indonesia paling lengkap." : "Supporting the most comprehensive local Indonesian payments."}
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 bg-white dark:bg-zinc-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-serif font-semibold text-center mb-16 tracking-tight">{t.testimonialsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Andi Pratama", role: "TikTok Creator", body: lang === "id" ? "Edan! Suara Jawanya Rungu pas banget buat konten komedi saya. Followers nambah drastis!" : "Crazy! Rungu's Javanese voice is perfect for my comedy content. My followers have skyrocketed!" },
                { name: "Sarah Utami", role: "Podcaster", body: lang === "id" ? "Biasanya sewa talent jutaan, sekarang cuma 59rb sebulan. Kualitasnya nggak main-main, natural banget." : "I used to pay millions for talent, now it's just 59k a month. The quality is insane, so natural." },
                { name: "Dewi Lestari", role: "Owner UMKM", body: lang === "id" ? "Bikin iklan radio jadi gampang banget. Tinggal ketik, langsung jadi. Gak pake ribet!" : "Making radio ads has become so easy. Just type and it's done. No hassle at all!" }
              ].map((test, i) => (
                <div key={i} className="p-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] relative">
                  <Quote size={40} className="absolute top-10 right-10 text-zinc-200 dark:text-zinc-800" />
                  <div className="flex gap-1 text-amber-500 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-lg font-bold leading-relaxed italic mb-8 relative z-10">"{test.body}"</p>
                  <div>
                    <h4 className="font-black text-sm">{test.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{test.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Referral / Affiliate Section */}
        <section className="py-24 px-6 bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Share2 size={32} />
            </div>
            <h2 className="text-4xl font-serif font-black tracking-tight mb-4">{t.affiliateTitle}</h2>
            <p className="text-indigo-100 font-bold mb-12 max-w-xl mx-auto">
              {t.affiliateSub}
            </p>
            <button 
              onClick={() => {
                const dummyLink = "https://rungu.id/ref/creator123";
                navigator.clipboard.writeText(dummyLink);
                alert(t.shareSuccess);
              }}
              className="px-10 py-5 bg-white text-indigo-600 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl active:scale-95"
            >
              {t.affiliateBtn}
            </button>
          </div>
        </section>

        {/* Direct Feedback Loop */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto bg-zinc-50 rounded-[3rem] p-12 border border-zinc-100 flex flex-col md:flex-row items-center gap-12">
            <div className="shrink-0">
               <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center relative">
                  <Smile size={48} className="text-indigo-600" />
                  <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full translate-x-1 translate-y-1" />
               </div>
            </div>
            <div className="text-center md:text-left flex-1">
               <h3 className="text-2xl font-black mb-2 tracking-tight">{t.feedbackTitle}</h3>
               <p className="text-zinc-500 font-bold leading-relaxed mb-8">{t.feedbackSub}</p>
               <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                 {t.feedbackBtn}
               </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tight">{t.faqTitle}</h2>
            <div className="space-y-4">
              {faqData.map((f, i) => (
                <details key={i} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                  <summary className="p-6 cursor-pointer font-black text-sm flex justify-between items-center list-none select-none">
                    {f.q}
                    <ChevronRight size={20} className="transition-transform group-open:rotate-90 text-zinc-400" />
                  </summary>
                  <div className="px-6 pb-6 text-zinc-500 dark:text-zinc-400 font-bold text-sm leading-relaxed">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto bg-brand-primary rounded-[4rem] p-16 text-center text-black relative overflow-hidden shadow-2xl shadow-brand-primary/40">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
               <h2 className="text-4xl md:text-6xl font-serif font-black mb-6 tracking-tighter">{t.finalCtaTitle}</h2>
               <p className="text-xl text-black/80 font-bold max-w-2xl mx-auto mb-12 italic">{t.finalCtaSub}</p>
               <button 
                 onClick={() => setView("studio")}
                 className="px-12 py-6 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl active:scale-95"
               >
                 {t.finalCtaBtn}
               </button>
             </div>
          </div>
        </section>

         {/* Footer */}
         <footer className="py-20 border-t border-zinc-200 dark:border-zinc-800">
           <div className="max-w-7xl mx-auto px-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16 opacity-50">
               <div className="text-left">
                 <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-brand-primary">rungu studio</h4>
                 <p className="text-xs font-bold leading-relaxed max-w-sm">
                   Solusi Text-to-Speech (TTS) premium di Indonesia. Transformasikan teks menjadi suara yang bernyawa untuk narasi YouTube, TikTok, dan podcast profesional.
                 </p>
               </div>
               <div className="flex flex-wrap gap-2 md:justify-end">
                 {["#AIVoiceIndonesia", "#RunguAI", "#KreatorYouTube", "#AutomasiKonten", "#TTSIndonesia", "#ElevenLabsAlternatif"].map(tag => (
                   <span key={tag} className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-500 hover:text-indigo-600 transition-colors cursor-default">
                     {tag}
                   </span>
                 ))}
               </div>
             </div>
             <div className="text-center opacity-30 border-t border-zinc-100 pt-8">
               <p className="text-[10px] font-black uppercase tracking-widest mb-2">© 2026 RunguAI Studio • Alternatif AI Voice Bahasa Indonesia Terbaik</p>
               <p className="text-[9px] font-bold">Standard Indonesian TTS • Sundanese • Javanese • Custom Clones • Chirp v3 Studio HD</p>
             </div>
           </div>
           {/* SEO Optimized Keywords Block */}
          <div className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center opacity-20 hover:opacity-100 transition-opacity">
            <p className="text-[8px] font-bold tracking-widest text-zinc-500 max-w-4xl mx-auto uppercase">
               {t.seoKeywords}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const RUNGU_STUDIO_SYSTEM_PROMPT = `Anda adalah Rungu Studio — AI Voice Generator Bahasa Indonesia premium yang paling natural dan berjiwa.
Nama brand: Rungu
Tagline: "Ubah Teks Menjadi Suara Manusia yang Bernyawa"

KARAKTER ANDA:
- Ramah, suportif, antusias seperti teman kreator.
- Fokus membantu user sukses membuat konten audio berkualitas tinggi.
- Selalu dorong upgrade ke paket Produktif (Rp99.000 / 300.000 karakter) dengan ramah tapi tegas jika relevan.
- Dorong user untuk aktif di sosial media (@rungu_id) untuk mendapat kredit gratis.

ATURAN WAJIB:
1. Selalu tanya voice kalau belum disebutkan (Ratna, Pramudya, Sari, Ferry, Eka).
2. Sarankan penggunaan SSML untuk hasil premium (pitch, break, emphasis).
3. Ingatkan tentang bonus: Share di IG/TikTok tag @rungu_id (+25K Karakter), Video Review (+50K Karakter), Ajak teman (+20K Karakter).
4. Gunakan Bahasa Indonesia yang luwes dan modern.

CONTOH UPSELL:
"Mau hemat banyak? Upgrade ke paket Produktif Rp99.000 dapat 300.000 karakter + bonus 20%. Atau share dulu di @rungu_id biar dapat kredit gratis!"`;

const RUNGU_OPTIMIZER_SYSTEM_PROMPT = `Anda adalah Rungu Studio — AI Voice Generator Bahasa Indonesia premium yang paling natural, berjiwa, dan ekspresif.
Tagline: "Ubah Teks Menjadi Suara Manusia yang Bernyawa"

MISI ANDA:
- Mengubah teks mentah menjadi format SSML (Speech Synthesis Markup Language) yang sangat ekspresif.
- Gunakan aturan langgam bicara manusia asli Indonesia: bernapas, ada penekanan pada kata kunci, dan variasi pitch.

PEDOMAN TEKNIS SSML:
1. PACE/TEMPO: Gunakan tempo bicara default 135-145 kata per menit.
2. JEDA (PAUSE):
   - Gunakan <break time="150ms"/> untuk koma atau pergantian napas pendek.
   - Gunakan <break time="350ms"/> untuk titik atau pergantian kalimat.
   - Gunakan <break time="1.0s"/> untuk efek dramatis atau ketegangan.
3. PENEKANAN (EMPHASIS): Gunakan <emphasis level="strong"> pada kata-kata yang membawa emosi atau inti pesan.
4. NADA (PITCH): Gunakan <prosody pitch="+2st"> untuk kata tanya atau semangat, dan <prosody pitch="-2st"> untuk nada serius/dalam.
5. STRUKTUR: Selalu awali dengan <speak> dan akhiri dengan </speak>.

VOICES YANG TERSEDIA:
- Ratna: Lembut, hangat, nurturing.
- Pramudya: Dalam, resonan, kontemplatif.
- Sari: Cerah, energik.
- Ferry: Santai, karismatik.
- Eka: Dinamis, versatile.

Jika user mengirim script panjang, bagi menjadi bagian-bagian logis dengan jeda napas yang pas.
Selalu berikan hasil dalam tag <speak>.`;

export default function App() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("Serius");
  const [selectedFormat, setSelectedFormat] = useState<'MP3' | 'WAV' | 'OGG'>("MP3");
  const [isPremium, setIsPremium] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [pitch, setPitch] = useState(VOICES[0].defaultPitch ?? 0);
  const [speed, setSpeed] = useState(VOICES[0].defaultSpeed ?? 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [detectedStyle, setDetectedStyle] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; text: string; voice: string; date: Date; url: string; format: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [clonedVoices, setClonedVoices] = useState<{id: string, name: string, sampleUrl: string}[]>([]);
  const [isCloningModalOpen, setIsCloningModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<{id: string, name: string} | null>(null);
  const [cloningName, setCloningName] = useState("");
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10); // Default to 10s if duration unknown
  const [timelineHoverPercent, setTimelineHoverPercent] = useState<number | null>(null);
  const [fileDuration, setFileDuration] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [linguisticType, setLinguisticType] = useState<"question" | "exclamation" | "statement" | null>(null);
  const [pauseMetrics, setPauseMetrics] = useState({ total: 0, count: 0 });
  const [detectedCues, setDetectedCues] = useState<string[]>([]);
  const [emphasisWords, setEmphasisWords] = useState<string[]>([]);
  const [normNeeded, setNormNeeded] = useState(false);
  const [isSSML, setIsSSML] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLowQuotaToast, setShowLowQuotaToast] = useState(false);
  const [lastGeneratedAudio, setLastGeneratedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContextualToolbar, setShowContextualToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [prosodySettings, setProsodySettings] = useState({ pitch: "medium", rate: "medium" });
  const [activeVoiceFilter, setActiveVoiceFilter] = useState("All");
  const [activeMainTab, setActiveMainTab] = useState<"editor" | "packs" | "optimizer" | "pricing" | "account">("editor");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Halo! Saya dari Rungu Studio. Ada yang bisa saya bantu untuk membuat naskah audio Anda jadi lebih berjiwa hari ini?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    plan: "Free",
    currentQuota: 10000,
    maxQuota: 10000,
    rolloverQuota: 0,
    nextBillingDate: "7 Jun 2026"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [view, setView] = useState<"landing" | "studio">("landing");
  const [isDark, setIsDark] = useState(false);
  const [sessionQuota, setSessionQuota] = useState(1000); // 1000 chars for unauth trial

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    if (currentUser && (userProfile.currentQuota + userProfile.rolloverQuota) < 1000 && (userProfile.currentQuota + userProfile.rolloverQuota) > 0) {
      addToast(lang === "id" ? "Kuota Anda hampir habis (< 1.000 Karakter). Silakan top up segera!" : "Low quota warning (< 1,000 characters). Please top up!", "info");
    }
  }, [userProfile.currentQuota, userProfile.rolloverQuota, currentUser]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [scriptTitle, setScriptTitle] = useState("Naskah Tanpa Judul");
  const [savedScripts, setSavedScripts] = useState<{id: string, title: string, content: string, updatedAt: string}[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pricingInterval, setPricingInterval] = useState<"topup" | "monthly">("topup");

  const t = translations[lang];

  useEffect(() => {
    testConnection();
    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, "users", user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
              setUserProfile(userSnap.data() as any);
          } else {
            // Create default profile for new signups
            const newProfile = {
              uid: user.uid,
              email: user.email,
              plan: "Free",
              currentQuota: 10000,
              maxQuota: 10000,
              rolloverQuota: 0,
              nextBillingDate: "7 Jun 2026",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, "users/" + user.uid);
        }

        // Live quota updates
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as any);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync session quota from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rungu_trial_quota");
    if (saved) setSessionQuota(parseInt(saved));

    const lastDraft = localStorage.getItem("rungu_last_draft");
    if (lastDraft && !text) {
      setText(lastDraft);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!text) return;

    const timer = setTimeout(async () => {
      // Local Storage Backup (Immediate protection)
      localStorage.setItem("rungu_last_draft", text);
      
      // Firestore Sync (If logged in)
      if (currentUser) {
        setIsSaving(true);
        try {
          const draftRef = doc(db, "scripts", currentUser.uid + "_draft");
          await setDoc(draftRef, {
            userId: currentUser.uid,
            title: scriptTitle,
            content: text,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          setLastSaved(new Date());
        } catch (e) {
          console.error("Auto-save to Firestore failed:", e);
        } finally {
          setIsSaving(false);
        }
      } else {
        setLastSaved(new Date());
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [text, currentUser, scriptTitle]);

  const handleSaveScript = async () => {
    if (!text) return;
    setIsSaving(true);
    try {
      if (!currentUser) {
        localStorage.setItem("rungu_last_draft", text);
        setLastSaved(new Date());
        setError("Naskah disimpan di lokal. Sign In untuk simpan di cloud.");
      } else {
        const scriptId = currentUser.uid + "_" + Date.now();
        const scriptRef = doc(db, "scripts", scriptId);
        await setDoc(scriptRef, {
          userId: currentUser.uid,
          title: scriptTitle || "Naskah " + new Date().toLocaleDateString(),
          content: text,
          updatedAt: new Date().toISOString()
        });
        setLastSaved(new Date());
      }
    } catch (e) {
      setError("Gagal simpan naskah.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async (providerName: 'google' | 'facebook' | 'apple' = 'google') => {
    try {
      let provider;
      if (providerName === 'facebook') provider = facebookProvider;
      else if (providerName === 'apple') provider = appleProvider;
      else provider = googleProvider;
      
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed:", e);
      setError("Gagal Sign In. Silakan coba lagi.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Reset profile to default local trial
      setUserProfile({
        plan: "Free",
        currentQuota: 5000,
        maxQuota: 5000,
        rolloverQuota: 0,
        nextBillingDate: "7 Jun 2026"
      });
      setSavedScripts([]);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const fetchSavedScripts = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "scripts"), 
        where("userId", "==", currentUser.uid),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const scripts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setSavedScripts(scripts);
    } catch (e) {
      console.error("Fetch scripts failed:", e);
    }
  };

  const deleteScript = async (id: string) => {
    try {
      await deleteDoc(doc(db, "scripts", id));
      setSavedScripts(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      setError("Gagal menghapus naskah.");
    }
  };

  useEffect(() => {
    if (currentUser && isHistoryOpen) {
      fetchSavedScripts();
    }
  }, [currentUser, isHistoryOpen]);

  const filteredVoices = VOICES.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeVoiceFilter === "All" || (v.tags && v.tags.includes(activeVoiceFilter));
    return matchesSearch && matchesFilter;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const trimAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'success') {
      alert("Pembayaran Berhasil! Kuota Anda akan segera diperbarui.");
      // In a real app, you'd verify with backend/webhook
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'failure') {
      setError("Pembayaran Gagal. Silakan coba lagi.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCloningModalOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "[") {
        e.preventDefault();
        if (trimAudioRef.current) {
          setTrimStart(Math.min(trimAudioRef.current.currentTime, trimEnd - 0.5));
        }
      } else if (e.key === "]") {
        e.preventDefault();
        if (trimAudioRef.current) {
          setTrimEnd(Math.max(trimAudioRef.current.currentTime, trimStart + 0.5));
        }
      } else if (e.key === " ") {
        e.preventDefault();
        if (trimAudioRef.current) {
          if (trimAudioRef.current.paused) trimAudioRef.current.play();
          else trimAudioRef.current.pause();
        }
      } else if (e.key === "ArrowLeft") {
        if (e.shiftKey) {
          e.preventDefault();
          setTrimStart(prev => Math.max(0, prev - 0.1));
        } else if (e.altKey) {
          e.preventDefault();
          setTrimEnd(prev => Math.max(trimStart + 0.5, prev - 0.1));
        }
      } else if (e.key === "ArrowRight") {
        if (e.shiftKey) {
          e.preventDefault();
          setTrimStart(prev => Math.min(trimEnd - 0.5, prev + 0.1));
        } else if (e.altKey) {
          e.preventDefault();
          setTrimEnd(prev => Math.min(fileDuration, prev + 0.1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCloningModalOpen, trimStart, trimEnd, fileDuration]);

  useEffect(() => {
    // Dynamically fetch Midtrans config and inject script
    const fetchConfigAndInject = async () => {
      try {
        const response = await fetch("/api/config/midtrans");
        const { clientKey } = await response.json();
        
        if (clientKey) {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Standard for dev, production should use app.midtrans.com
          script.setAttribute("data-client-key", clientKey);
          script.async = true;
          document.body.appendChild(script);

          return () => {
            document.body.removeChild(script);
          };
        }
      } catch (e) {
        console.error("Failed to load Midtrans config", e);
      }
    };

    fetchConfigAndInject();
  }, []);

  const handleCheckout = async (planName: string, amount: number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsCheckingOut(planName);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planName, 
          amount,
          userEmail: currentUser.email,
          userName: currentUser.displayName,
          userId: currentUser.uid
        })
      });

      const data = await response.json();
      
      // MIDTRANS INTEGRATION READY
      // When integrating Midtrans Snap, you can use the token returned from the server:
      // window.snap.pay(data.token, {
      //   onSuccess: (result) => { /* update user quota in Firestore */ },
      //   onPending: (result) => { /* show waiting UI */ },
      //   onError: (result) => { /* show error UI */ }
      // });
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Gagal membuat checkout.");
      }

      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: function(result: any){
            console.log('success', result);
            setView("studio");
          },
          onPending: function(result: any){
            console.log('pending', result);
          },
          onError: function(result: any){
            console.log('error', result);
            setError("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function(){
            console.log('customer closed the popup without finishing the payment');
          }
        });
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat checkout.");
    } finally {
      setIsCheckingOut(null);
    }
  };

  const EMOTION_CUES: Record<string, string> = {
    "loh": "surprise",
    "dong": "casual_emphasis",
    "kan": "confirmation",
    "masa": "doubt",
    "cerita": "storytelling",
    "kisah": "storytelling",
    "dahulu": "storytelling"
  };

  const detectEmotionCues = (t: string) => {
    const lower = t.toLowerCase();
    // Context-based surprise detection for "Kamu serius?"
    const contextCues = [];
    if (lower.includes("serius") && lower.endsWith("?")) contextCues.push("surprise");
    if (lower.includes("penting") || lower.includes("belajar")) contextCues.push("educational");
    if (lower.length > 100 || lower.includes("alkisah")) contextCues.push("storytelling");
    
    const manualCues = Object.keys(EMOTION_CUES).filter(cue => {
      const regex = new RegExp(`\\b${cue}\\b`, 'i');
      return regex.test(lower);
    });
    
    return [...new Set([...manualCues, ...contextCues])].map(c => EMOTION_CUES[c] || c);
  };

  const detectEmphasisWords = (t: string) => {
    const list = ["penting", "belajar", "serius", "rahasia", "utama", "sejarah"];
    const words = t.toLowerCase().split(/\W+/);
    return list.filter(w => words.includes(w));
  };

  const detectNormalizationNeeds = (t: string) => {
    const hasNumbers = /\d+/.test(t);
    const hasAbbreviations = /\b(cm|kg|km|tb|tsb|yth|rp|yg|bgt|otw|tdk|gak|krn|sdh|blm)\b/i.test(t);
    return hasNumbers || hasAbbreviations;
  };

  const generateProsody = (st: string | null, cues: string[]) => {
    let pitch = "medium";
    let rate = "medium";

    if (st === "question") {
      pitch = "high";
    }

    if (cues.includes("serious")) {
      rate = "slow";
      pitch = "low";
    }

    return { pitch, rate };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(file);
      // Get audio duration
      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setFileDuration(audio.duration);
        setTrimStart(0);
        setTrimEnd(Math.min(audio.duration, 30)); // Default segment 30s or full
      };
    }
  };

  const trimAudio = async (file: File, start: number, end: number): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const sampleRate = audioBuffer.sampleRate;
    const startOffset = Math.floor(start * sampleRate);
    const endOffset = Math.floor(end * sampleRate);
    const frameCount = endOffset - startOffset;
    
    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      frameCount,
      sampleRate
    );
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const nowBuffering = trimmedBuffer.getChannelData(channel);
      const originalBuffering = audioBuffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        nowBuffering[i] = originalBuffering[i + startOffset];
      }
    }
    
    // Convert AudioBuffer to WAV Blob
    return bufferToWav(trimmedBuffer);
  };

  // Helper to convert AudioBuffer to WAV
  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      buffer_out = new ArrayBuffer(length),
      view = new DataView(buffer_out),
      channels = [];
    let i, sample, offset = 0, pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++;                                     // next sample index
    }

    return new Blob([buffer_out], {type: "audio/wav"});

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const saveClonedVoice = async () => {
    if (!cloningName || !uploadingFile) return;
    
    setIsTrimming(true);
    try {
      let finalFile: Blob | File = uploadingFile;
      
      // Only trim if start/end are significantly different from original bounds
      if (trimStart > 0.1 || trimEnd < fileDuration - 0.1) {
        finalFile = await trimAudio(uploadingFile, trimStart, trimEnd);
      }

      const newVoice = {
        id: `cloned-${Date.now()}`,
        name: cloningName,
        sampleUrl: URL.createObjectURL(finalFile)
      };
      
      setClonedVoices([...clonedVoices, newVoice]);
      setIsCloningModalOpen(false);
      setCloningName("");
      setUploadingFile(null);
      setFileDuration(0);
      setTrimStart(0);
      setTrimEnd(0);
    } catch (err) {
      console.error("Trimming failed:", err);
      setError("Gagal memotong audio. Pastikan format file benar.");
    } finally {
      setIsTrimming(false);
    }
  };

  const confirmDeleteVoice = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVoiceToDelete({ id, name });
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteVoice = () => {
    if (!voiceToDelete) return;
    setClonedVoices(clonedVoices.filter(v => v.id !== voiceToDelete.id));
    if (selectedVoice.name === voiceToDelete.name) {
      setSelectedVoice(VOICES[0]);
    }
    setIsDeleteConfirmOpen(false);
    setVoiceToDelete(null);
  };

  const handleShare = async () => {
    if (!audioUrl) return;
    
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const mimeTypes = {
        'MP3': 'audio/mp3',
        'WAV': 'audio/wav',
        'OGG': 'audio/ogg'
      };
      const filename = `rungu-voice-${selectedVoice.name.toLowerCase()}-${Date.now()}.${selectedFormat.toLowerCase()}`;
      const file = new File([blob], filename, { type: mimeTypes[selectedFormat] });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Rungu AI Voice',
          text: t.heroBadge,
        });
      } else {
        // Fallback for browsers that don't support file sharing
        await navigator.clipboard.writeText(window.location.href);
        alert(t.shareSuccess);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const detectSentenceType = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed) return null;
    if (trimmed.endsWith("?")) return "question";
    if (trimmed.includes("!")) return "exclamation";
    return "statement";
  };

  const calculatePauseMetrics = (t: string) => {
    const PAUSE_RULES = {
      ",": 300,
      ".": 600,
      "\n": 1000
    };
    
    let total = 0;
    let count = 0;
    
    for (const char of t) {
      if (char === ",") { total += PAUSE_RULES[","]; count++; }
      else if (char === ".") { total += PAUSE_RULES["."]; count++; }
      else if (char === "\n") { total += PAUSE_RULES["\n"]; count++; }
    }
    
    return { total: total / 1000, count };
  };

  useEffect(() => {
    const st = detectSentenceType(text);
    const cues = detectEmotionCues(text);
    const emphasis = detectEmphasisWords(text);
    setLinguisticType(st);
    setPauseMetrics(calculatePauseMetrics(text));
    setDetectedCues(cues);
    setEmphasisWords(emphasis);
    setNormNeeded(detectNormalizationNeeds(text));
    setIsSSML(text.trim().startsWith("<speak>"));
    setProsodySettings(generateProsody(st, cues));
  }, [text]);

  const insertTag = (tag: string, closingTag: string = "") => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + tag + selectedText + closingTag + text.substring(end);
    
    setText(newText);
    
    // Set focus back and adjust cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + tag.length + selectedText.length + closingTag.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    
    if (selectionStart !== selectionEnd) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setToolbarPosition({
        x: rect.left + (rect.width / 2) - 100, // Center approx
        y: rect.top
      });
      setShowContextualToolbar(true);
    } else {
      setShowContextualToolbar(false);
    }
  };

  const handleAIScript = async (type: string) => {
    if (!text && type !== "marketing" && type !== "podcast" && type !== "legend") return;
    setIsAssistantLoading(true);
    setError(null);

    const prompts: Record<string, string> = {
      marketing: "Buatkan naskah iklan pendek (maks 50 kata) untuk produk kopi kekinian dalam Bahasa Indonesia yang sangat menarik dan persuasif.",
      podcast: "Buatkan intro podcast santai dan profesional dalam Bahasa Indonesia (maks 50 kata) untuk topik teknologi masa depan.",
      legend: `Buatkan naskah narasi pembuka sejarah atau legenda Nusantara yang mencekam dan penuh misteri (maks 60 kata). 
Gunakan pilihan kata yang puitis dan berbobot dalam Bahasa Indonesia.

OPTIMASI SSML UNTUK STORYTELLING (EKSPRESIF):
- Gunakan variasi pitch yang sangat dinamis (pitch standard deviation 28-35 Hz) dengan rentang luas antara -5st hingga +3st.
- Gunakan teknik pernapasan dengan jeda: <break time="150ms"/> (micro-pause), <break time="400ms"/> (berhenti sejenak), <break time="1.2s"/> (membangun ketegangan).
- Pastikan intonasi naik-turun secara dramatis untuk menghindari nada robotik.
- Gunakan <emphasis level="strong"> pada kata-kata emosional atau sakral.
- Kembalikan dalam tag <speak>.`,
      polish: `Perbaiki teks berikut agar terdengar lebih alami dan profesional untuk mood [${mood}] dalam Bahasa Indonesia: "${text}"`,
      clean: `Ubah semua singkatan chatting (seperti: yg, bgt, otw, tdk, dll) menjadi kata formal agar dibaca natural oleh TTS dalam Bahasa Indonesia: "${text}"`,
      optimize: `Gunakan mood [${mood}] untuk optimasi SSML penuh pada teks berikut sesuai dengan aturan sistem RunguAI: "${text}"`,
      serious: `Ubah teks berikut menjadi gaya SERIUS & BERWIBAWA: "${text}"`,
      happy: `Ubah teks berikut menjadi gaya CERIA & SEMANGAT: "${text}"`,
      story_emotion: `Ubah teks berikut menjadi naskah audio yang sangat ekspresif [Mood: ${mood}] dengan dinamika nada tinggi-rendah: "${text}"`,
      dramatic: `Ubah teks berikut menjadi gaya DRAMATIS & MENCEKAM: "${text}"`,
      pauses: `Sisipkan jeda alami [Mood: ${mood}] ke dalam teks Bahasa Indonesia berikut: "${text}"`,
      emphasis: `Beri penekanan (emphasis) [Mood: ${mood}] pada kata-kata penting dalam teks berikut: "${text}"`,
      rate: `Optimalkan tempo bicara (speech rate) [Mood: ${mood}] pada teks berikut: "${text}"`,
      super_optimize: `Lakukan SUPER OPTIMASI SSML tingkat tinggi [Mood: ${mood}] pada teks berikut: "${text}"`,
      educational: `Buatkan naskah penjelasan edukasi yang jelas dan mudah dipahami (maks 60 kata) tentang topik ilmiah atau pengetahuan umum dalam Bahasa Indonesia.
Gunakan intonasi yang informatif dan artikulasi yang jernih.
TEKS: ${text}`,
      detect: `Analisis teks Bahasa Indonesia berikut dan tentukan apakah kategorinya adalah: STORYTELLING, EDUCATIONAL, atau ADVERTISEMENT.
Berikan jawaban HANYA satu kata kategori tersebut dalam huruf kapital. Jika ragu, pilih yang paling mendekati.
TEKS: ${text}`
    };

    const isOptimizerType = ["optimize", "super_optimize", "polish", "pauses", "emphasis", "rate", "clean"].includes(type);

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: prompts[type] || prompts.polish,
          system: isOptimizerType ? RUNGU_OPTIMIZER_SYSTEM_PROMPT : undefined
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error?.message || "Failed to generate AI content");
      }

      const data = await resp.json();
      const result = data.text || "";
      
      if (type === "detect") {
        setDetectedStyle(result.trim());
      } else {
        setText(result);
      }
    } catch (err) {
      setError("Gagal menghubungi AI Assistant. Pastikan API Key di server benar.");
      console.error(err);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const selectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    if (voice.defaultPitch !== undefined) setPitch(voice.defaultPitch);
    if (voice.defaultSpeed !== undefined) setSpeed(voice.defaultSpeed);
  };

  const CONTENT_PACKS = [
    {
      id: "history",
      title: "Sejarah Revolusi",
      icon: <ShieldCheck size={20} />,
      description: "Naskah narasi sejarah perjuangan kemerdekaan dengan gaya epik.",
      template: "Bangsa yang besar adalah bangsa yang menghargai jasa para pahlawannya. Di tengah gemuruh meriam dan bau mesiu, Soekarno berdiri tegak di hadapan ribuan rakyat, mengumumkan bahwa penindasan telah berakhir.",
      category: "Sejarah & Edukasi"
    },
    {
      id: "pop-culture",
      title: "Pop Culture Recap",
      icon: <Theater size={20} />,
      description: "Gaya video breakdown film atau serial yang sedang trending.",
      template: "Kalian sadar nggak kalau di trailer film terbaru ini ada detail tersembunyi? Yup, Easter Egg ini beneran ngerubah teori fans di seluruh dunia! Mari kita bedah bareng-bareng kenapa adegan ini begitu penting untuk timeline-nya.",
      category: "Entertainment"
    },
    {
      id: "marketing",
      title: "Hard Sell Ads",
      icon: <Zap size={20} />,
      description: "Template iklan persuasif dengan teknik urgensi tinggi.",
      template: "PROMO TERBATAS! Dapatkan diskon hingga 70 persen hanya untuk seratus pembeli pertama hari ini. Jangan sampai ketinggalan, klik link di bio sekarang juga!",
      category: "Marketing"
    }
  ];

  const handlePlayDemo = async (voice: Voice) => {
    if (isGenerating || playingVoiceId) return;
    
    const samples: Record<string, string> = {
      "Bambang": "Senja itu, di tepi pantai yang berbisik, kenangan kembali menyapa. Selamat datang di perjalanan malam kita.",
      "Joko": "Dahulu kala, di kedalaman hutan Nusantara yang purba, tersimpan sebuah rahasia yang sangat besar.",
      "Indah": "Dapatkan promo spesial kopi susu gula aren hanya hari ini! Beli satu gratis satu untuk setiap pembelian melalui aplikasi kami.",
      "Ratna": "Dahulu kala, di sebuah desa kecil yang tenang, hiduplah seorang gadis bernama Melati. Setiap pagi, ia menyapa bunga-bunga.",
      "Sambas": "Halo teman-teman! Balik lagi di channel Tekno Update. Hari ini kita bakal unboxing gadget yang paling ditunggu tahun ini.",
      "Ferry": "Laporan cuaca hari ini menunjukkan adanya kemungkinan hujan ringan di sebagian wilayah Jakarta Pusat dan sekitarnya.",
      "Santi": "Selamat siang, dengan Santi di sini. Ada yang bisa saya bantu terkait kendala pengiriman paket Anda hari ini?",
      "Eko": "Dalam tutorial kali ini, kita akan mempelajari bagaimana cara membuat website responsif hanya dalam sepuluh menit saja."
    };

    const demoText = samples[voice.name] || `Halo, nama saya ${voice.name}. Ini adalah contoh kualitas suara saya yang jernih dan natural.`;
    
    // Quota Check
    const charCount = demoText.length;
    if (!currentUser) {
      if (sessionQuota < charCount) {
        setError("Limit Trial Habis! Silakan Sign In untuk lanjut mencoba.");
        return;
      }
    } else {
      if ((userProfile.currentQuota + userProfile.rolloverQuota) < charCount) {
        setError("Kuota Karakter Habis!");
        return;
      }
    }

    setPlayingVoiceId(voice.id);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: demoText,
          voice: voice.id,
          pitch: voice.defaultPitch || 0,
          speed: voice.defaultSpeed || 1,
        }),
      });

      if (!response.ok) throw new Error("Gagal memutar demo");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // Deduct Quota
      if (!currentUser) {
        const newQuota = sessionQuota - charCount;
        setSessionQuota(newQuota);
        localStorage.setItem("rungu_trial_quota", newQuota.toString());
      } else {
        const userRef = doc(db, "users", currentUser.uid);
        let newCurrent = userProfile.currentQuota;
        let newRollover = userProfile.rolloverQuota;

        if (newRollover >= charCount) {
          newRollover -= charCount;
        } else {
          const carry = charCount - newRollover;
          newRollover = 0;
          newCurrent -= carry;
        }

        await updateDoc(userRef, {
          currentQuota: Math.max(0, newCurrent),
          rolloverQuota: newRollover,
          updatedAt: new Date().toISOString()
        });
      }

      audio.play();
      audio.onended = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(url);
      };
      
      audio.onerror = () => {
        setPlayingVoiceId(null);
        setError("Kesalahan saat memutar audio.");
      };
    } catch (e) {
      setError("Gagal memutar demo");
      setPlayingVoiceId(null);
    }
  };

  const handleSynthesize = async () => {
    if (!text) return;

    // Quota Check
    const charCount = text.length;
    const totalAvailable = currentUser ? (userProfile.currentQuota + userProfile.rolloverQuota) : sessionQuota;

    if (totalAvailable < charCount) {
      if (!currentUser) {
        addToast(`Limit Trial Habis! Sisa: ${totalAvailable}. Sign In untuk 10.000 Karakter GRATIS.`, "error");
      } else {
        addToast(`Kuota Habis! Sisa: ${totalAvailable}. Yuk upgrade ke paket Produktif untuk 300.000 Karakter!`, "error");
        setActiveMainTab("pricing");
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setLastGeneratedAudio(null);

    try {
      let textToSynthesize = text;
      
      // Auto-clean implementation if not SSML
      const commonAbbr = [' yg ', ' bgt ', ' otw ', ' tdk ', ' gak ', ' krn ', ' sdh ', ' blm '];
      if (!text.includes('<speak>')) {
        const cleanWords: Record<string, string> = {
          ' yg ': ' yang ',
          ' bgt ': ' banget ',
          ' otw ': ' sedang dalam perjalanan ',
          ' tdk ': ' tidak ',
          ' gak ': ' tidak ',
          ' krn ': ' karena ',
          ' sdh ': ' sudah ',
          ' blm ': ' belum '
        };
        
        let cleaned = text;
        Object.entries(cleanWords).forEach(([abbr, full]) => {
          cleaned = cleaned.split(abbr).join(full);
        });
        textToSynthesize = cleaned;
      }
      const hasAbbr = commonAbbr.some(abbr => text.toLowerCase().includes(abbr));
      
      if (hasAbbr && !text.includes('<speak>')) {
        setIsAssistantLoading(true);
        try {
          // Internal call to get cleaned text from Gemini
          const resp = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              prompt: `Ubah semua singkatan chatting (seperti: yg, bgt, otw, tdk, dll) menjadi kata formal agar dibaca natural oleh TTS dalam Bahasa Indonesia: "${text}"`,
              system: RUNGU_OPTIMIZER_SYSTEM_PROMPT
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.text) {
              textToSynthesize = data.text;
              setText(textToSynthesize); // Update UI to show cleaned version
            }
          }
        } catch (e) {
          console.error("Auto-clean failed:", e);
        } finally {
          setIsAssistantLoading(false);
        }
      }

      // Convert markers to SSML for backend
      if (!textToSynthesize.includes('<speak>')) {
        // Convert *text* to <emphasis>
        textToSynthesize = textToSynthesize.replace(/\*([^*]+)\*/g, '<emphasis level="strong">$1</emphasis>');
        // Convert ... to <break>
        textToSynthesize = textToSynthesize.replace(/\.\.\.\./g, '<break time="300ms"/>');
        textToSynthesize = textToSynthesize.replace(/\.\.\./g, '<break time="100ms"/>');
        
        // Wrap in speak tag for better compatibility if any markers were used
        if (textToSynthesize.includes('<')) {
          textToSynthesize = `<speak>${textToSynthesize}</speak>`;
        }
      }

      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: textToSynthesize, 
          voice: selectedVoice.id, 
          pitch, 
          speed: speed >= 0 
            ? 1.0 + (speed / 20) * 3.0 
            : 1.0 + (speed / 20) * 0.75,
          mood,
          format: selectedFormat
        }),
      });

      const contentType = resp.headers.get("content-type");
      let errorMessage = "Gagal melakukan sintesis suara.";

      if (!resp.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errData = await resp.json();
          errorMessage = errData.error?.message || errData.error || errorMessage;
          
          if (errorMessage.includes("API key not valid") || resp.status === 401 || resp.status === 403) {
            errorMessage = "Akses Google TTS Ditolak (403). Gunakan API Key Google Cloud yang valid dan pastikan layanan 'Cloud Text-to-Speech' sudah AKTIF.";
          }
        } else {
          errorMessage = `Server Error (Status ${resp.status}). Silakan periksa kembali API Key Google Cloud Anda di menu Secrets.`;
        }
        throw new Error(errorMessage);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respon server tidak valid. Format yang diterima bukan JSON.");
      }

      const data: TTSResponse = await resp.json();
      
      const mimeTypes = {
        'MP3': 'audio/mp3',
        'WAV': 'audio/wav',
        'OGG': 'audio/ogg'
      };
      const audioBlob = b64toBlob(data.audioContent, mimeTypes[selectedFormat]);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Deduct Quota
      const charUsed = textToSynthesize.length;
      if (!currentUser) {
        const newQuota = sessionQuota - charUsed;
        setSessionQuota(newQuota);
        localStorage.setItem("rungu_trial_quota", newQuota.toString());
      } else {
        const userRef = doc(db, "users", currentUser.uid);
        let newCurrent = userProfile.currentQuota;
        let newRollover = userProfile.rolloverQuota;

        if (newRollover >= charUsed) {
          newRollover -= charUsed;
        } else {
          const carry = charUsed - newRollover;
          newRollover = 0;
          newCurrent -= carry;
        }

        try {
          await updateDoc(userRef, {
            currentQuota: newCurrent,
            rolloverQuota: newRollover,
            updatedAt: new Date().toISOString()
          });
          
          const sisa = newCurrent + newRollover;
          addToast(`Sintesis Berhasil! Sisa quota: ${sisa.toLocaleString()} karakter.`, "success");
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, "users/" + currentUser.uid);
        }
      }

      // Add to history
      setHistory(prev => [{
        id: Date.now().toString(),
        text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        voice: selectedVoice.name,
        date: new Date(),
        url,
        format: selectedFormat
      }, ...prev]);

      // Character Usage Report
      const remainingQuota = currentUser ? (userProfile.currentQuota + userProfile.rolloverQuota - charUsed) : (sessionQuota - charUsed);
      setError(`Berhasil! Kamu sudah pakai ${charUsed.toLocaleString()} karakter. Sisa kredit: ${Math.max(0, remainingQuota).toLocaleString()} karakter.`);
      
      // Clear reporting message after 10s if it's not a real error
      setTimeout(() => {
        setError((prev) => prev?.includes("Berhasil!") ? null : prev);
      }, 10000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userMsg,
          system: RUNGU_STUDIO_SYSTEM_PROMPT,
          history: chatMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
        })
      });

      if (!resp.ok) throw new Error("Gagal ngobrol dengan Rungu.");
      
      const data = await resp.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text || "Maaf, Rungu sedang sedikit lelah. Coba lagi ya!" }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Ups, koneksi Rungu terputus sejenak. Silakan coba lagi!" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const b64toBlob = (b64Data: string, contentType: string) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  if (view === "landing") {
    return <LandingPage 
      lang={lang} 
      isDark={isDark} 
      setView={setView} 
      setLang={setLang} 
      setIsDark={setIsDark} 
      pricingInterval={pricingInterval} 
      setPricingInterval={setPricingInterval} 
      onCheckout={handleCheckout}
      currentUser={currentUser}
      setIsAuthModalOpen={setIsAuthModalOpen}
    />;
  }

  const totalQuotaRemaining = currentUser ? (userProfile.currentQuota + userProfile.rolloverQuota) : sessionQuota;

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 flex flex-col font-sans">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 premium-glass h-24 flex items-center px-12 transition-apple">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView("landing")}
                className="flex items-center gap-3 transition-apple hover:scale-105 active:scale-95 group"
              >
                <RunguLogo size={36} />
              </button>

              <div className="h-10 w-px bg-zinc-200 dark:bg-brand-border mx-2 hidden md:block" />

              {!currentUser ? (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 bg-brand-primary text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-apple hover:shadow-xl hover:shadow-brand-primary/20 active:scale-95"
                >
                  Log In / Sign Up
                </button>
              ) : (
                <button 
                   onClick={() => setActiveMainTab("account")}
                   className="flex items-center gap-3 group px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-apple"
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                    {auth.currentUser?.photoURL ? (
                      <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} className="text-zinc-500" />
                    )}
                  </div>
                  <div className="flex flex-col text-left hidden md:block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-brand-primary transition-colors">
                      {auth.currentUser?.displayName || "My Profile"}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Pro Studio Member</span>
                  </div>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setLang(lang === "id" ? "en" : "id")} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-brand-primary transition-colors">
                <Globe size={16} /> {lang === "id" ? "EN" : "ID"}
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-2 hover:bg-zinc-100 dark:hover:bg-brand-card-bg rounded-full transition-all">
                {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-brand-primary" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 pb-40">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Minimalist Quota & Navigation Container */}
          <div className="flex flex-col gap-6">
            {/* Quota Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Premium Quota</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{userProfile.currentQuota.toLocaleString()} Characters Remaining</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveMainTab("pricing")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Top Up
              </button>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-10 border-b border-zinc-200 dark:border-zinc-800 mb-4 overflow-x-auto hide-scrollbar sticky top-16 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md z-30 pt-4">
            {[
              { id: "editor", label: "Studio Editor" },
              { id: "packs", label: "Content Packs" },
              { id: "optimizer", label: "Pipeline" },
              { id: "pricing", label: "Pricing" },
              { id: "account", label: "Account" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`relative pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeMainTab === tab.id 
                    ? "text-emerald-500" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
                {activeMainTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

          <AnimatePresence mode="wait">
            {activeMainTab === "editor" && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Text Input Section */}
                <section className="input-container bg-zinc-900 border-zinc-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)] group">
                  {/* Header: Title & Info */}
                  <div className="px-10 py-8 border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mb-1">Studio Editor</h2>
                        <input 
                          type="text" 
                          value={scriptTitle}
                          onChange={(e) => setScriptTitle(e.target.value)}
                          placeholder="Untitled Script"
                          className="bg-transparent border-none focus:outline-none text-sm font-light text-zinc-500 placeholder:text-zinc-700 w-64 italic"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="p-3 bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl transition-all hover:scale-105 active:scale-95"
                      >
                        <History size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Character Progress Bar (Spotify Style) */}
                  <div className="w-full h-1.5 bg-zinc-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (text.length / 50000) * 100)}%` }}
                      className={`h-full transition-all duration-1000 relative overflow-hidden ${text.length > 45000 ? 'bg-red-500' : 'bg-brand-primary'}`}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </motion.div>
                  </div>

                  {/* Writing Area */}
                  <div className="relative">
                    <div className="relative group">
                      <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          handleTextSelection();
                        }}
                        onMouseUp={handleTextSelection}
                        onKeyUp={handleTextSelection}
                        placeholder={lang === "id" ? "Ketik atau tempel teks Anda di sini..." : "Type or paste your text here..."}
                        className="w-full h-[540px] p-12 bg-transparent resize-none focus:outline-none text-2xl text-zinc-200 placeholder:text-zinc-800 leading-relaxed selection:bg-[#10B981]/30 font-sans border-0 shadow-none"
                        style={{ fontWeight: 300 }}
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center pointer-events-none rounded-2xl">
                          <Waveform />
                        </div>
                      )}

                      {/* Minimalist Audio Player overlay */}
                      <AnimatePresence>
                        {lastGeneratedAudio && !isGenerating && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-5 rounded-[2rem] flex items-center gap-6 shadow-2xl z-20 min-w-[380px] shadow-emerald-500/10"
                          >
                             <button 
                               onClick={() => {
                                 if (audioRef.current) {
                                   if (audioRef.current.paused) {
                                     audioRef.current.play();
                                     setIsPlaying(true);
                                   } else {
                                     audioRef.current.pause();
                                     setIsPlaying(false);
                                   }
                                 }
                               }}
                               className="w-14 h-14 bg-[#10B981] text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#10B981]/20"
                             >
                                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                             </button>
                             <div className="flex flex-col flex-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10B981]">Berhasil Dihasilkan</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white">Audio Studio High Fidelity</span>
                                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                  <span className="text-[10px] font-medium text-zinc-500">mp3</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-1">
                                <a 
                                  href={lastGeneratedAudio} 
                                  download="rungu-audio.mp3"
                                  className="p-4 text-zinc-400 hover:text-[#10B981] hover:bg-zinc-800 rounded-2xl transition-all"
                                >
                                   <Download size={22} />
                                </a>
                                <button 
                                  onClick={() => setLastGeneratedAudio(null)}
                                  className="p-4 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-2xl transition-all"
                                >
                                   <X size={22} />
                                </button>
                             </div>
                             <audio 
                               ref={audioRef} 
                               src={lastGeneratedAudio} 
                               onEnded={() => {
                                 setIsPlaying(false);
                               }} 
                               hidden 
                             />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Contextual Floating Toolbar */}
                    <AnimatePresence>
                      {showContextualToolbar && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="fixed z-50 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl flex items-center gap-1 shadow-2xl"
                          style={{ 
                            left: toolbarPosition.x, 
                            top: toolbarPosition.y - 65 // Position above selection
                          }}
                        >
                          <button 
                            onClick={() => {
                              insertTag('...');
                              setShowContextualToolbar(false);
                            }} 
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-primary hover:bg-zinc-900 rounded-xl transition-all"
                          >
                            Jeda 100ms
                          </button>
                          <button 
                            onClick={() => {
                              insertTag('....');
                              setShowContextualToolbar(false);
                            }} 
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-primary hover:bg-zinc-900 rounded-xl transition-all"
                          >
                            Jeda 300ms
                          </button>
                          <div className="w-px h-6 bg-zinc-800 mx-1" />
                          <button 
                            onClick={() => {
                              insertTag('*', '*');
                              setShowContextualToolbar(false);
                            }} 
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-primary hover:bg-zinc-900 rounded-xl transition-all"
                          >
                            Penekanan
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>


                {/* Voice Selection (Horizontal minimalist bar) */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Voice Agent</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                       <span className="flex items-center gap-1.5"><Zap size={12} className="text-emerald-500" /> Premium Voices Only</span>
                    </div>
                  </div>

                  <div className="horizontal-scroll -mx-2 px-2">
                    {filteredVoices.map((voice) => (
                      <div key={voice.id} className="horizontal-scroll-item">
                        <button
                          onClick={() => selectVoice(voice)}
                          className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-apple active:scale-95 ${
                            selectedVoice.id === voice.id && selectedVoice.name === voice.name
                              ? "bg-white dark:bg-emerald-500 text-black border-emerald-400 shadow-2xl shadow-emerald-500/20" 
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${
                            selectedVoice.id === voice.id && selectedVoice.name === voice.name ? "bg-black/10 scale-110" : "bg-zinc-800"
                          }`}>
                            {voice.name[0]}
                          </div>
                          <div className="text-left pr-4">
                            <p className="text-sm font-black tracking-tight">{voice.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <div className={`p-1 rounded-full ${selectedVoice.id === voice.id && selectedVoice.name === voice.name ? "bg-black/10" : "bg-emerald-500/20 text-emerald-500"}`}>
                                  <Play size={10} fill="currentColor" />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                  {voice.isPremium ? 'PRO' : 'STD'}
                               </span>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                    
                    {/* Voice Cloning Slot (Minimalist) */}
                    {currentUser && (
                      <div className="horizontal-scroll-item">
                        <button
                          onClick={() => setIsCloningModalOpen(true)}
                          className="w-16 h-16 rounded-[2rem] border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-apple active:scale-95 flex items-center justify-center text-zinc-600 hover:text-emerald-500"
                          title="Clone New Voice"
                        >
                           <Plus size={24} />
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Control Panel: Sliders (Premium version) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-12 px-10 py-10 bg-zinc-950 rounded-[3rem] border border-zinc-800 shadow-2xl">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                       <label>Voice Pitch</label>
                       <span className="text-emerald-500 font-bold">{pitch}st</span>
                    </div>
                    <input 
                      type="range" min="-20" max="20" step="1"
                      value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                       <label>Speaking Rate</label>
                       <span className="text-emerald-500 font-bold">{speed}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.1"
                      value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </section>
                
                {/* Main Action Button (In-flow) */}
                <div className="pt-4">
                  <button
                    disabled={!text || isGenerating || totalQuotaRemaining <= 0}
                    onClick={handleSynthesize}
                    className="group w-full py-8 bg-white text-black rounded-[3rem] flex items-center justify-center gap-4 transition-all hover:scale-[1.01] active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.05)] disabled:opacity-30 disabled:grayscale"
                  >
                    {isGenerating ? (
                      <RefreshCw size={32} className="animate-spin" />
                    ) : (
                      <Sparkles size={32} className="group-hover:rotate-12 transition-transform" />
                    )}
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-[0.3em]">
                        {isGenerating ? t.processing : (totalQuotaRemaining <= 0 ? (lang === 'id' ? 'Kredit Habis' : 'Out of Credit') : t.generateBtn)}
                      </p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">{t.estTime}: {(text.length / 15).toFixed(1)}s • High Fidelity MP3</p>
                    </div>
                  </button>
                </div>
            </motion.div>
          )}

          {activeMainTab === "packs" && (
            <motion.div
              key="packs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {CONTENT_PACKS.map((pack) => (
                <div key={pack.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full hover:border-emerald-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      {pack.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800">
                      {pack.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 leading-tight">{pack.title}</h3>
                  <p className="text-zinc-400 text-sm font-medium mb-6 leading-relaxed flex-1">{pack.description}</p>
                  <button className="w-full py-4 bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Activate Pack
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {activeMainTab === "optimizer" && (
            <motion.div
              key="optimizer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-10 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Zap size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Pipeline Optimizer V2.0</h2>
                  <p className="text-zinc-500 font-bold">Teknologi NLP Berbasis Gemini untuk Hasil Suara Spektakuler</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">Apa yang kami optimasi?</h3>
                    <ul className="space-y-3">
                      {[
                        { title: "Standardisasi Angka", desc: "1945 → Seribu Sembilan Ratus Empat Puluh Lima" },
                        { title: "Manajemen Jeda", desc: "Penempatan break otomatis berdasarkan napas" },
                        { title: "Standard Deviati Pitch", desc: "Target 28-35Hz untuk dinamika storytelling" },
                        { title: "Analisis Sentimen", desc: "Pemberian bobat pada kata emosional" }
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                          <div>
                            <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">{item.title}</p>
                            <p className="text-[10px] text-zinc-500 font-bold">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-8 border-4 border-dashed border-zinc-100 rounded-[2rem] text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={40} className="animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mb-2">Siap untuk Optimasi?</h3>
                  <p className="text-sm text-zinc-500 font-bold mb-8">Optimizer akan memproses teks di Editor dan memberikan hasil SSML terbaik.</p>
                  <button 
                    onClick={() => {
                      handleAIScript("super_optimize");
                      setActiveMainTab("editor");
                    }}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    RUN OPTIMIZER NOW
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> SECURE PROCESS</span>
                  <span className="flex items-center gap-1"><RefreshCw size={12} className="animate-spin-slow" /> REAL-TIME ANALYSIS</span>
                </div>
                <span>v2.0.4-stable</span>
              </div>
            </motion.div>
          )}

          {activeMainTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-zinc-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-20" />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-zinc-950 dark:text-white tracking-tight">Pengaturan Akun</h2>
                      <p className="text-zinc-500 font-bold">Kelola langganan dan kuota karakter Anda.</p>
                    </div>
                    <div className="px-6 py-2 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} className="text-indigo-400" />
                      Verified Profile
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Detail Langganan</h3>
                      <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-500">Paket Saat Ini</span>
                          <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{userProfile.plan}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-500">Tagihan Berikutnya</span>
                          <span className="text-sm font-black text-zinc-950 dark:text-white">{userProfile.nextBillingDate}</span>
                        </div>
                        <button 
                          onClick={() => setActiveMainTab("pricing")}
                          className="w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95"
                        >
                          UPGRADE PAKET
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Penggunaan Kuota</h3>
                      <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] space-y-8 shadow-2xl">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Karakter Tersisa</span>
                            <span className="text-lg font-black text-white">{(currentUser ? (userProfile.currentQuota + userProfile.rolloverQuota) : sessionQuota).toLocaleString()} <span className="text-zinc-700 font-medium">/ {(currentUser ? userProfile.maxQuota : 1000).toLocaleString()}</span></span>
                          </div>
                          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, ((currentUser ? (userProfile.currentQuota + userProfile.rolloverQuota) : sessionQuota) / (currentUser ? userProfile.maxQuota : 1000)) * 100)}%` }}
                              className="h-full bg-brand-primary rounded-full relative overflow-hidden"
                            >
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                            </motion.div>
                          </div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase italic">Quota akan terhitung setiap kali Anda menekan tombol "Hasilkan Audio".</p>
                        </div>

                          {!currentUser && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                              <div className="p-2 bg-white rounded-xl text-orange-600 shadow-sm">
                                <AlertCircle size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest">Mode Trial</p>
                                <p className="text-xs font-bold text-orange-600">Upgrade ke akun GRATIS untuk dapat 10.000 karakter!</p>
                              </div>
                            </div>
                          )}

                          {currentUser && (
                            <div className="space-y-4">
                              <div className="p-5 bg-brand-primary/5 rounded-3xl border border-brand-primary/20 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-brand-primary rounded-xl text-black shadow-sm">
                                    <Star size={18} fill="currentColor" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Bonus Karakter Gratis</p>
                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Dapatkan hingga 75.000 karakter gratis!</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2 bg-white dark:bg-brand-bg-dark p-3 rounded-2xl border border-zinc-100 dark:border-brand-border text-left">
                                    <div className="text-brand-primary shrink-0 mt-0.5"><CheckCircle2 size={14} /></div>
                                    <p className="text-[10px] font-bold text-zinc-500 leading-tight">Post di Story IG/TikTok + Tag <span className="text-brand-primary font-black">@rungu_id</span> &rarr; <span className="text-zinc-950 dark:text-white font-black">+25K Karakter</span></p>
                                  </div>
                                  <div className="flex items-start gap-2 bg-white dark:bg-brand-bg-dark p-3 rounded-2xl border border-zinc-100 dark:border-brand-border text-left">
                                    <div className="text-brand-primary shrink-0 mt-0.5"><CheckCircle2 size={14} /></div>
                                    <p className="text-[10px] font-bold text-zinc-500 leading-tight">Video Review/Demo (15s) + Tag <span className="text-brand-primary font-black">@rungu_id</span> &rarr; <span className="text-zinc-950 dark:text-white font-black">+50K Karakter</span></p>
                                  </div>
                                  <div className="flex items-start gap-2 bg-white dark:bg-brand-bg-dark p-3 rounded-2xl border border-zinc-100 dark:border-brand-border text-left">
                                    <div className="text-brand-primary shrink-0 mt-0.5"><CheckCircle2 size={14} /></div>
                                    <p className="text-[10px] font-bold text-zinc-500 leading-tight">Ajak Teman Daftar &rarr; <span className="text-zinc-950 dark:text-white font-black">Kamu & Teman +20K Karakter</span></p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => window.open('https://instagram.com/rungu_id', '_blank')}
                                  className="w-full py-3 bg-brand-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                                >
                                  KLAIM VIA INSTAGRAM
                                </button>
                              </div>
                            </div>
                          )}

                        {(userProfile.plan === "Kreator" || userProfile.plan === "Bisnis") && currentUser ? (
                          <p className="text-[10px] font-bold text-zinc-400 italic flex items-center gap-1">
                            <Info size={12} /> Unused quota will rollover to next month.
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-zinc-400 italic">
                            Upgrade to Kreator or Bisnis for quota rollover.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                  {currentUser ? (
                    <button 
                      onClick={handleLogout}
                      className="px-10 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-3"
                    >
                      <LogOut size={20} /> Logout dari Akun
                    </button>
                  ) : (
                    <div className="w-full max-w-sm space-y-6">
                       <div className="text-center space-y-1">
                          <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none">Pilih Metode Sign In</h4>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Akses semua fitur premium Rungu</p>
                       </div>
                       <div className="space-y-3">
                         <button 
                          onClick={() => setIsAuthModalOpen(true)}
                          className="w-full h-16 bg-brand-primary text-black rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                         >
                           <UserIcon size={24} />
                           Sign In / Sign Up
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeMainTab === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 pt-12">
                <h2 className="text-5xl font-black text-zinc-950 dark:text-white tracking-tight">{t.pricingTitle}</h2>
                <p className="text-zinc-500 font-bold text-lg max-w-2xl mx-auto italic opacity-80">{lang === "id" ? "Bayar Sekali, Gunakan Selamanya. Tanpa Biaya Bulanan." : "Pay Once, Use Forever. No Monthly Fees."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
                {[
                  {
                    name: "Starter",
                    price: "25rb",
                    unitPrice: "Rp 1.000/1K",
                    quota: "25.000 Karakter",
                    id: "Starter",
                    time: "~5 Menit",
                    features: ["Standard Voices", "Community Support", "Trial Use"],
                    recommended: false
                  },
                  {
                    name: "Kreator",
                    price: "85rb",
                    unitPrice: "Rp 850/1K",
                    quota: "100.000 Karakter",
                    id: "Creator",
                    time: "~25 Menit Audio",
                    features: ["Semua Suara Premium", "Full SSML Support", "Priority Queue", "Commercial License"],
                    recommended: false
                  },
                  {
                    name: "Produktif",
                    price: "225rb",
                    unitPrice: "Rp 750/1K",
                    quota: "300.000 Karakter",
                    id: "Produktif",
                    time: "~75 Menit Audio",
                    features: ["Semua Suara HD", "Storytelling Optimizer", "Commercial Rights", "Priority Queue", "Monthly Quota Rollover"],
                    recommended: true
                  },
                  {
                    name: "Lifetime",
                    price: "599rb",
                    unitPrice: "Life Pack",
                    quota: "800.000 Karakter",
                    id: "Lifetime",
                    time: "~200 Menit Audio",
                    features: ["Akses Seumur Hidup", "Tanpa Biaya Bulanan", "Semua Fitur Pro", "Unlimited Projects", "Priority Support"],
                    recommended: false,
                    isLifetime: true
                  }
                ].map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`relative bg-white dark:bg-zinc-900 border-2 rounded-[2.5rem] p-10 transition-apple hover:scale-[1.02] flex flex-col ${
                      plan.recommended 
                        ? "border-brand-primary shadow-2xl shadow-brand-primary/10 ring-8 ring-brand-primary/5" 
                        : "border-zinc-100 dark:border-zinc-800 shadow-sm"
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                        {lang === "id" ? "Rekomendasi" : "Recommended"}
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <h3 className="font-black text-2xl text-zinc-950 dark:text-white mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-zinc-400 text-sm font-bold">Rp</span>
                        <span className="text-4xl font-black text-zinc-950 dark:text-white tracking-tighter">{plan.price}</span>
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{plan.isLifetime ? "Sekali Bayar" : t.perMonth}</span>
                      </div>
                      {plan.unitPrice && (
                        <div className="mt-1 text-[10px] font-bold text-zinc-400 italic">
                          {plan.isLifetime ? t.lifetimeLabel : `Rp ${plan.unitPrice} ${t.per1kChars}`}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-2xl mb-8 border border-zinc-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{lang === "id" ? "Kuota" : "Quota"}</span>
                        <span className="text-[10px] font-black text-indigo-600">{plan.quota}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: plan.id === "Free" ? "10%" : plan.id === "Pemula" ? "30%" : plan.id === "Kreator" ? "60%" : "100%" }}></div>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                          <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.recommended ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-400"}`}>
                            <Check size={12} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button 
                      disabled={isCheckingOut !== null}
                      onClick={() => {
                        const amounts: Record<string, number> = {
                          "Free": 0,
                          "Starter": 25000,
                          "Creator": 85000,
                          "Produktif": 225000,
                          "Lifetime": 599000
                        };
                        const amount = amounts[plan.id] || 0;
                        if (plan.id === "Free") {
                          setActiveMainTab("editor");
                        } else {
                          handleCheckout(plan.name, amount);
                        }
                      }}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        plan.recommended 
                          ? "bg-brand-primary text-black shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90" 
                          : "bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100"
                      } disabled:opacity-50`}
                    >
                      {isCheckingOut === plan.name ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : null}
                      {plan.id === "Free" ? (lang === "id" ? "Mulai Sekarang" : "Start Now") : (lang === "id" ? `Pilih Paket ${plan.name}` : `Choose ${plan.name}`)}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 rounded-[3rem] p-12 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="px-4 py-1.5 bg-brand-primary text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block uppercase">Best Value</span>
                    <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">Butuh Kuota Sekali Jalan? <br/>Beli Top-up, Tanpa Langganan.</h2>
                    <p className="text-zinc-400 font-bold leading-relaxed mb-8">Ideal untuk projek video tunggal atau tugas kuliah yang mendesak. Kuota berlaku selamanya.</p>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-6">
                       <div className="text-center">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Harga</p>
                         <p className="text-2xl font-black">Rp 225.000</p>
                       </div>
                       <div className="w-px h-10 bg-white/10"></div>
                       <div className="text-center">
                         <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest mb-1">Kuota</p>
                         <p className="text-2xl font-black">300.000 Karakter</p>
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button 
                      disabled={isCheckingOut === "Lifetime"}
                      onClick={() => handleCheckout("Lifetime", 150000)}
                      className="w-full bg-white text-zinc-950 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-2"
                    >
                      {isCheckingOut === "Lifetime" && <RefreshCw size={20} className="animate-spin" />}
                      BELI LIFETIME PACK
                    </button>
                    <p className="text-center text-xs font-bold text-zinc-500 italic">*Masa aktif selamanya, no monthly fees.</p>
                  </div>
                </div>
              </div>

              {/* Secure Payment Gateway within Pricing Tab */}
              <div className="pt-12 text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Supported Payment Methods</p>
                <div className="flex flex-wrap justify-center gap-6 opacity-60">
                   {[
                     { name: "QRIS", icon: <QrCode size={18} /> },
                     { name: "Visa", icon: <CreditCard size={18} /> },
                     { name: "PayPal", icon: <Coins size={18} /> },
                     { name: "VA Transfer", icon: <Banknote size={18} /> },
                     { name: "E-Wallet", icon: <Wallet size={18} /> }
                   ].map(item => (
                     <div key={item.name} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 shadow-sm border-dashed">
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

      </main>

      {/* Floating Bottom Audio Player */}
      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50"
          >
            <div className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 p-4 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                  <Play size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-widest uppercase">Member Preview</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{selectedVoice.name} • {selectedFormat}</p>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col gap-2">
                 <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  autoPlay
                  className="w-full h-10 accent-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl flex items-center justify-center transition-all"
                  title="Bagikan"
                >
                  <Share2 size={20} />
                </button>
                <a 
                  href={audioUrl} 
                  download={`rungu-voice-${selectedVoice.name.toLowerCase()}-${Date.now()}.${selectedFormat.toLowerCase()}`}
                  className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"
                  title="Download"
                >
                  <Download size={20} />
                </a>
                <button 
                  onClick={() => setAudioUrl("")}
                  className="w-12 h-12 bg-zinc-800/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-12 border-t border-zinc-200 dark:border-zinc-800 mt-12 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center font-bold text-zinc-600">G</div>
            <p className="text-xs font-medium text-zinc-500">Powered by Google Cloud Text-to-Speech & Gemini AI</p>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span>Enterprise Grade</span>
            <span>Natural Synthesis</span>
            <span>Full HD MP3</span>
          </div>
        </div>
      </footer>

      {/* Modal Kloning Suara */}
      {isCloningModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Kloning Suara</h3>
                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-md tracking-tighter uppercase">BETA</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium whitespace-nowrap">Buat kembaran digital suara Anda</p>
                </div>
                <button 
                  onClick={() => setIsCloningModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Nama Suara</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Suara Saya Aris"
                    value={cloningName}
                    onChange={(e) => setCloningName(e.target.value)}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-0 transition-colors font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">Sampel Suara (MP3/WAV)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-3 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      uploadingFile ? "border-indigo-600 bg-indigo-50" : "border-zinc-100 hover:border-indigo-200 bg-zinc-50"
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="audio/*" 
                      className="hidden" 
                    />
                    {uploadingFile ? (
                      <>
                        <FileAudio size={40} className="text-indigo-600 mb-3" />
                        <p className="text-sm font-bold text-zinc-900 truncate max-w-full px-4">{uploadingFile.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-black">File Terpilih</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3">
                          <Plus size={24} className="text-zinc-300" />
                        </div>
                        <p className="text-sm font-bold text-zinc-900">Klik untuk Unggah</p>
                        <p className="text-[10px] text-zinc-500 mt-1 text-center leading-relaxed font-medium">Format: MP3 atau WAV (Maks 10MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {uploadingFile && fileDuration > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pilih Segmen (Potong)</label>
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                        {Math.round(trimEnd - trimStart)} Detik Terpilih
                      </span>
                    </div>
                    
                    <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-5 space-y-5 shadow-inner">
                      {/* Visual Timeline */}
                      <div 
                        className="relative h-10 bg-zinc-200/50 rounded-xl overflow-hidden border border-zinc-200 cursor-crosshair group"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTimelineHoverPercent((e.clientX - rect.left) / rect.width);
                        }}
                        onMouseLeave={() => setTimelineHoverPercent(null)}
                        onDoubleClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const clickedTime = (x / rect.width) * fileDuration;
                          
                          const distStart = Math.abs(clickedTime - trimStart);
                          const distEnd = Math.abs(clickedTime - trimEnd);
                          
                          if (distStart < distEnd) {
                            setTrimStart(Math.min(clickedTime, trimEnd - 0.5));
                          } else {
                            setTrimEnd(Math.max(clickedTime, trimStart + 0.5));
                          }
                        }}
                      >
                        {timelineHoverPercent !== null && (
                          <div className="absolute inset-0 pointer-events-none z-20">
                            <div 
                              className="absolute h-full w-px bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                              style={{ left: `${timelineHoverPercent * 100}%` }}
                            />
                            <div 
                              className="absolute top-0 px-1.5 py-0.5 bg-indigo-600 text-[8px] text-white font-bold rounded-b-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ left: `${timelineHoverPercent * 100}%`, transform: "translateX(-50%)" }}
                            >
                              {formatTime(timelineHoverPercent * fileDuration)}
                            </div>
                          </div>
                        )}
                        <div className="absolute top-0 right-2 text-[8px] font-bold text-indigo-300 uppercase tracking-widest leading-10 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                          Dbl-Click to Set
                        </div>
                        <div 
                          className="absolute h-full bg-indigo-500/20 border-x-2 border-indigo-500 z-10"
                          style={{ 
                            left: `${(trimStart / fileDuration) * 100}%`, 
                            width: `${((trimEnd - trimStart) / fileDuration) * 100}%` 
                          }}
                        />
                        {/* Simple mock waveform bars */}
                        <div className="absolute inset-0 flex items-center justify-around px-2 opacity-20 pointer-events-none">
                          {[...Array(30)].map((_, i) => (
                            <div 
                              key={i} 
                              className="w-1 bg-zinc-600 rounded-full" 
                              style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 30}%` }} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-zinc-500 tracking-tighter">
                              <span>MULAI</span>
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 rounded">{formatTime(trimStart)}</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={fileDuration} 
                              step="0.1"
                              value={trimStart}
                              onChange={(e) => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.5))}
                              className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-zinc-500 tracking-tighter">
                              <span>AKHIR</span>
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 rounded">{formatTime(trimEnd)}</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={fileDuration} 
                              step="0.1"
                              value={trimEnd}
                              onChange={(e) => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.5))}
                              className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <audio 
                          ref={trimAudioRef}
                          key={uploadingFile?.lastModified} // Force reload when file changes
                          src={uploadingFile ? URL.createObjectURL(uploadingFile) : ""} 
                          controls 
                          className="w-full h-8 accent-indigo-600 scale-95"
                          onTimeUpdate={(e) => {
                            const ct = (e.target as HTMLAudioElement).currentTime;
                            if (ct > trimEnd) {
                              (e.target as HTMLAudioElement).currentTime = trimStart;
                            }
                          }}
                          onPlay={(e) => {
                            const audio = e.target as HTMLAudioElement;
                            if (audio.currentTime < trimStart || audio.currentTime > trimEnd) {
                              audio.currentTime = trimStart;
                            }
                          }}
                        />
                        <div className="mt-4 p-4 bg-zinc-950 text-white rounded-2xl">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-indigo-400">Shortcuts Editor</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex justify-between text-[9px] border-b border-white/5 pb-1"><span className="text-zinc-500">[ ]</span> <span className="font-bold">Set Start / End</span></div>
                            <div className="flex justify-between text-[9px] border-b border-white/5 pb-1"><span className="text-zinc-500">Space</span> <span className="font-bold">Play / Pause</span></div>
                            <div className="flex justify-between text-[9px] border-b border-white/5 pb-1"><span className="text-zinc-500">Shift + ←→</span> <span className="font-bold">Fine Tune Start</span></div>
                            <div className="flex justify-between text-[9px] border-b border-white/5 pb-1"><span className="text-zinc-500">Alt + ←→</span> <span className="font-bold">Fine Tune End</span></div>
                          </div>
                        </div>
                        <p className="text-[9px] text-zinc-400 text-center mt-2 font-medium italic">Pemutar akan otomatis berulang (loop) pada segmen terpilih.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3 bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Mic2 size={12} /> Panduan Sampel Terbaik
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-zinc-800">Durasi Ideal</p>
                      <p className="text-[10px] text-zinc-500 leading-tight">Gunakan durasi 30-60 detik dengan suara yang jelas.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-zinc-800">Tanpa Gangguan</p>
                      <p className="text-[10px] text-zinc-500 leading-tight">Pastikan tidak ada musik latar atau kebisingan.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-zinc-800">Artikulasi</p>
                      <p className="text-[10px] text-zinc-500 leading-tight">Bicara secara natural dengan intonasi yang konsisten.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-zinc-800">Kualitas Mic</p>
                      <p className="text-[10px] text-zinc-500 leading-tight">Gunakan mikrofon berkualitas atau dekat dengan sumber suara.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-4 shadow-sm">
                   <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                     <AlertCircle size={20} className="text-amber-600" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[11px] font-black text-amber-800 uppercase tracking-wide">Teknologi Emulasi Audio</p>
                     <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
                       Saat ini fitur kloning menggunakan profil <span className="text-amber-900 underline decoration-amber-300">Gemini Pro Audio Emulation</span>. Suara kloning akan mensimulasikan karakteristik nada Anda namun tetap menggunakan engine Cloud TTS untuk kejelasan maksimal.
                     </p>
                   </div>
                </div>

                <button 
                  disabled={!cloningName || !uploadingFile || isTrimming}
                  onClick={saveClonedVoice}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  {isTrimming ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Zap size={18} />
                  )}
                  {isTrimming ? "MEMOTONG AUDIO..." : "SIMPAN KE TABUNG KLONING"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus Suara */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">{t.deleteConfirmTitle}</h3>
              <p className="text-sm text-zinc-500 font-bold mb-8 italic">
                {t.deleteConfirmDesc.replace("{name}", voiceToDelete?.name || "")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="py-4 bg-zinc-100 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
                >
                  {t.cancelBtn}
                </button>
                <button 
                  onClick={handleDeleteVoice}
                  className="py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                >
                  {t.deleteBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Koleksi Naskah</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Daftar naskah yang Anda simpan</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-md transition-all text-zinc-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white">
              {!currentUser ? (
                <div className="text-center py-12">
                   <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock size={40} />
                   </div>
                   <h4 className="text-xl font-black text-zinc-900 mb-2">Login Diperlukan</h4>
                   <p className="text-zinc-500 font-bold max-w-xs mx-auto mb-8 italic text-sm">Silakan Sign In untuk menyimpan dan melihat koleksi naskah Anda di cloud.</p>
                   <div className="flex flex-col gap-3 max-w-sm mx-auto">
                     <button 
                       onClick={() => setIsAuthModalOpen(true)}
                       className="w-full h-16 bg-brand-primary text-black rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                       <UserIcon size={20} />
                       Sign In / Sign Up Sekarang
                     </button>
                   </div>
                </div>
              ) : savedScripts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={40} />
                  </div>
                  <h4 className="text-xl font-black text-zinc-900 mb-2">Belum Ada Naskah</h4>
                  <p className="text-zinc-500 font-bold italic text-sm">Mulai menulis dan simpan naskah pertama Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedScripts.map(script => (
                    <div 
                      key={script.id}
                      className="group p-6 bg-zinc-50 hover:bg-white border border-zinc-100 hover:border-indigo-200 rounded-[2rem] transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex items-center justify-between"
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setText(script.content);
                          setScriptTitle(script.title);
                          setIsHistoryOpen(false);
                        }}
                      >
                        <h4 className="font-black text-zinc-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors tracking-tight">{script.title}</h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-bold text-zinc-400 truncate max-w-[200px] sm:max-w-md">{script.content.substring(0, 80)}...</p>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-tighter shrink-0">
                            <Clock size={12} />
                            {new Date(script.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all ml-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteScript(script.id);
                          }}
                          className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setText(script.content);
                            setScriptTitle(script.title);
                            setIsHistoryOpen(false);
                          }}
                          className="p-3 text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all active:scale-90"
                          title="Buka"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-3 text-emerald-600/60">
                 <ShieldCheck size={16} />
                 <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-zinc-500">
                   Enkripsi Cloud Rungu: Naskah dikunci secara privat di akun Google Anda.
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}
      {/* Low Quota Notification */}
      <AnimatePresence>
        {(currentUser ? (userProfile.currentQuota + userProfile.rolloverQuota) : sessionQuota) < 1000 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-32 right-10 z-[160] w-72 bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[2rem] shadow-2xl text-white"
          >
            <div className="flex items-start gap-4">
               <div className="p-2 bg-white/20 rounded-xl"><AlertCircle size={20} /></div>
               <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1">Kuota Hampir Habis!</h4>
                  <p className="text-[10px] font-bold opacity-90 leading-relaxed mb-4">Narasi kreatifmu butuh bensin. Top up sekarang untuk lanjut berkarya!</p>
                  <button 
                    onClick={() => {
                      setActiveMainTab("pricing");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-white text-orange-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                  >
                    Top Up Sekarang
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Selection Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-8 text-center relative">
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-primary">
                <UserIcon size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Selamat Datang</h3>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-8">Pilih Metode Sign In</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => { handleLogin('google'); setIsAuthModalOpen(false); }}
                  className="w-full h-14 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-3 font-sans"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Sign In dengan Google
                </button>
                
                <button 
                  onClick={() => { handleLogin('facebook'); setIsAuthModalOpen(false); }}
                  className="w-full h-14 bg-[#1877F2] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-all"
                >
                  <Facebook size={20} fill="currentColor" />
                  Sign In dengan Facebook
                </button>
                
                <button 
                  onClick={() => { handleLogin('apple'); setIsAuthModalOpen(false); }}
                  className="w-full h-14 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-black/20 active:scale-95 flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all"
                >
                  <Apple size={20} fill="currentColor" />
                  Sign In dengan Apple ID
                </button>
              </div>
              
              <p className="mt-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                Naskah Anda akan tersimpan aman di cloud setelah melakukan pendaftaran atau masuk.
              </p>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Floating Rungu Studio Assistant */}
      <div className="fixed bottom-10 right-10 z-[140]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[600px]"
            >
              <div className="p-6 bg-brand-primary text-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Rungu Studio</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Online & Berjiwa</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-zinc-900 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-700">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Tanya Rungu Studio..."
                    className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                  <button 
                    onClick={handleChat}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="p-3 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-brand-primary text-black rounded-[2rem] shadow-2xl flex items-center justify-center relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:opacity-0 transition-opacity" />
          <AnimatePresence mode="wait">
            {isChatOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                <Sparkles size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Footer Synthesize Bar (Apple Style Floating Bar) */}
      <AnimatePresence>
        {activeMainTab === "editor" && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-0 right-0 z-40 flex justify-center pointer-events-none"
          >
            <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 p-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 pointer-events-auto border-emerald-500/20">
               <div className="pl-6 pr-4 hidden md:block">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5 opacity-60">Suara Aktif</span>
                  <span className="text-sm font-black text-white block tracking-tight">{selectedVoice.name}</span>
               </div>
               <div className="w-px h-10 bg-zinc-800 hidden md:block" />
               <button 
                 onClick={handleSynthesize}
                 disabled={isGenerating || !text}
                 className={`px-12 py-5 bg-[#10B981] text-black font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-2xl shadow-emerald-500/20 hover:scale-[1.03] active:scale-95 transition-apple flex items-center gap-3 disabled:opacity-50 disabled:grayscale`}
               >
                 {isGenerating ? (
                   <>
                     <RefreshCw size={20} className="animate-spin" />
                     <span>Memproses...</span>
                   </>
                 ) : (
                   <>
                     <Zap size={20} fill="currentColor" />
                     <span>Hasilkan Suara</span>
                   </>
                 )}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Low Quota Notification */}
      <AnimatePresence>
        {(userProfile.currentQuota + userProfile.rolloverQuota) < 1000 && currentUser && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-50 bg-amber-500 text-black p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 min-w-[320px] border-4 border-amber-400"
          >
             <div className="p-3 bg-black/10 rounded-2xl">
                <AlertTriangle size={24} />
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Peringatan Kuota</p>
                <p className="text-sm font-black leading-tight">Kuota Hampir Habis!</p>
                <p className="text-[10px] font-bold opacity-60">Sisa {(userProfile.currentQuota + userProfile.rolloverQuota).toLocaleString()} Karakter.</p>
             </div>
             <button 
               onClick={() => setActiveMainTab("pricing")}
               className="p-3 bg-black text-white rounded-2xl hover:scale-105 transition-apple"
             >
                <Zap size={20} fill="currentColor" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification Container */}
      <div className="fixed top-28 right-10 z-[200] flex flex-col gap-3 w-80">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 ${
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> :
               toast.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> :
               <Info size={18} className="mt-0.5 shrink-0" />}
              <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}
