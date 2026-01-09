# @myapp/types

Type definitions, API contracts, and Zod schemas shared between client and server.

## Installation

```bash
pnpm add @myapp/types
```

## Usage

```typescript
// Import all types
import { User, Post, API } from '@myapp/types';

// Import from submodules
import { User, Post } from '@myapp/types/db';
import { API } from '@myapp/types/api';
import type { ButtonProps, CardProps } from '@myapp/types/ui';
```

## Modules

### DB Types (`@myapp/types/db`)

Database entity types and schemas.

```typescript
import { User, Post, Comment, UserSchema, PostSchema } from '@myapp/types/db';

// User type (inferred from Zod schema)
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Validate with Zod
const result = UserSchema.safeParse(data);
if (result.success) {
  const validUser: User = result.data;
}

// Pagination types
import type { PaginationParams, PaginatedResponse } from '@myapp/types/db';

const params: PaginationParams = { page: 1, limit: 20 };
const response: PaginatedResponse<User> = {
  data: [/* users */],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
  },
};
```

### API Types (`@myapp/types/api`)

API contracts with endpoints, validators, requests, and responses.

```typescript
import { API } from '@myapp/types/api';

// Endpoints
const url = API.Endpoints.USERS; // '/api/users'
const postsUrl = API.Endpoints.POSTS; // '/api/posts'

// Validators (Zod schemas)
const isValid = API.Validators.CreateUserSchema.safeParse({
  email: 'user@example.com',
  name: 'John',
  password: 'password123',
});

// Request types
const createUserData: API.Requests.CreateUser = {
  email: 'user@example.com',
  name: 'John',
  password: 'password123',
};

const updateUserData: API.Requests.UpdateUser = {
  name: 'Jane', // Email is optional
};

// Response types
const userResponse: API.Responses.UserResponse = {
  success: true,
  data: user,
};

const errorResponse: API.Responses.Error = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid email',
    details: { /* ... */ },
  },
};

// Generic Result type
type MyResponse = API.Responses.Result<MyData>;
```

### UI Types (`@myapp/types/ui`)

Component prop types.

```typescript
import type {
  ButtonProps,
  CardProps,
  InputProps,
  LayoutProps,
  ScrollTriggerProps,
} from '@myapp/types/ui';

// Use in component definitions
function MyButton(props: ButtonProps) {
  // ...
}

// Extend for custom components
interface MyCustomButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}
```

## API Contract Design

### Structure

```typescript
export namespace API {
  // Endpoint constants
  export namespace Endpoints {
    export const RESOURCE = '/api/resource' as const;
  }
  
  // Zod validation schemas
  export namespace Validators {
    export const CreateSchema = z.object({ /* ... */ });
    export const UpdateSchema = z.object({ /* ... */ });
  }
  
  // Request types (inferred from validators)
  export namespace Requests {
    export type Create = z.infer<typeof Validators.CreateSchema>;
    export type Update = z.infer<typeof Validators.UpdateSchema>;
  }
  
  // Response types
  export namespace Responses {
    export type ResourceResponse = Result<Resource>;
    export type ResourcesResponse = Result<PaginatedResponse<Resource>>;
  }
}
```

### Adding New Endpoints

1. **Define endpoint constant:**
```typescript
export namespace Endpoints {
  export const PRODUCTS = '/api/products' as const;
}
```

2. **Define validation schemas:**
```typescript
export namespace Validators {
  export const CreateProductSchema = z.object({
    name: z.string().min(1).max(200),
    price: z.number().positive(),
    description: z.string().optional(),
  });
  
  export const UpdateProductSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
  });
}
```

3. **Define request types:**
```typescript
export namespace Requests {
  export type CreateProduct = z.infer<typeof Validators.CreateProductSchema>;
  export type UpdateProduct = z.infer<typeof Validators.UpdateProductSchema>;
}
```

4. **Define response types:**
```typescript
export namespace Responses {
  export type ProductResponse = Result<Product>;
  export type ProductsResponse = Result<PaginatedResponse<Product>>;
}
```

### Type-Safe Communication Example

**Client:**
```typescript
import { API } from '@myapp/types/api';

async function createUser(formData: unknown) {
  // 1. Validate on client
  const result = API.Validators.CreateUserSchema.safeParse(formData);
  
  if (!result.success) {
    return { success: false, errors: result.error.errors };
  }
  
  // 2. Send typed request
  const response = await fetch(API.Endpoints.USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data),
  });
  
  // 3. Receive typed response
  const apiResponse: API.Responses.UserResponse = await response.json();
  
  // 4. Type-safe result handling
  if (apiResponse.success) {
    const user = apiResponse.data; // Type: User
    return { success: true, user };
  } else {
    const error = apiResponse.error; // Type: { code, message, details? }
    return { success: false, error };
  }
}
```

**Server:**
```typescript
import { validateRequestBody } from '@myapp/server-utils/validation';
import { API } from '@myapp/types/api';

app.post(API.Endpoints.USERS, async (req, res) => {
  try {
    // 1. Validate request (throws if invalid)
    const data = validateRequestBody(
      API.Validators.CreateUserSchema,
      req.body
    );
    
    // 2. Process (data is typed as API.Requests.CreateUser)
    const user = await createUserInDb(data);
    
    // 3. Return typed response
    const response: API.Responses.UserResponse = {
      success: true,
      data: user,
    };
    
    res.json(response);
  } catch (error) {
    // Error is formatted consistently
    res.status(500).json(errorFormatter(error));
  }
});
```

## Benefits

1. **Single Source of Truth** - All types defined once, used everywhere
2. **Compile-Time Safety** - TypeScript catches errors before runtime
3. **Runtime Validation** - Zod validates data at boundaries
4. **Auto-Complete** - Full IntelliSense support in IDE
5. **Refactoring Safety** - Change types once, errors show everywhere
6. **Documentation** - Types serve as living documentation

## Best Practices

1. **Always use Zod schemas** for data that crosses boundaries
2. **Infer types from schemas** using `z.infer<typeof Schema>`
3. **Use namespace organization** to keep related types together
4. **Add JSDoc comments** for complex types
5. **Keep types close to usage** but shared between client/server

## TypeScript Configuration

This package uses strict mode:
- `strict: true`
- `strictNullChecks: true`
- `noImplicitAny: true`

All consuming packages inherit these settings.
