import { BaseCommand } from '@adonisjs/core/ace'
import { readFile, writeFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import ace from '@adonisjs/core/services/ace'

export default class CheckUnesco extends BaseCommand {
  static commandName = 'check:unesco'
  static description = 'Vérifie si la whc001 a été modifiée et lance get:data si besoin'

  async run() {
    const cachePath = app.tmpPath('unesco_last_update.txt')

    const metaRes = await fetch('https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001')
    const metaData = await metaRes.json()

    const currentUpdate = metaData.metas?.default?.modified
    const localDate = await readFile(cachePath, 'utf-8').catch(() => '')

    if (!currentUpdate) {
      this.logger.error(`No 'modified' entry`)
      console.log(JSON.stringify(metaData, null, 2))
      return
    }

    if (currentUpdate === localDate) {
      return this.logger.info('Already up to date')
    }

    this.logger.info(`New version... ${currentUpdate}`)
    await writeFile(cachePath, String(currentUpdate))

    await this.kernel.exec('get:data', [])
    await this.kernel.exec('db:seed', [])

    this.logger.success('Successfully finished')
  }
}
