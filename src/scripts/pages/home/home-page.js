// src/scripts/pages/home/home-page.js
import Api from '../../data/api.js';
import HomePresenter from '../../presenters/home-presenter.js';
import { showFormattedDate } from '../../utils/index.js';
import CONFIG from '../../config.js';
import L from 'leaflet';
import { getFavoriteStories, saveFavoriteStory, removeFavoriteStory, isStoryFavorite, initDb } from '../../utils/indexed-db.js';

export default class HomePage {
  #presenter;

  async render() {
    return `
      <section class="container p-6 mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-pink-600">All Stories</h1>
        <button id="clear-favorites" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2">
          <i data-feather="trash-2"></i> Clear Favorite Stories
        </button>
        <div id="stories-list" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"></div>
        <div id="loading-container" class="text-center"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to #/login');
      window.location.hash = '#/login';
      return;
    }

    this.#presenter = new HomePresenter({
      model: Api,
      view: this,
    });

    await this.#presenter.fetchStories();

    const clearFavoritesButton = document.getElementById('clear-favorites');
    if (clearFavoritesButton) {
      clearFavoritesButton.addEventListener('click', async () => {
        try {
          const db = await initDb();
          const transaction = db.transaction(['favorite-stories'], 'readwrite');
          const store = transaction.objectStore('favorite-stories');
          await store.clear();
          this.showSuccess('Favorite stories cleared successfully!');
          this.displayStories(await this.#presenter.fetchStories());
        } catch (error) {
          this.showError('Failed to clear favorite stories: ' + error.message);
        }
      });
    }

    if (window.feather) {
      window.feather.replace();
    }
  }

  async displayStories(stories) {
    const storiesList = document.getElementById('stories-list');
    if (!stories || stories.length === 0) {
      try {
        const favoriteStories = await getFavoriteStories();
        if (favoriteStories.length > 0) {
          this.#renderStories(favoriteStories);
          this.showSuccess('Loaded favorite stories from cache');
          return;
        }
        storiesList.innerHTML = '<p class="text-gray-600 col-span-full">No stories available. Try adding some to favorites!</p>';
      } catch (error) {
        storiesList.innerHTML = '<p class="text-gray-600 col-span-full">No stories available.</p>';
        console.error('Error loading favorite stories:', error);
      }
      return;
    }

    this.#renderStories(stories);
  }

  async #renderStories(stories) {
    const storiesList = document.getElementById('stories-list');
    storiesList.innerHTML = await Promise.all(stories.map(async (story) => {
      const isFavorite = await isStoryFavorite(story.id);
      return `
        <article class="ml-20 bg-white p-4 rounded-lg shadow relative">
          <img src="${story.photoUrl}" alt="Photo of story by ${story.name}" class="w-full h-48 object-cover rounded">
          <h2 class="text-xl font-semibold mt-2 text-custom-dark-pink">${story.name}</h2>
          <p class="text-gray-600">${story.description.length > 100 ? story.description.substring(0, 100) + '...' : story.description}</p>
          <p class="text-gray-500 text-sm mt-1">${showFormattedDate(story.createdAt)}</p>
          <div id="map-${story.id}" class="w-full h-32 mt-2"></div>
          <button id="favorite-btn-${story.id}" class="favorite-btn absolute top-4 right-4 text-2xl ${isFavorite ? 'favorited' : ''}" data-story-id="${story.id}">
            <i data-feather="heart"></i>
          </button>
        </article>
      `;
    })).then(htmlArray => htmlArray.join(''));

    stories.forEach(story => {
      const lat = parseFloat(story.lat) || -6.2088;
      const lon = parseFloat(story.lon) || 106.8456;
      if (isNaN(lat) || isNaN(lon)) {
        console.error(`Invalid coordinates for story ${story.id}: lat=${lat}, lon=${lon}`);
        return;
      }

      const map = L.map(`map-${story.id}`).setView([lat, lon], 13);

      const streetsLayer = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '© <a href="https://www.maptiler.com/">MapTiler</a>',
        tileSize: 512,
        zoomOffset: -1,
        errorTileUrl: ''
      }).addTo(map);

      const satelliteLayer = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`, {
        attribution: '© <a href="https://www.maptiler.com/">MapTiler</a>',
        tileSize: 512,
        zoomOffset: -1,
        errorTileUrl: ''
      });

      const baseMaps = {
        "Streets": streetsLayer,
        "Satellite": satelliteLayer
      };
      L.control.layers(baseMaps).addTo(map);

      this.prefetchSatelliteTiles(map, lat, lon, 13);

      streetsLayer.on('tileerror', (error) => {
        console.error('Street tile error for story', story.id, error);
        if (!navigator.onLine) {
          document.getElementById(`map-${story.id}`).innerHTML = '<p class="text-red-500">Street map unavailable offline</p>';
        }
      });

      satelliteLayer.on('tileerror', (error) => {
        console.error('Satellite tile error for story', story.id, error);
        if (!navigator.onLine) {
          document.getElementById(`map-${story.id}`).innerHTML = '<p class="text-red-500">Satellite map unavailable offline</p>';
        }
      });

      const defaultIcon = L.icon({
        iconUrl: '../../../../assets/marker-icon.png',
        shadowUrl: '../../../../assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map);
      marker.bindPopup(`<b>${story.name}</b><br>${story.description.substring(0, 50)}...`).openPopup();

      // Event listener untuk tombol favorit
      const favoriteBtn = document.getElementById(`favorite-btn-${story.id}`);
      favoriteBtn.addEventListener('click', async () => {
        const isCurrentlyFavorite = await isStoryFavorite(story.id);
        if (isCurrentlyFavorite) {
          await removeFavoriteStory(story.id);
          favoriteBtn.classList.remove('favorited');
          this.showSuccess(`Removed ${story.name} from favorites`);
        } else {
          await saveFavoriteStory(story);
          favoriteBtn.classList.add('favorited');
          this.showSuccess(`Added ${story.name} to favorites`);
        }
        if (window.feather) window.feather.replace();
      });
    });

    if (window.feather) window.feather.replace();
  }

  prefetchSatelliteTiles(map, lat, lon, zoom = 13) {
    if (!navigator.onLine) return;

    const tempSatelliteLayer = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '© <a href="https://www.maptiler.com/">MapTiler</a>',
      tileSize: 512,
      zoomOffset: -1,
      errorTileUrl: ''
    });

    tempSatelliteLayer.addTo(map);

    setTimeout(() => {
      map.removeLayer(tempSatelliteLayer);
      console.log(`Finished prefetching satellite tiles for lat: ${lat}, lon: ${lon}`);
    }, 2000);

    tempSatelliteLayer.on('tileload', (e) => {
      console.log(`Prefetched satellite tile: ${e.tile.src}`);
    });

    tempSatelliteLayer.on('tileerror', (e) => {
      console.error(`Failed to prefetch satellite tile: ${e.tile.src}`, e);
    });
  }

  showError(message) {
    const storiesList = document.getElementById('stories-list');
    storiesList.innerHTML = `<p class="text-red-600 col-span-full">Failed to load stories: ${message}</p>`;
  }

  showSuccess(message) {
    const storiesList = document.getElementById('stories-list');
    const successDiv = document.createElement('div');
    successDiv.className = 'text-green-600 col-span-full text-center mb-4';
    successDiv.textContent = message;
    storiesList.prepend(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  }

  showLoading() {
    document.getElementById('loading-container').innerHTML = `
      <div class="loader"></div>
    `;
  }

  hideLoading() {
    document.getElementById('loading-container').innerHTML = '';
  }
}