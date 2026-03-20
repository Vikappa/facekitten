const SW_VERSION = "v2";
const STATIC_CACHE = `facekitten-static-${SW_VERSION}`;
const ASSETS_CACHE = `facekitten-assets-${SW_VERSION}`;
const RUNTIME_CACHE = `facekitten-runtime-${SW_VERSION}`;

const APP_SHELL = ["/manifest.webmanifest", "/img/facekittenlogo.png"];

// Precache completo di public/assets per render immediato nei componenti React.
const ASSETS_TO_PRECACHE = [
  "/assets/blankprofile.png",
  "/assets/fonts/klavika-bold-italic.otf",
  "/assets/fonts/klavika-bold.otf",
  "/assets/fonts/klavika-light-italic.otf",
  "/assets/fonts/klavika-light.otf",
  "/assets/fonts/klavika-medium-italic.otf",
  "/assets/fonts/klavika-medium.otf",
  "/assets/fonts/klavika-regular-italic.otf",
  "/assets/grumpy-cat-background-facebook-cover.jpg",
  "/assets/messengerEffect.m4a",
  "/assets/notificationEffect.m4a",
  "/assets/reactionsIcons/0.png",
  "/assets/reactionsIcons/1.png",
  "/assets/reactionsIcons/2.png",
  "/assets/reactionsIcons/3.png",
  "/assets/reactionsIcons/4.png",
  "/assets/reactionsIcons/5.png",
  "/assets/reactionsIcons/6.png",
  "/assets/reactionsIcons/7.png",
  "/assets/reactionsIcons/8.png",
  "/assets/reactionsIcons/9.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll(APP_SHELL);

      const assetsCache = await caches.open(ASSETS_CACHE);
      await assetsCache.addAll(ASSETS_TO_PRECACHE);
    })()
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const validCaches = new Set([STATIC_CACHE, ASSETS_CACHE, RUNTIME_CACHE]);

      await Promise.all(
        cacheKeys
          .filter((key) => !validCaches.has(key))
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image" ||
    request.destination === "audio"
  ) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        void cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response("Offline", { status: 503, statusText: "Offline" });
}
