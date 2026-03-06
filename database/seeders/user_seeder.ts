import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { UserFactory } from '#database/factories/user_factory'

export default class extends BaseSeeder {
  async run() {
    await UserFactory.createMany(67)
    await User.create({
      fullName: 'xXx67Erdem67xXx-LFT',
      email: 'oui@non.bof',
      password: 'xXx67xXx',
    })
  }
}
