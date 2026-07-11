import { Database } from '@workspace/database'
import { project, item, comparison } from '@workspace/database/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { update as trueskillUpdate, nextPair } from '@workspace/trueskill'

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

  await Database.transaction(async (tx) => {
    await tx
      .delete(comparison)
      .where(and(
        eq(comparison.projectId, projectId),
        sql`(${comparison.itemAId} = ${itemId} OR ${comparison.itemBId} = ${itemId} OR ${comparison.winnerId} = ${itemId})`,
      ))

    const [result] = await tx
      .delete(item)
      .where(and(eq(item.id, itemId), eq(item.projectId, projectId)))
      .returning({ id: item.id })

    if (!result) throw new Error('NOT_FOUND')
  })
}

type UpdateItemBody = {
  name?: string
  description?: string | null
}

export async function updateItem(projectId: string, itemId: string, userId: string, body: UpdateItemBody) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const [result] = await Database
    .update(item)
    .set(body)
    .where(and(eq(item.id, itemId), eq(item.projectId, projectId)))
    .returning()

  if (!result) throw new Error('NOT_FOUND')
  return result
}

export async function createComparison(
  projectId: string,
  userId: string,
  itemAId: string,
  itemBId: string,
  winnerId: string,
) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const [winnerItem, loserItem] = await Promise.all([
    Database.select().from(item).where(eq(item.id, winnerId)).limit(1).then(rows => rows[0]),
    Database.select().from(item).where(
      and(eq(item.projectId, projectId), inArray(item.id, [itemAId, itemBId]), sql`${item.id} != ${winnerId}`)
    ).limit(1).then(rows => rows[0]),
  ])

  if (!winnerItem || !loserItem) throw new Error('NOT_FOUND')

  const pairIds = [itemAId, itemBId].sort()
  const [existing] = await Database
    .select({ id: comparison.id })
    .from(comparison)
    .where(and(
      eq(comparison.projectId, projectId),
      eq(comparison.itemAId, pairIds[0]!),
      eq(comparison.itemBId, pairIds[1]!),
    ))
    .limit(1)

  if (existing) throw new Error('ALREADY_VOTED')

  const result = trueskillUpdate(
    { mu: winnerItem.mu, sigma: winnerItem.sigma },
    { mu: loserItem.mu, sigma: loserItem.sigma },
  )

  await Database.transaction(async (tx) => {
    await tx.insert(comparison).values({
      projectId,
      itemAId,
      itemBId,
      winnerId,
      voterId: userId,
    })

    await tx
      .update(item)
      .set({ mu: result.winner.mu, sigma: result.winner.sigma })
      .where(eq(item.id, winnerItem.id))

    await tx
      .update(item)
      .set({ mu: result.loser.mu, sigma: result.loser.sigma })
      .where(eq(item.id, loserItem.id))
  })

  return {
    winner: { ...winnerItem, mu: result.winner.mu, sigma: result.winner.sigma },
    loser: { ...loserItem, mu: result.loser.mu, sigma: result.loser.sigma },
  }
}

export async function getNextPair(projectId: string, userId: string) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const items = await Database
    .select()
    .from(item)
    .where(eq(item.projectId, projectId))

  if (items.length < 2) return null

  const uniquePairs = await Database
    .select({ itemAId: comparison.itemAId, itemBId: comparison.itemBId })
    .from(comparison)
    .where(eq(comparison.projectId, projectId))

  const uniquePairCount = new Set(uniquePairs.map(p => [p.itemAId, p.itemBId].sort().join(':'))).size
  const totalPairs = (items.length * (items.length - 1)) / 2

  if (uniquePairCount >= totalPairs) return null

  const [a, b] = nextPair(items)

  return { itemA: a, itemB: b }
}

export async function getProjectStats(
  projectId: string,
  userId: string,
  period: '24h' | '7d' | '30d' | 'all',
) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const now = Date.now()
  const MS_MAP: Record<typeof period, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    'all': 0,
  }
  const cutoff = period === 'all' ? 0 : now - MS_MAP[period]

  const baseConditions = [eq(comparison.projectId, projectId)]
  if (period !== 'all') baseConditions.push(sql`${comparison.createdAt} >= ${cutoff}`)

  const [voterResult] = await Database
    .select({ count: sql<number>`count(DISTINCT ${comparison.voterId})` })
    .from(comparison)
    .where(and(...baseConditions, sql`${comparison.voterId} IS NOT NULL`))

  const [comparisonResult] = await Database
    .select({ count: sql<number>`count(*)` })
    .from(comparison)
    .where(and(...baseConditions))

  const isHourly = period === '24h'
  const timeBucket = isHourly
    ? sql<string>`strftime('%Y-%m-%d %H:00', datetime(${comparison.createdAt} / 1000, 'unixepoch'))`
    : sql<string>`strftime('%Y-%m-%d', datetime(${comparison.createdAt} / 1000, 'unixepoch'))`

  const timeSeries = await Database
    .select({
      date: timeBucket,
      count: sql<number>`count(*)`,
    })
    .from(comparison)
    .where(and(...baseConditions))
    .groupBy(timeBucket)
    .orderBy(timeBucket)

  return {
    voterCount: voterResult?.count ?? 0,
    comparisonCount: comparisonResult?.count ?? 0,
    comparisonsOverTime: timeSeries,
  }
}

export async function getRankedItems(projectId: string, userId: string) {
  const [owner] = await Database
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.createdBy, userId)))
    .limit(1)

  if (!owner) throw new Error('NOT_FOUND')

  const [items, comparisons] = await Promise.all([
    Database
      .select()
      .from(item)
      .where(eq(item.projectId, projectId))
      .orderBy(
        sql`(${item.mu} - 3.0 * ${item.sigma}) DESC, ${item.mu} DESC`,
      ),
    Database
      .select({ itemAId: comparison.itemAId, itemBId: comparison.itemBId })
      .from(comparison)
      .where(eq(comparison.projectId, projectId)),
  ])

  const voteCounts: Record<string, number> = {}
  for (const c of comparisons) {
    voteCounts[c.itemAId] = (voteCounts[c.itemAId] ?? 0) + 1
    voteCounts[c.itemBId] = (voteCounts[c.itemBId] ?? 0) + 1
  }

  return items.map((it, i) => ({
    id: it.id,
    projectId: it.projectId,
    name: it.name,
    description: it.description,
    imageUrl: it.imageUrl,
    mu: it.mu,
    sigma: it.sigma,
    createdAt: it.createdAt,
    updatedAt: it.updatedAt,
    rank: i + 1,
    voteCount: voteCounts[it.id] ?? 0,
    conservativeRating: Number((it.mu - 3 * it.sigma).toFixed(2)),
  }))
}
