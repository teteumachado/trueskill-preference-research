import { defineConfig } from 'drizzle-kit'
import { env } from '@workspace/config'

export default defineConfig({
  out: './drizzle',
  schema: './packages/database/schema/index.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_FILE_NAME,
  },
})
