import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Check, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MAX_CHARS } from '../../../constants';
import { handleApiError, checkResponse } from '../../../lib/errorUtils';

const VOICES = [
  { id: 'flow', name: 'Flow', type: 'Calm · Professional', color: 'bg-blue-500' },
  { id: 'pulse', name: 'Pulse', type: 'Energetic · Ads', color: 'bg-green-500' },
  { id: 'aura', name: 'Aura', type: 'Warm · Story', color: 'bg-purple-500' }
];

const TEMPLATES = [
  { id: 'doc', label: 'Dokumenter', voice: 'flow' },
  { id: 'pod', label: 'Podcast', voice: 'aura' },
  { id: 'ads', label: 'Promo Cepat', voice: 'pulse' },
  { id: 'edu', label: 'Narasi Formal', voice: 'flow' },
];

const GenerateTab = ({ user, refreshUser }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('aura');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [audioUrl, setAudioUrl] = useState(null);
  
  const textareaRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [text]);

  const handleTemplateClick = (template) => {
    setVoice(template.voice);
    toast.success(`Template ${template.label} diterapkan!`);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Silakan ketik sesuatu dulu.');
      return;
    }
    if (isOverLimit) {
      toast.error('Naskah terlalu panjang!');
      return;
    }

    setStatus('loading');
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const token = await user.getIdToken();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          voice,
          speed: 1.0,
          pitch: 0.0
        })
      };

      const res = await fetch("/api/tts/generate", options);
      const data = await checkResponse(res, 0, options);

      if (data.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/wav' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setStatus('success');
        refreshUser();
      } else {
        throw new Error("Respon tidak memiliki audio content");
      }
    } catch (error) {
      console.error("Generation error:", error);
      handleApiError(error);
      setStatus('error');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `shinerva-${voice}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Mulai mengunduh...");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Greeting */}
      <div className="text-center sm:text-left mb-6">
        <h1 className="text-3xl font-black text-white mb-2">
          Halo, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Kreator'}.
        </h1>
        <p className="text-zinc-400 font-medium">Mau bikin suara apa hari ini?</p>
      </div>

      {/* Editor Area */}
      <div className="bg-surface border border-surface2 rounded-3xl p-2 focus-within:border-terracotta/50 focus-within:shadow-[0_0_30px_rgba(217,119,87,0.1)] transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik naskahmu di sini..."
          className="w-full bg-transparent text-white text-lg lg:text-xl font-medium p-4 lg:p-6 resize-none focus:outline-none min-h-[150px] custom-scrollbar"
        />
        
        {/* Editor Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-dark/50 rounded-2xl gap-4">
          
          {/* Voice Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {VOICES.map(v => (
              <button
                key={v.id}
                onClick={() => setVoice(v.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  voice === v.id 
                    ? 'bg-zinc-800 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          {/* Char Counter */}
          <div className={`text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-zinc-500'}`}>
            {charCount.toLocaleString('id-ID')} <span className="font-normal opacity-50">/ {MAX_CHARS.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">Shortcut:</span>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => handleTemplateClick(t)}
            className="px-3 py-1.5 rounded-full bg-surface2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="w-full py-5 rounded-3xl bg-terracotta hover:bg-trdark text-white font-black text-xl transition-all shadow-xl shadow-terracotta/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Sedang meracik suara...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            Generate Audio
          </>
        )}
      </button>

      {/* Result Card */}
      {audioUrl && (
        <div className="bg-surface2 rounded-3xl p-6 border border-zinc-800 animate-in zoom-in-95 duration-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
            >
              {isPlaying ? <span className="w-4 h-4 bg-black rounded-sm" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
            </button>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">Hasil Generasi</h3>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Volume2 className="w-4 h-4" />
                <span>{VOICES.find(v => v.id === voice)?.name || 'Suara'}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDownload}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors flex items-center justify-center"
            title="Download Audio"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

    </div>
  );
};

export default GenerateTab;
