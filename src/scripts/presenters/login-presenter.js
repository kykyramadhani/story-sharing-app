export default class LoginPresenter {
    #model;
    #view;
  
    constructor({ model, view }) {
      this.#model = model;
      this.#view = view;
    }
  
    async login({ email, password }) {
      try {
        const response = await this.#model.login({ email, password });
        if (response.error) {
          throw new Error(response.message || 'Failed to login');
        }
        this.#view.showSuccess('Login successful!');
        console.log('Redirecting to #/home in 1 second...');
        setTimeout(() => {
          console.log('Executing redirect to #/home');
          window.location.hash = '#/home';
        }, 1000);
      } catch (error) {
        this.#view.showError(`Login failed: ${error.message}`);
      }
    }
  }