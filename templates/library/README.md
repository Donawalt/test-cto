# Library Template

This template provides a foundation for building npm packages/libraries with automatic type generation and comprehensive tooling.

## 🚀 Quick Start

### 1. Initialize the Template

```bash
# Copy template files
cp -r templates/library my-lib
cd my-lib

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### 2. Generated Types Integration

The template automatically includes generated types that your library can consume:

```typescript
// src/index.ts
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { createMockUsers } from '@myapp/types'

export * from '@myapp/types'
export * from './lib'
export * from './utils'

// Your library functions that use generated types
export function validateUser(user: unknown): Users {
  return UsersSchema.parse(user)
}

export function createUserService() {
  return {
    async fetchUsers(): Promise<Users[]> {
      // Use generated mock data for development
      if (process.env.NODE_ENV === 'development') {
        return createMockUsers()
      }
      
      // Real implementation would fetch from API
      const response = await fetch('/api/users')
      const data = await response.json()
      return UsersSchema.array().parse(data.users)
    },
    
    async createUser(userData: UsersAPI.CreateBody): Promise<Users> {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      return UsersSchema.parse(await response.json())
    }
  }
}
```

## 📁 Template Structure

```
library/
├── src/
│   ├── lib/
│   │   ├── core.ts               # Core library functionality
│   │   ├── api.ts               # API integration with types
│   │   ├── database.ts          # Database utilities with types
│   │   └── validation.ts        # Validation utilities
│   ├── utils/
│   │   ├── helpers.ts           # Helper functions
│   │   ├── constants.ts         # Constants with types
│   │   └── types.ts             # Library-specific types
│   ├── components/
│   │   ├── Button.tsx           # Reusable UI components
│   │   └── Modal.tsx           # Modal components
│   ├── hooks/
│   │   ├── useUsers.ts          # Custom hooks
│   │   └── useValidation.ts    # Validation hooks
│   ├── index.ts                # Main entry point
│   └── types.ts                # TypeScript declarations
├── docs/
│   ├── getting-started.md       # Getting started guide
│   ├── api-reference.md        # API documentation
│   └── examples/
│       ├── basic-usage.ts      # Basic usage examples
│       └── advanced-usage.ts   # Advanced usage examples
├── examples/
│   ├── basic/
│   │   └── index.ts           # Basic usage example
│   ├── react/
│   │   └── App.tsx            # React integration example
│   └── node/
│       └── index.js            # Node.js usage example
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── fixtures/              # Test fixtures
├── scripts/
│   ├── build.js               # Build script
│   ├── publish.js             # Publishing script
│   └── docs.js               # Documentation generation
├── package.json
├── tsconfig.json
├── rollup.config.js           # Bundler configuration
├── tsup.config.ts            # TypeScript bundler
├── vitest.config.ts           # Test configuration
└── README.md
```

## 🔧 Key Features

### Type-Safe Core Library

```typescript
// src/lib/core.ts
import type { Users, Posts, Comments, UsersAPI, PostsAPI, CommentsAPI } from '@myapp/types'
import { UsersSchema, PostsSchema, CommentsSchema } from '@myapp/types'
import { createMockUsers, createMockPosts, createMockComments } from '@myapp/types'

export class AppService {
  constructor(private apiBaseUrl: string) {}

  // User operations with type safety
  async getUsers(): Promise<Users[]> {
    if (process.env.NODE_ENV === 'development') {
      return createMockUsers()
    }

    const response = await fetch(`${this.apiBaseUrl}/users`)
    const data = await response.json()
    return UsersSchema.array().parse(data.users)
  }

  async createUser(userData: UsersAPI.CreateBody): Promise<Users> {
    const response = await fetch(`${this.apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    return UsersSchema.parse(await response.json())
  }

  // Post operations with type safety
  async getPosts(): Promise<Posts[]> {
    if (process.env.NODE_ENV === 'development') {
      return createMockPosts()
    }

    const response = await fetch(`${this.apiBaseUrl}/posts`)
    const data = await response.json()
    return PostsSchema.array().parse(data.posts)
  }

  async createPost(postData: PostsAPI.CreateBody): Promise<Posts> {
    const response = await fetch(`${this.apiBaseUrl}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })

    return PostsSchema.parse(await response.json())
  }

  // Comment operations with type safety
  async getComments(): Promise<Comments[]> {
    if (process.env.NODE_ENV === 'development') {
      return createMockComments()
    }

    const response = await fetch(`${this.apiBaseUrl}/comments`)
    const data = await response.json()
    return CommentsSchema.array().parse(data.comments)
  }
}
```

### Validation Utilities

```typescript
// src/lib/validation.ts
import { z } from 'zod'
import type { Users, Posts, Comments, UsersAPI, PostsAPI, CommentsAPI } from '@myapp/types'
import { UsersSchema, PostsSchema, CommentsSchema } from '@myapp/types'

