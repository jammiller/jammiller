// One-time recovery worker: replace legacy cache-first workers with network-only delivery.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim().then(() => self.clients.matchAll({ type: 'window' })).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  }));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') event.respondWith(fetch(event.request));
});
