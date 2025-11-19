// Nepal Reforms Service Worker
// Handles offline functionality and caching

const CACHE_NAME = 'nepal-reforms-v3'
const DYNAMIC_CACHE = 'nepal-reforms-dynamic-v3'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/site.webmanifest',
  '/nrlogo7.png',
  '/hero.webp',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching static assets')
      await Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            // Skip assets that fail to cache to avoid install failure
            console.warn('Service Worker: Failed to cache', url, err)
          })
        )
      )
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

// Fetch event - serve from cache when safe. Cache only public GETs; never cache authenticated or private responses
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
  
  // Handle API requests: only cache safe, public GET responses
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    // Never cache non-GET API requests
    if (request.method !== 'GET') {
      event.respondWith(fetch(request))
      return
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          const isOk = response && response.status === 200
          const cacheControl = (response.headers.get('Cache-Control') || '').toLowerCase()
          const isPublic = cacheControl.includes('public') &&
                           !cacheControl.includes('private') &&
                           !cacheControl.includes('no-store')

          // As an extra guard, don't cache if the request has Authorization header
          const hasAuth = request.headers.get('authorization')

          if (isOk && isPublic && !hasAuth) {
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // If network fails, only serve from cache for GET API requests
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('Service Worker: Serving cached public API (offline):', url.pathname)
              return cachedResponse
            }
            return new Response(
              JSON.stringify({
                error: 'Offline',
                message: 'You are currently offline.'
              }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          })
        })
    )
    return
  }
  
  // Handle static assets (cache first, fallback to network); only cache successful, non-private responses
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
          
          // Respect cache headers: skip if marked private/no-store
          const cacheControl = (response.headers.get('Cache-Control') || '').toLowerCase()
          const isPublic = cacheControl === '' || (
            cacheControl.includes('public') &&
            !cacheControl.includes('private') &&
            !cacheControl.includes('no-store')
          )

          if (isPublic) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          
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
