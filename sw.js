const CACHE_NAME = 'nyx-band-pro-cache-v5.4';
const ASSETS = [
  '/',
  '/index.html',
  '/auth.html',
  '/index.css',
  '/app.js',
  '/auth.js',
  '/supabase.js',
  '/songsService.js',
  '/chords.js',
  '/chordEngine.js',
  '/bpmDetector.js',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (let asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Advertencia: No se pudo precargar el asset:', asset, err);
        }
      }
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
  if (e.request.method !== 'GET') return;

  // Solo interceptar peticiones del mismo origen
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Si es una navegación (abrir la página en el navegador)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Si no hay red o falló, buscar en caché
          const cached = await caches.match(e.request, { ignoreSearch: true });
          if (cached) return cached;
          const fallback = await caches.match('/index.html') || await caches.match('/');
          return fallback || Response.error();
        })
    );
    return;
  }

  // Para otros assets (css, js, imagenes)
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        // Actualizar en segundo plano sin bloquear
        fetch(e.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {
        return Response.error();
      });
    })
  );
});
