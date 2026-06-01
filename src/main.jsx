import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StudioProvider } from './context/StudioContext';
import './index.css';

/**
 * Lazily loads the Midtrans Snap.js script.
 * Returns a Promise that resolves when window.snap is ready.
 * Idempotent — subsequent calls return the same promise.
 */
let snapLoadPromise = null;

export function loadMidtransSnap() {
  if (snapLoadPromise) return snapLoadPromise;

  // Already loaded
  if (window.snap) return Promise.resolve(window.snap);

  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  if (!clientKey || clientKey === 'SB-Mid-client-XXXXX') {
    console.warn('[Snap] VITE_MIDTRANS_CLIENT_KEY not set — Midtrans popup disabled');
    return Promise.reject(new Error('Midtrans client key not configured'));
  }

  const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' || 
                 (clientKey && !clientKey.startsWith('SB-'));
  const scriptUrl = isProd 
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  snapLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => {
      console.log('[Snap] Midtrans Snap.js loaded');
      resolve(window.snap);
    };
    script.onerror = () => {
      console.error('[Snap] Failed to load Midtrans Snap.js');
      snapLoadPromise = null; // Reset so retry can work
      reject(new Error('Midtrans script failed to load'));
    };
    document.head.appendChild(script);
  });

  return snapLoadPromise;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudioProvider>
        <App />
      </StudioProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
