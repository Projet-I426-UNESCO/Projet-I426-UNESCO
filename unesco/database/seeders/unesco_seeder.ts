import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Unesco from '#models/unesco'
import unescos from '../../public/data/unesco-data.json' with { type: 'json' }

export default class extends BaseSeeder {
  async run() {
    await Unesco.createMany(
      unescos.map((item) => ({
        category: item.category,
        criteriaTxt: item.criteria_txt,
        danger: item.danger,
        dateInscribed: item.date_inscribed,
        extension: item.extension,
        httpUrl: item.http_url,
        imageUrl: item.image_url,
        isoCode: item.iso_code,
        justification: item.justification,
        location: item.location,
        region: item.region,
        revision: item.revision,
        secondaryDates: item.secondary_dates,
        shortDescription: item.short_description,
        site: item.site,
        states: item.states,
        transboundary: item.transboundary,
        coordinates: item.coordinates,
      }))
    )
  }
}
