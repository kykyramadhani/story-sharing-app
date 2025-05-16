import HomePage from './home/home-page.js';
import AddStoryPage from './add-story/add-story-page.js';
import LoginPage from './login/login-page.js';
import RegisterPage from './register/register-page.js';
import NotFoundPage from './not-found/not-found-page.js';

export default class App {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.routes = {
      '#/home': () => new HomePage(),
      '#/add-story': () => new AddStoryPage(),
      '#/login': () => new LoginPage(),
      '#/register': () => new RegisterPage(),
    };
    window.addEventListener('hashchange', () => this.renderPage());
  }

  async renderPage() {
    const hash = window.location.hash || '#/home';
    const page = this.routes[hash]?.() || new NotFoundPage();

    this.mainContent.innerHTML = await page.render();
    await page.afterRender();

    this.setupDrawer();
    this.updateAuthLink();
    if (window.feather) window.feather.replace();
  }

  setupDrawer() {
    const drawer = document.getElementById('drawer');
    const button = document.getElementById('drawer-button');
    const overlay = document.getElementById('overlay');

    const openDrawer = () => {
      drawer.classList.remove('-translate-x-full');
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-50');
    };

    const closeDrawer = () => {
      drawer.classList.add('-translate-x-full');
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-50');
    };

    button.onclick = openDrawer;
    overlay.onclick = closeDrawer;

    document.querySelectorAll('#drawer a').forEach(link =>
      link.addEventListener('click', closeDrawer)
    );
  }

  updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    const token = localStorage.getItem('token');

    if (!authLink) return;

    if (token) {
      authLink.textContent = 'Logout';
      authLink.href = '#/logout';
      authLink.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        this.updateAuthLink();
        window.location.hash = '#/login';
      };
    } else {
      authLink.textContent = 'Login';
      authLink.href = '#/login';
    }
  }
}
