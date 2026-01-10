# MyApp Universal Monorepo Template

A **complete, production-ready monorepo** with automatic type generation, comprehensive tooling, and 5 ready-to-use templates.

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url> my-project
cd my-project

# Install dependencies
pnpm install

# Generate initial types
pnpm types:generate

# Start development
pnpm dev
```

### 2. Your First Type-Generated API

**Step 1: Define Schema**
```typescript
// packages/schema/src/schemas/users.ts
import { defineTable, schemaBuilder } from '../builder'

export const users = defineTable({
  name: 'users',
  columns: {
    id: { name: 'id', type: 'uuid', required: true, primaryKey: true },
    email: { name: 'email', type: 'string', required: true, unique: true },
    name: { name: 'name', type: 'string', required: true },
    role: { name: 'role', type: 'enum', required: true, enumValues: ['user', 'admin'] }
  }
})

schemaBuilder.defineTable(users)
```

**Step 2: Generate Types**
```bash
pnpm types:generate
```

**Step 3: Use Everywhere**
```typescript
// Server - Full type safety
import { usersTable } from '@myapp/db/generated/drizzle'
import type { Users, UsersAPI } from '@myapp/types'

const user: Users = await db.select().from(usersTable)

// Client - Same types
import type { Users } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

const validUser = UsersSchema.parse(userData)
```

## 📦 What's Included

### 🏗️ Core Architecture
- **8 Production Packages** with 100% TypeScript coverage
- **Automatic Type Generation** from schema definitions
- **Zero-config Development** with watch mode
- **Full CI/CD Ready** with linting, testing, and building

### 🎯 Type Generation System ⭐
```bash
# Automatic type generation from schemas
pnpm types:generate

# Watch mode for instant updates
pnpm types:watch

# Full development workflow
pnpm dev:watch  # Auto-generates + runs all packages
```

### 📚 Complete Documentation
- **20+ Documentation Files** covering every aspect
- **5 Ready-to-Use Templates** for different use cases
- **Comprehensive Examples** with working code
- **Production Deployment Guides** for all major platforms

### 🛠️ Developer Experience
- **Hot Reload** for instant feedback
- **ESLint + Prettier** with shared configs
- **TypeScript Strict Mode** throughout
- **Vitest Testing** setup included

## 🏗️ Package Architecture

```
packages/
├── @myapp/types/          # Type definitions + API contracts
├── @myapp/schema/          # Schema definitions + CLI
├── @myapp/db/             # Database + ORM utilities
├── @myapp/lib/            # Universal utilities
├── @myapp/server-utils/    # Server-side utilities
├── @myapp/tokens/         # Design tokens
├── @myapp/ui/             # UI components (optional)
└── @myapp/hooks/          # React hooks (optional)
```

## 🎨 Templates

### 1. **vite-react** - Modern React App
```bash
cp templates/vite-react my-react-app
cd my-react-app
pnpm dev
```
- React 18 + Vite + TanStack Router
- Tailwind CSS + TypeScript
- Generated types integration

### 2. **astro** - Static Site Generator
```bash
cp templates/astro my-site
cd my-site
pnpm dev
```
- Astro + Tailwind CSS
- Static generation with API integration
- Full type safety

### 3. **library** - NPM Package
```bash
cp templates/library my-lib
cd my-lib
pnpm build
pnpm publish
```
- Full-featured NPM package template
- TypeScript + Rollup + Tsup
- Testing + documentation setup

### 4. **api-server** - Backend API
```bash
cp templates/api-server my-api
cd my-api
pnpm dev
```
- Express + Drizzle ORM
- Authentication + validation
- Comprehensive testing

### 5. **bedrock-sage** - Full Stack ⭐
```bash
cp templates/bedrock-sage my-app
cd my-app
pnpm dev
```
- **Complete full-stack application**
- Bedrock (backend) + Sage (frontend)
- Database + API + UI + testing
- Docker deployment ready

## 📁 Documentation Structure

### Root Level (5 Guides)
1. **[README.md](./README.md)** - This overview
2. **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and patterns
4. **[COMMUNICATION.md](./COMMUNICATION.md)** - API design and contracts
5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

### Per Package (8 READMEs)
- **[@myapp/types](./packages/types/README.md)** - Type system
- **[@myapp/schema](./packages/schema/README.md)** - Schema builder
- **[@myapp/db](./packages/db/README.md)** - Database utilities
- **[@myapp/lib](./packages/lib/README.md)** - Universal utilities
- **[@myapp/server-utils](./packages/server-utils/README.md)** - Server tools
- **[@myapp/tokens](./packages/tokens/README.md)** - Design tokens
- **[@myapp/ui](./packages/ui/README.md)** - UI components
- **[@myapp/hooks](./packages/hooks/README.md)** - React hooks

### Per Template (5 Guides)
- **[vite-react](./templates/vite-react/README.md)** - React app template
- **[astro](./templates/astro/README.md)** - Static site template
- **[library](./templates/library/README.md)** - NPM package template
- **[api-server](./templates/api-server/README.md)** - API server template
- **[bedrock-sage](./templates/bedrock-sage/README.md)** - Full-stack template

## 🎯 Key Features

### ✅ Automatic Type Generation
```typescript
// Define once, use everywhere
export const users = defineTable({
  name: 'users',
  columns: {
    id: { name: 'id', type: 'uuid', required: true, primaryKey: true },
    email: { name: 'email', type: 'string', required: true }
  }
})

