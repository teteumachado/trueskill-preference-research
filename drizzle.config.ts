import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './packages/database/schema/index.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_FILE_NAME!,
  },
})
