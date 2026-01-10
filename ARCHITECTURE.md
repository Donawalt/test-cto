# Architecture

This document describes the architecture of the MyApp monorepo, including package responsibilities, boundaries, and communication patterns.

> **See Also**: [COMMUNICATION.md](./COMMUNICATION.md) for API patterns, [GETTING_STARTED.md](./GETTING_STARTED.md) for development setup, [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment.

## 📑 Table of Contents

- [Package Responsibilities](#package-responsibilities)
  - [Client-Side Packages](#client-side-packages)
  - [Server-Side Packages](#server-side-packages)
  - [Shared Packages](#shared-packages)
- [Client vs Server Boundary](#client-vs-server-boundary)
- [Communication Flow](#communication-flow)
- [Dependency Graph](#dependency-graph)
- [Build Pipeline](#build-pipeline)
- [Type Safety Guarantees](#type-safety-guarantees)
- [Performance Considerations](#performance-considerations)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)

## Package Responsibilities

### Client-Side Packages

#### @myapp/web
The main React application that serves as the entry point for end users.

**Responsibilities:**
- Route definitions and page components
- Application-level state management
- Lenis initialization and configuration
- Environment-specific configuration
- Main entry point (main.tsx)

**Dependencies:** All other packages except server-side ones

**Documentation:** [@myapp/web README](./packages/web/README.md)

#### @myapp/ui
A component library with Tailwind styling and Lenis-aware patterns.

**Responsibilities:**
- Reusable UI components (Button, Card, Input, etc)
- Layout components with Lenis integration
- Scroll-trigger components using IntersectionObserver
- Design system implementation

**Dependencies:** @myapp/types, @myapp/tokens, @myapp/hooks

**Documentation:** [@myapp/ui README](./packages/ui/README.md)

#### @myapp/hooks
Custom React hooks for common patterns and functionality.

**Responsibilities:**
- Lenis integration hooks (useLenis, useScrollTo, etc)
- State management hooks (useLocalStorage, useDebounce, etc)
- DOM hooks (useIntersectionObserver, useWindowSize, etc)
- Async operation hooks (useAsync)

**Dependencies:** @studio-freight/lenis

**Documentation:** [@myapp/hooks README](./packages/hooks/README.md)

#### @myapp/lib
Universal utilities that work in both browser and Node.js environments.

**Responsibilities:**
- Array utilities (chunk, unique, groupBy)
- Object utilities (pick, omit)
- Type utilities (isEmpty, isPromise)
- Math utilities (clamp, randomInt)

**Dependencies:** None

**Documentation:** [@myapp/lib README](./packages/lib/README.md)

#### @myapp/utils
Client-only utilities for browser-specific operations.

**Responsibilities:**
- DOM manipulation (querySelector, addClass, createElement)
- String formatting (formatDate, formatCurrency, slugify)
- Event handling (debounce, throttle, addEventListener)
- Storage management (localStorage, sessionStorage, cookies)
- Client-side validation (email, phone, URL, password)

**Dependencies:** None

**Documentation:** [@myapp/utils README](./packages/utils/README.md)

### Server-Side Packages

#### @myapp/db
Drizzle ORM integration with multi-database support.

**Responsibilities:**
- Database schema definitions
- Database connection management
- Query builders and helpers
- Migration configuration

**Dependencies:** @myapp/types, drizzle-orm, database drivers (optional peers)

**Documentation:** [@myapp/db README](./packages/db/README.md)

#### @myapp/schema
JSON schema builder and code generation CLI tool.

**Responsibilities:**
- Schema definition API
- TypeScript type generation
- Zod schema generation
- CLI for build-time code generation

**Dependencies:** @myapp/types, zod

**Documentation:** [@myapp/schema README](./packages/schema/README.md)

#### @myapp/server-utils
Server-only utilities for backend operations.

**Responsibilities:**
- Authentication (token creation, session management)
- Cryptography (password hashing, encryption, decryption)
- Error handling (custom errors, async handlers, formatters)
- Validation (request validation, sanitization)
- Logging (structured logging, logger factory)
- Database helpers (pagination, query builders, search)

**Dependencies:** @myapp/types

**Documentation:** [@myapp/server-utils README](./packages/server-utils/README.md)

### Shared Packages

#### @myapp/types
Type definitions, API contracts, and Zod schemas shared between client and server.

**Responsibilities:**
- Database entity types
- API request/response types
- API endpoint constants
- Zod validation schemas
- UI component prop types

**Dependencies:** zod

**Documentation:** [@myapp/types README](./packages/types/README.md)

**See Also:** [COMMUNICATION.md](./COMMUNICATION.md) for API contract patterns

#### @myapp/tokens
Design tokens and Tailwind configuration.

**Responsibilities:**
- Color palettes
- Typography scales
- Spacing values
- Border radius values
- Shadow definitions
- Breakpoints
- Tailwind config generation

**Dependencies:** None

**Documentation:** [@myapp/tokens README](./packages/tokens/README.md)

## Client vs Server Boundary

### Build-Time Separation

The monorepo enforces strict separation between client and server code at build time:

```typescript
// ✅ ALLOWED in client code
import { User } from '@myapp/types';
import { Button } from '@myapp/ui/button';
import { formatDate } from '@myapp/utils/string';

// ❌ NOT ALLOWED in client code (build fails)
import { hashPassword } from '@myapp/server-utils/crypto';
import { createDatabase } from '@myapp/db';
```

### Security Boundaries

1. **Server packages never bundled to client**
   - @myapp/db
   - @myapp/server-utils
   - Database drivers

2. **Environment variables separated**
   - `.env.client` - Exposed to browser
   - `.env.server` - Server-only secrets

3. **API contracts enforced**
   - Client sends: API.Requests types
   - Server returns: API.Responses types
   - Both validate: API.Validators schemas

## Communication Flow

> **See Also**: [COMMUNICATION.md](./COMMUNICATION.md) for comprehensive API patterns and examples.

### Type-Safe API Communication

```typescript
// 1. Define in @myapp/types
export namespace API {
  export const Endpoints = {
    USERS: '/api/users'
  };
  
  export namespace Validators {
    export const CreateUserSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(8),
    });
  }
  
  export namespace Requests {
    export type CreateUser = z.infer<typeof Validators.CreateUserSchema>;
  }
  
  export namespace Responses {
    export type UserResponse = Result<User>;
  }
}

// 2. Validate on client
const result = API.Validators.CreateUserSchema.safeParse(formData);

// 3. Send request
const response = await fetch(API.Endpoints.USERS, {
  method: 'POST',
  body: JSON.stringify(result.data)
});

// 4. Validate on server
const validated = validateRequestBody(API.Validators.CreateUserSchema, req.body);

// 5. Return typed response
return { success: true, data: user } satisfies API.Responses.UserResponse;
```

## Dependency Graph

```
@myapp/web
├── @myapp/ui
│   ├── @myapp/types
│   ├── @myapp/tokens
│   └── @myapp/hooks
│       └── @studio-freight/lenis
├── @myapp/utils
├── @myapp/lib
├── @myapp/types
└── @myapp/tokens

@myapp/server (not shown, but would use)
├── @myapp/db
│   ├── @myapp/types
│   └── drizzle-orm
├── @myapp/server-utils
│   └── @myapp/types
└── @myapp/types
```

## Build Pipeline

### Turborepo Pipeline

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Build Order

1. **@myapp/types** - First (no dependencies)
2. **@myapp/tokens** - First (no dependencies)
3. **@myapp/lib** - Second (no package dependencies)
4. **@myapp/utils** - Second (no package dependencies)
5. **@myapp/hooks** - Third (depends on types)
6. **@myapp/ui** - Fourth (depends on types, tokens, hooks)
7. **@myapp/db** - Third (depends on types)
8. **@myapp/schema** - Third (depends on types)
9. **@myapp/server-utils** - Third (depends on types)
10. **@myapp/web** - Last (depends on ui, hooks, utils, lib, types, tokens)

## Type Safety Guarantees

1. **Strict TypeScript Mode**
   - All packages use strict mode
   - No implicit any
   - Strict null checks
   - No unused locals/parameters

2. **Build-Time Validation**
   - TypeScript compiler catches type errors
   - No runtime type surprises
   - Full IntelliSense support

3. **Runtime Validation**
   - Zod schemas validate data at boundaries
   - Client validates before sending
   - Server validates before processing

4. **API Contract Enforcement**
   - Single source of truth in @myapp/types
   - Shared between client and server
   - Compile-time safety
   - Runtime validation

## Performance Considerations

1. **Tree-Shaking**
   - All packages use ES modules
   - Conditional exports for submodules
   - Unused code eliminated at build time

2. **Code Splitting**
   - Route-based splitting in @myapp/web
   - Component lazy loading
   - Dynamic imports where appropriate

3. **Build Caching**
   - Turborepo caches build outputs
   - Incremental builds
   - Parallel execution

4. **Bundle Size**
   - Lenis: ~15KB
   - Zod: ~10KB
   - React: ~45KB
   - Total initial: ~100KB (gzipped)

## Development Workflow

1. **Make changes** in any package
2. **Hot reload** reflects changes immediately
3. **Type check** runs automatically
4. **Build** only affected packages (Turborepo)
5. **Test** in isolation or integration
6. **Commit** with confidence

## Testing Strategy

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Package interactions
3. **E2E Tests** - Full user flows
4. **Type Tests** - TypeScript compilation

All tests run via Vitest with appropriate environments (jsdom for client, node for server).

---

## 📚 Related Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Development setup and workflow
- **[COMMUNICATION.md](./COMMUNICATION.md)** - API patterns and client-server contracts
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment strategies

### Package Documentation
- [@myapp/types](./packages/types/README.md) - Type definitions and API contracts
- [@myapp/db](./packages/db/README.md) - Database utilities and ORM
- [@myapp/schema](./packages/schema/README.md) - Schema builder and code generation
- [@myapp/server-utils](./packages/server-utils/README.md) - Server-side utilities
- [@myapp/ui](./packages/ui/README.md) - UI component library
- [@myapp/hooks](./packages/hooks/README.md) - React hooks
- [@myapp/utils](./packages/utils/README.md) - Client-side utilities
- [@myapp/lib](./packages/lib/README.md) - Universal utilities
- [@myapp/tokens](./packages/tokens/README.md) - Design tokens

### Template Documentation
- [vite-react](./templates/vite-react/README.md) - React app template
- [astro](./templates/astro/README.md) - Static site template
- [api-server](./templates/api-server/README.md) - API server template
- [bedrock-sage](./templates/bedrock-sage/README.md) - Full-stack template
- [library](./templates/library/README.md) - NPM package template
