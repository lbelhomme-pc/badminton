const CACHE_NAME = "cfvv-static-v1";
const STATIC_ASSETS = [
  "/",
  "/creneaux",
  "/inscription",
  "/vie-du-club/evenements",
  "/icons/favicon-32.png",
  "/icons/apple-touch-icon.png",
  "/icons/pwa-icon-192.png",
  "/icons/pwa-icon-512.png"
];

const PRIVATE_PATHS = [
  "/admin",
  "/api",
  "/auth",
  "/compte",
  "/documents",
  "/espace-adherent",
  "/commande-volants",
  "/mes-reservations",
  "/reservation-creneau"
];

function isPrivateOrDynamicRequest(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return true;
  if (PRIVATE_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) return true;
  if (request.headers.get("authorization")) return true;
  if (request.headers.get("accept")?.includes("application/json")) return true;
  return false;
}

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
  if (isPrivateOrDynamicRequest(event.request)) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});
