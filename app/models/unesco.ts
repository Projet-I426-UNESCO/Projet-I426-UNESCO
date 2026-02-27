import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

type ImageUrl = {
  thumbnail: boolean
  filename: string
  format: string
  width: number
  height: number
  mimetype: string
  etag: string
  id: string
  last_synchronized: string
  color_summary: string[]
}

export default class Unesco extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare category: string | null

  @column()
  declare criteriaTxt: string | null

  @column()
  declare danger: string | null

  @column()
  declare dateInscribed: string | null

  @column()
  declare extension: number | null

  @column()
  declare httpUrl: string | null

  @column({
    prepare: (value) => (value ? JSON.stringify(value) : null),
    consume: (value) => (value ? JSON.parse(value) : null),
  })
  declare imageUrl: ImageUrl | null

  @column()
  declare isoCode: string | null

  @column()
  declare justification: string | null

  @column()
  declare location: string | null

  @column()
  declare region: string | null

  @column()
  declare revision: number | null

  @column()
  declare secondaryDates: string | null

  @column()
  declare shortDescription: string | null

  @column()
  declare site: string | null

  @column({
    prepare: (value) => (value ? JSON.stringify(value) : null),
    consume: (value) => (value ? JSON.parse(value) : null),
  })
  declare states: string[] | null

  @column()
  declare transboundary: number | null

  @column({
    prepare: (value) => (value ? JSON.stringify(value) : null),
    consume: (value) => (value ? JSON.parse(value) : null),
  })
  declare coordinates: { lon: number; lat: number } | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
