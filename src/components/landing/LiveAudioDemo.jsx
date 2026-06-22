import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";

const voices = [
  {
    id: "sambas",
    name: "Sambas",
    description: "Informative · Calm · News",
    voice: "Male",
    script: "Siklus air, atau siklus hidrologi, adalah sirkulasi air yang tidak pernah berhenti dari atmosfer ke bumi dan kembali ke atmosfer.",
    audioUrl: "/samples/sambas.mp3"
  },
  {
    id: "mega",
    name: "Mega",
    description: "Professional · Clear · Education",
    voice: "Female",
    script: "Selamat datang di berita harian Shinerva, sumber terpercaya Anda.",
    audioUrl: "/samples/mega.mp3"
  },
  {
    id: "susi",
    name: "Susi",
    description: "Energetic · Modern · Social",
    voice: "Female",
    script: "Hey guys! Jangan lupa like dan subscribe untuk konten terbaru!",
    audioUrl: "/samples/susi.mp3"
  },
  {
    id: "ratna",
    name: "Ratna",
    description: "Soft · Emotional · Story",
    voice: "Female",
    script: "Di bawah langit senja itu, kita terdiam... dan hanya angin yang berbisik.",
    audioUrl: "/samples/ratna.mp3"
  },
  {
    id: "satria",
    name: "Satria",
    description: "Deep · Authoritative · Cinematic",
    voice: "Male",
    script: "Sejarah menceritakan bahwa Nusantara adalah negeri yang kaya akan rempah dan budaya.",
    audioUrl: "/samples/satria.mp3"
  },
  {
    id: "kania",
    name: "Kania",
    description: "Friendly · Casual · Podcast",
    voice: "Female",
    script: "Halo semuanya, selamat datang di podcast santai kita hari ini.",
    audioUrl: "/samples/kania.mp3"
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

const LiveAudioDemo = () => {
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const audioRefs = useRef({});

  const togglePlay = (id) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (playingId) {
        audioRefs.current[playingId]?.pause();
      }
      audio.play().catch(e => console.warn(`Error playing ${id}:`, e));
      setPlayingId(id);
    }
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
              src={voice.audioUrl}
              onEnded={() => setPlayingId(null)}
              onError={(e) => {
                console.warn(`Audio ${voice.id} source not found or inaccessible. Skipping.`);
                setPlayingId(null);
              }}
            />
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => {
                  togglePlay(voice.id);
                }}
                className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 transition"
              >
                {playingId === voice.id ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
              </button>
              
              <Waveform isPlaying={playingId === voice.id} />
            </div>

            <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                    className="bg-amber-500 h-full"
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