// Generates:
// - TypeScript interfaces (@myapp/types)
// - Zod validators (@myapp/types)
// - Drizzle schemas (@myapp/db)
// - API types (@myapp/types)
// - Mock data (@myapp/types)
```

### ✅ Type Safety End-to-End
```typescript
// Database → API → Client
const user: Users = await db.select().from(usersTable)
const response = await fetch('/api/users', { body: JSON.stringify(userData) })
const validatedUser = UsersSchema.parse(responseData)
```

### ✅ Development Workflow
```bash
# One command development
pnpm dev:watch

# Auto-generates types and runs all packages
# - Schema watching → Type regeneration
# - Hot reload for all packages
# - Instant feedback
```

### ✅ Production Ready
```bash
# Build everything
pnpm build

# Type check everything
pnpm type-check

# Test everything
pnpm test

# Deploy anywhere
pnpm deploy
```

## 🚀 Technology Stack

### Core
- **Monorepo:** pnpm workspaces + Turborepo
- **Language:** TypeScript 5+ (strict mode)
- **Build:** Vite (library + app modes)
- **Package Manager:** pnpm 8+

### Backend
- **Database:** Drizzle ORM (PostgreSQL + SQLite)
- **Validation:** Zod schemas
- **API:** Express + REST
- **Auth:** JWT + middleware

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS
- **State:** TanStack Query

### Developer Tools
- **Linting:** ESLint + Prettier
- **Testing:** Vitest
- **Type Generation:** Custom CLI
- **Git Hooks:** Pre-commit validation

## 🎯 Use Cases

### 1. **Startups**
```bash
# Quick full-stack app
cp templates/bedrock-sage my-startup
cd my-startup
pnpm dev:watch
```
- Complete full-stack architecture
- Database + API + Frontend
- Type safety throughout
- Ready for production

### 2. **Libraries**
```bash
# NPM package with type generation
cp templates/library my-package
cd my-package
pnpm build && pnpm publish
```
- TypeScript package template
- Automatic type exports
- Comprehensive testing
- Documentation generation

### 3. **APIs**
```bash
# Backend API server
cp templates/api-server my-api
cd my-api
pnpm dev
```
- Express + Drizzle setup
- Authentication included
- Validation middleware
- Comprehensive testing

### 4. **Websites**
```bash
# Static site with dynamic content
cp templates/astro my-site
cd my-site
pnpm build
```
- Astro + Tailwind setup
- Static generation
- API integration
- SEO optimized

### 5. **Apps**
```bash
# Modern React application
cp templates/vite-react my-app
cd my-app
pnpm dev
```
- React 18 + Vite
- Type-safe API calls
- Component library integration
- Testing setup

## 💡 Why This Template?

### Traditional Approach (Painful)
```
1. Define database schema
2. Write API endpoints manually
3. Create TypeScript types manually
4. Write validators manually
5. Create mock data manually
6. Sync everything manually
```

### MyApp Approach (Automatic)
```
1. Define schema once
2. Everything generates automatically:
   ✅ Database schemas
   ✅ TypeScript interfaces
   ✅ Zod validators
   ✅ API types
   ✅ Mock data
   ✅ Type-safe everywhere
```

### Developer Benefits
- **Zero Manual Sync** - Types always match database
- **Instant Feedback** - Schema changes → Type updates
- **Type Safety** - End-to-end validation
- **Productivity** - Focus on business logic, not plumbing

## 🔧 Commands Reference

### Development
```bash
pnpm dev              # Start all packages
pnpm dev:watch        # Auto-generate types + start all
pnpm types:generate    # Generate types from schemas
pnpm types:watch      # Watch schemas and auto-regenerate
```

### Building
```bash
pnpm build            # Build all packages
pnpm build:web       # Build only web app
pnpm type-check      # TypeScript validation
pnpm lint            # ESLint all packages
pnpm format          # Prettier format all files
```

### Testing
```bash
pnpm test            # Run all tests
pnpm test:run        # Run tests once
pnpm test:coverage   # Run with coverage
```

### Database
```bash
pnpm migrate:create  # Create migration
pnpm migrate:run     # Run migrations
pnpm schema:generate # Generate from schemas
```

## 🎯 Next Steps

1. **Read [GETTING_STARTED.md](./GETTING_STARTED.md)** for detailed setup
2. **Choose a [template](#templates)** for your use case
3. **Define your schemas** in `packages/schema/src/schemas/`
4. **Run `pnpm types:generate`** to create your types
5. **Start building** with full type safety!

---

**Built for Production, Designed for Developers** 🚀

This template gives you everything needed to build modern applications with type safety, automatic code generation, and excellent developer experience. Start building, not configuring!