export class Validator {
  // Validate user data
  static validateUser(data: unknown): { success: true; data: Users } | { success: false; error: string } {
    try {
      const validated = UsersSchema.parse(data)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message || 'Invalid user data' }
      }
      return { success: false, error: 'Validation failed' }
    }
  }

  // Validate user creation data
  static validateUserCreate(data: unknown): { success: true; data: UsersAPI.CreateBody } | { success: false; error: string } {
    try {
      const schema = UsersSchema.pick({ name: true, email: true, role: true })
      const validated = schema.parse(data)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message || 'Invalid user creation data' }
      }
      return { success: false, error: 'Validation failed' }
    }
  }

  // Validate post data
  static validatePost(data: unknown): { success: true; data: Posts } | { success: false; error: string } {
    try {
      const validated = PostsSchema.parse(data)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message || 'Invalid post data' }
      }
      return { success: false, error: 'Validation failed' }
    }
  }

  // Validate comment data
  static validateComment(data: unknown): { success: true; data: Comments } | { success: false; error: string } {
    try {
      const validated = CommentsSchema.parse(data)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message || 'Invalid comment data' }
      }
      return { success: false, error: 'Validation failed' }
    }
  }
}
```

### React Components

```tsx
// src/components/Button.tsx
import React from 'react'
import type { Users } from '@myapp/types'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const isDisabled = disabled || loading
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}
```

### Custom Hooks

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react'
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { AppService } from '../lib/core'
import { Validator } from '../lib/validation'

export function useUsers(apiBaseUrl: string) {
  const [users, setUsers] = useState<Users[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const appService = new AppService(apiBaseUrl)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await appService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [appService])

  const createUser = useCallback(async (userData: UsersAPI.CreateBody) => {
    try {
      setError(null)
      
      // Validate input
      const validation = Validator.validateUserCreate(userData)
      if (!validation.success) {
        throw new Error(validation.error)
      }

      const newUser = await appService.createUser(validation.data)
      setUsers(prev => [...prev, newUser])
      return newUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [appService])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    createUser,
    refetch: fetchUsers
  }
}
```

## 📦 Building and Publishing

### Build Configuration

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2020',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  external: ['react', 'react-dom', '@myapp/types'],
  onSuccess: 'npm run test',
})
```

### Package.json

```json
{
  "name": "@myapp/my-library",
  "version": "1.0.0",
  "description": "Type-safe library with automatic type generation",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "import": "./dist/react.js",
      "require": "./dist/react.cjs"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:run",
    "publish:npm": "npm publish --access public",
    "docs:build": "typedoc",
    "docs:dev": "typedoc --watch"
  },
  "dependencies": {
    "@myapp/types": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "typedoc": "^0.25.0"
  }
}
```

## 🧪 Testing

### Unit Tests

```typescript
// tests/unit/validation.test.ts
import { describe, it, expect } from 'vitest'
import { Validator } from '../../src/lib/validation'
import { createMockUsers } from '@myapp/types'

describe('Validator', () => {
  describe('validateUser', () => {
    it('should validate correct user data', () => {
      const mockUser = createMockUsers()[0]
      const result = Validator.validateUser(mockUser)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockUser)
      }
    })

    it('should reject invalid user data', () => {
      const invalidUser = {
        id: 'not-a-uuid',
        name: '',
        email: 'invalid-email',
        role: 'invalid-role'
      }
      
      const result = Validator.validateUser(invalidUser)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('validateUserCreate', () => {
    it('should validate user creation data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const
      }
      
      const result = Validator.validateUserCreate(userData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(userData)
      }
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        name: 'John Doe'
        // Missing email and role
      }
      
      const result = Validator.validateUserCreate(invalidData)
      
      expect(result.success).toBe(false)
    })
  })
})
```

### Integration Tests

```typescript
// tests/integration/userService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AppService } from '../../src/lib/core'
import { createMockUsers } from '@myapp/types'

// Mock fetch
global.fetch = vi.fn()

describe('AppService', () => {
  let service: AppService

  beforeEach(() => {
    service = new AppService('https://api.example.com')
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users from API', async () => {
      const mockUsers = createMockUsers()
      const mockResponse = {
        users: mockUsers
      }

      ;(fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await service.getUsers()

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/users')
      expect(result).toEqual(mockUsers)
    })

    it('should use mock data in development', async () => {
      vi.stubGlobal('process.env.NODE_ENV', 'development')
      
      const result = await service.getUsers()
      
      expect(fetch).not.toHaveBeenCalled()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('createUser', () => {
    it('should create user via API', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const
      }

      const mockCreatedUser = {
        id: '123',
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      }

      ;(fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedUser)
      } as Response)

      const result = await service.createUser(userData)

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      expect(result).toEqual(mockCreatedUser)
    })
  })
})
```

## 📚 Documentation

### Basic Usage

```typescript
// examples/basic/index.ts
import { AppService, Validator } from '@myapp/my-library'
import type { UsersAPI } from '@myapp/types'

async function main() {
  // Initialize service
  const service = new AppService('https://api.example.com')
  
  // Fetch users
  const users = await service.getUsers()
  console.log('Users:', users)
  
  // Create user with validation
  const userData: UsersAPI.CreateBody = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'user'
  }
  
  const validation = Validator.validateUserCreate(userData)
  if (validation.success) {
    const newUser = await service.createUser(validation.data)
    console.log('Created user:', newUser)
  } else {
    console.error('Validation failed:', validation.error)
  }
}

main().catch(console.error)
```

### React Integration

```tsx
// examples/react/App.tsx
import React from 'react'
import { useUsers } from '@myapp/my-library/react'
import { Button } from '@myapp/my-library'

export function App() {
  const { users, loading, error, createUser } = useUsers('https://api.example.com')

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: 'New User',
        email: 'new@example.com',
        role: 'user'
      })
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Users</h1>
      <Button onClick={handleCreateUser}>Add User</Button>
      
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

This library template provides a complete foundation for building type-safe npm packages with automatic type generation, comprehensive testing, and excellent developer experience.