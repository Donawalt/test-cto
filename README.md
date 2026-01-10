# MyApp Universal Monorepo Template

A **complete, production-ready monorepo** with automatic type generation, comprehensive tooling, and 6 ready-to-use templates.

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [What's Included](#-whats-included)
- [Package Architecture](#-package-architecture)
- [Templates](#-templates)
- [Documentation Structure](#-documentation-structure)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Use Cases](#-use-cases)
- [Why This Template?](#-why-this-template)
- [Commands Reference](#-commands-reference)
- [Next Steps](#-next-steps)

## 🔗 Quick Navigation

**Common Tasks:**
- 🏁 [Get Started](./GETTING_STARTED.md#installation) - Set up your development environment
- 🎨 [Create Components](./GETTING_STARTED.md#creating-components) - Build UI components
- 🗄️ [Define Schemas](./GETTING_STARTED.md#defining-database-schemas) - Create database schemas
- 🔌 [Integrate APIs](./COMMUNICATION.md#client-side-patterns) - Connect client and server
- 🚀 [Deploy to Production](./DEPLOYMENT.md#pre-deployment-checklist) - Ship your application
- 🔒 [Security Guidelines](./SECURITY.md) - Security best practices
- 📖 [Transparency Practices](./TRANSPARENCY.md) - Transparency and compliance

**Learn the System:**
- 📐 [Architecture Overview](./ARCHITECTURE.md#package-responsibilities) - Understand the package structure
- 🔄 [Communication Patterns](./COMMUNICATION.md#api-contract-structure) - Master type-safe APIs
- 📦 [Package Documentation](./ARCHITECTURE.md#package-responsibilities) - Deep dive into each package
- 🗺️ [Documentation Map](./DOCUMENTATION_MAP.md) - Navigate all documentation

**Choose a Template:**
- ⚛️ [React App](./templates/vite-react/README.md) - Modern SPA with Vite
- 🌟 [Astro Site](./templates/astro/README.md) - Static site generator
- 🔧 [API Server](./templates/api-server/README.md) - Backend API
- 🎯 [Full-Stack](./templates/bedrock-sage/README.md) - Complete WordPress application
- 📚 [NPM Library](./templates/library/README.md) - Package template
- 🎬 [Sanity CMS](./templates/sanity-cms/README.md) - Headless CMS with Sanity Studio

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
# Using helper script (recommended)
pnpm create-from-template vite-react ../my-react-app

# Or manually copy
cp templates/vite-react my-react-app
cd my-react-app
pnpm dev
```
- React 18 + Vite + TanStack Router
- Tailwind CSS + TypeScript
- Generated types integration

### 2. **astro** - Static Site Generator
```bash
pnpm create-from-template astro ../my-site
cd my-site
pnpm dev
```
- Astro + Tailwind CSS
- Static generation with API integration
- Full type safety

### 3. **library** - NPM Package
```bash
pnpm create-from-template library ../my-lib
cd my-lib
pnpm build
pnpm publish
```
- Full-featured NPM package template
- TypeScript + Tsup for building
- Testing + documentation setup

### 4. **api-server** - Backend API
```bash
pnpm create-from-template api-server ../my-api
cd my-api
pnpm dev
```
- Express + Drizzle ORM
- Authentication + validation
- Comprehensive testing

### 5. **bedrock-sage** - Full Stack ⭐
```bash
pnpm create-from-template bedrock-sage ../my-app
cd my-app
composer install
pnpm dev
```
- **Complete full-stack application**
- Bedrock (backend) + Sage (frontend)
- Database + API + UI + testing
- Docker deployment ready

### 6. **sanity-cms** - Headless CMS
```bash
pnpm create-from-template sanity-cms ../my-studio
cd my-studio
npx sanity init
pnpm dev
```
- Sanity Studio v3 with React
- Pre-built content schemas
- Blog, portfolio, settings schemas
- Type-safe frontend integration

## 📁 Documentation Structure

### Core Documentation (Quick Links)

| Document | What You'll Learn | Quick Links |
|----------|-------------------|-------------|
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Setup, development workflow | [Installation](./GETTING_STARTED.md#installation) • [Components](./GETTING_STARTED.md#creating-components) • [Database](./GETTING_STARTED.md#defining-database-schemas) • [Testing](./GETTING_STARTED.md#testing) |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design, package structure | [Packages](./ARCHITECTURE.md#package-responsibilities) • [Dependencies](./ARCHITECTURE.md#dependency-graph) • [Build Pipeline](./ARCHITECTURE.md#build-pipeline) • [Performance](./ARCHITECTURE.md#performance-considerations) |
| **[COMMUNICATION.md](./COMMUNICATION.md)** | Type-safe API patterns | [API Contracts](./COMMUNICATION.md#api-contract-structure) • [Client Patterns](./COMMUNICATION.md#client-side-patterns) • [Server Patterns](./COMMUNICATION.md#server-side-patterns) • [Authentication](./COMMUNICATION.md#authentication) |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Production deployment | [Cloudflare](./DEPLOYMENT.md#cloudflare-pages) • [Infomaniak](./DEPLOYMENT.md#infomaniak) • [Scaleway](./DEPLOYMENT.md#scaleway) • [Multi-Platform Guide](./DEPLOYMENT.md#platform-specific-guides) |
| **[SECURITY.md](./SECURITY.md)** | Security best practices | [Philosophy](./SECURITY.md#security-philosophy) • [Authentication](./SECURITY.md#authentication--authorization) • [API Security](./SECURITY.md#api-security) • [GDPR/CCPA](./SECURITY.md#data-protection--privacy-gdprccpa) |
| **[TRANSPARENCY.md](./TRANSPARENCY.md)** | Transparency & compliance | [Code Transparency](./TRANSPARENCY.md#code-transparency) • [Data Transparency](./TRANSPARENCY.md#data-transparency) • [GDPR Compliance](./TRANSPARENCY.md#compliance) |
| **[DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md)** | Navigate all docs | [Link Graph](./DOCUMENTATION_MAP.md#documentation-link-graph) • [User Journeys](./DOCUMENTATION_MAP.md#user-journey-maps) • [Recommended Reading](./DOCUMENTATION_MAP.md#recommended-reading-order) |

### Package Documentation

**Shared Packages:**
- **[@myapp/types](./packages/types/README.md)** - Type definitions and API contracts
- **[@myapp/tokens](./packages/tokens/README.md)** - Design tokens and Tailwind config

**Client-Side Packages:**
- **[@myapp/web](./packages/web/README.md)** - Main React application
- **[@myapp/ui](./packages/ui/README.md)** - UI component library
- **[@myapp/hooks](./packages/hooks/README.md)** - React hooks
- **[@myapp/utils](./packages/utils/README.md)** - Client-side utilities
- **[@myapp/lib](./packages/lib/README.md)** - Universal utilities

**Server-Side Packages:**
- **[@myapp/db](./packages/db/README.md)** - Database utilities and ORM
- **[@myapp/schema](./packages/schema/README.md)** - Schema builder and code generation
- **[@myapp/server-utils](./packages/server-utils/README.md)** - Server-side utilities

### Template Documentation

**Frontend Templates:**
- **[vite-react](./templates/vite-react/README.md)** - Modern React app with TanStack Router
- **[astro](./templates/astro/README.md)** - Static site generator with API integration

**Backend Templates:**
- **[api-server](./templates/api-server/README.md)** - Backend API server with Express

**Full-Stack Templates:**
- **[bedrock-sage](./templates/bedrock-sage/README.md)** - Complete full-stack application with Bedrock + Sage

**Library Templates:**
- **[library](./templates/library/README.md)** - NPM package template with full tooling

**CMS Templates:**
- **[sanity-cms](./templates/sanity-cms/README.md)** - Headless CMS with Sanity Studio
  - [Quick Start](./templates/sanity-cms/QUICK_START.md)
  - [Setup Guide](./templates/sanity-cms/SANITY_SETUP.md)
  - [Integration with test-cto](./templates/sanity-cms/INTEGRATION_WITH_TESTCTO.md)
  - [Security](./templates/sanity-cms/SECURITY.md)

**Template Resources (All Templates):**
- [QUICK_START.md](./templates/*/QUICK_START.md) - Get running in 2-5 minutes
- [INTEGRATION_CHECKLIST.md](./templates/*/INTEGRATION_CHECKLIST.md) - Standalone + monorepo paths
- [SECURITY.md](./templates/*/SECURITY.md) - Template-specific security

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
2. **Choose a [template](#-templates)** for your use case
3. **Define your schemas** in `packages/schema/src/schemas/`
4. **Run `pnpm types:generate`** to create your types
5. **Start building** with full type safety!

## 📚 See Also

### Core Documentation
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide and development workflow
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, package boundaries, and build pipeline
- **[COMMUNICATION.md](./COMMUNICATION.md)** - Type-safe API patterns and client-server contracts
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment strategies for all platforms

### Deployment Platforms

Deploy your MyApp application to **9 production-ready platforms**:

#### Frontend Platforms
- **Vercel**: Zero-config deployment for React apps
- **Netlify**: Git-based deployment with form handling
- **Cloudflare Pages**: Global CDN with edge caching

#### Backend Platforms  
- **Railway**: Simple backend deployment with database
- **Render**: Full-stack deployment with background workers
- **Cloudflare Workers**: Edge computing with global distribution
- **Infomaniak**: Privacy-focused Swiss hosting (GDPR compliant)
- **Scaleway**: Enterprise-grade with Kubernetes support

#### Full-Stack Platforms
- **AWS**: Complete infrastructure control
- **DigitalOcean**: Cost-effective cloud hosting

> **Choose based on**: Template type, privacy requirements, budget, and scale needs

### Package Documentation
Learn about each package's functionality:
- [@myapp/types](./packages/types/README.md) - Type definitions and API contracts
- [@myapp/schema](./packages/schema/README.md) - Schema builder and code generation
- [@myapp/db](./packages/db/README.md) - Database utilities and Drizzle ORM
- [@myapp/lib](./packages/lib/README.md) - Universal utilities
- [@myapp/server-utils](./packages/server-utils/README.md) - Server-side utilities
- [@myapp/tokens](./packages/tokens/README.md) - Design tokens and Tailwind config
- [@myapp/ui](./packages/ui/README.md) - UI component library
- [@myapp/hooks](./packages/hooks/README.md) - React hooks
- [@myapp/utils](./packages/utils/README.md) - Client-side utilities
- [@myapp/web](./packages/web/README.md) - Main React application

### Template Documentation
Get started with a specific template:
- [vite-react](./templates/vite-react/README.md) - Modern React app with TanStack Router
- [astro](./templates/astro/README.md) - Static site generator with API integration
- [library](./templates/library/README.md) - NPM package template with full tooling
- [api-server](./templates/api-server/README.md) - Backend API server with Express
- [bedrock-sage](./templates/bedrock-sage/README.md) - Full-stack application template
- [sanity-cms](./templates/sanity-cms/README.md) - Headless CMS with Sanity Studio

### Security & Transparency
- **[SECURITY.md](./SECURITY.md)** - Comprehensive security practices and checklists
- **[TRANSPARENCY.md](./TRANSPARENCY.md)** - Transparency in code, data, and operations
- **[DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md)** - Navigate all documentation

### Using Templates
- **Helper Script**: `pnpm create-from-template <template-name> <destination>`
- **Example**: `pnpm create-from-template vite-react ../my-app`
- **Manual**: `cp -r templates/vite-react my-app`

---

**Built for Production, Designed for Developers** 🚀

This template gives you everything needed to build modern applications with type safety, automatic code generation, and excellent developer experience. Start building, not configuring!