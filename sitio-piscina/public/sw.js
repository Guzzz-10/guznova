/* Service worker mínimo: permite instalar el sitio y abrir "Mi Carnet" sin conexión.
   - Páginas: primero la red, si no hay conexión la última copia guardada.
   - Archivos estáticos (con hash): primero la caché. */
const CACHE = "piscina-v1";
const PRECARGA = ["/mi-carnet"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECARGA)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (/^\/(api|auth|admin|v)\//.test(url.pathname) || url.pathname.startsWith("/admin")) return;

  const estatico = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/iconos/") || url.pathname.startsWith("/imagenes/");
  if (estatico) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && (url.pathname === "/mi-carnet" || url.pathname === "/")) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copia));
          }
          return res;
        })
        .catch(() => caches.match(url.pathname).then((hit) => hit || caches.match("/mi-carnet"))),
    );
  }
});
