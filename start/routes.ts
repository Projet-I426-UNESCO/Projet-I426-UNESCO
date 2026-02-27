/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import UnescosController from '#controllers/unescos_controller'
import router from '@adonisjs/core/services/router'

router.get('/', [UnescosController, 'index']).as('home')
