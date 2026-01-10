# Integration Checklist - vite-react Template

Two ways to use this template: as a standalone project or integrated into the test-cto monorepo.

## Option A: Standalone Project

### 1. Initialize

```bash
cp -r templates/vite-react my-app
cd my-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Remove Monorepo References

Edit `package.json` to remove workspace dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
    // Remove any @myapp/* dependencies
  }
}
```

### 4. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Update environment variables as needed.

### 5. Start Development

```bash
pnpm dev
```

---

## Option B: Monorepo Integration

### 1. Copy to Packages

```bash
cp -r templates/vite-react packages/my-app
```

### 2. Update Root pnpm-workspace.yaml

Add the new package:

```yaml
packages:
  - 'packages/*'
  - 'packages/my-app'  # Add this line
```

### 3. Update package.json

The template includes workspace dependencies by default. No changes needed:

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
# From root
cd /path/to/test-cto
pnpm install
pnpm build
```

### 5. Start Development

```bash
# From root
pnpm dev

# Or just for this package
pnpm dev --filter=@myapp/my-app
```

---

## Integration Checklist

### Pre-Integration

- [ ] Review template structure
- [ ] Identify required @myapp packages
- [ ] Plan API integration points

### Standalone Setup

- [ ] Copy template files
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Remove workspace dependencies
- [ ] Test with `pnpm dev`

### Monorepo Setup

- [ ] Copy to packages/ directory
- [ ] Update pnpm-workspace.yaml
- [ ] Run `pnpm install`
- [ ] Build dependent packages first
- [ ] Test with `pnpm dev`

### API Integration

- [ ] Configure API base URL
- [ ] Set up authentication tokens
- [ ] Create API client wrapper
- [ ] Implement error handling

### Security Review

- [ ] Configure CORS
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Review authentication flow

---

## Common Integration Tasks

### Connecting to API Server

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`)
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}
```

### Using @myapp/types

```bash
# Ensure types are generated
pnpm types:generate
```

```typescript
// In your components
import type { Users } from '@myapp/types'

interface UserCardProps {
  user: Users
}
```

### Adding Tailwind Components

```bash
# The template includes Tailwind by default
# Add your custom styles in src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
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
