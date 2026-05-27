import { drizzle } from 'drizzle-orm/libsql'
import { env } from '@workspace/config'

export const Database = drizzle(env.DATABASE_FILE_NAME)
