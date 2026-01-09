# @myapp/db

Drizzle ORM with multi-database support (PostgreSQL, MySQL, SQLite).

## Installation

```bash
# Install base package
pnpm add @myapp/db

# Install database driver (choose one or more)
pnpm add postgres        # PostgreSQL
pnpm add mysql2          # MySQL
pnpm add better-sqlite3  # SQLite
```

## Database Setup

### PostgreSQL

```typescript
import postgres from 'postgres';
import { createDatabase } from '@myapp/db';

const connection = postgres('postgresql://localhost:5432/myapp');

const db = createDatabase({
  type: 'postgres',
  connection,
});
```

### MySQL

```typescript
import mysql from 'mysql2/promise';
import { createDatabase } from '@myapp/db';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'myapp',
});

const db = createDatabase({
  type: 'mysql',
  connection,
});
```

### SQLite

```typescript
import Database from 'better-sqlite3';
import { createDatabase } from '@myapp/db';

const connection = new Database('myapp.db');

const db = createDatabase({
  type: 'sqlite',
  connection,
});
```

## Schema Definition

```typescript
// packages/db/src/schema.ts
import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  passwordSalt: varchar('password_salt', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Query Examples

### Select

```typescript
import { users, posts } from '@myapp/db';
import { eq, and, or, gt, like } from '@myapp/db';

// Select all
const allUsers = await db.select().from(users);

// Select with where
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.active, true));

// Select specific fields
const userNames = await db
  .select({
    id: users.id,
    name: users.name,
  })
  .from(users);

// Complex where
const results = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.active, true),
      gt(users.createdAt, new Date('2024-01-01'))
    )
  );
```

### Insert

```typescript
// Insert one
const [newUser] = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: 'hash',
    passwordSalt: 'salt',
  })
  .returning();

// Insert multiple
const newUsers = await db
  .insert(users)
  .values([
    { email: 'user1@example.com', name: 'User 1', /* ... */ },
    { email: 'user2@example.com', name: 'User 2', /* ... */ },
  ])
  .returning();
```

### Update

```typescript
// Update with where
const [updated] = await db
  .update(users)
  .set({ name: 'Jane Doe', updatedAt: new Date() })
  .where(eq(users.id, userId))
  .returning();

// Update multiple
await db
  .update(users)
  .set({ active: false })
  .where(eq(users.role, 'guest'));
```

### Delete

```typescript
// Delete with where
const [deleted] = await db
  .delete(users)
  .where(eq(users.id, userId))
  .returning();

// Delete multiple
await db
  .delete(users)
  .where(eq(users.active, false));
```

### Joins

```typescript
// Inner join
const postsWithAuthors = await db
  .select({
    post: posts,
    author: users,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id));

// Left join
const allPostsWithAuthors = await db
  .select()
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id));
```

### Pagination

```typescript
const page = 1;
const limit = 20;
const offset = (page - 1) * limit;

const paginatedUsers = await db
  .select()
  .from(users)
  .limit(limit)
  .offset(offset)
  .orderBy(users.createdAt);
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ /* ... */ })
    .returning();
  
  await tx
    .insert(posts)
    .values({
      title: 'First Post',
      content: 'Content',
      authorId: user.id,
    });
});
```

## Migrations

### Generate Migration

```bash
cd packages/db
pnpm drizzle-kit generate:pg
```

### Configuration

Migrations are configured in `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp',
  },
} satisfies Config;
```

### Run Migrations

```bash
pnpm drizzle-kit push:pg    # PostgreSQL
pnpm drizzle-kit push:mysql  # MySQL
pnpm drizzle-kit push:sqlite # SQLite
```

## Type Safety

Drizzle provides full type safety:

```typescript
// ✅ Type-safe
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// ❌ TypeScript error: 'invalidField' does not exist
const invalid = await db
  .select()
  .from(users)
  .where(eq(users.invalidField, 'value'));
```

## Best Practices

1. **Always use transactions** for related operations
2. **Use returning()** to get inserted/updated data
3. **Index frequently queried columns**
4. **Use prepared statements** for repeated queries
5. **Validate data** before insertion (use Zod schemas)

## Connection Pooling

### PostgreSQL

```typescript
const connection = postgres('postgresql://localhost:5432/myapp', {
  max: 10, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10,
});
```

### MySQL

```typescript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

## Environment Variables

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/myapp

# SQLite
DATABASE_URL=file:./myapp.db
```

## Type Generation

Database types are automatically inferred from schema definitions. No code generation needed!

```typescript
import { users } from '@myapp/db';

// Type is inferred automatically
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```
