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

router.get('/', [UnescosController, 'index']).as('home').use(middleware.guest())

router.get('/profile', [UnescosController, 'profile']).as('profile.show').use(middleware.auth())

router.get('/site/:id', [UnescosController, 'show']).as('site.show')

router
  .group(() => {
    router.get('/register', [RegisterController, 'show']).as('register.show').use(middleware.guest())
    router.post('/register', [RegisterController, 'store']).as('register.store').use(middleware.guest())

    router.get('/login', [LoginController, 'show']).as('login.show').use(middleware.guest())
    router.post('/login', [LoginController, 'store']).as('login.store').use(middleware.guest())

    router.post('/logout', [LogoutController, 'handle']).as('logout').use(middleware.auth())
  })
  .as('auth')
