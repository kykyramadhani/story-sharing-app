importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: true });

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

workbox.routing.registerRoute(
  new RegExp('https://story-api.dicoding.dev/v1/stories.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
  })
);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Story Notification', body: 'Anda memiliki notifikasi baru.' };

  if (event.data) {
    try {
      const json = event.data.json();

      data.title = json.title || data.title;
      data.body = (json.options && json.options.body) || data.body;
    } catch (err) {
      console.error('Error parsing push event data:', err);
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'open_app',
        title: 'Buka Aplikasi',
        icon: '/assets/icon-192x192.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
