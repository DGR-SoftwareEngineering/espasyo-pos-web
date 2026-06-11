const CACHE_NAV = 'espasyo-nav-v1';
const CACHE_STATIC = 'espasyo-static-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAV && k !== CACHE_STATIC).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // CacheFirst for Next.js static bundles (content-hashed filenames)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) caches.open(CACHE_STATIC).then((c) => c.put(request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // NetworkFirst for page navigations — enables offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request).then((res) => {
          if (res.ok) caches.open(CACHE_NAV).then((c) => c.put(request, res.clone()));
          return res;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/cashier/pos'))
      )
    );
  }
});
