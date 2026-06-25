
import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  TrendingUp, 
  Ghost, 
  Mic2, 
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
  Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PLAYGROUND_VOICES } from "../lib/voicePlaygroundData";

// Voice Playground with restored Aryo, Sekar, Kartika, Ratih, Rendra, Bambang presets
const VoicePlayground = ({ onUpgrade, previewAudio, language = "ID", setLanguage }) => {
  const [activeTierIdx, setActiveTierIdx] = useState(0); 
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [progress, setProgress] = useState({});
  
  const audioRefs = useRef({});

  const t = (key) => {
    const translations = {
      ID: {
        title: "Voice Playground",
        subtitle: "Eksplorasi kualitas suara AI terbaik kami dalam berbagai bahasa. Dengar perbedaannya dan pilih karakter yang paling cocok.",
        upgrade: "Upgrade Sekarang",
        tech: "Pilih Teknologi",
        variants: "Varian Suara",

        quality_title_cloning: "AI Voice Cloning (Eksperimental)",
        quality_desc_cloning: "Cukup rekam 30 detik suara Anda, dan biarkan AI kami mengkloningnya dengan hasil suara natural. Sangat cocok untuk konsistensi brand.",
        quality_cta: "Segera hadir untuk semua kreator.",
        join: "Bergabung dengan",
        creators: "2.5k+ Kreator",
        upgraded: "yang sudah upgrade.",
        pricing: "Lihat Paket Harga",

        activate_cloning: "Daftar Tunggu Voice Cloning",
        coming_soon: "Segera Hadir"
      },
      EN: {
        title: "Voice Playground",
        subtitle: "Explore our best AI voices across multiple languages. Hear the difference and choose your perfect character.",
        upgrade: "Upgrade Now",
        tech: "Select Technology",
        variants: "Voice Variants",

        quality_title_cloning: "AI Voice Cloning (Experimental)",
        quality_desc_cloning: "Just record 30 seconds of your voice, and let our AI clone it with natural results. Perfect for brand consistency.",
        quality_cta: "Coming soon for all creators.",
        join: "Join over",
        creators: "2.5k+ Creators",
        upgraded: "who have already upgraded.",
        pricing: "View Pricing Plans",

        activate_cloning: "Voice Cloning Waitlist",
        coming_soon: "Coming Soon"
      }
    };
    return translations[language][key] || translations['ID'][key];
  };

  const currentVoices = PLAYGROUND_VOICES[language] || PLAYGROUND_VOICES["ID"];
  const activeTier = currentVoices[activeTierIdx] || currentVoices[0];
  const activeCategory = activeTier.categories[activeCategoryIdx] || activeTier.categories[0];

  // Reset indices when language changes to avoid out of bounds
  useEffect(() => {
    setActiveTierIdx(0);
    setActiveCategoryIdx(0);
    if (currentlyPlaying) {
      audioRefs.current[currentlyPlaying]?.pause();
      setCurrentlyPlaying(null);
    }
  }, [language]);

  const togglePlay = (sample) => {
    if (currentlyPlaying === sample.id) {
      audioRefs.current[sample.id]?.pause();
      setCurrentlyPlaying(null);
      return;
    }

    // Stop others
    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause();
      audioRefs.current[currentlyPlaying].currentTime = 0;
    }

    const audio = audioRefs.current[sample.id];
    if (!audio) return;

    // Play the static sample URL directly — no API call, no auth needed
    audio.play()
      .then(() => setCurrentlyPlaying(sample.id))
      .catch(e => console.warn(`Audio playback failed for ${sample.id}:`, e));
  };

  const handleTimeUpdate = (id) => {
    const audio = audioRefs.current[id];
    if (audio) {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(prev => ({ ...prev, [id]: percent }));
    }
  };

  const handleEnded = (id) => {
    setCurrentlyPlaying(null);
    setProgress(prev => ({ ...prev, [id]: 0 }));
  };

  const getTierIcon = (tier) => {
    switch (tier.toLowerCase()) {
      case 'basic': return <Mic2 className="w-4 h-4" />;

      case 'cloning': return <ShieldCheck className="w-4 h-4" />;
      default: return <Volume2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-dark/50 backdrop-blur-xl rounded-3xl border border-surface2 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-surface2 bg-gradient-to-br from-surface to-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div>
              <h2 className="text-3xl font-black text-text tracking-tighter flex items-center gap-3">
                {t('title')} <Sparkles className="text-terracotta w-6 h-6 animate-pulse" />
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-text-muted text-sm font-medium leading-relaxed">
                  {t('subtitle')}
                </p>
                {setLanguage && (
                  <div className="flex bg-dark/40 p-1 rounded-xl border border-surface2 ml-auto">
                    {[
                      { code: "ID", flag: "🇮🇩", name: "ID" },
                      { code: "EN", flag: "🇺🇸", name: "EN" }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest transition-all border-none cursor-pointer ${
                          language === lang.code 
                          ? "bg-terracotta text-white shadow-lg shadow-terracotta/20" 
                          : "text-text-muted hover:text-text"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
             onClick={onUpgrade}
             className="bg-white text-black px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {t('upgrade')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Tier Sidebar */}
        <div className="w-full lg:w-72 bg-surface/30 border-r border-surface2 p-6 space-y-3">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 px-2">{t('tech')}</p>
          {currentVoices.map((tier, idx) => (
            <button
              key={tier.tier}
              onClick={() => {
                setActiveTierIdx(idx);
                setActiveCategoryIdx(0);
                if (currentlyPlaying) {
                   audioRefs.current[currentlyPlaying]?.pause();
                   setCurrentlyPlaying(null);
                }
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeTierIdx === idx 
                ? 'bg-surface2 border-terracotta border ring-1 ring-terracotta/50' 
                : 'bg-transparent border border-transparent hover:bg-surface2/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${activeTierIdx === idx ? 'bg-terracotta text-white' : 'bg-surface2 text-text-muted group-hover:text-text'}`}>
                  {getTierIcon(tier.tier)}
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${activeTierIdx === idx ? 'text-text' : 'text-text-muted'}`}>{tier.tier}</p>
                  <p className="text-[10px] text-text-muted font-medium">{(tier.tier === 'Cloning') ? t('coming_soon') : `${tier.voices.length} ${t('variants')}`}</p>
                </div>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                tier.badge === 'ULTRA' ? 'bg-terracotta/20 text-terracotta' :
                tier.badge === 'EXOTIC' ? 'bg-emerald-500/20 text-emerald-400' :
                tier.badge === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
                tier.badge === 'PLUS' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-text-muted'
              }`}>
                {tier.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-dark/20 relative">
          {(activeTier.tier === 'Cloning') && (
            <div className="absolute inset-0 z-10 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <div className="w-20 h-20 bg-terracotta/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-terracotta/30">
                   <ShieldCheck className="w-10 h-10 text-terracotta animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-text mb-4">
                   t('quality_title_cloning')}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed mb-8">
                   t('quality_desc_cloning')}
                </p>
                <button 
                  onClick={onUpgrade}
                  className="bg-terracotta text-white px-8 py-3 rounded-xl font-black text-sm"
                >
                   t('activate_cloning')}
                </button>
              </div>
            </div>
          )}
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-3 mb-8">
            {activeTier.categories.map((cat, idx) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategoryIdx(idx)}
                className={`relative px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border overflow-hidden group ${
                  activeCategoryIdx === idx 
                  ? 'text-text border-terracotta shadow-[0_8px_25px_rgba(226,114,91,0.4)]' 
                  : 'text-text-muted border-surface2/60 hover:text-text hover:border-terracotta/50 bg-surface2/20 backdrop-blur-sm'
                }`}
              >
                {activeCategoryIdx === idx && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-terracotta z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {cat.name}
                  {activeCategoryIdx === idx && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                </span>
              </button>
            ))}
          </div>

          <motion.div 
            key={`${activeTier.tier}-${activeCategory.slug}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-surface2/20 border-l-2 border-terracotta rounded-r-xl"
          >
            <p className="text-text-muted text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-terracotta" /> {activeCategory.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatePresence mode="wait">
              {activeCategory.samples.map((sample) => (
                <motion.div
                  key={sample.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface/40 border border-surface2 rounded-3xl p-6 hover:border-surface2 group transition-all relative overflow-hidden"
                >
                  {/* Audio Element (Hidden) */}
                  <audio
                    key={loadedUrls[sample.id] || sample.url}
                    ref={el => audioRefs.current[sample.id] = el}
                    src={loadedUrls[sample.id] || sample.url}
                    onTimeUpdate={() => handleTimeUpdate(sample.id)}
                    onEnded={() => handleEnded(sample.id)}
                    onError={(e) => {
                      console.error(`[Playground Audio] Error for ${sample.id}:`, e.target.error);
                    }}
                    className="hidden"
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-terracotta">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-text font-black text-sm">{sample.title}</h4>
                          {activeCategory.slug === 'mystery' && (
                            <span className="flex items-center gap-1 text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-black uppercase tracking-tighter">
                              <Ghost className="w-2 h-2" /> Dramatic
                            </span>
                          )}
                          {activeCategory.slug === 'conversational' && (
                            <span className="flex items-center gap-1 text-[8px] bg-terracotta/20 text-terracotta px-1.5 py-0.5 rounded border border-terracotta/30 font-black uppercase tracking-tighter">
                              <Sparkles className="w-2 h-2" /> Human-Like
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Voice: {sample.voiceId.split('-').pop()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePlay(sample)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        currentlyPlaying === sample.id 
                        ? 'bg-terracotta text-white scale-110' 
                        : 'bg-white text-black hover:scale-105 active:scale-95'
                      }`}
                    >
                      {currentlyPlaying === sample.id ? (
                        <Pause className="fill-current w-5 h-5" />
                      ) : (
                        <Play className="fill-current w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="bg-dark/60 p-4 rounded-xl border border-surface2/50 min-h-[100px]">
                      <p className="text-gray-300 text-xs leading-relaxed italic">
                        "{sample.script}"
                      </p>
                    </div>
                  </div>

                  {/* Waveform Visualization */}
                  <div className="h-6 flex items-center justify-between gap-1 px-1">
                    {[...Array(24)].map((_, i) => {
                      const barTime = (i / 24) * 100;
                      const progressVal = progress[sample.id] || 0;
                      const diff = Math.abs(barTime - progressVal);
                      const height = currentlyPlaying === sample.id ? Math.max(4, 24 - diff * 0.8) : 4;
                      
                      return (
                        <motion.div
                          key={i}
                          animate={{ height }}
                          transition={{ duration: 0.1, ease: "linear" }}
                          className={`w-full rounded-full ${currentlyPlaying === sample.id ? 'bg-terracotta' : 'bg-surface2'}`}
                        />
                      );
                    })}
                  </div>

                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-surface2">
                    <div 
                      className="h-full bg-terracotta transition-all duration-100 ease-linear" 
                      style={{ width: `${progress[sample.id] || 0}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>


        </div>
      </div>

      {/* Conversion Banner */}
      <div className="bg-surface2/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-surface2">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-surface2 bg-surface flex items-center justify-center text-[10px] font-black text-text-muted">
                AI
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-gray-300">
            {t('join')} <span className="text-text">{t('creators')}</span> {t('upgraded')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onUpgrade}
            className="text-text hover:text-terracotta text-sm font-bold transition-all"
          >
            {t('pricing')}
          </button>
          <button 
            onClick={onUpgrade}
            className="bg-terracotta hover:bg-terracotta/80 text-text px-8 py-4 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(231,76,60,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            {t('upgrade')} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayground;
