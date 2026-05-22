import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'unescos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('local_image_main').nullable()
      table.string('local_image_thumb').nullable()
      table.string('local_image_visited_sites').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('local_image_main')
      table.dropColumn('local_image_thumb')
      table.dropColumn('local_image_visited_sites')
    })
  }
}
