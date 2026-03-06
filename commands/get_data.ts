import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class GetData extends BaseCommand {
  static commandName = 'get:data'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "GetData"')
  }
}