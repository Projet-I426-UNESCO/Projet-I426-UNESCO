import type { HttpContext } from '@adonisjs/core/http'
import Marker from "#models/marker"
import { dd } from '@adonisjs/core/services/dumper'


// !! IMPORTANT, Markers hold the visited AND marked value in one field !!
export default class MarkersController {
  async visit({ auth, params, response }: HttpContext) {
      console.log("visit")
      
      await auth.check()
      
      let marker = null
      if (auth.user) {
          marker = await Marker.query().where('userId', auth.user?.id).where('unescoId', params.unescoId).first()
          
          if (marker) {
              await marker.merge({
                  isVisited: !marker.isVisited
              })
              console.log(`Modifying existing marker ${params.unescoId}, isVisited : ${marker.isVisited}`)
              marker.save()
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
      return response.ok({ success: true })
  }

  async mark({ auth, params, response }: HttpContext) {
      console.log("mark")
      
      await auth.check()
      
      let marker = null
      if (auth.user) {
          marker = await Marker.query().where('userId', auth.user?.id).where('unescoId', params.unescoId).first()

          if (marker) {
              marker.merge({
                  isMarked: !marker.isMarked
              })
              console.log(`Modifying existing marker ${params.unescoId}, isMarked : ${marker.isMarked}`)
              marker.save()
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
      return response.ok({ success: true })
  }
}