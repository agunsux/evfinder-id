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

const ShinervaLogo = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Concentric arcs */}
    <path d="M2 17 A 10 10 0 0 1 22 17" />
    <path d="M5 17 A 7 7 0 0 1 19 17" />
    <path d="M8 17 A 4 4 0 0 1 16 17" />
    {/* Inner ear styling resembling an abstract ear */}
    <path d="M11 16c-1 0-1-1-1-2s1-1.5 1-2.5a2 2 0 0 1 4 0c0 1-1 1.5-1 2.5s1 2 1 3a2 2 0 0 1-4 0v-.5" />
    <path d="M12.5 14c-.5 0-1-.5-1-1s.5-1 .5-2a1 1 0 0 1 2 0c0 .5-.5 1-.5 1.5" />
  </svg>
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
  const [user, setUser] = useState(null);

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

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert("Silakan tulis naskah terlebih dahulu.");
      return;
    }
    setStatus("loading");

    try {
      // Call our backend API which proxies to Google TTS
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user ? user.email : "",
        },
        body: JSON.stringify({ text, voice, speed: parseFloat(speed), pitch: parseFloat(pitch), volume: parseFloat(volume) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to synthesize speech");
      }

      if (data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        setAudioUrl(audioSrc);
        setIsTeaser(data.isTeaser || false);
        setStatus("success");
        setIsAudioVisible(true);
        setTimeout(() => setStatus("idle"), 3000);
        refreshUser();
      } else {
        throw new Error("No audio content returned");
      }
    } catch (err) {
      console.error("TTS Generation Error:", err);

      let errorMessage = "Gagal menghasilkan suara.";
      const errMsg = err.message || "";

      if (errMsg.includes("Failed to fetch")) {
        errorMessage =
          "Gagal terhubung ke server. Periksa koneksi internet Anda atau pastikan server berjalan.";
      } else if (errMsg.includes("GOOGLE_API_KEY")) {
        errorMessage =
          "Google API Key belum dikonfigurasi di server. Menggunakan suara cadangan (Browser TTS) untuk sementara.";
      } else {
        errorMessage = `Terjadi kesalahan: ${errMsg}. Menggunakan suara cadangan (Browser TTS) untuk sementara.`;
      }

      alert(errorMessage);

      // Fallback to browser TTS for demo if the primary API call fails
      fallbackTTS();
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
            alert(`OTP telah dikirim ke WhatsApp Anda (mock: ${data.mockOtp})`); // Highlight mock OTP for development
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
          setIsAuthOpen(false);
        } else {
          alert("Auth error: " + (data.message || "Unknown error"));
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
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <ShinervaLogo className="w-10 h-10 text-terracotta" />
              <span className="font-black text-2xl tracking-tight text-white hover:text-terracotta transition-colors cursor-pointer">
                Shinerva Text To Speech
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#studio"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Studio
              </a>
              <a
                href="#packs"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Content Packs
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <span className="font-bold text-terracotta">{user.email}</span>
              ) : (
                <>
                  <button
                    onClick={() => {
                      switchAuthMode("login");
                      setIsAuthOpen(true);
                    }}
                    className="hidden md:block text-gray-300 hover:text-white font-medium transition-colors border-none bg-transparent cursor-pointer"
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
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Ubah Teks Menjadi <br />
            <span className="gradient-text">Suara Manusiawi</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
            Generator suara AI paling realistis di Indonesia. Sempurna untuk
            konten TikTok, YouTube, Podcast, dan Iklan Anda tanpa harus rekaman.
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 bg-surface2 px-4 py-2 rounded-full border border-gray-700">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-gray-300">
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
                    <div className="text-gray-500 text-xs mb-1">Bulanan</div>
                    <div className="font-bold text-white">{user.monthly_chars.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-gray-500 text-xs mb-1">Bonus Signup</div>
                    <div className="font-bold text-white">{user.signup_bonus_chars.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-gray-500 text-xs mb-1">Ekstra</div>
                    <div className="font-bold text-white">{user.earned_chars.toLocaleString("id-ID")}</div>
                  </div>
                  <div className="bg-dark/50 rounded-lg p-3 border border-surface2">
                    <div className="text-gray-500 text-xs mb-1">Digunakan</div>
                    <div className="font-bold text-terracotta">{user.used_chars.toLocaleString("id-ID")}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[250px]">
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
                      className={`w-4 h-4 ${user.social_bonus_status === "none" ? "text-terracotta" : "text-gray-500"}`}
                    />{" "}
                    <span
                      className={`text-sm font-bold ${user.social_bonus_status === "none" ? "text-white" : "text-gray-400"}`}
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
                    <label className="font-bold text-gray-200">
                      Editor Naskah
                    </label>
                    <span
                      className={`text-xs font-mono ${text.length > maxChars * 0.9 ? "text-terracotta" : "text-gray-500"}`}
                    >
                      {text.length} / {maxChars}
                    </span>
                  </div>
                  <textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-64 bg-dark text-gray-100 rounded-2xl p-5 border border-surface2 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none resize-none transition-all"
                    placeholder="Ketik naskah Anda di sini..."
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Suara Pilihan
                    </label>
                    <div className="relative">
                      <select
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        className="w-full bg-dark text-gray-100 appearance-none rounded-xl py-3 pl-4 pr-10 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer font-medium"
                      >
                        <option value="id-ID-Standard-A">
                          Ratna (Standard - Wanita)
                        </option>
                        <option value="id-ID-Standard-B">
                          Bambang (Standard - Pria)
                        </option>
                        <option value="id-ID-Wavenet-A">
                          Siti (Wavenet - Wanita)
                        </option>
                        <option value="id-ID-Wavenet-B">
                          Sambas (Wavenet - Pria)
                        </option>
                        <option value="id-ID-Neural2-A">
                          Ratna (Neural2 - Wanita)
                        </option>
                        <option value="id-ID-Neural2-D">
                          Bambang (Neural2 - Pria)
                        </option>
                        <option disabled>──────────</option>
                        <option value="id-ID-Studio-A">
                          Agus (Studio Teaser - Iklan)
                        </option>
                        <option value="id-ID-Studio-D">
                          Citra (Studio Teaser - Narasi)
                        </option>
                        <option disabled>──────────</option>
                        <option value="jv-ID-Wavenet-A">
                          Slamet (Bahasa Jawa - Coming Soon)
                        </option>
                        <option value="su-ID-Wavenet-A">
                          Cecep (Bahasa Sunda - Coming Soon)
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
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
                      <label className="block text-sm font-bold text-gray-400 mb-2">
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
                      <label className="block text-sm font-bold text-gray-400 mb-2">
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
                    disabled={status === "loading" || status === "success"}
                    className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg border-none cursor-pointer 
                      ${
                        status === "success"
                          ? "bg-green-600 text-white"
                          : status === "loading"
                            ? "bg-terracotta/75 text-white cursor-not-allowed"
                            : "bg-terracotta hover:bg-trdark shadow-terracotta/20 text-white"
                      }`}
                  >
                    {status === "idle" && (
                      <>
                        <Mic className="w-5 h-5" /> Hasilkan Suara Sekarang
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
            <p className="text-gray-400 max-w-2xl mx-auto">
              Mulai gratis, upgrade saat Anda siap untuk produksi profesional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Free */}
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2">Free</h3>
              <div className="text-2xl font-black mb-6">
                Rp 0{" "}
                <span className="text-xs font-medium text-gray-500">
                  /selamanya
                </span>
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 10 menit audio ≈ 10 video
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-gray-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  10.000 Kredit
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
            <div className="bg-surface border border-surface2 p-6 rounded-3xl flex flex-col">
              <h3 className="text-lg font-bold mb-2">Starter</h3>
              <div className="text-2xl font-black mb-6">
                Rp 19rb{" "}
                <span className="text-xs font-medium text-gray-500">
                  /sekali
                </span>
              </div>
              <div className="text-xs text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg mb-6 font-medium">
                ≈ 33 menit audio ≈ 33 video
              </div>
              <ul className="space-y-4 mb-10 flex-grow text-gray-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  50.000 Kredit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Tier 1 & 2 (Neural2)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-terracotta flex-shrink-0" />{" "}
                  Aktif 30 Hari
                </li>
              </ul>
              <button className="w-full border border-surface2 hover:border-terracotta text-white font-bold py-3 text-sm rounded-xl transition-all bg-transparent cursor-pointer">
                Pilih Paket
              </button>
            </div>
            {/* Kreator */}
            <div className="bg-surface border border-terracotta p-6 rounded-3xl flex flex-col relative shadow-[0_0_30px_rgba(226,114,91,0.15)]">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-terracotta text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                Populer
              </div>
              <h3 className="text-lg font-bold mb-2">Kreator</h3>
              <div className="text-2xl font-black mb-6">
                Rp 49rb{" "}
                <span className="text-xs font-medium text-gray-500">
                  /bulan
                </span>
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
              <div className="text-2xl font-black mb-6">
                Rp 99rb{" "}
                <span className="text-xs font-medium text-gray-500">
                  /bulan
                </span>
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
              <div className="text-2xl font-black mb-6">
                Rp 249rb{" "}
                <span className="text-xs font-medium text-gray-500">
                  /bulan
                </span>
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

        {/* Footer */}
        <footer className="border-t border-surface2 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <ShinervaLogo className="w-10 h-10 text-terracotta" />
                  <span className="font-black text-2xl tracking-tight text-white">
                    Shinerva Text To Speech
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
            <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-surface2 text-gray-500 text-xs">
              <p>© 2024 Shinerva Text To Speech. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
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
                          Selamat datang! Kamu dapat 10.000 karakter gratis untuk
                          memulai (~6 menit audio).
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
    </div>
  );
}

export default App;
