# API Server Template

This template provides a complete Node.js/Express API server with automatic type generation from your schema definitions.

## 🚀 Quick Start

### 1. Initialize the Template

```bash
# Copy template files
cp -r templates/api-server my-api
cd my-api

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### 2. Database Setup

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@myapp/db/generated/drizzle'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

### 3. Generated Types Available

The template automatically uses generated types and validators:

```typescript
// src/routes/users.ts
import { Router } from 'express'
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { createMockUsers } from '@myapp/types'
import { usersTable } from '@myapp/db/generated/drizzle'

const router = Router()

// GET /users - List all users
router.get('/', async (req, res) => {
  try {
    const users = await db.select().from(usersTable)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// POST /users - Create new user
router.post('/', async (req, res) => {
  try {
    // Validate request body using generated Zod schema
    const userData: UsersAPI.CreateBody = UsersSchema.parse(req.body)
    
    // Insert into database
    const [newUser] = await db.insert(usersTable)
      .values(userData)
      .returning()
    
    res.status(201).json(newUser)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
})

// GET /users/:id - Get specific user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
```

## 📁 Template Structure

```
api-server/
├── src/
│   ├── routes/
│   │   ├── users.ts              # User routes with generated types
│   │   ├── posts.ts              # Post routes with generated types
│   │   └── comments.ts           # Comment routes with generated types
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   ├── validation.ts        # Request validation middleware
│   │   └── errorHandler.ts      # Error handling middleware
│   ├── services/
│   │   ├── userService.ts       # Business logic with type safety
│   │   ├── postService.ts       # Business logic with type safety
│   │   └── validationService.ts # Validation service
│   ├── db/
│   │   ├── index.ts             # Database connection
│   │   └── migrations/          # Database migrations
│   ├── types/
│   │   └── api.ts              # API-specific type extensions
│   ├── utils/
│   │   ├── logger.ts           # Logging utilities
│   │   └── constants.ts         # API constants
│   ├── server.ts               # Express app setup
│   └── index.ts                # Server entry point
├── tests/
│   ├── routes/
│   │   ├── users.test.ts       # Route tests with generated mocks
│   │   └── posts.test.ts       # Route tests with generated mocks
│   └── utils/
│       └── setup.ts            # Test setup
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## 🔧 Key Features

### Type Safety
- All routes use generated TypeScript interfaces
- Request/response validation with Zod schemas
- Database queries use generated Drizzle types

### Validation Middleware
```typescript
// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data' })
    }
  }
}

// Usage in routes
import { validateBody } from '../middleware/validation'
import { UsersSchema } from '@myapp/types'

router.post('/', validateBody(UsersSchema), (req, res) => {
  // req.body is now validated and typed
  const userData: Users = req.body
})
```

### Service Layer
```typescript
// src/services/userService.ts
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { usersTable } from '@myapp/db/generated/drizzle'
import { db } from '../db'

export class UserService {
  async createUser(userData: UsersAPI.CreateBody): Promise<Users> {
    // Validate with generated schema
    const validatedData = UsersSchema.parse(userData)
    
    // Business logic
    const existingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email))
      .limit(1)
    
    if (existingUser.length > 0) {
      throw new Error('User already exists')
    }
    
    // Insert into database
    const [newUser] = await db.insert(usersTable)
      .values(validatedData)
      .returning()
    
    return newUser
  }

  async getUserById(id: string): Promise<Users | null> {
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
    
    return user || null
  }

  async updateUser(id: string, updates: UsersAPI.UpdateBody): Promise<Users> {
    // Validate updates
    const validatedUpdates = UsersSchema.partial().parse(updates)
    
    const [updatedUser] = await db.update(usersTable)
      .set(validatedUpdates)
      .where(eq(usersTable.id, id))
      .returning()
    
    if (!updatedUser) {
      throw new Error('User not found')
    }
    
    return updatedUser
  }
}

export const userService = new UserService()
```

### Authentication Middleware
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'user' | 'admin' | 'moderator'
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user']
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}
```

## 🎯 Complete API Example

```typescript
// src/routes/users.ts
import { Router } from 'express'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { userService } from '../services/userService'
import { validateBody } from '../middleware/validation'
import { authenticate, requireRole } from '../middleware/auth'
import { UsersSchema, UsersAPI } from '@myapp/types'
import { createMockUsers } from '@myapp/types'

const router = Router()

// GET /users - List all users (admin only)
router.get('/', 
  authenticate,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query
      
      // Use generated mock data for development
      if (process.env.NODE_ENV === 'development') {
        const mockUsers = createMockUsers()
        return res.json({
          users: mockUsers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 100,
            totalPages: 10
          }
        })
      }
      
      const offset = (Number(page) - 1) * Number(limit)
      const users = await userService.getUsers({
        limit: Number(limit),
        offset,
        search: search as string
      })
      
      res.json({
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: users.length,
          totalPages: Math.ceil(users.length / Number(limit))
        }
      })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  }
)

// GET /users/:id - Get specific user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await userService.getUserById(id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /users - Create new user
router.post('/', 
  validateBody(UsersSchema.pick({ email: true, name: true, role: true })),
  async (req, res) => {
    try {
      const userData: UsersAPI.CreateBody = req.body
      const newUser = await userService.createUser(userData)
      res.status(201).json(newUser)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ error: error.message })
        } else {
          res.status(400).json({ error: error.message })
        }
      } else {
        res.status(500).json({ error: 'Failed to create user' })
      }
    }
  }
)

// PUT /users/:id - Update user (self or admin)
router.put('/:id', 
  authenticate,
  validateBody(UsersSchema.partial()),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params
      const updates: UsersAPI.UpdateBody = req.body
      
      // Users can only update their own profile unless they're admin
      if (req.user!.id !== id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Cannot update other users' })
      }
      
      const updatedUser = await userService.updateUser(id, updates)
      res.json(updatedUser)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' })
    }
  }
)

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', 
  authenticate,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params
      await userService.deleteUser(id)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' })
    }
  }
)

export default router
```

## 🧪 Testing

The template includes comprehensive tests using generated mock data:

```typescript
// tests/routes/users.test.ts
import request from 'supertest'
import { app } from '../src/server'
import { createMockUsers } from '@myapp/types'

describe('Users API', () => {
  describe('GET /users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)
      
      expect(response.body).toHaveProperty('users')
      expect(Array.isArray(response.body.users)).toBe(true)
    })

    it('should filter users by search', async () => {
      const mockUsers = createMockUsers()
      
      const response = await request(app)
        .get('/users?search=john')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)
      
      expect(response.body.users).toHaveLength(mockUsers.length)
    })
  })

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user' as const
      }
      
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201)
      
      expect(response.body).toMatchObject(userData)
      expect(response.body).toHaveProperty('id')
    })

    it('should reject invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        role: 'invalid-role'
      }
      
      await request(app)
        .post('/users')
        .send(invalidData)
        .expect(400)
    })
  })
})
```

## 🚀 Deployment

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
JWT_SECRET=your-jwt-secret
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

---

This template provides a production-ready API server with automatic type generation, validation, authentication, and comprehensive testing capabilities.