import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class ProfileController {
  /**
   * Update nickname and/or avatar of the logged-in user.
   * POST /profile/update
   */
  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const nickname = request.input('nickname', '').trim()
    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    })

    // --- Validate and update nickname ---
    if (nickname && nickname !== user.fullName) {
      const existing = await User.findBy('full_name', nickname)
      if (existing) {
        session.flash('editError', 'Ce pseudo est déjà pris.')
        return response.redirect().back()
      }
      user.fullName = nickname
    }

    // --- Handle avatar upload ---
    if (avatar && avatar.isValid) {
      const filename = `${cuid()}.${avatar.extname}`
      await avatar.move(app.publicPath('uploads/avatars'), { name: filename })
      user.avatar = `/uploads/avatars/${filename}`
    } else if (avatar && !avatar.isValid) {
      session.flash('editError', avatar.errors[0]?.message || 'Fichier invalide.')
      return response.redirect().back()
    }

    await user.save()
    session.flash('editSuccess', 'Profil mis à jour avec succès.')
    return response.redirect().toRoute('profile.show')
  }
}
