import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { MAX_CHARS } from "./constants";
import ShinervaLogo from "./components/ShinervaLogo";
import { handleApiError, checkResponse } from './lib/errorUtils.jsx';
import { auth, isConfigValid, initError as clientInitError } from './lib/firebase';
import { 
  logout, 
  loginWithGoogle 
} from './lib/authService';
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import {
  Waves,
  ChevronDown,
  Settings2,
  Play,
  Pause,
  Download,
  Mic,
  Loader2,
  CheckCircle,
  X,
  Check,
  Share2,
  UserPlus,
  UserCircle,
  User,
  LogOut,
  Settings,
  Gift,
  BookOpen,
  Trash2,
  Plus,
  Sun,
  Moon,
  History,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  QrCode,
  Coins,
} from "lucide-react";

import { PLANS } from "./lib/plans";
import { globalPhonetics } from "./lib/phonetics";
import LiveAudioDemo from "./components/landing/LiveAudioDemo";
import PaymentMethods from "./components/PaymentMethods";

const PACKS = {
  ID: [
    {
      id: 1,
      tag: "Epic Storytelling",
      title: "Cinematic Narrator",
      desc: "Narasi berbobot tinggi untuk dokumenter, sejarah, atau video pendek dramatis.",
      content:
        "Di balik kabut pagi yang menyelimuti Jakarta, sebuah rahasia besar terkubur selama puluhan tahun. Kini, saatnya dunia mendengarkan kebenaran yang selama ini dibisikkan oleh angin.",
    },
    {
      id: 2,
      tag: "Viral Tech",
      title: "The Explainer",
      desc: "Gaya bicara jernih, persuasif, dan modern untuk breakdown konten teknologi atau tren global.",
      content:
        "Kenapa desain Apple selalu terasa berbeda? Ini bukan soal minimalisme biasa. Ini soal bagaimana sebuah produk memahami cara kerja pikiran manusia sebelum kita menyadarinya sendiri.",
    },
    {
      id: 3,
      tag: "TikTok & Reels",
      title: "Human Fast-Paced",
      trending: true,
      desc: "Energik, natural, dan penuh emosi. Didesain untuk menahan audiens agar tidak scroll ke video lain.",
      content:
        "Tunggu sebentar! Kalian sadar nggak kalau cara kita bikin konten selama ini salah total? Sini gue spill rahasianya cuma dalam lima belas detik biar video kalian langsung FYP!",
    },
    {
      id: 4,
      tag: "Audiobook",
      title: "Emotional Storyteller",
      desc: "Deep breaths, smooth transitions, and emotional layers for books and long-form content.",
      content:
        "Dia berjalan menyusuri lorong yang sepi itu, merasakan detak jantungnya sendiri yang berdegup kencang. 'Apakah ini akhirnya?' tanyanya dalam hati, sambil menatap cahaya di ujung jalan.",
    },
    {
      id: 5,
      tag: "Marketing",
      title: "Premium Branding",
      desc: "Mewah, elegan, dan meyakinkan. Sangat cocok untuk brand high-end yang menginginkan otoritas.",
      content:
        "Kemewahan sejati bukanlah tentang apa yang Anda lihat, melainkan tentang apa yang Anda rasakan. Rasakan kenyamanan tanpa kompromi dengan koleksi terbaru kami.",
    },
    {
      id: 6,
      tag: "Podcast",
      title: "The Intimate Host",
      desc: "Santai, dekat, dan hangat. Memberikan kesan obrolan asli di pagi hari.",
      content:
        "Halo semuanya, selamat datang kembali di podcast gue. Hari ini kita bakal ngobrol santai soal gimana caranya tetap tenang di tengah hiruk pikuk kehidupan kota besar.",
    },
  ],
  EN: [
    {
      id: 1,
      tag: "Epic Storytelling",
      title: "Cinematic Narrator",
      desc: "High-stakes narration for documentaries, history, or dramatic short videos.",
      content:
        "Behind the morning mist that covers London, a great secret has been buried for decades. Now, it's time for the world to hear the truth that has been whispered by the wind.",
    },
    {
      id: 2,
      tag: "Viral Tech",
      title: "The Explainer",
      desc: "Clear, persuasive, and modern speaking style for breaking down tech content or global trends.",
      content:
        "Why does Apple's design always feel different? It's not just about simple minimalism. It's about how a product understands the way the human mind works before we even realize it ourselves.",
    },
    {
      id: 3,
      tag: "TikTok & Reels",
      title: "Human Fast-Paced",
      trending: true,
      desc: "Energetic, natural, and full of emotion. Designed to keep viewers from scrolling past.",
      content:
        "Wait a second! Do you realize that the way we've been making content is completely wrong? Here's the secret in just fifteen seconds so your videos can go viral instantly!",
    },
    {
      id: 4,
      tag: "Audiobook",
      title: "Emotional Storyteller",
      desc: "Deep breaths, smooth transitions, and emotional layers for books and long-form content.",
      content:
        "He walked down the quiet hallway, feeling his own heart beating fast. 'Is this the end?' he asked himself, while staring at the light at the end of the road.",
    },
    {
      id: 5,
      tag: "Marketing",
      title: "Premium Branding",
      desc: "Luxurious, elegant, and persuasive. Perfect for high-end brands wanting authority.",
      content:
        "True luxury is not about what you see, but what you feel. Experience uncompromising comfort with our latest collection.",
    },
    {
      id: 6,
      tag: "Podcast",
      title: "The Intimate Host",
      desc: "Relaxed, close, and warm. Gives the impression of a real morning conversation.",
      content:
        "Hi everyone, welcome back to my podcast. Today we're going to have a relaxed chat about how to stay calm amidst the hustle and bustle of big city life.",
    },
  ]
};

const FAQS = {
  ID: [
    {
      question: "Apa itu Shinerva AI TTS?",
      answer:
        "Shinerva AI TTS adalah teknologi yang mengubah tulisan menjadi suara manusia yang sangat natural menggunakan kecerdasan buatan (AI). Sederhananya, ini adalah suara robot yang kini sudah semanusiawi aslinya—lengkap dengan emosi, intonasi, dan napas—sehingga cocok untuk mengisi suara video Anda tanpa perlu rekam suara sendiri.",
    },
    {
      question: "Apa itu Shinerva?",
      answer:
        "Shinerva adalah platform AI Voice emosional pertama di Asia Tenggara. Kami melampaui Text To Speech (TTS) biasa dengan memberikan jiwa, emosi, dan karakter pada setiap narasi untuk kreator modern.",
    },
    {
      question: "Apakah kredit saya bisa hangus?",
      answer:
        "Tergantung paket Anda. Kredit dari paket Top-Up tidak akan pernah hangus. Untuk paket bulanan (Kreator ke atas), sisa kredit akan rollover ke bulan berikutnya. Namun untuk paket FREE, kuota akan diperbarui setiap bulan.",
    },
    {
      question: "Apakah suara AI ini bisa dipakai di TikTok atau YouTube?",
      answer:
        "Sangat bisa! Suara emosional kami dirancang khusus agar lolos verifikasi monetisasi sosial media (YouTube/TikTok/Reels). Kami membantu cerita Anda terasa lebih manusiawi dan mengonversi audiens lebih baik.",
    },
    {
      question: "Apa itu Voice Cloning?",
      answer:
        "Voice Cloning adalah teknologi canggih yang memungkinkan Anda membuat versi digital dari suara Anda sendiri hanya dengan mengunggah sampel rekaman berdurasi 30 detik. Suara hasil kloning ini dapat digunakan untuk menghasilkan narasi apa pun dengan tingkat kemiripan hingga 99%.",
    },
    {
      question: "Apa perbedaan teknologi Basic dan Aura?",
      answer:
        "Basic adalah teknologi standar untuk narasi fungsional. Pulse (Segera Hadir) menambahkan ekspresi emosional, sementara Aura (Segera Hadir) adalah teknologi flagship multimodal kami yang menghasilkan tekstur suara, napas, dan intonasi yang hampir mustahil dibedakan dari rekaman manusia.",
    },
    {
      question: "Bagaimana cara menghubungi bantuan?",
      answer:
        "Anda bisa menghubungi tim kami melalui WhatsApp atau Email untuk bantuan teknis, kerja sama agency, atau kebutuhan integrasi API khusus.",
    },
  ],
  EN: [
    {
      question: "What is Shinerva AI TTS?",
      answer:
        "Shinerva AI TTS is a technology that transforms written text into highly natural human speech using Artificial Intelligence. Simply put, it's a 'robot voice' that now sounds as human as the real thing—complete with emotions, intonations, and breaths—making it perfect for voiceovers without needing to record yourself.",
    },
    {
      question: "What is Shinerva?",
      answer:
        "Shinerva is the first emotional AI Voice platform in Southeast Asia. We go beyond standard Text To Speech (TTS) by giving soul, emotion, and character to every narration for modern creators.",
    },
    {
      question: "Will my credits expire?",
      answer:
        "It depends on your plan. Credits from Top-Up packs never expire. For monthly plans (Creator and above), unused credits roll over to the next month. For FREE plans, the quota is refreshed every month.",
    },
    {
      question: "Can these AI voices be used on TikTok or YouTube?",
      answer:
        "Absolutely! Our emotional voices are specifically designed to pass monetization verification on social media (YouTube/TikTok/Reels). We help your stories feel more human and convert audiences better.",
    },
    {
      question: "What is Voice Cloning?",
      answer:
        "Voice Cloning is advanced technology that allows you to create a digital version of your own voice just by uploading a 30-second recording sample. The cloned voice can then be used to generate any narration with up to 99% accuracy.",
    },
    {
      question: "What is the difference between Basic and Aura technology?",
      answer:
        "Basic is standard technology for functional narration. Pulse (Coming Soon) adds emotional expression, while Aura (Coming Soon) is our flagship multimodal technology that produces voice textures, breaths, and intonations almost indistinguishable from human recordings.",
    },
    {
      question: "How do I contact support?",
      answer:
        "You can contact our team via WhatsApp or Email for technical assistance, agency partnerships, or custom API integration needs.",
    },
  ]
};

const LANGUAGES = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩" }
];

const DEFAULT_VOICES = {
  "ID": "id-ID-Standard-A",
  "CMN": "cmn-CN-Standard-A"
};

