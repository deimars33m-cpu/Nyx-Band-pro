const CACHE_NAME = 'nyx-band-pro-cache-v3.5';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/app.js',
  '/supabase.js',
  '/songsService.js',
  '/chords.js',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Usar un bucle para evitar que un solo error (ej. redirección 308) cancele todo el caché
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
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        // Actualización en segundo plano
        fetch(e.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      // Si no está en caché, buscar en red
      return fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      }).catch(err => {
        console.error('Fetch falló para:', e.request.url, err);
        // Podríamos retornar un offline.html aquí si lo tuviéramos
        throw err;
      });
    })
  );
});
