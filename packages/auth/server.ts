import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Database } from '@workspace/database'
import { openAPI, bearer } from 'better-auth/plugins'
import * as schema from '@workspace/database/schema'

export const auth = betterAuth({
  database: drizzleAdapter(Database, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.API_URL!,
  basePath: '/auth',
  trustedOrigins: [process.env.PUBLIC_APP_URL!],
  plugins: [openAPI(), bearer()],
})
