import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudio } from '../context/StudioContext';
import { VOICES, LANGUAGES, getVoiceDisplayName } from '../constants/voices';

const VoicePicker = ({ user }) => {
  const { language, handleLanguageChange, voice, setVoice, voiceConfig } = useStudio();
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const voiceDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target)) {
        setIsVoiceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm font-bold text-text-muted mb-2">
        Bahasa & Suara
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex bg-dark p-1 rounded-xl border border-surface2 flex-shrink-0">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all border-none cursor-pointer flex-1 ${
                language === lang.code 
                ? "bg-terracotta text-white shadow-lg shadow-terracotta/20" 
                : "text-text-muted hover:text-text hover:bg-surface2/50"
              }`}
            >
              <span>{lang.flag}</span>
              <span className="hidden xs:inline">{lang.name}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-0" ref={voiceDropdownRef}>
          <button
            type="button"
            onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
            className="w-full h-full min-h-[44px] bg-dark text-text rounded-xl py-2 px-4 border border-surface2 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer font-bold text-sm tracking-wide text-left flex items-center justify-between"
          >
            <span className="truncate">{getVoiceDisplayName(voice)}</span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isVoiceDropdownOpen ? 'rotate-180' : ''} shrink-0 ml-2`} />
          </button>

          <AnimatePresence>
            {isVoiceDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-0 right-0 bottom-full mb-2 bg-surface rounded-2xl border border-surface2 shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar origin-bottom"
              >
                {Object.entries(VOICES[language] || {}).map(([category, voiceList]) => (
                  <div key={category}>
                    <div className="px-4 py-2 bg-surface2/30 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-md border-b border-surface2/30">
                      {category}
                    </div>
                    <div className="p-1">
                      {voiceList.map((v) => {
                        const tierOrder = ["FREE", "STARTER", "CREATOR", "PRO"];
                        const userTierIndex = tierOrder.indexOf(user?.tier || "FREE");
                        const requiredTierIndex = tierOrder.indexOf(v.tier || "FREE");
                        const isLocked = (v.premium && userTierIndex < requiredTierIndex) || v.comingSoon;
                        const isSelected = voice === v.id;
                        const isStudio = v.type === 'Studio' || v.glow;

                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={isLocked}
                            onClick={() => {
                              setVoice(v.id);
                              setIsVoiceDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group relative overflow-hidden ${
                              isSelected ? 'bg-surface2' : 'hover:bg-surface2/50'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer border-none'}`}
                          >
                            <div className="flex flex-col relative z-20">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isSelected ? 'text-terracotta' : 'text-text'}`}>
                                  {isLocked && !v.comingSoon && "🔒 "}{v.name} {isLocked && !v.comingSoon && <span className="text-xs text-text-muted font-normal ml-1">(Premium Only)</span>}
                                </span>
                                {v.premium && !v.comingSoon && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest bg-terracotta/20 text-terracotta border border-terracotta/20">
                                    PRO
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-text-muted mt-0.5">
                                {v.comingSoon 
                                  ? (language === 'ID' ? 'Segera Hadir' : 'Coming Soon')
                                  : `Beban: ${voiceConfig?.tiers?.[v.type] || 1}x Kredit`
                                }
                              </span>
                              <span className="text-[9px] text-terracotta/70 mt-1 uppercase font-bold tracking-widest">
                                {v.useCase}
                              </span>
                            </div>
                            
                            {isStudio && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-terracotta/50 shadow-[0_0_15px_rgba(231,76,60,0.5)]"></div>
                            )}
                            
                            {isSelected && (
                              <Check className="w-4 h-4 text-terracotta relative z-20" />
                            )}

                            {isStudio && (
                              <div className="absolute inset-0 bg-gradient-to-r from-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VoicePicker;
