/* Service worker — offline cache with stale-while-revalidate.
   Serves cached assets instantly, refreshes them from the network in the
   background, and (via skipWaiting + clients.claim) lets a new version take
   over immediately. Bump CACHE_VERSION on every release. */
const CACHE_VERSION = 'v9';
const CACHE_NAME = 'dziennik-treningowy-' + CACHE_VERSION;

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // stale-while-revalidate: respond from cache, update cache in background
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(req).then(cached => {
        const network = fetch(req).then(resp => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            cache.put(req, resp.clone());
          }
          return resp;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
