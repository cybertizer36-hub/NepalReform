// Nepal Reforms Service Worker
// Handles offline functionality and caching

const CACHE_NAME = 'nepal-reforms-v1'
const DYNAMIC_CACHE = 'nepal-reforms-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/nrlogo7.png',
  '/og-image.png',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE
          })
          .map((cacheName) => {
            console.log('Service Worker: Removing old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  
  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-http requests
  if (!url.protocol.startsWith('http')) return
  
  // Skip cross-origin requests (except for allowed CDNs)
  const allowedOrigins = [
    self.location.origin,
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ]
  
  if (!allowedOrigins.some(origin => url.origin === origin)) {
    return
  }
  
  // Handle API requests (network first, fallback to cache)
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone()
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          
          return response
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Service Worker: Serving API from cache (offline):', url.pathname)
              return cachedResponse
            }
            
            // Return offline response for API calls
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'You are currently offline. This data will be synced when you reconnect.' 
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
    return
  }
  
  // Handle static assets (cache first, fallback to network)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse
        }
        
        // Not in cache, fetch from network
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }
          
          // Clone the response before using it
          const responseToCache = response.clone()
          
          // Cache the fetched response for next time
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
          
          return response
        })
      })
    )
    return
  }
})

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName)
      })
    })
    
    event.ports[0].postMessage({ success: true })
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    console.log('Service Worker: Syncing offline actions')
    
    event.waitUntil(
      // Send message to all clients to trigger sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_OFFLINE' })
        })
      })
    )
  }
})
