import { Database } from '@workspace/database'
import { project, item, comparison } from '@workspace/database/schema'
import { eq, and, sql } from 'drizzle-orm'

type CreateProjectBody = {
  name: string
  description?: string
}

type CreateItemBody = {
  name: string
  description?: string
}

export async function getProjects(userId: string) {
  return Database
    .select({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      itemCount: sql<number>`
        (SELECT count(*) FROM ${item} WHERE ${item.projectId} = ${project.id})
      `,
      comparisonCount: sql<number>`
        (SELECT count(*) FROM ${comparison} WHERE ${comparison.projectId} = ${project.id})
      `,
    })
    .from(project)
    .where(eq(project.createdBy, userId))
    .orderBy(project.createdAt)
}

export async function createProject(userId: string, body: CreateProjectBody) {
  return Database.insert(project).values({
    name: body.name,
    description: body.description,
    createdBy: userId
  }).returning()
}

export async function getProjectById(id: string, userId: string) {
  const [result] = await Database
    .select({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      itemCount: sql<number>`
        (SELECT count(*) FROM ${item} WHERE ${item.projectId} = ${project.id})
      `,
      comparisonCount: sql<number>`
        (SELECT count(*) FROM ${comparison} WHERE ${comparison.projectId} = ${project.id})
      `,
    })
    .from(project)
    .where(and(eq(project.id, id), eq(project.createdBy, userId)))
    .limit(1)

  return result ?? null
}

export async function getItems(projectId: string, userId: string) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  return Database
    .select()
    .from(item)
    .where(eq(item.projectId, projectId))
    .orderBy(item.createdAt)
}

export async function createItem(projectId: string, userId: string, body: CreateItemBody) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const [result] = await Database.insert(item).values({
    projectId,
    name: body.name,
    description: body.description ?? null,
  }).returning()

  return result
}

export async function deleteItem(projectId: string, itemId: string, userId: string) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const [result] = await Database
    .delete(item)
    .where(and(eq(item.id, itemId), eq(item.projectId, projectId)))
    .returning({ id: item.id })

  if (!result) throw new Error('NOT_FOUND')
}
