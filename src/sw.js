// sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: true });

// Precache aset yang dihasilkan oleh Webpack
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Cache strategi untuk API (contoh)
workbox.routing.registerRoute(
  new RegExp('https://your-api-url.com/.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
  })
);

// Event listener untuk push notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Test Notification', body: 'This is a test!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/public/images/icon-192x192.png',
    })
  );
});