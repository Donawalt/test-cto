# 📚 Type Generation System

The MyApp monorepo includes a comprehensive **automatic type generation system** that creates TypeScript interfaces, Zod validators, Drizzle schemas, API types, and mock data from your schema definitions.

## 🚀 Quick Start

### 1. Define Your Schemas

Create schema files in `packages/schema/src/schemas/`:

```typescript
// packages/schema/src/schemas/users.ts
import { defineTable, schemaBuilder } from '../builder'

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
    role: {
      name: 'role',
      type: 'enum',
      required: true,
      default: 'user',
      enumValues: ['user', 'admin', 'moderator']
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      required: true,
      default: 'now()'
    }
  }
})

// Register with schemaBuilder
schemaBuilder.defineTable(users)
```

### 2. Generate Types

```bash
# Generate types once
pnpm types:generate

# Watch mode (auto-regenerate on changes)
pnpm types:watch

# Start dev with auto-generation
pnpm dev:watch
```

### 3. Use Generated Types

```typescript
// In your application
import type { Users } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { usersTable } from '@myapp/db'

// Type-safe data
const user: Users = await fetchUser()

// Validation
UsersSchema.parse(userData)

// Database queries
const users = await db.select().from(usersTable)
```

## 🔧 CLI Commands

### Type Generation

```bash
# Generate types from schemas
pnpm types:generate

# Watch mode (auto-regenerate)
pnpm types:watch

# Generate with custom output
pnpm --filter=@myapp/schema generate --output ./custom/path
```

### Migration Management

```bash
# Create new migration
pnpm migrate:create --name AddUserProfile

# Run migrations
pnpm migrate:run
```

### Development Workflow

```bash
# Start dev with auto type generation
pnpm dev:watch

# This runs both:
# - pnpm types:watch (auto-regenerates)
# - turbo run dev --parallel (all packages)
```

## 📝 Schema Definition

### Column Types

| Type | Database | TypeScript | Zod | Description |
|------|----------|------------|-----|-------------|
| `uuid` | `uuid` | `string` | `z.string().uuid()` | Unique identifier |
| `string` | `varchar` | `string` | `z.string()` | Text with optional length |
| `text` | `text` | `string` | `z.string()` | Long text |
| `integer` | `integer` | `number` | `z.number().int()` | Whole numbers |
| `float` | `numeric` | `number` | `z.number()` | Decimal numbers |
| `boolean` | `boolean` | `boolean` | `z.boolean()` | True/false |
| `date` | `date` | `Date` | `z.date()` | Date only |
| `timestamp` | `timestamp` | `Date` | `z.date()` | Date with time |
| `enum` | `varchar` | `string` | `z.enum([...])` | Predefined values |
| `json` | `jsonb` | `any` | `z.any()` | JSON data |
| `array` | `jsonb` | `any[]` | `z.array(z.any())` | Array data |

### Column Options

```typescript
{
  name: 'email',
  type: 'string',
  required: true,        // Not null in DB, required in TS
  unique: true,          // Unique constraint
  primaryKey: false,     // Primary key
  default: 'default',   // Default value
  length: 255,           // String length limit
  enumValues: ['a', 'b'] // For enum types
}
```

### Relationships

```typescript
{
  relationships: {
    posts: {
      type: 'hasMany',      // hasOne, hasMany, belongsTo, manyToMany
      target: 'posts',      // Target table name
      foreignKey: 'authorId', // Foreign key column
      through: 'user_posts'  // Junction table for manyToMany
    }
  }
}
```

## 📁 Generated Files

The type generator creates these files in `packages/types/src/generated/`:

### `types.ts` - TypeScript Interfaces
```typescript
export interface Users {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'moderator'
  created_at: Date
}
```

### `validators.ts` - Zod Schemas
```typescript
export const UsersSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'admin', 'moderator']),
  created_at: z.date()
})
```

