const CACHE_NAME = "disciplina-pro-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./favicon.svg",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Disciplina PRO", body: "Lembrete: complete suas metas de hoje! 💪" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // Usa o padrão se o payload falhar
  }

  const options = {
    body: data.body,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || self.location.origin;

  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    if (clientList.length > 0) return clientList[0].focus();
    if (clients.openWindow) return clients.openWindow(urlToOpen);
  }));
});
