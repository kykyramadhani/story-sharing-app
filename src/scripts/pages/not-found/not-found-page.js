// src/scripts/pages/not-found/not-found-page.js
export default class NotFoundPage {
    async render() {
      return `
        <section class="container p-6 mx-auto text-center">
          <h1 class="text-3xl font-bold mb-4 text-custom-dark-pink">404 - Page Not Found</h1>
          <p class="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <a href="#/home" class="bg-custom-light-pink hover:bg-custom-dark-pink text-white px-4 py-2 rounded inline-flex items-center gap-2">
            <i data-feather="home"></i> Back to Home
          </a>
        </section>
      `;
    }
  
    async afterRender() {
      if (window.feather) {
        window.feather.replace();
      }
    }
  } 