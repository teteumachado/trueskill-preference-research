import { drizzle } from 'drizzle-orm/libsql'

export const Database = drizzle(process.env.DATABASE_FILE_NAME!)
