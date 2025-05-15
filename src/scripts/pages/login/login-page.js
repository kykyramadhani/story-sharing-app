import Api from '../../data/api.js';
import LoginPresenter from '../../presenters/login-presenter.js';

export default class LoginPage {
  #presenter;

  async render() {
    return `
      <section class="container bg-custom-lighter p-6 rounded-lg shadow max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-custom-dark-pink">Login</h1>
        <form id="login-form">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-custom-dark-pink">Email</label>
            <input type="email" id="email" name="email" class="w-full p-2 border border-green-300 rounded" required>
          </div>
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-custom-dark-pink">Password</label>
            <input type="password" id="password" name="password" class="w-full p-2 border border-green-300 rounded" required>
          </div>
          <button type="submit" class="bg-custom-light-pink hover:bg-custom-dark-pink text-white px-4 py-2 rounded flex items-center gap-2">
            <i data-feather="log-in"></i> Login
          </button>
          <p class="text-center mt-2">Belum punya akun? <a href="#/register" class="text-custom-dark-pink hover:underline">Daftar</a></p>
        </form>
        <div id="feedback-message" class="hidden text-center mt-4"></div>
      </section>
    `;
  }

  async afterRender() {
    if (localStorage.getItem('token')) {
      window.location.hash = '#/home';
      return;
    }

    this.#presenter = new LoginPresenter({
      model: Api,
      view: this,
    });

    const form = document.getElementById('login-form');
    if (!form) {
      console.error('Login form not found');
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      await this.#presenter.login({ email, password });
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