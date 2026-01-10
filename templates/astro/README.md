# Astro Template

This template provides a modern Astro-based website with automatic type generation from your schema definitions.

## 🚀 Quick Start

### 1. Initialize the Template

```bash
# Copy template files
cp -r templates/astro my-site
cd my-site

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### 2. Generated Types Available

The template automatically uses generated types for content and API integration:

```typescript
// src/pages/index.astro
---
import type { Users } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

const users = await fetch('/api/users').then(r => r.json())
const validatedUsers = UsersSchema.array().parse(users.users)
// or use: import { fetchUsers } from '../lib/api/users'
---

<html lang="en">
  <head>
    <title>My Site</title>
  </head>
  <body>
    <h1>Welcome to My Site</h1>
    
    <div class="users-grid">
      {validatedUsers.map((user) => (
        <div class="user-card">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span class="role-badge">{user.role}</span>
        </div>
      ))}
    </div>
  </body>
</html>
```

### 3. API Integration

```typescript
// src/lib/api/users.ts
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

export async function fetchUsers(): Promise<Users[]> {
  const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  
  const data = await response.json()
  return UsersSchema.array().parse(data.users)
}

export async function createUser(userData: UsersAPI.CreateBody): Promise<Users> {
  const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  
  return UsersSchema.parse(await response.json())
}
```

## 📁 Template Structure

```
astro/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage with generated types
│   │   ├── users/
│   │   │   └── index.astro          # Users page
│   │   ├── api/
│   │   │   └── users.ts            # API endpoints
│   │   └── admin/
│   │       └── index.astro         # Admin dashboard
│   ├── components/
│   │   ├── UserCard.astro          # Reusable user component
│   │   ├── BaseLayout.astro        # Layout component
│   │   └── forms/
│   │       └── UserForm.astro       # Form components
│   ├── lib/
│   │   ├── api/
│   │   │   ├── users.ts            # API functions with types
│   │   │   └── validation.ts       # Validation utilities
│   │   ├── db/
│   │   │   └── queries.ts          # Database queries
│   │   └── utils/
│   │       ├── date.ts             # Date utilities
│   │       └── validation.ts       # Validation helpers
│   ├── layouts/
│   │   ├── BaseLayout.astro        # Base layout
│   │   └── AdminLayout.astro       # Admin layout
│   └── styles/
│       ├── global.css              # Global styles
│       └── components.css          # Component styles
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.cjs
├── package.json
└── README.md
```

## 🔧 Key Features

### Static Generation with Types
```astro
---
// src/pages/users/index.astro
import type { Users } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import UserCard from '../../components/UserCard.astro'

// This runs at build time for SSG
const users: Users[] = await fetch(`${import.meta.env.PUBLIC_API_URL}/users`)
  .then(r => r.json())
  .then(data => UsersSchema.array().parse(data.users))
---

<html lang="en">
  <head>
    <title>Users - My Site</title>
  </head>
  <body>
    <main>
      <h1>All Users</h1>
      
      <div class="users-grid">
        {users.map(user => (
          <UserCard user={user} />
        ))}
      </div>
    </main>
  </body>
</html>
```

### Interactive Components
```typescript
// src/components/forms/UserForm.astro
---
import type { UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

interface Props {
  action: string
  method?: string
}

const { action, method = 'POST' } = Astro.props
---

<form action={action} method={method} class="user-form">
  <div class="form-group">
    <label for="name">Name</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      required 
      minlength="1"
      maxlength="100"
    />
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required 
      maxlength="255"
    />
  </div>

  <div class="form-group">
    <label for="role">Role</label>
    <select id="role" name="role" required>
      <option value="user">User</option>
      <option value="admin">Admin</option>
      <option value="moderator">Moderator</option>
    </select>
  </div>

  <button type="submit">Create User</button>
</form>

<script>
  const form = document.querySelector('.user-form')
  
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const formData = new FormData(form)
    const userData = Object.fromEntries(formData.entries())
    
    try {
      // Validate with generated Zod schema
      const validatedData = UsersSchema.pick({
        name: true,
        email: true,
        role: true
      }).parse(userData)
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })
      
      if (response.ok) {
        window.location.href = '/users'
      }
    } catch (error) {
      console.error('Validation error:', error)
    }
  })
</script>
```

### API Routes
```typescript
// src/pages/api/users.ts
import type { APIRoute } from 'astro'
import type { Users, UsersAPI } from '@myapp/types'
import { UsersSchema } from '@myapp/types'

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    // Use generated mock data for development
    if (import.meta.env.DEV) {
      const { createMockUsers } = await import('@myapp/types')
      const users = createMockUsers()
      
      return new Response(JSON.stringify({ 
        users,
        pagination: { page, limit, total: 100, totalPages: 10 }
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // In production, fetch from your API
    const response = await fetch(`${import.env.API_BASE_URL}/users?page=${page}&limit=${limit}`)
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const userData: UsersAPI.CreateBody = await request.json()
    
    // Validate with generated schema
    const validatedData = UsersSchema.pick({
      name: true,
      email: true,
      role: true
    }).parse(userData)
    
    // In production, save to database
    // const newUser = await saveUser(validatedData)
    
    // For now, return mock data
    const { createMockUsers } = await import('@myapp/types')
    const newUser = createMockUsers(validatedData)
    
    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid user data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

### Database Integration
```typescript
// src/lib/db/queries.ts
import type { Users } from '@myapp/types'
import { UsersSchema } from '@myapp/types'
import { usersTable } from '@myapp/db/generated/drizzle'
import { db } from './connection'

export async function getUsers(limit = 10, offset = 0): Promise<Users[]> {
  const users = await db.select()
    .from(usersTable)
    .limit(limit)
    .offset(offset)
  
  return UsersSchema.array().parse(users)
}

export async function createUser(userData: Users): Promise<Users> {
  const [newUser] = await db.insert(usersTable)
    .values(userData)
    .returning()
  
  return UsersSchema.parse(newUser)
}
```

## 🎨 Styling with Tailwind

```astro
---
// src/components/UserCard.astro
import type { Users } from '@myapp/types'

interface Props {
  user: Users
  showActions?: boolean
}

const { user, showActions = false } = Astro.props
---

<article class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <div class="flex items-center space-x-4">
    <div class="flex-shrink-0">
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name}
          class="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <span class="text-gray-600 font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
    
    <div class="flex-1 min-w-0">
      <h2 class="text-lg font-semibold text-gray-900 truncate">
        {user.name}
      </h2>
      <p class="text-sm text-gray-600 truncate">
        {user.email}
      </p>
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      user.role === 'admin' 
        ? 'bg-purple-100 text-purple-800'
        : user.role === 'moderator'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800'
    }`}>
      {user.role}
    </span>
    
    <span class="text-xs text-gray-500">
      {user.created_at.toLocaleDateString()}
    </span>
  </div>

  {user.bio && (
    <p class="mt-3 text-sm text-gray-600 line-clamp-2">
      {user.bio}
    </p>
  )}

  {showActions && (
    <div class="mt-4 flex space-x-2">
      <a 
        href={`/users/${user.id}`}
        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Profile
      </a>
      <a 
        href={`/admin/users/${user.id}/edit`}
        class="text-gray-600 hover:text-gray-800 text-sm font-medium"
      >
        Edit
      </a>
    </div>
  )}
</article>
```

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Netlify

```bash
# Build
pnpm build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Cloudflare Pages

```bash
# Build
pnpm build

# Deploy to Cloudflare
wrangler pages publish dist
```

---

This Astro template provides a modern, fast website with automatic type generation, static site generation, and full integration with the MyApp monorepo ecosystem.