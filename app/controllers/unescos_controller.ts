import type { HttpContext } from '@adonisjs/core/http'
import Unesco from '#models/unesco'
import Marker from '#models/marker'

export default class UnescosController {
  async index({ view, auth }: HttpContext) {
    await auth.check()
    const unescos = await Unesco.query().exec()

    let markers = null
    if (auth.user) {
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }

    return view.render('pages/home', { unescos, markers })
  }

  async sites({ view }: HttpContext) {
    const unescos = await Unesco.query().exec()
    return view.render('pages/sites', { unescos })
  }

  async bookmarks({ view, auth }: HttpContext) {
    await auth.check()

    let markedUnescos: Unesco[] = []
    if (auth.user) {
      const markers = await Marker.query()
        .where('user_id', auth.user.id)
        .where('is_marked', true)
        .preload('unesco')

      markedUnescos = markers.map((marker) => marker.unesco)
    }

    return view.render('pages/bookmarks', { markedUnescos })
  }

  async visits({ view, auth }: HttpContext) {
    await auth.check()

    let visitedUnescos: Unesco[] = []
    if (auth.user) {
      const markers = await Marker.query()
        .where('user_id', auth.user.id)
        .where('is_visited', true)
        .preload('unesco')

      visitedUnescos = markers.map((marker) => marker.unesco)
    }

    return view.render('pages/visits', { visitedUnescos })
  }

  async profile({ view, auth }: HttpContext) {
    const userId = auth.user!.id

    const markers = await Marker.query().where('user_id', userId).preload('unesco')

    const visitedMarkers = markers.filter((m) => m.isVisited)
    const markedMarkers = markers.filter((m) => m.isMarked)

    const totalSites = await Unesco.query().count('* as total').first()
    const totalCount = totalSites ? totalSites.$extras.total : 0

    const lastVisit =
      visitedMarkers.length > 0 ? visitedMarkers[visitedMarkers.length - 1].unesco : null

    const visitsByRegion: Record<string, number> = {}
    visitedMarkers.forEach((marker) => {
      if (marker.unesco && marker.unesco.region) {
        visitsByRegion[marker.unesco.region] = (visitsByRegion[marker.unesco.region] || 0) + 1
      }
    })

    const completionPercentage =
      totalCount > 0 ? Math.round((visitedMarkers.length / totalCount) * 100 * 10) / 10 : 0

    const allRegions = await Unesco.query().whereNotNull('region').select('region').distinct()

    const regionStats: Array<{
      region: string
      visited: number
      total: number
      percentage: number
      colorIndex: number
    }> = []

    allRegions.forEach((row, index) => {
      if (row.region) {
        const visited = visitsByRegion[row.region] || 0
        regionStats.push({
          region: row.region,
          visited,
          total: 0,
          percentage: 0,
          colorIndex: (index % 6) + 1,
        })
      }
    })

    for (const stat of regionStats) {
      const total = await Unesco.query().where('region', stat.region).count('* as count').first()
      const totalInRegion = total ? total.$extras.count : 0
      stat.total = totalInRegion
      stat.percentage = totalInRegion > 0 ? Math.round((stat.visited / totalInRegion) * 100) : 0
    }

    const mostVisitedCountry = (() => {
      const countries: Record<string, number> = {}
      visitedMarkers.forEach((marker) => {
        if (
          marker.unesco &&
          marker.unesco.statesNames &&
          Array.isArray(marker.unesco.statesNames) &&
          marker.unesco.statesNames.length > 0
        ) {
          const country = marker.unesco.statesNames[0]
          countries[country] = (countries[country] || 0) + 1
        }
      })
      const sorted = Object.entries(countries).sort(([, a], [, b]) => b - a)
      return sorted.length > 0 ? sorted[0][0] : null
    })()

    const mostVisitedRegion =
      regionStats.length > 0
        ? regionStats.reduce((a, b) => (a.visited > b.visited ? a : b)).region
        : null

    return view.render('pages/profile', {
      stats: {
        visitedSites: visitedMarkers.length,
        totalSites: totalCount,
        markedSites: markedMarkers.length,
        completionPercentage,
        lastVisit,
        regionStats,
        mostVisitedCountry,
        mostVisitedRegion,
      },
    })
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({}: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params, view, auth }: HttpContext) {
    await auth.check()
    const unesco = await Unesco.query().where('id', params.id).firstOrFail()
    let markers = null
    if (auth.user) {
      // Gets the user's markers if he's logged in
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }

    return view.render('pages/site', { unesco, markers })
  }

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({}: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}
}
