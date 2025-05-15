export default class RegisterPresenter {
    #model;
    #view;
  
    constructor({ model, view }) {
      this.#model = model;
      this.#view = view;
    }
  
    async register({ name, email, password }) {
      try {
        await this.#model.register({ name, email, password });
        this.#view.showSuccess('Registration successful! Please login.');
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1000);
      } catch (error) {
        this.#view.showError(`Registration failed: ${error.message}`);
      }
    }
  }