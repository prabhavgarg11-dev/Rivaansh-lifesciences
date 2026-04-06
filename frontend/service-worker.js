/**
 * service-worker.js — Rivaansh Lifesciences PWA
 * Strategy: Cache-First for static assets, Network-First for API
 * Version bump forces cache refresh on deploy
 */

const CACHE_VERSION = 'rivaansh-v4';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/script.js',
    '/api.js',
    '/auth.js',
    '/cart.js',
    '/order.js',
    '/style.css',
    '/manifest.json',
    '/logo.png',
    '/offline.html',
    // Add critical fonts and icons
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
];

// ── INSTALL ───────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            // addAll fails if ANY resource 404s — use individual adds to be safe
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(() => null))
            );
        }).then(() => self.skipWaiting())  // activate immediately
    );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== STATIC_CACHE && k !== API_CACHE)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())  // take control of all clients
    );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // ① API requests → Network-First with offline fallback (only GET)
    if (url.pathname.startsWith('/api/') || url.port === '5000') {
        // Non-GET API calls (POST, PUT, DELETE) → always network, never cache
        if (request.method !== 'GET') {
            event.respondWith(
                fetch(request).catch(() =>
                    new Response(JSON.stringify({
                        message: 'Offline — request failed.',
                        offline: true
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            );
            return;
        }

        // API requests → Always go to Network, Skip Cache (Fixing loading/CORS stuckness)
        event.respondWith(
            fetch(request).catch(() => {
                // Only use cache as fallback if network fails
                return caches.match(request).then(cached => {
                    return cached || new Response(
                        JSON.stringify({
                            message: 'Offline — cached data not available.',
                            offline: true
                        }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                });
            })
        );
        return;
    }

    // ② Static assets → Cache-First with network fallback
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;

                return fetch(request).then(res => {
                    // Cache successful assets discovered at runtime
                    if (res && res.ok && res.status === 200) {
                        const clone = res.clone();
                        caches.open(STATIC_CACHE).then(c => c.put(request, clone));
                    }
                    return res;
                }).catch(() => {
                    // Navigation request while offline → serve app shell
                    if (request.mode === 'navigate') {
                        return caches.match('/index(1).html') ||
                               caches.match('/offline.html');
                    }
                    // For other resource types, serve a fallback if available
                    return caches.match('/offline.html');
                });
            })
        );
        return;
    }

    // Default: pass through for non-GET requests
    event.respondWith(fetch(request));
});

// ── BACKGROUND SYNC (for failed API calls while offline) ──────────────────────
self.addEventListener('sync', event => {
    if (event.tag === 'sync-cart') {
        // Placeholder for future background sync implementation
        console.log('[SW] Background sync: sync-cart');
    }
});

// ── PUSH NOTIFICATIONS (placeholder, ready to activate) ───────────────────────
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    event.waitUntil(
        self.registration.showNotification(data.title || 'Rivaansh', {
            body: data.body || 'You have a new update.',
            icon: '/logo.png',
            badge: '/logo.png',
            data: { url: data.url || '/' },
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});
