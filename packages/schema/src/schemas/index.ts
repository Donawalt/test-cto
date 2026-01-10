import { defineTable, schemaBuilder } from '../builder'

// Users schema definition using the new builder pattern
export const users = defineTable({
  name: 'users',
  description: 'User accounts and profiles',
  columns: {
    id: {
      name: 'id',
      type: 'uuid',
      required: true,
      primaryKey: true,
      default: 'uuid()'
    },
    email: {
      name: 'email',
      type: 'string',
      required: true,
      unique: true,
      length: 255
    },
    name: {
      name: 'name',
      type: 'string',
      required: true,
      length: 100
    },
    password: {
      name: 'password',
      type: 'string',
      required: true
    },
    role: {
      name: 'role',
      type: 'enum',
      required: true,
      default: 'user',
      enumValues: ['user', 'admin', 'moderator']
    },
    avatar: {
      name: 'avatar',
      type: 'string',
      required: false
    },
    bio: {
      name: 'bio',
      type: 'text',
      required: false
    },
    isActive: {
      name: 'is_active',
      type: 'boolean',
      required: true,
      default: true
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    }
  },
  relationships: {
    posts: {
      type: 'hasMany',
      target: 'posts',
      foreignKey: 'authorId'
    },
    comments: {
      type: 'hasMany',
      target: 'comments',
      foreignKey: 'authorId'
    }
  }
})

// Posts schema
export const posts = defineTable({
  name: 'posts',
  description: 'Blog posts and articles',
  columns: {
    id: {
      name: 'id',
      type: 'uuid',
      required: true,
      primaryKey: true,
      default: 'uuid()'
    },
    title: {
      name: 'title',
      type: 'string',
      required: true,
      length: 255
    },
    content: {
      name: 'content',
      type: 'text',
      required: true
    },
    authorId: {
      name: 'author_id',
      type: 'uuid',
      required: true
    },
    status: {
      name: 'status',
      type: 'enum',
      required: true,
      default: 'draft',
      enumValues: ['draft', 'published', 'archived']
    },
    publishedAt: {
      name: 'published_at',
      type: 'timestamp',
      required: false
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    }
  },
  relationships: {
    author: {
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'authorId'
    },
    comments: {
      type: 'hasMany',
      target: 'comments',
      foreignKey: 'postId'
    }
  }
})

// Comments schema
export const comments = defineTable({
  name: 'comments',
  description: 'Comments on posts',
  columns: {
    id: {
      name: 'id',
      type: 'uuid',
      required: true,
      primaryKey: true,
      default: 'uuid()'
    },
    content: {
      name: 'content',
      type: 'text',
      required: true
    },
    authorId: {
      name: 'author_id',
      type: 'uuid',
      required: true
    },
    postId: {
      name: 'post_id',
      type: 'uuid',
      required: true
    },
    parentId: {
      name: 'parent_id',
      type: 'uuid',
      required: false
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    }
  },
  relationships: {
    author: {
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'authorId'
    },
    post: {
      type: 'belongsTo',
      target: 'posts',
      foreignKey: 'postId'
    },
    parent: {
      type: 'belongsTo',
      target: 'comments',
      foreignKey: 'parentId'
    },
    replies: {
      type: 'hasMany',
      target: 'comments',
      foreignKey: 'parentId'
    }
  }
})

// Register all schemas with the schemaBuilder
schemaBuilder.defineTable(users)
schemaBuilder.defineTable(posts)
schemaBuilder.defineTable(comments)

// Export all schemas
export const schemas = {
  users,
  posts,
  comments
}

export default schemas