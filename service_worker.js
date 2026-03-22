const CACHE_NAME = "disciplina-pro-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./i18n.js", // Adicionado para garantir o funcionamento offline
  "./app.js",
  "./favicon.svg",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching App Shell");
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("Service Worker: Deleting old cache", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Estratégia "Cache-first, com fallback inteligente para offline"
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se o recurso estiver no cache, retorna-o imediatamente.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não, busca na rede.
      return fetch(event.request)
        .then((networkResponse) => {
          // Se a busca for bem-sucedida, armazena uma cópia no cache para uso futuro.
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          // Retorna a resposta da rede.
          return networkResponse;
        })
        .catch(() => {
          // Se a busca na rede falhar (offline), serve a página principal.
          // Isso só é feito para requisições de navegação, não para imagens ou outros assets.
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
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
