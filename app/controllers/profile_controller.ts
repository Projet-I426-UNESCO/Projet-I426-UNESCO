import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class ProfileController {
  /**
   * Mettre à jour le pseudonyme et/ou l'avatar de l'utilisateur connecté.
   * POST /profile/update
   */
  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.user! //récupère l'utilisateur connecté
    const nickname = request.input('nickname', '').trim() //
    const avatar = request.file('avatar', {
      // Récupère le fichier
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    })

    // --- Valider et mettre à jour le pseudo ---
    if (nickname && nickname !== user.fullName && nickname.length <= 20) {
      const existing = await User.findBy('full_name', nickname) // Vérifie si le pseudo est déjà utilisé
      if (existing) {
        session.flash('editError', 'Ce pseudo est déjà pris.')
        return response.redirect().back()
      }
      user.fullName = nickname // met à jour le pseudo si tout est ok
    } else if (nickname.length > 20) {
      session.flash('editError', 'Votre pseudo ne doit pas dépasser 20 caractères.')
      return response.redirect().back()
    }

    // --- Gérer le téléchargement d'avatar ---
    if (avatar && avatar.isValid) {
      const filename = `${cuid()}.${avatar.extname}` // genère un nom de fichier unique
      await avatar.move(app.publicPath('uploads/avatars'), { name: filename }) // déplace le fichier dans le dossier "public"
      user.avatar = `/uploads/avatars/${filename}` // met à jour le chemin de l'avatar dans la db
    } else if (avatar && !avatar.isValid) {
      session.flash('editError', avatar.errors[0]?.message || 'Fichier invalide.')
      return response.redirect().back()
    }

    await user.save() // sauvegarde
    session.flash('editSuccess', 'Profil mis à jour avec succès.')
    return response.redirect().toRoute('profile.show')
  }
}
