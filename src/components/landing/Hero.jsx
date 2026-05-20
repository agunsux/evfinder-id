import React from 'react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg-secondary mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium text-text-secondary">AI Suara Bahasa Indonesia</span>
      </div>
      
      <h1 className="text-6xl md:text-7xl font-display font-medium text-text-primary mb-6 tracking-tight">
        Suara yang terasa manusiawi
      </h1>
      
      <p className="max-w-xl text-lg text-text-secondary mb-10 leading-relaxed">
        Ubah teks jadi narasi alami dalam hitungan detik. Untuk YouTube, podcast, dan konten kamu.
      </p>

      <div className="flex gap-4">
        <button className="px-8 py-3 rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-light transition-colors">
          Coba Gratis
        </button>
        <button className="px-8 py-3 rounded-full border border-border text-text-primary hover:bg-bg-secondary transition-colors">
          ▶ Dengarkan Demo
        </button>
      </div>
    </section>
  );
};

export default Hero;
