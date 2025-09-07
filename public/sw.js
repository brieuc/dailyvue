const CACHE_NAME = 'dailymon-v2';
const STATIC_CACHE = 'dailymon-static-v2';
const API_CACHE = 'dailymon-api-v2';

// Assets statiques à pré-cacher
const staticUrlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
  // Les JS/CSS avec hash seront cachés automatiquement lors du fetch
];

// Event 'install' - Cache initial
self.addEventListener('install', function(event) {
  console.log('[SW] Install');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('[SW] Caching static files');
        return cache.addAll(staticUrlsToCache);
      })
      .then(() => {
        // Force l'activation immédiate du nouveau SW
        return self.skipWaiting();
      })
  );
});

// Event 'activate' - Nettoyage des anciens caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Supprimer tous les caches qui ne sont pas dans la liste actuelle
          if (cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Prendre le contrôle immédiatement
      return self.clients.claim();
    })
  );
});

// Event 'fetch' - Gestion des requêtes
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // 🔄 GESTION DES MUTATIONS (POST/PUT/DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(event.request.method)) {
    console.log('[SW] Mutation detected:', event.request.method, pathname);
    
    event.respondWith(
      fetch(event.request).then(async function(response) {
        if (response.ok) {
          await invalidateRelatedCache(pathname, event.request.method);
        }
        return response;
      }).catch(error => {
        console.error('[SW] Mutation failed:', error);
        throw error;
      })
    );
    return;
  }
  
  // 📦 GESTION DES REQUÊTES GET
  if (event.request.method === 'GET') {
    // Assets statiques (JS, CSS, images, etc.)
    if (isStaticAsset(pathname)) {
      event.respondWith(cacheFirst(event.request, STATIC_CACHE));
      return;
    }
    
    // API - Modèles (cache agressif, changent rarement)
    if (isModelRequest(pathname)) {
      event.respondWith(cacheFirst(event.request, API_CACHE));
      return;
    }
    
    // API - Entrées par date (cache intelligent)
    if (isEntryByDateRequest(pathname)) {
      const isToday = isDateToday(extractDateFromPath(pathname));
      
      if (isToday) {
        // Pour aujourd'hui: network first (données peuvent changer)
        event.respondWith(networkFirst(event.request, API_CACHE));
      } else {
        // Pour les jours passés: cache first (données stables)
        event.respondWith(cacheFirst(event.request, API_CACHE));
      }
      return;
    }
    
    // Autres requêtes API (network first par défaut)
    if (isApiRequest(pathname)) {
      event.respondWith(networkFirst(event.request, API_CACHE));
      return;
    }
    
    // Fallback pour les autres requêtes
    event.respondWith(networkFirst(event.request, STATIC_CACHE));
  }
});

// 🗑️ INVALIDATION DU CACHE
async function invalidateRelatedCache(pathname, method) {
  try {
    const cache = await caches.open(API_CACHE);
    
    // Si mutation sur une entrée avec date
    if (pathname.match(/^\/entry\/\d{4}-\d{2}-\d{2}$/)) {
      // Invalider exactement cette date
      await cache.delete(pathname);
      console.log('[SW] Invalidated cache for:', pathname);
    }
    
    // Si création/modification d'entrée
    if (pathname.startsWith('/entry') && ['POST', 'PUT'].includes(method)) {
      // Invalider les listes générales qui pourraient être affectées
      const keysToDelete = [
        '/entry/firstDate',
        '/entry/get/' // Invalide tous les patterns de dates multiples
      ];
      
      const allKeys = await cache.keys();
      for (const request of allKeys) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        if (keysToDelete.some(pattern => path.startsWith(pattern))) {
          await cache.delete(request);
          console.log('[SW] Invalidated cache for:', path);
        }
      }
    }
    
    // Si mutation sur un modèle
    if (pathname.startsWith('/model')) {
      // Invalidation spécifique selon le type de modèle
      if (pathname.match(/^\/model\/(food|sport|free)$/)) {
        // POST /model/food → invalide /model/food
        const modelType = pathname.split('/')[2];
        await cache.delete(`/model/${modelType}`);
        console.log(`[SW] Invalidated ${modelType} model cache`);
      } else {
        // Pour autres mutations sur modèles (PUT /model/uuid, DELETE /model/uuid)
        // Invalider tous les modèles car on ne sait pas lequel est affecté
        const allKeys = await cache.keys();
        for (const request of allKeys) {
          const url = new URL(request.url);
          if (url.pathname.match(/^\/model\/(food|sport|free)$/)) {
            await cache.delete(request);
            console.log('[SW] Invalidated model cache for:', url.pathname);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('[SW] Cache invalidation failed:', error);
  }
}

// 🎯 STRATEGIES DE CACHE

// Cache first: vérifie le cache d'abord, puis le réseau
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200 && shouldCache(request)) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

// Network first: essaie le réseau d'abord, puis le cache
async function networkFirst(request, cacheName) {
  try {
    console.log('[SW] Network first:', request.url);
    const response = await fetch(request);
    
    if (response.status === 200 && shouldCache(request)) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// 🔍 HELPERS DE DÉTECTION

function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
         pathname === '/' ||
         pathname === '/manifest.json' ||
         pathname === '/favicon.ico';
}

function isApiRequest(pathname) {
  return pathname.startsWith('/entry') || 
         pathname.startsWith('/model') || 
         pathname.startsWith('/auth');
}

function isModelRequest(pathname) {
  return pathname.match(/^\/model\/(food|sport|free)$/) ||
         pathname.match(/^\/model\/[a-f0-9-]+$/);
}

function isEntryByDateRequest(pathname) {
  return pathname.match(/^\/entry\/\d{4}-\d{2}-\d{2}$/);
}

function extractDateFromPath(pathname) {
  const match = pathname.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isDateToday(dateString) {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

function shouldCache(request) {
  const url = new URL(request.url);
  
  // Ne pas cacher les requêtes avec paramètres d'auth ou de session spéciaux
  if (url.searchParams.has('nocache') || 
      url.searchParams.has('timestamp')) {
    return false;
  }
  
  // Cacher seulement les requêtes HTTP(S)
  return url.protocol === 'http:' || url.protocol === 'https:';
}