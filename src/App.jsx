import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  onAuthStateChanged
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
} from "lucide-react";

import { PLANS } from "./lib/plans";
import { globalPhonetics } from "./lib/phonetics";
import VoicePlayground from "./components/VoicePlayground";

const PACKS = [
  {
    id: 1,
    tag: "Sejarah & Edukasi",
    title: "Sejarah Revolusi",
    desc: "Narasi sejarah perjuangan kemerdekaan dengan gaya epik, heroik, dan dramatis.",
    content:
      "Bangsa yang besar adalah bangsa yang menghargai jasa para pahlawannya. Di tengah gemuruh meriam dan bau mesiu, Soekarno berdiri tegak di hadapan ribuan rakyat, mengumumkan bahwa penindasan telah berakhir.",
  },
  {
    id: 2,
    tag: "Entertainment",
    title: "Pop Culture Recap",
    desc: "Breakdown film, series, selebriti, atau trending topic dengan gaya engaging dan santai.",
    content:
      "Kalian sadar nggak kalau di trailer film terbaru ini ada detail tersembunyi? Yup, Easter Egg ini beneran ngerubah teori fans di seluruh dunia! Mari kita bedah bareng-bareng kenapa adegan ini begitu penting untuk timeline-nya.",
  },
  {
    id: 3,
    tag: "Marketing",
    title: "Hard Sell Ads",
    desc: "Template iklan persuasif dengan teknik urgensi tinggi, call-to-action kuat.",
    content:
      "PROMO TERBATAS! Dapatkan diskon hingga 70 persen hanya untuk seratus pembeli pertama hari ini. Jangan sampai ketinggalan, klik link di bio sekarang juga!",
  },
  {
    id: 4,
    tag: "Sosial Media",
    title: "Reels & TikTok Narrator",
    trending: true,
    desc: "Gaya fast-paced, hook kuat di 3 detik pertama, energik, punchy, cocok untuk video pendek 15-60 detik.",
    content:
      "Stop scrolling! Kalian harus tau cara cepat upgrade skill editing cuma dalam 15 detik! Teknik ini udah dipakai sama banyak top content creator di seluruh dunia.",
  },
  {
    id: 5,
    tag: "Lifestyle",
    title: "Motivasi & Mindset",
    desc: "Narasi inspiratif, pengembangan diri, mindset sukses, morning motivation, quote story.",
    content:
      "Kesuksesan bukan tentang seberapa cepat kamu berlari, tapi tentang seberapa kuat kamu bangkit setiap kali terjatuh. Hari ini adalah awal baru untuk masa depanmu.",
  },
  {
    id: 6,
    tag: "Storytelling",
    title: "True Crime & Misteri",
    desc: "Cerita kriminal, misteri, unsolved case dengan gaya tegang, dramatis, dan merinding.",
    content:
      "Malam itu begitu sunyi, sampai sebuah suara di balik pintu mengubah segalanya. Tidak ada yang menduga kalau rahasia ini baru akan terungkap setelah dua puluh tahun lamanya.",
  },
];

const FAQS = [
  {
    question: "Apa itu Shinerva.id?",
    answer:
      "Shinerva.id adalah platform AI Text-to-Speech (TTS) tercanggih untuk Bahasa Indonesia yang mampu menghasilkan suara manusiawi yang alami dan emosional.",
  },
  {
    question: "Apakah kredit saya bisa hangus?",
    answer:
      "Tergantung paket Anda. Kredit dari paket Top-Up tidak akan pernah hangus. Untuk paket bulanan (Kreator ke atas), sisa kredit akan rollover ke bulan berikutnya. Namun untuk paket FREE, kuota akan diperbarui setiap bulan dan sisa kuota yang tidak terpakai akan hangus.",
  },
  {
    question: "Apakah suara AI ini bisa dipakai di TikTok atau YouTube?",
    answer:
      "Sangat bisa! Suara kami dirancang khusus agar lolos verifikasi monetisasi sosial media (YouTube/TikTok/Reels). Untuk paket Kreator ke atas, Anda mendapatkan hak komersial penuh.",
  },
  {
    question: "Apa perbedaan teknologi Basic dan Pulse?",
    answer:
      "Basic adalah teknologi TTS standar untuk kebutuhan harian, sementara Pulse menggunakan pemrosesan saraf ekspresif yang menghasilkan intonasi, jeda, dan emosi yang sangat mendalam untuk narasi konten kreatif.",
  },
  {
    question: "Bagaimana cara menghubungi bantuan?",
    answer:
      "Anda bisa menghubungi tim kami melalui WhatsApp atau Email yang tersedia di bagian bawah website jika mengalami kendala atau membutuhkan integrasi khusus.",
  },
];

