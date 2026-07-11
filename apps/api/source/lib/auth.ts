import { auth } from '@workspace/auth/server'
import { Elysia } from 'elysia'
import type { OpenAPIV3 } from 'openapi-types'

export const authPlugin = new Elysia({ name: 'auth-plugin' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      })
      if (!session) return status(401)
      return {
        user: session.user,
        session: session.session,
      }
    },
  },
})

export const betterAuthImplement = new Elysia({ name: 'better-auth' }).mount('/auth', auth.handler).use(authPlugin)

type AuthSchema = Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>>
type AuthPath = AuthSchema['paths'][string]

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
  getPaths: (prefix = '/auth') =>
    getSchema().then(({ paths }) => {
      const reference: Record<string, AuthPath> = Object.create(null)
      for (const path of Object.keys(paths)) {
        const key = prefix + path
        const p = paths[path]
        if (!p) continue
        reference[key] = p
        for (const method of Object.keys(p) as Array<keyof AuthPath>) {
          const operation = p[method]
          if (operation) {
            operation.tags = ['Authentication']
          }
        }
      }
      return reference as OpenAPIV3.PathsObject
    }),
  components: getSchema().then(
    ({ components }) => components as unknown as OpenAPIV3.ComponentsObject
  ),
}
