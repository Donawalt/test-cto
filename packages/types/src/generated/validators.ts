// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import { z } from 'zod'

export const UsersSchema = z.object({
  id: z.string().uuid(),
  email: z.string().max(255),
  name: z.string().max(100),
  password: z.string(),
  role: z.enum(['user', 'admin', 'moderator']),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type Users = z.infer<typeof UsersSchema>

export const PostsSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(255),
  content: z.string(),
  author_id: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type Posts = z.infer<typeof PostsSchema>

export const CommentsSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  author_id: z.string().uuid(),
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

export type Comments = z.infer<typeof CommentsSchema>

