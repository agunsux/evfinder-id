import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mic, FolderHeart, Coins, User } from 'lucide-react';

import GenerateTab from './tabs/GenerateTab';
import LibraryTab from './tabs/LibraryTab';
import CreditsTab from './tabs/CreditsTab';
import AccountTab from './tabs/AccountTab';

const CreatorDashboard = ({ user, refreshUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard/generate', icon: Mic, label: 'Generate' },
    { path: '/dashboard/library', icon: FolderHeart, label: 'Library' },
    { path: '/dashboard/credits', icon: Coins, label: 'Credits' },
    { path: '/dashboard/account', icon: User, label: 'Account' },
  ];

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col relative text-white">
      {/* Top Desktop Navigation (Minimal) */}
      <div className="hidden md:flex sticky top-0 z-50 bg-dark/80 backdrop-blur-md border-b border-surface2">
        <div className="max-w-5xl mx-auto w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard/generate')}>
            <span className="text-terracotta text-2xl font-black">✦</span>
            <span className="font-black tracking-tight text-xl">SHINERVA</span>
          </div>
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 font-bold transition-colors ${
                    isActive ? 'text-terracotta' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 pb-32 md:pb-10">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/generate" replace />} />
          <Route path="generate" element={<GenerateTab user={user} refreshUser={refreshUser} />} />
          <Route path="library" element={<LibraryTab user={user} refreshUser={refreshUser} />} />
          <Route path="credits" element={<CreditsTab user={user} />} />
          <Route path="account" element={<AccountTab user={user} refreshUser={refreshUser} />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-surface2 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-terracotta' : 'text-zinc-500'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-terracotta/10' : ''}`}>
                  <item.icon className={`w-6 h-6 ${isActive ? 'fill-terracotta/20' : ''}`} />
                </div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
