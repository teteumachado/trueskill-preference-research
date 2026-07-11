import { Elysia } from 'elysia'
import { z } from 'zod'
import {
  getProjects,
  getProjectById,
  createProject,
  getItems,
  createItem,
  deleteItem,
  updateItem,
  createComparison,
  getNextPair,
  getProjectStats,
  getRankedItems,
} from './projects.service'
import { authPlugin } from '@/lib/auth'
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

const createItemBodySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
})

const updateItemBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

const itemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  mu: z.number(),
  sigma: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const projectsRoutes = new Elysia({ name: 'projects', prefix: '/projects' })
  .use(authPlugin)
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
  .get('/:id', async ({ user, params, set }) => {
    const result = await getProjectById(params.id, user.id)
    if (!result) {
      set.status = 404
      return { error: 'Not found' }
    }
    return result
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    detail: {
      tags: ['Projects'],
      summary: 'Get project by ID',
      description: 'Returns a single project by ID if it belongs to the authenticated user.',
    },
  })
  .get('/:id/items', async ({ user, params }) => {
    return getItems(params.id, user.id)
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    response: itemSchema.array(),
    detail: {
      tags: ['Items'],
      summary: 'List items',
      description: 'Returns all items for a project.',
    },
  })
  .get('/:id/items/ranking', async ({ user, params }) => {
    return getRankedItems(params.id, user.id)
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    detail: {
      tags: ['Items'],
      summary: 'Get ranked items',
      description: 'Returns items ranked by TrueSkill conservative rating.',
    },
  })
  .post('/:id/items', async ({ user, params, body, set }) => {
    const result = await createItem(params.id, user.id, body)
    set.status = 201
    return result
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    body: createItemBodySchema,
    response: {
      201: itemSchema,
    },
    detail: {
      tags: ['Items'],
      summary: 'Create item',
      description: 'Creates a new item in a project.',
    },
  })
  .delete('/:id/items/:itemId', async ({ user, params, set }) => {
    await deleteItem(params.id, params.itemId, user.id)
    set.status = 204
  }, {
    auth: true,
    params: z.object({ id: z.string(), itemId: z.string() }),
    detail: {
      tags: ['Items'],
      summary: 'Delete item',
      description: 'Deletes an item from a project.',
    },
  })
  .put('/:id/items/:itemId', async ({ user, params, body }) => {
    return updateItem(params.id, params.itemId, user.id, body)
  }, {
    auth: true,
    params: z.object({ id: z.string(), itemId: z.string() }),
    body: updateItemBodySchema,
    response: itemSchema,
    detail: {
      tags: ['Items'],
      summary: 'Update item',
      description: 'Updates an item in a project.',
    },
  })
  .get('/:id/next-pair', async ({ user, params, set }) => {
    const result = await getNextPair(params.id, user.id)
    if (result === null) {
      set.status = 204
      return
    }
    return result
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    detail: {
      tags: ['Comparisons'],
      summary: 'Get next pair',
      description: 'Returns the most informative next pair to compare.',
    },
  })
  .get('/:id/stats', async ({ user, params, query }) => {
    return getProjectStats(params.id, user.id, query.period)
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    query: z.object({
      period: z.enum(['24h', '7d', '30d', 'all']).default('7d'),
    }),
    detail: {
      tags: ['Projects'],
      summary: 'Get project stats',
      description: 'Returns aggregated stats for a project.',
    },
  })
  .post('/:id/comparisons', async ({ user, params, body, set }) => {
    const result = await createComparison(params.id, user.id, body.itemAId, body.itemBId, body.winnerId)
    set.status = 201
    return result
  }, {
    auth: true,
    params: z.object({ id: z.string() }),
    body: z.object({
      itemAId: z.string(),
      itemBId: z.string(),
      winnerId: z.string(),
    }),
    detail: {
      tags: ['Comparisons'],
      summary: 'Create comparison',
      description: 'Registers a vote and updates TrueSkill ratings.',
    },
  })
