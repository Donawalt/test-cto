// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import { pgTable, uuid, varchar, text, integer, numeric, boolean, date, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('userss', {
  id: uuid.primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  name: varchar('name', { length: 100 }),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }).default(() => 'user'),
  avatar: varchar('avatar', { length: 255 }).notNull(),
  bio: text.notNull(),
  is_active: boolean.default(() => 'true'),
  created_at: timestamp.defaultNow(),
  updated_at: timestamp.defaultNow(),
})

export type Users = typeof usersTable.$inferSelect
export type CreateUsers = typeof usersTable.$inferInsert

export const postsTable = pgTable('postss', {
  id: uuid.primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }),
  content: text,
  author_id: uuid,
  status: varchar('status', { length: 50 }).default(() => 'draft'),
  published_at: timestamp.notNull(),
  created_at: timestamp.defaultNow(),
  updated_at: timestamp.defaultNow(),
})

export type Posts = typeof postsTable.$inferSelect
export type CreatePosts = typeof postsTable.$inferInsert

export const commentsTable = pgTable('commentss', {
  id: uuid.primaryKey().defaultRandom(),
  content: text,
  author_id: uuid,
  post_id: uuid,
  parent_id: uuid.notNull(),
  created_at: timestamp.defaultNow(),
  updated_at: timestamp.defaultNow(),
})

export type Comments = typeof commentsTable.$inferSelect
export type CreateComments = typeof commentsTable.$inferInsert