const VOICES = {
  "Basic (Free)": [
    { 
      id: "id-ID-Standard-A", 
      name: "Ratna (Wanita)", 
      type: "Standard", 
      tier: "FREE", 
      desc: "Fast, lightweight voice generation for everyday content.",
      useCase: "Podcast & Edukasi"
    },
    { 
      id: "id-ID-Standard-B", 
      name: "Bambang (Pria)", 
      type: "Standard", 
      tier: "FREE",
      desc: "Practical voice generation for simple announcements.",
      useCase: "Berita & Pengumuman"
    },
  ],
  "Pulse (Starter/Kreator)": [
    { 
      id: "id-ID-Neural2-A", 
      name: "Siti (Emotionally Expressive)", 
      type: "Neural2", 
      premium: true, 
      tier: "STARTER",
      desc: "Emotionally expressive voices built for creators.",
      useCase: "Narasi YouTube & Storytelling"
    },
    { 
      id: "id-ID-Neural2-D", 
      name: "Agus (Dynamic Narration)", 
      type: "Neural2", 
      premium: true, 
      tier: "STARTER",
      desc: "Dynamic and engaging storytelling with creator-focused pacing.",
      useCase: "Video Pendek & Komedi"
    },
  ],
  "Flow (Produktif)": [
    { 
      id: "id-ID-Wavenet-A", 
      name: "Lestari (Smooth Flow)", 
      type: "Wavenet", 
      premium: true, 
      tier: "PRODUKTIF",
      desc: "Smooth cinematic narration with natural pacing.",
      useCase: "Audiobook & Meditasi"
    },
    { 
      id: "id-ID-Wavenet-B", 
      name: "Joko (Immersive Flow)", 
      type: "Wavenet", 
      premium: true, 
      tier: "PRODUKTIF",
      desc: "Deep and dramatic voices for immersive storytelling.",
      useCase: "Misteri & Dokumenter"
    },
    { 
      id: "id-ID-Wavenet-C", 
      name: "Putri (Elegant Flow)", 
      type: "Wavenet", 
      premium: true, 
      tier: "PRODUKTIF",
      desc: "Sleek and professional voices for cinematic delivery.",
      useCase: "Iklan & Presentasi"
    },
  ],
  "Aura Premium (Bisnis)": [
    { 
      id: "id-ID-Studio-A", 
      name: "Eko (Flagship Aura)", 
      type: "Studio", 
      premium: true, 
      glow: true, 
      tier: "BISNIS",
      desc: "Our flagship ultra-human AI voice experience.",
      useCase: "Iklan High-End & Branding"
    },
    { 
      id: "id-ID-Studio-D", 
      name: "Maya (Human-Like Aura)", 
      type: "Studio", 
      premium: true, 
      glow: true, 
      tier: "BISNIS",
      desc: "Ultra-natural, emotionally layered cinematic creator voice.",
      useCase: "Berita & Konten Formal"
    },
  ],
  "Aura Cinema (Enterprise)": [
    { 
      id: "Puck", 
      name: "Puck (Viral Quality)", 
      type: "Gemini", 
      premium: true, 
      glow: true, 
      tier: "ENTERPRISE",
      desc: "Viral-quality narration with cinematic depth.",
      useCase: "Film & Narasi Epik"
    },
    { 
      id: "Charon", 
      name: "Charon (Atmospheric Aura)", 
      type: "Gemini", 
      premium: true, 
      glow: true, 
      tier: "ENTERPRISE",
      desc: "Emotionally layered and atmospheric human-like delivery.",
      useCase: "Storytelling & Dokumenter"
    },
    { 
      id: "Kore", 
      name: "Kore (Radiant Aura)", 
      type: "Gemini", 
      premium: true, 
      glow: true, 
      tier: "ENTERPRISE",
      desc: "Bright, engaging, and ultra-natural presence.",
      useCase: "Konten Anak & Marketing"
    },
    { 
      id: "Fenrir", 
      name: "Fenrir (Rugged & Bold)", 
      type: "Gemini", 
      premium: true, 
      glow: true, 
      tier: "ENTERPRISE",
      desc: "Kasar, berani, dan penuh karakter.",
      useCase: "Gaming & Brand Maskulin"
    },
    { 
      id: "Zephyr", 
      name: "Zephyr (Soft & Airy)", 
      type: "Gemini", 
      premium: true, 
      glow: true, 
      tier: "ENTERPRISE",
      desc: "Lembut, menenangkan, dan ringan.",
      useCase: "Relaksasi & Lifestyle"
    },
  ],
};

