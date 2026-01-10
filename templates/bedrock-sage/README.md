# Bedrock + Sage Template

This template provides a complete full-stack application foundation with Bedrock (backend) + Sage (frontend) architecture, featuring automatic type generation and comprehensive tooling.

## 🚀 Quick Start

### 1. Initialize the Template

```bash
# Copy template files
cp -r templates/bedrock-sage my-app
cd my-app

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### 2. Architecture Overview

```
my-app/
├── apps/
│   ├── bedrock/        # Backend API server (Express + Drizzle)
│   └── sage/           # Frontend (React + Vite)
├── packages/
│   ├── types/          # Shared types (auto-generated)
│   ├── schema/         # Schema definitions + CLI
│   ├── db/             # Database utilities
│   ├── ui/             # UI components
│   ├── hooks/          # React hooks
│   └── utils/          # Shared utilities
└── templates/           # Additional templates
```

### 3. Generated Types Flow

```mermaid
graph TD
    A[Schema Definitions] --> B[Type Generator CLI]
    B --> C[Generated Types]
    C --> D[Backend API]
    C --> E[Frontend Components]
    C --> F[Database Schemas]
    C --> G[Validation Schemas]
    C --> H[Mock Data]
```

## 📁 Bedrock (Backend)

### 1. Database Layer

```typescript
// apps/bedrock/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@myapp/db/generated/drizzle'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
export * from '@myapp/db/generated/drizzle'
```

### 2. API Routes with Generated Types

```typescript
// apps/bedrock/src/routes/users.ts
import { Router } from 'express'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { userService } from '../services/userService'
import { validateBody } from '../middleware/validation'
import { authenticate, requireRole } from '../middleware/auth'
import { UsersSchema, UsersAPI } from '@myapp/types'
import { usersTable } from '@myapp/db/generated/drizzle'

const router = Router()

// GET /api/users - List users with pagination
router.get('/', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    const whereConditions = []
    if (search) {
      whereConditions.push(
        or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.email, `%${search}%`)
        )
      )
    }
    if (role) {
      whereConditions.push(eq(usersTable.role, role as string))
    }

    const users = await db.select()
      .from(usersTable)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(Number(limit))
      .offset(offset)
      .orderBy(usersTable.created_at)

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: users.length
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// POST /api/users - Create user
router.post('/', 
  validateBody(UsersSchema.pick({ name: true, email: true, role: true })),
  async (req, res) => {
    try {
      const userData: UsersAPI.CreateBody = req.body
      const newUser = await userService.createUser(userData)
      res.status(201).json(newUser)
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create user' })
    }
  }
)

// GET /api/users/:id - Get user by ID
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

