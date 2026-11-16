// Nordy Tech - Service Worker
const CACHE_NAME = 'nordy-tech-v1';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/produk.html',
  '/produk-detail.html',
  '/keranjang.html',
  '/checkout.html',
  '/konfirmasi.html',
  '/lacak.html',
  '/css/globals.css',
  '/css/tokens.css',
  '/css/components.css',
  '/css/tokens.css',
  '/js/config.js',
  '/js/utils.js',
  '/js/layout.js',
  '/js/index.js',
  '/js/produk.js',
  '/js/produk-detail.js',
  '/js/cart.js',
  '/js/keranjang.js',
  '/js/checkout.js',
  '/js/admin-guard.js',
  '/js/admin-login.js',
  '/js/admin-dashboard.js',
  '/js/admin-produk.js',
  '/js/admin-pesanan.js',
  '/js/admin-pengaturan.js',
  '/css/components.css',
  '/css/globals.css'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_ASSETS))
  );
});

// Fetch event - serve from cache if offline
self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cacheResponse => {
      // Return cached response if available
      if (cacheResponse) return cacheResponse;
      
      // Otherwise fetch from network and add to cache
      return fetch(event.request)
        .then(networkResponse => {
          // Clone response to add to cache
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clonedResponse));
          
          return networkResponse;
        })
        .catch(() => {
          // If fetch fails and we're offline, try to return a cached fallback
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return Response.error();
        });
    })
  );
});

// Handle message from clients (e.g., for cache busting)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});