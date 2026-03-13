import { BaseSchema } from '@adonisjs/lucid/schema'

// Migration générée avec Gemini la base est trop grande j'allais pas faire ça à la main
// https://gemini.google.com/share/79ebc5eccbaf

export default class extends BaseSchema {
  protected tableName = 'whc_sites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('uuid').unique().notNullable()
      table.string('id_no').index()

      // Généré avec Gemini a partir d'un semple de whc001.json
      // Noms
      table.string('name_en')
      table.string('name_fr')
      table.string('name_es')
      table.string('name_ru')
      table.string('name_ar')
      table.string('name_zh')

      // Descriptions courtes
      table.text('short_description_en')
      table.text('short_description_fr')
      table.text('short_description_es')
      table.text('short_description_ru')
      table.text('short_description_ar')
      table.text('short_description_zh')

      // Textes longs
      table.text('description_en', 'longtext')
      table.text('justification_en', 'longtext')

      // Méta-données
      table.string('date_inscribed')
      table.string('secondary_dates')
      table.boolean('danger').defaultTo(false)
      table.string('date_end')
      table.string('danger_list')
      table.decimal('area_hectares', 12, 4)

      // Critères et Catégories
      table.string('cultural_criteria')
      table.string('natural_criteria')
      table.string('criteria_txt')
      table.string('category')
      table.integer('category_id')

      // Géo & Région
      table.json('states_names')
      table.string('iso_codes')
      table.string('region')
      table.string('region_code')
      table.boolean('transboundary').defaultTo(false)
      table.json('coordinates')

      // Médias
      table.string('main_image_url')
      table.string('main_image_author')
      table.string('main_image_copyright')
      table.text('main_image_caption_en')
      table.text('main_image_caption_fr')
      table.text('main_image_caption_es')
      table.text('main_image_caption_ru')
      table.text('main_image_caption_ar')
      table.text('main_image_caption_zh')
      table.text('images_urls', 'longtext')

      table.string('main_video_url')
      table.string('main_video_author')
      table.text('main_video_caption_en')
      table.text('main_video_caption_fr')
      table.text('main_video_caption_es')
      table.text('main_video_caption_ru')
      table.text('main_video_caption_ar')
      table.text('main_video_caption_zh')
      table.text('videos_urls', 'longtext')

      // Composants
      table.text('components_list', 'longtext')
      table.integer('components_count')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
