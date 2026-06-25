import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Check } from "lucide-react";
import { useStudio } from "../../context/StudioContext";

const voices = [
  {
    id: "aryo",
    voiceId: "ARYO",
    name: "Aryo",
    category: "Edukasi & Tutorial",
    icon: "🎓",
    description: "Suara formal, jelas, dan ramah untuk video edukasi, tutorial, dan training.",
    script: "Siklus air, atau siklus hidrologi, adalah sirkulasi air yang tidak pernah berhenti dari atmosfer ke bumi dan kembali to atmosfer."
  },
  {
    id: "sekar",
    voiceId: "SEKAR",
    name: "Sekar",
    category: "Lifestyle & Vlog",
    icon: "🤳",
    description: "Suara hangat dan santai untuk konten lifestyle, review, dan personal branding.",
    script: "A Day in My Life as a Content Creator! Hari ini produktif banget, mulai dari shooting konten bareng tim, sampai mampir ke cafe baru yang lagi viral. Keren banget tempatnya!"
  },
  {
    id: "kartika",
    voiceId: "KARTIKA",
    name: "Kartika",
    category: "Berita & Pengumuman",
    icon: "📢",
    description: "Suara tegas dan profesional untuk berita, informasi, dan pengumuman.",
    script: "Selamat datang di berita harian Shinerva, sumber terpercaya Anda."
  },
  {
    id: "ratih",
    voiceId: "RATIH",
    name: "Ratih",
    category: "Storytelling & Novel",
    icon: "📖",
    description: "Suara tenang dan dramatis untuk cerita, audiobook, dan narasi panjang.",
    script: "Di bawah langit senja itu, kita terdiam... dan hanya angin yang berbisik."
  },
  {
    id: "rendra",
    voiceId: "RENDRA",
    name: "Rendra",
    category: "Podcast & Diskusi",
    icon: "🎙️",
    description: "Suara natural dan mengalir untuk podcast, wawancara, dan diskusi.",
    script: "Halo semuanya, selamat datang di podcast santai kita hari ini."
  },
  {
    id: "bambang",
    voiceId: "BAMBANG",
    name: "Bambang",
    category: "Cinematic & Narasi",
    icon: "🎬",
    description: "Suara dalam dan epik untuk dokumenter, trailer, dan konten sinematik.",
    script: "Sejarah menceritakan bahwa Nusantara adalah negeri yang kaya akan rempah dan budaya."
  }
];

const LiveAudioDemo = ({ generateSample }) => {
  const { voice: activeVoice, setVoice } = useStudio();
  const [playingId, setPlayingId] = useState(null);
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

    // Stop currently playing
    if (playingId && playingId !== id) {
      audioRefs.current[playingId]?.pause();
    }

    setTimeout(() => {
      const audio = audioRefs.current[id];
      if (!audio) return;
      audio.play().catch(e => console.warn(`Error playing ${id}:`, e));
      setPlayingId(id);
    }, 50);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voices.map((voice) => {
          const isActive = voice.voiceId === activeVoice;
          const isPlaying = playingId === voice.id;

          return (
            <div 
              key={voice.id} 
              className={`relative bg-surface/50 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:border-terracotta/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-surface2/60 bg-surface/30`}
            >
              {isActive && (
                <div className="absolute -top-2.5 -right-2.5 bg-terracotta text-text text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-terracotta/20 flex items-center gap-1.5 transition-all">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  Aktif
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {voice.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-text truncate group-hover:text-terracotta transition-colors duration-300">
                        {voice.name}
                      </h3>
                      <span className="text-[10px] font-bold text-text-muted/80 tracking-wider uppercase block">
                        {voice.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-text-muted text-xs font-medium leading-relaxed my-3 min-h-[36px]">
                  {voice.description}
                </p>
              </div>

              <audio
                ref={(el) => (audioRefs.current[voice.id] = el)}
                src={loadedUrls[voice.id]}
                onEnded={() => setPlayingId(null)}
                onError={() => {
                  if (loadedUrls[voice.id]) {
                    setPlayingId(null);
                  }
                }}
              />

              <div className="space-y-3 mt-4">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => togglePlay(voice.id)}
                    disabled={loadingIds[voice.id]}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border select-none bg-dark/50 border-surface2 text-text-muted hover:text-text hover:border-surface2/90"
                  >
                    {loadingIds[voice.id] ? (
                      <div className="w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    )}
                    <span>{isPlaying ? "Pause" : "Dengarkan"}</span>
                  </button>

                  {isActive ? (
                    <button 
                      type="button" 
                      className="flex-1 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border bg-terracotta text-text border-terracotta shadow-lg shadow-terracotta/15"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
                      <span>Aktif</span>
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setVoice(voice.voiceId)}
                      className="flex-1 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border bg-surface2 hover:bg-surface3 border-surface2 text-text hover:border-terracotta/40"
                    >
                      <span>Gunakan Preset Ini</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveAudioDemo;
