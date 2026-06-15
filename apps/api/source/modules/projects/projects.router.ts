import { Elysia } from 'elysia'
import { z } from 'zod'
import { getProjects, getProjectById, createProject } from './projects.service'
import { betterAuthImplement } from '@/lib/auth'
import { projectInsertSchema } from '@workspace/database/schema'

export const projectsRoutes = (
  new Elysia({ name: 'projects', prefix: '/projects' }) as unknown as typeof betterAuthImplement
)
  .get('/', async ({ user }) => getProjects(user.id), { auth: true })
  .post('/', async ({ user, body }) => createProject(user.id, body), { auth: true, body: projectInsertSchema.omit({ createdBy: true }) })
  .get('/:id', async ({ user, params }) => {
    return getProjectById(params.id, user.id)
  }, { auth: true, params: z.object({ id: z.string() }) })
