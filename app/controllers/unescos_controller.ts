import type { HttpContext } from '@adonisjs/core/http'
import Unesco from '#models/unesco'
import { dd } from '@adonisjs/core/services/dumper'
import Marker from '#models/marker'

export default class UnescosController {
  /**
   * Display a list of resource
   */
  async index({ view, auth }: HttpContext) {
    await auth.check()
    const unescos = await Unesco.query().exec()

    let markers = null
    if (auth.user) {
      // Gets the user's markers if he's logged in
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }

    // Appel de la vue
    return view.render('pages/home', { unescos, markers })
  }
  async sites({ view }: HttpContext) {
    const unescos = await Unesco.query().exec()
    return view.render('pages/sites', { unescos })
  }
  async bookmarks({ view, auth }: HttpContext) {
    const markers = await Marker.query()
      .where('user_id', auth.user!.id)
      .where('type', 'marked')
      .exec()
    const unescos = await Unesco.query()
      .whereIn(
        'id',
        markers.map((marker) => marker.unescoId)
      )
      .exec()
    return view.render('pages/bookmarks', { unescos })
  }
  async visits({ view, auth }: HttpContext) {
    const markers = await Marker.query()
      .where('user_id', auth.user!.id)
      .where('type', 'visited')
      .exec()
    const unescos = await Unesco.query()
      .whereIn(
        'id',
        markers.map((marker) => marker.unescoId)
      )
      .exec()
    return view.render('pages/visits', { unescos })
  }
  async profile({ view }: HttpContext) {
    return view.render('pages/profile')
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
  async show({ params, view }: HttpContext) {
    const unesco = await Unesco.query().where('id', params.id).firstOrFail()

    return view.render('pages/site', { unesco })
  }

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
