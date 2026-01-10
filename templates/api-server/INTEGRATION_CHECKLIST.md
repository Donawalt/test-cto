# Integration Checklist - api-server Template

Two ways to use this template: as a standalone API or integrated into the test-cto monorepo.

## Option A: Standalone API

### 1. Initialize

```bash
cp -r templates/api-server my-api
cd my-api
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Update with your database and secrets:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/myapi
JWT_SECRET=your-32-character-secret-minimum
NODE_ENV=development
PORT=3000
```

### 4. Start Development

```bash
pnpm dev
```

---

## Option B: Monorepo Integration

### 1. Copy to Packages

```bash
cp -r templates/api-server packages/api-server
```

### 2. Update pnpm-workspace.yaml

Add the new package to workspaces.

### 3. Configure Dependencies

The template includes workspace dependencies:

```json
{
  "dependencies": {
    "@myapp/types": "workspace:*",
    "@myapp/db": "workspace:*",
    "@myapp/server-utils": "workspace:*"
  }
}
```

### 4. Install and Build

```bash
pnpm install
pnpm build
```

### 5. Start Development

```bash
pnpm dev --filter=@myapp/api-server
```

---

## Integration Checklist

### Pre-Integration

- [ ] Choose database (PostgreSQL recommended)
- [ ] Plan API endpoints
- [ ] Define authentication flow
- [ ] Identify @myapp packages needed

### Database Setup

- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Connection URL configured
- [ ] Migrations run

### Standalone Setup

- [ ] Copy template files
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up database
- [ ] Test with `pnpm dev`

### Monorepo Setup

- [ ] Copy to packages/ directory
- [ ] Update pnpm-workspace.yaml
- [ ] Run `pnpm install`
- [ ] Build @myapp/types first
- [ ] Configure database connection
- [ ] Test with `pnpm dev`

### API Integration

- [ ] Define routes
- [ ] Implement controllers
- [ ] Add validation
- [ ] Configure CORS
- [ ] Set up authentication
- [ ] Add rate limiting

---

## Common Integration Tasks

### Connecting to @myapp/db

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@myapp/db/generated/drizzle'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

### Using @myapp/types

```typescript
// src/routes/users.ts
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

router.get('/', async (req, res) => {
  const users = await db.select().from(usersTable)
  res.json(users)
})

router.post('/', async (req, res) => {
  const data: UsersAPI.CreateBody = UsersSchema.parse(req.body)
  // ...
})
```

### Adding @myapp/server-utils

```typescript
// src/middleware/auth.ts
import { authenticate, requireRole } from '@myapp/server-utils/auth'

router.get('/admin', authenticate, requireRole('admin'), adminHandler)
```

---

## Security Checklist

- [ ] JWT secret is strong (32+ chars)
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages sanitized
- [ ] Sensitive data not logged
- [ ] HTTPS in production
- [ ] Helmet.js security headers

---

## Next Steps

After integration, review:

1. **SECURITY.md** - Security best practices
2. **README.md** - Full template documentation
3. **@myapp/db** - Database utilities
4. **@myapp/server-utils** - Server utilities

---

**See Also:**
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [Root README.md](../../README.md) - Monorepo overview
