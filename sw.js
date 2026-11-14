// Keeps the games working with no internet after the first visit.
const CACHE = "hg-v11-2026-11-13";
const FILES = ["./", "index.html", "privacy.html", "terms.html", "credits.html", "icon-180.png", "icon-512.png", "manifest.webmanifest", "telemetry.js", "analytics-config.js", "cards/", "cards/index.html", "cards/manifest.webmanifest", "cards/icon-180.png", "cards/icon-512.png", "dama/", "dama/index.html", "dama/manifest.webmanifest", "dama/icon-180.png", "dama/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new URL(f, self.registration.scope).href))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf("hg-") === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net;
    return r || new Response("Offline", { status: 503 });
  }));
});