// PUT /api/users/:id - Update user
router.put('/:id',
  authenticate,
  validateBody(UsersSchema.partial()),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params
      const updates: UsersAPI.UpdateBody = req.body
      
      // Users can only update their own profile
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

// DELETE /api/users/:id - Delete user (admin only)
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

### 3. Service Layer

```typescript
// apps/bedrock/src/services/userService.ts
import { eq, and, or, ilike } from 'drizzle-orm'
import { db } from '../db'
import { usersTable, postsTable, commentsTable } from '@myapp/db/generated/drizzle'
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { Validator } from '../utils/validation'

export class UserService {
  async createUser(userData: UsersAPI.CreateBody): Promise<Users> {
    // Validate input
    const validation = Validator.validateUserCreate(userData)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    // Check if user already exists
    const existingUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, validation.data.email))
      .limit(1)

    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists')
    }

    // Create user
    const [newUser] = await db.insert(usersTable)
      .values({
        ...validation.data,
        id: crypto.randomUUID()
      })
      .returning()

    return UsersSchema.parse(newUser)
  }

  async getUserById(id: string): Promise<Users | null> {
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))

    return user ? UsersSchema.parse(user) : null
  }

  async updateUser(id: string, updates: UsersAPI.UpdateBody): Promise<Users> {
    // Validate updates
    const validation = Validator.validateUserUpdate(updates)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    const [updatedUser] = await db.update(usersTable)
      .set({
        ...validation.data,
        updated_at: new Date()
      })
      .where(eq(usersTable.id, id))
      .returning()

    if (!updatedUser) {
      throw new Error('User not found')
    }

    return UsersSchema.parse(updatedUser)
  }

  async deleteUser(id: string): Promise<void> {
    // Delete related data first (cascade)
    await db.delete(commentsTable).where(eq(commentsTable.author_id, id))
    await db.delete(postsTable).where(eq(postsTable.author_id, id))
    await db.delete(usersTable).where(eq(usersTable.id, id))
  }

  async getUsersWithStats() {
    const users = await db.select({
      user: usersTable,
      postCount: db.select({ count: db.count() })
        .from(postsTable)
        .where(eq(postsTable.author_id, usersTable.id)),
      commentCount: db.select({ count: db.count() })
        .from(commentsTable)
        .where(eq(commentsTable.author_id, usersTable.id))
    }).from(usersTable)

    return users.map(user => ({
      ...user.user,
      stats: {
        posts: user.postCount[0]?.count || 0,
        comments: user.commentCount[0]?.count || 0
      }
    }))
  }
}

export const userService = new UserService()
```

## 🎨 Sage (Frontend)

### 1. App Setup with Type Generation

```typescript
// apps/sage/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

### 2. API Client with Generated Types

```typescript
// apps/sage/src/lib/api/client.ts
import { QueryClient } from '@tanstack/react-query'
import type { Users, Posts, Comments, UsersAPI, PostsAPI, CommentsAPI } from '@myapp/types'
import { UsersSchema, PostsSchema, CommentsSchema } from '@myapp/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as T
  }

  // User API
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<{ users: Users[]; pagination: any }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)

    return this.request(`/users?${searchParams.toString()}`)
  }

  async getUser(id: string): Promise<Users> {
    return this.request<Users>(`/users/${id}`)
  }

  async createUser(userData: UsersAPI.CreateBody): Promise<Users> {
    return this.request<Users>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, updates: UsersAPI.UpdateBody): Promise<Users> {
    return this.request<Users>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/users/${id}`, { method: 'DELETE' })
  }

  // Post API
  async getPosts(params?: { page?: number; limit?: number; authorId?: string }): Promise<{ posts: Posts[]; pagination: any }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.authorId) searchParams.append('authorId', params.authorId)

    return this.request(`/posts?${searchParams.toString()}`)
  }

  async createPost(postData: PostsAPI.CreateBody): Promise<Posts> {
    return this.request<Posts>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  }

  // Comment API
  async getComments(postId?: string): Promise<Comments[]> {
    const endpoint = postId ? `/comments?postId=${postId}` : '/comments'
    return this.request<Comments[]>(endpoint)
  }

  async createComment(commentData: CommentsAPI.CreateBody): Promise<Comments> {
    return this.request<Comments>('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    })
  }
}

export const apiClient = new ApiClient()
export { UsersSchema, PostsSchema, CommentsSchema }
```

### 3. React Query Hooks

```typescript
// apps/sage/src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api/client'
import type { Users, UsersAPI } from '@myapp/types'
import { useValidation } from './useValidation'

export function useUsers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiClient.getUsers(params),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { validate } = useValidation()

  return useMutation({
    mutationFn: async (userData: UsersAPI.CreateBody) => {
      // Validate using generated schema
      const validation = validate(userData, 'userCreate')
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      return apiClient.createUser(userData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: UsersAPI.UpdateBody) => apiClient.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### 4. Components with Generated Types

```typescript
// apps/sage/src/components/UserForm.tsx
import React, { useState } from 'react'
import { useCreateUser, useUpdateUser } from '../hooks/useUsers'
import type { UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { Button } from '@myapp/ui'

interface UserFormProps {
  user?: Users
  onSuccess?: () => void
  onCancel?: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UsersAPI.CreateBody>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser(user?.id || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate using generated Zod schema
      const validation = UsersSchema.pick({
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
      }).partial().safeParse(formData)

      if (!validation.success) {
        const newErrors: Record<string, string> = {}
        validation.error.errors.forEach((error) => {
          const path = error.path.join('.')
          newErrors[path] = error.message
        })
        setErrors(newErrors)
        return
      }

      if (user) {
        await updateMutation.mutateAsync(validation.data)
      } else {
        await createMutation.mutateAsync(validation.data)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 ${
            errors.email ? 'border-red-500' : ''
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
          Avatar URL
        </label>
        <input
          type="url"
          id="avatar"
          value={formData.avatar || ''}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={createMutation.isPending || updateMutation.isPending}
        >
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}
```

## 🚀 Development Workflow

### 1. Development Commands

```bash
# Start all services
pnpm dev

# Start only backend
pnpm dev:bedrock

# Start only frontend
pnpm dev:sage

# Generate types
pnpm types:generate

# Watch mode for types
pnpm types:watch
```

### 2. Adding New Features

1. **Define Schema:**
```typescript
// packages/schema/src/schemas/products.ts
export const products = defineTable({
  name: 'products',
  columns: {
    id: { name: 'id', type: 'uuid', required: true, primaryKey: true },
    name: { name: 'name', type: 'string', required: true },
    price: { name: 'price', type: 'float', required: true },
    description: { name: 'description', type: 'text', required: false }
  }
})
schemaBuilder.defineTable(products)
```

2. **Generate Types:**
```bash
pnpm types:generate
```

3. **Use in Backend:**
```typescript
// apps/bedrock/src/routes/products.ts
import type { Products, ProductsAPI } from '@myapp/types'
import { ProductsSchema } from '@myapp/types'
```

4. **Use in Frontend:**
```typescript
// apps/sage/src/components/ProductCard.tsx
import type { Products } from '@myapp/types'
import { ProductsSchema } from '@myapp/types'
```

## 🧪 Testing

### Backend Tests

```typescript
// apps/bedrock/tests/users.test.ts
import request from 'supertest'
import { app } from '../src/server'
import { createMockUsers } from '@myapp/types'

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should return users with pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=10')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)

      expect(response.body).toHaveProperty('users')
      expect(response.body).toHaveProperty('pagination')
      expect(Array.isArray(response.body.users)).toBe(true)
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const
      }

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201)

      expect(response.body).toMatchObject(userData)
      expect(response.body).toHaveProperty('id')
    })

    it('should reject invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        role: 'invalid-role'
      }

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })
})
```

### Frontend Tests

```typescript
// apps/sage/src/components/__tests__/UserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserForm } from '../UserForm'
import type { Users } from '@myapp/types'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('UserForm', () => {
  it('should render form fields', () => {
    render(<UserForm />, { wrapper: createWrapper() })

    expect(screen.getByLabelText('Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
  })

  it('should submit valid data', async () => {
    const onSuccess = jest.fn()

    render(<UserForm onSuccess={onSuccess} />, { wrapper: createWrapper() })

    fireEvent.change(screen.getByLabelText('Name *'), {
      target: { value: 'John Doe' }
    })

    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' }
    })

    fireEvent.click(screen.getByText('Create User'))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show validation errors for invalid data', async () => {
    render(<UserForm />, { wrapper: createWrapper() })

    fireEvent.click(screen.getByText('Create User'))

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
    })
  })
})
```

## 📦 Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  bedrock:
    build: ./apps/bedrock
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/myapp
      JWT_SECRET: your-jwt-secret
    depends_on:
      - postgres

  sage:
    build: ./apps/sage
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:3000/api
    depends_on:
      - bedrock

volumes:
  postgres_data:
```

### Environment Configuration

```bash
# apps/bedrock/.env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:password@postgres:5432/myapp
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173

# apps/sage/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

This Bedrock + Sage template provides a complete full-stack application with automatic type generation, comprehensive testing, and production-ready deployment configuration.