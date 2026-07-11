import { Elysia } from 'elysia'
import { node } from '@elysia/node'
import { cors } from '@elysia/cors'
import { openapi } from '@elysia/openapi'
import { betterAuthImplement, OpenAPI } from '@/lib/auth'
import { projectsRoutes } from '@/modules/projects/projects.router'
import * as z from 'zod'

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
        zod: (schema: any) => z.toJSONSchema(schema, { unrepresentable: 'any' })
      }
    })
  )
  .onError(({ error, code, set, request }) => {
    console.error('[Elysia Error]', code, error?.constructor?.name, error, request?.url)

    if (code === 'NOT_FOUND') {
      set.status = 404
      return { error: 'Not found' }
    }

    if (code === 'VALIDATION') {
      set.status = 422
      const zodError = error as { issues?: Array<{ message: string; path: (string | number)[] }> }
      return {
        error: 'Validation failed',
        details: zodError.issues ?? [],
      }
    }

    if (error instanceof Error && error.message === 'NOT_FOUND') {
      set.status = 404
      return { error: 'Not found' }
    }

    if (error instanceof Error && error.message === 'ALREADY_VOTED') {
      set.status = 409
      return { error: 'You already voted on this pair' }
    }

    set.status = 500
    return { error: 'Internal server error' }
  })
  .use(betterAuthImplement)
  .use(projectsRoutes)
  .get('/', () => 'Hi')
  .listen(8000)
