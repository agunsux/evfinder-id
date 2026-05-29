/**
 * usePreferences — React hook for persistent user preferences
 *
 * Persists to localStorage under key 'shinerva_prefs':
 * {
 *   theme: 'dark' | 'light',
 *   language: 'ID' | 'EN',
 *   preferredVoice: string,
 *   preferredSpeed: number,
 *   preferredPitch: number,
 *   preferredVolume: number,
 *   hasSeenWelcome: boolean,
 *   dismissedBanners: string[],
 *   audioFormat: 'mp3' | 'wav',
 * }
 *
 * Usage:
 *   const { prefs, updatePref, setTheme, setLanguage } = usePreferences();
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'shinerva_prefs';

const DEFAULTS = {
  theme: 'dark',
  language: 'ID',
  preferredVoice: 'SAMBAS',
  preferredSpeed: 1.0,
  preferredPitch: 0,
  preferredVolume: 0,
  hasSeenWelcome: false,
  dismissedBanners: [],
  audioFormat: 'wav',
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('[usePreferences] savePrefs failed:', err.message);
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(loadPrefs);

  // Sync to localStorage on change
  const updatePrefs = useCallback((updates) => {
    setPrefs((prev) => {
      const next = { ...prev, ...updates };
      savePrefs(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme) => {
    updatePrefs({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [updatePrefs]);

  const setLanguage = useCallback((language) => {
    updatePrefs({ language });
  }, [updatePrefs]);

  const setPreferredVoice = useCallback((preferredVoice) => {
    updatePrefs({ preferredVoice });
  }, [updatePrefs]);

  const setPreferredSpeed = useCallback((preferredSpeed) => {
    updatePrefs({ preferredSpeed });
  }, [updatePrefs]);

  const setPreferredPitch = useCallback((preferredPitch) => {
    updatePrefs({ preferredPitch });
  }, [updatePrefs]);

  const setPreferredVolume = useCallback((preferredVolume) => {
    updatePrefs({ preferredVolume });
  }, [updatePrefs]);

  const dismissBanner = useCallback((bannerId) => {
    setPrefs((prev) => {
      const dismissed = [...new Set([...prev.dismissedBanners, bannerId])];
      const next = { ...prev, dismissedBanners: dismissed };
      savePrefs(next);
      return next;
    });
  }, []);

  const isBannerDismissed = useCallback((bannerId) => {
    return prefs.dismissedBanners.includes(bannerId);
  }, [prefs.dismissedBanners]);

  // Apply theme class on mount
  useEffect(() => {
    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return {
    prefs,
    updatePrefs,
    setTheme,
    setLanguage,
    setPreferredVoice,
    setPreferredSpeed,
    setPreferredPitch,
    setPreferredVolume,
    dismissBanner,
    isBannerDismissed,
    resetPrefs: () => {
      setPrefs({ ...DEFAULTS });
      savePrefs(DEFAULTS);
    },
  };
}

export default usePreferences;
