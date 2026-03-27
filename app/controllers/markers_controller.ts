import type { HttpContext } from '@adonisjs/core/http'
import Marker from "#models/marker"

export default class MarkersController {
    async visit({ view, auth, params }: HttpContext) {
        await auth.check()
        const marker = await Marker.query().exec()
    }

    async mark({ view, auth, params }: HttpContext) {
    await auth.check()
    const marker = await Marker.query().exec()
    }

    async unvisit({ view, auth, params }: HttpContext) {
    await auth.check()
    const marker = await Marker.query().exec()
    }

    async unmark({ view, auth, params }: HttpContext) {
    await auth.check()
    const marker = await Marker.query().exec()
    }
}