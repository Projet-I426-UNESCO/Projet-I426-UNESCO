import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'unescos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('category', 100)
      table.string('criteria_txt', 100)
      table.string('danger', 100)
      table.string('date_inscribed', 100)

      table.decimal('extension', 20)

      table.string('http_url', 500)
      table.string('image_url', 500)

      table.string('iso_code', 10)
      table.string('justification', 600)
      table.string('location', 200)
      table.string('region', 100)

      table.integer('revision')
      table.string('secondary_dates', 100)

      table.string('short_description', 1200)
      table.string('site', 200)

      table.string('states', 200)
      table.integer('transboundary')

      // ex: { "lat": 48.85, "lon": 2.29 }
      table.json('coordinates')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
