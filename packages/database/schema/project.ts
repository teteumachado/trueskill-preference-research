import { relations, sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { user } from './auth'

export const project = sqliteTable('project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
})

export const item = sqliteTable(
  'item',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    mu: real('mu').default(25.0).notNull(),
    sigma: real('sigma').default(8.333).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('item_project_id_idx').on(table.projectId)]
)

export const comparison = sqliteTable(
  'comparison',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    itemAId: text('item_a_id')
      .notNull()
      .references(() => item.id),
    itemBId: text('item_b_id')
      .notNull()
      .references(() => item.id),
    winnerId: text('winner_id')
      .notNull()
      .references(() => item.id),
    voterId: text('voter_id').references(() => user.id),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index('comparison_project_id_idx').on(table.projectId),
    index('comparison_item_a_id_idx').on(table.itemAId),
    index('comparison_item_b_id_idx').on(table.itemBId),
  ]
)

export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.createdBy],
    references: [user.id],
  }),
  items: many(item),
  comparisons: many(comparison),
}))

export const itemRelations = relations(item, ({ one }) => ({
  project: one(project, {
    fields: [item.projectId],
    references: [project.id],
  }),
}))

export const comparisonRelations = relations(comparison, ({ one }) => ({
  project: one(project, {
    fields: [comparison.projectId],
    references: [project.id],
  }),
  itemA: one(item, {
    fields: [comparison.itemAId],
    references: [item.id],
  }),
  itemB: one(item, {
    fields: [comparison.itemBId],
    references: [item.id],
  }),
  winner: one(item, {
    fields: [comparison.winnerId],
    references: [item.id],
  }),
  voter: one(user, {
    fields: [comparison.voterId],
    references: [user.id],
  }),
}))
