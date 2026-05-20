import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';

const VoiceCard = ({ name, type, voiceType, desc }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-bg-card p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-medium text-text-primary">{name}</h3>
          <p className="text-sm text-text-secondary">{type} · {voiceType}</p>
        </div>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-accent text-bg-primary flex items-center justify-center hover:bg-accent-light transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>
      </div>
      
      <p className="text-text-secondary mb-6">{desc}</p>
      
      {/* Lightweight Waveform */}
      <div className="h-8 flex items-center gap-1">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-accent h-full animate-pulse' : 'bg-bg-secondary h-1'}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );
};

const AudioDemo = () => {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <h2 className="text-4xl font-display text-center text-text-primary mb-12">
                Dengarkan kualitas Shinerva
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
                <VoiceCard name="Aura" type="Warm" voiceType="Storytelling" desc="Voice sample description here." />
                <VoiceCard name="Pulse" type="Energetic" voiceType="Ads" desc="Voice sample description here." />
                <VoiceCard name="Flow" type="Calm" voiceType="Learning" desc="Voice sample description here." />
            </div>
        </section>
    );
};

export default AudioDemo;
