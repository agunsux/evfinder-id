import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface text-text flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Voice Engine</h1>
        <p className="text-lg mb-8">Emotional AI Voices. Listen first, signup later.</p>
        <a href="/app" className="bg-terracotta text-white px-6 py-2 rounded-full">Go to Studio</a>
      </div>
    </div>
  );
};

export default LandingPage;
