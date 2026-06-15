import { Database } from '@workspace/database'
import { project, item, comparison } from '@workspace/database/schema'
import { eq, and, sql } from 'drizzle-orm'

type CreateProjectBody = {
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
