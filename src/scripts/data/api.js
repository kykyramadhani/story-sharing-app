import CONFIG from '../config.js';

export default class Api {
  static async login({ email, password }) {
    try {
      console.log('Fetching login with URL:', `${CONFIG.BASE_URL}/login`);
      console.log('Request body:', { email, password });
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        // credentials: 'include',
      });
  
      const data = await response.json();
      console.log('Login response:', data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
  
      if (data.loginResult && data.loginResult.token) {
        localStorage.setItem('token', data.loginResult.token);
      } else {
        console.warn('Token not found in login response');
      }
  
      return data;
    } catch (error) {
      console.error('Fetch error in login:', error);
      throw error;
    }
  }

  static async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }

    return data;
  }

  static async addStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    formData.append('lat', lat);
    formData.append('lon', lon);

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add story');
    }

    return data;
  }

  static async getStories() {
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stories');
    }

    return data;
  }
}