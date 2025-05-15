import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';
import App from '../scripts/pages/app.js';
import CONFIG from '../scripts/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const authLink = document.getElementById('auth-link');
  if (!authLink) {
    console.error('Auth link element not found');
  } else {
    if (localStorage.getItem('token')) {
      authLink.textContent = 'Logout';
      authLink.href = '#/logout';
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      });
    } else {
      authLink.textContent = 'Login';
      authLink.href = '#/login';
    }
  }

  if (!localStorage.getItem('token') && !window.location.hash) {
    window.location.hash = '#/login';
  }

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

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    if (localStorage.getItem('token')) {
      authLink.textContent = 'Logout';
      authLink.href = '#/logout';
    } else {
      authLink.textContent = 'Login';
      authLink.href = '#/login';
    }
    await app.renderPage();
  });
});

// Helper untuk convert base64 public key ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPush(registration) {
  try {
    const applicationServerKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    await fetch(`${CONFIG.BASE_URL}/subscribe`, {
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
