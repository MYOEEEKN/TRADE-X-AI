// Service Worker for TRADE X AI PWA
// Version: 1.0

const CACHE_NAME = 'tradexai-cache-v1';
// A list of all the essential files and resources needed for the app shell to work offline.
const urlsToCache = [
  '/',
  '/tradexai.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js',
  'https://placehold.co/180x180/6D28D9/FFFFFF?text=TXAI',
  'https://placehold.co/192x192/6D28D9/FFFFFF?text=TXAI',
  'https://placehold.co/512x512/6D28D9/FFFFFF?text=TXAI'
];

// Install event: This is triggered when the service worker is first installed.
// We open a cache and add all the essential assets to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event: This is triggered when the service worker becomes active.
// We use this event to clean up any old, unused caches to save space.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache is not in our whitelist, we delete it.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: This is triggered for every network request made by the page.
// We implement a "cache-first" strategy.
self.addEventListener('fetch', event => {
  // We only handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we find a matching response in the cache, we return it.
        if (response) {
          return response;
        }

        // If the resource is not in the cache, we fetch it from the network.
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // We clone the response because it's a stream and can only be consumed once.
            const responseToCache = networkResponse.clone();
            
            // Open our cache and add the new resource to it for future requests.
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            // You could return a custom offline page here if you had one in the cache.
            // For example: return caches.match('/offline.html');
        });
      })
    );
});
