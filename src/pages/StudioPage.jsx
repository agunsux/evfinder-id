/**
 * StudioPage — Standalone TTS Studio Page
 *
 * A focused, distraction-free voice generation studio page.
 * Use this as a standalone route or embed it within App.jsx.
 *
 * Features:
 * - Text input with character counter
 * - Voice picker with preview
 * - Speed/pitch/volume controls
 * - Generate button with cooldown
 * - Audio player with download
 * - Credit balance display
 * - Pronunciation guide modal
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Loader2, Mic, Settings, BookOpen } from 'lucide-react';

const VOICES = ['SAMBAS', 'MEGA', 'SUSI'];

export default function StudioPage({ user, onGenerate, onPronunciationOpen }) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('SAMBAS');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [loadingMessage, setLoadingMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [generatedInfo, setGeneratedInfo] = useState(null);
  const audioRef = useRef(null);

  const MAX_CHARS = 5000;
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Remaining credits
  const remaining = user
    ? Math.max(0,
        (user.monthly_chars || 0)
        + (user.signup_bonus_chars || 0)
        + (user.earned_chars || 0)
        - (user.used_chars || 0))
    : 0;

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => Math.max(0, c - 1)), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleGenerate = async () => {
    if (!user) return;
    if (!text.trim()) return;
    if (isOverLimit) return;
    if (cooldown > 0) return;

    setStatus('loading');
    setLoadingMessage('Menghubungkan...');

    try {
      if (onGenerate) {
        await onGenerate({ text, voice, speed, pitch, volume, setAudioUrl, setGeneratedInfo, setCooldown, setStatus, setLoadingMessage });
      }
    } catch (err) {
      console.error('[StudioPage] Generate failed:', err);
      setStatus('error');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-dark text-text p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-terracotta">SHINERVA Studio</h1>
          <div className="text-right">
            <div className="text-xs text-text-muted">Sisa Kredit</div>
            <div className="text-lg font-bold text-text">{remaining.toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik naskah Anda di sini..."
            className={`w-full bg-surface border rounded-2xl p-4 min-h-[200px] resize-none outline-none transition-colors ${
              isOverLimit ? 'border-red-500' : 'border-surface2 focus:border-terracotta'
            }`}
          />
          <div className={`text-right text-xs mt-1 ${isOverLimit ? 'text-red-500' : 'text-text-muted'}`}>
            {charCount.toLocaleString('id-ID')} / {MAX_CHARS.toLocaleString('id-ID')} karakter
          </div>
        </div>

        {/* Voice Picker */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-text-muted mb-2">Pilih Suara</label>
          <div className="flex gap-3 flex-wrap">
            {VOICES.map((v) => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                className={`px-6 py-3 rounded-full font-bold border transition-all ${
                  voice === v
                    ? 'bg-terracotta text-text border-terracotta'
                    : 'bg-surface text-text-muted border-surface2 hover:border-terracotta'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Kecepatan', value: speed, setter: setSpeed, min: 0.5, max: 2, step: 0.1 },
            { label: 'Pitch', value: pitch, setter: setPitch, min: -20, max: 20, step: 1 },
            { label: 'Volume', value: volume, setter: setVolume, min: -10, max: 10, step: 1 },
          ].map(({ label, value, setter, min, max, step }) => (
            <div key={label}>
              <label className="block text-sm font-bold text-text-muted mb-2">
                {label}: <span className="text-terracotta">{value}</span>
              </label>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setter(parseFloat(e.target.value))}
                className="w-full accent-terracotta"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={!user || !text.trim() || isOverLimit || status === 'loading' || cooldown > 0}
            className="flex-1 bg-terracotta hover:bg-trdark disabled:bg-surface2 disabled:text-text-muted text-text font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {loadingMessage || 'Memproses...'}</>
            ) : cooldown > 0 ? (
              `Tunggu ${cooldown}s`
            ) : (
              <><Mic className="w-5 h-5" /> {user ? 'Generate' : 'Login untuk Generate'}</>
            )}
          </button>

          <button
            onClick={onPronunciationOpen}
            className="px-6 py-4 bg-surface border border-surface2 rounded-2xl hover:border-terracotta transition-colors"
            title="Panduan Pengucapan"
          >
            <BookOpen className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-surface border border-surface2 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-terracotta rounded-full flex items-center justify-center hover:bg-trdark transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-text" /> : <Play className="w-5 h-5 text-text ml-0.5" />}
              </button>
              <div className="flex-1">
                <div className="text-sm font-bold text-text">
                  {generatedInfo?.voice || voice} — {(generatedInfo?.duration || 0)}s
                </div>
                <div className="text-xs text-text-muted">
                  Generated in {generatedInfo?.time || '-'}s
                </div>
              </div>
              <a
                href={audioUrl}
                download={`shinerva-${Date.now()}.wav`}
                className="p-3 bg-surface2 rounded-xl hover:bg-terracotta/20 transition-colors"
              >
                <Download className="w-5 h-5 text-text-muted" />
              </a>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              controls
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
