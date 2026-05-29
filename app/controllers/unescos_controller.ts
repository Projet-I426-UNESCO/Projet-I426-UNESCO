import type { HttpContext } from '@adonisjs/core/http'
import Unesco from '#models/unesco'
import { dd } from '@adonisjs/core/services/dumper'
import Marker from '#models/marker'
import User from '#models/user'
import env from '#start/env'

export default class UnescosController {
  /**
   * Affiche une liste de ressources
   */
  async index({ view, auth }: HttpContext) {
    await auth.check()
    const unescos = await Unesco.query().exec()

    let markers: Marker[] = []
    if (auth.user) {
      // Récupère les marqueurs de l'utilisateur s'il est connecté
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }
    const mapboxToken = env.get('MAPBOX_ACCESS_TOKEN')

    // Appel de la vue
    return view.render('pages/home', { unescos, markers, mapboxToken })
  }

  async sites({ auth, view }: HttpContext) {
    await auth.check()
    const unescos = await Unesco.query().exec()

    let markers: Marker[] = []
    if (auth.user) {
      // Récupère les marqueurs de l'utilisateur s'il est connecté
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }

    return view.render('pages/sites', { unescos, markers })
  }

  async bookmarks({ view, auth }: HttpContext) {
    await auth.check()
    const user = await User.query().where('id', auth.user!.id).firstOrFail()

    const unescos = await Unesco.query()
      .join('markers', 'unescos.id', '=', 'markers.unesco_id')
      .where('markers.user_id', user.id)
      .where('markers.is_marked', true)
      .select('unescos.*')
      .groupBy('unescos.id')

    let markers: Marker[] = []
    if (auth.user) {
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }

    return view.render('pages/bookmarks', { unescos, markers })
  }

  async visits({ view, auth }: HttpContext) {
    await auth.check()
    const user = await User.query().where('id', auth.user!.id).firstOrFail()

    const unescos = await Unesco.query()
      .join('markers', 'unescos.id', '=', 'markers.unesco_id')
      .where('markers.user_id', user.id)
      .where('markers.is_visited', true)
      .select('unescos.*')
      .groupBy('unescos.id')

    let markers: Marker[] = []
    if (auth.user) {
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }

    return view.render('pages/visits', { unescos, markers })
  }

