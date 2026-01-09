# MyApp Monorepo

A production-ready monorepo with clear client-side/server-side separation, type-safe communication, and lightweight utility packages.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development (all packages)
pnpm dev

# Start only web app
pnpm dev:web

# Build all packages
pnpm build

# Type check
pnpm type-check

# Lint and format
pnpm lint
pnpm format

# Run tests
pnpm test
```

## 📦 Package Architecture

### Client-Side Packages (5)
- **@myapp/web** - React app with TanStack Router + Lenis
- **@myapp/ui** - Component library (Tailwind styled)
- **@myapp/hooks** - Custom React hooks (useQuery, useLenis, etc)
- **@myapp/lib** - Universal utilities (browser + node compatible)
- **@myapp/utils** - Client-only utilities (dom, string, events, storage, validation)

### Server-Side Packages (3)
- **@myapp/db** - Drizzle ORM + multi-database support
- **@myapp/schema** - JSON schema builder + code generation CLI
- **@myapp/server-utils** - Server-only utilities (auth, crypto, validation, logging, error, db helpers)

### Shared Packages (2)
- **@myapp/types** - Type definitions + API contracts + Zod schemas
- **@myapp/tokens** - Design tokens + Tailwind config

## 🛠️ Technology Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: React 18+, TanStack Router v1
- **Build**: Vite (library + app modes)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS
- **Libraries**: Lenis (~15KB), Drizzle ORM, Zod (~10KB)
- **Testing**: Vitest

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Package responsibilities and dependency graph
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Step-by-step setup guide
- [COMMUNICATION.md](./COMMUNICATION.md) - Client-server communication patterns

### Package-Specific Docs
- [packages/utils/README.md](./packages/utils/README.md) - Client utilities documentation
- [packages/server-utils/README.md](./packages/server-utils/README.md) - Server utilities documentation
- [packages/types/README.md](./packages/types/README.md) - Type definitions and API contracts
- [packages/db/README.md](./packages/db/README.md) - Database setup and usage
- [packages/ui/README.md](./packages/ui/README.md) - Component library reference
- [packages/hooks/README.md](./packages/hooks/README.md) - React hooks documentation

## 🏗️ Directory Structure

```
myapp-monorepo/
├── packages/
│   ├── web/                  # React application
│   ├── ui/                   # Component library
│   ├── hooks/                # React hooks
│   ├── lib/                  # Universal utilities
│   ├── utils/                # Client utilities
│   ├── db/                   # Drizzle ORM
│   ├── schema/               # Schema builder
│   ├── server-utils/         # Server utilities
│   ├── types/                # Type definitions
│   └── tokens/               # Design tokens
├── turbo.json                # Turborepo config
├── pnpm-workspace.yaml       # pnpm workspaces
├── tsconfig.json             # Root TypeScript config
└── package.json              # Root package.json
```

## ✨ Key Features

### Type-Safe Communication
- Single source of truth via @myapp/types
- API namespace with Requests, Responses, Validators, Endpoints
- Zod schemas for client & server validation
- Full TypeScript strict mode

### Lenis Integration
- Smooth scrolling at root level
- useLenis() hook for programmatic control
- Scroll-aware components in @myapp/ui
- Scroll trigger patterns with IntersectionObserver

### Modular Exports
All packages support tree-shakeable submodule imports:
```typescript
import { Button } from '@myapp/ui/button';
import { debounce } from '@myapp/utils/events';
import { hashPassword } from '@myapp/server-utils/crypto';
```

### Security Boundaries
- Server packages excluded from browser build
- @myapp/db, @myapp/schema, @myapp/server-utils never bundled to client
- Environment variables separated (.env.server, .env.client)
- Build-time validation prevents leaks

## 🔒 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
