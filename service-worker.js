// ===== VERSION THIS ON EVERY DEPLOY =====
const CACHE_VERSION = "v3"; // Antigravity must increment this each deploy
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
    // IGNORE Google Apps Script and other external API calls
    if (event.request.url.includes("script.google.com") ||
        event.request.url.includes("script.googleusercontent.com")) {
        return; // Return nothing to let the browser handle it naturally
    }

    event.respondWith(
        fetch(event.request, { cache: "no-store" })
            .catch(() => caches.match(event.request))
            .then((response) => {
                if (!response) {
                    return new Response("Offline - Service Unavailable", {
                        status: 503,
                        statusText: "Service Unavailable",
                        headers: new Headers({ "Content-Type": "text/plain" }),
                    });
                }
                return response;
            })
    );
});
