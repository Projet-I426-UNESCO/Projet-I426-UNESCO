import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Unesco from '#models/unesco'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

export default class DownloadImages extends BaseCommand {
  static commandName = 'download:images'
  static description = ''

  static options: CommandOptions = { startApp: true }

  async run() {
    const STOREPATH = 'public/unesco/images'
    const BASEPATH = 'unesco/images'

    // Définition des chemins
    const publicImagesPath = app.makePath(`${STOREPATH}/main`)
    const publicImagesThumbPath = app.makePath(`${STOREPATH}/thumb`)

    // Créer le dossier de destination s'il n'existe pas
    await fs.mkdir(publicImagesPath, { recursive: true })
    await fs.mkdir(publicImagesThumbPath, { recursive: true })

    // Récupérer tous les sites de la base de données
    const sites = await Unesco.all()

    this.logger.info(`${sites.length} sites en traitement`)

    for (const site of sites) {
      if (site.mainImageUrl && site.mainImageUrl.startsWith('http')) {
        try {
          const response = await fetch(site.mainImageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
              'Referer': 'https://whc.unesco.org/',
              'Connection': 'keep-alive',
            },
          })

          if (!response.ok) throw new Error(`${response.status}`)

          // Average node.js moment
          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Noms des fichiers
          const filenameHd = `${site.idNo}.jpg`
          const filenameThumb = `${site.idNo}.webp`

          await fs.writeFile(path.join(publicImagesPath, filenameHd), buffer)

          await sharp(buffer)
            .resize({
              width: 180,
              height: 180,
              fit: 'cover',
            })
            .webp({ quality: 80 })
            .toFile(path.join(publicImagesThumbPath, filenameThumb))

          site.localImageMain = `${BASEPATH}/main/${filenameHd}`
          site.localImageThumb = `${BASEPATH}/thumb/${filenameThumb}`
          await site.save()

          this.logger.success(`[${site.idNo}] Succès`)
        } catch (error) {
          this.logger.error(`[${site.idNo}] ${error.message}`)
        }
      }
    }
  }
}
