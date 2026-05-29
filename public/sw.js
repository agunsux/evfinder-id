/**
 * SHINERVA - Service Worker
 * ==========================
 * Caches high-priority static assets and provides offline fallback.
 * Registration is deferred via window.addEventListener('load') in App.jsx.
 *
 * Cache Strategy:
 * - High-priority assets (JS, CSS, fonts, icons): Cache First
 * - HTML / navigation: Network First with cache fallback
 * - Audio samples: Cache First with network fallback
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `shinerva-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `shinerva-dynamic-${CACHE_VERSION}`;
const AUDIO_CACHE = `shinerva-audio-${CACHE_VERSION}`;

// High-priority static assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/shinerva-icon.png',
  '/shinerva.svg',
  '/manifest.json',
];

// ─── Install: Pre-cache high-priority assets ───────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some static assets failed to cache:', err.message);
        // Don't block install — continue even if some assets fail
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: Clean up old caches ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            // Delete caches that don't match current version
            return (
              key.startsWith('shinerva-') &&
              !key.includes(CACHE_VERSION) &&
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE &&
              key !== AUDIO_CACHE
            );
          })
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch: Intercept and serve from cache or network ─────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip API routes — always go to network (no caching)
  if (url.pathname.startsWith('/api/')) return;

  // ── Audio samples: Cache First, fallback to network ─────────────────────
  if (url.pathname.startsWith('/samples/') || url.pathname.includes('.mp3') || url.pathname.includes('.wav')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // No audio in cache, no network — return null (player handles error)
          return null;
        }
      })
    );
    return;
  }

  // ── Static assets (JS, CSS, fonts, images): Cache First ────────────────
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico|webmanifest)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        }).catch(() => {
          // Return a basic fallback image for missing images
          if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1a1a1a" width="200" height="200"/><text fill="#e2725b" font-size="14" text-anchor="middle" x="100" y="100">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // ── HTML / navigation: Network First, fallback to cache ────────────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback to cached index.html for offline navigation
          return caches.match('/').then((index) => {
            if (index) return index;
            // Ultimate fallback: show offline message
            return new Response(
              `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offline - Shinerva</title>
  <style>
    body { background:#1a1a1a; color:#FDFBF7; font-family:Inter,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; text-align:center; }
    .container { padding:2rem; max-width:480px; }
    h1 { color:#e2725b; font-size:2rem; margin-bottom:1rem; }
    p { color:#8a8a8a; line-height:1.6; margin-bottom:1.5rem; }
    button { background:#e2725b; color:#FDFBF7; border:none; padding:12px 24px; border-radius:9999px; font-weight:700; cursor:pointer; }
    button:hover { background:#c45f4a; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Offline</h1>
    <p>Koneksi internet terputus. Silakan periksa jaringan Anda dan coba lagi.</p>
    <button onclick="location.reload()">Coba Lagi</button>
  </div>
</body>
</html>`,
              { status: 503, headers: { 'Content-Type': 'text/html' } }
            );
          });
        });
      })
  );
});