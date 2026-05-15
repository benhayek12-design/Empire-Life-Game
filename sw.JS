// Empire OS — Service Worker
// Caches the app on first load so it works offline forever after.

const CACHE_NAME = ‘empire-os-v1’;
const ASSETS = [
  './',
  './empire-os.html',
  './index.html'
];


// On install: pre-cache the app shell
self.addEventListener(‘install’, (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) =>
// Use addAll but tolerate missing files (e.g., if hosted as index.html only)
Promise.all(
ASSETS.map((url) =>
cache.add(url).catch(() => {/* ignore individual failures */})
)
)
)
);
self.skipWaiting();
});

// On activate: clean up old caches
self.addEventListener(‘activate’, (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
)
)
);
self.clients.claim();
});

// On fetch: cache-first, fall back to network, then cache new responses
self.addEventListener(‘fetch’, (event) => {
if (event.request.method !== ‘GET’) return;

event.respondWith(
caches.match(event.request).then((cached) => {
if (cached) return cached;

```
  return fetch(event.request)
    .then((response) => {
      // Cache successful basic responses for next time
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    })
    .catch(() => {
      // Offline and nothing cached
      return new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    });
})
```

);
});
