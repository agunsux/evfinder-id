import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";

const voices = [
  {
    id: "aura",
    name: "Aura",
    description: "Warm · Storytelling · Podcast",
    voice: "Female",
    script: "Selamat datang di Shinerva. Kami hadir untuk membuat suara Indonesia terdengar lebih manusiawi.",
    audioUrl: "/aura.mp3?v=2"
  },
  {
    id: "pulse",
    name: "Pulse",
    description: "Energetic · Confident · Ads",
    voice: "Male",
    script: "Selamat datang di Shinerva. Kami hadir untuk membuat suara Indonesia terdengar lebih manusiawi.",
    audioUrl: "/pulse.mp3?v=2"
  },
  {
    id: "flow",
    name: "Flow",
    description: "Calm · Professional · Learning",
    voice: "Female",
    script: "Selamat datang di Shinerva. Kami hadir untuk membuat suara Indonesia terdengar lebih manusiawi.",
    audioUrl: "/flow.mp3?v=2"
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
  const auraRef = useRef(null);
  const pulseRef = useRef(null);
  const flowRef = useRef(null);
  const audioRefs = { aura: auraRef, pulse: pulseRef, flow: flowRef };

  const togglePlay = (id) => {
    const audio = audioRefs[id]?.current;
    if (!audio) return;
    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (playingId) {
        audioRefs[playingId]?.current?.pause();
      }
      audio.play().catch(e => console.warn(`Error playing ${id}:`, e));
      setPlayingId(id);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playingId) {
        const audio = audioRefs[playingId]?.current;
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {voices.map((voice) => (
          <div key={voice.id} className={`p-6 rounded-3xl border transition-all ${playingId === voice.id ? 'bg-zinc-800 border-amber-500' : 'bg-zinc-900 border-zinc-700'}`}>
            <h3 className="text-xl font-black text-white mb-1">{voice.name}</h3>
            <p className="text-zinc-400 text-sm mb-4">{voice.description}</p>
            
            <audio
              ref={audioRefs[voice.id]}
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
