// Ojos de Tapir — service worker. Subir VERSION en cada publicación.
var VERSION = '1.10.3';
var CACHE = 'ojos-de-tapir-' + VERSION;
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'tpr.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'jspdf.umd.min.js'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('/ping.txt')) return; // medición de señal: siempre a la red
  // red primero para la página (para recibir actualizaciones), caché si no hay señal
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function (r) {
      var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put('index.html', cp); }); return r;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
