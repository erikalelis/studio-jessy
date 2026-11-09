/* Jessy Studio: funciona sin conexión. Subí el número de versión cuando cambies la app. */
var V = "studio-jessy-v13";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  var ok = u.origin === location.origin || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (!ok) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(function (res) {
      var cp = res.clone(); caches.open(V).then(function (c) { c.put("./index.html", cp); }); return res;
    }).catch(function () { return caches.match("./index.html"); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) {
    var net = fetch(r).then(function (res) {
      if (res && (res.ok || res.type === "opaque")) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
