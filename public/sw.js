/*
 * Planly service worker.
 *
 * Exists so Chrome will offer to install the app: its criteria are a manifest
 * plus a service worker that can answer a navigation while offline.
 *
 * Deliberately minimal about caching. The only thing ever stored is the
 * offline fallback page — no HTML, JS or CSS belonging to the app is cached,
 * so a deploy can never be masked by a stale copy. Anything that isn't a
 * navigation is not intercepted at all and goes straight to the network.
 */

const VERSION = "planly-offline-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(VERSION).then((cache) => cache.add(OFFLINE_URL)),
    );
    // Take over immediately rather than waiting for every tab to close.
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== VERSION)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Only page navigations are handled. Returning without calling
    // respondWith() leaves the request completely untouched, which is what
    // every asset request wants.
    if (request.method !== "GET" || request.mode !== "navigate") return;

    // Network first, always: the cache is a fallback for being offline, never
    // a source of app content.
    event.respondWith(
        fetch(request).catch(() =>
            caches.match(OFFLINE_URL, { ignoreSearch: true }),
        ),
    );
});
