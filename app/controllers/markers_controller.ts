import type { HttpContext } from '@adonisjs/core/http'
import Marker from "#models/marker"


// !! IMPORTANT, Markers hold the visited AND marked value in one field !!
export default class MarkersController {
    async visit({ auth, params }: HttpContext) {
        await auth.check()
        
        let marker = null
        if (auth.user) {
            marker = await Marker.query().where('userId', auth.user?.id).where('unescoId', params.unescoId).firstOrFail()
            if (marker) {
                console.log('Modifying existing marker')
                await Marker.create({
                    isVisited: !marker.$columns.isVisited
                })
            } else {
                console.log('Marker doesn\'t exist yet, creating one')
                await Marker.create({
                    isMarked: false,
                    isVisited: true,
                    userId: auth.user.id,
                    unescoId: params.unescoId
                })
            }
        }
    }

    async mark({ auth, params }: HttpContext) {
        await auth.check()
        
        let marker = null
        if (auth.user) {
            marker = await Marker.query().where('userId', auth.user?.id).where('unescoId', params.unescoId).firstOrFail()
            if (marker) {
                console.log('Modifying existing marker')
                await Marker.create({
                    isMarked: !marker.$columns.isMarked
                })
            } else {
                console.log('Marker doesn\'t exist yet, creating one')
                await Marker.create({
                    isMarked: true,
                    isVisited: false,
                    userId: auth.user.id,
                    unescoId: params.unescoId
                })
            }
        }
    }
}