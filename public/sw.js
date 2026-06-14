const CACHE_NAME = "cf2v41-static-v3";
const STATIC_ASSETS = [
  "/",
  "/creneaux",
  "/inscription",
  "/logo-cfvv41.png",
  "/icons/favicon-32.png",
  "/icons/apple-touch-icon.png",
  "/icons/pwa-icon-192.png",
  "/icons/pwa-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => cached || caches.match("/"))
    )
  );
});
