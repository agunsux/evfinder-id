import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_VOICES } from '../constants/voices';

const StudioContext = createContext();

export function StudioProvider({ children }) {
  const [language, setLanguage] = useState("ID");
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(DEFAULT_VOICES["ID"]);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const [loadingMessage, setLoadingMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [isAudioVisible, setIsAudioVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({ tiers: {}, limits: {} });

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (DEFAULT_VOICES[newLang]) {
      setVoice(DEFAULT_VOICES[newLang]);
    }
  };

  const value = {
    language, setLanguage, handleLanguageChange,
    text, setText,
    voice, setVoice,
    speed, setSpeed,
    pitch, setPitch,
    volume, setVolume,
    status, setStatus,
    loadingMessage, setLoadingMessage,
    audioUrl, setAudioUrl,
    turnstileToken, setTurnstileToken,
    isAudioVisible, setIsAudioVisible,
    isPlaying, setIsPlaying,
    voiceConfig, setVoiceConfig
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
}
