// src/scripts/utils/indexed-db.js
const DB_NAME = 'story-sharing-app';
const DB_VERSION = 1;
const STORE_NAME = 'favorite-stories';

let dbPromise;

function initDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }
  return dbPromise;
}

// Menyimpan story sebagai favorit
export async function saveFavoriteStory(story) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(story);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Mendapatkan semua story favorit
export async function getFavoriteStories() {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Menghapus story dari favorit
export async function removeFavoriteStory(storyId) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(storyId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Mengecek apakah story sudah ada di favorit
export async function isStoryFavorite(storyId) {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(storyId);

    request.onsuccess = () => {
      resolve(!!request.result);
    };
    request.onerror = () => reject(request.error);
  });
}