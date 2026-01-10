# Security - library Template

Security best practices for NPM packages and libraries.

## Table of Contents

1. [Dependency Security](#dependency-security)
2. [Code Security](#code-security)
3. [Publishing Security](#publishing-security)
4. [Type Safety](#type-safety)
5. [Supply Chain](#supply-chain)

---

## Dependency Security

### Minimize Dependencies

```json
{
  "dependencies": {
    // ✅ MINIMAL: Only essential dependencies
    "zod": "^3.22.0"
  },
  "devDependencies": {
    // ✅ DEV: Development-only dependencies
    "vitest": "^1.0.0",
    "typescript": "^5.3.0"
  }
}
```

### Avoid Unnecessary Dependencies

```typescript
// ✅ CORRECT: Use built-in or minimal
import { debounce } from 'lodash'

// ❌ WRONG: Heavy dependency for simple task
import { get } from 'lodash'
const value = get(obj, 'path.to.value')  // Overkill!
```

---

## Code Security

### No Hardcoded Credentials

```typescript
// ❌ WRONG: Never commit secrets
const API_KEY = 'sk_live_xxxxx'

// ✅ CORRECT: Use environment variables
const apiKey = process.env.API_KEY
if (!apiKey) throw new Error('API_KEY required')
```

### Validate All Inputs

```typescript
import { z } from 'zod'

// ✅ CORRECT: Validate at public API boundary
export function processUserInput(input: unknown) {
  const schema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
  })
  
  return schema.parse(input)  // Throws on invalid
}
```

### Type Narrowing

```typescript
// ✅ CORRECT: Safe type guards
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function process(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string here
    return value.toUpperCase()
  }
  throw new Error('Invalid input')
}
```

---

## Publishing Security

### Package.json Security

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ],
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### 2FA for Publishing

```bash
# Enable 2FA for your npm account
npm profile enable-2fa

# Or require 2FA for publishing
npm access grant read-write myorg:developers --scope=@myorg
npm token create --automation --scope=@myorg
```

---

## Type Safety

### Strict TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Export Types Explicitly

```typescript
// ✅ CORRECT: Export types alongside functions
export interface User {
  id: string
  name: string
  email: string
}

export function createUser(data: Omit<User, 'id'>): User {
  return { id: crypto.randomUUID(), ...data }
}

// ❌ WRONG: No type exports
// Users can't import types from your library
```

---

## Supply Chain

### Lock Dependencies

```bash
# ✅ CORRECT: Use lock files
pnpm install  # Creates/uses pnpm-lock.yaml

# ❌ WRONG: Delete lock files
rm pnpm-lock.yaml  # Causes version drift!
```

### Audit Dependencies

```bash
# Regular security audits
pnpm audit

# Fix vulnerabilities
pnpm audit fix

# Automated in CI
```

### Pin Versions

```json
{
  "dependencies": {
    // ✅ Use ^ for controlled updates
    "zod": "^3.22.0"
  }
}
```

---

## Pre-Publication Checklist

- [ ] No hardcoded secrets
- [ ] All inputs validated
- [ ] TypeScript strict mode enabled
- [ ] Tests passing
- [ ] Build succeeds
- [ ] Type declarations generated
- [ ] README has security section
- [ ] 2FA enabled on npm account
- [ ] Dependencies audited
- [ ] Lock files committed

---

## Vulnerability Response

If your library has a vulnerability:

1. **Acknowledge** within 24 hours
2. **Assess** the impact and severity
3. **Fix** the vulnerability
4. **Publish** a new version
5. **Notify** users via:
   - GitHub Security Advisory
   - npm audit message
   - Release notes

```bash
# Create security advisory
gh api repos/{owner}/{repo}/advisories \
  -f severity=high \
  -f cvss_score=7.5 \
  -f description="Vulnerability description"
```

---

## Related Documentation

- [Root SECURITY.md](../../SECURITY.md) - Comprehensive security guide
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [README.md](./README.md) - Full documentation
