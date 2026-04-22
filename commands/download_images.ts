import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Unesco from '#models/unesco'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class DownloadImages extends BaseCommand {
  static commandName = 'download:images'
  static description = 'Contourne Cloudflare et le gestionnaire de téléchargement Chrome'

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

    const browser = await puppeteer.launch({
      headless: false, // Navigateur visible
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null
    })

    const page = await browser.newPage()

    await page.setUserAgent({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    })

    this.logger.info(`Récupération du pass Cloudflare sur la page d'accueil...`)
    
    try {
      await page.goto('https://whc.unesco.org/fr/list/', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      })
      await sleep(4000) 
    } catch (e) {
      this.logger.warning(`Homepage timeout`)
    }

    this.logger.info(`${sites.length} sites en traitement`)

    for (const site of sites) {
      if (site.mainImageUrl && site.mainImageUrl.startsWith('http')) {
        try {
          // L'ASTUCE EST ICI : On reste sur la page d'accueil et on exécute un script
          // à l'intérieur du navigateur pour télécharger l'image sans déclencher 
          // le dossier Téléchargements de Windows.
          const base64DataUrl = await page.evaluate(async (imageUrl) => {
            const res = await fetch(imageUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const blob = await res.blob();
            
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }, site.mainImageUrl);

          if (!base64DataUrl) {
             throw new Error("Impossible de récupérer les données de l'image");
          }

          // On reconvertit le base64 du navigateur en Buffer Node.js
          const base64String = base64DataUrl.split(',')[1];
          const buffer = Buffer.from(base64String, 'base64');

          // Noms des fichiers
          const filenameMain = `${site.idNo}.webp`
          const filenameThumb = `${site.idNo}-thumb.webp`

          // Main
          await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 70, effort: 6 })
            .toFile(path.join(publicImagesPath, filenameMain))

          // Thumbnail
          await sharp(buffer)
            .resize({
              width: 180,
              height: 180,
              fit: 'cover',
            })
            .webp({ quality: 60, effort: 6 })
            .toFile(path.join(publicImagesThumbPath, filenameThumb))

          site.localImageMain = `${BASEPATH}/main/${filenameMain}`
          site.localImageThumb = `${BASEPATH}/thumb/${filenameThumb}`
          await site.save()

          this.logger.success(`[${site.idNo}] Succès`)

          await sleep(1500)

        } catch (error) {
          this.logger.error(`[${site.idNo}] ${error.message}`)
          await sleep(3000)
        }
      }
    }
    await browser.close()
  }
}