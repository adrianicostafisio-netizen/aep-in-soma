// AEP IN SOMA — Service Worker v1.0
// Estrategia: Cache-First para assets estaticos, Network-First para index.html

const CACHE_NAME = 'aep-soma-v22';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/crypto.js',
  './js/crypto-js.min.js',
  './js/knowledge/nr17.js',
  './js/knowledge/nr01.js',
  './js/knowledge/fundacentro.js',
  './js/knowledge/normativeAssociations.js',
  './js/conclusionEngine.js',
  './js/lib/dexie.min.js',
  './js/lib/xlsx.full.min.js',
  './js/lib/jspdf.umd.min.js',
  './js/lib/html2canvas.min.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // Bibliotecas CDN (cache de rede)
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
];

// INSTALL — pre-caches all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching static assets...');
      // Cache local assets first (must succeed), CDN assets are optional
      const localAssets = STATIC_ASSETS.filter(url => !url.startsWith('http'));
      const cdnAssets   = STATIC_ASSETS.filter(url => url.startsWith('http'));
      return cache.addAll(localAssets).then(() => {
        return Promise.allSettled(cdnAssets.map(url => cache.add(url)));
      });
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE — removes old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// FETCH — Cache-First for static assets; pass-through for others
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET requests and browser-extension requests
  if (event.request.method !== 'GET' || url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback: return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
