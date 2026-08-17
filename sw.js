/* Service worker: guarda la app en el móvil para que abra sin conexión.
   Al publicar una versión nueva, sube el número de VERSION. */
const VERSION = "v2";
const CACHE = "entreno-" + VERSION;
const NUCLEO = [
  "./", "./index.html", "./manifest.json",
  "./icon-180.png", "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(NUCLEO))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primero la caché (arranque instantáneo y sin cobertura),
   y en segundo plano se guarda lo que llegue de la red, tipografías incluidas. */
self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request).then(hit => {
      if (hit) return hit;
      return fetch(ev.request).then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
