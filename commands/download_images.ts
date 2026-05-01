import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Unesco from '#models/unesco'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

import _puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const puppeteer = _puppeteer.default
puppeteer.use(StealthPlugin())

puppeteer.use(StealthPlugin())

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class DownloadImages extends BaseCommand {
  static commandName = 'download:images'
  static description =
    'Téléchargement avec compression différents formats et gestion des échecs et retries'

  static options: CommandOptions = { startApp: true }

  // Fonction pour traiter un site unique
  async processSite(page: any, site: Unesco, paths: { main: string; thumb: string; base: string }) {
    const safeImageUrl = site.mainImageUrl.replace(/^http:\/\//i, 'https://')

    const base64DataUrl = await page.evaluate(async (imageUrl: string) => {
      const res = await fetch(imageUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }, safeImageUrl)

    const base64String = (base64DataUrl as string).split(',')[1]
    const buffer = Buffer.from(base64String, 'base64')

    // Générer les noms de fichiers
    const filenameMain = `${site.idNo}.webp`
    const filenameThumb = `${site.idNo}-thumb.webp`

    // Sauvegarder les images
    // Main
    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 })
      .toFile(path.join(paths.main, filenameMain))

    // Thumb
    await sharp(buffer)
      .resize({ width: 180, height: 180, fit: 'cover' })
      .webp({ quality: 60, effort: 6 })
      .toFile(path.join(paths.thumb, filenameThumb))

    // Sauvegarder les chemins des images
    site.localImageMain = `${paths.base}/main/${filenameMain}`
    site.localImageThumb = `${paths.base}/thumb/${filenameThumb}`
    await site.save()
  }

  async run() {
    // Initialiser les chemins des images
    const STOREPATH = 'public/unesco/images'
    const BASEPATH = 'unesco/images'
    const paths = {
      main: app.makePath(`${STOREPATH}/main`),
      thumb: app.makePath(`${STOREPATH}/thumb`),
      base: BASEPATH,
    }

    // Créer les dossiers de stockage
    await fs.mkdir(paths.main, { recursive: true })
    await fs.mkdir(paths.thumb, { recursive: true })

    // Récupérer tous les sites depuis la db
    const sites = await Unesco.all()
    let failedSites: Unesco[] = []

    // Initialiser le navigateur
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null,
    })

    const page = await browser.newPage()
    await page.setUserAgent({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    })

    await page.goto('https://whc.unesco.org/fr/list/', { waitUntil: 'networkidle2' })
    this.logger.info(`Cloudflare bypassed`)
    await sleep(4000)

    // PREMIER PASSAGE
    for (const site of sites) {
      if (site.mainImageUrl?.startsWith('http')) {
        try {
          await this.processSite(page, site, paths)
          this.logger.success(`[${site.id}/${sites.length}] [${site.idNo}]`)
          await sleep(1000)
        } catch (error) {
          this.logger.error(`[${site.idNo}] Failed ${error.message}`)
          failedSites.push(site)
          await sleep(2000)
        }
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
