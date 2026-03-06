import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.internet.username(),
      email: faker.internet.email(),
      password: 'password',
    }
  })
  .build()
