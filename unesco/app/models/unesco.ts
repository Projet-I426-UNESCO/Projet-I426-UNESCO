import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

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

  @column()
  declare imageUrl: string | null

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

  @column()
  declare states: string | null

  @column()
  declare transboundary: number | null

  // ex: { lat: 48.85, lon: 2.29 }
  @column()
  declare coordinates: {
    lat: number
    lon: number
  } | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
