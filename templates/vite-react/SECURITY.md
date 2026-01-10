# Security - vite-react Template

Security best practices for React SPA applications.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Authentication](#authentication)
3. [API Security](#api-security)
4. [XSS Prevention](#xss-prevention)
5. [Dependencies](#dependencies)
6. [Deployment Security](#deployment-security)

---

## Environment Variables

### Public Variables Only

```bash
# .env (public - safe to commit .env.example)
VITE_API_URL=http://localhost:3000/api
VITE_PUBLIC_KEY=pk_live_xxxxx
```

```bash
# .env.local (local only - NEVER commit)
# No secrets here either!
```

### ❌ Never Expose Secrets

```typescript
// ❌ WRONG: Never do this
const API_KEY = 'sk_live_xxxxx';  // Exposed to client!

// ✅ CORRECT: Use public keys only
const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;
```

---

## Authentication

### Token Storage

```typescript
// ✅ CORRECT: Use HttpOnly cookies for tokens
// Set by server, read by browser automatically

// ❌ WRONG: LocalStorage is vulnerable to XSS
localStorage.setItem('token', accessToken);
```

### Logout Functionality

```typescript
export function useLogout() {
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      // Clear any client-side state
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }
  return logout
}
```

---

## API Security

### Request Headers

```typescript
// ✅ CORRECT: Include CSRF token for mutations
const csrfToken = getCsrfToken()

async function createUser(data: UserData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  })
  return response.json()
}
```

### Error Handling

```typescript
// ✅ CORRECT: Sanitize error messages
try {
  await fetch('/api/users')
} catch (error) {
  // Log full error internally
  logger.error(error)
  
  // Show user-friendly message
  setError('Something went wrong. Please try again.')
}

// ❌ WRONG: Expose internal errors
catch (error) {
  setError(error.message)  // May expose sensitive info!
}
```

---

## XSS Prevention

### React Escaping

React escapes content by default. Be careful with `dangerouslySetInnerHTML`:

```typescript
// ✅ SAFE: Properly sanitized content
import DOMPurify from 'dompurify'

function SafeContent({ html }) {
  return (
    <div dangerouslySetInnerHTML={{ 
      __html: DOMPurify.sanitize(html) 
    }} />
  )
}

// ❌ DANGEROUS: Raw HTML (vulnerable to XSS)
function DangerousContent({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

### URL Sanitization

```typescript
// ✅ CORRECT: Validate URLs
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
```

---

## Dependencies

### Regular Audits

```bash
# Run security audit
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

### Pin Versions

```json
{
  "dependencies": {
    "react": "^18.2.0",  // Use ^ for minor/patch updates
    "lodash": "~4.17.0"  // Use ~ for patch-only updates
  }
}
```

---

## Deployment Security

### HTTPS

```typescript
// ✅ CORRECT: Enforce HTTPS in production
if (import.meta.env.PROD) {
  // Add HSTS header
  document.head.innerHTML += `
    <meta http-equiv="Strict-Transport-Security" 
          content="max-age=31536000; includeSubDomains" />
  `
}
```

### Content Security Policy

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'csp-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'DENY')
          res.setHeader('X-XSS-Protection', '1; mode=block')
          next()
        })
      }
    }
  ]
})
```

### Build Security

```bash
# Build with production optimizations
pnpm build

# Verify no secrets in bundle
pnpm budnle --analyze | grep -i secret
```

---

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] HTTPS enforced in production
- [ ] CSP headers configured
- [ ] Security audit passed (`pnpm audit`)
- [ ] Dependencies updated
- [ ] No secrets in source code
- [ ] XSS vulnerabilities addressed
- [ ] Authentication flow tested
- [ ] API calls use proper headers
- [ ] Error messages sanitized

---

## Related Documentation

- [Root SECURITY.md](../../SECURITY.md) - Comprehensive security guide
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [README.md](./README.md) - Full documentation
