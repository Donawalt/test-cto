# @myapp/server-utils

Server-only utilities for authentication, cryptography, error handling, validation, logging, and database operations.

## Installation

```bash
pnpm add @myapp/server-utils
```

## Modules

### Auth Module (`@myapp/server-utils/auth`)

```typescript
import {
  createAuthToken,
  verifyToken,
  createSession,
  generateApiKey,
  generateSecureToken,
  isSessionExpired,
} from '@myapp/server-utils/auth';

// Create auth token
const token = createAuthToken(
  { userId: '123', email: 'user@example.com' },
  86400 // 24 hours
);

// Verify token
const payload = verifyToken(token);
if (payload) {
  console.log('User ID:', payload.userId);
}

// Create session
const session = createSession('user-123', 3600);

// Generate API key
const apiKey = generateApiKey();

// Generate secure token
const resetToken = generateSecureToken(32);

// Check if session expired
if (isSessionExpired(session)) {
  // Session expired
}
```

### Crypto Module (`@myapp/server-utils/crypto`)

```typescript
import {
  hashPassword,
  verifyPassword,
  encrypt,
  decrypt,
  hashString,
  generateRandomString,
  generateUUID,
} from '@myapp/server-utils/crypto';

// Hash password
const { hash, salt } = await hashPassword('myPassword123');

// Verify password
const isValid = await verifyPassword('myPassword123', hash, salt);

// Encrypt data
const encrypted = encrypt('sensitive data', 'secret-key');

// Decrypt data
const decrypted = decrypt(encrypted, 'secret-key');

// Hash string (SHA-256)
const hashed = hashString('some-data');

// Generate random string
const random = generateRandomString(32);

// Generate UUID
const uuid = generateUUID();
```

### Error Module (`@myapp/server-utils/error`)

```typescript
import {
  createError,
  asyncHandler,
  errorFormatter,
  createValidationError,
  createAuthenticationError,
  createNotFoundError,
  ErrorCodes,
} from '@myapp/server-utils/error';

// Create custom error
throw createError('CUSTOM_ERROR', 'Something went wrong', 400);

// Async handler wrapper
const handler = asyncHandler(async (req, res) => {
  // Any error thrown here will be caught and formatted
  const data = await someAsyncOperation();
  res.json(data);
});

// Format error for response
const formatted = errorFormatter(error);
res.status(500).json(formatted);

// Specific error creators
throw createValidationError('Invalid email');
throw createAuthenticationError('Token expired');
throw createNotFoundError('User');
```

### Validation Module (`@myapp/server-utils/validation`)

```typescript
import {
  validateRequestBody,
  sanitizeInput,
  sanitizeHtml,
  isValidObjectId,
  isValidUUID,
  normalizeEmail,
  validateField,
} from '@myapp/server-utils/validation';
import { API } from '@myapp/types/api';

// Validate request body (throws if invalid)
const data = validateRequestBody(API.Validators.CreateUserSchema, req.body);

// Sanitize input
const clean = sanitizeInput(userInput);

// Sanitize HTML
const safeHtml = sanitizeHtml(htmlContent);

// Validate IDs
if (isValidObjectId(id)) { /* MongoDB ObjectId */ }
if (isValidUUID(id)) { /* UUID v4 */ }

// Normalize email
const email = normalizeEmail('User@Example.COM'); // "user@example.com"

// Field validation
const result = validateField(value, {
  required: true,
  minLength: 3,
  maxLength: 50,
  pattern: /^[a-z]+$/,
});
```

### Logging Module (`@myapp/server-utils/logging`)

```typescript
import {
  createLogger,
  logger,
  logError,
  logInfo,
  logDebug,
  logWarn,
} from '@myapp/server-utils/logging';

// Use default logger
logger.info('Application started');
logger.error('Error occurred', new Error('Oops'));
logger.debug('Debug info', { userId: '123' });
logger.warn('Warning message');

// Create namespaced logger
const dbLogger = createLogger('database');
dbLogger.info('Connection established');
dbLogger.error('Query failed', new Error('Syntax error'));

// Convenience functions
logInfo('User logged in', { userId: '123' });
logError(new Error('Failed'), { context: 'api' });
logDebug('Cache hit', { key: 'user:123' });
logWarn('Rate limit approaching');
```

