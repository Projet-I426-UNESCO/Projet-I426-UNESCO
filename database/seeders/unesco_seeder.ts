import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Unesco from '#models/unesco'
import unescos from '../../public/data/whc001.json' with { type: 'json' }

// Seeder généré avec Gemini
// https://gemini.google.com/share/79ebc5eccbaf

export default class extends BaseSeeder {
  async run() {
    const parseBoolean = (val: any) => val === 'True' || val === true

    await Unesco.createMany(
      unescos.results.map((item: any) => ({
        uuid: item.uuid,
        idNo: item.id_no,

        // Noms
        nameEn: item.name_en,
        nameFr: item.name_fr,
        nameEs: item.name_es,
        nameRu: item.name_ru,
        nameAr: item.name_ar,
        nameZh: item.name_zh,

        // Descriptions courtes
        shortDescriptionEn: item.short_description_en,
        shortDescriptionFr: item.short_description_fr,
        shortDescriptionEs: item.short_description_es,
        shortDescriptionRu: item.short_description_ru,
        shortDescriptionAr: item.short_description_ar,
        shortDescriptionZh: item.short_description_zh,

        // Textes longs
        descriptionEn: item.description_en,
        justificationEn: item.justification_en,

        // Méta-données
        dateInscribed: item.date_inscribed,
        secondaryDates: item.secondary_dates,
        danger: parseBoolean(item.danger),
        dateEnd: item.date_end,
        dangerList: item.danger_list,
        areaHectares: item.area_hectares,

        // Critères et Catégories
        culturalCriteria: item.cultural_criteria,
        naturalCriteria: item.natural_criteria,
        criteriaTxt: item.criteria_txt,
        category: item.category,
        categoryId: item.category_id,

        // Géo & Région
        statesNames: item.states_names,
        isoCodes: item.iso_codes,
        region: item.region,
        regionCode: item.region_code,
        transboundary: parseBoolean(item.transboundary),
        coordinates: item.coordinates,

        // Médias (Images)
        mainImageUrl: item.main_image_url,
        mainImageAuthor: item.main_image_author,
        mainImageCopyright: item.main_image_copyright,
        mainImageCaptionEn: item.main_image_caption_en,
        mainImageCaptionFr: item.main_image_caption_fr,
        mainImageCaptionEs: item.main_image_caption_es,
        mainImageCaptionRu: item.main_image_caption_ru,
        mainImageCaptionAr: item.main_image_caption_ar,
        mainImageCaptionZh: item.main_image_caption_zh,
        imagesUrls: item.images_urls,

        // Médias (Vidéos)
        mainVideoUrl: item.main_video_url,
        mainVideoAuthor: item.main_video_author,
        mainVideoCaptionEn: item.main_video_caption_en,
        mainVideoCaptionFr: item.main_video_caption_fr,
        mainVideoCaptionEs: item.main_video_caption_es,
        mainVideoCaptionRu: item.main_video_caption_ru,
        mainVideoCaptionAr: item.main_video_caption_ar,
        mainVideoCaptionZh: item.main_video_caption_zh,
        videosUrls: item.videos_urls,

        // Composants
        componentsList: item.components_list,
        componentsCount: item.components_count,
      }))
    )
  }
}
