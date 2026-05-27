import { Elysia } from 'elysia'
import { node } from '@elysia/node'
import { env } from '@workspace/config/env'

const app = new Elysia({ adapter: node() })
  .get('/', () => env.DATABASE_URL)
  .listen(8000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`)
  })
