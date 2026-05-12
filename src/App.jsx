import React, { useState, useRef, useEffect } from "react";
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
  Gift,
  BookOpen,
  Trash2,
  Plus,
  Sun,
  Moon,
  History,
  LogOut,
  Mail,
} from "lucide-react";

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
    question: "Apa perbedaan teknologi Standard dan Neural2?",
    answer:
      "Standard adalah teknologi TTS dasar, sementara Neural2 menggunakan pemrosesan saraf terbaru yang menghasilkan intonasi, jeda, dan emosi yang jauh lebih mirip manusia asli.",
  },
  {
    question: "Bagaimana cara menghubungi bantuan?",
    answer:
      "Anda bisa menghubungi tim kami melalui WhatsApp atau Email yang tersedia di bagian bawah website jika mengalami kendala atau membutuhkan integrasi khusus.",
  },
];

const VOICES = {
  Standard: [
    { id: "id-ID-Standard-A", name: "Ratna (Wanita)", type: "Standard" },
    { id: "id-ID-Standard-B", name: "Bambang (Pria)", type: "Standard" },
    { id: "id-ID-Wavenet-A", name: "Siti (Wanita)", type: "Wavenet" },
    { id: "id-ID-Wavenet-B", name: "Sambas (Pria)", type: "Wavenet" },
  ],
  Neural2: [
    { id: "id-ID-Neural2-A", name: "Ratna (Neural2)", type: "Neural2", premium: true, tier: "STARTER" },
    { id: "id-ID-Neural2-D", name: "Bambang (Neural2)", type: "Neural2", premium: true, tier: "STARTER" },
  ],
  "Studio Premium": [
    { id: "id-ID-Studio-A", name: "Agus (Iklan)", type: "Studio", premium: true, glow: true, tier: "KREATOR" },
    { id: "id-ID-Studio-D", name: "Citra (Narasi)", type: "Studio", premium: true, glow: true, tier: "KREATOR" },
  ],
  Regional: [
    { id: "jv-ID-Wavenet-A", name: "Jawa - Siti", type: "Regional" },
    { id: "jv-ID-Wavenet-B", name: "Jawa - Sambas", type: "Regional" },
  ]
};

const ShinervaLogo = ({ className }) => (
  <div className={`flex items-center justify-center ${className} bg-dark rounded-xl border border-surface2 shadow-inner overflow-hidden p-1.5`}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E2725B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      {/* Concentric waves */}
      <path d="M2 12 A 10 10 0 0 1 22 12" className="opacity-40" />
      <path d="M5 12 A 7 7 0 0 1 19 12" className="opacity-70" />
      <path d="M8 12 A 4 4 0 0 1 16 12" />
      {/* Abstract ear shape */}
      <path d="M12 15c-1.5 0-2-1-2-2.5 0-1.5 1-2 1-3a2.5 2.5 0 0 1 5 0c0 1-1 1.5-1 3s.5 2.5-1 2.5" />
      <path d="M12.5 12c-.5 0-1-.5-1-1s.5-1 .5-2a1 1 0 0 1 2 0c0 .5-.5 1-.5 1.5" strokeWidth="1.5" />
    </svg>
  </div>
);

