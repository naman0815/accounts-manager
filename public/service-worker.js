// ===== VERSION THIS ON EVERY DEPLOY =====
const CACHE_VERSION = "v1"; // Antigravity must increment this each deploy
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// Install – do not aggressively cache HTML
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

// Activate – delete ALL old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

// Fetch – always go to network first
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request, { cache: "no-store" }).catch(() =>
            caches.match(event.request)
        )
    );
});
