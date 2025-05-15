importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: true });

workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/app.bundle.js', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/styles.css', revision: '1' },
  { url: '/public/images/icon-192x192.png', revision: '1' },
]);

workbox.routing.registerRoute(
  new RegExp('https://story-api.dicoding.dev/v1/stories.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 300,
      }),
    ],
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