const TRANSLATIONS = {
  ID: {
    nav: {
      home: "Beranda",
      packs: "Harga Paket",
      faq: "Tanya Jawab",
      contact: "Hubungi Kami",
      pronunciation: "Aturan Pengucapan",
      referral: "Bonus Referral",
      profile: "Profil Akun",
      history_voices: "Riwayat Suara",
      referral_bonus: "Referral & Bonus",
      subscription: "Langganan & Paket",
      dev_console: "Voice Dev Console",
      logout: "Keluar Sekarang",
      login: "Masuk",
      signup: "Mulai Gratis",
      account: "Akun Saya",
      remaining: "Karakter Tersisa"
    },
    hero: {
      tag: "Platform AI Voice Emosional Pertama di Asia Tenggara",
      title_part1: "Suara AI yang",
      title_accent: "Sangat Manusiawi",
      subtitle: "Beri jiwa pada konten Anda. Platform AI Voice pertama yang mengutamakan tekstur emosi, napas, dan intonasi manusiawi untuk kreator.",
      cta_primary: "Mulai & Dapat Bonus",
      cta_secondary: "Dengarkan Sampel"
    },
    welcome: {
      title: "Selamat Datang!",
      subtitle: "Kamu dapat 10.000 karakter gratis untuk memulai (~6 menit audio).",
      cta: "Siap!"
    },
    studio: {
      title: "Rungu Engine Studio",
      label: "Editor Naskah",
      placeholder: "Ketik atau tempel naskah Anda di sini...",
      generate: "Hasilkan Suara",
      generating: "Sedang Memproses...",
      sample: "Tes Suara",
      voicesSelection: "Bahasa & Suara",
      settings: "Pengaturan Pro",
      speed: "Kecepatan",
      pitch: "Nada",
      volume: "Volume",
      remaining: "Sisa Kredit",
      cost: "Beban",
      cost_est: "Estimasi Biaya",
      chars: "Karakter",
      limit_reached: "Batas Request Tercapai!",
      insufficient: "Kredit Tidak Mencukupi!",
      near_limit: "Hampir Mencapai Batas!",
      length: "Panjang Naskah",
      quota: "Kuota Harian",
      preview: "Tes Suara",
      download: "Unduh",
      share: "Bagikan",
      unlock_aura: "Aura Flagship & Voice Cloning (Segera Hadir) — Tekstur emosi paling manusiawi & kloning suara Anda sendiri.",
      view_packs: "Lihat Paket"
    },
    pricing: {
      title: "Pilih Paket Keajaiban Anda",
      subtitle: "Akses teknologi AI Voice tercanggih di Asia Tenggara. Hemat hingga 40% dengan paket tahunan.",
      monthly: "Bulanan",
      yearly: "Tahunan",
      current: "Paket Saat Ini",
      upgrade: "Upgrade Sekarang",
      cta: "Pilih Paket",
      save: "Hemat"
    },
    playground: {
      title: "Voice Playground",
      subtitle: "Eksplorasi kualitas suara AI terbaik kami dalam berbagai bahasa. Dengar perbedaannya dan pilih karakter yang paling cocok.",
      upgrade: "Upgrade Sekarang",
      tech: "Pilih Teknologi",
      variants: "Varian Suara",
      quality_title: "Kualitas Flagship yang Tak Terkalahkan",
      quality_desc: "Aura (Segera Hadir) menggunakan algoritma canggih untuk memberikan 'jiwa' di setiap suku kata.",
      join: "Bergabung dengan",
      creators: "Kreator",
      upgraded: "yang sudah upgrade."
    }
  },
  EN: {
    nav: {
      home: "Home",
      packs: "Pricing",
      faq: "FAQ",
      contact: "Contact Us",
      pronunciation: "Pronunciation Rules",
      referral: "Referral Bonus",
      profile: "Account Profile",
      history_voices: "Voice History",
      referral_bonus: "Referral & Bonus",
      subscription: "Subscription & Plans",
      dev_console: "Voice Dev Console",
      logout: "Logout Now",
      login: "Login",
      signup: "Start for Free",
      account: "My Account",
      remaining: "Credits Remaining"
    },
    hero: {
      tag: "Southeast Asia’s Emotional AI Voice Platform",
      title_part1: "AI Voices That",
      title_accent: "Actually Feel Human",
      subtitle: "Give soul to your content. The first AI voice platform prioritizing emotional texture, breath, and human-like intonation for creators.",
      cta_primary: "Start & Get Bonus",
      cta_secondary: "Listen to Samples"
    },
    welcome: {
      title: "Welcome!",
      subtitle: "You got 10,000 free credits to start (~6 minutes of audio).",
      cta: "Ready!"
    },
    studio: {
      title: "Rungu Engine Studio",
      label: "Script Editor",
      placeholder: "Type or paste your script here...",
      generate: "Generate Voice",
      generating: "Generating Audio...",
      sample: "Test Voice",
      voicesSelection: "Language & Voice",
      settings: "Pro Settings",
      speed: "Speed",
      pitch: "Pitch",
      volume: "Volume",
      remaining: "Credits Left",
      cost: "Cost",
      cost_est: "Cost Estimate",
      chars: "Characters",
      limit_reached: "Request Limit Reached!",
      insufficient: "Insufficient Credits!",
      near_limit: "Near Request Limit!",
      length: "Script Length",
      quota: "Daily Quota",
      preview: "Test Voice",
      download: "Download",
      share: "Share",
      unlock_aura: "Aura Flagship (Coming Soon) — The most human emotional texture for your content.",
      view_packs: "View Packs"
    },
    pricing: {
      title: "Choose Your Magic Plan",
      subtitle: "Access the most advanced AI Voice technology in Southeast Asia. Save up to 40% with annual plans.",
      monthly: "Monthly",
      yearly: "Yearly",
      current: "Current Plan",
      upgrade: "Upgrade Now",
      cta: "Select Plan",
      save: "Save"
    },
    playground: {
      title: "Voice Playground",
      subtitle: "Explore our best AI voices across multiple languages. Hear the difference and choose your character.",
      upgrade: "Upgrade Now",
      tech: "Select Technology",
      variants: "Voice Variants",
      quality_title: "Unbeatable Flagship Quality",
      quality_desc: "Aura (Coming Soon) is our next-gen engine that mimics human vocal fry, breaths, and deep emotion.",
      join: "Join over",
      creators: "Creators",
      upgraded: "who have upgraded."
    }
  }
};

const VOICES = {
  "ID": {
    "Flow": [
      { 
        id: "id-ID-Wavenet-D", 
        name: "Flow", 
        type: "GeminiFlash", 
        premium: false, 
        tier: "FREE",
        desc: "Calm, articulated narrator.",
        useCase: "Audiobook, Presentations"
      }
    ],
    "Pulse": [
      { 
        id: "id-ID-Wavenet-B", 
        name: "Pulse", 
        type: "GeminiFlash", 
        premium: true, 
        tier: "STARTER",
        desc: "Modern, energetic creator voice.",
        useCase: "TikTok, Ads, Shorts"
      }
    ],
    "Aura": [
      { 
        id: "id-ID-Wavenet-C", 
        name: "Aura", 
        type: "GeminiFlash", 
        premium: true, 
        tier: "CREATOR",
        desc: "Cinematic, emotional storyteller.",
        useCase: "Documentary, Storytelling"
      }
    ]
  }
};

const getVoiceDisplayName = (id) => {
  if (!id) return "-";
  for (const lang in VOICES) {
    for (const category in VOICES[lang]) {
      const voice = VOICES[lang][category].find(v => v.id === id);
      if (voice) return voice.name.split(" (")[0];
    }
  }
  return id.split("-").slice(-2).join("-");
};


const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null) return "-";
  if (seconds === 0) return "< 1s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};


