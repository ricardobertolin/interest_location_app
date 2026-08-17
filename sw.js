/* Bump with APP_VERSION in index.html — the activate step drops every other
   cache, so a new name is what retires the previous release's files. */
const CACHE = 'atlas-1.1.0';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/d3@7.9.0/dist/d3.min.js',
  'https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js',
  'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const put = (req, res) => {
  const copy = res.clone();
  caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  return res;
};

/* Same-origin app files go network-first so a redeploy actually reaches installed
   clients; everything else (versioned CDN bundles, fonts) is cache-first. Both
   fall back to the cache, so the app runs with no connection at all. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => put(req, res))
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  if (sameOrigin) {
    e.respondWith(
      fetch(req).then(res => put(req, res)).catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res)))
  );
});
