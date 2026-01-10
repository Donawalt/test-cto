# Security - api-server Template

Security best practices for Express API servers.

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Input Validation](#input-validation)
4. [CORS Configuration](#cors-configuration)
5. [Rate Limiting](#rate-limiting)
6. [Security Headers](#security-headers)
7. [Logging](#logging)
8. [Database Security](#database-security)
9. [Deployment Security](#deployment-security)

---

## Authentication

### JWT Best Practices

```typescript
// ✅ CORRECT: Short-lived access tokens
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 15 * 60 },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  )
  
  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET!,
    { algorithm: 'HS256', expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// ❌ WRONG: Long-lived tokens
const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' })
```

### Secure Cookie Settings

```typescript
// ✅ CORRECT: Secure cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  },
}))
```

---

## Authorization

### Role-Based Access Control

```typescript
type Role = 'user' | 'moderator' | 'admin'

interface AuthRequest extends Request {
  user?: {
    id: string
    role: Role
  }
}

function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}

// Usage
router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser)
```

### Resource Ownership

```typescript
// ✅ CORRECT: Check resource ownership
router.delete('/posts/:id', authenticate, async (req, res) => {
  const post = await getPost(req.params.id)
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }
  
  // Users can only delete their own posts (unless admin)
  if (post.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Cannot delete this post' })
  }
  
  await deletePost(req.params.id)
  res.status(204).send()
})
```

---

## Input Validation

### Zod Validation

```typescript
import { z } from 'zod'

// ✅ CORRECT: Validate all inputs
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  password: z.string().min(12),
  role: z.enum(['user', 'admin']).default('user'),
})

router.post('/users', async (req, res) => {
  try {
    const data = CreateUserSchema.parse(req.body)
    const user = await createUser(data)
    res.status(201).json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})
```

### Sanitization

```typescript
// ✅ CORRECT: Sanitize user inputs
import DOMPurify from 'dompurify'

router.post('/comments', async (req, res) => {
  const { content } = req.body
  
  // Sanitize HTML content
  const sanitized = DOMPurify.sanitize(content)
  
  await saveComment({ content: sanitized, authorId: req.user!.id })
  res.status(201).json({ success: true })
})
```

---

## CORS Configuration

```typescript
// ✅ CORRECT: Strict CORS
import cors from 'cors'

const corsOptions: cors.CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}

app.use(cors(corsOptions))

// ❌ WRONG: Permissive CORS
app.use(cors())  // Allows any origin!
```

---

## Rate Limiting

```typescript
// ✅ CORRECT: Rate limiting
import rateLimit from 'express-rate-limit'

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
})

app.use(generalLimiter)
app.post('/auth/login', authLimiter, loginHandler)
```

---

## Security Headers

```typescript
// ✅ CORRECT: Helmet.js
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// Additional headers
app.disable('x-powered-by')
```

---

## Logging

### Secure Logging

```typescript
// ✅ CORRECT: No sensitive data in logs
import { logger } from '@myapp/server-utils/logger'

// ❌ WRONG: Logging sensitive data
logger.info('User login', { email: 'user@example.com', password: 'secret123' })

// ✅ CORRECT: Sanitized logging
logger.info('User login attempt', {
  email: email.substring(0, 2) + '***@***.' + email.split('@')[1],
  ip: req.ip,
  userAgent: req.headers['user-agent'],
})
```

### Request Logging

```typescript
// Log requests without sensitive data
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    })
  })
  
  next()
})
```

---

## Database Security

### Parameterized Queries

```typescript
// ✅ CORRECT: Use Drizzle ORM (parameterized queries)
import { eq } from 'drizzle-orm'
import { usersTable } from '@myapp/db/generated/drizzle'

// Drizzle automatically uses parameterized queries
const [user] = await db.select()
  .from(usersTable)
  .where(eq(usersTable.email, email))
```

### Connection Security

```typescript
// ✅ CORRECT: SSL/TLS for database
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  connection: {
    sslmode: 'verify-full',
  },
})
```

---

## Deployment Security

### Environment Variables

```bash
# .env - Never commit!
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-minimum-secret
JWT_REFRESH_SECRET=another-32-char-minimum
SESSION_SECRET=another-32-char-minimum
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com
```

### Docker Security

```dockerfile
# ✅ CORRECT: Non-root user
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Health Check Endpoint

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})
```

---

## Pre-Deployment Checklist

- [ ] JWT secrets are strong (32+ characters)
- [ ] Authentication implemented
- [ ] Authorization with RBAC
- [ ] All inputs validated with Zod
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers
- [ ] No sensitive data in logs
- [ ] SSL/TLS for database
- [ ] Environment variables set
- [ ] Health check endpoint
- [ ] Error handling doesn't leak info
- [ ] 2FA for npm (if publishing packages)
- [ ] Security audit passed (`pnpm audit`)
- [ ] Dependencies updated

---

## Related Documentation

- [Root SECURITY.md](../../SECURITY.md) - Comprehensive security guide
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [README.md](./README.md) - Full documentation
