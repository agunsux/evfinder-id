import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";

const voices = [
  {
    id: "sambas",
    voiceId: "SAMBAS",
    name: "Sambas",
    description: "Informative · Calm · News",
    voice: "Male",
    script: "Siklus air, atau siklus hidrologi, adalah sirkulasi air yang tidak pernah berhenti dari atmosfer ke bumi dan kembali ke atmosfer."
  },
  {
    id: "mega",
    voiceId: "MEGA",
    name: "Mega",
    description: "Professional · Clear · Education",
    voice: "Female",
    script: "Selamat datang di berita harian Shinerva, sumber terpercaya Anda."
  },
  {
    id: "susi",
    voiceId: "SUSI",
    name: "Susi",
    description: "Energetic · Modern · Social",
    voice: "Female",
    script: "Hey guys! Jangan lupa like dan subscribe untuk konten terbaru!"
  },
  {
    id: "ratna",
    voiceId: "RATNA",
    name: "Ratna",
    description: "Soft · Emotional · Story",
    voice: "Female",
    script: "Di bawah langit senja itu, kita terdiam... dan hanya angin yang berbisik."
  },
  {
    id: "satria",
    voiceId: "SATRIA",
    name: "Satria",
    description: "Deep · Authoritative · Cinematic",
    voice: "Male",
    script: "Sejarah menceritakan bahwa Nusantara adalah negeri yang kaya akan rempah dan budaya."
  },
  {
    id: "kania",
    voiceId: "KANIA",
    name: "Kania",
    description: "Friendly · Casual · Podcast",
    voice: "Female",
    script: "Halo semuanya, selamat datang di podcast santai kita hari ini."
  }
];

const Waveform = ({ isPlaying }) => {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: isPlaying ? [10, 30, 10] : 10 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut"
          }}
          className="w-1 bg-amber-400 rounded-full"
        />
      ))}
    </div>
  );
};

const LiveAudioDemo = ({ generateSample }) => {
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  
  const audioRefs = useRef({});

  const togglePlay = async (id) => {
    const voice = voices.find(v => v.id === id);
    if (!voice) return;

    if (playingId === id) {
      const audio = audioRefs.current[id];
      if (audio) {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }

    let audioUrl = loadedUrls[id];

    if (!audioUrl && generateSample) {
      setLoadingIds(prev => ({ ...prev, [id]: true }));
      try {
        const newUrl = await generateSample(voice.script, voice.voiceId);
        if (newUrl) {
          audioUrl = newUrl;
          setLoadedUrls(prev => ({ ...prev, [id]: newUrl }));
        }
      } catch (err) {
        console.error("Failed to load sample", err);
      } finally {
        setLoadingIds(prev => ({ ...prev, [id]: false }));
      }
    }

    if (!audioUrl) return;

    setTimeout(() => {
        const audio = audioRefs.current[id];
        if (!audio) return;
        if (playingId && playingId !== id) {
          audioRefs.current[playingId]?.pause();
        }
        audio.play().catch(e => console.warn(`Error playing ${id}:`, e));
        setPlayingId(id);
    }, 50);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playingId) {
        const audio = audioRefs.current[playingId];
        if (audio && !audio.paused) {
            setProgress((audio.currentTime / audio.duration) * 100);
            if (audio.ended) {
                setPlayingId(null);
                setProgress(0);
            }
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playingId]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voices.map((voice) => (
          <div key={voice.id} className={`p-6 rounded-3xl border transition-all ${playingId === voice.id ? 'bg-zinc-800 border-amber-500' : 'bg-zinc-900 border-zinc-700'}`}>
            <h3 className="text-xl font-black text-white mb-1">{voice.name}</h3>
            <p className="text-zinc-400 text-sm mb-4">{voice.description}</p>
            <div className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold mb-4">DEMO GRATIS</div>
            
            <audio
              ref={(el) => (audioRefs.current[voice.id] = el)}
              src={loadedUrls[voice.id]}
              onEnded={() => setPlayingId(null)}
              onError={(e) => {
                if (loadedUrls[voice.id]) {
                  console.warn(`Audio ${voice.id} source not found or inaccessible. Skipping.`);
                  setPlayingId(null);
                }
              }}
            />
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => togglePlay(voice.id)}
                disabled={loadingIds[voice.id]}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-black transition ${
                  loadingIds[voice.id] ? 'bg-amber-500/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {loadingIds[voice.id] ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : playingId === voice.id ? (
                  <Pause size={20} fill="black" />
                ) : (
                  <Play size={20} fill="black" />
                )}
              </button>
              
              <Waveform isPlaying={playingId === voice.id} />
            </div>

            <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                    className="bg-amber-500 h-full transition-all duration-100 ease-linear"
                    style={{ width: playingId === voice.id ? `${progress}%` : '0%' }}
                />
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveAudioDemo;
