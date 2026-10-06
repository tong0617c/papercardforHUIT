// Mind Service Worker
var CACHE_NAME = 'mind-v2-mochi-trace-1';
var URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './home-theme.css',
  './home-theme.js',
  './trace-host.js',
  './trace-host.css',
  './trace.html',
  './trace-core.js',
  './trace-support.js',
  './trace-loc-lib.js',
  './trace-adapter.js',
  './trace-adapter.css',
  './trace-mochi.css',
  './trace-start.js',
  './trace-notice.html',
  './script.js',
  './icon-huit.png',
  './manifest.json'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(n) {
          if (n !== CACHE_NAME) return caches.delete(n);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.pathname.endsWith('/trace.html') }).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
