// public/service-worker.js
const CACHE = 'rr-v3'; // bump to invalidate old cache
const ASSETS = [
  '/',               // offline fallback for navigations
  '/manifest.json',
  // Note: we intentionally do NOT precache '/css/styles.css'
  // because your site serves it with ?v=... and runtime caching will handle it.
];

// ---- Install: precache "always-good" assets ----
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: clean up old caches ----
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---- Fetch strategy ----
// - HTML navigations: NETWORK-FIRST (ensures latest UI/session state)
// - Static same-origin assets (css/js/img/fonts): CACHE-FIRST (with safe put)
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  // Treat navigations (HTML) as network-first
  const acceptsHTML = (req.headers.get('accept') || '').includes('text/html');
  if (req.mode === 'navigate' || acceptsHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          // Update cache in background for offline
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          // Fallback: cached page or '/'
          const cached = await caches.match(req);
          return cached || caches.match('/');
        })
    );
    return;
  }

  // Same-origin static assets: cache-first
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isStatic = /\.(css|js|png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf|eot)$/i.test(url.pathname);

  if (isSameOrigin && isStatic) {
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          // Only cache good same-origin responses
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached); // if network fails, fall back to any cached version
      })
    );
  }
});
