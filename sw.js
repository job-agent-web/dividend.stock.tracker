const cacheName = "dividend-stock-tracker-v1";
const coreAssets = [
  "signin.html",
  "signup.html",
  "index.html",
  "styles.css",
  "signup.js",
  "app.js",
  "online-dividend-universe.js",
  "manifest.webmanifest",
  "app-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(coreAssets)).catch(() => null)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("signin.html")))
  );
});
