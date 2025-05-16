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
      '#/not-found': () => new NotFoundPage(),
    };

    window.addEventListener('hashchange', () => this.renderPage());
  }

  async renderPage() {
    const hash = window.location.hash || '#/home';
    const route = this.routes[hash] || this.routes['#/not-found'];
    const page = route();

    if (this.mainContent && this.mainContent.children.length > 0) {
      await this.mainContent.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        easing: 'ease-in-out',
      }).finished;
    }

    this.mainContent.innerHTML = await page.render();
    await page.afterRender();

    this.setupDrawer();

    this.mainContent.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: 'ease-in-out',
    });

    if (window.feather) window.feather.replace();
    this.updateAuthLink();
  }

  setupDrawer() {
    const drawerButton = document.getElementById('drawer-button');
    const navigationDrawer = document.getElementById('navigation-drawer');

    if (!drawerButton || !navigationDrawer) return;

    // Toggle drawer
    drawerButton.addEventListener('click', () => {
      console.log('Drawer clicked');
      navigationDrawer.classList.toggle('translate-x-0');
      navigationDrawer.classList.toggle('-translate-x-full');
    });

    // Close drawer saat klik luar
    document.addEventListener('click', (e) => {
      if (!navigationDrawer.contains(e.target) && !drawerButton.contains(e.target) && !navigationDrawer.classList.contains('-translate-x-full')) {
        navigationDrawer.classList.remove('translate-x-0');
        navigationDrawer.classList.add('-translate-x-full');
      }
    });

    // Close drawer saat klik link
    navigationDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navigationDrawer.classList.remove('translate-x-0');
        navigationDrawer.classList.add('-translate-x-full');
      });
    });

    // Logout listener
    const authLink = document.getElementById('auth-link');
    if (authLink && authLink.textContent === 'Logout') {
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    const token = localStorage.getItem('token');

    if (!authLink) return;

    if (token) {
      authLink.textContent = 'Logout';
      authLink.href = '#/logout';
    } else {
      authLink.textContent = 'Login';
      authLink.href = '#/login';
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.updateAuthLink();
    window.location.hash = '#/login';
  }
}