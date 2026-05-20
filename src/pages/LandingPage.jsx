import React from 'react';
import { Play } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-dark)] text-[var(--color-text)]">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-dark)]/80 border-b border-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold tracking-tight">SHINERVA</span>
          <button className="text-sm border border-[var(--color-surface2)] px-4 py-2 rounded-full hover:bg-[var(--color-surface2)] transition-colors">
            Masuk
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center">
        <div className="px-3 py-1 mb-6 text-xs text-[var(--color-text-muted)] tracking-widest uppercase border border-[var(--color-surface2)] rounded-full">
          AI Suara Bahasa Indonesia
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading mb-6 tracking-tight">
          Suara yang terasa manusiawi
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-xl leading-relaxed">
          Ubah teks jadi narasi alami dalam hitungan detik. Untuk YouTube, podcast, dan konten kamu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
            Coba Gratis
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-[var(--color-surface2)] hover:bg-[var(--color-surface2)] transition-colors">
            <Play size={16} fill="white" /> Dengarkan Demo
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
