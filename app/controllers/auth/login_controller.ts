import User from '#models/user'
import { loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { dd } from '@adonisjs/core/services/dumper'

export default class LoginController {
  async show({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async store({ request, response, auth }: HttpContext) {
    const { fullName, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(fullName, password)

    await auth.use('web').login(user)

    return response.redirect().toPath('/')
  }
}
