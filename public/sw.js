const CACHE_NAME = 'dailymon-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Si POST sur /entry/*, supprimer le GET correspondant du cache
  if (event.request.method === 'POST' && url.pathname.startsWith('/entry/')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          // Supprimer le GET correspondant du cache
          const getRequest = new Request(event.request.url, { method: 'GET' });
          caches.open(CACHE_NAME).then(function(cache) {
            cache.delete(getRequest);
            console.log('Cache cleared for:', url.pathname);
          });
        }
        return response;
      })
    );
    return;
  }
  
  // Pour les autres requêtes : cache first
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Filtrer les schemes non supportés
            if (!response || response.status !== 200 || 
                (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://'))) {
              return response;
            }

            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});