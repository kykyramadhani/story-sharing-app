import Api from '../../data/api.js';
import RegisterPresenter from '../../presenters/register-presenter.js';

export default class RegisterPage {
  #presenter;

  async render() {
    return `
      <section class="container bg-custom-lighter-green p-6 rounded-lg shadow max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-custom-dark-pink">Register</h1>
        <form id="register-form">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-custom-dark-pink">Name</label>
            <input type="text" id="name" name="name" class="w-full p-2 border border-custom-light-green rounded" required>
          </div>
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-custom-dark-pink">Email</label>
            <input type="email" id="email" name="email" class="w-full p-2 border border-custom-light-green rounded" required>
          </div>
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-custom-dark-pink">Password</label>
            <input type="password" id="password" name="password" class="w-full p-2 border border-custom-light-green rounded" minlength="8" required>
          </div>
          <button type="submit" class="bg-custom-light-pink hover:bg-custom-dark-pink text-white px-4 py-2 rounded flex items-center gap-2">
            <i data-feather="user-plus"></i> Register
          </button>
        </form>
        <div id="feedback-message" class="hidden text-center mt-4"></div>
        <p class="text-center mt-4">Sudah punya akun? <a href="#/login" class="text-custom-dark-pink hover:underline">Login</a></p>
      </section>
    `;
  }

  async afterRender() {
    if (localStorage.getItem('token')) {
      window.location.hash = '#/home';
      return;
    }

    this.#presenter = new RegisterPresenter({
      model: Api,
      view: this,
    });

    const form = document.getElementById('register-form');
    if (!form) {
      console.error('Register form not found');
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      await this.#presenter.register({ name, email, password });
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