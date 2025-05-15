import L from 'leaflet';
import Api from '../../data/api.js';
import CONFIG from '../../config.js';
import AddStoryPresenter from '../../presenters/add-story-presenter.js';

export default class AddStoryPage {
  #presenter;

  async render() {
    return `
      <section class="container bg-custom-lighter-green p-6 rounded-lg shadow max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-custom-dark-pink">Add New Story</h1>
        <form id="add-story-form">
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-custom-dark-pink">Description</label>
            <textarea id="description" name="description" class="w-full p-2 border border-custom-light-green rounded" required></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-custom-dark-pink">Capture Photo</label>
            <button type="button" id="capture-photo" class="bg-custom-light-pink hover:bg-custom-dark-pink text-white px-4 py-2 rounded flex items-center gap-2">
              <i data-feather="camera"></i> Capture Photo
            </button>
            <video id="camera-stream" class="w-full h-48 object-cover rounded mt-2 hidden" autoplay></video>
            <canvas id="camera-canvas" class="hidden"></canvas>
            <div id="photo-preview-container" class="mt-2 hidden">
              <img id="photo-preview" class="w-full h-48 object-cover rounded" alt="Captured photo preview">
              <button type="button" id="remove-photo" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 mt-2">
                <i data-feather="trash-2"></i> Remove Photo
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-custom-dark-pink">Location (Click on the map to select)</label>
            <div id="map-add" class="w-full h-48"></div>
            <input type="hidden" id="lat" name="lat" aria-label="Latitude">
            <input type="hidden" id="lon" name="lon" aria-label="Longitude">
          </div>
          <button type="submit" class="bg-custom-light-pink hover:bg-custom-dark-pink text-white px-4 py-2 rounded flex items-center gap-2">
            <i data-feather="send"></i> Submit Story
          </button>
        </form>
        <div id="feedback-message" class="hidden text-center mt-4"></div>
      </section>
    `;
  }

  async afterRender() {
    if (!localStorage.getItem('token')) {
      window.location.hash = '#/login';
      return;
    }

    this.#presenter = new AddStoryPresenter({
      model: Api,
      view: this,
    });

    const map = L.map('map-add').setView([-6.2088, 106.8456], 13);

    const streetsLayer = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '© <a href="https://www.maptiler.com/">MapTiler</a>',
      tileSize: 512,
      zoomOffset: -1,
      errorTileUrl: ''
    });

    const satelliteLayer = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`, {
      attribution: '© <a href="https://www.maptiler.com/">MapTiler</a>',
      tileSize: 512,
      zoomOffset: -1,
      errorTileUrl: ''
    });

    streetsLayer.addTo(map);

    const baseMaps = {
      "Streets": streetsLayer,
      "Satellite": satelliteLayer
    };
    L.control.layers(baseMaps).addTo(map);

    streetsLayer.on('tileerror', (error) => {
      console.error('Street tile loading error:', error);
      alert('Failed to load street map tiles. Please check your MapTiler API key or network connection.');
    });

    satelliteLayer.on('tileerror', (error) => {
      console.error('Satellite tile loading error:', error);
      alert('Failed to load satellite map tiles. Please check your MapTiler API key or network connection.');
    });

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const markerGroup = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      markerGroup.clearLayers();
      L.marker([lat, lng], { icon: defaultIcon }).addTo(markerGroup);
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lng;
      console.log('Location selected:', { lat, lng });
    });

    let stream = null;
    let capturedPhoto = null;
    let isCameraActive = false;
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('camera-canvas');
    const captureButton = document.getElementById('capture-photo');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const removePhotoButton = document.getElementById('remove-photo');

    captureButton.addEventListener('click', async () => {
      if (!isCameraActive) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.classList.remove('hidden');
          photoPreviewContainer.classList.add('hidden');

          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play();
              resolve();
            };
          });

          isCameraActive = true;
          captureButton.innerHTML = '<i data-feather="camera"></i> Take Photo';
          if (window.feather) {
            window.feather.replace();
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          alert('Failed to access camera. Please ensure camera access is enabled.');
          return;
        }
      } else {
        try {
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            alert('Camera is not ready. Please try again.');
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 500));

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          const imageDataUrl = canvas.toDataURL('image/png');

          console.log('imageDataUrl:', imageDataUrl);
          if (!imageDataUrl || imageDataUrl === 'data:,') {
            alert('Failed to capture image data. Please try again.');
            return;
          }

          const blob = await (await fetch(imageDataUrl)).blob();
          capturedPhoto = new File([blob], 'captured-photo.png', { type: 'image/png' });

          if (!photoPreview) {
            console.error('Photo preview element not found');
            return;
          }

          photoPreview.src = imageDataUrl;
          photoPreviewContainer.classList.remove('hidden');

          console.log('photoPreview.src set to:', photoPreview.src);
          console.log('photoPreviewContainer classList:', photoPreviewContainer.classList);

          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
          }
          video.classList.add('hidden');
          isCameraActive = false;
          captureButton.innerHTML = '<i data-feather="camera"></i> Capture Photo';
          if (window.feather) {
            window.feather.replace();
          }
        } catch (error) {
          console.error('Error capturing photo:', error);
          alert('Failed to capture photo. Please try again.');
        }
      }
    });

    removePhotoButton.addEventListener('click', () => {
      capturedPhoto = null;
      photoPreviewContainer.classList.add('hidden');
    });

    const form = document.getElementById('add-story-form');
    if (!form) {
      console.error('Add story form not found');
      return;
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const description = document.getElementById('description').value;
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;

      if (!capturedPhoto) {
        this.showError('Please capture a photo using the camera');
        return;
      }

      if (!lat || !lon) {
        this.showError('Please select a location by clicking on the map');
        return;
      }

      console.log('Submitting story with data:', { description, photo: capturedPhoto, lat, lon });

      await this.#presenter.addStory({
        description,
        photo: capturedPhoto,
        lat,
        lon,
      });

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.classList.add('hidden');
        isCameraActive = false;
      }

      capturedPhoto = null;
      photoPreviewContainer.classList.add('hidden');
    });

    if (window.feather) {
      window.feather.replace();
    }
  }

  showSuccess(message) {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.classList.remove('hidden');
    feedbackMessage.classList.add('text-green-600');
  }

  showError(message) {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.classList.remove('hidden');
    feedbackMessage.classList.add('text-red-600');
  }
}