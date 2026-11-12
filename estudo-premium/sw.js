/* Service worker simples: guarda o "esqueleto" do app para abrir rápido e funcionar com internet ruim.
   O catálogo (data/catalogo.json) é sempre buscado na rede primeiro. */
var V = "aluno-v6";
var SHELL = ["./", "index.html", "styles.css", "app.js", "visualizador.html", "data/catalogo.js", "manifest.webmanifest", "assets/icon.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || /\.pdf$/i.test(url.pathname)) return;
  var rede = /data\/catalogo\.json$/.test(url.pathname) || /\.(js|css|html)$/.test(url.pathname) || url.pathname.slice(-1) === "/";
  if (rede) {
    e.respondWith(fetch(req).then(function (r) {
      var copy = r.clone(); caches.open(V).then(function (c) { c.put(req, copy); }); return r;
    }).catch(function () { return caches.match(req); }));
  } else {
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (r) {
        var copy = r.clone(); caches.open(V).then(function (c) { c.put(req, copy); }); return r;
      });
    }));
  }
});
