import type { HttpContext } from '@adonisjs/core/http'
import Unesco from '#models/unesco'

export default class UnescosController {
  /**
   * Display a list of resource
   */
  async index({ view }: HttpContext) {
    const unesco = await Unesco.query().orderBy('site', 'asc').exec()

    // Appel de la vue
    return view.render('pages/home', { unesco })
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
