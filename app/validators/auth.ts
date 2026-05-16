import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine
      .string()
      .maxLength(100)
      .unique(async (query, value) => {
        const row = await db.from('users').where('full_name', value).first()
        return !row
      }),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (query, value) => {
        const row = await db.from('users').where('email', value).first()
        return !row
      }),
    password: vine.string().minLength(4),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    fullName: vine.string().maxLength(100),
    password: vine.string().minLength(4),
  })
)
