import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Unesco from '#models/unesco'

export default class Marker extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number // Colonne correspondant à la clé étrangère

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User> // Relation vers le modèle User

  @column()
  declare unescoId: number // Colonne correspondant à la clé étrangère

  @belongsTo(() => Unesco)
  declare unesco: BelongsTo<typeof Unesco> // Relation vers le modèle Unesco
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}