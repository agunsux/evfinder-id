import React, { useState, useRef, useEffect, Suspense } from "react";
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
  signInWithEmailLink,
  sendEmailVerification,
  reload
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
import TurnstileWidget from "./components/TurnstileWidget";

import { PACKS } from "./constants/packs";
import { FAQS } from "./constants/faqs";
import { VOICES, LANGUAGES, DEFAULT_VOICES, getVoiceDisplayName } from "./constants/voices";
import { TRANSLATIONS } from "./constants/translations";
import StudioSection from "./components/StudioSection";
import AudioPlayer from "./components/AudioPlayer";
import PricingSection from "./components/PricingSection";
import { useStudio } from "./context/StudioContext";
import { loadMidtransSnap } from "./main";

// Lazy load heavy modals
const ProfileModal = React.lazy(() => import("./components/ProfileModal"));
const HistoryModal = React.lazy(() => import("./components/HistoryModal"));
const VoiceManagementModal = React.lazy(() => import("./components/VoiceManagementModal"));
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
  const {
    text, setText,
    audioUrl, setAudioUrl,
    voice, setVoice,
    speed, setSpeed,
    pitch, setPitch,
    volume, setVolume,
    status, setStatus,
    loadingMessage, setLoadingMessage,
    turnstileToken, setTurnstileToken,
    isAudioVisible, setIsAudioVisible,
    isPlaying, setIsPlaying,
    voiceConfig, setVoiceConfig
  } = useStudio();
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
    const voiceId = "SAMBAS";
    
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

    // Timeout fallback for browsers that block indexedDB/cookies (e.g. strict tracking prevention)
    const authTimeout = setTimeout(() => {
      setIsAuthInitializing(false);
      console.warn("[Auth] Initialization timed out. Proceeding to app...");
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(authTimeout);
      try {
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
      } finally {
        setIsAuthInitializing(false);
      }
    });
    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  // ─── Service Worker Registration (deferred, non-blocking) ───────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          console.log('[SW] Registered:', registration.scope, registration.active ? '(active)' : '(installing)');

          // Watch for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version available — refresh to update.');
                // Optional: toast to user
              }
            });
          });
        } catch (err) {
          console.warn('[SW] Registration failed:', err.message);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Pre-load Midtrans Snap script on mount
    loadMidtransSnap().catch((err) => {
      console.warn("[Midtrans] Pre-loading Snap.js script failed:", err.message);
    });
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
      throw e;
    }
  };

  const handleResendVerification = async () => {
    if (!auth?.currentUser) return;
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: auth.currentUser.email,
          action: "verifyEmail",
          continueUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Gagal mengirim email verifikasi.");
      toast.success(data.message || "Email verifikasi telah dikirim via sistem kami. Cek folder Inbox/Spam.");
    } catch (e) {
      toast.error("Gagal mengirim email verifikasi: " + e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRefreshVerificationStatus = async () => {
    if (!auth?.currentUser) return;
    setAuthLoading(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        setUser(prev => prev ? { ...prev, emailVerified: true } : prev);
        toast.success("Email terverifikasi!");
        setIsVerificationDismissed(true);
      } else {
        toast("Email belum terverifikasi. Cek folder Inbox/Spam.");
      }
    } catch (e) {
      toast.error("Gagal memeriksa status: " + e.message);
    } finally {
      setAuthLoading(false);
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
          pitch: pitch,
          volume: volume,
          turnstileToken
        }),
      };
      const res = await fetch("/api/tts", options);
      const data = await checkResponse(res, 0, options);
      if (data.audioContent || data.audioUrl) {
        let url;
        if (data.audioUrl) url = data.audioUrl;
        else {
          const mimeType = data.audioMimeType || 'audio/mpeg';
          const blob = base64ToBlob(data.audioContent, mimeType);
          if (blob) url = URL.createObjectURL(blob);
        }
        if (url) {
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

  // Sync user state when auth.currentUser exists but onAuthStateChanged hasn't set it
  // (fixes Edge tracking prevention blocking IndexedDB auth persistence)
  useEffect(() => {
    if (!user && auth?.currentUser) {
      setUser({
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        emailVerified: auth.currentUser.emailVerified,
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
    }
  }, [auth?.currentUser, auth?.currentUser?.uid]);

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
      if (data.audioContent || data.audioUrl) {
        let url;
        if (data.audioUrl) url = data.audioUrl;
        else {
          const mimeType = data.audioMimeType || 'audio/mpeg';
          const blob = base64ToBlob(data.audioContent, mimeType);
          if (blob) url = URL.createObjectURL(blob);
        }
        if (url) {
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
          isSample: true,
          turnstileToken
        }),
      };

      const res = await fetch("/api/tts/sample", options);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Gagal mengambil sampel suara (${res.status})`);
      }
      const data = await res.json();
      
      if (data.audioContent || data.audioUrl) {
        if (data.audioUrl) return data.audioUrl;
        const mimeType = data.audioMimeType || 'audio/mpeg';
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

      if (data.audioUrl || data.audioBase64) {
        setLoadingMessage("Mengunduh hasil...");
        const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[TTS] Synthesis successful in ${generationTime}s. Source: ${data.audioUrl ? 'R2 Cache' : 'API generated'}`);
        
        let url;
        const base64 = data.audioBase64 || data.audioContent;
        if (data.audioUrl) {
          url = data.audioUrl;
        } else if (base64) {
          const mimeType = data.audioMimeType || 'audio/wav';
          const blob = base64ToBlob(base64, mimeType);
          if (blob) {
            try {
              url = URL.createObjectURL(blob);
              // Clean up previous blob URL
              if (audioUrl && audioUrl.startsWith('blob:')) {
                URL.revokeObjectURL(audioUrl);
              }
            } catch (blobErr) {
              console.error("[TTS] Object URL creation failed:", blobErr);
              url = `data:${mimeType};base64,${base64}`;
            }
          } else {
            console.warn("[TTS] Blob creation failed, falling back to data URI");
            url = `data:${mimeType};base64,${base64}`;
          }
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
        
        // Optimistic local update: reduce credits immediately
        if (data.used_chars !== undefined) {
          setUser(prev => prev ? { ...prev, used_chars: data.used_chars } : prev);
        }
        
        // Refresh full profile from backend
        try {
          await refreshUser();
        } catch (refreshErr) {
          console.warn("[TTS] refreshUser failed:", refreshErr);
        }
        
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
      
      if (err.status === 429 && err.data?.cooldownRemaining) {
        setCooldown(err.data.cooldownRemaining);
      }

      // Handle specific server errors - NEVER fallback to browser TTS for these
      if (err.status === 403) {
        toast.error(err.message || "Suara tidak tersedia untuk paket Anda.");
      } else if (err.status === 402) {
        toast.error(err.message || "Kredit tidak mencukupi.");
      } else if (err.message?.includes("naskah terlalu panjang")) {
        toast.error("Naskah melebihi batas karakter.");
      } else if (err.message?.includes("kredit tidak mencukupi") || err.message?.includes("tidak mencukupi")) {
        toast.error("Kredit karakter Anda habis.");
      } else if (err.status === 503 || err.message?.includes("pemeliharaan") || err.message?.includes("infrastruktur")) {
        toast.error(err.message || "Layanan sedang sibuk. Coba lagi nanti.");
      } else {
        // Generic error - show it, don't auto-fallback
        toast.error(err.message || "Gagal menghasilkan suara. Coba lagi.");
      }
    }
  };

  const fallbackTTS = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    
    // Clear previous audio state to prevent AudioPlayer from playing stale audio
    if (audioUrl) {
      if (audioUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(audioUrl); } catch (_) { /* ignore */ }
      }
      setAudioUrl(null);
    }
    setIsPlaying(false);
    
    // Set generatedInfo with estimated duration so player shows > 0:00
    setGeneratedInfo({
      duration: Math.round(text.length / 15),
      voice: voice,
      time: "N/A"
    });
    
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

    let voices = synth.getVoices();
    let idVoices = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').includes("id-id") || v.lang.toLowerCase() === "id");
    
    if (idVoices.length > 0) {
      // Try to find a female voice if possible
      const femaleVoice = idVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("perempuan"));
      utterance.voice = femaleVoice || idVoices[0];
    } else {
      // Fallback: Just set the language to id-ID so the browser tries to use a default Indonesian voice
      utterance.lang = 'id-ID';
    }

    setStatus("success");
    setIsAudioVisible(true);
    setTimeout(() => setStatus("idle"), 3000);

    // Speak directly via browser API — NO setIsPlaying(true) so AudioPlayer doesn't play stale audio
    synth.speak(utterance);
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
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          action: "signIn",
          continueUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Gagal mengirim link.");
      window.localStorage.setItem('emailForSignIn', authEmail);
      setMagicLinkSent(true);
      toast.success(data.message || "Link masuk dikirim! Cek inbox/spam email Anda.");
    } catch (err) {
      console.error("Magic link error:", err);
      toast.error(err.message);
    } finally {
      setIsMagicLoading(false);
    }
  };

  // Handle incoming magic link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      console.log("[Auth] Detected magic link in URL, attempting sign-in...");
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        console.log("[Auth] Email not found in localStorage, prompting user.");
        email = window.prompt('Harap masukkan email Anda kembali untuk verifikasi');
      }
      
      if (email) {
        console.log(`[Auth] Resolving signInWithEmailLink for email: ${email}`);
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            console.log("[Auth] signInWithEmailLink SUCCESS", { uid: result.user.uid, isNewUser: result.additionalUserInfo?.isNewUser });
            window.localStorage.removeItem('emailForSignIn');
            toast.success("Berhasil masuk!");
            setIsAuthOpen(false);
          })
          .catch((error) => {
            console.error("[Auth] signInWithEmailLink FAILED:", error.message || error, error.code);
            toast.error("Link tidak valid atau sudah kedaluwarsa.");
          });
      } else {
         console.warn("[Auth] Magic link sign-in aborted: no email provided.");
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
      
      if (!data.token) {
        throw new Error(language === 'ID' ? "Token pembayaran tidak valid." : "Invalid payment token.");
      }

      // Check if Snap is loaded, attempt lazy load if not loaded
      if (!window.snap) {
        try {
          await loadMidtransSnap();
        } catch (loadErr) {
          console.error("PAYMENT FLOW ERROR", loadErr);
          console.warn("[Midtrans] Failed lazy loading snap.js, falling back to redirectUrl:", loadErr);
          if (data.redirect_url) {
            toast(
              language === 'ID'
                ? "Membuka halaman pembayaran..."
                : "Opening payment page...",
              { icon: '🔗' }
            );
            setTimeout(() => {
              window.location.href = data.redirect_url;
            }, 1000);
            return;
          }
          throw new Error(
            language === 'ID'
              ? "Midtrans Snap tidak dapat dimuat. Periksa koneksi internet Anda atau matikan Adblocker."
              : "Midtrans Snap could not be loaded. Please check your internet connection or disable Adblocker."
          );
        }
      }

      // @ts-ignore
      window.snap.pay(data.token, {
        onSuccess: (result) => {
          console.log('success', result);
          toast.success(
            language === 'ID'
              ? "Pembayaran berhasil! Kredit Anda akan segera diperbarui."
              : "Payment successful! Your credits will be updated shortly."
          );
          refreshUser();
        },
        onPending: (result) => {
          console.log('pending', result);
          toast(
            language === 'ID'
              ? "Pembayaran pending. Silakan selesaikan pembayaran Anda."
              : "Payment pending. Please complete your payment.",
            { icon: '⏳' }
          );
        },
        onError: (result) => {
          console.error("PAYMENT FLOW ERROR", result);
          toast.error(
            language === 'ID'
              ? "Pembayaran gagal. Silakan coba lagi."
              : "Payment failed. Please try again."
          );
          if (data.redirect_url) {
            console.log("[Midtrans] Fallback redirecting on error to:", data.redirect_url);
            window.location.href = data.redirect_url;
          }
        },
        onClose: () => {
          console.log('customer closed the popup without finishing the payment');
        }
      });
    } catch (err) {
      console.error("PAYMENT FLOW ERROR", err);
      handleApiError(err, "Gagal memulai proses pembayaran.");
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (initError && !user) {
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
          
          <div className="mt-4 p-3 bg-dark/20 rounded border border-surface2/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between"><span className="text-text-muted">Client Config:</span> <span className="text-green-400 font-bold">{isConfigValid ? "Healthy" : "Invalid"}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Client Error:</span> <span className={clientInitError ? "text-red-400" : "text-green-400"}>{clientInitError || "Healthy"}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Server Error:</span> <span className={initError ? "text-red-400" : "text-green-400"}>{initError || "Healthy"}</span></div>
            <div className="flex justify-between border-t border-surface2/5 mt-1 pt-1"><span className="text-text-muted">Project ID:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "Missing"}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">API Key:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_API_KEY ? (import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 6) + "...") : "Missing"}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">App ID:</span> <span className="text-blue-300">{import.meta.env.VITE_FIREBASE_APP_ID ? "Present" : "Missing"}</span></div>
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
          className="mt-8 bg-terracotta px-6 py-3 rounded-full font-bold text-text border-none cursor-pointer hover:bg-trdark transition-colors"
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
      <nav className="sticky top-4 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-1"></div>
            
            <div className="flex items-center justify-center gap-4 flex-1">
              <img src="/shinerva-icon.svg" alt="Shinerva Logo" className="w-12 h-12" />
              <span className="font-black text-3xl tracking-tight text-terracotta cursor-pointer">
                SHINERVA
              </span>
            </div>

            <div className="flex items-center justify-end flex-1 gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLanguageChange(language === 'ID' ? 'EN' : 'ID')}
                  className="px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-surface2 text-text text-xs md:text-sm font-bold border border-surface2 hover:border-terracotta hover:bg-terracotta/5 transition-all cursor-pointer"
                  title={language === 'ID' ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
                >
                  {language === 'ID' ? 'EN' : 'ID'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 md:p-2.5 rounded-full bg-[#FDFBF7] text-terracotta shadow-sm border border-terracotta/10 hover:bg-[#F5EFE6] transition-all cursor-pointer flex items-center justify-center"
                  title={theme === 'dark' ? "Buka Mode Terang" : "Buka Mode Gelap"}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                {user ? (
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-text px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-semibold border border-surface2 hover:border-terracotta hover:bg-terracotta/5 transition-all cursor-pointer"
                  >
                    {language === 'ID' ? 'Akun Saya' : 'My Account'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setIsAuthOpen(true);
                    }}
                    className="text-text px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-semibold border border-surface2 hover:border-terracotta hover:bg-terracotta/5 transition-all cursor-pointer"
                  >
                    {language === 'ID' ? 'Masuk' : 'Sign In'}
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
             <p className="text-text-muted text-sm mb-4">{t('welcome.subtitle')}</p>
             <button 
               onClick={() => {
                 setHasSeenWelcome(true);
                 localStorage.setItem("hasSeenWelcome", "true");
                 refreshUser();
               }} 
               className="bg-terracotta px-6 py-2 rounded-full font-bold text-sm border-none cursor-pointer text-text"
             >
               {t('welcome.cta')}
             </button>
        </div>
      )}

      {/* Verification Banner */}
      {user && !user.emailVerified && auth?.currentUser && !isVerificationDismissed && (
        <div className="fixed top-24 left-0 right-0 z-50 animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none px-4">
          <div className="max-w-4xl mx-auto bg-terracotta text-white rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-surface2/10 pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-text" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Verifikasi Email Anda</p>
                <p className="text-xs text-text/80">Silakan verifikasi email Anda untuk memastikan keamanan akun. Cek folder Inbox/Spam di email {auth?.currentUser?.email}.</p>
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
                className="flex-1 md:flex-none px-4 py-2 bg-terracotta-dark/20 text-text border border-surface2/20 rounded-xl text-xs font-black hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cek Status
              </button>
              <button 
                onClick={() => setIsVerificationDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-text/60 hover:text-text border-none bg-transparent cursor-pointer"
                title="Tutup banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow pt-12 pb-12 px-4 sm:px-6 lg:px-8">
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
                className="bg-terracotta hover:bg-trdark text-text px-8 py-4 rounded-full font-black text-lg transition-all transform hover:scale-105 shadow-2xl shadow-terracotta/30 border-none cursor-pointer flex items-center justify-center gap-2"
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
                  <span className="text-sm text-text-muted mb-1">karakter</span>
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
                  <ChevronDown className="w-4 h-4 text-text-muted -rotate-90" />
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
                    <ChevronDown className="w-4 h-4 text-text-muted -rotate-90" />
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
                <StudioSection
                  user={user}
                  handleGenerate={handleGenerate}
                  cooldown={cooldown}
                  estimatedCost={estimatedCost}
                  currentMaxRequestChars={currentMaxRequestChars}
                  remainingCredits={remainingCredits}
                  isCappedByRequest={isCappedByRequest}
                  isCappedByQuota={isCappedByQuota}
                  isNearLimit={isNearLimit}
                  t={t}
                />
              </div>

              {/* Right Column */}
              <div className="w-full md:w-80 flex flex-col gap-6">


                <div className="flex-grow flex flex-col justify-end">
                  <AudioPlayer user={user || (auth?.currentUser ? { email: auth.currentUser.email } : null)} isTeaser={isTeaser} generatedInfo={generatedInfo} />
                </div>
                </div>
            </div>
          </div>
        </section>


        {/* Pricing Section */}
        <section
          id="pricing"
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
            {[PLANS.FREE, PLANS.STARTER, PLANS.KREATOR, PLANS.PRODUKTIF].map((plan) => (
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
                      : "bg-terracotta hover:bg-trdark text-text"
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


        {/* Content Packs */}
        <section
          id="packs"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative"
        >
          <div className="text-center mb-16">
            <div className="inline-block bg-terracotta/20 text-terracotta px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Custom Packages
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-text">
              {language === 'ID' ? 'Paket Kustom' : 'Custom Packages'} <span className="text-text-muted">({language === 'ID' ? 'Berdasarkan Permintaan' : 'By Request'})</span>
            </h2>
            <p className="text-text-muted mx-auto max-w-2xl">
              {language === 'ID' 
                ? 'Kami menyediakan paket kustom sesuai kebutuhan proyek Anda. Hubungi kami untuk mendiskusikan gaya bacaan atau fitur spesifik yang Anda perlukan.' 
                : 'We provide custom packages tailored to your project needs. Contact us to discuss specific reading styles or features you require.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(PACKS[language] || PACKS['ID']).map((pack) => (
              <div
                key={pack.id}
                className={`bg-surface rounded-2xl p-6 border transition-colors flex flex-col items-start relative group ${pack.trending ? "border-terracotta/30 shadow-[0_0_15px_rgba(226,114,91,0.1)]" : "border-surface2"}`}
              >
                <div className="flex justify-between w-full mb-4">
                  <span className="text-xs font-black px-2 py-1 bg-surface2 text-text-muted rounded-md uppercase tracking-widest">
                    {pack.tag}
                  </span>
                  {pack.trending && (
                    <span className="text-[10px] font-black px-2 py-1 bg-terracotta/50 text-text rounded-md uppercase tracking-widest">
                      POPULAR
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-text">{pack.title}</h3>
                <p className="text-text-muted text-sm mb-6 flex-grow">
                  {pack.desc}
                </p>
                <a
                  href="#contact"
                  className="w-full bg-dark/50 border border-gray-700 hover:border-terracotta hover:bg-terracotta/10 text-text-muted hover:text-terracotta font-bold py-2.5 rounded-lg transition-all text-sm text-center block"
                >
                  {language === 'ID' ? 'Hubungi Kami' : 'Contact Us'}
                </a>
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
                <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
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
                className="bg-green-600 hover:bg-green-700 text-text px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3"
              >
                Chat WhatsApp
              </a>
              <a
                href="mailto:hello.shinerva@gmail.com"
                className="bg-surface2 hover:bg-gray-700 text-text px-10 py-4 rounded-2xl font-black transition-all border border-gray-700 flex items-center gap-3"
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
              <p>© 2026 Shinerva AI Voice. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="/privacy.html" target="_blank" className="hover:text-text transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms.html" target="_blank" className="hover:text-text transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <ProfileModal 
            user={user} 
            remainingCredits={remainingCredits}
            setIsProfileModalOpen={setIsProfileModalOpen}
            handleResendVerification={handleResendVerification}
            setIsReferralOpen={setIsReferralOpen}
          />
        </Suspense>
      )}

      {/* Studio Voice Warning Modal */}
      {isStudioWarningOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark/90 backdrop-blur-md"
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
                  className="w-full bg-terracotta hover:bg-trdark text-text font-black py-4 rounded-xl transition-all shadow-lg shadow-terracotta/20 border-none cursor-pointer"
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
            className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
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
                  <h3 className="text-lg font-black text-text mb-2 text-center">Cek Email Anda!</h3>
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
            className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            onClick={() => setIsPronunciationOpen(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl mx-4 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsPronunciationOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <BookOpen className="w-16 h-16 text-terracotta mx-auto mb-4" />
              <h2 className="text-2xl font-black text-text">Panduan Pengucapan</h2>
              <p className="text-text-muted text-sm mt-2">
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
                    <span className="text-[10px] text-text-muted font-bold">{tip.w} →</span>
                    <span className="text-xs text-text font-medium">{tip.p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Kata Asli</label>
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
                            <span className="text-sm text-text font-bold">{key}</span>
                            <span className="text-[10px] text-text-muted group-hover:text-terracotta transition-colors italic">
                              Baca: {globalPhonetics[key]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Cara Baca</label>
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
                className="w-full bg-terracotta hover:bg-trdark text-text py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Aturan
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                Aturan Tersimpan ({Object.keys(user?.pronunciations || {}).length})
              </h3>
              <div className="space-y-3">
                {user?.pronunciations && Object.keys(user.pronunciations).length > 0 ? (
                  Object.entries(user.pronunciations).map(([word, pron]) => (
                    <div key={word} className="flex items-center justify-between bg-dark p-4 rounded-xl border border-surface2">
                      <div className="flex flex-col">
                        <span className="text-text font-bold">{word}</span>
                        <span className="text-terracotta text-sm">Dibaca: {pron}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestPronunciation(word, pron)}
                          disabled={testLoading}
                          className="text-text-muted hover:text-terracotta transition-colors p-2 cursor-pointer bg-transparent border-none"
                          title="Tes suara"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdatePronunciation(word, null)}
                          className="text-text-muted hover:text-red-500 transition-colors p-2 cursor-pointer bg-transparent border-none"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-muted italic text-sm">
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
        <Suspense fallback={null}>
          <HistoryModal 
            historyLoading={historyLoading}
            history={history}
            setIsHistoryOpen={setIsHistoryOpen}
          />
        </Suspense>
      )}

      {/* Voice Management Modal */}
      {isVoiceMgmtOpen && (
        <Suspense fallback={null}>
          <VoiceManagementModal 
            voiceConfigLoading={voiceConfigLoading}
            voiceConfig={voiceConfig}
            setVoiceConfig={setVoiceConfig}
            setIsVoiceMgmtOpen={setIsVoiceMgmtOpen}
            saveVoiceConfig={saveVoiceConfig}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
