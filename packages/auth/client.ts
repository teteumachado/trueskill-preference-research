import { env } from '@workspace/config'
import { createAuthClient } from 'better-auth/react'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: env.API_URL,
})