### `api.ts` - API Types
```typescript
export namespace UsersAPI {
  export const ENDPOINT = '/users'
  
  export interface CreateBody {
    email: string
    name: string
    role?: 'user' | 'admin' | 'moderator'
  }
  
  export interface UpdateBody {
    email?: string
    name?: string
    role?: 'user' | 'admin' | 'moderator'
  }
  
  export interface Response extends Users {}
}
```

### `drizzle.ts` - Database Schemas
```typescript
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  created_at: timestamp('created_at').defaultNow()
})
```

### `mocks.ts` - Mock Data
```typescript
export function createMockUsers(overrides?: Partial<Users>): Users {
  return {
    id: crypto.randomUUID(),
    email: `user-${Math.random()}@example.com`,
    name: 'Test User',
    role: 'user',
    created_at: new Date(),
    ...overrides
  }
}
```

## 🔄 Workflow Examples

### Adding a New Entity

1. **Create schema:**
```bash
# packages/schema/src/schemas/products.ts
export const products = defineTable({
  name: 'products',
  columns: {
    id: { name: 'id', type: 'uuid', required: true, primaryKey: true },
    name: { name: 'name', type: 'string', required: true, length: 255 },
    price: { name: 'price', type: 'float', required: true }
  }
})
schemaBuilder.defineTable(products)
```

2. **Generate types (automatic in dev):**
```bash
pnpm types:generate
```

3. **Use immediately:**
```typescript
import type { Products } from '@myapp/types'
import { ProductsSchema } from '@myapp/types'

const product: Products = {
  id: 'uuid',
  name: 'Product Name',
  price: 99.99
}

ProductsSchema.parse(product) // ✅ Valid!
```

### Schema Evolution

When you modify a schema:

1. **Edit** `packages/schema/src/schemas/users.ts`
2. **Auto-regenerate** (if using watch mode)
3. **Types update instantly** in your IDE
4. **No manual synchronization** needed

### CI/CD Integration

```yaml
# .github/workflows/build.yml
- name: Generate Types
  run: pnpm types:generate

- name: Type Check
  run: pnpm types:check

- name: Build
  run: pnpm build
```

## 🏗️ Architecture

```
packages/
├── schema/           # Schema definitions + CLI
│   ├── src/
│   │   ├── schemas/  # Your schema files (.ts)
│   │   ├── builder.ts # Schema builder API
│   │   └── cli.ts     # CLI for generation
│   └── package.json
├── types/            # Generated types
│   └── src/
│       └── generated/ # Auto-generated files
└── db/               # Database utilities
    └── src/generated/ # Auto-generated Drizzle schemas
```

## 🔍 Troubleshooting

### Common Issues

**Schema not being loaded:**
- Check file is in `packages/schema/src/schemas/`
- Ensure file exports using `defineTable()`
- Verify schema is registered with `schemaBuilder.defineTable()`

**Types not updating:**
- Run `pnpm types:generate` manually
- Check for TypeScript errors in schema files
- Verify output path in CLI

**Import errors:**
- Ensure `@myapp/types` is up to date
- Check generated files exist in `packages/types/src/generated/`
- Restart TypeScript server in your IDE

### Debug Mode

```bash
# Verbose output
pnpm --filter=@myapp/schema generate --verbose

# Check loaded schemas
pnpm --filter=@myapp/schema generate --debug
```

## 📚 Advanced Usage

### Custom Column Types

```typescript
// Extend the builder for custom types
export function email() {
  return column('string').custom('email').validate('email')
}
```

### Schema Validation

```typescript
// Validate schema before generating
const schema = defineTable({...})
const validated = TableDefinitionSchema.parse(schema)
```

### Batch Operations

```typescript
// Load multiple schemas
for (const file of fs.readdirSync(schemasDir)) {
  if (file.endsWith('.ts')) {
    await import(join(schemasDir, file))
  }
}
```

---

This type generation system ensures **type safety throughout your entire application**, with **zero manual synchronization** and **instant updates** when schemas change.