### DB Module (`@myapp/server-utils/db`)

```typescript
import {
  paginate,
  buildWhereClause,
  buildOrderBy,
  buildSelectFields,
  calculateOffset,
  normalizeSearchTerm,
  buildSearchConditions,
  buildQueryOptions,
} from '@myapp/server-utils/db';

// Paginate in-memory array
const paginatedResult = paginate(items, { page: 1, limit: 20 });

// Build where clause (filters out null/undefined)
const where = buildWhereClause({
  status: 'active',
  deleted: undefined, // Will be filtered out
});

// Build order by
const orderBy = buildOrderBy('createdAt', 'desc');

// Build select fields
const select = buildSelectFields(['id', 'name', 'email']);

// Calculate offset
const offset = calculateOffset(2, 20); // page 2, 20 per page = 20

// Normalize search term
const term = normalizeSearchTerm('  Hello World!  '); // "hello world"

// Build search conditions for multiple fields
const conditions = buildSearchConditions('john', ['name', 'email']);

// Build complete query options
const options = buildQueryOptions({
  page: 1,
  limit: 20,
  sort: 'createdAt',
  order: 'desc',
  search: 'john',
  searchFields: ['name', 'email'],
  filters: { status: 'active' },
});
```

## Example: Complete CRUD Handler

```typescript
import { asyncHandler, createNotFoundError, errorFormatter } from '@myapp/server-utils/error';
import { validateRequestBody } from '@myapp/server-utils/validation';
import { logInfo, logError } from '@myapp/server-utils/logging';
import { buildQueryOptions } from '@myapp/server-utils/db';
import { API } from '@myapp/types/api';

// List users with pagination
app.get(API.Endpoints.USERS, asyncHandler(async (req, res) => {
  const options = buildQueryOptions({
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sort: req.query.sort,
    order: req.query.order,
  });
  
  const users = await db.select().from(users).limit(options.take).offset(options.skip);
  
  logInfo('Users fetched', { count: users.length });
  
  res.json({
    success: true,
    data: {
      data: users,
      pagination: { /* ... */ },
    },
  });
}));

// Create user
app.post(API.Endpoints.USERS, asyncHandler(async (req, res) => {
  const data = validateRequestBody(API.Validators.CreateUserSchema, req.body);
  
  const { hash, salt } = await hashPassword(data.password);
  
  const [user] = await db.insert(users).values({
    email: normalizeEmail(data.email),
    name: sanitizeInput(data.name),
    passwordHash: hash,
    passwordSalt: salt,
  }).returning();
  
  logInfo('User created', { userId: user.id });
  
  res.status(201).json({
    success: true,
    data: user,
  });
}));

// Update user
app.patch(`${API.Endpoints.USERS}/:id`, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidUUID(id)) {
    throw createValidationError('Invalid user ID');
  }
  
  const data = validateRequestBody(API.Validators.UpdateUserSchema, req.body);
  
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  
  if (!user) {
    throw createNotFoundError('User');
  }
  
  logInfo('User updated', { userId: id });
  
  res.json({
    success: true,
    data: user,
  });
}));

// Delete user
app.delete(`${API.Endpoints.USERS}/:id`, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();
  
  if (!deleted) {
    throw createNotFoundError('User');
  }
  
  logInfo('User deleted', { userId: id });
  
  res.json({
    success: true,
    data: null,
  });
}));

// Error handler middleware
app.use((err, req, res, next) => {
  logError(err, { path: req.path, method: req.method });
  
  const formatted = errorFormatter(err);
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json(formatted);
});
```

## Security Note

These utilities are **server-only** and should never be imported in client code. The build configuration will prevent accidental inclusion in browser bundles.

## TypeScript Support

All functions are fully typed with TypeScript strict mode.
