/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import LoginController from '#controllers/auth/login_controller'
import LogoutController from '#controllers/auth/logout_controller'
import RegisterController from '#controllers/auth/register_controller'
import UnescosController from '#controllers/unescos_controller'
import AuthMiddleware from '#middleware/auth_middleware'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import MarkersController from '#controllers/markers_controller'

router.get('/', [UnescosController, 'index']).as('home')
router.get('/sites', [UnescosController, 'sites']).as('sites')
router.get('/bookmarks', [UnescosController, 'bookmarks']).as('bookmarks').use(middleware.auth())
router.get('/visits', [UnescosController, 'visits']).as('visits').use(middleware.auth())
router.get('/profile', [UnescosController, 'profile']).as('profile.show').use(middleware.auth())

router.get('/site/:id', [UnescosController, 'show']).as('site.show')

router.post('/marker/add/visited/:unescoId', [MarkersController, 'visit']).as('marker.visit')
router.post('/marker/add/marked/:unescoId', [MarkersController, 'mark']).as('marker.mark')

router
  .group(() => {
    router
      .get('/register', [RegisterController, 'show'])
      .as('register.show')
      .use(middleware.guest())
    router
      .post('/register', [RegisterController, 'store'])
      .as('register.store')
      .use(middleware.guest())

    router.get('/login', [LoginController, 'show']).as('login.show').use(middleware.guest())
    router.post('/login', [LoginController, 'store']).as('login.store').use(middleware.guest())

    router.post('/logout', [LogoutController, 'handle']).as('logout').use(middleware.auth())
  })
  .as('auth')


router
  .get('/lang/:locale', async ({ params, response }) => {
    const locale = params.locale
    // Setup cookie for 30 days
    response.cookie('locale', locale, { maxAge: '30 days' })
    response.redirect().back()
  })
  .as('lang.switch')