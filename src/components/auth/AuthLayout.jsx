import React from 'react';
import ShinervaLogo from '../ShinervaLogo';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-surface2 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
            <ShinervaLogo className="w-12 h-12 text-terracotta" />
        </div>
        <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-text">{title}</h1>
            <p className="text-text-muted text-sm mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
