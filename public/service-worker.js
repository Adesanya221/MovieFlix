// Service Worker for MovieFlix App

const CACHE_NAME = 'movieflix-cache-v1';
const API_CACHE_NAME = 'movieflix-api-cache-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request is an API call
const isApiRequest = (url) => {
  return (
    url.includes('streaming-availability.p.rapidapi.com') ||
    url.includes('api.themoviedb.org') ||
    url.includes('omdbapi.com') ||
    url.includes('googleapis.com/youtube')
  );
};

// Helper function to create a cache key from a request
const createCacheKey = (request) => {
  const url = new URL(request.url);
  // For API requests, we use the full URL including query parameters as the key
  return url.href;
};

// Fetch event - handle API caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (request.method !== 'GET') return;
  
  // Handle API requests with a different caching strategy
  if (isApiRequest(request.url)) {
    // Network first, then cache for API requests
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response because it can only be consumed once
          const responseToCache = response.clone();
          
          // Cache the successful response
          if (response.status === 200) {
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                const cacheKey = createCacheKey(request);
                cache.put(cacheKey, responseToCache);
                console.log('Cached API response for:', url.pathname);
              });
          }
          
          return response;
        })
        .catch((error) => {
          console.log('Fetch failed, trying cache for:', url.pathname, error);
          
          // If network request fails, try to get from cache
          return caches.match(createCacheKey(request))
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('Returning cached API response for:', url.pathname);
                return cachedResponse;
              }
              
              // If no cache match, throw the error
              throw error;
            });
        })
    );
  } else {
    // For non-API requests, use cache-first strategy
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not found in cache, fetch from network and cache if successful
          return fetch(request)
            .then((response) => {
              // Don't cache non-success responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response before consuming it
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
    );
  }
});

// Handle background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Example function to sync data when back online
async function syncFavorites() {
  try {
    // This would be implemented to sync locally stored favorites when back online
    console.log('Syncing favorites');
    // Actual sync code would be here
  } catch (error) {
    console.error('Sync failed:', error);
  }
} 