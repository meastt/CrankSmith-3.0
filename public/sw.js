// public/sw.js - Updated to cache actual Next.js assets
const CACHE_NAME = 'cranksmith-v3.0.1';
const urlsToCache = [
  '/',
  '/build',
  '/analyze', 
  '/test',
  // Remove the non-existent static files
  // Next.js handles CSS/JS bundling automatically
];

// Install event - cache key resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Only cache existing URLs to avoid 404s
        return cache.addAll(urlsToCache.filter(url => {
          // Skip caching CSS/JS files that don't exist
          return !url.includes('/static/');
        }));
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Don't try to cache Next.js internal requests
        if (event.request.url.includes('/_next/')) {
          return fetch(event.request);
        }
        
        return fetch(event.request).catch(() => {
          // Return a fallback for offline navigation
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});