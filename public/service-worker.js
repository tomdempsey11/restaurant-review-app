// public/service-worker.js
const CACHE = 'rr-v2'; // bump to invalidate old cache
const ASSETS = [
  '/',               // fallback for offline
  '/css/styles.css',
  '/manifest.json',
];

// Precache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate and clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - HTML navigations → NETWORK-FIRST (so navbar reflects current session)
// - Static assets (css/js/img/fonts) → CACHE-FIRST
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Network-first for navigations (HTML)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          // Update cache for offline support
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          // Fallback to cache (or to '/')
          const cached = await caches.match(req);
          return cached || caches.match('/');
        })
    );
    return;
  }

  // Cache-first for same-origin static assets
  const url = new URL(req.url);
  const isSameOrigin = url.origin === location.origin;
  const isStatic = /\.(css|js|png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf|eot)$/i.test(url.pathname);

  if (isSameOrigin && isStatic) {
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        });
      })
    );
  }
});
