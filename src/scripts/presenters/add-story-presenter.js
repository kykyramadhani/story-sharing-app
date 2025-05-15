export default class AddStoryPresenter {
    #model;
    #view;
  
    constructor({ model, view }) {
      this.#model = model;
      this.#view = view;
    }
  
    async addStory({ description, photo, lat, lon }) {
      try {
        const result = await this.#model.addStory({
          description,
          photo,
          lat: lat ? parseFloat(lat) : undefined,
          lon: lon ? parseFloat(lon) : undefined,
        });
  
        if (!result.error) {
          this.#view.showSuccess('Story added successfully!');
          setTimeout(() => {
            window.location.hash = '#/home';
          }, 1000);
        } else {
          this.#view.showError(`Failed to add story: ${result.message}`);
        }
      } catch (error) {
        this.#view.showError(`Failed to add story: ${error.message}`);
      }
    }
  }