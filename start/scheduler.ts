
import scheduler from 'adonisjs-scheduler/services/main'
import unescoSeeder from '#database/seeders/unesco_seeder';
import db from '@adonisjs/lucid/services/db';
import { getData, UNESCO_URL } from '../commands/get_data.js';


scheduler.call(async () => {
    // pull the data from the unesco api
    await getData()
    console.log("db refresh")

    // seed the db with the new data
    const client = await db.connection()
    const seeder = new unescoSeeder(client)
    await seeder.run()
    console.log("seeder terminate")

}).monthly()