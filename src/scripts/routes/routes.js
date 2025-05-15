import LoginPage from '../../scripts/pages/login/login-page';
import RegisterPage from '../../scripts/pages/register/register-page';
import HomePage from '../../scripts/pages/home/home-page';
import AddStoryPage from '../../scripts/pages/add-story/add-story-page';

const routes = {
  '/': new HomePage(),
  '/home': new HomePage(),
  '/add-story': new AddStoryPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/logout': new HomePage(),
};

export default routes;