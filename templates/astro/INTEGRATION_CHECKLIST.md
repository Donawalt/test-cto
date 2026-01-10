# Integration Checklist - astro Template

Two ways to use this template: as a standalone project or integrated into the test-cto monorepo.

## Option A: Standalone Project

### 1. Initialize

```bash
cp -r templates/astro my-site
cd my-site
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Remove Monorepo References

Edit `package.json` to remove workspace dependencies.

### 4. Configure Environment

Create `.env` file and configure API URLs.

### 5. Start Development

```bash
pnpm dev
```

---

## Option B: Monorepo Integration

### 1. Copy to Packages

```bash
cp -r templates/astro packages/my-site
```

### 2. Update pnpm-workspace.yaml

Add the new package to workspaces.

### 3. Update package.json

The template includes workspace dependencies. No changes needed:

```json
{
  "dependencies": {
    "@myapp/types": "workspace:*"
  }
}
```

### 4. Install and Build

```bash
pnpm install
pnpm build
```

---

## Integration Checklist

### Pre-Integration

- [ ] Review template structure
- [ ] Identify required @myapp packages
- [ ] Plan content integration (CMS or API)

### Standalone Setup

- [ ] Copy template files
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Test with `pnpm dev`

### Monorepo Setup

- [ ] Copy to packages/ directory
- [ ] Update pnpm-workspace.yaml
- [ ] Run `pnpm install`
- [ ] Build dependent packages first
- [ ] Test with `pnpm dev`

### Content Integration

- [ ] Choose content source (CMS/API)
- [ ] Configure fetch calls in frontmatter
- [ ] Create data fetching utilities
- [ ] Handle loading states

---

## Common Integration Tasks

### Fetching from API Server

```astro
---
// src/pages/index.astro
import { fetchUsers } from '../lib/api'

const users = await fetchUsers()
---

<html>
  <body>
    <h1>Users</h1>
    <ul>
      {users.map(user => (
        <li>{user.name}</li>
      ))}
    </ul>
  </body>
</html>
```

### Using @myapp/types

```astro
---
import type { Users } from '@myapp/types'

const users: Users[] = await fetchUsers()
---
```

### Adding React Components

```astro
---
import Counter from '../components/Counter'
---

<html>
  <body>
    <Counter client:load />
  </body>
</html>
```

---

## Next Steps

After integration, review:

1. **SECURITY.md** - Security best practices
2. **README.md** - Full template documentation
3. **@myapp/types** - Available types for your components

---

**See Also:**
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [Root README.md](../../README.md) - Monorepo overview
