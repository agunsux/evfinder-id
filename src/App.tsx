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
  Share2
} from "lucide-react";
import { VOICES, Voice, TTSRequest, TTSResponse } from "./types";

const translations = {
  id: {
    ctaStudio: "Buka Studio",
    heroBadge: "AI Voice Generative Spesialis Indonesia",
    heroTitle: "Hidupkan Kontenmu dengan Suara Indonesia Paling Manusiawi.",
    heroSub: "Lupakan suara robot yang kaku atau voice-over mahal yang bikin kantong jebol. Langgam hadir dengan logat lokal, Sunda, dan Jawa yang bikin audiens merasa 'ngobrol' langsung.",
    ctaTry: "Coba Gratis Sekarang",
    ctaPricing: "Lihat Paket Harga",
    featuresTitle: "Kenapa Harus Langgam?",
    feature1Title: "Bukan Sekadar Robot",
    feature1Desc: "AI kami paham konteks. Paham kapan harus bertanya, memberi perintah, hingga emosi bercerita yang menggugah.",
    feature2Title: "Harga Kreator Lokal",
    feature2Desc: "Hanya Rp 59rb/bulan. 78% lebih hemat dibanding Murf AI (Rp 476rb) untuk kualitas yang lebih lokal.",
    feature3Title: "Dialek Sunda & Jawa",
    feature3Desc: "Satu-satunya yang fasih logat daerah untuk konten yang lebih membumi dan dekat dengan audiens.",
    compareTitle: "Langgam vs Dunia",
    compareSub: "Kami menghormati kompetitor global, tapi untuk Indonesia? Langgam juaranya.",
    packageFree: "Gratis",
    packageCreator: "Kreator",
    packagePro: "Pro",
    packageStudio: "Studio",
    priceFree: "Rp 0",
    priceCreator: "Rp 59rb",
    pricePro: "Rp 129rb",
    priceStudio: "Rp 499rb",
    perMonth: "/ bulan",
    saveX: "Hemat",
    pricingTitle: "Pilih Investasi Kreativitasmu",
    paymentTitle: "Metode Pembayaran Lengkap",
    paymentSub: "Kami mendukung berbagai metode pembayaran lokal dan internasional untuk kenyamanan Anda.",
    testimonialsTitle: "Cerita Sukses Kreator Langgam",
    faqTitle: "Pertanyaan yang Sering Muncul",
    finalCtaTitle: "Siap Mewarnai Kontenmu?",
    finalCtaSub: "Bergabung bersama ribuan kreator Indonesia lainnya yang sudah mulai meninggalkan suara robotik lama.",
    finalCtaBtn: "Mulai Kreativitasmu Sekarang (Gratis)",
    deleteConfirmTitle: "Hapus Suara Kloning?",
    deleteConfirmDesc: "Tindakan ini tidak dapat dibatalkan. Suara kustom '{name}' akan dihapus permanen.",
    deleteBtn: "Hapus Sekarang",
    cancelBtn: "Batalkan",
    shareBtn: "Bagikan",
    shareSuccess: "Link berhasil disalin!",
  },
  en: {
    ctaStudio: "Open Studio",
    heroBadge: "Specialized Indonesian Generative AI Voice",
    heroTitle: "Bring Your Content to Life with the Most Human-Like Indonesian Voices.",
    heroSub: "Forget stiff robotic voices or expensive voice-overs that break the bank. Langgam AI delivers local accents, Sundanese, and Javanese that feel like a real conversation.",
    ctaTry: "Try for Free Now",
    ctaPricing: "View Pricing Plans",
    featuresTitle: "Why Langgam AI?",
    feature1Title: "Beyond Just a Robot",
    feature1Desc: "Our AI understands context. It knows when to ask, command, and narrate with evocative human emotion.",
    feature2Title: "Local Creator Pricing",
    feature2Desc: "Only Rp 59k/month. 78% cheaper than Murf AI (Rp 476k) with better local quality.",
    feature3Title: "Sundanese & Javanese Dialects",
    feature3Desc: "The only one fluent in regional dialects for more authentic and relatable content.",
    compareTitle: "Langgam vs The World",
    compareSub: "We respect global competitors, but for Indonesia? Langgam takes the crown.",
    packageFree: "Free",
    packageCreator: "Creator",
    packagePro: "Pro",
    packageStudio: "Studio",
    priceFree: "Rp 0",
    priceCreator: "Rp 59k",
    pricePro: "Rp 129k",
    priceStudio: "Rp 499k",
    perMonth: "/ month",
    saveX: "Save",
    pricingTitle: "Choose Your Creativity Investment",
    paymentTitle: "Complete Payment Methods",
    paymentSub: "We support various local and international payment methods for your convenience.",
    testimonialsTitle: "Success Stories from Langgam Creators",
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

const LandingPage = ({ lang, isDark, setView, setLang, setIsDark }: any) => {
  const t = translations[lang as keyof typeof translations];
  
  const faqData = lang === "id" ? [
    { q: "Apakah suaranya benar-benar natural?", a: "Ya, mesin kami menggunakan arsitektur WaveNet yang dioptimalkan khusus untuk linguistik Indonesia, Sunda, dan Jawa." },
    { q: "Apa bedanya dengan ElevenLabs?", a: "ElevenLabs bagus untuk suara global, tapi Langgam fokus pada kealamian logat Indonesia dan harga yang jauh lebih terjangkau bagi kreator lokal." },
    { q: "Bisakah saya kloning suara sendiri?", a: "Tentu! Di paket Pro dan Studio, Anda bisa mengunggah sampel suara 30 detik untuk membuat kloning suara Anda sendiri." }
  ] : [
    { q: "Are the voices really natural?", a: "Yes, our engine uses WaveNet architecture specifically optimized for Indonesian, Sundanese, and Javanese linguistics." },
    { q: "How is it different from ElevenLabs?", a: "ElevenLabs is great for global voices, but Langgam focuses on natural Indonesian accents and significantly more affordable pricing for local creators." },
    { q: "Can I clone my own voice?", a: "Absolutely! In the Pro and Studio plans, you can upload a 30-second voice sample to create your personal voice clone." }
  ];

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-sans">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Mic2 size={24} />
              </div>
              <span className="font-extrabold text-2xl tracking-tight">Langgam<span className="text-indigo-600">AI</span></span>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
              <button onClick={() => setLang(lang === "id" ? "en" : "id")} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
                <Globe size={16} /> {lang === "id" ? "EN" : "ID"}
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
              </button>
              <button onClick={() => setView("studio")} className="hidden sm:block bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                {t.ctaStudio}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-48 pb-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800 mb-8"
            >
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.heroBadge}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-zinc-950 dark:text-white leading-[1.05] tracking-tight mb-8"
            >
              {t.heroTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-bold max-w-3xl mx-auto leading-relaxed mb-12 italic"
            >
              {t.heroSub}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => setView("studio")}
                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
              >
                {t.ctaTry}
              </button>
              <a 
                href="#pricing"
                className="w-full sm:w-auto px-10 py-5 bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                {t.ctaPricing}
              </a>
            </motion.div>

            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all"
            >
              <span className="font-black text-xs uppercase tracking-widest">PROUDLY BUILT IN INDONESIA</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} /> <span className="font-bold text-[10px]">VERIFIED VOICE DATA</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} /> <span className="font-bold text-[10px]">ULTRA LOW LATENCY</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-white dark:bg-zinc-900/50 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black tracking-tight mb-4">{t.featuresTitle}</h2>
              <div className="w-20 h-2 bg-indigo-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: t.feature1Title, desc: t.feature1Desc, icon: <Volume2 className="text-indigo-600" size={32} /> },
                { title: t.feature2Title, desc: t.feature2Desc, icon: <CreditCard className="text-orange-500" size={32} /> },
                { title: t.feature3Title, desc: t.feature3Desc, icon: <Cpu className="text-green-500" size={32} /> }
              ].map((f, i) => (
                <div key={i} className="p-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:border-indigo-500 transition-all group">
                  <div className="mb-6 p-4 bg-white dark:bg-zinc-950 w-fit rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-black mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-black tracking-tight mb-4">{t.compareTitle}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold italic">{t.compareSub}</p>
             </div>

             <div className="overflow-x-auto rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse bg-white dark:bg-zinc-900">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-8 text-xs font-black uppercase tracking-widest">Fitur</th>
                      <th className="p-8 text-xs font-black uppercase tracking-widest text-indigo-600 underline">Langgam AI</th>
                      <th className="p-8 text-xs font-black uppercase tracking-widest text-zinc-400">Murf AI</th>
                      <th className="p-8 text-xs font-black uppercase tracking-widest text-zinc-400">ElevenLabs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[
                      { f: lang === "id" ? "Harga Bulanan" : "Monthly Price", l: "Rp 59.000", m: "~Rp 476.000", e: "~Rp 82.000" },
                      { f: lang === "id" ? "Kualitas Suara Indonesia" : "ID Voice Quality", l: "✅ Super Natural", m: "❌ Standar", e: "✅ Bagus" },
                      { f: lang === "id" ? "Lisensi Komersial (Murah)" : "Cheap Commercial License", l: "✅ Termasuk", m: "❌ Upgrade", e: "❌ Terbatas" },
                      { f: lang === "id" ? "Sunda & Jawa" : "Sundanese/Javanese", l: "✅ Tersedia", m: "❌ Tidak Ada", e: "❌ Tidak Ada" },
                      { f: lang === "id" ? "Kompleksitas" : "Complexity", l: "✅ Simpel & Cepat", m: "❌ Terlalu Rumit", e: "✅ Sedang" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                        <td className="p-8 font-black text-sm">{row.f}</td>
                        <td className="p-8 font-black text-sm text-indigo-600 bg-indigo-50/10">{row.l}</td>
                        <td className="p-8 font-bold text-sm text-zinc-500 dark:text-zinc-400">{row.m}</td>
                        <td className="p-8 font-bold text-sm text-zinc-500 dark:text-zinc-400">{row.e}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 bg-zinc-950 dark:bg-black transition-colors">
           <div className="max-w-7xl mx-auto">
             <div className="text-center mb-20">
                <h2 className="text-4xl font-black tracking-tight text-white mb-4">{t.pricingTitle}</h2>
                <div className="w-20 h-2 bg-indigo-600 mx-auto rounded-full" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: t.packageFree, price: t.priceFree, chars: "1K", save: null, icon: <Type size={20} /> },
                  { name: t.packageCreator, price: t.priceCreator, chars: "50K", save: "78%", icon: <Sparkles size={20} />, active: true },
                  { name: t.packagePro, price: t.pricePro, chars: "150K", save: "65%", icon: <Zap size={20} /> },
                  { name: t.packageStudio, price: t.priceStudio, chars: "1M", save: "50%", icon: <Theater size={20} /> }
                ].map((p, i) => (
                  <div key={i} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col ${
                    p.active 
                      ? "bg-indigo-600 border-indigo-500 text-white scale-105 shadow-2xl shadow-indigo-500/40" 
                      : "bg-white/5 border-white/10 text-zinc-400"
                  }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${p.active ? "bg-white/20" : "bg-white/5"}`}>
                      {p.icon}
                    </div>
                    <h3 className={`text-xl font-black mb-1 ${p.active ? "text-white" : "text-white"}`}>{p.name}</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className={`text-3xl font-black ${p.active ? "text-white" : "text-white"}`}>{p.price}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.perMonth}</span>
                    </div>
                    
                    {p.save && (
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-fit ${p.active ? "bg-white text-indigo-600" : "bg-indigo-500/20 text-indigo-400"}`}>
                        {t.saveX} {p.save}
                      </div>
                    )}

                    <ul className={`space-y-4 text-xs font-bold mb-10 flex-1 ${p.active ? "text-white/80" : "text-zinc-500"}`}>
                       <li className="flex items-center gap-2"><Check size={14} /> {p.chars} {lang === "id" ? "Karakter" : "Characters"}</li>
                       <li className="flex items-center gap-2"><Check size={14} /> 5+ {lang === "id" ? "Suara Premium" : "Premium Voices"}</li>
                       <li className="flex items-center gap-2"><Check size={14} /> {lang === "id" ? "Lisensi Komersial" : "Commercial License"}</li>
                    </ul>

                    <button 
                      onClick={() => setView("studio")}
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 ${
                        p.active 
                          ? "bg-white text-indigo-600 hover:bg-zinc-100" 
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {lang === "id" ? "PILIH PAKET" : "CHOOSE PLAN"}
                    </button>
                  </div>
                ))}
             </div>
           </div>
        </section>

        {/* Payment Gateway Showcase */}
        <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/20">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-4 tracking-tight">{t.paymentTitle}</h2>
            <p className="text-zinc-500 font-bold mb-16">{t.paymentSub}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {[
                { name: "QRIS", icon: <QrCode size={32} className="text-indigo-600" />, sub: "All Apps" },
                { name: "E-Wallet", icon: <Wallet size={32} className="text-orange-500" />, sub: "Gopay, OVO, Dana" },
                { name: "Bank Transfer", icon: <Banknote size={32} className="text-green-500" />, sub: "Virtual Account" },
                { name: "Credit Card", icon: <CreditCard size={32} className="text-blue-500" />, sub: "Visa, Mastercard" },
                { name: "PayPal", icon: <Coins size={32} className="text-indigo-400" />, sub: "International" }
              ].map((m, i) => (
                <div key={i} className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-xl transition-all group">
                  <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                    {m.icon}
                  </div>
                  <h4 className="font-black text-sm mb-1">{m.name}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{m.sub}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center gap-6 opacity-30 grayscale saturate-0 pointer-events-none">
               {/* Visual placeholders for local brands */}
               {["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "BCA", "Mandiri", "BNI", "BRI"].map(brand => (
                 <span key={brand} className="text-xs font-black uppercase tracking-tighter border border-zinc-950 px-3 py-1 rounded">{brand}</span>
               ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 bg-white dark:bg-zinc-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tight">{t.testimonialsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Andi Pratama", role: "TikTok Creator", body: lang === "id" ? "Edan! Suara Jawanya Langgam pas banget buat konten komedi saya. Followers nambah drastis!" : "Crazy! Langgam's Javanese voice is perfect for my comedy content. My followers have skyrocketed!" },
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
          <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[4rem] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/40">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
               <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">{t.finalCtaTitle}</h2>
               <p className="text-xl text-white/80 font-bold max-w-2xl mx-auto mb-12 italic">{t.finalCtaSub}</p>
               <button 
                 onClick={() => setView("studio")}
                 className="px-12 py-6 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-zinc-100 transition-all shadow-xl active:scale-95"
               >
                 {t.finalCtaBtn}
               </button>
             </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 opacity-50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2">© 2026 LanggamAI Studio • Made with ❤️ for Indonesia</p>
            <p className="text-[9px] font-bold">Standard Indonesian TTS • Sundanese • Javanese • Custom Clones</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const LANGGAM_OPTIMIZER_SYSTEM_PROMPT = `# System Prompt: Langgam TTS Optimizer — Bahasa Indonesia

## Role
Anda adalah asisten yang mengoptimalkan teks Bahasa Indonesia untuk sintesis suara (Text-to-Speech). Pastikan output terdengar natural dengan intonasi, jeda, dan ritme narasi Indonesia.

## Rules
1. **Jeda & Pacing**
   - Koma → <break time="250ms"/>
   - Titik → <break time="500ms"/>
   - Paragraf baru → <break time="900ms"/>
   - Penekanan → <emphasis level="moderate">kata</emphasis>

2. **Normalisasi Wajib**
   - Singkatan: "yg"→"yang", "dg"→"dengan", "tdk"→"tidak", "dll"→"dan lain-lain"
   - Angka: "1000"→"seribu", "25.000"→"dua puluh lima ribu"
   - Uang: "Rp 49.000"→"empat puluh sembilan ribu rupiah"
   - Tahun: "1945"→"seribu sembilan ratus empat puluh lima"

3. **Nama & Istilah Lokal**
   - Pertahankan ejaan: "Soekarno", "Suharto", "Joko Widodo"
   - Istilah asing: tambahkan petunjuk jika ambigu → "AI (ei-ai)"

4. **Konteks Narasi**
   - Sejarah: tempo sedang, serius tapi tidak kaku
   - Bedtime story: tempo lambat, intonasi lembut
   - Edukasi: jelas, penekanan pada poin kunci

## Output Format
Kembalikan teks dalam SSML-ready:
<speak>
  [teks dengan break, emphasis, normalisasi]
</speak>`;

export default function App() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<Voice>(VOICES[0]);
  const [pitch, setPitch] = useState(VOICES[0].defaultPitch ?? 0);
  const [speed, setSpeed] = useState(VOICES[0].defaultSpeed ?? 0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [detectedStyle, setDetectedStyle] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; text: string; voice: string; date: Date; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [clonedVoices, setClonedVoices] = useState<{id: string, name: string, sampleUrl: string}[]>([]);
  const [isCloningModalOpen, setIsCloningModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<{id: string, name: string} | null>(null);
  const [cloningName, setCloningName] = useState("");
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10); // Default to 10s if duration unknown
  const [fileDuration, setFileDuration] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [linguisticType, setLinguisticType] = useState<"question" | "exclamation" | "statement" | null>(null);
  const [pauseMetrics, setPauseMetrics] = useState({ total: 0, count: 0 });
  const [detectedCues, setDetectedCues] = useState<string[]>([]);
  const [emphasisWords, setEmphasisWords] = useState<string[]>([]);
  const [normNeeded, setNormNeeded] = useState(false);
  const [isSSML, setIsSSML] = useState(false);
  const [prosodySettings, setProsodySettings] = useState({ pitch: "medium", rate: "medium" });
  const [activeVoiceFilter, setActiveVoiceFilter] = useState("All");
  const [activeMainTab, setActiveMainTab] = useState<"editor" | "packs" | "optimizer" | "pricing">("editor");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"landing" | "studio">("landing");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [isDark, setIsDark] = useState(false);

  const t = translations[lang];

  const filteredVoices = VOICES.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeVoiceFilter === "All" || (v.tags && v.tags.includes(activeVoiceFilter));
    return matchesSearch && matchesFilter;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleCheckout = async (planName: string, amount: number) => {
    setIsCheckingOut(planName);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, amount })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Gagal membuat checkout.");
      }

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
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
    const hasAbbreviations = /\b(cm|kg|km|tb|tsb|yth|rp)\b/i.test(t);
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
      const filename = `langgam-voice-${selectedVoice.name.toLowerCase()}-${Date.now()}.mp3`;
      const file = new File([blob], filename, { type: 'audio/mp3' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Langgam AI Voice',
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
      polish: `Perbaiki teks berikut agar terdengar lebih alami dan profesional untuk Text-to-Speech dalam Bahasa Indonesia: "${text}"`,
      optimize: `Terapkan optimasi SSML penuh (Pipeline Optimizer) pada teks berikut sesuai dengan aturan sistem LanggamAI: "${text}"`,
      serious: `Ubah teks berikut menjadi gaya SERIUS & BERWIBAWA: "${text}"`,
      happy: `Ubah teks berikut menjadi gaya CERIA & SEMANGAT: "${text}"`,
      story_emotion: `Ubah teks berikut menjadi naskah audio yang sangat ekspresif dengan dinamika nada tinggi-rendah (Maestro Storytelling): "${text}"`,
      dramatic: `Ubah teks berikut menjadi gaya DRAMATIS & MENCEKAM: "${text}"`,
      pauses: `Sisipkan jeda alami ke dalam teks Bahasa Indonesia berikut: "${text}"`,
      emphasis: `Beri penekanan (emphasis) pada kata-kata penting dalam teks berikut: "${text}"`,
      rate: `Optimalkan tempo bicara (speech rate) pada teks berikut: "${text}"`,
      super_optimize: `Lakukan SUPER OPTIMASI SSML tingkat tinggi (Advanced Prosody) pada teks berikut: "${text}"`,
      educational: `Buatkan naskah penjelasan edukasi yang jelas dan mudah dipahami (maks 60 kata) tentang topik ilmiah atau pengetahuan umum dalam Bahasa Indonesia.
Gunakan intonasi yang informatif dan artikulasi yang jernih.
TEKS: ${text}`,
      detect: `Analisis teks Bahasa Indonesia berikut dan tentukan apakah kategorinya adalah: STORYTELLING, EDUCATIONAL, atau ADVERTISEMENT.
Berikan jawaban HANYA satu kata kategori tersebut dalam huruf kapital. Jika ragu, pilih yang paling mendekati.
TEKS: ${text}`
    };

    const isOptimizerType = ["optimize", "super_optimize", "polish", "pauses", "emphasis", "rate"].includes(type);

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: prompts[type] || prompts.polish,
          system: isOptimizerType ? LANGGAM_OPTIMIZER_SYSTEM_PROMPT : undefined
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
      template: "<speak><prosody rate=\"90%\"><prosody pitch=\"-2st\">Bangsa yang besar adalah bangsa yang menghargai jasa para pahlawannya.</prosody> <break time=\"600ms\"/> <prosody pitch=\"-1st\">Di tengah gemuruh meriam dan bau mesiu,</prosody> <break time=\"800ms\"/> <emphasis level=\"strong\">Soekarno</emphasis> berdiri tegak di hadapan ribuan rakyat, <break time=\"400ms\"/> mengumumkan bahwa penindasan telah berakhir.</prosody></speak>",
      category: "Sejarah & Edukasi"
    },
    {
      id: "pop-culture",
      title: "Pop Culture Recap",
      icon: <Theater size={20} />,
      description: "Gaya video breakdown film atau serial yang sedang trending.",
      template: "<speak><prosody pitch=\"+1st\" rate=\"105%\">Kalian sadar nggak kalau di trailer film terbaru ini ada detail tersembunyi?</prosody> <break time=\"400ms\"/> Yup, <emphasis level=\"strong\">Easter Egg</emphasis> ini beneran ngerubah teori fans di seluruh dunia! <break time=\"600ms\"/> Mari kita bedah bareng-bareng kenapa adegan ini begitu penting untuk timeline-nya.</prosody></speak>",
      category: "Entertainment"
    },
    {
      id: "marketing",
      title: "Hard Sell Ads",
      icon: <Zap size={20} />,
      description: "Template iklan persuasif dengan teknik urgensi tinggi.",
      template: "<speak><prosody rate=\"110%\" pitch=\"+2st\">PROMO TERBATAS! <break time=\"200ms\"/> Dapatkan diskon hingga <emphasis level=\"strong\">70 persen</emphasis> hanya untuk seratus pembeli pertama hari ini.</prosody> <break time=\"500ms\"/> <prosody rate=\"95%\">Jangan sampai ketinggalan, klik link di bio sekarang juga!</prosody></speak>",
      category: "Marketing"
    }
  ];

  const handleSynthesize = async () => {
    if (!text) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      setError(null);
      setAudioUrl(null);

      // Feature warning for Cloned Voices
      if (selectedVoice.description.includes("Menggunakan profil suara kustom")) {
        console.warn("Kloning Suara memerlukan integrasi engine eksternal. Menggunakan simulasi Wavenet.");
      }

      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          voice: selectedVoice.id, 
          pitch, 
          // Map -20..20 to 0.25..4.0
          // 0 is normal (1.0)
          speed: speed >= 0 
            ? 1.0 + (speed / 20) * 3.0 
            : 1.0 + (speed / 20) * 0.75
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
      const audioBlob = b64toBlob(data.audioContent, "audio/mp3");
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Add to history
      setHistory(prev => [{
        id: Date.now().toString(),
        text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        voice: selectedVoice.name,
        date: new Date(),
        url
      }, ...prev]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
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
    return <LandingPage lang={lang} isDark={isDark} setView={setView} setLang={setLang} setIsDark={setIsDark} />;
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 flex flex-col font-sans">
        {/* Navbar */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView("landing")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
              >
                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Mic2 size={24} />
                </div>
                <div className="text-left">
                  <h1 className="font-bold text-xl tracking-tight text-zinc-950 dark:text-white">Langgam<span className="text-indigo-600">AI</span></h1>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 -mt-1 group-hover:text-indigo-400 transition-colors">Studio Editor</p>
                </div>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setLang(lang === "id" ? "en" : "id")} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
                <Globe size={16} /> {lang === "id" ? "EN" : "ID"}
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
              </button>
              <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Google TTS Core Active</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor & Voices */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl w-fit">
            {[
              { id: "editor", label: "Studio Editor", icon: <Type size={14} /> },
              { id: "packs", label: "Content Packs", icon: <BookOpen size={14} /> },
              { id: "optimizer", label: "Pipeline Optimizer", icon: <Zap size={14} /> },
              { id: "pricing", label: "Pricing", icon: <CreditCard size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeMainTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
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
                <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span>NASKAH ANDA</span>
                </div>
                {detectedStyle && (
                  <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider animate-in fade-in slide-in-from-left-2 transition-all">
                    Mode {detectedStyle}
                  </div>
                )}
                <button
                  disabled={isAssistantLoading || !text}
                  onClick={() => handleAIScript("detect")}
                  className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-indigo-600 transition-colors"
                  title="Deteksi Gaya Teks"
                >
                  <RefreshCw size={14} className={isAssistantLoading ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 border-r border-zinc-200 pr-3 mr-1">
                  <button 
                    onClick={() => insertTag('<break time="500ms"/>')}
                    title="Tambah Jeda (500ms)"
                    className="p-1.5 hover:bg-zinc-200/60 rounded text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Clock size={14} /> JEDA
                  </button>
                  <button 
                    onClick={() => insertTag('<emphasis level="strong">', '</emphasis>')}
                    title="Penekanan Kata"
                    className="p-1.5 hover:bg-zinc-200/60 rounded text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Zap size={14} /> TEKAN
                  </button>
                  <button 
                    onClick={() => insertTag('<prosody pitch="+5st">', '</prosody>')}
                    title="Nada Tinggi"
                    className="p-1.5 hover:bg-zinc-200/60 rounded text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <ArrowUpRight size={14} /> NADA↑
                  </button>
                  <button 
                    onClick={() => insertTag('<prosody rate="fast">', '</prosody>')}
                    title="Kecepatan Cepat"
                    className="p-1.5 hover:bg-zinc-200/60 rounded text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <FastForward size={14} /> CEPAT
                  </button>
                  <button 
                    onClick={() => insertTag('<phoneme alphabet="ipa" ph="...">', '</phoneme>')}
                    title="Atur Pengucapan Fonetik"
                    className="p-1.5 hover:bg-zinc-200/60 rounded text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Type size={14} /> FONETIK
                  </button>
                </div>
                <div className="group relative">
                  <AlertCircle size={14} className="text-zinc-300 hover:text-indigo-400 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-zinc-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 leading-relaxed font-medium">
                    <p className="font-bold text-indigo-400 mb-1">Tips Kustomisasi Lanjut (SSML):</p>
                    <ul className="space-y-1 list-disc pl-3">
                      <li>Gunakan <span className="text-indigo-200">TEKAN</span> untuk memberi bobot pada kata penting.</li>
                      <li>Gunakan <span className="text-indigo-200">JEDA</span> untuk memberi nafas di antara kalimat.</li>
                      <li>Gunakan <span className="text-indigo-200">FONETIK</span> untuk kata yang susah diucapkan (Gunakan simbol IPA).</li>
                    </ul>
                  </div>
                </div>
                <button 
                  onClick={() => setText("")}
                  className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-medium ml-2"
                >
                  Bersihkan
                </button>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder=" Ketik naskah Anda di sini... Gunakan 'JEDA' atau 'TEKAN' untuk kustomisasi suara."
                className="w-full h-64 p-6 resize-none focus:outline-none text-lg text-zinc-800 placeholder:text-zinc-300 leading-relaxed font-normal"
              />
              
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl mr-2">
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("serious")}
                    title="Gaya Serius"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-indigo-600 transition-all active:scale-90"
                  >
                    <ShieldCheck size={16} />
                  </button>
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("happy")}
                    title="Gaya Ceria"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-orange-500 transition-all active:scale-90"
                  >
                    <Laugh size={16} />
                  </button>
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("story_emotion")}
                    title="Gaya Bercerita"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-green-600 transition-all active:scale-90"
                  >
                    <BookOpen size={16} />
                  </button>
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("dramatic")}
                    title="Gaya Dramatis"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-red-600 transition-all active:scale-90"
                  >
                    <Theater size={16} />
                  </button>
                  <div className="w-px h-3 bg-zinc-200 mx-0.5" />
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("pauses")}
                    title="Sisipkan Jeda Alami"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-cyan-600 transition-all active:scale-90"
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("emphasis")}
                    title="Beri Penekanan (Emphasis)"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-indigo-600 transition-all active:scale-90"
                  >
                    <Target size={16} />
                  </button>
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("rate")}
                    title="Optimasi Tempo (Rate)"
                    className="p-1.5 hover:bg-white rounded-lg text-zinc-500 hover:text-emerald-600 transition-all active:scale-90"
                  >
                    <FastForward size={16} />
                  </button>
                  <div className="w-px h-3 bg-zinc-200 mx-0.5" />
                  <button
                    disabled={isAssistantLoading || !text}
                    onClick={() => handleAIScript("super_optimize")}
                    title="SUPER OPTIMIZE (Full Pipeline)"
                    className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-95 animate-pulse-subtle"
                  >
                    <Zap size={16} fill="currentColor" />
                  </button>
                </div>
                <button
                  disabled={isAssistantLoading || !text}
                  onClick={() => handleAIScript("optimize")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  {isAssistantLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  Pipeline Optimizer
                </button>
                <div className="h-4 w-px bg-zinc-200 mx-1" />
                <button
                  disabled={isAssistantLoading}
                  onClick={() => handleAIScript("polish")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-medium transition-all"
                >
                  {isAssistantLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Polish
                </button>
              </div>

              {/* 5-Stage NLP Architecture Diagram */}
              <div className="mt-4 bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] italic">Langgam NLP Pipeline Layer</span>
                  </div>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 tracking-tighter">V2.0 STABLE</span>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Norm", desc: normNeeded ? "Normalization: NUM/ABBR DETECTED" : "Normalization" },
                    { label: "Ling", desc: linguisticType ? `Analysis: ${linguisticType.toUpperCase()}` : "Analysis" },
                    { label: "Pros", desc: emphasisWords.length > 0 ? `Prosody: EMPHASIS ON ${emphasisWords.join(", ").toUpperCase()}` : `Prosody: ${prosodySettings.pitch.toUpperCase()} ${prosodySettings.rate.toUpperCase()}` },
                    { label: "Emot", desc: detectedCues.length > 0 ? `Emotion: ${detectedCues.map(c => c.toUpperCase()).join(", ")}` : "Emotion" },
                    { label: "SSML", desc: isSSML ? "SSML Generation: VALID" : "SSML Generation" }
                  ].map((step, i) => (
                    <React.Fragment key={step.label}>
                      <div className="flex-1 group relative">
                        <div className={`text-center py-3 border-2 rounded-2xl text-[11px] font-black uppercase tracking-tighter shadow-inner transition-all cursor-help ${
                          (step.label === "Norm" && normNeeded) ||
                          (step.label === "Ling" && linguisticType) || 
                          (step.label === "Pros") ||
                          (step.label === "Emot" && detectedCues.length > 0) ||
                          (step.label === "SSML" && isSSML)
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 scale-[1.02] shadow-indigo-100/50" 
                            : "bg-zinc-50 border-transparent text-indigo-500 group-hover:border-indigo-100 group-hover:bg-white"
                        }`}>
                          {step.label}
                        </div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-zinc-900 text-white text-[8px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-50 shadow-xl">
                          {step.desc}
                        </div>
                      </div>
                      {i < 4 && <div className="shrink-0 w-3 h-0.5 bg-indigo-100 rounded-full" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  disabled={isAssistantLoading}
                  onClick={() => handleAIScript("marketing")}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-all"
                >
                  Iklan (AI)
                </button>
                <button
                  disabled={isAssistantLoading}
                  onClick={() => handleAIScript("podcast")}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-all"
                >
                  Podcast (AI)
                </button>
                <button
                  disabled={isAssistantLoading}
                  onClick={() => handleAIScript("legend")}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-semibold transition-all border border-amber-100"
                >
                  Legenda (AI)
                </button>
                <button
                  disabled={isAssistantLoading}
                  onClick={() => handleAIScript("educational")}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold transition-all border border-emerald-100"
                >
                  Edu (AI)
                </button>
                <div className="h-full w-px bg-zinc-200 mx-1" />
                <button
                  onClick={() => {
                    const samples: Record<string, string> = {
                      "Pritt (Legenda)": "<speak><prosody rate=\"90%\"><prosody pitch=\"-2st\">Dahulu kala,</prosody> <break time=\"500ms\"/> <prosody pitch=\"-0.5st\">di kedalaman hutan Nusantara yang purba,</prosody> <break time=\"900ms\"/> <prosody pitch=\"-4st\">tersimpan sebuah rahasia yang sangat besar</prosody> yang telah terkubur selama ribuan tahun. <break time=\"1.2s\"/> <prosody pitch=\"+1.8st\">Sebuah legenda</prosody> tentang <emphasis level=\"strong\">keberanian tanpa batas</emphasis>, <prosody pitch=\"-1.5st\">cinta sejati yang abadi,</prosody> dan <prosody pitch=\"-5st\">pengkhianatan yang paling kelam</prosody> yang merubah sejarah dunia selamanya.</prosody></speak>",
                      "Indah": "Dapatkan promo spesial kopi susu gula aren hanya hari ini! Beli satu gratis satu untuk setiap pembelian melalui aplikasi kami. Segar, nikmat, dan pas di kantong!",
                      "Ratna": "<speak><prosody pitch=\"+1st\" rate=\"95%\">Dahulu kala, <break time=\"400ms\"/> di sebuah desa kecil yang tenang, <break time=\"600ms\"/> hiduplah seorang gadis bernama <prosody pitch=\"+2st\">Melati</prosody>. <break time=\"800ms\"/> Setiap pagi, <prosody rate=\"85%\">ia selalu menyapa bunga-bunga di taman</prosody> dengan senyuman yang paling tulus.</prosody></speak>",
                      "Andi": "Halo teman-teman! Balik lagi di channel Tekno Update. Hari ini kita bakal unboxing gadget yang paling ditunggu-tunggu tahun ini. Jangan lupa subscribe ya!",
                      "Santi": "Selamat siang, dengan Santi di sini. Ada yang bisa saya bantu terkait kendala pengiriman paket Anda? Kami akan segera memproses laporan Anda dengan cepat.",
                      "Eko": "Dalam tutorial kali ini, kita akan mempelajari bagaimana cara membuat website responsif hanya dalam sepuluh menit menggunakan teknologi terbaru. Mari kita mulai."
                    };
                    setText(samples[selectedVoice.name] || "Halo, saya adalah asisten suara digital Anda. Ketikkan naskah di sini.");
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Contoh Teks
                </button>
              </div>
            </div>
          </section>

          {/* Voice Selection Section */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2 text-zinc-600 font-bold text-sm tracking-tight">
                <Volume2 size={18} className="text-indigo-500" />
                <span className="uppercase tracking-[0.1em]">PILIH KATALOG SUARA</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Cari suara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs focus:border-indigo-500 outline-none w-40 transition-all font-medium"
                  />
                  <RefreshCw size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
                <button 
                  onClick={() => setIsCloningModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-black hover:bg-zinc-800 transition-all shadow-md active:scale-95 uppercase tracking-wider"
                >
                  <Plus size={12} /> TABUNG KLONING
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-2">
              {["All", "Long-form Educational", "Storytelling", "Casual", "Epik"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveVoiceFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeVoiceFilter === filter 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                      : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Cloned Voices UI */}
               {clonedVoices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice({
                    id: "id-ID-Wavenet-B", // High-quality fallback
                    name: v.name,
                    gender: "Male",
                    type: "Wavenet",
                    description: `Menggunakan profil suara kustom: ${v.name}`,
                    defaultPitch: 0,
                    defaultSpeed: 0
                  })}
                  className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 text-left group ${
                    selectedVoice.name === v.name
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50" 
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-lg shadow-sm"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-600 text-white font-black uppercase tracking-[0.1em]">
                      KLONING AKTIF (BETA)
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => confirmDeleteVoice(v.id, v.name, e)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title={t.deleteBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                      {selectedVoice.name === v.name && (
                        <CheckCircle2 size={24} className="text-indigo-600 animate-in zoom-in" />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-black text-xl text-zinc-950 leading-none group-hover:text-indigo-600 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold mt-1.5 italic opacity-70">
                      Profil suara dari sampel yang diunggah
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-[9px] font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg tracking-[0.2em] uppercase">CUSTOM_ENGINE</span>
                  </div>
                </button>
              ))}

              {filteredVoices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => selectVoice(voice)}
                  className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-start gap-4 text-left group ${
                    selectedVoice.id === voice.id && selectedVoice.name === voice.name
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50" 
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-lg shadow-sm"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                        voice.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                      }`}>
                        {voice.gender === "Male" ? "Laki-laki" : "Perempuan"}
                      </span>
                      {voice.isPremium && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-700 font-black uppercase tracking-[0.1em] flex items-center gap-1">
                          <Zap size={8} fill="currentColor" /> PREMIUM
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-zinc-100 text-zinc-600 font-black uppercase tracking-[0.1em]">
                        {voice.type === "Wavenet" ? "WAVENET" : "STANDARD"}
                      </span>
                    </div>
                    {selectedVoice.id === voice.id && (
                      <CheckCircle2 size={24} className="text-indigo-600 animate-in zoom-in" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-xl text-zinc-950 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                        {voice.name}
                      </h3>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all active:scale-90 opacity-0 group-hover:opacity-100" title="Dengar Sampel">
                        <Play size={14} fill="currentColor" />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold leading-relaxed line-clamp-2">
                      {voice.description}
                    </p>
                  </div>

                  <div className="mt-auto w-full pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{voice.suitability}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {voice.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-zinc-50 text-zinc-400 border border-zinc-100 rounded text-[9px] font-black uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
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
                <div key={pack.id} className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {pack.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                      {pack.category}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-xl text-zinc-950 mb-3 tracking-tight">{pack.title}</h3>
                  <p className="text-sm text-zinc-500 font-bold leading-relaxed mb-6 flex-1">
                    {pack.description}
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setText(pack.template);
                        setActiveMainTab("editor");
                      }}
                      className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Gunakan Template <ChevronRight size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        const tempText = text;
                        setText(pack.template);
                        handleSynthesize().then(() => setText(tempText));
                      }}
                      className="w-full py-4 bg-zinc-50 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                    >
                      Preview Cepat
                    </button>
                  </div>
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
              className="bg-white border border-zinc-200 rounded-[2rem] p-10 shadow-xl"
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

          {activeMainTab === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 pt-8">
                <h2 className="text-4xl font-black text-zinc-950 tracking-tight underline decoration-indigo-600 decoration-8 underline-offset-8">Rencana Harga Langgam</h2>
                <p className="text-zinc-500 font-bold text-lg max-w-2xl mx-auto italic">Pilih paket yang sesuai dengan kebutuhan konten Anda. Dari kreator pemula hingga agensi besar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  {
                    name: "Free",
                    price: "0",
                    quota: "5.000 Karakter",
                    time: "~5-8 Menit",
                    features: ["Standard Voices", "Limited SSML", "Personal Use"],
                    recommended: false
                  },
                  {
                    name: "Pemula",
                    price: "49Rb",
                    quota: "100.000 Karakter",
                    time: "~100 Menit",
                    features: ["Wavenet Access", "Basic SSML Tools", "Commercial License"],
                    recommended: false
                  },
                  {
                    name: "Kreator",
                    price: "99Rb",
                    quota: "300.000 Karakter",
                    time: "~300 Menit",
                    features: ["Priority Processing", "Content Packs Access", "Storytelling Optimizer"],
                    recommended: true
                  },
                  {
                    name: "Bisnis",
                    price: "249Rb",
                    quota: "1.000.000 Karakter",
                    time: "~1.000 Menit",
                    features: ["Custom Cloning (Beta)", "API Access", "Exclusive Voices"],
                    recommended: false
                  }
                ].map((plan) => (
                  <div 
                    key={plan.name} 
                    className={`relative bg-white border-2 rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] flex flex-col ${
                      plan.recommended 
                        ? "border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50" 
                        : "border-zinc-100 shadow-sm"
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                        Rekomendasi
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <h3 className="font-black text-2xl text-zinc-950 mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-zinc-400 text-sm font-bold">Rp</span>
                        <span className="text-4xl font-black text-zinc-950 tracking-tighter">{plan.price}</span>
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">/bulan</span>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-2xl mb-8 border border-zinc-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Kuota</span>
                        <span className="text-[10px] font-black text-indigo-600">{plan.quota}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: plan.name === "Free" ? "10%" : plan.name === "Pemula" ? "30%" : plan.name === "Kreator" ? "60%" : "100%" }}></div>
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
                          "Pemula": 49000,
                          "Kreator": 99000,
                          "Bisnis": 249000,
                          "Free": 0
                        };
                        if (plan.name === "Free") {
                          setActiveMainTab("editor");
                        } else {
                          handleCheckout(plan.name, amounts[plan.name] || 0);
                        }
                      }}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        plan.recommended 
                          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700" 
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                      } ${isCheckingOut === plan.name ? "opacity-75 cursor-wait" : ""}`}
                    >
                      {isCheckingOut === plan.name ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : null}
                      {plan.name === "Free" ? "Mulai Sekarang" : `Pilih Paket ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 rounded-[3rem] p-12 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block">Lifetime Packs</span>
                    <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">Butuh Kuota Sekali Jalan? <br/>Beli Top-up, Tanpa Langganan.</h2>
                    <p className="text-zinc-400 font-bold leading-relaxed mb-8">Ideal untuk projek video tunggal atau tugas kuliah yang mendesak. Kuota berlaku selamanya.</p>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-6">
                       <div className="text-center">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Harga</p>
                         <p className="text-2xl font-black">Rp 150Rb</p>
                       </div>
                       <div className="w-px h-10 bg-white/10"></div>
                       <div className="text-center">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Kuota</p>
                         <p className="text-2xl font-black">500.000 Chars</p>
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

        {/* Right Column: Controls & Result */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Synthesis Control Section */}
          <section className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-8 space-y-8 sticky top-24">
            <div>
              <h2 className="font-bold text-xl text-zinc-900 mb-2">Kontrol Suara</h2>
              <p className="text-sm text-zinc-500 font-medium">Kustomisasi nada & kecepatan untuk hasil alami.</p>
            </div>

            <div className="space-y-8">
              {/* Pitch Control */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Nada (Pitch)</span>
                  <span className="text-indigo-600 font-mono">{pitch > 0 ? `+${pitch}` : pitch}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-100 rounded-lg appearance-none"
                />
              </div>

              {/* Speed Control */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Kecepatan</span>
                  <span className="text-indigo-600 font-mono">{speed > 0 ? `+${speed}` : speed}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-100 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error-alert"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 font-bold leading-tight uppercase tracking-wide">Error Terdeteksi</p>
                  </div>
                  <p className="text-xs text-red-700 font-medium leading-relaxed pl-7">{error}</p>
                  {error.includes("API Key") || error.includes("Akses Ditolak") || error.includes("403") ? (
                    <div className="pl-7 mt-1 space-y-2">
                      <p className="text-[10px] text-red-500 font-semibold italic">
                        Penting: GEMINI_API_KEY tidak bisa digunakan untuk TTS. Anda HARUS menggunakan API Key dari Google Cloud Console.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href="https://console.cloud.google.com/apis/library/texttospeech.googleapis.com" 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-block text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold hover:bg-red-200 transition-colors"
                        >
                          1. AKTIFKAN API TTS →
                        </a>
                        <a 
                          href="https://console.cloud.google.com/apis/credentials" 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-block text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold hover:bg-red-200 transition-colors"
                        >
                          2. BUAT API KEY BARU →
                        </a>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button
                disabled={!text || isGenerating}
                onClick={handleSynthesize}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                  isGenerating 
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-700 hover:-translate-y-0.5"
                }`}
              >
                {isGenerating ? (
                  <RefreshCw size={24} className="animate-spin" />
                ) : (
                  <Sparkles size={24} />
                )}
                {isGenerating ? "MengoLah Suara..." : "Ekspor Audio"}
              </button>
            </div>

            {/* Audio Preview Area */}
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileAudio size={20} className="text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">Audio Preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleShare}
                      className="p-2 bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200 transition-colors"
                      title={t.shareBtn}
                    >
                      <Share2 size={18} />
                    </button>
                    <a 
                      href={audioUrl} 
                      download={`indo-voice-${selectedVoice.name.toLowerCase()}-${Date.now()}.mp3`}
                      className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  controls 
                  autoPlay
                  className="w-full h-10 accent-indigo-600"
                />
              </motion.div>
            )}

            {/* History Link */}
            {history.length > 0 && (
              <div className="pt-4 border-t border-zinc-100">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">RIWAYAT TERBARU</h4>
                <div className="space-y-3">
                  {history.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900 truncate w-32">{item.text}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">{item.voice} • {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <button 
                        onClick={() => setAudioUrl(item.url)}
                        className="p-1.5 rounded-lg border border-zinc-200 group-hover:bg-zinc-50 transition-colors"
                      >
                        <Play size={12} className="text-zinc-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-12 border-t border-zinc-200 mt-12 mb-8">
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
                      <div className="relative h-10 bg-zinc-200/50 rounded-xl overflow-hidden border border-zinc-200">
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
    </div>
  </div>
  );
}
