# Security - astro Template

Security best practices for Astro static sites.

## Table of Contents

1. [Static Site Security](#static-site-security)
2. [SSR Mode Security](#ssr-mode-security)
3. [API Integration](#api-integration)
4. [Dependencies](#dependencies)
5. [Deployment Security](#deployment-security)

---

## Static Site Security

### Build-Time Validation

```astro
---
// Validate content at build time
import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  publishedAt: z.string().datetime(),
})

const post = await fetchPost()
const validated = PostSchema.parse(post)  // Validates at build time
---

<h1>{validated.title}</h1>
```

### No Inline Scripts

```astro
<!-- ❌ WRONG: Inline scripts can be blocked by CSP -->
<script>console.log('inline')</script>

<!-- ✅ CORRECT: External scripts -->
<script src="/scripts/app.js"></script>
```

---

## SSR Mode Security

### Enable SSR Safely

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'server',  // or 'hybrid'
  adapter: node({
    mode: 'standalone'
  }),
})
```

### Server-Side Validation

```astro
---
// src/pages/api/submit.ts
import { z } from 'zod'

export const POST = async ({ request }) => {
  const data = await request.formData()
  
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
  })
  
  const validated = schema.parse(Object.fromEntries(data))
  // Process validated data...
}
```

---

## API Integration

### Fetch from Frontmatter

```astro
---
// This runs at build time (SSG) or request time (SSR)
const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/posts`)
const posts = await response.json()
---

{posts.map(post => (
  <article>{post.title}</article>
))}
```

### Environment Variables

```bash
# .env - Public variables only
PUBLIC_API_URL=https://api.example.com
PUBLIC_SITE_URL=https://example.com
```

```bash
# .env.local - Local overrides only
PUBLIC_API_URL=http://localhost:3000/api
```

---

## Dependencies

### Audit Regularly

```bash
# Run security audit
pnpm audit

# Check for outdated packages
pnpm outdated
```

### Use Trusted Sources

```json
{
  "dependencies": {
    "astro": "^4.0.0",  // Official package
    "react": "^18.2.0"   // Official package
  }
}
```

---

## Deployment Security

### CSP Headers

```typescript
// astro.config.mjs
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com;",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    }
  }
})
```

### Edge Deployment

```bash
# Deploy to Cloudflare Pages
npm run build
wrangler pages publish dist
```

### Cache Headers

```astro
---
// Set cache headers for static assets
Astro.response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
---

<html>
  <!-- Your content -->
</html>
```

---

## Pre-Deployment Checklist

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] All environment variables configured
- [ ] CSP headers configured
- [ ] Security audit passed
- [ ] Dependencies updated
- [ ] No inline scripts without nonce
- [ ] API calls use HTTPS
- [ ] Error pages configured

---

## Related Documentation

- [Root SECURITY.md](../../SECURITY.md) - Comprehensive security guide
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [README.md](./README.md) - Full documentation