const getVoiceDisplayName = (id) => {
  if (!id) return "-";
  for (const category in VOICES) {
    const voice = VOICES[category].find(v => v.id === id);
    if (voice) return voice.name.split(" (")[0]; // Just the name part
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
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("id-ID-Wavenet-A");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, loading, success
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
    for (const group of Object.values(VOICES)) {
      const v = group.find(i => i.id === voiceId);
      if (v) return v.type;
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
    const byteCharacters = atob(base64);
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
    return new Blob(byteArrays, { type: mime });
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
        
        if (!data.firebaseAdminInitialized && !user) {
          // If server failed but returned null for initError, use a default string
          const serverError = (data.initError && data.initError !== "null") ? data.initError : "Backend initialization incomplete or credentials missing.";
          console.warn("[System] Firebase Admin is not initialized on server.", serverError);
          setInitError(serverError);
        } else {
          setInitError(null);
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
          console.error("Auth state change error:", error);
          setIsAuthInitializing(false);
        });
      } catch (e) {
        console.error("onAuthStateChanged setup failed:", e);
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
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
        audio.play();
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
        const isGemini = voice && ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voice);
        const mimeType = isGemini ? 'audio/wav' : 'audio/mpeg';
        const blob = base64ToBlob(data.audioContent, mimeType);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        toast.success(`Berhasil memutar contoh suara ${voice}`);
      }
    } catch (err) {
      console.error("Preview error:", err);
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
      if (!res.ok) throw new Error("Gagal mengambil sampel suara");
      const data = await res.json();
      
      if (data.audioContent) {
        const isGemini = voiceId && ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceId);
        const mimeType = isGemini ? 'audio/wav' : 'audio/mpeg';
        const blob = base64ToBlob(data.audioContent, mimeType);
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (err) {
      console.error("[Playground] Sample failed:", err);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!auth?.currentUser) {
      setNotification("anda belum sign up/log in");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!text.trim()) {
      alert("Silakan tulis naskah terlebih dahulu.");
      return;
    }

    if (isCappedByRequest) {
      toast.error(`Naskah terlalu panjang! Batas maksimum untuk paket ${user.tier} adalah ${currentMaxRequestChars.toLocaleString("id-ID")} karakter.`);
      return;
    }

    if (isCappedByQuota) {
      toast.error(`Kredit tidak mencukupi! Anda butuh ${estimatedCost.toLocaleString("id-ID")} kredit, sisa kredit Anda adalah ${remainingCredits.toLocaleString("id-ID")}.`);
      return;
    }

    if (cooldown > 0) {
      alert(`Harap tunggu ${cooldown} detik lagi sebelum generasi berikutnya.`);
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

    try {
      if (!auth?.currentUser) throw new Error("Anda harus login untuk melakukan generasi.");
      
      const idTokenBuffer = await auth.currentUser.getIdToken(true);
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

      const res = await fetch("/api/tts", options);
      const data = await checkResponse(res, 0, options);

      if (data.audioContent) {
        console.log(`[TTS] Received audio content. Size: ${Math.round(data.audioContent.length / 1024)} KB`);
        
        const isGemini = voice && ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voice);
        const mimeType = isGemini ? 'audio/wav' : 'audio/mpeg';
        const blob = base64ToBlob(data.audioContent, mimeType);
        const url = URL.createObjectURL(blob);
        
        // Clean up previous blob URL to prevent memory leaks
        if (audioUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(url);
        setGeneratedInfo({
          duration: data.duration,
          voice: data.voice
        });
        setIsTeaser(data.isTeaser || false);
        // setUser will trigger re-render, and useEffect will pick up audioUrl to play
        setStatus("success");
        setIsAudioVisible(true);
        
        // Success: Trigger cooldown on client side too
        const cdTime = (!user || user.tier === 'FREE') ? 15 : 2;
        setCooldown(cdTime);

        setTimeout(() => setStatus("idle"), 3000);
        refreshUser();
        
        // Growth Prompt: Share your creation
        if (user.generation_count % 3 === 0) {
            toast.success("Share your creation & tag @rungu.id to get +30k characters!", { duration: 5000 });
        }
      } else {
        throw new Error("No audio content returned");
      }
    } catch (err) {
      setStatus("idle");
      if (err.status === 429 && err.data?.cooldownRemaining) {
        setCooldown(err.data.cooldownRemaining);
      }
      handleApiError(err, "Gagal menghasilkan suara.");
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
          console.error("Error sharing:", err);
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
        console.error("[Auth] Background sync error:", syncErr);
      }

      await refreshUser();
      setIsAuthOpen(false);
      toast.success("Login Google berhasil!");
    } catch (err) {
      console.error("[Auth] Google sign-in error:", err);
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
      toast.error("Silakan login terlebih dahulu untuk melakukan pembelian.");
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

  if (!isConfigValid) {
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
          <p className="text-xs font-mono text-text-muted break-all mb-4">{initError || clientInitError || "Firebase configuration missing or project mismatch."}</p>
          
          <div className="mt-4 p-3 bg-black/20 rounded border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Project ID:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "Missing"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">API Key:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_API_KEY ? (import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 6) + "...") : "Missing"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">App ID:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_APP_ID ? "Present" : "Missing"}</span></div>
          </div>

          <h3 className="text-xs font-black text-blue-400 uppercase mb-2 border-t border-surface/50 pt-4 mt-4">Saran Perbaikan:</h3>
          <ul className="text-xs text-text-muted list-disc pl-4 space-y-2">
            <li>Buka <b>Settings</b> &gt; <b>Secrets</b>.</li>
            <li>Pastikan <b>VITE_FIREBASE_API_KEY</b> berisi API Key yang valid (diawali AIza...).</li>
            <li>Pastikan <b>VITE_FIREBASE_PROJECT_ID</b> bernilai <code>practical-gecko-476621-q4</code>.</li>
            <li>Jika Anda meremote project lain, pastikan kedua nilai tersebut berasal dari project yang sama di Firebase Console.</li>
            <li>Hapus tanda kutip jika ada di nilai secret tersebut.</li>
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
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-4">
              <ShinervaLogo className="w-12 h-12 text-terracotta" />
              <span className="font-black text-3xl tracking-tight text-text hover:text-terracotta transition-colors cursor-pointer">
                Shinerva <span className="text-terracotta">TTS</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#aura"
                className="text-text-muted hover:text-text font-medium transition-colors"
              >
                Aura
              </a>
              <a
                href="#packs"
                className="text-text-muted hover:text-text font-medium transition-colors"
              >
                Content Packs
              </a>
              <a
                href="#pricing"
                className="text-text-muted hover:text-text font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-text-muted hover:text-text font-medium transition-colors"
              >
                FAQ
              </a>
              <a
                href="#contact"
                className="text-text-muted hover:text-text font-medium transition-colors"
              >
                Hubungi Kami
              </a>
              {user && (
                <>
                  <a
                    href="#pronunciation"
                    className="text-text-muted hover:text-text font-medium transition-colors"
                  >
                    Aturan Pengucapan
                  </a>
                  <button
                    onClick={handleReferralClick}
                    className="flex items-center gap-2 text-terracotta hover:text-trdark font-bold transition-all border-none bg-transparent cursor-pointer relative"
                  >
                    <Gift className="w-4 h-4" /> 
                    Bonus Referral
                    {user && (user.valid_referrals > 0) && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-terracotta"></span>
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 rounded-full hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text-muted hover:text-text shrink-0"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-surface2 hover:bg-surface3 border border-surface2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer group select-none"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start overflow-hidden">
                      <span className="text-[11px] font-black text-text group-hover:text-terracotta transition-colors truncate max-w-[100px]">
                        {user.name || user.email?.split("@")[0] || "User"}
                      </span>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                        {user.tier || "FREE"}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-transform shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div 
                      className="absolute right-0 mt-3 w-64 bg-surface border border-surface2 rounded-2xl shadow-2xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="p-4 border-b border-surface2 bg-surface2/30">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Akun Saya</p>
                           <button onClick={() => setIsUserMenuOpen(false)} className="text-text-muted hover:text-text bg-transparent border-none cursor-pointer p-1">
                             <X className="w-3 h-3" />
                           </button>
                        </div>
                        <p className="text-xs font-bold text-text truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] font-black bg-terracotta text-white px-2 py-0.5 rounded-md uppercase tracking-tight">
                             {user.tier}
                           </span>
                           <span className="text-[10px] font-bold text-text-muted">
                             {remainingCredits.toLocaleString("id-ID")} Karakter Tersisa
                           </span>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsProfileModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text group text-left"
                        >
                          <UserCircle className="w-5 h-5 text-text-muted group-hover:text-terracotta" />
                          <span className="text-sm font-bold">Profil Akun</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setIsHistoryOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text group text-left"
                        >
                          <History className="w-5 h-5 text-text-muted group-hover:text-terracotta" />
                          <span className="text-sm font-bold">Riwayat Suara</span>
                        </button>

                        <button 
                          onClick={() => {
                            setIsReferralOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text group text-left"
                        >
                          <UserPlus className="w-5 h-5 text-text-muted group-hover:text-terracotta" />
                          <span className="text-sm font-bold">Referral & Bonus</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                             window.location.hash = "pricing";
                             setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text group text-left"
                        >
                          <Settings className="w-5 h-5 text-text-muted group-hover:text-terracotta" />
                          <span className="text-sm font-bold">Langganan & Paket</span>
                        </button>

                        {user.tier === 'ENTERPRISE' && (
                          <button 
                            onClick={() => {
                              setIsVoiceMgmtOpen(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text group text-left"
                          >
                            <Settings2 className="w-5 h-5 text-text-muted group-hover:text-terracotta" />
                            <span className="text-sm font-bold">Voice Dev Console</span>
                          </button>
                        )}
                        
                        <div className="h-px bg-surface2 my-2 mx-2"></div>
                        
                        <button 
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors border-none bg-transparent cursor-pointer group text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-bold">Keluar Sekarang</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      switchAuthMode("login");
                      setIsAuthOpen(true);
                    }}
                    className="text-text-muted hover:text-text font-bold text-sm tracking-tight transition-colors border-none bg-transparent cursor-pointer px-3 py-2 rounded-lg hover:bg-surface2 hidden xs:block"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      switchAuthMode("signup");
                      setIsAuthOpen(true);
                    }}
                    className="bg-terracotta hover:bg-trdark text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm transition-all transform hover:scale-105 shadow-lg shadow-terracotta/20 border-none cursor-pointer whitespace-nowrap"
                  >
                    Mulai Gratis (10k Karakter)
                  </button>
                </div>
              )}
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
             <h3 className="font-black text-xl mb-2">Selamat Datang!</h3>
             <p className="text-gray-400 text-sm mb-4">Kamu dapat 10.000 karakter gratis untuk memulai (~6 menit audio).</p>
             <button 
               onClick={() => {
                 setHasSeenWelcome(true);
                 localStorage.setItem("hasSeenWelcome", "true");
                 refreshUser();
               }} 
               className="bg-terracotta px-6 py-2 rounded-full font-bold text-sm border-none cursor-pointer text-white"
             >
               Siap!
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

      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terracotta/10 rounded-full blur-[120px] -z-10"></div>
          <div className="flex justify-center mb-6">
            <span className="bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-terracotta/20 animate-pulse">
              Powered by RUNGU Engine
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight text-text">
            Ubah Teks Menjadi <br />
            <span className="gradient-text">Suara Manusiawi</span>
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto font-medium">
            Generator suara AI paling realistis di Indonesia. Sempurna untuk
            konten TikTok, YouTube, Podcast, dan Iklan Anda tanpa harus rekaman.
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 bg-surface2 px-4 py-2 rounded-full border border-surface2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-text-muted">
                Bonus 10.000 Karakter Signup
              </span>
            </div>
          </div>
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
                      Editor Naskah
                    </label>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {estimatedCost > 0 && (
                          <span className="text-[10px] font-bold text-text-muted bg-surface2 px-2 py-0.5 rounded">
                            Beban: {estimatedCost.toLocaleString("id-ID")} Kredit
                          </span>
                        )}
                      </div>
                      {(isCappedByRequest || isCappedByQuota) && (
                        <span className="text-[10px] text-terracotta font-bold mt-1 animate-pulse">
                          {isCappedByRequest ? "Batas Request Tercapai!" : "Kredit Tidak Mencukupi!"}
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
                    placeholder="Ketik naskah Anda di sini..."
                  />
                  {user && (
                    <div className="mt-2 flex justify-between items-center text-[10px] font-bold">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <span>Panjang Naskah:</span>
                          <span className={`${isCappedByRequest ? "text-terracotta" : "text-text"} font-mono`}>
                            {text.length.toLocaleString("id-ID")} / {currentMaxRequestChars.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-muted border-l border-surface2/30 pl-4">
                          <span>Sisa Kredit:</span>
                          <span className={remainingCredits < 1000 ? "text-terracotta" : "text-text"}>
                            {remainingCredits.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                      {user.tier === 'FREE' && (
                        <div className="text-terracotta bg-terracotta/5 px-2 py-0.5 rounded border border-terracotta/10">
                          Kuota Harian: {Math.max(0, 20 - user.generation_count)} / 20
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">
                      Suara Pilihan
                    </label>
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
                              {Object.entries(VOICES).map(([category, voiceList]) => (
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
                                      const isLocked = (v.premium && userTierIndex < requiredTierIndex) || (isWavenet && isUserFree);
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
                                                {isLocked && "🔒 "}{v.name}
                                              </span>
                                              {isStudio && (
                                                <span className="text-[8px] font-black bg-terracotta text-white px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(231,76,60,0.5)]">
                                                  AURA
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-medium">Beban: {voiceConfig.tiers[v.type] || 1}x Kredit</span>
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
                      const selectedVoice = Object.values(VOICES).flat().find(v => v.id === voice);
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
                      <div className="mt-3 flex items-center gap-2 text-[10px] bg-terracotta/10 text-terracotta p-2 rounded-lg border border-terracotta/20 animate-pulse">
                        <Gift className="w-3 h-3" />
                        <span className="font-bold">Buka fitur suara Flow, Pulse & Aura Flagship dengan paket starter! <a href="#pricing" className="underline">Upgrade Sekarang</a></span>
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
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => {
                        setIsPlaying(false);
                        setCurrentTime(0);
                      }}
                      onTimeUpdate={updateProgress}
                      onLoadedMetadata={updateProgress}
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
                        {audioUrl && !isTeaser ? (
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
                             <Download className="w-4 h-4" /> Preview (Download Terkunci)
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={status === "loading" || status === "success" || cooldown > 0 || isCappedByRequest || isCappedByQuota}
                    className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg border-none cursor-pointer 
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
                        <Loader2 className="w-5 h-5 animate-spin" /> Memproses
                        Suara...
                      </>
                    )}
                    {status === "success" && (
                      <>
                        <CheckCircle className="w-5 h-5" /> Selesai!
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {/* Voice Playground Showcase */}
        <section id="playground" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <VoicePlayground 
            generateSample={generateSample}
            onUpgrade={() => {
              const element = document.getElementById('pricing');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
        </section>

        {/* Content Packs */}
        <section
          id="packs"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative"
        >
          <div className="text-center mb-16">
            <div className="inline-block bg-terracotta/20 text-terracotta px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Feature Update
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-text">
              Content Packs <span className="text-text-muted">(Coming Soon)</span>
            </h2>
            <p className="text-text-muted mx-auto max-w-2xl">
              Template naskah siap pakai dengan gaya bacaan yang sudah
              dioptimasi AI. Segera hadir untuk membantu produktivitas Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PACKS.map((pack) => (
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
                  Activate Pack
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Pilih Paket Anda
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto mb-8">
              Mulai gratis, upgrade saat Anda siap untuk produksi profesional.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-text-muted'}`}>Bulanan</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 bg-surface2 rounded-full relative p-1 transition-colors cursor-pointer border-none"
              >
                <div className={`w-5 h-5 bg-terracotta rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-white' : 'text-text-muted'}`}>Tahunan</span>
                <span className="bg-green-500/20 text-green-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Hemat 27%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Free */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2">Free</h3>
              <div className="text-2xl font-black text-text mb-6">
                Rp 0{" "}
                <span className="text-xs font-medium text-text-muted">
                  /bulan
                </span>
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 6 menit audio ≈ 6 video TikTok 1 menit
              </div>
              <ul className="space-y-4 mb-8 flex-grow text-text-muted text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  10.000 Kredit / Bulan
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-3 h-3 text-red-500 flex-shrink-0" />{" "}
                  Kredit Sisa Hangus
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Tier 1 (Basic / Flow)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Maks 10 Video / Hari
                </li>
              </ul>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthOpen(true);
                }}
                className="w-full border border-surface2 hover:border-terracotta text-white font-bold py-3 text-sm rounded-xl transition-all bg-transparent cursor-pointer"
              >
                Coba Sekarang
              </button>
            </div>
            {/* Starter */}
            <div className="bg-surface border border-terracotta p-6 rounded-3xl flex flex-col relative shadow-[0_0_30px_rgba(226,114,91,0.15)]">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-terracotta text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                Paling Populer
              </div>
              <h3 className="text-lg font-bold mb-2 text-text">Starter</h3>
              <div className="text-2xl font-black text-text mb-6">
                Rp 19rb{" "}
                <span className="text-xs font-medium text-text-muted">
                  /skali
                </span>
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 33 menit audio ≈ 33 video TikTok 1 menit
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-text-muted text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  50.000 Kredit (Top Up)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Pulse: Suara Ekspresif & Manusiawi
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Hak Penggunaan Komersial
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Kredit Tidak Akan Hangus
                </li>
              </ul>
              <button 
                onClick={() => handlePurchase(PLANS.STARTER.id)}
                disabled={purchaseLoading === PLANS.STARTER.id}
                className="w-full bg-terracotta hover:bg-trdark text-white font-bold py-3 text-sm rounded-xl transition-all border-none cursor-pointer flex justify-center items-center"
              >
                {purchaseLoading === PLANS.STARTER.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pilih Paket"}
              </button>
            </div>
            {/* Kreator */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2 text-text">Kreator</h3>
              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <div className="text-2xl font-black text-text">
                    Rp 49rb <span className="text-xs font-medium text-text-muted">/bulan</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-text-muted line-through">Rp 49rb</div>
                    <div className="text-2xl font-black text-text">
                      Rp 35rb <span className="text-xs font-medium text-text-muted">/bulan</span>
                    </div>
                    <div className="text-[10px] text-green-500 font-bold mt-1">Rp 429rb ditagih tahunan</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 100 menit audio ≈ 100 video TikTok 1 menit
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-text-muted text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-white flex-shrink-0" /> 150.000
                  Kredit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-white flex-shrink-0" /> Basic, Flow, Pulse & Aura
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-white flex-shrink-0" /> Support
                  WA Lengkap
                </li>
              </ul>
              <button 
                onClick={() => handlePurchase(PLANS.KREATOR.id)}
                disabled={purchaseLoading === PLANS.KREATOR.id}
                className="w-full bg-terracotta hover:bg-trdark text-white font-bold py-3 text-sm rounded-xl transition-all border-none cursor-pointer flex justify-center items-center"
              >
                {purchaseLoading === PLANS.KREATOR.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pilih Paket"}
              </button>
            </div>
            {/* Produktif */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2 text-text">Produktif</h3>
              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <div className="text-2xl font-black text-text">
                    Rp 99rb <span className="text-xs font-medium text-text-muted">/bulan</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-text-muted line-through">Rp 99rb</div>
                    <div className="text-2xl font-black text-text">
                      Rp 72rb <span className="text-xs font-medium text-text-muted">/bulan</span>
                    </div>
                    <div className="text-[10px] text-green-500 font-bold mt-1">Rp 869rb ditagih tahunan</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 266 menit audio ≈ 266 video TikTok 1 menit
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-text-muted text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  400.000 Kredit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Antrean Instan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Full Commercial
                </li>
              </ul>
              <button 
                onClick={() => handlePurchase(PLANS.PRODUKTIF.id)}
                disabled={purchaseLoading === PLANS.PRODUKTIF.id}
                className="w-full border border-surface2 hover:border-terracotta text-white font-bold py-3 text-sm rounded-xl transition-all bg-transparent cursor-pointer flex justify-center items-center"
              >
                {purchaseLoading === PLANS.PRODUKTIF.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pilih Paket"}
              </button>
            </div>
            {/* Bisnis */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2 text-text">Bisnis</h3>
              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <div className="text-2xl font-black text-text">
                    Rp 249rb <span className="text-xs font-medium text-text-muted">/bulan</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-text-muted line-through">Rp 249rb</div>
                    <div className="text-2xl font-black text-text">
                      Rp 182rb <span className="text-xs font-medium text-text-muted">/bulan</span>
                    </div>
                    <div className="text-[10px] text-green-500 font-bold mt-1">Rp 2.184rb ditagih tahunan</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 1000 menit audio ≈ 1000 video TikTok 1 menit
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-text-muted text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  1.500.000 Kredit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Akses Eksklusif Aura Flagship
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" /> WA
                  Khusus Tim
                </li>
              </ul>
              <button 
                onClick={() => handlePurchase(PLANS.BISNIS.id)}
                disabled={purchaseLoading === PLANS.BISNIS.id}
                className="w-full border border-surface2 hover:border-terracotta text-white font-bold py-3 text-sm rounded-xl transition-all bg-transparent cursor-pointer flex justify-center items-center"
              >
                {purchaseLoading === PLANS.BISNIS.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pilih Paket"}
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-text">Pertanyaan Populer</h2>
            <p className="text-text-muted">
              Segala hal yang perlu Anda ketahui tentang Shinerva.id
            </p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
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
                  <span className="font-black text-3xl tracking-tight text-text">
                    Shinerva<span className="text-terracotta">.id</span>
                  </span>
                </div>
                <p className="text-text-muted max-w-sm">
                  Solusi AI Text-to-Speech khusus Bahasa Indonesia dengan
                  kualitas manusiawi tersertifikasi untuk berbagai kebutuhan
                  konten.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-text">Produk</h4>
                <ul className="space-y-4 text-text-muted text-sm">
                  <li>
                    <a
                      href="#aura"
                      className="hover:text-terracotta transition-colors"
                    >
                      Aura
                    </a>
                  </li>
                  <li>
                    <a
                      href="#packs"
                      className="hover:text-terracotta transition-colors"
                    >
                      Content Packs
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pricing"
                      className="hover:text-terracotta transition-colors"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      className="hover:text-terracotta transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="hover:text-terracotta transition-colors"
                    >
                      Hubungi Kami
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
              <p>© 2024 Shinerva Text To Speech. All rights reserved.</p>
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
              <h3 className="text-2xl font-black text-text mb-4">Aktivasi Aura Narration</h3>
              <p className="text-text-muted mb-8 leading-relaxed">
                Anda akan menggunakan <span className="text-text font-bold">Suara Aura Flagship</span>. Operasi ini membutuhkan <span className="text-terracotta font-black text-lg">40x Kredit</span> karena kualitas pemrosesan yang sangat tinggi. Lanjutkan?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsStudioWarningOpen(false);
                    proceedWithGenerate();
                  }}
                  className="w-full bg-terracotta hover:bg-trdark text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-terracotta/20 border-none cursor-pointer"
                >
                  Ya, Lanjutkan
                </button>
                <button
                  onClick={() => setIsStudioWarningOpen(false)}
                  className="w-full bg-surface2/50 hover:bg-surface2 text-text font-bold py-4 rounded-xl transition-all border-none cursor-pointer"
                >
                  Batal
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
