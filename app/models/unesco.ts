import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

// Modèle généré avec Gemini et modifié pour des erreurs de json dans la table
// https://gemini.google.com/share/79ebc5eccbaf

export default class Unesco extends BaseModel {
  public static table = 'whc_sites'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare idNo: string

  // Noms
  @column()
  declare nameEn: string | null

  @column()
  declare nameFr: string | null

  @column()
  declare nameEs: string | null

  @column()
  declare nameRu: string | null

  @column()
  declare nameAr: string | null

  @column()
  declare nameZh: string | null

  // Descriptions courtes
  @column()
  declare shortDescriptionEn: string | null

  @column()
  declare shortDescriptionFr: string | null

  @column()
  declare shortDescriptionEs: string | null

  @column()
  declare shortDescriptionRu: string | null

  @column()
  declare shortDescriptionAr: string | null

  @column()
  declare shortDescriptionZh: string | null

  // Textes longs
  @column()
  declare descriptionEn: string | null

  @column()
  declare justificationEn: string | null

  // Méta-données
  @column()
  declare dateInscribed: string | null

  @column()
  declare secondaryDates: string | null

  @column()
  declare danger: boolean | null

  @column()
  declare dateEnd: string | null

  @column()
  declare dangerList: string | null

  @column()
  declare areaHectares: number | null

  // Critères et Catégories
  @column()
  declare culturalCriteria: string | null

  @column()
  declare naturalCriteria: string | null

  @column()
  declare criteriaTxt: string | null

  @column()
  declare category: string | null

  @column()
  declare categoryId: number | null

  // Géo & Région
  @column({
    prepare: (value) => (value ? JSON.stringify(value) : null),
    consume: (value) => (value ? JSON.parse(value) : null),
  })
  declare statesNames: any | null

  @column()
  declare isoCodes: string | null

  @column()
  declare region: string | null

  @column()
  declare regionCode: string | null

  @column()
  declare transboundary: boolean | null

  @column({
    prepare: (value) => (value ? JSON.stringify(value) : null),
    consume: (value) => (value ? JSON.parse(value) : null),
  })
  declare coordinates: any | null

  // Médias (Images)
  @column({ columnName: 'main_image_url' })
  declare mainImageUrl: string | null

  @column()
  declare mainImageAuthor: string | null

  @column()
  declare mainImageCopyright: string | null

  @column()
  declare mainImageCaptionEn: string | null

  @column()
  declare mainImageCaptionFr: string | null

  @column()
  declare mainImageCaptionEs: string | null

  @column()
  declare mainImageCaptionRu: string | null

  @column()
  declare mainImageCaptionAr: string | null

  @column()
  declare mainImageCaptionZh: string | null

  @column()
  declare imagesUrls: string | null

  // Médias (Vidéos)
  @column()
  declare mainVideoUrl: string | null

  @column()
  declare mainVideoAuthor: string | null

  @column()
  declare mainVideoCaptionEn: string | null

  @column()
  declare mainVideoCaptionFr: string | null

  @column()
  declare mainVideoCaptionEs: string | null

  @column()
  declare mainVideoCaptionRu: string | null

  @column()
  declare mainVideoCaptionAr: string | null

  @column()
  declare mainVideoCaptionZh: string | null

  @column()
  declare videosUrls: string | null

  // Composants
  @column({
    prepare: (value) => (value ? JSON.stringify(value) : null),
    consume: (value) => (value ? JSON.parse(value) : null),
  })
  declare componentsList: string | null

  @column()
  declare componentsCount: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
