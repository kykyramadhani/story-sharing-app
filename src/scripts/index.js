// src/scripts/utils/index.js
import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';
import App from '../scripts/pages/app.js';
import CONFIG from '../scripts/config.js'; // Tambah import

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

  // Registrasi service worker
  if ('serviceWorker' in navigator) {
    try {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          }).catch(error => {
            console.log('Service Worker registration failed:', error);
          });
        });
      }      
      
      console.log('Service worker registered:', reg);

      // Langganan push notification
      if (Notification.permission === 'granted') {
        subscribeToPush(reg);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          subscribeToPush(reg);
        }
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
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

// Fungsi untuk langganan push notification
async function subscribeToPush(reg) {
  try {
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: CONFIG.VAPID_PUBLIC_KEY, // Asumsi ada di config.js
    });

    // Kirim subscription ke server (sesuaikan endpoint API)
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