import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-bg-primary/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-display font-bold tracking-tight text-text-primary">
          SHINERVA
        </a>
        <a 
          href="/app" 
          className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Masuk
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
