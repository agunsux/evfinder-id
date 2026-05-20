import React from 'react';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-surface text-text flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Studio Dashboard</h1>
        <p>This is the protected dashboard area.</p>
        <a href="/" className="text-terracotta underline">Back to Landing</a>
      </div>
    </div>
  );
};

export default DashboardPage;
