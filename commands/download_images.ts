import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Unesco from '#models/unesco'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import app from '@adonisjs/core/services/app'

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

    const filename = `${site.idNo}.webp`

    // Sauvegarder les images
    await Promise.all([
      // Main
      sharp(buffer, { limitInputPixels: false })
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 70, effort: 6 })
        .toFile(path.join(paths.main, filename)),

      //Thumb
      sharp(buffer, { limitInputPixels: false })
        .resize({ width: 180, height: 180, fit: 'cover' })
        .webp({ quality: 60, effort: 6 })
        .toFile(path.join(paths.thumb, filename)),
    ])
  }

  async run() {
    // Initialiser les chemins des images
    const storePath = app.publicPath('unesco/images')
    const paths = {
      main: path.join(storePath, 'main'),
      thumb: path.join(storePath, 'thumb'),
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
      headless: true,
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
    this.logger.info(`   Cloudflare bypassed`)
    await sleep(4000)

    // PREMIER PASSAGE
    for (const [i, site] of sites.entries()) {
      const counterId = `[${i + 1}/${sites.length}]`
      if (site.mainImageUrl?.startsWith('http')) {
        try {
          await this.processSite(page, site, paths)
          this.logger.success(`${counterId} [${site.idNo}]`)
          succeedSites++
          await sleep(1000)
        } catch (error) {
          this.logger.error(`  ${counterId} [${site.idNo}] ${error.message}`)
          failedSites.push(site)
          await sleep(2000)
        }
      } else {
        this.logger.warning(`${site.idNo} has no image url`)
      }
    }

    // PASSAGES DES ECHECS
    let retryCount = 0
    const MAX_RETRIES = 10

    while (failedSites.length > 0 && retryCount < MAX_RETRIES) {
      retryCount++
      this.logger.info(
        `Rattrapage (${retryCount}/${MAX_RETRIES}) pour ${failedSites.length} échecs`
      )
      await sleep(5000)

      let failuresOfThisRound: Unesco[] = []

      for (const [i, site] of failedSites.entries()) {
        const counterId = `[${i + 1}/${failedSites.length}]`
        try {
          await this.processSite(page, site, paths)
          this.logger.success(`${counterId} [${site.idNo}] réparé`)
          succeedSites++
          await sleep(2000)
        } catch (error) {
          this.logger.error(`[${site.idNo}] Failed again: ${error.message}`)
          failuresOfThisRound.push(site)
        }
      }
      failedSites = failuresOfThisRound
    }
    await browser.close()
  }
}
