import { Elysia } from 'elysia'
import { node } from '@elysia/node'
import { env } from '@workspace/config'
import { cors } from '@elysia/cors'
import { openapi } from '@elysia/openapi'
import { betterAuthImplement, OpenAPI } from '@/lib/auth'

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: process.env.NODE_ENV === 'production' ? env.PUBLIC_APP_URL! : true,
    })
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .use(betterAuthImplement)
  .get('/', () => 'Hi')
  .listen(8000)
