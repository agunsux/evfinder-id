
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

const VoicePlayground = ({ onUpgrade }) => {
  const [activeTierIdx, setActiveTierIdx] = useState(3); // Start with Studio (Flagship)
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null); // id of playing sample
  const [progress, setProgress] = useState({}); // { id: progress_percent }
  
  const audioRefs = useRef({});

  const activeTier = PLAYGROUND_VOICES[activeTierIdx];
  const activeCategory = activeTier.categories[activeCategoryIdx] || activeTier.categories[0];

  const togglePlay = (sample) => {
    const audio = audioRefs.current[sample.id];
    if (!audio) return;

    if (currentlyPlaying === sample.id) {
      audio.pause();
      setCurrentlyPlaying(null);
    } else {
      // Stop others
      if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
        audioRefs.current[currentlyPlaying].pause();
        audioRefs.current[currentlyPlaying].currentTime = 0;
      }
      
      audio.play().catch(e => console.error("Audio playback failed", e));
      setCurrentlyPlaying(sample.id);
    }
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
      case 'standard': return <Mic2 className="w-4 h-4" />;
      case 'wavenet': return <Ghost className="w-4 h-4" />;
      case 'neural2': return <TrendingUp className="w-4 h-4" />;
      case 'studio': return <Sparkles className="w-4 h-4" />;
      default: return <Volume2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-dark/50 backdrop-blur-xl rounded-3xl border border-surface2 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-surface2 bg-gradient-to-br from-surface to-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              Voice Playground <Sparkles className="text-terracotta w-6 h-6 animate-pulse" />
            </h2>
            <p className="text-gray-400 mt-2 text-sm max-w-xl font-medium leading-relaxed">
              Eksplorasi kualitas suara AI terbaik kami. Dengar perbedaannya dan pilih karakter suara yang paling cocok untuk konten viral Anda.
            </p>
          </div>
          <button 
             onClick={onUpgrade}
             className="bg-white text-black px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Upgrade Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Tier Sidebar */}
        <div className="w-full lg:w-72 bg-surface/30 border-r border-surface2 p-6 space-y-3">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Pilih Teknologi</p>
          {PLAYGROUND_VOICES.map((tier, idx) => (
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
                <div className={`p-2 rounded-xl ${activeTierIdx === idx ? 'bg-terracotta text-white' : 'bg-surface2 text-gray-400 group-hover:text-white'}`}>
                  {getTierIcon(tier.tier)}
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${activeTierIdx === idx ? 'text-white' : 'text-gray-400'}`}>{tier.tier}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{tier.voices.length} Varian Suara</p>
                </div>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                tier.badge === 'ULTRA' ? 'bg-terracotta/20 text-terracotta' :
                tier.badge === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
                tier.badge === 'PLUS' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {tier.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-dark/20">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2 mb-8">
            {activeTier.categories.map((cat, idx) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategoryIdx(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  activeCategoryIdx === idx 
                  ? 'bg-terracotta text-white border-terracotta shadow-[0_4px_12px_rgba(231,76,60,0.3)]' 
                  : 'bg-surface2/50 text-gray-400 border-surface2 hover:border-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

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
                    ref={el => audioRefs.current[sample.id] = el}
                    src={sample.url}
                    onTimeUpdate={() => handleTimeUpdate(sample.id)}
                    onEnded={() => handleEnded(sample.id)}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-terracotta">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-black text-sm">{sample.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Voice: {sample.voiceId.split('-').pop()}</p>
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
                      {currentlyPlaying === sample.id ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="bg-dark/60 p-4 rounded-xl border border-surface2/50 min-h-[100px]">
                      <p className="text-gray-300 text-xs leading-relaxed italic">
                        "{sample.script}"
                      </p>
                    </div>
                  </div>

                  {/* Waveform Visualization (Simplified) */}
                  <div className="h-6 flex items-center justify-between gap-1 px-1">
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={currentlyPlaying === sample.id ? { 
                          height: [8, Math.random() * 20 + 4, 8] 
                        } : { height: 4 }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                        className={`w-full rounded-full ${currentlyPlaying === sample.id ? 'bg-terracotta' : 'bg-surface2'}`}
                      />
                    ))}
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

          {/* Premium Infographic */}
          {activeTier.tier === 'Studio' && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-terracotta/20 to-transparent border border-terracotta/30"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="p-4 bg-terracotta/20 rounded-2xl">
                  <Sparkles className="w-12 h-12 text-terracotta" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">Kualitas Flagship yang Tak Terkalahkan</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                    Studio Voice menggunakan pemrosesan audio tingkat lanjut untuk menghasilkan nuansa emosi, slang perkotaan, dan dinamika bicara yang tidak bisa dibedakan dengan manusia asli. <strong>Sangat cocok untuk konten viral.</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Conversion Banner */}
      <div className="bg-surface2/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-surface2">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-surface2 bg-surface flex items-center justify-center text-[10px] font-black text-gray-400">
                AI
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-gray-300">
            Bergabung dengan <span className="text-white">2.5k+ Kreator</span> yang sudah upgrade.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onUpgrade}
            className="text-white hover:text-terracotta text-sm font-bold transition-all"
          >
            Lihat Paket Harga
          </button>
          <button 
            onClick={onUpgrade}
            className="bg-terracotta hover:bg-terracotta/80 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(231,76,60,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            Aktifkan Studio Premium &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayground;
