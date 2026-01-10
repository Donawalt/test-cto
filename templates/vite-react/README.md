# React + Vite Template

This template provides a minimal React application using Vite with the MyApp monorepo packages.

## 🚀 Quick Start

### 1. Initialize the Template

```bash
# Copy template files
cp -r templates/vite-react my-react-app
cd my-react-app

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### 2. Generated Types Available

The template automatically uses generated types from your schema definitions:

```typescript
// src/components/UserCard.tsx
import type { Users } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { usersTable } from '@myapp/db'

interface UserCardProps {
  user: Users
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
        {user.role}
      </span>
    </div>
  )
}
```

### 3. API Integration

```typescript
// src/api/users.ts
import type { UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

export async function fetchUsers(): Promise<Users[]> {
  const response = await fetch(UsersAPI.ENDPOINT)
  const data = await response.json()
  
  // Validate with generated Zod schema
  return UsersSchema.array().parse(data)
}

export async function createUser(userData: UsersAPI.CreateBody): Promise<Users> {
  const response = await fetch(UsersAPI.ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  
  return UsersSchema.parse(await response.json())
}
```

## 📁 Template Structure

```
vite-react/
├── src/
│   ├── components/
│   │   ├── UserCard.tsx          # Example component with generated types
│   │   └── UsersList.tsx         # Example list component
│   ├── api/
│   │   └── users.ts              # API functions using generated types
│   ├── pages/
│   │   ├── HomePage.tsx          # Example page
│   │   └── UsersPage.tsx         # Users management page
│   ├── hooks/
│   │   ├── useUsers.ts           # Custom hook with type safety
│   │   └── useValidation.ts      # Validation hook
│   ├── lib/
│   │   └── validation.ts         # Validation utilities
│   ├── main.tsx                  # App entry point
│   └── App.tsx                   # Main app component
├── package.json                  # Template dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind CSS config
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

## 🔧 Key Features

### Type Safety
- All components use generated TypeScript interfaces
- API responses validated with Zod schemas
- Database queries use generated Drizzle types

### UI Components
- Tailwind CSS for styling
- Responsive design patterns
- Accessible components

### State Management
- React hooks for state
- Type-safe API integration
- Validation at boundaries

### Development Experience
- Hot module replacement
- TypeScript support
- ESLint and Prettier

## 🎯 Example Usage

### User Management Page

```typescript
// src/pages/UsersPage.tsx
import { useState, useEffect } from 'react'
import { UserCard } from '../components/UserCard'
import { useUsers } from '../hooks/useUsers'
import type { Users } from '@myapp/types'

export function UsersPage() {
  const { users, loading, error } = useUsers()
  const [selectedUser, setSelectedUser] = useState<Users | null>(null)

  if (loading) return <div>Loading users...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Users</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => setSelectedUser(user)}
          />
        ))}
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
```

### Custom Hook with Types

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react'
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { fetchUsers, createUser } from '../api/users'

export function useUsers() {
  const [users, setUsers] = useState<Users[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true)
        const data = await fetchUsers()
        setUsers(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const createNewUser = async (userData: UsersAPI.CreateBody) => {
    try {
      const newUser = await createUser(userData)
      setUsers(prev => [...prev, newUser])
      return newUser
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return { users, loading, error, createUser: createNewUser }
}
```

### Form Validation

```typescript
// src/components/UserForm.tsx
import { useState } from 'react'
import { UsersSchema, type UsersAPI } from '@myapp/types'
import { useValidation } from '../hooks/useValidation'

export function UserForm({ onSubmit }: { onSubmit: (data: UsersAPI.CreateBody) => void }) {
  const [formData, setFormData] = useState<UsersAPI.CreateBody>({
    name: '',
    email: '',
    role: 'user'
  })

  const { errors, validate, isValid } = useValidation(UsersSchema, formData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate() && isValid()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <button
        type="submit"
        disabled={!isValid()}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Create User
      </button>
    </form>
  )
}
```

## 🧪 Testing

The template includes example tests using Vitest:

```typescript
// src/__tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from '../components/UserCard'
import type { Users } from '@myapp/types'

describe('UserCard', () => {
  const mockUser: Users = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    created_at: new Date()
  }

  it('renders user information', () => {
    render(<UserCard user={mockUser} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })
})
```

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build
pnpm build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 🔗 Integration

### With Other Packages

```typescript
// Use UI components
import { Button, Card } from '@myapp/ui'

// Use hooks
import { useAuth } from '@myapp/hooks'

// Use utilities
import { formatDate } from '@myapp/utils'
```

### Database Integration

```typescript
// Direct database queries
import { db } from '@myapp/db'
import { usersTable } from '@myapp/db/generated/drizzle'

export async function getUsers() {
  return db.select().from(usersTable)
}
```

---

This template provides a complete foundation for building React applications with the MyApp monorepo, featuring automatic type generation, validation, and a modern development experience.