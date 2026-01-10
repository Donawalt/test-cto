// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import { pgTable, uuid, varchar, text, integer, numeric, boolean, date, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  avatar: varchar('avatar', { length: 255 }),
  bio: text('bio'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export type Users = typeof usersTable.$inferSelect
export type CreateUsers = typeof usersTable.$inferInsert

export const postsTable = pgTable('posts', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  author_id: uuid('author_id').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export type Posts = typeof postsTable.$inferSelect
export type CreatePosts = typeof postsTable.$inferInsert

export const commentsTable = pgTable('comments', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  content: text('content').notNull(),
  author_id: uuid('author_id').notNull(),
  post_id: uuid('post_id').notNull(),
  parent_id: uuid('parent_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export type Comments = typeof commentsTable.$inferSelect
export type CreateComments = typeof commentsTable.$inferInsert

