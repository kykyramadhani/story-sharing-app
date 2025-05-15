// src/scripts/app.js
import HomePage from '../pages/home/home-page.js';
import AddStoryPage from '../pages/add-story/add-story-page.js';
import LoginPage from '../pages/login/login-page.js';
import RegisterPage from '../pages/register/register-page.js';
import NotFoundPage from '../pages/not-found/not-found-page.js'; // Tambah import

export default class App {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.routes = {
      '#/home': () => new HomePage(),
      '#/add-story': () => new AddStoryPage(),
      '#/login': () => new LoginPage(),
      '#/register': () => new RegisterPage(),
      '#/not-found': () => new NotFoundPage(), // Tambah rute
    };
    this.authLink = document.getElementById('auth-link');
    this.drawerButton = document.getElementById('drawer-button');
    this.navigationDrawer = document.getElementById('navigation-drawer');
    this.init();
  }

  init() {
    this.updateAuthLink();

    window.addEventListener('hashchange', () => this.renderPage());
    this.renderPage();

    this.drawerButton.addEventListener('click', () => {
      this.navigationDrawer.classList.toggle('-translate-x-full');
      this.navigationDrawer.classList.toggle('translate-x-0');
    });

    document.addEventListener('click', (e) => {
      if (!this.navigationDrawer.contains(e.target) && !this.drawerButton.contains(e.target)) {
        this.navigationDrawer.classList.add('-translate-x-full');
        this.navigationDrawer.classList.remove('translate-x-0');
      }
    });

    this.navigationDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.navigationDrawer.classList.add('-translate-x-full');
        this.navigationDrawer.classList.remove('translate-x-0');
      });
    });

    this.authLink.addEventListener('click', (e) => {
      if (this.authLink.textContent === 'Logout') {
        e.preventDefault();
        this.logout();
      }
    });
  }

  updateAuthLink() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authLink.textContent = 'Logout';
      this.authLink.href = '#/logout';
    } else {
      this.authLink.textContent = 'Login';
      this.authLink.href = '#/login';
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.updateAuthLink();
    window.location.hash = '#/login';
  }

  async renderPage() {
    const hash = window.location.hash || '#/home';
    const route = this.routes[hash] || this.routes['#/not-found']; // Default ke Not Found
    const page = route();

    if (this.mainContent && this.mainContent.children.length > 0) {
      await this.mainContent.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        easing: 'ease-in-out',
      }).finished;
    }

    this.mainContent.innerHTML = await page.render();
    await page.afterRender();

    this.mainContent.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: 'ease-in-out',
    });

    if (window.feather) window.feather.replace();
    this.updateAuthLink();
  }
}