const App = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("ID");

  const t = (path) => {
    const keys = path.split('.');
    let result = TRANSLATIONS[language];
    for (const key of keys) {
      if (!result || result[key] === undefined) return path;
      result = result[key];
    }
    return result;
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    // Auto-select default voice for the new language
    if (DEFAULT_VOICES[newLang]) {
      setVoice(DEFAULT_VOICES[newLang]);
    } else {
      const firstVoice = Object.values(VOICES[newLang]).flat().find(v => !v.comingSoon);
      if (firstVoice) setVoice(firstVoice.id);
    }
  };

  const LanguageSelector = () => (
    <div className="relative group">
      <button 
        className="flex items-center gap-1.5 bg-surface2 hover:bg-surface3 border border-surface2 px-2.5 py-1.5 rounded-full transition-all cursor-pointer text-xs font-bold text-text-muted hover:text-text"
      >
        <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
        <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.code}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-surface border border-surface2 rounded-xl shadow-xl overflow-hidden z-[80] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-left ${language === lang.code ? 'text-terracotta bg-terracotta/5' : 'text-text-muted'}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("id-ID-Wavenet-A");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [isAudioVisible, setIsAudioVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notification, setNotification] = useState(null);
  const [initError, setInitError] = useState(clientInitError);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login, signup
  const [user, setUser] = useState(null);

  const getRemainingCredits = () => {
    if (!user) return 0;
    return Math.max(0, (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0) - (user.used_chars || 0));
  };

  const getVoiceType = (voiceId) => {
    for (const lang of Object.values(VOICES)) {
      for (const group of Object.values(lang)) {
        const v = group.find(i => i.id === voiceId);
        if (v) return v.type;
      }
    }
    return "Standard";
  };

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
  });
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [lastViewedReferrals, setLastViewedReferrals] = useState(0);
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const playHeroSample = async () => {
    if (isPlayingHero) return;
    setIsPlayingHero(true);
    const sampleText = "Platform AI Voice pertama yang mengutamakan tekstur emosi, napas, dan intonasi manusiawi untuk kreator.";
    const voiceId = "id-ID-Standard-A";
    
    const url = await generateSample(sampleText, voiceId);
    if (url) {
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingHero(false);
      audio.play().catch(e => {
        console.error("Audio play failed", e);
        setIsPlayingHero(false);
      });
    } else {
       setIsPlayingHero(false);
    }
  };


  const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const voiceDropdownRef = useRef(null);
  const [newWord, setNewWord] = useState("");
  const [phoneticSuggestions, setPhoneticSuggestions] = useState([]);
  const [newPronunciation, setNewPronunciation] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(localStorage.getItem("hasSeenWelcome") === "true");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isVoiceMgmtOpen, setIsVoiceMgmtOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({ tiers: {}, limits: {} });
  const [voiceConfigLoading, setVoiceConfigLoading] = useState(false);

  const currentMaxRequestChars = user?.tier === 'FREE' 
    ? (voiceConfig.limits?.free_request_chars || 500)
    : (voiceConfig.limits?.paid_request_chars || 5000);

  const currentMultiplier = (voiceConfig.tiers && voiceConfig.tiers[getVoiceType(voice)]) || 1;
  const estimatedCost = text.length * currentMultiplier;
   const remainingCredits = getRemainingCredits();
   const isCappedByQuota = estimatedCost > remainingCredits;

  const base64ToBlob = (base64, mime) => {
    try {
      if (!base64) return null;
      
      // Clean the base64 string
      // Google TTS returns a pure base64 string, but just in case there's a prefix
      const cleanBase64 = base64.trim().replace(/^data:audio\/\w+;base64,/, "").replace(/\s/g, "");
      
      // Use efficient conversion
      const binaryString = window.atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: mime || 'audio/mpeg' });
    } catch (e) {
      console.error("[base64ToBlob] Conversion failed:", e);
      return null;
    }
  };
   const isCappedByRequest = text.length > currentMaxRequestChars;
   const isNearLimit = (text.length > 0) && (text.length > currentMaxRequestChars * 0.9 || (remainingCredits > 0 && estimatedCost > remainingCredits * 0.9) || (remainingCredits < 500));

  // Proactive notification for near-limit
  useEffect(() => {
    if (user && isNearLimit && text.length > 0) {
      const timer = setTimeout(() => {
        if (isCappedByRequest) {
           toast.error("Naskah Anda melebihi batas maksimum!");
        } else if (isCappedByQuota) {
           toast.error("Kredit Anda tidak mencukupi untuk naskah ini!");
        } else {
           toast.warning("Hampir mencapai batas kuota!");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isNearLimit, isCappedByRequest, isCappedByQuota]);

  // Low credit warning notification
  const hasWarnedLowCredits = useRef(false);
  useEffect(() => {
    if (user && remainingCredits < 1000 && !hasWarnedLowCredits.current) {
        toast("Kredit Anda hampir habis (< 1000). Harap lakukan top-up agar tetap bisa menggunakan layanan.", {
            icon: '⚠️',
            duration: 6000,
        });
        hasWarnedLowCredits.current = true;
    } else if (remainingCredits >= 1000) {
        hasWarnedLowCredits.current = false;
    }
  }, [remainingCredits, user]);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly, yearly

  useEffect(() => {
    if (!auth) {
      setIsAuthInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[Auth] Firebase state changed:", firebaseUser?.email || "No User");
      if (firebaseUser) {
        // Set basic user info immediately for a better UX
        setUser(prev => prev || { 
          email: firebaseUser.email, 
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          tier: 'FREE',
          generation_count: 0,
          used_chars: 0,
          monthly_chars: 10000,
          signup_bonus_chars: 10000,
          earned_chars: 0,
          valid_referrals: 0,
          has_received_referral_bonus: false,
          referral_code: "",
          social_bonus_status: "none"
        });

        // Sync with backend to get full profile
        try {
          const idToken = await firebaseUser.getIdToken(true);
          const options = {
            headers: { 
              "Authorization": `Bearer ${idToken}`
            },
          };
          const res = await fetch("/api/user/me", options);
          const data = await checkResponse(res, 0, options);
          if (data.user) {
            console.log("[Auth] Profile synced from backend:", data.user.email, "Verified:", data.user.emailVerified);
            setUser(data.user);
          }
        } catch (e) {
          console.warn("[Auth] Failed to sync profile:", e);
        }
      } else {
        setUser(null);
      }
      setIsAuthInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const refreshUser = async () => {
    if (!auth?.currentUser) {
      console.warn("refreshUser called but no currentUser");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken(true);
      const options = {
        headers: { 
          "Authorization": `Bearer ${idToken}`
        },
      };
      const res = await fetch("/api/user/me", options);
      const data = await checkResponse(res, 0, options);
      if (data.user) {
        console.log("[Auth] User refreshed:", data.user.email);
        setUser(data.user);
      }
    } catch (e) {
      console.warn("refreshUser failed:", e);
    }
  };

  const fetchHistory = async () => {
    if (!auth?.currentUser) return;
    setHistoryLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const options = {
        headers: { 
          "Authorization": `Bearer ${idToken}`
        },
      };
      const res = await fetch("/api/user/history", options);
      const data = await checkResponse(res, 0, options);
      if (data.history) setHistory(data.history);
    } catch (e) {
      handleApiError(e, "Gagal memuat riwayat.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchVoiceConfig = async () => {
    if (!auth?.currentUser) return;
    setVoiceConfigLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const options = {
        headers: { 
          "Authorization": `Bearer ${idToken}`
        },
      };
      const res = await fetch("/api/admin/voice-config", options);
      const data = await checkResponse(res, 0, options);
      if (data.tiers) setVoiceConfig(data);
    } catch (e) {
      // Ignored for non-admin users or unauthorized attempts
      console.warn("fetchVoiceConfig skipping or failed:", e);
    } finally {
      setVoiceConfigLoading(false);
    }
  };

  const saveVoiceConfig = async (newTiers, newLimits) => {
    if (!auth?.currentUser || user?.tier !== "ENTERPRISE") return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ tiers: newTiers, limits: newLimits }),
      };
      const res = await fetch("/api/admin/voice-config", options);
      const data = await checkResponse(res, 0, options);
      if (data.success) {
        setVoiceConfig(data.voiceConfig);
        alert("Konfigurasi berhasil disimpan!");
      }
    } catch (e) {
      handleApiError(e, "Gagal menyimpan konfigurasi.");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target)) {
        setIsVoiceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchVoiceConfig();
    
    // Diagnostic check on mount
    const checkDiag = async () => {
      try {
        const res = await fetch("/api/auth/diag");
        const data = await res.json();
        
        if (data.firebaseAdminInitialized || !data.initError) {
          // Server is healthy, clear any server-side init error
          setInitError(null);
        } else if (!user) {
          // Server failed and user is not logged in
          const serverError = data.initError && data.initError !== "null" && data.initError !== ""
            ? data.initError 
            : "Backend initialization incomplete or credentials missing.";
          
          console.warn("[System] Firebase Admin is not initialized on server.", serverError);
          // Only set the init error if it's actually an error message
          if (data.initError && data.initError !== "null" && data.initError !== "") {
            setInitError(serverError);
          } else {
            setInitError(null);
          }
        }
      } catch (e) {
        console.warn("[System] Could not fetch diagnostics:", e);
      }
    };
    checkDiag();
  }, [user]);

  useEffect(() => {
    if (isVoiceMgmtOpen) {
      fetchVoiceConfig();
    }
  }, [isVoiceMgmtOpen]);

  useEffect(() => {
    // Handle Referral URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !user) {
      setAuthData(prev => ({ ...prev, refCode: ref.toUpperCase() }));
      setAuthMode("signup");
      setIsAuthOpen(true);
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchHistory();
    // Watch for auth changes
    let unsubscribe = () => {};
    if (auth) {
      try {
        unsubscribe = auth.onAuthStateChanged(async (u) => {
          if (u) {
            await refreshUser();
          } else {
            setUser(null);
          }
          setIsAuthInitializing(false);
        }, (error) => {
          console.error("Auth state change error:", error?.message || error);
          setIsAuthInitializing(false);
        });
      } catch (e) {
        console.error("onAuthStateChanged setup failed:", e?.message || e);
        setIsAuthInitializing(false);
      }
    } else {
      setIsAuthInitializing(false);
    }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [isHistoryOpen]);

  const handleWordChange = (val) => {
    setNewWord(val);
    if (val.trim().length > 0) {
      const input = val.toLowerCase();
      const matches = Object.keys(globalPhonetics)
        .filter(k => k.toLowerCase().includes(input))
        .sort((a, b) => {
          // Priority to exact match or starts with
          const aStarts = a.toLowerCase().startsWith(input);
          const bStarts = b.toLowerCase().startsWith(input);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.length - b.length;
        })
        .slice(0, 6);
      setPhoneticSuggestions(matches);
    } else {
      setPhoneticSuggestions([]);
    }
  };

  const handleUpdatePronunciation = async (word, pronunciation) => {
    if (!auth?.currentUser) {
      alert("Harap login terlebih dahulu untuk menggunakan fitur ini.");
      return;
    }
    try {
      const idToken = await auth.currentUser.getIdToken();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ word, pronunciation }),
      };
      const res = await fetch("/api/user/pronunciations", options);
      const data = await checkResponse(res, 0, options);
      if (data.success) {
        setUser({ ...user, pronunciations: data.pronunciations });
        if (pronunciation !== null) {
          toast.success(`Aturan untuk "${word}" berhasil disimpan.`);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      handleApiError(err, "Gagal memperbarui panduan pengucapan.");
    }
  };

  const handleTestPronunciation = async (word, pronunciation) => {
    if (!auth?.currentUser) return;
    if (!word || !pronunciation) {
      toast.error("Masukkan kata asli dan cara baca terlebih dahulu.");
      return;
    }
    setTestLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      // Use a distinct phrase to test the pronunciation
      const testText = `Begini cara baca ${word}: ${pronunciation}`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          text: testText, 
          voice, 
          speed: 1, 
          pitch: 0, 
          volume: 0 
        }),
      };
      const res = await fetch("/api/tts", options);
      const data = await checkResponse(res, 0, options);
      if (data.audioContent) {
        const mimeType = 'audio/mpeg';
        const blob = base64ToBlob(data.audioContent, mimeType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play().catch(e => {
            console.error("[Pronunciation Test] Playback failed:", e);
            toast.error("Gagal memutar suara contoh pengucapan.");
          });
        } else {
          toast.error("Gagal memproses contoh suara.");
        }
      }
    } catch (err) {
      handleApiError(err, "Gagal mencoba suara.");
    } finally {
      setTestLoading(false);
    }
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const textAreaRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [generatedInfo, setGeneratedInfo] = useState(null);
  const [isTeaser, setIsTeaser] = useState(false);
  const [isStudioWarningOpen, setIsStudioWarningOpen] = useState(false);
  const [isVerificationDismissed, setIsVerificationDismissed] = useState(false);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const insertAtCursor = (insertion) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = text;

    const newText =
      currentText.substring(0, start) + insertion + currentText.substring(end);
    setText(newText);

    // Reset cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertion.length,
        start + insertion.length,
      );
    }, 0);
  };

  const applyEmphasis = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      alert("Silakan blok kata yang ingin diberi penekanan terlebih dahulu.");
      return;
    }

    const selectedText = text.substring(start, end);
    const emphasisText = `[EMPHASIS_START]${selectedText}[EMPHASIS_END]`;

    const newText =
      text.substring(0, start) + emphasisText + text.substring(end);
    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + emphasisText.length,
        start + emphasisText.length,
      );
    }, 0);
  };

  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      clearInterval(cooldownTimerRef.current);
    }
    return () => clearInterval(cooldownTimerRef.current);
  }, [cooldown]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
            console.warn("Auto-play blocked or failed:", e);
            setIsPlaying(false);
        });
    }
  }, [audioUrl]);

  const handlePreviewVoice = async () => {
    if (!user) {
      toast.error("Silakan login untuk mencoba suara.");
      return;
    }
    
    setTestLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          voice,
          speed,
          pitch,
          volume,
          isSample: true
        })
      };
      const res = await fetch("/api/tts", options);
      const data = await checkResponse(res, 0, options);
      if (data.audioContent) {
        const mimeType = 'audio/mpeg';
        const blob = base64ToBlob(data.audioContent, mimeType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play().catch(e => console.error("[Preview] Play error:", e));
          toast.success(`Berhasil memutar contoh suara ${getVoiceDisplayName(voice)}`);
        } else {
          toast.error("Gagal memproses data suara.");
        }
      }
    } catch (err) {
      console.error(`[TTS Preview] Generation failed for voice: ${voice}`, err?.message || err);
      if (err.data && err.data.error) {
        toast.error(`Gagal: ${err.data.error}`);
      } else {
        toast.error(err.message || "Gagal tes suara");
      }
    } finally {
      setTestLoading(false);
    }
  };

  const generateSample = async (sampleText, voiceId) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: sampleText, 
          voice: voiceId, 
          isSample: true 
        }),
      };

      const res = await fetch("/api/tts/sample", options);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Gagal mengambil sampel suara (${res.status})`);
      }
      const data = await res.json();
      
      if (data.audioContent) {
        const mimeType = 'audio/mpeg';
        const blob = base64ToBlob(data.audioContent, mimeType);
        return blob ? URL.createObjectURL(blob) : null;
      }
      return null;
    } catch (err) {
      console.error("[Playground] Sample failed for voice:", voiceId, "Error:", err?.message || err);
      toast.error(`Gagal memuat pratinjau suara: ${err?.message || 'Kesalahan jaringan'}`);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!auth?.currentUser) {
      toast.error("Silakan masuk/daftar terlebih dahulu untuk melakukan generasi suara.");
      setAuthMode("login");
      setIsAuthOpen(true);
      return;
    }

    if (!text.trim()) {
      toast.error("Silakan tulis naskah terlebih dahulu.");
      return;
    }

    if (isCappedByRequest) {
      toast.error(`Naskah terlalu panjang! Batas maksimum untuk paket ${user?.tier || 'FREE'} adalah ${currentMaxRequestChars.toLocaleString("id-ID")} karakter.`);
      return;
    }

    if (isCappedByQuota) {
      toast.error(`Kredit tidak mencukupi! Anda butuh ${estimatedCost.toLocaleString("id-ID")} kredit, sisa kredit Anda adalah ${remainingCredits.toLocaleString("id-ID")}.`);
      return;
    }

    if (cooldown > 0) {
      toast.error(`Harap tunggu ${cooldown} detik lagi sebelum generasi berikutnya.`);
      return;
    }

    const isStudio = voice.includes('Studio') || voice.includes('Chirp');
    if (isStudio) {
      setIsStudioWarningOpen(true);
      return;
    }

    await proceedWithGenerate();
  };

  const proceedWithGenerate = async () => {
    setStatus("loading");
    setLoadingMessage("Menghubungkan ke Rungu Engine...");
    setShowFallback(false);
    const startTime = Date.now();

    try {
      if (!auth?.currentUser) throw new Error(" Anda harus login untuk melakukan generasi.");
      
      const idTokenBuffer = await auth.currentUser.getIdToken(true);
      
      setLoadingMessage("Mensintesis gelombang audio...");
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idTokenBuffer}`
        },
        body: JSON.stringify({ 
          text, 
          voice, 
          speed: parseFloat(speed), 
          pitch: parseFloat(pitch), 
          volume: parseFloat(volume) 
        }),
      };

      console.log(`[TTS] Requesting voice: ${voice} for user: ${auth.currentUser.uid}`);
      const res = await fetch("/api/tts", options);
      const data = await checkResponse(res, 0, options);

      if (data.audioContent) {
        setLoadingMessage("Mengunduh hasil...");
        const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[TTS] Synthesis successful in ${generationTime}s. Audio Size: ${Math.round(data.audioContent.length / 1024)} KB`);
        
        const mimeType = 'audio/mpeg';
        
        let url;
        const blob = base64ToBlob(data.audioContent, mimeType);
        if (blob) {
          try {
            url = URL.createObjectURL(blob);
            
            // Clean up previous blob URL
            if (audioUrl && audioUrl.startsWith('blob:')) {
              URL.revokeObjectURL(audioUrl);
            }
          } catch (blobErr) {
            console.error("[TTS] Object URL creation failed:", blobErr);
            url = `data:${mimeType};base64,${data.audioContent}`;
          }
        } else {
          console.warn("[TTS] Blob creation failed, falling back to data URI");
          url = `data:${mimeType};base64,${data.audioContent}`;
        }

        setAudioUrl(url);
        setGeneratedInfo({
          duration: data.duration,
          voice: data.voice,
          time: generationTime
        });
        setIsTeaser(data.isTeaser || false);
        setStatus("success");
        setIsAudioVisible(true);
        
        // Cooldown management
        const cdTime = (!user || user.tier === 'FREE') ? 15 : 2;
        setCooldown(cdTime);

        toast.success(`Suara berhasil dibuat dalam ${generationTime} detik!`, { icon: '✨' });
        
        setTimeout(() => setStatus("idle"), 3000);
        refreshUser();
        
        if (user?.generation_count && user.generation_count % 3 === 0) {
            toast("Share kreasi Anda & tag @rungu.id untuk bonus karakter!", { icon: '🎁', duration: 6000 });
        }
      } else {
        throw new Error("Gagal menerima data suara dari server.");
      }
    } catch (err) {
      console.error("[TTS] Critical error in proceedWithGenerate:", err?.message || err);
      setStatus("idle");
      setLoadingMessage("");
      setShowFallback(true);
      
      if (err.status === 429 && err.data?.cooldownRemaining) {
        setCooldown(err.data.cooldownRemaining);
      }
      
      // Special handling for specific text errors
      if (err.message?.includes("naskah terlalu panjang")) {
         toast.error("Naskah melebihi batas karakter.");
      } else if (err.message?.includes("kredit tidak mencukupi")) {
         toast.error("Kredit karakter Anda habis.");
      } else {
         handleApiError(err, "Gagal memproses suara. Pastikan naskah dan pilihan suara sudah benar.");
      }
    }
  };

  const fallbackTTS = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    
    // Strip all potential bracketed tags and excessive punctuation
    let cleanedText = text
      .replace(/\[.*?\]/g, '')
      .replace(/[\*\_\~]/g, '')
      .replace(/\.id\b/gi, " dot ay id ")
      .replace(/\bAI\b/gi, "ey ay")
      .replace(/\bIT\b/g, "ay ti")
      .replace(/\bCEO\b/gi, "si i o")
      .replace(/\bVIP\b/gi, "vi ay pi")
      .replace(/\bAPI\b/gi, "ei pi ay");
      
    // Add suffix with pause
    cleanedText += ". Dibuat oleh shinerva dot ay id.";
      
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = parseFloat(speed);
    // map pitch -20 to 20 into 0 to 2
    utterance.pitch = 1 + (parseFloat(pitch) / 20);
    // map volume -10 to 10 into 0 to 1
    utterance.volume = 0.5 + (parseFloat(volume) / 20);

    const voices = synth.getVoices();
    const idVoices = voices.filter((v) => v.lang.includes("id"));
    if (idVoices.length > 0) utterance.voice = idVoices[0];

    utterance.onend = () => setIsPlaying(false);

    setStatus("success");
    setIsAudioVisible(true);
    setTimeout(() => setStatus("idle"), 3000);

    // We can't generate a real audio tag from this easily, so we just auto play
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Manage fallback synth state
      if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          window.speechSynthesis.pause();
          setIsPlaying(false);
        }
      }
    }
  };

  const handleShare = async () => {
    if (!audioUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const file = new File([blob], "shinerva-audio.mp3", {
          type: "audio/mpeg",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Audio dari Shinerva Text To Speech",
            text: "Cek audio dari Shinerva Text To Speech - Generator Suara AI Indonesia",
          });
        } else {
          await navigator.share({
            title: "Shinerva Text To Speech",
            text: "Saya baru saja membuat audio keren di Shinerva Text To Speech!",
            url: window.location.href,
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err?.message || err);
        }
      }
    } else {
      const shareText = `Saya baru saja membuat audio keren di Shinerva Text To Speech! Coba sekarang: ${window.location.href}`;
      try {
        await navigator.clipboard.writeText(shareText);
        alert(
          "Pesan dan tautan Shinerva Text To Speech berhasil disalin ke clipboard! Bagikan sekarang ke temanmu.",
        );
      } catch (err) {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          "_blank",
        );
      }
    }
  };

  const handleApplyPack = (content) => {
    // Feature disabled: Coming Soon
    alert("Fitur Content Packs akan segera hadir!");
    return;
    // setText(content);
    // document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
  };

  const [authEmail, setAuthEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const handleMagicLinkSignIn = async (e) => {
    e.preventDefault();
    if (!authEmail) return toast.error("Masukkan email Anda");
    
    setIsMagicLoading(true);
    const actionCodeSettings = {
      url: window.location.href, // Returns to original page
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, authEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', authEmail);
      setMagicLinkSent(true);
      toast.success("Link masuk dikirim! Cek inbox/spam email Anda.");
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error(error.message);
    } finally {
      setIsMagicLoading(false);
    }
  };

  // Handle incoming magic link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Harap masukkan email Anda kembali untuk verifikasi');
      }
      
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            toast.success("Berhasil masuk!");
            setIsAuthOpen(false);
          })
          .catch((error) => {
            console.error("Link verification error:", error);
            toast.error("Link tidak valid atau sudah kedaluwarsa.");
          });
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      console.log("[Auth] Starting Google sign-in...");
      const userCredential = await loginWithGoogle();
      console.log("[Auth] Google sign-in successful in Firebase:", userCredential.user.email);
      
      // Explicit sync with backend to ensure user is created/updated
      try {
        const idToken = await userCredential.user.getIdToken(true);
        console.log("[Auth] Syncing Google user with backend...");
        const options = {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${idToken}`
          },
        };
        const syncRes = await fetch("/api/auth/sync", options);
        
        const syncData = await checkResponse(syncRes, 0, options);
        if (syncData.user) {
          console.log("[Auth] User synced & created/found:", syncData.user.email);
          setUser(syncData.user);
        }
      } catch (syncErr) {
        console.error("[Auth] Background sync error:", syncErr?.message || syncErr);
      }

      await refreshUser();
      setIsAuthOpen(false);
      toast.success("Login Google berhasil!");
    } catch (err) {
      console.error("[Auth] Google sign-in error:", err?.message || err);
      toast.error(err.message || "Gagal masuk dengan Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success('Berhasil keluar.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePurchase = async (planId) => {
    if (!auth?.currentUser) {
      setAuthMode("signup");
      setIsAuthOpen(true);
      toast.error(language === 'ID' ? "Silakan login terlebih dahulu untuk melakukan pembelian." : "Please login first to make a purchase.");
      return;
    }

    setPurchaseLoading(planId);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          planId,
          billingCycle
        }),
      };
      const res = await fetch("/api/payment/create", options);

      const data = await checkResponse(res, 0, options);
      
      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            console.log('success', result);
            toast.success("Pembayaran berhasil! Kredit Anda akan segera diperbarui.");
            refreshUser();
          },
          onPending: (result) => {
            console.log('pending', result);
            toast("Pembayaran pending. Silakan selesaikan pembayaran Anda.", { icon: '⏳' });
          },
          onError: (result) => {
            console.log('error', result);
            toast.error("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            console.log('customer closed the popup without finishing the payment');
          }
        });
      }
    } catch (err) {
      handleApiError(err, "Gagal memulai proses pembayaran.");
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (!isConfigValid || (initError && !user)) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-terracotta/20 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-terracotta" />
        </div>
        <h1 className="text-2xl font-black text-text mb-2">Konfigurasi Firebase Bermasalah</h1>
        <p className="text-text-muted max-w-md mb-8">
          Aplikasi tidak dapat terhubung ke Firebase karena beberapa variabel lingkungan belum diatur atau salah. 
          Silakan periksa pengaturan .env atau pastikan API Key sudah benar.
        </p>
        <div className="bg-surface2 p-4 rounded-xl border border-surface2 text-left w-full max-w-md">
          <h3 className="text-xs font-black text-terracotta uppercase mb-2">Pesan Kesalahan:</h3>
          <p className="text-xs font-mono text-text-muted break-all mb-4">
            {initError || clientInitError || "Konfigurasi Firebase ditemukan namun terjadi kegagalan saat inisialisasi layanan (Check Console for details)."}
          </p>
          
          <div className="mt-4 p-3 bg-black/20 rounded border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Client Config:</span> <span className="text-green-400 font-bold">{isConfigValid ? "Healthy" : "Invalid"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Client Error:</span> <span className={clientInitError ? "text-red-400" : "text-green-400"}>{clientInitError || "Healthy"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Server Error:</span> <span className={initError ? "text-red-400" : "text-green-400"}>{initError || "Healthy"}</span></div>
            <div className="flex justify-between border-t border-white/5 mt-1 pt-1"><span className="text-gray-500">Project ID:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "Missing"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">API Key:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_API_KEY ? (import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 6) + "...") : "Missing"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">App ID:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_APP_ID ? "Present" : "Missing"}</span></div>
          </div>

          <h3 className="text-xs font-black text-blue-400 uppercase mb-2 border-t border-surface/50 pt-4 mt-4">Saran Perbaikan:</h3>
          <ul className="text-xs text-text-muted list-disc pl-4 space-y-2">
            <li>Buka <b>Settings</b> &gt; <b>Secrets</b> di AI Studio.</li>
            <li>Pastikan <b>FIREBASE_PROJECT_ID</b>, <b>FIREBASE_CLIENT_EMAIL</b>, dan <b>FIREBASE_PRIVATE_KEY</b> sudah diisi untuk sisi server.</li>
            <li>Buka Firebase Console &gt; Project Settings &gt; <b>Service Accounts</b> untuk mendapatkan kredensial tersebut.</li>
            <li>Pastikan <b>Cloud Firestore</b> sudah diaktifkan di Firebase Console.</li>
            <li>Jika Anda baru saja mengaktifkannya, tunggu 1-2 menit lalu muat ulang halaman.</li>
          </ul>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 bg-terracotta px-6 py-3 rounded-full font-bold text-white border-none cursor-pointer hover:bg-trdark transition-colors"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-terracotta animate-spin mb-4" />
        <p className="text-text-muted font-medium">Menghubungkan ke layanan...</p>
      </div>
    );
  }

  const handleReferralClick = () => {
    setIsReferralOpen(true);
    if (user) {


    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <nav className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-1"></div>
            
            <div className="flex items-center justify-center gap-3">
              <ShinervaLogo className="w-10 h-10 text-terracotta" />
              <span className="font-black text-2xl tracking-tight text-terracotta cursor-pointer">
                SHINERVA
              </span>
            </div>

            <div className="flex items-center justify-end flex-1 gap-2">
              <div className="flex items-center gap-3">
                {user ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-text px-6 py-2.5 rounded-full text-sm font-semibold border border-surface2 hover:border-terracotta hover:bg-terracotta/5 transition-all cursor-pointer"
                  >
                    Akun Saya
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      switchAuthMode("login");
                      setIsAuthOpen(true);
                    }}
                    className="text-text px-6 py-2.5 rounded-full text-sm font-semibold border border-surface2 hover:border-terracotta hover:bg-terracotta/5 transition-all cursor-pointer"
                  >
                    Masuk
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-28 right-4 z-[60] bg-terracotta text-white px-6 py-3 rounded-xl shadow-lg border border-terracotta/50">
          {notification}
        </div>
      )}

      {/* Welcome Message */}
      {user && user.generation_count === 0 && !hasSeenWelcome && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[60] bg-dark border border-terracotta p-6 rounded-2xl shadow-2xl max-w-sm text-center">
             <div className="text-4xl mb-4">🎉</div>
             <h3 className="font-black text-xl mb-2">{t('welcome.title')}</h3>
             <p className="text-gray-400 text-sm mb-4">{t('welcome.subtitle')}</p>
             <button 
               onClick={() => {
                 setHasSeenWelcome(true);
                 localStorage.setItem("hasSeenWelcome", "true");
                 refreshUser();
               }} 
               className="bg-terracotta px-6 py-2 rounded-full font-bold text-sm border-none cursor-pointer text-white"
             >
               {t('welcome.cta')}
             </button>
        </div>
      )}

      {/* Verification Banner */}
      {user && !user.emailVerified && auth?.currentUser && !isVerificationDismissed && (
        <div className="fixed top-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-w-4xl mx-auto bg-terracotta text-white rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Verifikasi Email Anda</p>
                <p className="text-xs text-white/80">Silakan verifikasi email Anda untuk memastikan keamanan akun. Cek folder Inbox/Spam di email {auth?.currentUser?.email}.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={handleResendVerification}
                disabled={authLoading}
                className="flex-1 md:flex-none px-4 py-2 bg-white text-terracotta rounded-xl text-xs font-black hover:bg-gray-100 transition-colors disabled:opacity-50 border-none cursor-pointer"
              >
                {authLoading ? 'Mengirim...' : 'Kirim Ulang'}
              </button>
              <button 
                onClick={handleRefreshVerificationStatus}
                disabled={authLoading}
                className="flex-1 md:flex-none px-4 py-2 bg-terracotta-dark/20 text-white border border-white/20 rounded-xl text-xs font-black hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cek Status
              </button>
              <button 
                onClick={() => setIsVerificationDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white border-none bg-transparent cursor-pointer"
                title="Tutup banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow pt-12 pb-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terracotta/10 rounded-full blur-[120px] -z-10"></div>
          <div className="flex justify-center mb-6">
            <span className="bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-terracotta/20">
              Southeast Asia’s Emotional AI Voice Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-tight text-text">
            {t('hero.title_part1')} <br />
            <span className="gradient-text">{t('hero.title_accent')}</span>
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-3xl mx-auto font-medium">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthOpen(true);
                }}
                className="bg-terracotta hover:bg-trdark text-white px-8 py-4 rounded-full font-black text-lg transition-all transform hover:scale-105 shadow-2xl shadow-terracotta/30 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-xl">✨</span>
                {t('hero.cta_primary')}
              </button>
          </div>
        </section>

        {/* Live Audio Demo */}
        <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <LiveAudioDemo />
        </section>

        {/* Aura Section */}
        <section
          id="aura"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-32"
        >
          {user && (
            <div className="bg-surface2 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center border border-surface2 shadow-xl gap-4">
              <div className="flex-1 w-full">
                <div className="text-sm font-bold text-text-muted mb-2">
                  Sisa Kuota Total
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-text">
                    {Math.max(
                      0,
                      (user.monthly_chars || 0) +
                        (user.signup_bonus_chars || 0) +
                        (user.earned_chars || 0) -
                        (user.used_chars || 0),
                    ).toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">karakter</span>
                </div>
                <div className="w-full bg-dark h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-terracotta h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((user.used_chars || 0) / Math.max(1, (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0))) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Bulanan</div>
                    <div className="font-bold text-text">{(user.monthly_chars || 0).toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Bonus Signup</div>
                    <div className="font-bold text-text">{(user.signup_bonus_chars || 0).toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Estimasi Video</div>
                    <div className="font-bold text-green-500">~{Math.floor(Math.max(0, (user.monthly_chars || 0) + (user.signup_bonus_chars || 0) + (user.earned_chars || 0) - (user.used_chars || 0)) / 1500)} Video</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Digunakan</div>
                    <div className="font-bold text-terracotta">{(user.used_chars || 0).toLocaleString("id-ID")}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[250px]">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="bg-dark p-3 rounded-xl border border-surface2 flex justify-between items-center hover:bg-surface2 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-terracotta" />{" "}
                    <span className="text-sm font-bold">
                      Riwayat Penggunaan
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
                </button>
                {user.tier === "ENTERPRISE" && (
                  <button
                    onClick={() => setIsVoiceMgmtOpen(true)}
                    className="bg-dark p-3 rounded-xl border border-surface2 flex justify-between items-center hover:bg-surface2 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-terracotta" />{" "}
                      <span className="text-sm font-bold">
                        Voice Management
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
                  </button>
                )}
                <button
                  onClick={() => setIsReferralOpen(true)}
                  className="bg-dark p-3 rounded-xl border border-surface2 flex justify-between items-center hover:bg-surface2 transition-colors cursor-pointer text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-terracotta" />{" "}
                    <span className="text-sm font-bold">
                      Referral ({user.valid_referrals}/2)
                    </span>
                  </div>
                  <span className="text-xs bg-surface2 px-2 py-1 rounded text-gray-300">
                    {user.referral_code}
                  </span>
                </button>
                <div className="p-3 rounded-xl bg-surface/50 border border-surface2/50 flex justify-between items-center opacity-70">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-text-muted" />
                    <span className="text-sm font-bold text-text-muted">Social Bonus (Soon)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-surface rounded-3xl p-6 md:p-10 border border-surface2 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terracotta/20 via-terracotta to-terracotta/20"></div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-bold text-text-muted">
                      {t('studio.label')}
                    </label>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {estimatedCost > 0 && (
                          <span className="text-[10px] font-bold text-text-muted bg-surface2 px-2 py-0.5 rounded">
                            {t('studio.cost')}: {estimatedCost.toLocaleString(language === 'ID' ? "id-ID" : "en-US")} {language === 'ID' ? 'Kredit' : 'Credits'}
                          </span>
                        )}
                      </div>
                      {(isCappedByRequest || isCappedByQuota) && (
                        <span className="text-[10px] text-terracotta font-bold mt-1 animate-pulse">
                          {isCappedByRequest ? t('studio.limit_reached') : t('studio.insufficient')}
                        </span>
                      )}
                      {!isCappedByRequest && !isCappedByQuota && isNearLimit && (
                        <span className="text-[10px] text-terracotta font-bold mt-1">
                          Hampir Mencapai Batas!
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`w-full h-64 bg-dark text-text rounded-2xl p-5 border border-surface2 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none resize-none transition-all ${(isNearLimit || isCappedByRequest || isCappedByQuota) ? "border-terracotta ring-1 ring-terracotta" : ""}`}
                    placeholder={t('studio.placeholder')}
                  />
                  {user && (
                    <div className="mt-2 flex justify-between items-center text-[10px] font-bold">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <span>{t('studio.length')}:</span>
                          <span className={`${isCappedByRequest ? "text-terracotta" : "text-text"} font-mono`}>
                            {text.length.toLocaleString("id-ID")} / {currentMaxRequestChars.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-muted border-l border-surface2/30 pl-4">
                          <span>{t('studio.remaining')}:</span>
                          <span className={remainingCredits < 1000 ? "text-terracotta" : "text-text"}>
                            {remainingCredits.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                      {user.tier === 'FREE' && (
                        <div className="text-terracotta bg-terracotta/5 px-2 py-0.5 rounded border border-terracotta/10">
                          {t('studio.quota')}: {Math.max(0, 20 - user.generation_count)} / 20
                        </div>
                      )}
                    </div>
                  )}
                </div>
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <label className="block text-sm font-bold text-text-muted">
                      {t('studio.voicesSelection')}
                    </label>
                    <div className="flex bg-dark p-1 rounded-xl border border-surface2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all border-none cursor-pointer ${
                            language === lang.code 
                            ? "bg-terracotta text-white shadow-lg shadow-terracotta/20" 
                            : "text-text-muted hover:text-text hover:bg-surface2/50"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="hidden xs:inline">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1" ref={voiceDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                            className="w-full bg-dark text-text rounded-xl py-4 pl-4 pr-10 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer font-bold text-sm tracking-wide text-left flex items-center justify-between"
                          >
                            <span className="truncate">{getVoiceDisplayName(voice)}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isVoiceDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isVoiceDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-50 left-0 right-0 mt-2 bg-surface rounded-2xl border border-surface2 shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar"
                              >
                                {Object.entries(VOICES[language]).map(([category, voiceList]) => (
                                  <div key={category}>
                                    <div className="px-4 py-2 bg-surface2/30 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-md border-b border-surface2/30">
                                      {category}
                                    </div>
                                    <div className="p-1">
                                      {voiceList.map((v) => {
                                        const tierOrder = ["FREE", "STARTER", "KREATOR", "PRODUKTIF", "BISNIS", "ENTERPRISE"];
                                        const userTierIndex = tierOrder.indexOf(user?.tier || "FREE");
                                        const requiredTierIndex = tierOrder.indexOf(v.tier || "FREE");
                                        const isWavenet = v.type === 'Wavenet' || v.id.includes('Wavenet');
                                        const isUserFree = userTierIndex < 1;
                                        const isLocked = (v.premium && userTierIndex < requiredTierIndex) || (isWavenet && isUserFree) || v.comingSoon;
                                        const isSelected = voice === v.id;
                                        const isStudio = v.type === 'Studio' || v.glow;

                                        return (
                                          <button
                                            key={v.id}
                                            type="button"
                                            disabled={isLocked}
                                            onClick={() => {
                                              setVoice(v.id);
                                              setIsVoiceDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group relative overflow-hidden ${
                                              isSelected ? 'bg-surface2' : 'hover:bg-surface2/50'
                                            } ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                                          >
                                            <div className="flex flex-col relative z-20">
                                              <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${isSelected ? 'text-terracotta' : 'text-text'}`}>
                                                  {isLocked && !v.comingSoon && "🔒 "}{v.name}
                                                </span>
                                                {v.comingSoon && (
                                                  <span className="text-[8px] font-black bg-surface2 text-gray-400 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                                    SOON
                                                  </span>
                                                )}
                                                {isStudio && !v.comingSoon && (
                                                  <span className="text-[8px] font-black bg-terracotta text-white px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(231,76,60,0.5)]">
                                                    AURA
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-[10px] text-gray-500 font-medium">
                                                {v.comingSoon 
                                                  ? (language === 'ID' ? 'Segera Hadir' : 'Coming Soon')
                                                  : `Beban: ${voiceConfig.tiers[v.type] || 1}x Kredit`
                                                }
                                              </span>
                                            </div>
                                            
                                            {isStudio && (
                                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-terracotta/50 shadow-[0_0_15px_rgba(231,76,60,0.5)]"></div>
                                            )}
                                            
                                            {isSelected && (
                                              <Check className="w-4 h-4 text-terracotta relative z-20" />
                                            )}

                                            {isStudio && (
                                              <div className="absolute inset-0 bg-gradient-to-r from-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      <button
                        onClick={handlePreviewVoice}
                        disabled={testLoading}
                        className="bg-surface2 hover:bg-surface3 text-text px-4 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 border border-surface2"
                        title="Tes Suara Ini"
                      >
                        {testLoading ? (
                          <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Play className="w-4 h-4 text-terracotta" />
                        )}
                        <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Tes Suara</span>
                      </button>
                    </div>

                    {/* Selected Voice Info Box */}
                    {(() => {
                      const selectedVoice = Object.values(VOICES[language]).flat().find(v => v.id === voice);
                      if (!selectedVoice) return null;
                      const isStudio = selectedVoice.type === 'Studio' || selectedVoice.glow;

                      return (
                        <div className={`mt-3 rounded-xl p-4 border relative overflow-hidden group transition-all ${
                          isStudio 
                          ? 'bg-terracotta/10 border-terracotta/30 shadow-[0_0_20px_rgba(231,76,60,0.1)]' 
                          : 'bg-surface2/30 border-surface2/50'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg border ${
                              isStudio ? 'bg-terracotta text-white border-terracotta/50' : 'bg-dark border-surface2 text-terracotta'
                            }`}>
                              <Mic className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white uppercase tracking-wider">
                                    Tier: {selectedVoice.type} ({selectedVoice.tier})
                                  </span>
                                  {isStudio && (
                                    <span className="text-[8px] font-black bg-white text-terracotta px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                      FLAGSHIP
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-text-muted">Beban:</span>
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                                    isStudio 
                                    ? 'text-white bg-terracotta border-terracotta/20' 
                                    : 'text-terracotta bg-terracotta/10 border-terracotta/20'
                                  }`}>
                                    {voiceConfig.tiers[selectedVoice.type] || 1}x Kredit
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-gray-400 font-medium mb-2 leading-relaxed">
                                {selectedVoice.desc}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                  isStudio ? 'bg-terracotta/20 text-white border-terracotta/30' : 'bg-dark text-text-muted border-surface2'
                                }`}>
                                  Cocok Untuk:
                                </span>
                                <span className={`text-[10px] font-bold ${isStudio ? 'text-white' : 'text-gray-300'}`}>
                                  {selectedVoice.useCase}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Decorative glow */}
                          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${
                            isStudio ? 'bg-terracotta/20 group-hover:bg-terracotta/30' : 'bg-terracotta/5 group-hover:bg-terracotta/10'
                          }`}></div>
                        </div>
                      );
                    })()}

                    {(!user || user.tier === 'FREE') && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] bg-terracotta/10 text-terracotta p-2 rounded-lg border border-terracotta/20">
                        <Gift className="w-3 h-3" />
                        <span className="font-bold">{t('studio.unlock_aura')} <a href="#pricing" className="underline">{t('studio.view_packs')}</a></span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                    <div>
                      <label className="block text-sm font-bold text-text-muted mb-2">
                        Kecepatan ({speed}x)
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speed}
                        onChange={(e) => setSpeed(e.target.value)}
                        className="w-full h-2 bg-dark rounded-lg appearance-none cursor-pointer mt-3 accent-terracotta"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Lambat</span>
                        <span>Normal</span>
                        <span>Cepat</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-muted mb-2">
                        Pitch ({pitch})
                      </label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                        className="w-full h-2 bg-dark rounded-lg appearance-none cursor-pointer mt-3 accent-terracotta"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Rendah</span>
                        <span>Normal</span>
                        <span>Tinggi</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-muted mb-2">
                        Volume ({volume > 0 ? `+${volume}` : volume} dB)
                      </label>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="w-full h-2 bg-dark rounded-lg appearance-none cursor-pointer mt-3 accent-terracotta"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Kecil</span>
                        <span>Normal</span>
                        <span>Besar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-dark rounded-2xl p-5 border border-surface2">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-terracotta" /> Pengaturan
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Sisipkan Jeda
                      </span>
                      <button
                        onClick={() => insertAtCursor(" ... ")}
                        className="text-xs bg-surface2 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 cursor-pointer"
                      >
                        + 1 Detik
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Penekanan Kata
                      </span>
                      <button
                        onClick={applyEmphasis}
                        className="text-xs bg-surface2 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 cursor-pointer"
                      >
                        Terapkan
                      </button>
                    </div>

                    <div className="pt-2 border-t border-surface2">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-3">
                        Gaya Bicara (Expressive)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const sel = window.getSelection().toString();
                            insertAtCursor(`[semangat]${sel || "teks"}[/semangat]`);
                          }}
                          className="text-[10px] bg-terracotta/10 hover:bg-terracotta/20 text-terracotta font-bold py-2 rounded-lg border border-terracotta/20 transition-all cursor-pointer"
                        >
                          🔥 Semangat
                        </button>
                        <button
                          onClick={() => {
                            const sel = window.getSelection().toString();
                            insertAtCursor(`[serius]${sel || "teks"}[/serius]`);
                          }}
                          className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold py-2 rounded-lg border border-blue-500/20 transition-all cursor-pointer"
                        >
                          💼 Serius
                        </button>
                        <button
                          onClick={() => {
                            const sel = window.getSelection().toString();
                            insertAtCursor(`[bisik]${sel || "teks"}[/bisik]`);
                          }}
                          className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold py-2 rounded-lg border border-purple-500/20 transition-all cursor-pointer"
                        >
                          🤫 Bisik
                        </button>
                        <button
                          onClick={() => {
                            const sel = window.getSelection().toString();
                            insertAtCursor(`[teriak]${sel || "teks"}[/teriak]`);
                          }}
                          className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-2 rounded-lg border border-red-500/20 transition-all cursor-pointer"
                        >
                          📢 Teriak
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface2">
                      <span className="text-sm text-gray-400">
                        Panduan Pengucapan
                      </span>
                      <button
                        onClick={() => {
                          const element = document.getElementById('pronunciation');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            setIsPronunciationOpen(true);
                          }
                        }}
                        className="text-xs bg-surface2 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 cursor-pointer"
                      >
                        Kelola
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-end">
                  <div className="bg-surface2/30 rounded-2xl p-4 border border-surface2 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">RUNGU ENGINE PRO</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Phonetic hardening, natural breathing, and deep prosody active. Optimasi Bahasa Indonesia v3.0.
                    </p>
                  </div>
                  {audioUrl && (
                    <audio
                      key={audioUrl}
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => {
                        setIsPlaying(false);
                        setCurrentTime(0);
                      }}
                      onTimeUpdate={updateProgress}
                      onLoadedMetadata={updateProgress}
                      onError={(e) => {
                        const error = e.target.error;
                        console.error("[Audio] Playback error details:", {
                          code: error?.code,
                          message: error?.message,
                          src: audioUrl.slice(0, 50) + "..."
                        });
                        // If blob URL fails, try to show error or fallback if needed
                        if (error?.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
                           toast.error("Format audio tidak didukung atau sumber data rusak.");
                        }
                      }}
                      className="hidden"
                    />
                  )}

                  {isAudioVisible && (
                    <div className="bg-dark rounded-2xl p-6 border border-surface2 mb-4 shadow-xl">
                      {generatedInfo && (
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface2/30">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Suara Dipakai</span>
                            <span className="text-xs text-text font-bold">{getVoiceDisplayName(generatedInfo.voice)}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Estimasi Durasi</span>
                            <span className="text-xs text-text font-bold">{formatDuration(generatedInfo.duration)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={togglePlay}
                          className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center text-white hover:bg-trdark cursor-pointer border-none flex-shrink-0 transition-transform hover:scale-105"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 fill-current" />
                          ) : (
                            <Play className="w-6 h-6 fill-current ml-1" />
                          )}
                        </button>

                        <div className="flex-1 flex flex-col gap-2">
                           <div className="flex justify-between text-xs text-text-muted font-mono">
                            <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                            <span>{duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                           </div>
                           <div className="h-2 bg-surface2 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                             if(audioRef.current && duration) {
                               const rect = e.currentTarget.getBoundingClientRect();
                               const x = e.clientX - rect.left;
                               const percentage = x / rect.width;
                               audioRef.current.currentTime = percentage * duration;
                             }
                           }}>
                             <div
                               className="h-full bg-terracotta rounded-full transition-all duration-100 ease-linear"
                               style={{
                                 width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                               }}
                             ></div>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface2">
                        {audioUrl && !isTeaser && user ? (
                            <>
                              <a
                                href={audioUrl}
                                download="shinerva-audio.mp3"
                                className="flex-1 bg-terracotta hover:bg-trdark text-white font-bold py-2.5 rounded-lg transition-all border-none flex items-center justify-center gap-2 text-sm cursor-pointer"
                              >
                                <Download className="w-4 h-4" /> Unduh
                              </a>
                              <button
                                onClick={handleShare}
                                className="bg-surface2 hover:bg-gray-700 text-text px-4 py-2.5 rounded-lg transition-all border border-gray-700 flex items-center justify-center gap-2 text-sm cursor-pointer"
                              >
                                <Share2 className="w-4 h-4" /> Share
                              </button>
                            </>
                        ) : (
                           <button
                            disabled
                            className="w-full bg-surface2 text-text-muted font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                          >
                             <Download className="w-4 h-4" /> {user ? "Preview" : "Masuk untuk Unduh"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={status === "loading" || status === "success" || cooldown > 0 || isCappedByRequest || isCappedByQuota}
                    className={`w-full py-4 rounded-xl font-bold flex flex-col justify-center items-center transition-all shadow-lg border-none cursor-pointer 
                      ${
                        status === "success"
                          ? "bg-green-600 text-white"
                          : status === "loading"
                            ? "bg-terracotta/75 text-white cursor-not-allowed"
                            : (cooldown > 0 || isCappedByRequest || isCappedByQuota)
                              ? "bg-surface2 text-text-muted cursor-not-allowed border border-surface2"
                              : "bg-terracotta hover:bg-trdark shadow-terracotta/20 text-white"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {status === "idle" && cooldown === 0 && (
                        isCappedByRequest ? (
                          <>
                             <AlertTriangle className="w-5 h-5" /> Naskah Terlalu Panjang
                          </>
                        ) : isCappedByQuota ? (
                          <>
                             <AlertCircle className="w-5 h-5" /> Kredit Tidak Cukup
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" /> Hasilkan Suara Sekarang
                          </>
                        )
                      )}
                      {status === "idle" && cooldown > 0 && (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Tunggu {cooldown}s...
                        </>
                      )}
                      {status === "loading" && (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Sedang Proses...
                        </>
                      )}
                      {status === "success" && (
                        <>
                          <CheckCircle className="w-5 h-5" /> Suara Berhasil Dibuat
                        </>
                      )}
                    </div>
                    {status === "loading" && loadingMessage && (
                      <span className="text-[10px] font-medium opacity-80 mt-1 animate-pulse">{loadingMessage}</span>
                    )}
                  </button>

                  {showFallback && (
                    <div className="mt-4 p-4 bg-terracotta/10 border border-terracotta/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                       <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                          <div className="flex-1">
                             <p className="text-xs font-bold text-text">Gagal Menghasilkan Suara?</p>
                             <p className="text-[11px] text-text-muted mt-1">Kami mengalami kendala teknis sementara. Anda bisa mencoba lagi atau gunakan Browser TTS gratis sebagai cadangan.</p>
                             <div className="flex gap-2 mt-3">
                                <button 
                                  onClick={handleGenerate}
                                  className="text-[11px] font-bold bg-terracotta text-white px-3 py-1.5 rounded-lg border-none cursor-pointer"
                                >
                                  Coba Lagi
                                </button>
                                <button 
                                  onClick={() => {
                                    fallbackTTS();
                                    setShowFallback(false);
                                  }}
                                  className="text-[11px] font-bold bg-surface2 text-text px-3 py-1.5 rounded-lg border border-surface3 cursor-pointer"
                                >
                                  Browser TTS (Cepat)
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pronunciation Management Section */}
        {user && (
          <section id="pronunciation" className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 mt-24 mb-16">
            <div className="bg-surface rounded-3xl p-10 md:p-12 border border-surface2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terracotta/20 via-terracotta to-terracotta/20"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-text flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-terracotta" /> 
                    Daftar Aturan Pengucapan
                  </h2>
                  <p className="text-text-muted mt-2">
                    Kelola bagaimana AI menyebutkan kata atau istilah khusus Anda.
                  </p>
                </div>
                <div className="bg-surface2 px-5 py-2.5 rounded-full border border-surface2">
                  <span className="text-sm font-bold text-terracotta">
                    {Object.keys(user.pronunciations || {}).length} Aturan Aktif
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form to add new rule */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-dark/50 rounded-2xl p-8 border border-surface2 h-full">
                    <h3 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">Tambah Aturan Baru</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Kata Asli</label>
                        <input
                          type="text"
                          value={newWord}
                          onChange={(e) => setNewWord(e.target.value)}
                          className="w-full bg-dark text-text rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none text-sm"
                          placeholder="Contoh: Shinerva"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Cara Baca</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newPronunciation}
                            onChange={(e) => setNewPronunciation(e.target.value)}
                            className="w-full bg-dark text-text rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none pr-10 text-sm"
                            placeholder="Contoh: shi ner va"
                          />
                          <button 
                            onClick={() => handleTestPronunciation(newWord, newPronunciation)}
                            disabled={testLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-surface2 rounded-lg transition-colors text-terracotta disabled:opacity-50 border-none bg-transparent cursor-pointer"
                            title="Tes suara"
                          >
                            {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (newWord.trim() && newPronunciation.trim()) {
                            handleUpdatePronunciation(newWord.trim(), newPronunciation.trim());
                            setNewWord("");
                            setNewPronunciation("");
                          }
                        }}
                        className="w-full bg-terracotta hover:bg-trdark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-none cursor-pointer mt-2"
                      >
                        Simpan Aturan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        <section
          id="pricing-temporarily-renamed"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Pilih Paket Kredit Suara
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto mb-8 text-lg">
              Beli paket sesuai kebutuhan. Tanpa langganan, kredit rollover otomatis selama masa aktif. Lebih fleksibel, lebih adil.
            </p>

            {/* Payment methods */}
            <PaymentMethods />

          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Pakets */}
            {[PLANS.FREE, PLANS.STARTER, PLANS.CREATOR, PLANS.PRO].map((plan) => (
              <div key={plan.id} className={`bg-surface border p-6 rounded-3xl flex flex-col relative ${plan.isPopular ? 'border-terracotta shadow-[0_0_30px_rgba(226,114,91,0.15)]' : 'border-surface2'}`}>
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-terracotta text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-10">
                    Paling Populer
                  </div>
                )}
                <h3 className="text-lg font-bold mb-2 text-text">{plan.name}</h3>
                <div className="text-2xl font-black text-text mb-6">
                  {plan.price === 0 ? "Gratis" : `Rp ${(plan.price/1000).toLocaleString("id-ID")}rb`}
                </div>
                <div className="text-xs text-text-muted bg-surface2 px-3 py-2 rounded-lg mb-6 font-medium">
                  {plan.credits.toLocaleString("id-ID")} Kredit Suara<br/>
                  Masa aktif: {plan.validityDays} hari
                </div>
                <button 
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchaseLoading === plan.id || plan.price === 0}
                  className={`w-full font-bold py-3 text-sm rounded-xl transition-all flex justify-center items-center cursor-pointer border-none ${
                    purchaseLoading === plan.id
                      ? "bg-surface2 text-text-muted" 
                      : plan.price === 0 
                      ? "bg-transparent border border-surface2 text-text"
                      : "bg-terracotta hover:bg-trdark text-white"
                  }`}
                >
                  {plan.price === 0 ? "Mulai Gratis" : purchaseLoading === plan.id ? <Loader2 className="animate-spin w-4 h-4" /> : "Beli Sekarang"}
                </button>
              </div>
            ))}
          </div>
          
          {/* Top-Up Section - Removed as per requirements */}
          <div className="mt-20"></div>
        </section>

        {/* Pronunciation Management Section */}
        {user && (
          <section id="pronunciation" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
            <div className="bg-surface rounded-3xl p-8 md:p-10 border border-surface2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terracotta/20 via-terracotta to-terracotta/20"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-text flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-terracotta" /> 
                    Daftar Aturan Pengucapan
                  </h2>
                  <p className="text-text-muted mt-2">
                    Kelola bagaimana AI menyebutkan kata atau istilah khusus Anda.
                  </p>
                </div>
                <div className="bg-surface2 px-4 py-2 rounded-full border border-surface2">
                  <span className="text-sm font-bold text-terracotta">
                    {Object.keys(user.pronunciations || {}).length} Aturan Aktif
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form to add new rule */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-dark/50 rounded-2xl p-6 border border-surface2 h-full">
                    <h3 className="font-bold text-text mb-4 text-sm uppercase tracking-wider">Tambah Aturan Baru</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Kata Asli</label>
                        <input
                          type="text"
                          value={newWord}
                          onChange={(e) => setNewWord(e.target.value)}
                          className="w-full bg-dark text-text rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none text-sm"
                          placeholder="Contoh: Shinerva"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Cara Baca</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newPronunciation}
                            onChange={(e) => setNewPronunciation(e.target.value)}
                            className="w-full bg-dark text-text rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none pr-10 text-sm"
                            placeholder="Contoh: shi ner va"
                          />
                          <button 
                            onClick={() => handleTestPronunciation(newWord, newPronunciation)}
                            disabled={testLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-surface2 rounded-lg transition-colors text-terracotta disabled:opacity-50 border-none bg-transparent cursor-pointer"
                            title="Tes suara"
                          >
                            {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (newWord.trim() && newPronunciation.trim()) {
                            handleUpdatePronunciation(newWord.trim(), newPronunciation.trim());
                            setNewWord("");
                            setNewPronunciation("");
                          }
                        }}
                        className="w-full bg-terracotta hover:bg-trdark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-none cursor-pointer mt-2"
                      >
                        <Plus className="w-4 h-4" /> Simpan Aturan
                      </button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-surface2">
                      <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Tips Cepat</h4>
                      <div className="space-y-2">
                        {[
                          { w: "AI", p: "ey ai" },
                          { w: "TTS", p: "te te es" }
                        ].map(tip => (
                          <div 
                            key={tip.w}
                            onClick={() => {setNewWord(tip.w); setNewPronunciation(tip.p);}}
                            className="flex justify-between items-center text-xs p-2 rounded-lg hover:bg-surface2 cursor-pointer transition-colors border border-transparent hover:border-surface2"
                          >
                            <span className="text-text font-bold">{tip.w}</span>
                            <span className="text-text-muted">→ {tip.p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* List of existing rules */}
                <div className="lg:col-span-8">
                  <div className="bg-dark/30 rounded-2xl p-2 border border-surface2 min-h-[300px] flex flex-col">
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                      {user.pronunciations && Object.keys(user.pronunciations).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(user.pronunciations).map(([word, pron]) => (
                            <div key={word} className="flex items-center justify-between bg-dark p-4 rounded-xl border border-surface2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="flex flex-col min-w-0">
                                <span className="text-text font-bold truncate">{word}</span>
                                <span className="text-terracotta text-xs font-medium truncate">Dibaca: {pron}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleTestPronunciation(word, pron)}
                                  disabled={testLoading}
                                  className="text-text-muted hover:text-terracotta transition-colors p-2 hover:bg-surface2 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="Tes suara"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdatePronunciation(word, null)}
                                  className="text-text-muted hover:text-red-500 transition-colors p-2 hover:bg-surface2 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                          <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-text-muted" />
                          </div>
                          <h4 className="font-bold text-text mb-1">Belum ada aturan</h4>
                          <p className="text-sm text-text-muted max-w-xs">
                            Coba tambahkan kata yang sering salah diucapkan oleh AI agar hasilnya lebih sempurna.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Packs */}
        <section
          id="packs"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative"
        >
          <div className="text-center mb-16">
            <div className="inline-block bg-terracotta/20 text-terracotta px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              {language === 'ID' ? 'Pembaruan Fitur' : 'Feature Update'}
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-text">
              {t('nav.packs')} <span className="text-text-muted">({language === 'ID' ? 'Segera Hadir' : 'Coming Soon'})</span>
            </h2>
            <p className="text-text-muted mx-auto max-w-2xl">
              {language === 'ID' 
                ? 'Template naskah siap pakai dengan gaya bacaan yang sudah dioptimasi AI. Segera hadir untuk membantu produktivitas Anda.' 
                : 'Ready-to-use script templates with AI-optimized reading styles. Coming soon to help your productivity.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(PACKS[language] || PACKS['ID']).map((pack) => (
              <div
                key={pack.id}
                className={`bg-surface rounded-2xl p-6 border transition-colors flex flex-col items-start relative group opacity-60 ${pack.trending ? "border-terracotta/30 shadow-[0_0_15px_rgba(226,114,91,0.1)]" : "border-surface2"}`}
              >
                <div className="flex justify-between w-full mb-4">
                  <span className="text-xs font-black px-2 py-1 bg-surface2 text-text-muted rounded-md uppercase tracking-widest">
                    {pack.tag}
                  </span>
                  {pack.trending && (
                    <span className="text-[10px] font-black px-2 py-1 bg-terracotta/50 text-white rounded-md uppercase tracking-widest">
                      SOON
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-text">{pack.title}</h3>
                <p className="text-text-muted text-sm mb-6 flex-grow">
                  {pack.desc}
                </p>
                <button
                  disabled
                  className="w-full bg-dark/50 border border-gray-700 text-gray-500 font-bold py-2.5 rounded-lg transition-all text-sm cursor-not-allowed"
                >
                  {language === 'ID' ? 'Aktifkan Paket' : 'Activate Pack'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-text">{t('nav.faq')}</h2>
            <p className="text-text-muted">
              {language === 'ID' 
                ? 'Segala hal yang perlu Anda ketahui tentang Shinerva.id' 
                : 'Everything you need to know about Shinerva.id'}
            </p>
          </div>
          <div className="space-y-4">
            {(FAQS[language] || FAQS['ID']).map((faq, index) => (
              <div
                key={index}
                className="bg-surface border border-surface2 rounded-2xl p-6 hover:border-terracotta/50 transition-colors shadow-sm"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3 text-text">
                  <span className="text-terracotta font-black">Q:</span> {faq.question}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="bg-gradient-to-br from-surface to-dark border border-surface2 rounded-[3rem] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terracotta to-transparent opacity-20"></div>
            <h2 className="text-4xl font-black mb-6 text-text">Butuh Bantuan Lebih?</h2>
            <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">
              Tim support kami siap membantu Anda 24/7 untuk menjawab pertanyaan
              Anda atau membantu integrasi custom.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3"
              >
                Chat WhatsApp
              </a>
              <a
                href="mailto:hello.shinerva@gmail.com"
                className="bg-surface2 hover:bg-gray-700 text-white px-10 py-4 rounded-2xl font-black transition-all border border-gray-700 flex items-center gap-3"
              >
                Email Support
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-surface2 pt-20 pb-10 bg-dark/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <ShinervaLogo className="w-12 h-12 text-terracotta" />
                  <span className="font-black text-2xl tracking-tight text-text">
                    SHINERVA AI <br className="sm:hidden" />
                    <span className="text-sm block text-text-muted font-bold -mt-1 uppercase tracking-[0.2em]">Text To Speech</span>
                  </span>
                </div>
                <p className="text-text-muted max-w-sm">
                   Southeast Asia’s Emotional AI Voice Platform. 
                   Transforming text into human-like cinematic narrations for a digital-first world.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-text">Produk</h4>
                <ul className="space-y-4 text-text-muted text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-terracotta transition-colors"
                    >
                      {t('nav.home')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="hover:text-terracotta transition-colors"
                    >
                      {t('nav.packs')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      className="hover:text-terracotta transition-colors"
                    >
                      {t('nav.faq')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="hover:text-terracotta transition-colors"
                    >
                      {t('nav.contact')}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-text">Follow Us</h4>
                <ul className="space-y-4 text-text-muted text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-terracotta transition-colors"
                    >
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-terracotta transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-terracotta transition-colors"
                    >
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-surface2 text-text-muted text-xs gap-4">
              <p>© 2024 Shinerva AI Text To Speech. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-text transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-text transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setIsProfileModalOpen(false)}
          ></div>
          <div className="bg-dark border border-surface2 rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-3xl overflow-hidden border-gradient animate-in zoom-in duration-300">
             <div className="p-8 md:p-12">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="absolute top-8 right-8 text-text-muted hover:text-text cursor-pointer bg-surface2/50 hover:bg-surface2 p-2 rounded-full transition-all border-none"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-10">
                  <div className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-terracotta/20 relative">
                    <User className="w-12 h-12 text-terracotta" />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-dark"></div>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">{user.name || "Pengguna Shinerva"}</h2>
                  <p className="text-text-muted font-medium">{user.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-surface2/30 p-5 rounded-3xl border border-surface2">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Paket Saat Ini</p>
                      <p className="text-2xl font-black text-terracotta">{user.tier}</p>
                   </div>
                   <div className="bg-surface2/30 p-5 rounded-3xl border border-surface2">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Sisa Karakter</p>
                      <p className={`text-2xl font-black ${remainingCredits < 1000 ? "text-red-500" : "text-text"}`}>{remainingCredits.toLocaleString("id-ID")}</p>
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
                        <p className="text-xs text-text-muted">{user.valid_referrals} teman terdaftar</p>
                      </div>
                    </div>
                    <button onClick={() => {setIsReferralOpen(true); setIsProfileModalOpen(false);}} className="text-xs font-black text-terracotta hover:underline bg-transparent border-none cursor-pointer">Detail</button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    window.location.hash = "pricing";
                  }}
                  className="w-full mt-10 bg-terracotta hover:bg-trdark text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-terracotta/20 border-none cursor-pointer"
                >
                  Upgrade Keanggotaan
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Studio Voice Warning Modal */}
      {isStudioWarningOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setIsStudioWarningOpen(false)}
          ></div>
          <div className="bg-dark border border-surface2 rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-terracotta" />
              </div>
              <h3 className="text-2xl font-black text-text mb-4">Aktivasi Aura Narration (Segera Hadir)</h3>
              <p className="text-text-muted mb-8 leading-relaxed">
                Fitur <span className="text-text font-bold">Suara Aura Flagship</span> saat ini sedang dalam pemeliharaan dan akan segera kembali. Fitur ini membutuhkan <span className="text-terracotta font-black text-lg">40x Kredit</span>. Harap pilih teknologi lain sementara waktu.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsStudioWarningOpen(false)}
                  className="w-full bg-terracotta hover:bg-trdark text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-terracotta/20 border-none cursor-pointer"
                >
                  Paham, Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Dashboard Modal - Removed for MVP */}

      {/* Auth Modal - Simplified for MVP (Google Login Only) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAuthOpen(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl mx-4">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <ShinervaLogo className="w-16 h-16 mx-auto mb-4 text-terracotta" />
              <h2 className="text-2xl font-black text-text">
                Masuk ke SHINERVA
              </h2>
              <p className="text-text-muted text-sm mt-2 font-medium">
                Daftar sekarang dan dapatkan bonus 10.000 karakter gratis untuk mencoba suara AI kami.
              </p>
            </div>
            
            {initError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-500">Masalah Koneksi Backend</p>
                  <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                    Sistem sedang dalam pemeliharaan atau konfigurasi belum lengkap. Google Login mungkin tidak berfungsi untuk sementara.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-black transition-all border-none cursor-pointer flex justify-center items-center gap-3 text-lg shadow-xl shadow-white/5 active:scale-95"
              >
                {googleLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Masuk dengan Google
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface2"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                  <span className="bg-surface px-4 text-text-muted">Atau pakai Email</span>
                </div>
              </div>

              {!magicLinkSent ? (
                <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full bg-surface2 border border-surface2 focus:border-terracotta text-text px-6 py-4 rounded-2xl outline-none transition-all font-medium"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isMagicLoading}
                    className="w-full bg-terracotta/20 hover:bg-terracotta/30 text-terracotta py-4 rounded-2xl font-black transition-all border border-terracotta/20 cursor-pointer flex justify-center items-center gap-2"
                  >
                    {isMagicLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Kirim Link Masuk (Magic Link)"
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-terracotta/10 border border-terracotta/20 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-terracotta mx-auto mb-4" />
                  <h3 className="text-lg font-black text-white mb-2 text-center">Cek Email Anda!</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Kami telah mengirimkan link masuk ke <b>{authEmail}</b>. 
                    Klik link di email tersebut untuk masuk secara otomatis.
                  </p>
                  <button 
                    onClick={() => setMagicLinkSent(false)}
                    className="mt-4 text-xs text-terracotta hover:underline font-bold bg-transparent border-none cursor-pointer"
                  >
                    Ganti email?
                  </button>
                </div>
              )}

              <div className="bg-terracotta/10 border border-terracotta/20 rounded-2xl p-4 flex gap-4 mt-8">
                <Gift className="w-6 h-6 text-terracotta flex-shrink-0" />
                <p className="text-xs text-terracotta font-bold leading-relaxed">
                  Bonus pengguna baru: 10.000 karakter gratis otomatis ditambahkan setelah login pertama kali.
                </p>
              </div>

              {/* Environment Hint for iframe */}
              {window.self !== window.top && (
                <p className="text-[10px] text-text-muted text-center leading-tight mt-4 opacity-70">
                  Mengalami kendala login di dalam preview? 
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="text-terracotta hover:underline ml-1 font-bold cursor-pointer bg-transparent border-none p-0 inline text-[10px]"
                  >
                      Buka di Tab Baru &rarr;
                  </button>
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-surface2 mt-8 text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-black opacity-40">
                Safe & Secure Autentikasi by Firebase
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Social Bonus Modal - Disabled for MVP */}

      {/* Pronunciation Guide Modal */}
      {isPronunciationOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsPronunciationOpen(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsPronunciationOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <BookOpen className="w-16 h-16 text-terracotta mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white">Panduan Pengucapan</h2>
              <p className="text-gray-400 text-sm mt-2">
                Atur cara AI menyebutkan kata-kata tertentu (misal: "Shinerva" dibaca "shi ner va").
              </p>
            </div>

            <div className="bg-surface2/30 rounded-2xl p-4 mb-6 border border-surface2">
              <h4 className="text-xs font-black text-terracotta uppercase tracking-widest mb-3 flex items-center gap-2">
                <Gift className="w-3 h-3" /> Tips & Contoh Populer
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { w: "P3K", p: "pe tiga ka" },
                  { w: "HUT", p: "ha u te" },
                  { w: "IG", p: "i ge" },
                  { w: "WA", p: "we a" }
                ].map((tip) => (
                  <button 
                    key={tip.w}
                    onClick={() => {
                      setNewWord(tip.w);
                      setNewPronunciation(tip.p);
                    }}
                    className="flex flex-col items-start p-2 rounded-lg bg-dark hover:bg-surface2 transition-colors border border-surface2 text-left cursor-pointer"
                  >
                    <span className="text-[10px] text-gray-500 font-bold">{tip.w} →</span>
                    <span className="text-xs text-white font-medium">{tip.p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Kata Asli</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newWord}
                      onChange={(e) => handleWordChange(e.target.value)}
                      className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none"
                      placeholder="Contoh: AI"
                    />
                    {phoneticSuggestions.length > 0 && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface border border-surface2 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-surface2/30">
                        <div className="px-3 py-2 bg-surface2/30 text-[10px] font-black text-terracotta uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" /> Saran Pengucapan
                        </div>
                        {phoneticSuggestions.map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              setNewWord(key);
                              setNewPronunciation(globalPhonetics[key]);
                              setPhoneticSuggestions([]);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface2 transition-colors flex items-center justify-between group cursor-pointer bg-transparent border-none"
                          >
                            <span className="text-sm text-white font-bold">{key}</span>
                            <span className="text-[10px] text-gray-500 group-hover:text-terracotta transition-colors italic">
                              Baca: {globalPhonetics[key]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Cara Baca</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newPronunciation}
                      onChange={(e) => setNewPronunciation(e.target.value)}
                      className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none pr-10"
                      placeholder="Contoh: ey ai"
                    />
                    <button 
                      onClick={() => handleTestPronunciation(newWord, newPronunciation)}
                      disabled={testLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-surface2 rounded-lg transition-colors text-terracotta disabled:opacity-50 cursor-pointer bg-transparent border-none"
                      title="Coba suara"
                    >
                      {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (newWord.trim() && newPronunciation.trim()) {
                    handleUpdatePronunciation(newWord.trim(), newPronunciation.trim());
                    setNewWord("");
                    setNewPronunciation("");
                  }
                }}
                className="w-full bg-terracotta hover:bg-trdark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Aturan
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                Aturan Tersimpan ({Object.keys(user?.pronunciations || {}).length})
              </h3>
              <div className="space-y-3">
                {user?.pronunciations && Object.keys(user.pronunciations).length > 0 ? (
                  Object.entries(user.pronunciations).map(([word, pron]) => (
                    <div key={word} className="flex items-center justify-between bg-dark p-4 rounded-xl border border-surface2">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{word}</span>
                        <span className="text-terracotta text-sm">Dibaca: {pron}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestPronunciation(word, pron)}
                          disabled={testLoading}
                          className="text-gray-500 hover:text-terracotta transition-colors p-2 cursor-pointer bg-transparent border-none"
                          title="Tes suara"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdatePronunciation(word, null)}
                          className="text-gray-500 hover:text-red-500 transition-colors p-2 cursor-pointer bg-transparent border-none"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 italic text-sm">
                    Belum ada aturan pengucapan khusus.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Usage History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsHistoryOpen(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <History className="w-16 h-16 text-terracotta mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white">Riwayat Penggunaan</h2>
              <p className="text-gray-400 text-sm mt-2">
                Daftar penggunaan kredit karakter untuk setiap suara yang dihasilkan.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-terracotta animate-spin mb-4" />
                  <p className="text-gray-500">Memuat data riwayat...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface2 text-text-muted text-xs uppercase tracking-wider">
                        <th className="py-3 font-bold">Tanggal</th>
                        <th className="py-3 font-bold">Detail Suara</th>
                        <th className="py-3 font-bold">Durasi</th>
                        <th className="py-3 font-bold">Kredit</th>
                        <th className="py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface2/50">
                      {history.map((item) => (
                        <tr key={item.id} className="text-sm">
                          <td className="py-4">
                            <div className="text-text font-medium text-xs">
                              {new Date(item.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                            <div className="text-text-muted text-[10px]">
                              {new Date(item.date).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="text-text font-bold text-xs uppercase">
                              {getVoiceDisplayName(item.voice)}
                            </div>
                            <div className="text-text-muted text-[10px]">
                              {item.voice.split("-").slice(-2).join("-")}
                            </div>
                            {item.is_teaser && (
                              <span className="text-[10px] bg-terracotta/20 text-terracotta px-1.5 py-0.5 rounded italic">
                                Preview
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className="text-text-muted text-xs">
                              {formatDuration(item.duration)}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-text font-bold text-xs">
                              {item.credits_used.toLocaleString("id-ID")}
                            </span>
                          </td>
                          <td className="py-4 text-green-500 font-bold text-[10px] uppercase">
                            Berhasil
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 italic">Belum ada riwayat penggunaan.</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-surface2 text-center">
               <button 
                onClick={() => setIsHistoryOpen(false)}
                className="bg-surface2 hover:bg-gray-700 text-white px-8 py-2.5 rounded-xl font-bold cursor-pointer border-none"
               >
                 Tutup
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Management Modal */}
      {isVoiceMgmtOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsVoiceMgmtOpen(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsVoiceMgmtOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <Settings2 className="w-16 h-16 text-terracotta mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white">Voice Management</h2>
              <p className="text-gray-400 text-sm mt-2">
                Atur pengali biaya kredit (multiplier) untuk setiap tingkatan suara.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {voiceConfigLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-terracotta animate-spin mb-4" />
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(voiceConfig.tiers).map(([tier, multiplier]) => (
                    <div key={tier} className="bg-dark p-4 rounded-xl border border-surface2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-bold text-white uppercase text-xs tracking-wider">
                          Tier: {tier}
                        </label>
                        <span className="text-terracotta font-bold">{multiplier}x Multiplier</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={multiplier}
                          onChange={(e) => {
                            const newTiers = { ...voiceConfig.tiers, [tier]: parseInt(e.target.value) };
                            setVoiceConfig({ ...voiceConfig, tiers: newTiers });
                          }}
                          className="flex-1 h-1.5 bg-surface2 rounded-lg appearance-none cursor-pointer accent-terracotta"
                        />
                        <input
                          type="number"
                          value={multiplier}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            const newTiers = { ...voiceConfig.tiers, [tier]: val };
                            setVoiceConfig({ ...voiceConfig, tiers: newTiers });
                          }}
                          className="w-16 bg-dark text-white border border-surface2 rounded px-2 py-1 text-center font-bold text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">
                        1 Karakter = {multiplier} Kredit
                      </p>
                    </div>
                  ))}

                  <div className="pt-6 border-t border-surface2">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                       <Settings2 className="w-4 h-4 text-terracotta" /> Global Limits Configuration
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-dark p-4 rounded-xl border border-surface2">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2">Free Char Limit</label>
                        <input
                           type="number"
                           value={voiceConfig.limits?.free_request_chars || 500}
                           onChange={(e) => {
                             setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, free_request_chars: parseInt(e.target.value) || 0 } });
                           }}
                           className="w-full bg-surface2 text-white border border-surface2 rounded px-3 py-2 font-bold text-sm"
                        />
                      </div>
                      <div className="bg-dark p-4 rounded-xl border border-surface2">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2">Paid Char Limit</label>
                        <input
                           type="number"
                           value={voiceConfig.limits?.paid_request_chars || 5000}
                           onChange={(e) => {
                             setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, paid_request_chars: parseInt(e.target.value) || 0 } });
                           }}
                           className="w-full bg-surface2 text-white border border-surface2 rounded px-3 py-2 font-bold text-sm"
                        />
                      </div>
                      <div className="bg-dark p-4 rounded-xl border border-surface2">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2">Free Cooldown (sec)</label>
                        <input
                           type="number"
                           value={voiceConfig.limits?.free_cooldown_sec || 15}
                           onChange={(e) => {
                             setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, free_cooldown_sec: parseInt(e.target.value) || 0 } });
                           }}
                           className="w-full bg-surface2 text-white border border-surface2 rounded px-3 py-2 font-bold text-sm"
                        />
                      </div>
                      <div className="bg-dark p-4 rounded-xl border border-surface2">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-2">Paid Cooldown (sec)</label>
                        <input
                           type="number"
                           value={voiceConfig.limits?.paid_cooldown_sec || 2}
                           onChange={(e) => {
                             setVoiceConfig({ ...voiceConfig, limits: { ...voiceConfig.limits, paid_cooldown_sec: parseInt(e.target.value) || 0 } });
                           }}
                           className="w-full bg-surface2 text-white border border-surface2 rounded px-3 py-2 font-bold text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
               <button 
                onClick={() => setIsVoiceMgmtOpen(false)}
                className="flex-1 bg-surface2 hover:bg-gray-700 text-white py-3 rounded-xl font-bold cursor-pointer border-none"
               >
                 Batal
               </button>
               <button 
                onClick={() => saveVoiceConfig(voiceConfig.tiers, voiceConfig.limits)}
                className="flex-2 bg-terracotta hover:bg-trdark text-white py-3 rounded-xl font-bold cursor-pointer border-none"
               >
                 Simpan Perubahan
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