  async profile({ view, auth }: HttpContext) {
    const userId = auth.user!.id // récupérer l'id de l'utilisateur

    const markers = await Marker.query().where('user_id', userId).preload('unesco') // récupérer les markers de l'utilisateur

    const visitedMarkers = markers.filter((m) => m.isVisited)
    const markedMarkers = markers.filter((m) => m.isMarked)

    const totalSites = await Unesco.query().count('* as total').first() // récupérer le nombre total des sites UNESCO
    const totalCount = totalSites ? totalSites.$extras.total : 0 // compte le nombre total des sites UNESCO

    const lastVisit =
      visitedMarkers.length > 0 ? visitedMarkers[visitedMarkers.length - 1].unesco : null // Le dernier site visité

    const visitsByRegion: Record<string, number> = {} // calculer le nombre des sites visités par regino
    visitedMarkers.forEach((marker) => {
      if (marker.unesco && marker.unesco.region) {
        visitsByRegion[marker.unesco.region] = (visitsByRegion[marker.unesco.region] || 0) + 1
      }
    })

    const completionPercentage =
      totalCount > 0 ? Math.round((visitedMarkers.length / totalCount) * 100 * 10) / 10 : 0 // calcule le pourcentage globale de progression

    const allRegions = await Unesco.query().whereNotNull('region').select('region').distinct() // récupère les régions de la db

    const regionStats: Array<{
      // calculer les stats par région
      region: string
      visited: number
      total: number
      percentage: number
      colorIndex: number
    }> = []

    // parcourt chaque region pour calculer les stats
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

    for (let i = 0; i < regionStats.length; i++) {
      const total = await Unesco.query()
        .where('region', regionStats[i].region)
        .count('* as count')
        .first() // compter le nombre total de sites par région
      const totalInRegion = total ? total.$extras.count : 0 // nombre total de sites dans la région, si rien envoie 0
      regionStats[i].total = totalInRegion // màj le total de sites
      regionStats[i].percentage =
        totalInRegion > 0 ? Math.round((regionStats[i].visited / totalInRegion) * 100) : 0 // calcule le pourcentage de progression dans la région
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
          const country = marker.unesco.statesNames[0] // Prend le premier pays de la liste
          countries[country] = (countries[country] || 0) + 1 // incrémente le compteur
        }
      })
      const sorted = Object.entries(countries).sort(([, a], [, b]) => b - a) // trie par nmbr de visites
      return sorted.length > 0 ? sorted[0][0] : null
    })()

    const mostVisitedRegion =
      regionStats.length > 0
        ? regionStats.reduce((a, b) => (a.visited > b.visited ? a : b)).region
        : null

    const recentVisits = visitedMarkers
      .filter((m) => m.unesco)
      .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
      .slice(0, 3)
      .map((m) => ({
        name: m.unesco.nameFr || m.unesco.nameEn,
        country: Array.isArray(m.unesco.statesNames)
          ? m.unesco.statesNames.join(', ')
          : m.unesco.statesNames || '',
        id: m.unesco.id,
        date: m.updatedAt.setLocale('fr').toFormat('d MMMM yyyy'),
      }))

    // Regroupe les marqueurs visités par région (continent)
    const visitedByRegionMap: Record<
      string,
      Array<{
        id: number
        name: string
        category: string | null
        addedAt: string
      }>
    > = {}

    visitedMarkers.forEach((m) => {
      if (m.unesco) {
        const regionName = m.unesco.region || 'Autre'
        if (!visitedByRegionMap[regionName]) {
          visitedByRegionMap[regionName] = []
        }
        visitedByRegionMap[regionName].push({
          id: m.unesco.id,
          name: m.unesco.nameFr || m.unesco.nameEn || '',
          category: m.unesco.category,
          addedAt: m.updatedAt.setLocale('fr').toFormat("d MMMM yyyy 'à' H:mm"),
        })
      }
    })

    // Trie les sites de chaque région par ordre alphabétique
    Object.keys(visitedByRegionMap).forEach((regionName) => {
      visitedByRegionMap[regionName].sort((a, b) => a.name.localeCompare(b.name))
    })

    // Convertit la map en tableau trié d'objets pour un rendu sûr dans le template Edge
    const visitedByRegion = Object.entries(visitedByRegionMap)
      .map(([regionName, sites]) => ({
        regionName,
        sites,
      }))
      .sort((a, b) => a.regionName.localeCompare(b.regionName))

    // Regroupe les marqueurs marqués par région (continent)
    const markedByRegionMap: Record<
      string,
      Array<{
        id: number
        name: string
        category: string | null
        addedAt: string
      }>
    > = {}

    markedMarkers.forEach((m) => {
      if (m.unesco) {
        const regionName = m.unesco.region || 'Autre'
        if (!markedByRegionMap[regionName]) {
          markedByRegionMap[regionName] = []
        }
        markedByRegionMap[regionName].push({
          id: m.unesco.id,
          name: m.unesco.nameFr || m.unesco.nameEn || '',
          category: m.unesco.category,
          addedAt: m.updatedAt.setLocale('fr').toFormat("d MMMM yyyy 'à' H:mm"),
        })
      }
    })

    // Trie les sites de chaque région par ordre alphabétique
    Object.keys(markedByRegionMap).forEach((regionName) => {
      markedByRegionMap[regionName].sort((a, b) => a.name.localeCompare(b.name))
    })

    // Convertit la map en tableau trié d'objets
    const markedByRegion = Object.entries(markedByRegionMap)
      .map(([regionName, sites]) => ({
        regionName,
        sites,
      }))
      .sort((a, b) => a.regionName.localeCompare(b.regionName))

    // Formate tous les marqueurs avec leurs coordonnées pour la carte interactive du profil
    const mapMarkers = markers
      .filter((m) => m.unesco && m.unesco.coordinates)
      .map((m) => ({
        id: m.unesco.id,
        name: m.unesco.nameFr || m.unesco.nameEn,
        lon: m.unesco.coordinates.lon,
        lat: m.unesco.coordinates.lat,
        isVisited: m.isVisited,
        isMarked: m.isMarked,
        category: m.unesco.category,
      }))

    const mapboxToken = env.get('MAPBOX_ACCESS_TOKEN')

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
        recentVisits,
      },
      mapMarkers,
      visitedByRegion,
      markedByRegion,
      mapboxToken,
    })
  }

  /**
   * Affiche une fiche individuelle
   */
  async show({ params, view, auth }: HttpContext) {
    await auth.check()
    const unesco = await Unesco.query().where('id', params.id).firstOrFail()
    let markers = null
    if (auth.user) {
      // Récupère les marqueurs de l'utilisateur s'il est connecté
      markers = await Marker.query().where('user_id', auth.user.id).exec()
    }
    const mapboxToken = env.get('MAPBOX_ACCESS_TOKEN')
    return view.render('pages/site', { unesco, markers, mapboxToken })
  }
}
