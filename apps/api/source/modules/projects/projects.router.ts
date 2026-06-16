import { Elysia } from 'elysia'
import { z } from 'zod'
import { getProjects, getProjectById, createProject } from './projects.service'
import { betterAuthImplement } from '@/lib/auth'

const createProjectBodySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
})

const projectListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  itemCount: z.number(),
  comparisonCount: z.number(),
})

const createdProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const projectsRoutes = new Elysia({ name: 'projects', prefix: '/projects' })
  .use(betterAuthImplement)
  .get('/', async ({ user }) => getProjects(user.id), {
    auth: true,
    response: projectListItemSchema.array(),
    detail: {
      tags: ['Projects'],
      summary: 'List projects',
      description: 'Returns all projects belonging to the authenticated user.',
    },
  })
  .post('/', async ({ user, body, set }) => {
    const [project] = await createProject(user.id, body)
    set.status = 201
    return project
  }, {
    auth: true,
    body: createProjectBodySchema,
    response: {
      201: createdProjectSchema,
    },
    detail: {
      tags: ['Projects'],
      summary: 'Create a project',
      description: 'Creates a new project for the authenticated user.',
    },
  })
  .get('/:id', async ({ user, params }) => {
    return getProjectById(params.id, user.id)
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    response: projectListItemSchema.nullable(),
    detail: {
      tags: ['Projects'],
      summary: 'Get project by ID',
      description: 'Returns a single project by ID if it belongs to the authenticated user.',
    },
  })
