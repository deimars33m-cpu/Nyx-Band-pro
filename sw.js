const CACHE_NAME = 'nyx-band-pro-cache-v3.0';
const ASSETS = [
  './',
  './index.html',
  './index.css',
  './app.js',
  './supabase.js',
  './songsService.js',
  './chords.js',
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Error precargando activos del PWA:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        fetch(e.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(e.request).then(networkResponse => {
        if (networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      });
    })
  );
});
