import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Database } from '@workspace/database'
import { openAPI } from 'better-auth/plugins'
import { env } from '@workspace/config'

export const auth = betterAuth({
  database: drizzleAdapter(Database, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: env.API_URL,
  basePath: '/auth',
  plugins: [openAPI()],
})
