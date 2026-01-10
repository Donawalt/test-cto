# Integration Checklist - sanity-cms Template

Two ways to use this template: as a standalone Studio or integrated into the test-cto monorepo.

## Option A: Standalone Studio

### 1. Initialize

```bash
cp -r templates/sanity-cms my-studio
cd my-studio
pnpm install
```

### 2. Configure Sanity

```bash
# Option 1: Initialize new project
npx sanity init

# Option 2: Use existing project
# Edit sanity.config.ts with your project ID
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit with your project ID
```

### 4. Start Development

```bash
pnpm dev
```

---

## Option B: Monorepo Integration

### 1. Copy to Packages

```bash
cp -r templates/sanity-cms packages/sanity
```

### 2. Add to pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'packages/sanity'
```

### 3. Configure Dependencies

The template includes its own dependencies. No workspace dependencies needed.

### 4. Install and Start

```bash
pnpm install
cd packages/sanity
pnpm dev
```

---

## Integration Checklist

### Prerequisites

- [ ] Sanity CLI installed (`npm install -g sanity`)
- [ ] Sanity account created (free at sanity.io)
- [ ] Node.js 18+

### Standalone Setup

- [ ] Copy template files
- [ ] Install dependencies
- [ ] Initialize or connect to project
- [ ] Configure project ID
- [ ] Test with `pnpm dev`

### Schema Configuration

- [ ] Review existing schemas
- [ ] Customize schemas as needed
- [ ] Add custom fields
- [ ] Configure validation rules
- [ ] Test content creation

### Frontend Integration

- [ ] Install @sanity/client in frontend
- [ ] Configure Sanity client
- [ ] Create GROQ queries
- [ ] Build type-safe components
- [ ] Configure webhooks (optional)

### Security Configuration

- [ ] Configure CORS origins
- [ ] Create API tokens
- [ ] Set up role-based access
- [ ] Review field permissions

---

## Common Integration Tasks

### Connecting to vite-react

```bash
# In packages/web
pnpm add @sanity/client @sanity/image-url
```

```typescript
// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: any) => builder.image(source)
```

### Connecting to astro

```bash
# In packages/astro
pnpm add @sanity/client @sanity/image-url
```

```typescript
// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)
export const urlFor = (source: any) => builder.image(source)
```

### Using @myapp/types/sanity

```typescript
// In any package
import type { SanityPost, SanityProject } from '@myapp/types/sanity'
import { sanityPostSchema } from '@myapp/types/sanity'

// Validate Sanity data
const post = sanityPostSchema.parse(sanityData)
```

---

## Deployment

### Deploy Studio

```bash
# Deploy to Sanity
pnpm deploy
```

### Deploy Frontend

- **vite-react**: Deploy to Vercel/Netlify
- **astro**: Deploy to Vercel/Netlify/Cloudflare

### Configure Webhooks

In Sanity dashboard:

1. Project > API > Webhooks
2. Create webhook for frontend rebuilds

---

## Security Checklist

- [ ] CORS origins configured
- [ ] API tokens created
- [ ] Role-based access set
- [ ] Sensitive fields hidden
- [ ] Webhook signature verified

---

## Next Steps

After integration, review:

1. **QUICK_START.md** - Quick start guide
2. **SANITY_SETUP.md** - Detailed setup
3. **INTEGRATION_WITH_TESTCTO.md** - Frontend integration
4. **SECURITY.md** - Security guidelines

---

**See Also:**
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SANITY_SETUP.md](./SANITY_SETUP.md) - Detailed configuration
- [INTEGRATION_WITH_TESTCTO.md](./INTEGRATION_WITH_TESTCTO.md) - Frontend integration
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [Root README.md](../../README.md) - Monorepo overview
