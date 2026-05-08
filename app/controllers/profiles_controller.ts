import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async edit({ view, auth }: HttpContext) {
    return view.render('pages/edit', {
      user: auth.user,
    })
  }

  async update({ request, auth, response }: HttpContext) {
    const user = auth.user!

    const data = request.only(['fullName', 'email', 'avatarUrl'])

    user.fullName = data.fullName
    user.email = data.email
    user.avatarUrl = data.avatarUrl

    await user.save()

    return response.redirect().toPath('/profile')
  }
}