function App() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("id-ID-Wavenet-A");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const [isAudioVisible, setIsAudioVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login, signup
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("shinerva_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("shinerva_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("shinerva_user");
    }
  }, [user]);

  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: "",
    refCode: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialUrl, setSocialUrl] = useState("");

  const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newPronunciation, setNewPronunciation] = useState("");

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isVoiceMgmtOpen, setIsVoiceMgmtOpen] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({ tiers: {} });
  const [voiceConfigLoading, setVoiceConfigLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly, yearly

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
    if (!user) return;
    try {
      const res = await fetch("/api/user/me", {
        headers: { "x-user-email": user.email },
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (e) {}
  };

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/user/history", {
        headers: { "x-user-email": user.email },
      });
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (e) {
      console.error("Error fetching history:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchVoiceConfig = async () => {
    setVoiceConfigLoading(true);
    try {
      const res = await fetch("/api/admin/voice-config", {
        headers: { "x-user-email": user?.email || "" },
      });
      const data = await res.json();
      if (data.tiers) setVoiceConfig(data);
    } catch (e) {
      console.error("Error fetching voice config:", e);
    } finally {
      setVoiceConfigLoading(false);
    }
  };

  const saveVoiceConfig = async (newTiers, newLimits) => {
    if (!user || user.tier !== "ENTERPRISE") return;
    try {
      const res = await fetch("/api/admin/voice-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ tiers: newTiers, limits: newLimits }),
      });
      const data = await res.json();
      if (data.success) {
        setVoiceConfig(data.voiceConfig);
        alert("Konfigurasi berhasil disimpan!");
      }
    } catch (e) {
      console.error("Error saving config:", e);
      alert("Gagal menyimpan konfigurasi.");
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return alert("Masukkan email tujuan.");
    setTestEmailLoading(true);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      console.error("Error sending test email:", e);
      alert("Gagal mengirim email tes.");
    } finally {
      setTestEmailLoading(false);
    }
  };

  useEffect(() => {
    fetchVoiceConfig();
  }, [user]);

  useEffect(() => {
    if (isVoiceMgmtOpen) {
      fetchVoiceConfig();
    }
  }, [isVoiceMgmtOpen]);

  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [isHistoryOpen]);

  const handleUpdatePronunciation = async (word, pronunciation) => {
    if (!user) {
      alert("Harap login terlebih dahulu untuk menggunakan fitur ini.");
      return;
    }
    try {
      const res = await fetch("/api/user/pronunciations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ word, pronunciation }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, pronunciations: data.pronunciations });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui panduan pengucapan.");
    }
  };

  const maxChars = 5000;
  const audioRef = useRef(null);
  const textAreaRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isTeaser, setIsTeaser] = useState(false);

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

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert("Silakan tulis naskah terlebih dahulu.");
      return;
    }

    if (cooldown > 0) {
      alert(`Harap tunggu ${cooldown} detik lagi sebelum generasi berikutnya.`);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user ? user.email : "",
        },
        body: JSON.stringify({ 
          text, 
          voice, 
          speed: parseFloat(speed), 
          pitch: parseFloat(pitch), 
          volume: parseFloat(volume) 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
        throw new Error(data.error || "Failed to synthesize speech");
      }

      if (data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        setAudioUrl(audioSrc);
        setIsTeaser(data.isTeaser || false);
        setStatus("success");
        setIsAudioVisible(true);
        
        // Success: Trigger cooldown on client side too
        const cdTime = (!user || user.tier === 'FREE') ? 15 : 2;
        setCooldown(cdTime);

        setTimeout(() => setStatus("idle"), 3000);
        refreshUser();
      } else {
        throw new Error("No audio content returned");
      }
    } catch (err) {
      console.error("TTS Generation Error:", err);
      setStatus("idle");
      alert(err.message || "Gagal menghasilkan suara.");
    }
  };

  const fallbackTTS = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("shinerva_user");
    alert("Berhasil keluar.");
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === "whatsapp") {
        if (!otpSent) {
          // Request OTP
          const res = await fetch("/api/auth/otp/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ whatsapp: authData.whatsapp }),
          });
          const data = await res.json();
          if (data.success) {
            setOtpSent(true);
            alert(`OTP telah dikirim ke WhatsApp Anda (mock: check console)`);
          } else {
            alert(data.message || "Gagal mengirim OTP");
          }
        } else {
          // Verify OTP
          const res = await fetch("/api/auth/otp/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ whatsapp: authData.whatsapp, otp: otpCode }),
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setIsAuthOpen(false);
          } else {
            alert(data.message || "Kode OTP salah atau kedaluwarsa");
          }
        }
      } else {
        const endpoint =
          authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authData),
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          if (authMode === "signup") {
            alert("Signup Berhasil! Selamat datang di Shinerva. Sesuai permintaan Anda, notifikasi akan dikirimkan ke email Anda (Fitur email sedang dalam pengembangan).");
          } else {
            alert("Login Berhasil!");
          }
          setIsAuthOpen(false);
        } else {
          alert("Gagal: " + (data.message || "Unknown error"));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setOtpSent(false);
    setOtpCode("");
    setAuthData({
      name: "",
      email: "",
      password: "",
      whatsapp: "",
      refCode: "",
    });
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    if (!socialUrl) return;
    try {
      const res = await fetch("/api/user/social-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ url: socialUrl }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Tautan berhasil dikirim. Menunggu verifikasi admin!");
        setShowSocialModal(false);
        refreshUser();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error submitting social share");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-4">
              <ShinervaLogo className="w-12 h-12" />
              <span className="font-black text-3xl tracking-tight text-text hover:text-terracotta transition-colors cursor-pointer">
                Shinerva<span className="text-terracotta">.id</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#studio"
                className="text-text-muted hover:text-text font-medium transition-colors"
              >
                Studio
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
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text-muted hover:text-text"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-terracotta text-sm">{user.name || user.email}</span>
                    <span className="text-[10px] bg-terracotta/20 text-terracotta px-1.5 py-0.5 rounded font-black uppercase">{user.tier}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer text-text-muted hover:text-red-500"
                    title="Keluar"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      switchAuthMode("login");
                      setIsAuthOpen(true);
                    }}
                    className="hidden md:block text-text-muted hover:text-text font-medium transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      switchAuthMode("signup");
                      setIsAuthOpen(true);
                    }}
                    className="bg-terracotta hover:bg-trdark text-white px-5 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-terracotta/20 border-none cursor-pointer"
                  >
                    Mulai Gratis (5rb Karakter)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terracotta/10 rounded-full blur-[120px] -z-10"></div>
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
                Bonus 5.000 Karakter Signup
              </span>
            </div>
          </div>
        </section>

        {/* Studio Section */}
        <section
          id="studio"
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-32"
        >
          {user && (
            <div className="bg-surface2 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center border border-surface2 shadow-xl gap-4">
              <div className="flex-1 w-full">
                <div className="text-sm font-bold text-gray-400 mb-2">
                  Sisa Kuota Total
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black text-white">
                    {Math.max(
                      0,
                      user.monthly_chars +
                        user.signup_bonus_chars +
                        user.earned_chars -
                        user.used_chars,
                    ).toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">karakter</span>
                </div>
                <div className="w-full bg-dark h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-terracotta h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (user.used_chars / Math.max(1, user.monthly_chars + user.signup_bonus_chars + user.earned_chars)) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Bulanan</div>
                    <div className="font-bold text-text">{user.monthly_chars.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Bonus Signup</div>
                    <div className="font-bold text-text">{user.signup_bonus_chars.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Ekstra</div>
                    <div className="font-bold text-text">{user.earned_chars.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-text-muted text-xs mb-1">Digunakan</div>
                    <div className="font-bold text-terracotta">{user.used_chars.toLocaleString("id-ID")}</div>
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
                <div className="bg-dark p-3 rounded-xl border border-surface2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-terracotta" />{" "}
                    <span className="text-sm font-bold">
                      Referral ({user.valid_referrals}/2)
                    </span>
                  </div>
                  <span className="text-xs bg-surface2 px-2 py-1 rounded text-gray-300">
                    {user.referral_code}
                  </span>
                </div>
                <button
                  onClick={() =>
                    user.social_bonus_status === "none" &&
                    setShowSocialModal(true)
                  }
                  disabled={user.social_bonus_status !== "none"}
                  className={`p-3 rounded-xl border flex justify-between items-center transition-colors border-none text-left ${user.social_bonus_status === "none" ? "bg-dark hover:bg-surface2 border-surface2 cursor-pointer" : "bg-surface/50 border-surface2/50 cursor-not-allowed opacity-70"}`}
                >
                  <div className="flex items-center gap-2">
                    <Share2
                      className={`w-4 h-4 ${user.social_bonus_status === "none" ? "text-terracotta" : "text-text-muted"}`}
                    />{" "}
                    <span
                      className={`text-sm font-bold ${user.social_bonus_status === "none" ? "text-text" : "text-text-muted"}`}
                    >
                      Social Bonus
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${user.social_bonus_status === "none" ? "text-terracotta animate-pulse" : user.social_bonus_status === "pending" ? "text-yellow-500" : "text-green-500"}`}
                  >
                    {user.social_bonus_status === "none"
                      ? "Klaim 30rb!"
                      : user.social_bonus_status === "pending"
                        ? "Pending"
                        : "Approved"}
                  </span>
                </button>
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
                    <span
                      className={`text-xs font-mono ${text.length > maxChars * 0.9 ? "text-terracotta" : "text-text-muted"}`}
                    >
                      {text.length} / {maxChars}
                    </span>
                  </div>
                  <textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-64 bg-dark text-text rounded-2xl p-5 border border-surface2 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none resize-none transition-all"
                    placeholder="Ketik naskah Anda di sini..."
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-text-muted">
                        Suara Pilihan
                      </label>
                      {text.length > 0 && (
                        <span className="text-[10px] font-bold text-terracotta bg-terracotta/5 px-2 py-0.5 rounded-full border border-terracotta/10">
                          Estimasi: {(() => {
                            const matched = Object.values(VOICES).flat().find(v => v.id === voice);
                            const m = voiceConfig.tiers?.[matched?.type] || 1;
                            return (text.length * m).toLocaleString('id-ID');
                          })()} kredit ({(() => {
                            const matched = Object.values(VOICES).flat().find(v => v.id === voice);
                            return voiceConfig.tiers?.[matched?.type] || 1;
                          })()}x multiplier untuk {text.length} karakter)
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        className="w-full bg-dark text-text appearance-none rounded-xl py-4 pl-4 pr-10 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer font-bold text-sm tracking-wide"
                      >
                        {Object.entries(VOICES).map(([category, voiceList]) => (
                          <optgroup key={category} label={category.toUpperCase()}>
                            {voiceList.map((v) => {
                              const tierOrder = ["FREE", "STARTER", "KREATOR", "PRODUKTIF", "BISNIS", "ENTERPRISE"];
                              const userTierIndex = tierOrder.indexOf(user?.tier || "FREE");
                              const requiredTierIndex = tierOrder.indexOf(v.tier || "FREE");
                              const isLocked = v.premium && userTierIndex < requiredTierIndex;
                              
                              return (
                                <option key={v.id} value={v.id} disabled={isLocked}>
                                  {isLocked ? "🔒 " : ""}{v.name} ({v.type} - {voiceConfig.tiers[v.type] || 1}x)
                                </option>
                              );
                            })}
                          </optgroup>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {(!user || user.tier === 'FREE') && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] bg-terracotta/10 text-terracotta p-2 rounded-lg border border-terracotta/20 animate-pulse">
                        <Gift className="w-3 h-3" />
                        <span className="font-bold">Buka suara Neural2 & Studio Premium dengan paket Kreator! <a href="#pricing" className="underline">Upgrade Sekarang</a></span>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Panduan Pengucapan
                      </span>
                      <button
                        onClick={() => setIsPronunciationOpen(true)}
                        className="text-xs bg-surface2 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 cursor-pointer"
                      >
                        Kelola
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-end">
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}

                  {isAudioVisible && (
                    <div className="bg-dark rounded-xl p-4 border border-surface2 mb-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={togglePlay}
                          className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center text-white hover:bg-trdark cursor-pointer border-none flex-shrink-0"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-1" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="text-xs text-terracotta mb-1 font-bold">
                            Audio Ready{" "}
                            {isTeaser && (
                              <span className="ml-2 bg-terracotta text-white px-2 py-0.5 rounded text-[10px] uppercase">
                                Preview Mode
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terracotta rounded-full transition-all"
                              style={{
                                width: isPlaying ? "100%" : "0%",
                                transitionDuration: isPlaying ? "3s" : "0s",
                              }}
                            ></div>
                          </div>
                        </div>
                        {audioUrl && !isTeaser && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleShare}
                              className="text-gray-400 hover:text-terracotta transition-colors cursor-pointer border-none bg-transparent p-0"
                              title="Bagikan Audio"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <a
                              href={audioUrl}
                              download="shinerva-audio.mp3"
                              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                        {audioUrl && isTeaser && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                alert(
                                  "Berbagi dinonaktifkan untuk mode Preview.",
                                )
                              }
                              className="text-gray-600 hover:text-terracotta transition-colors cursor-pointer border-none bg-transparent p-0"
                              title="Berbagi dikunci"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                alert(
                                  "Download dinonaktifkan untuk Preview Suara Studio. Upgrade ke paket Bisnis untuk mengunduh.",
                                )
                              }
                              className="text-gray-600 hover:text-terracotta transition-colors cursor-pointer border-none bg-transparent"
                              title="Download dikunci di mode Preview"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={status === "loading" || status === "success" || cooldown > 0}
                    className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg border-none cursor-pointer 
                      ${
                        status === "success"
                          ? "bg-green-600 text-white"
                          : status === "loading"
                            ? "bg-terracotta/75 text-white cursor-not-allowed"
                            : cooldown > 0
                              ? "bg-surface2 text-text-muted cursor-not-allowed border border-surface2"
                              : "bg-terracotta hover:bg-trdark shadow-terracotta/20 text-white"
                      }`}
                  >
                    {status === "idle" && cooldown === 0 && (
                      <>
                        <Mic className="w-5 h-5" /> Hasilkan Suara Sekarang
                      </>
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

        {/* Content Packs */}
        <section
          id="packs"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative"
        >
          <div className="text-center mb-16">
            <div className="inline-block bg-terracotta/20 text-terracotta px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Feature Update
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Content Packs <span className="text-gray-600">(Coming Soon)</span>
            </h2>
            <p className="text-gray-400 mx-auto max-w-2xl">
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
                  <span className="text-xs font-black px-2 py-1 bg-surface2 text-gray-400 rounded-md uppercase tracking-widest">
                    {pack.tag}
                  </span>
                  {pack.trending && (
                    <span className="text-[10px] font-black px-2 py-1 bg-terracotta/50 text-white rounded-md uppercase tracking-widest">
                      SOON
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{pack.title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-grow">
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
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
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
              <div className="text-2xl font-black mb-6">
                Rp 0{" "}
                <span className="text-xs font-medium text-gray-500">
                  /bulan
                </span>
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 10 menit audio ≈ 10 video
              </div>
              <ul className="space-y-4 mb-8 flex-grow text-gray-400 text-xs">
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
                  Tier 1 (Standard/WaveNet)
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
              <h3 className="text-lg font-bold mb-2">Starter</h3>
              <div className="text-2xl font-black mb-6">
                Rp 19rb{" "}
                <span className="text-xs font-medium text-gray-500">
                  /skali
                </span>
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 33 menit audio ≈ 33 video
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-gray-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  50.000 Kredit (Top Up)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Neural2 Suara Manusiawi
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
              <button className="w-full bg-terracotta hover:bg-trdark text-white font-bold py-3 text-sm rounded-xl transition-all border-none cursor-pointer">
                Pilih Paket
              </button>
            </div>
            {/* Kreator */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2">Kreator</h3>
              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <div className="text-2xl font-black">
                    Rp 49rb <span className="text-xs font-medium text-gray-500">/bulan</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-gray-500 line-through">Rp 49rb</div>
                    <div className="text-2xl font-black">
                      Rp 35rb <span className="text-xs font-medium text-gray-500">/bulan</span>
                    </div>
                    <div className="text-[10px] text-green-500 font-bold mt-1">Rp 429rb ditagih tahunan</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 100 menit audio ≈ 100 video
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-gray-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-white flex-shrink-0" /> 150.000
                  Kredit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-white flex-shrink-0" /> Tier 1,
                  2, 3 (Chirp HD)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-white flex-shrink-0" /> Support
                  WA Lengkap
                </li>
              </ul>
              <button className="w-full bg-terracotta hover:bg-trdark text-white font-bold py-3 text-sm rounded-xl transition-all border-none cursor-pointer">
                Pilih Paket
              </button>
            </div>
            {/* Produktif */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2">Produktif</h3>
              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <div className="text-2xl font-black">
                    Rp 99rb <span className="text-xs font-medium text-gray-500">/bulan</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-gray-500 line-through">Rp 99rb</div>
                    <div className="text-2xl font-black">
                      Rp 72rb <span className="text-xs font-medium text-gray-500">/bulan</span>
                    </div>
                    <div className="text-[10px] text-green-500 font-bold mt-1">Rp 869rb ditagih tahunan</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 266 menit audio ≈ 266 video
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-gray-400 text-xs">
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
              <button className="w-full border border-surface2 hover:border-terracotta text-white font-bold py-3 text-sm rounded-xl transition-all bg-transparent cursor-pointer">
                Pilih Paket
              </button>
            </div>
            {/* Bisnis */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2">Bisnis</h3>
              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <div className="text-2xl font-black">
                    Rp 249rb <span className="text-xs font-medium text-gray-500">/bulan</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-gray-500 line-through">Rp 249rb</div>
                    <div className="text-2xl font-black">
                      Rp 182rb <span className="text-xs font-medium text-gray-500">/bulan</span>
                    </div>
                    <div className="text-[10px] text-green-500 font-bold mt-1">Rp 2.184rb ditagih tahunan</div>
                  </div>
                )}
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 1000 menit audio ≈ 1000 video
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-gray-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  1.500.000 Kredit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Akses Studio Voice
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" /> WA
                  Khusus Tim
                </li>
              </ul>
              <button className="w-full border border-surface2 hover:border-terracotta text-white font-bold py-3 text-sm rounded-xl transition-all bg-transparent cursor-pointer">
                Pilih Paket
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Pertanyaan Populer</h2>
            <p className="text-text-muted">
              Segala hal yang perlu Anda ketahui tentang Shinerva.id
            </p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-surface border border-surface2 rounded-2xl p-6 hover:border-terracotta/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                  <span className="text-terracotta">Q:</span> {faq.question}
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
            <h2 className="text-4xl font-black mb-6">Butuh Bantuan Lebih?</h2>
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
                href="mailto:support@shinerva.id"
                className="bg-surface2 hover:bg-gray-700 text-white px-10 py-4 rounded-2xl font-black transition-all border border-gray-700 flex items-center gap-3"
              >
                Email Support
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-surface2 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <ShinervaLogo className="w-12 h-12" />
                  <span className="font-black text-3xl tracking-tight text-text">
                    Shinerva<span className="text-terracotta">.id</span>
                  </span>
                </div>
                <p className="text-gray-400 max-w-sm">
                  Solusi AI Text-to-Speech khusus Bahasa Indonesia dengan
                  kualitas manusiawi tersertifikasi untuk berbagai kebutuhan
                  konten.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6">Produk</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li>
                    <a
                      href="#studio"
                      className="hover:text-terracotta transition-colors"
                    >
                      Studio
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
                <h4 className="font-bold mb-6">Follow Us</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
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
                    <div className="flex justify-between items-center pt-10 border-t border-surface2 text-text-muted text-xs">
              <p>© 2024 Shinerva Text To Speech. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
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

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAuthOpen(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl mx-4">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <ShinervaLogo className="w-16 h-16 text-terracotta mx-auto mb-4" />
              <h2 className="text-2xl font-black">
                {authMode === "login" ? "Masuk ke SHINERVA" : authMode === "whatsapp" ? "Masuk dengan WhatsApp" : "Daftar Akun Baru"}
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                {authMode === "login" || authMode === "whatsapp"
                  ? "Selamat datang kembali!"
                  : "Daftar sekarang dan dapatkan bonus 5.000 karakter gratis."}
              </p>
            </div>

            <form onSubmit={submitAuth} className="space-y-4">
              {authMode === "whatsapp" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={otpSent}
                      value={authData.whatsapp}
                      onChange={(e) =>
                        setAuthData({ ...authData, whatsapp: e.target.value })
                      }
                      className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                      placeholder="08..."
                    />
                  </div>
                  {otpSent && (
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        Kode OTP
                      </label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta tracking-widest text-center text-xl"
                        placeholder="••••"
                        maxLength={4}
                      />
                    </div>
                  )}
                </>
              )}
              {authMode !== "whatsapp" && (
                <>
                  {authMode === "signup" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          required
                          value={authData.name}
                          onChange={(e) =>
                            setAuthData({ ...authData, name: e.target.value })
                          }
                          className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                          placeholder="John Doe"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={authData.email}
                      onChange={(e) =>
                        setAuthData({ ...authData, email: e.target.value })
                      }
                      className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                      placeholder="anda@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authData.password}
                      onChange={(e) =>
                        setAuthData({ ...authData, password: e.target.value })
                      }
                      className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                      placeholder="••••••••"
                    />
                  </div>
                  {authMode === "signup" && (
                    <>
                      <div className="pt-2 border-t border-surface2 mt-4">
                        <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-2">
                          Nomor WhatsApp{" "}
                          <span className="text-xs bg-surface2 px-2 py-0.5 rounded text-gray-500">
                            Opsional
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Untuk tips konten & promo eksklusif. Kami tidak akan spam.
                        </p>
                        <input
                          type="tel"
                          value={authData.whatsapp}
                          onChange={(e) =>
                            setAuthData({ ...authData, whatsapp: e.target.value })
                          }
                          className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
                          placeholder="08..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-2">
                          Kode Referral{" "}
                          <span className="text-xs bg-surface2 px-2 py-0.5 rounded text-gray-500">
                            Opsional
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Punya kode undangan teman?
                        </p>
                        <input
                          type="text"
                          value={authData.refCode}
                          onChange={(e) =>
                            setAuthData({
                              ...authData,
                              refCode: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta uppercase"
                          placeholder="KODE"
                        />
                      </div>
                      <div className="bg-terracotta/10 border border-terracotta/20 rounded-xl p-3 flex gap-3 mt-4">
                        <Gift className="w-5 h-5 text-terracotta flex-shrink-0" />
                        <p className="text-xs text-terracotta font-medium">
                          Selamat datang! Kamu dapat 5.000 karakter gratis untuk
                          memulai (~3 menit audio).
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-terracotta hover:bg-trdark text-white py-3 my-2 rounded-xl font-bold transition-colors border-none cursor-pointer flex justify-center items-center"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : authMode === "login" ? (
                  "Masuk"
                ) : authMode === "whatsapp" ? (
                  otpSent ? "Verifikasi OTP" : "Kirim OTP"
                ) : (
                  "Daftar Gratis"
                )}
              </button>

              <div className="flex flex-col gap-2 mt-4">
                {authMode !== "whatsapp" && (
                  <button
                    type="button"
                    onClick={() => switchAuthMode("whatsapp")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 my-2 rounded-xl font-bold transition-colors border-none cursor-pointer flex justify-center items-center"
                  >
                    Masuk dengan WhatsApp OTP
                  </button>
                )}
              </div>

              <div className="text-center text-sm text-gray-400 mt-4">
                <span>
                  {authMode === "login" || authMode === "whatsapp"
                    ? "Belum punya akun? "
                    : "Sudah punya akun? "}
                </span>
                <span
                  onClick={() =>
                    switchAuthMode(authMode === "signup" ? "login" : "signup")
                  }
                  className="text-terracotta hover:text-white font-bold cursor-pointer"
                >
                  {authMode === "login" || authMode === "whatsapp" ? "Daftar sekarang" : "Masuk dengan Email"}
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Bonus Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSocialModal(false)}
          ></div>
          <div className="bg-surface border border-surface2 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl mx-4">
            <button
              onClick={() => setShowSocialModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded bg-terracotta/20 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-terracotta" />
              </div>
              <h2 className="text-2xl font-black">
                Klaim Extra 30.000 Kredit!
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Dapatkan ~20 menit audio tambahan gratis! Bagikan audio buatanmu
                di TikTok atau Instagram Reels, tag @shinerva.id, dan paste linknya
                di bawah.
              </p>
            </div>
            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Link Postingan
                </label>
                <input
                  type="url"
                  required
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta outline-none"
                  placeholder="https://tiktok.com/@kamu/video/..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-terracotta text-white py-3 my-2 rounded-xl font-bold cursor-pointer border-none flex justify-center items-center"
              >
                Submit Link
              </button>
            </form>
          </div>
        </div>
      )}

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
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 text-terracotta mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white">Panduan Pengucapan</h2>
              <p className="text-gray-400 text-sm mt-2">
                Atur cara AI menyebutkan kata-kata tertentu (misal: "Shinerva" dibaca "shi ner va").
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Kata Asli</label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none"
                    placeholder="Contoh: AI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Cara Baca</label>
                  <input
                    type="text"
                    value={newPronunciation}
                    onChange={(e) => setNewPronunciation(e.target.value)}
                    className="w-full bg-dark text-gray-100 rounded-xl px-4 py-3 border border-surface2 focus:border-terracotta focus:outline-none"
                    placeholder="Contoh: ey ai"
                  />
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
                <Plus className="w-4 h-4" /> Tambah Aturan
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
                      <button
                        onClick={() => handleUpdatePronunciation(word, null)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2 cursor-pointer bg-transparent border-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        <th className="py-3 font-bold">Karakter</th>
                        <th className="py-3 font-bold">Suara</th>
                        <th className="py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface2/50">
                      {history.map((item) => (
                        <tr key={item.id} className="text-sm">
                          <td className="py-4">
                            <div className="text-text font-medium">
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
                            <span className="text-text font-bold">
                              {item.credits_used.toLocaleString("id-ID")}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="text-text-muted text-xs">
                              {item.voice.split("-").slice(-2).join("-")}
                            </div>
                            {item.is_teaser && (
                              <span className="text-[10px] bg-terracotta/20 text-terracotta px-1.5 py-0.5 rounded">
                                Preview
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-green-500 font-bold">
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

                  <div className="pt-6 border-t border-surface2">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                       <Mail className="w-4 h-4 text-terracotta" /> Test Email Notifications
                    </h3>
                    <div className="bg-dark p-4 rounded-xl border border-surface2">
                      <p className="text-[10px] text-gray-500 mb-4">
                        Gunakan fitur ini untuk memverifikasi pengaturan SMTP Anda. Pastikan variabel lingkungan (SMTP_USER, SMTP_PASS, dll) sudah diatur di server.
                      </p>
                      <div className="flex gap-2">
                        <input
                           type="email"
                           placeholder="email@tujuan.com"
                           value={testEmail}
                           onChange={(e) => setTestEmail(e.target.value)}
                           className="flex-1 bg-surface2 text-white border border-surface2 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={sendTestEmail}
                          disabled={testEmailLoading}
                          className="bg-terracotta hover:bg-trdark text-white px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-none cursor-pointer"
                        >
                          {testEmailLoading ? "Mengirim..." : "Kirim Tes"}
                        </button>
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
