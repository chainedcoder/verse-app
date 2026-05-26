// Verse — Service Worker
// Caches the app shell for offline support

const CACHE_NAME = "verse-v1"
const APP_SHELL = [
  "/",
  "/offline",
]

// Install: pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL)
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// Fetch: network-first for navigation, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  // Skip API routes and Next.js internal routes
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return

  if (request.mode === "navigate") {
    // Network-first for page navigation
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match("/offline")
        return cached || new Response("<h1>Offline</h1>", {
          headers: { "Content-Type": "text/html" },
        })
      })
    )
  } else {
    // Stale-while-revalidate for assets (fonts, icons, images)
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        }).catch(() => cached)
        return cached || networkFetch
      })
    )
  }
})
