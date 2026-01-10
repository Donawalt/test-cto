# Getting Started

This guide will help you set up the MyApp monorepo and start developing.

> **See Also**: [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details, [COMMUNICATION.md](./COMMUNICATION.md) for API patterns, [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment.

## 📑 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Creating Components](#creating-components)
- [Defining Database Schemas](#defining-database-schemas)
- [Type Generation](#type-generation)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd myapp-monorepo

# Install dependencies
pnpm install
```

### 2. Build All Packages

```bash
# Build all packages
pnpm build

# Or build incrementally as you develop
pnpm dev
```

## Development

### Start Development Server

```bash
# Start all packages in watch mode
pnpm dev

# Start only the web app
pnpm dev:web
```

The web application will be available at `http://localhost:3000`.

## Creating Components

### 1. Create a New UI Component

```bash
cd packages/ui/src
mkdir my-component
touch my-component/index.tsx
```

```typescript
// packages/ui/src/my-component/index.tsx
export interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}
```

### 2. Export from Package

```typescript
// packages/ui/src/index.ts
export * from './my-component';
```

### 3. Add to Vite Config for Submodule Export

```typescript
// packages/ui/vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: {
        // ... existing entries
        'my-component/index': resolve(__dirname, 'src/my-component/index.tsx'),
      },
    },
  },
});
```

### 4. Add Export to package.json

```json
{
  "exports": {
    "./my-component": {
      "types": "./dist/my-component/index.d.ts",
      "import": "./dist/my-component/index.js",
      "require": "./dist/my-component/index.cjs"
    }
  }
}
```

### 5. Use in Your App

```typescript
import { MyComponent } from '@myapp/ui/my-component';

function Page() {
  return (
    <MyComponent title="Hello">
      <p>Content here</p>
    </MyComponent>
  );
}
```

## Defining Database Schemas

> **See Also**: [@myapp/db README](./packages/db/README.md) for database utilities, [@myapp/schema README](./packages/schema/README.md) for schema builder details.

### 1. Update Schema Definition

```typescript
// packages/db/src/schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 2. Generate Migration

```bash
cd packages/db
pnpm drizzle-kit generate:pg
```

### 3. Run Migration

```bash
pnpm drizzle-kit push:pg
```

## Type Generation

> **See Also**: [@myapp/types README](./packages/types/README.md) for type definitions and API contracts.

### 1. Define Types

```typescript
// packages/types/src/db/index.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  createdAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;
```

### 2. Define API Contract

```typescript
// packages/types/src/api/index.ts
export namespace API {
  export namespace Endpoints {
    export const PRODUCTS = '/api/products' as const;
  }

  export namespace Validators {
    export const CreateProductSchema = z.object({
      name: z.string().min(1).max(200),
      description: z.string().optional(),
      price: z.number().positive(),
    });
  }

  export namespace Requests {
    export type CreateProduct = z.infer<typeof Validators.CreateProductSchema>;
  }

  export namespace Responses {
    export type ProductResponse = Result<Product>;
    export type ProductsResponse = Result<PaginatedResponse<Product>>;
  }
}
```

### 3. Use Generated Types

**Client:**
```typescript
import { API } from '@myapp/types/api';

async function createProduct(data: API.Requests.CreateProduct) {
  // Validate on client
  const validated = API.Validators.CreateProductSchema.parse(data);
  
  const response = await fetch(API.Endpoints.PRODUCTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  });
  
  const result: API.Responses.ProductResponse = await response.json();
  return result;
}
```

**Server:**
```typescript
import { validateRequestBody } from '@myapp/server-utils/validation';
import { API } from '@myapp/types/api';

async function handleCreateProduct(req: Request) {
  // Validate on server
  const data = validateRequestBody(API.Validators.CreateProductSchema, req.body);
  
  // Create product in database
  const product = await db.insert(products).values(data).returning();
  
  return {
    success: true,
    data: product,
  } satisfies API.Responses.ProductResponse;
}
```

## API Integration

> **See Also**: [COMMUNICATION.md](./COMMUNICATION.md) for comprehensive API patterns, [@myapp/server-utils README](./packages/server-utils/README.md) for validation and error handling utilities.

### 1. Define Endpoint

```typescript
// In your server code
app.post(API.Endpoints.USERS, async (req, res) => {
  try {
    const data = validateRequestBody(API.Validators.CreateUserSchema, req.body);
    
    const { hash, salt } = await hashPassword(data.password);
    
    const user = await db.insert(users).values({
      email: data.email,
      name: data.name,
      passwordHash: hash,
      passwordSalt: salt,
    }).returning();
    
    const response: API.Responses.UserResponse = {
      success: true,
      data: user[0],
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json(errorFormatter(error));
  }
});
```

### 2. Call from Client

```typescript
import { API } from '@myapp/types/api';

async function createUser(formData: API.Requests.CreateUser) {
  const response = await fetch(API.Endpoints.USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  const result: API.Responses.UserResponse = await response.json();
  
  if (result.success) {
    console.log('User created:', result.data);
  } else {
    console.error('Error:', result.error);
  }
}
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
cd packages/utils
pnpm test

# Run in watch mode
pnpm test --watch
```

### Writing Tests

```typescript
// packages/utils/src/string/index.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './index';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });
  
  it('formats EUR correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });
});
```

## Deployment

> **See Also**: [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides for all platforms (Vercel, Netlify, Railway, Render, AWS, etc).

### Build for Production

```bash
# Build all packages
pnpm build

# Build only web app
pnpm build:web
```

### Deploy Web App

The built web app is in `packages/web/dist` and can be deployed to:
- [Vercel](./DEPLOYMENT.md#vercel)
- [Netlify](./DEPLOYMENT.md#netlify)
- [AWS S3 + CloudFront](./DEPLOYMENT.md#aws)
- Any static hosting service

### Deploy Server

1. Build server packages
2. Set environment variables
3. Deploy to your hosting platform ([Railway](./DEPLOYMENT.md#railway), [Render](./DEPLOYMENT.md#render), [AWS](./DEPLOYMENT.md#aws), etc)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform-specific guides.

## Environment Variables

### Client (.env.client)

```env
VITE_API_URL=http://localhost:4000
VITE_PUBLIC_KEY=your-public-key
```

### Server (.env.server)

```env
DATABASE_URL=postgresql://localhost:5432/myapp
JWT_SECRET=your-secret-key
API_PORT=4000
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Type Errors After Adding Dependencies

```bash
# Rebuild all packages
pnpm build
```

### pnpm Install Fails

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
rm -rf node_modules
pnpm install
```

### Stale Build Cache

```bash
# Clean Turborepo cache
pnpm clean

# Rebuild
pnpm build
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
- Read [COMMUNICATION.md](./COMMUNICATION.md) for API patterns
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment strategies
- Explore package-specific READMEs for detailed documentation
- Check out example components and routes in @myapp/web

## Getting Help

- Check package-specific READMEs
- Review example code in `packages/web/src/routes`
- Read TypeScript types and JSDoc comments

---

## 📚 Related Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and package structure
- **[COMMUNICATION.md](./COMMUNICATION.md)** - API patterns and client-server contracts
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment strategies

### Package READMEs
- [@myapp/types](./packages/types/README.md) - Type definitions
- [@myapp/db](./packages/db/README.md) - Database utilities
- [@myapp/schema](./packages/schema/README.md) - Schema builder
- [@myapp/server-utils](./packages/server-utils/README.md) - Server utilities
- [@myapp/ui](./packages/ui/README.md) - UI components
- [@myapp/hooks](./packages/hooks/README.md) - React hooks
- [@myapp/utils](./packages/utils/README.md) - Client utilities

### Template READMEs
- [vite-react](./templates/vite-react/README.md) - React app template
- [astro](./templates/astro/README.md) - Static site template
- [api-server](./templates/api-server/README.md) - API server template
- [bedrock-sage](./templates/bedrock-sage/README.md) - Full-stack template
- [library](./templates/library/README.md) - NPM package template
