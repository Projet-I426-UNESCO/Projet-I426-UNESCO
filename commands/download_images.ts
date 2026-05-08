import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Unesco from '#models/unesco'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

import _puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const puppeteer = _puppeteer.default

puppeteer.use(StealthPlugin())

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class DownloadImages extends BaseCommand {
  static commandName = 'download:images'
  static description =
    'Téléchargement avec compression différents formats et gestion des échecs et retries'

  static options: CommandOptions = { startApp: true }

  // Fonction pour traiter un site unique
  async processSite(page: any, site: Unesco, paths: { main: string; thumb: string }) {
    const base64DataUrl = await page.evaluate(async (imageUrl: string) => {
      const signal = AbortSignal.timeout(15000)

      try {
        const res = await fetch(imageUrl, { signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err: any) {
        throw new Error(err.message || 'Timeout')
      }
    }, site.mainImageUrl)

    const base64String = (base64DataUrl as string).split(',')[1]
    const buffer = Buffer.from(base64String, 'base64')

    // Générer les noms de fichiers
    const filenameMain = `${site.idNo}.webp`
    const filenameThumb = `${site.idNo}.webp`

    // Sauvegarder les images
    // Main
    await sharp(buffer, { limitInputPixels: false })
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 })
      .toFile(path.join(paths.main, filenameMain))

    // Thumb
    await sharp(buffer, { limitInputPixels: false })
      .resize({ width: 180, height: 180, fit: 'cover' })
      .webp({ quality: 60, effort: 6 })
      .toFile(path.join(paths.thumb, filenameThumb))

    // Sauvegarder les chemins des images
    const DOMAIN = 'unesco.etml.net'
    site.localImageMain = `https://${DOMAIN}/unesco/images/main/${filenameMain}`
    site.localImageThumb = `https://${DOMAIN}/unesco/images/thumb/${filenameThumb}`
    await site.save()
  }

  async run() {
    // Initialiser les chemins des images
    const STOREPATH = 'public/unesco/images'
    const paths = {
      main: `${STOREPATH}/main`,
      thumb: `${STOREPATH}/thumb`,
    }

    // Créer les dossiers de stockage
    await fs.mkdir(paths.main, { recursive: true })
    await fs.mkdir(paths.thumb, { recursive: true })

    // Récupérer tous les sites depuis la db
    const sites = await Unesco.all()
    let failedSites: Unesco[] = []
    let succeedSites = 0

    // Initialiser le navigateur
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--allow-running-insecure-content',
      ],
      defaultViewport: null,
      protocolTimeout: 0,
    })

    const page = await browser.newPage()
    await page.setUserAgent({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    })

    await page.goto('https://whc.unesco.org/fr/list/', { waitUntil: 'networkidle2', timeout: 0 })
    this.logger.info(`Cloudflare bypassed`)
    await sleep(4000)

    // PREMIER PASSAGE
    for (const site of sites) {
      const id = `[${sites.length + 1 - site.id}/${sites.length}]`
      if (site.mainImageUrl?.startsWith('http')) {
        try {
          await this.processSite(page, site, paths)
          this.logger.success(`${id} [${site.idNo}]`)
          succeedSites++
          await sleep(1000)
        } catch (error) {
          this.logger.error(`  ${id} [${site.idNo}] ${error.message}`)
          failedSites.push(site)
          await sleep(2000)
        }
      } else {
        this.logger.warning(`${site.idNo} has no image url`)
      }
    }

    // PASSAGES DES ECHECS
    while (failedSites.length > 0) {
      this.logger.info(`Rattrapage pour ${failedSites.length} échecs`)
      await sleep(5000)

      let failuresOfThisRound: Unesco[] = []

      for (const site of failedSites) {
        try {
          await this.processSite(page, site, paths)
          this.logger.success(`[${site.id}/${sites.length}] [${site.idNo}]`)
          succeedSites++
          await sleep(2000)
        } catch (error) {
          this.logger.error(`[${site.idNo}] Failed ${error.message}`)

          failuresOfThisRound.push(site)
        }
      }
      failedSites = failuresOfThisRound
    }
    await browser.close()
  }
}
