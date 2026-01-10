# Client-Server Communication

This document describes patterns for type-safe communication between client and server in the MyApp monorepo.

> **See Also**: [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, [GETTING_STARTED.md](./GETTING_STARTED.md) for development setup, [@myapp/types README](./packages/types/README.md) for type definitions.

## 📑 Table of Contents

- [Core Principles](#core-principles)
- [API Contract Structure](#api-contract-structure)
- [Client-Side Patterns](#client-side-patterns)
- [Server-Side Patterns](#server-side-patterns)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Best Practices](#best-practices)
- [Advanced Patterns](#advanced-patterns)

## Core Principles

1. **Single Source of Truth**: All types, schemas, and endpoints defined in `@myapp/types`
2. **Validation at Boundaries**: Validate data entering and leaving both client and server
3. **Type Safety**: Full TypeScript support with strict mode
4. **Runtime Safety**: Zod schemas catch invalid data at runtime

## API Contract Structure

### Endpoint Constants

```typescript
// packages/types/src/api/index.ts
export namespace API {
  export namespace Endpoints {
    export const USERS = '/api/users' as const;
    export const POSTS = '/api/posts' as const;
    export const COMMENTS = '/api/comments' as const;
    export const AUTH = '/api/auth' as const;
  }
}
```

### Validation Schemas

```typescript
export namespace API {
  export namespace Validators {
    export const CreateUserSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
      password: z.string().min(8).max(100),
    });
    
    export const UpdateUserSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
    });
  }
}
```

### Request Types

```typescript
export namespace API {
  export namespace Requests {
    export type CreateUser = z.infer<typeof Validators.CreateUserSchema>;
    export type UpdateUser = z.infer<typeof Validators.UpdateUserSchema>;
  }
}
```

### Response Types

```typescript
export namespace API {
  export namespace Responses {
    export interface Success<T> {
      success: true;
      data: T;
    }
    
    export interface Error {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    }
    
    export type Result<T> = Success<T> | Error;
    
    export type UserResponse = Result<User>;
    export type UsersResponse = Result<PaginatedResponse<User>>;
  }
}
```

## Client-Side Patterns

### Basic Fetch Request

```typescript
import { API } from '@myapp/types/api';

async function fetchUsers(): Promise<User[]> {
  const response = await fetch(API.Endpoints.USERS);
  const result: API.Responses.UsersResponse = await response.json();
  
  if (result.success) {
    return result.data.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

### Create Resource

```typescript
async function createUser(data: API.Requests.CreateUser): Promise<User> {
  // Validate on client before sending
  const validated = API.Validators.CreateUserSchema.parse(data);
  
  const response = await fetch(API.Endpoints.USERS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validated),
  });
  
  const result: API.Responses.UserResponse = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

### Update Resource

```typescript
async function updateUser(
  id: string,
  data: API.Requests.UpdateUser
): Promise<User> {
  const validated = API.Validators.UpdateUserSchema.parse(data);
  
  const response = await fetch(`${API.Endpoints.USERS}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validated),
  });
  
  const result: API.Responses.UserResponse = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

### Delete Resource

```typescript
async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API.Endpoints.USERS}/${id}`, {
    method: 'DELETE',
  });
  
  const result: API.Responses.Result<void> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
}
```

### Pagination

```typescript
async function fetchPaginatedUsers(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  const response = await fetch(`${API.Endpoints.USERS}?${params}`);
  const result: API.Responses.UsersResponse = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

### Search and Filtering

```typescript
async function searchUsers(
  searchTerm: string,
  filters?: Record<string, string>
): Promise<User[]> {
  const params = new URLSearchParams({
    search: searchTerm,
    ...filters,
  });
  
  const response = await fetch(`${API.Endpoints.USERS}?${params}`);
  const result: API.Responses.UsersResponse = await response.json();
  
  if (result.success) {
    return result.data.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

## Server-Side Patterns

> **See Also**: [@myapp/server-utils README](./packages/server-utils/README.md) for validation and error handling utilities.

### Basic Route Handler

```typescript
import { validateRequestBody } from '@myapp/server-utils/validation';
import { errorFormatter } from '@myapp/server-utils/error';
import { API } from '@myapp/types/api';

app.get(API.Endpoints.USERS, async (req, res) => {
  try {
    const users = await db.select().from(users);
    
    const response: API.Responses.UsersResponse = {
      success: true,
      data: {
        data: users,
        pagination: {
          page: 1,
          limit: users.length,
          total: users.length,
          totalPages: 1,
        },
      },
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json(errorFormatter(error));
  }
});
```

### Create Handler with Validation

```typescript
app.post(API.Endpoints.USERS, async (req, res) => {
  try {
    // Validate request body
    const data = validateRequestBody(
      API.Validators.CreateUserSchema,
      req.body
    );
    
    // Hash password
    const { hash, salt } = await hashPassword(data.password);
    
    // Create user
    const [user] = await db.insert(users).values({
      email: data.email,
      name: data.name,
      passwordHash: hash,
      passwordSalt: salt,
    }).returning();
    
    const response: API.Responses.UserResponse = {
      success: true,
      data: user,
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (isAppError(error)) {
      res.status(error.statusCode).json(errorFormatter(error));
    } else {
      res.status(500).json(errorFormatter(error));
    }
  }
});
```

### Update Handler

```typescript
app.patch(`${API.Endpoints.USERS}/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = validateRequestBody(
      API.Validators.UpdateUserSchema,
      req.body
    );
    
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw createNotFoundError('User');
    }
    
    const response: API.Responses.UserResponse = {
      success: true,
      data: user,
    };
    
    res.json(response);
  } catch (error) {
    if (isAppError(error)) {
      res.status(error.statusCode).json(errorFormatter(error));
    } else {
      res.status(500).json(errorFormatter(error));
    }
  }
});
```

### Pagination Handler

```typescript
import { buildQueryOptions, paginate } from '@myapp/server-utils/db';

app.get(API.Endpoints.USERS, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const offset = (page - 1) * limit;
    
    const users = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset);
    
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const totalPages = Math.ceil(count / limit);
    
    const response: API.Responses.UsersResponse = {
      success: true,
      data: {
        data: users,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      },
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json(errorFormatter(error));
  }
});
```

## Error Handling

### Client-Side Error Handling

```typescript
async function createUserSafe(data: API.Requests.CreateUser) {
  try {
    const user = await createUser(data);
    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}
```

### Server-Side Error Handling

```typescript
import { asyncHandler, createValidationError } from '@myapp/server-utils/error';

const handleCreateUser = asyncHandler(async (req, res) => {
  const data = validateRequestBody(
    API.Validators.CreateUserSchema,
    req.body
  );
  
  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  
  if (existing.length > 0) {
    throw createConflictError('User with this email already exists');
  }
  
  // ... create user
});

app.post(API.Endpoints.USERS, handleCreateUser);
```

## Authentication

### Client-Side Authentication

```typescript
async function login(credentials: API.Requests.Login): Promise<string> {
  const validated = API.Validators.LoginSchema.parse(credentials);
  
  const response = await fetch(API.Endpoints.AUTH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validated),
  });
  
  const result: API.Responses.AuthResponse = await response.json();
  
  if (result.success) {
    // Store token
    localStorage.setItem('token', result.data.token);
    return result.data.token;
  } else {
    throw new Error(result.error.message);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}
```

### Server-Side Authentication

```typescript
import { verifyToken } from '@myapp/server-utils/auth';
import { createAuthenticationError } from '@myapp/server-utils/error';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      errorFormatter(createAuthenticationError())
    );
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json(
      errorFormatter(createAuthenticationError('Invalid token'))
    );
  }
  
  req.user = payload;
  next();
}

app.get(API.Endpoints.USERS, authMiddleware, handleGetUsers);
```

## Best Practices

1. **Always validate on both sides**
   - Client: Improve UX with instant feedback
   - Server: Security and data integrity

2. **Use type guards**
   ```typescript
   function isSuccessResponse<T>(
     response: API.Responses.Result<T>
   ): response is API.Responses.Success<T> {
     return response.success === true;
   }
   ```

3. **Centralize API calls**
   ```typescript
   // api/users.ts
   export const usersApi = {
     getAll: () => fetchUsers(),
     getById: (id: string) => fetchUser(id),
     create: (data: API.Requests.CreateUser) => createUser(data),
     update: (id: string, data: API.Requests.UpdateUser) => updateUser(id, data),
     delete: (id: string) => deleteUser(id),
   };
   ```

4. **Handle loading states**
   ```typescript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   
   async function handleSubmit() {
     setLoading(true);
     setError(null);
     
     try {
       await createUser(formData);
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   }
   ```

5. **Use React Query or similar for caching**
   ```typescript
   import { useAsync } from '@myapp/hooks/state';
   
   function UsersList() {
     const { data, loading, error } = useAsync(fetchUsers, true);
     
     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;
     
     return <div>{/* render users */}</div>;
   }
   ```

## Advanced Patterns

For more advanced patterns including file uploads, WebSockets, GraphQL integration, and real-time communication, see the package-specific documentation.

---

## 📚 Related Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Development setup and API integration examples
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and communication flow
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment and environment setup

### Package Documentation
- [@myapp/types](./packages/types/README.md) - Type definitions and API contracts (core to this guide)
- [@myapp/server-utils](./packages/server-utils/README.md) - Validation, error handling, and authentication utilities
- [@myapp/db](./packages/db/README.md) - Database queries and ORM usage
- [@myapp/hooks](./packages/hooks/README.md) - React hooks including useAsync

### Template Documentation
- [api-server](./templates/api-server/README.md) - Backend API implementation examples
- [vite-react](./templates/vite-react/README.md) - Client-side API integration
- [bedrock-sage](./templates/bedrock-sage/README.md) - Full-stack communication patterns
