const CACHE_NAME = "AlmaW3eza";
const MAX_ENTRIES = 1000;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const removeCount = keys.length - maxItems;
    for (let i = 0; i < removeCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return event.respondWith(fetch(req));
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache
                .put(req, copy)
                .then(() => trimCache(CACHE_NAME, MAX_ENTRIES));
            });
          }
          return networkRes;
        })
        .catch(() => {
          if (req.mode === "navigate") {
            return new Response(
              "<h1>خطأ في الاتصال</h1><p>حاول مرة تانية لاحقًا.</p>",
              { headers: { "Content-Type": "text/html" }, status: 503 }
            );
          }
          return new Response(JSON.stringify({ error: "Network timeout" }), {
            headers: { "Content-Type": "application/json" },
            status: 408,
          });
        });
    })
  );
});
