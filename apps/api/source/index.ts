import { Elysia } from 'elysia'
import { node } from '@elysia/node'
import { cors } from '@elysia/cors'
import { openapi } from '@elysia/openapi'
import { betterAuthImplement, OpenAPI } from '@/lib/auth'
import { projectsRoutes } from '@/modules/projects/projects.router'
import { zodToJsonSchema } from 'zod-to-json-schema'

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: process.env.NODE_ENV === 'production' ? process.env.PUBLIC_APP_URL! : true,
      credentials: true,
    })
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: 'TrueSkill Preference Research API',
          version: '1.0.0',
        },
        tags: [
          { name: 'Authentication', description: 'Sign in, sign up, and session management.' },
          { name: 'Projects', description: 'Create and manage comparison projects.' },
        ],
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
      mapJsonSchema: {
        zod: (schema: any) => zodToJsonSchema(schema, { target: 'openApi3' })
      }
    })
  )
  .use(betterAuthImplement)
  .use(projectsRoutes)
  .get('/', () => 'Hi')
  .listen(8000)
