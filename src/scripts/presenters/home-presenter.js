export default class HomePresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async fetchStories() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await this.#model.getStories();
      if (response.error) {
        throw new Error(response.message || 'Failed to fetch stories');
      }

      this.#view.displayStories(response.listStory);
    } catch (error) {
      this.#view.showError(`Failed to load stories: ${error.message}`);
    }
  }
}