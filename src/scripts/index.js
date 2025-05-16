import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';
import App from './pages/app.js';
import CONFIG from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();

  // Jika belum login, arahkan ke login
  if (!localStorage.getItem('token') && !window.location.hash) {
    window.location.hash = '#/login';
  }

  // Registrasi Service Worker + Push Notification
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(async (registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          if (Notification.permission === 'granted') {
            await subscribeToPush(registration);
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              await subscribeToPush(registration);
            }
          }
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

  // Render halaman awal
  await app.renderPage();
});

async function subscribeToPush(registration) {
  try {
    const convertedVapidKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(subscription),
    });

    console.log('Subscribed to push notifications');
  } catch (error) {
    console.error('Push subscription failed:', error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}