import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'unescos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('category', 100).nullable()
      table.string('criteria_txt', 100).nullable()
      table.string('danger', 100).nullable()
      table.string('date_inscribed', 100).nullable()

      table.decimal('extension', 20).nullable()

      table.string('http_url', 500).nullable()
      table.string('image_url', 500).nullable()

      table.string('iso_code', 10).nullable()
      table.string('justification', 600).nullable()
      table.string('location', 200).nullable()
      table.string('region', 100).nullable()

      table.integer('revision').nullable()
      table.string('secondary_dates', 100).nullable()

      table.string('short_description', 1200).nullable()
      table.string('site', 200).nullable()

      table.string('states', 200).nullable()
      table.integer('transboundary').nullable()

      // ex: { "lat": 48.85, "lon": 2.29 }
      table.json('coordinates').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
