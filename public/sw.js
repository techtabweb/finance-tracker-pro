// Service Worker for Finance Tracker PWA
const CACHE_NAME = 'finance-tracker-v1.0.0';
const STATIC_CACHE_NAME = 'finance-tracker-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'finance-tracker-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/main.css',
  '/src/App.tsx',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add more critical assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\//,
  /gemini/,
  // Add other API patterns
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate strategies
  if (request.method === 'GET') {
    // Static assets - Cache First strategy
    if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    }
    // API requests - Network First strategy with offline fallback
    else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirstWithFallback(request));
    }
    // Other assets - Stale While Revalidate strategy
    else if (url.origin === location.origin) {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Cache First Strategy - for static assets
async function cacheFirst(request, cacheName = STATIC_CACHE_NAME) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

// Network First Strategy - for API calls
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires internet connection',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate Strategy - for other assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
    return null;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  return await networkPromise || new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncOfflineExpenses());
  } else if (event.tag === 'budget-sync') {
    event.waitUntil(syncOfflineBudgets());
  }
});

// Sync offline expenses when online
async function syncOfflineExpenses() {
  try {
    // Get offline data from IndexedDB or localStorage
    const offlineExpenses = await getOfflineData('expenses');
    
    if (offlineExpenses && offlineExpenses.length > 0) {
      // Send to server when online
      for (const expense of offlineExpenses) {
        try {
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
          });
          
          if (response.ok) {
            await removeOfflineData('expenses', expense.id);
          }
        } catch (error) {
          console.error('Failed to sync expense:', error);
        }
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Sync offline budgets when online
async function syncOfflineBudgets() {
  try {
    const offlineBudgets = await getOfflineData('budgets');
    
    if (offlineBudgets && offlineBudgets.length > 0) {
      for (const budget of offlineBudgets) {
        try {
          const response = await fetch('/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budget)
          });
          
          if (response.ok) {
            await removeOfflineData('budgets', budget.id);
          }
        } catch (error) {
          console.error('Failed to sync budget:', error);
        }
      }
    }
  } catch (error) {
    console.error('Budget sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Finance Tracker', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Share target handling (for PWA sharing)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const file = formData.get('file');
    
    // Store shared data for the app to process
    const shareData = {
      title,
      text,
      file: file ? await file.arrayBuffer() : null,
      fileName: file ? file.name : null,
      fileType: file ? file.type : null,
      timestamp: Date.now()
    };
    
    // Store in IndexedDB or cache for app to retrieve
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.put('/shared-data', new Response(JSON.stringify(shareData)));
    
    // Redirect to app
    return Response.redirect('/?shared=true', 302);
  } catch (error) {
    console.error('Share target handling failed:', error);
    return Response.redirect('/', 302);
  }
}

// Helper functions for offline data management
async function getOfflineData(type) {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function removeOfflineData(type, id) {
  // This would typically remove from IndexedDB
  console.log(`Removing offline ${type} data:`, id);
}

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'finance-data-sync') {
    event.waitUntil(syncFinanceData());
  }
});

async function syncFinanceData() {
  try {
    // Sync critical finance data in background
    console.log('Syncing finance data in background...');
    
    // This would fetch latest data and update cache
    const response = await fetch('/api/sync');
    if (response.ok) {
      const data = await response.json();
      // Update cache with fresh data
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}