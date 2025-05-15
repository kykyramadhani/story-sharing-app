importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: true });

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

workbox.routing.registerRoute(
  new RegExp('https://story-api.dicoding.dev/v1/stories.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
  })
);

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Test Notification', body: 'This is a test!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/public/images/icon-192x192.png',
    })
  );
});