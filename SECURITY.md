# Security

Comprehensive security guidelines for the test-cto monorepo, covering all aspects of secure development, deployment, and operations.

> **See Also**: [TRANSPARENCY.md](./TRANSPARENCY.md) for transparency practices, [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment security, [GETTING_STARTED.md](./GETTING_STARTED.md) for development setup.

## Table of Contents

1. [Security Philosophy](#security-philosophy)
2. [Environment Variables & Secrets Management](#environment-variables--secrets-management)
3. [Database Security](#database-security)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Security](#api-security)
6. [Frontend Security](#frontend-security)
7. [Dependency Management](#dependency-management)
8. [Deployment Security](#deployment-security)
9. [Data Protection & Privacy](#data-protection--privacy-gdprccpa)

---

## Security Philosophy

### Core Principles

Our security approach is built on three foundational principles:

1. **Security by Default** - Every template and configuration ships with secure defaults
2. **Defense in Depth** - Multiple layers of security controls
3. **Zero Trust** - No implicit trust; verify everything

### Best Practices

```typescript
// ✅ CORRECT: Validate all inputs
function createUser(data: CreateUserRequest) {
  const validated = CreateUserSchema.parse(data); // Zod validation
  return db.insert(usersTable).values(validated);
}

// ❌ WRONG: Trust raw inputs
function createUser(data: CreateUserRequest) {
  return db.insert(usersTable).values(data); // No validation!
}
```

---

## Environment Variables & Secrets Management

### Never Commit Secrets

```bash
# ✅ CORRECT: .gitignore includes .env files
.env
.env.local
.env.*.local

# ❌ WRONG: Secrets in version control
DATABASE_URL=postgresql://user:password@host:5432/db  # NEVER!
JWT_SECRET=super-secret-key  # NEVER!
API_KEY=sk_live_xxxxx  # NEVER!
```

### Use Environment-Specific Files

```bash
# .env.example (SAFE - no secrets)
DATABASE_URL=postgresql://localhost:5432/myapp
JWT_SECRET=${JWT_SECRET}
API_KEY=${API_KEY}

# .env.development (local only, not committed)
DATABASE_URL=postgresql://localhost:5432/myapp_dev
JWT_SECRET=dev-secret-key
```

### Generate Strong Secrets

```bash
# Generate secure random secrets
openssl rand -base64 32  # For JWT secrets
openssl rand -hex 32     # For API keys
```

### Rotate Secrets Regularly

```bash
# Rotate JWT secret
# 1. Update JWT_SECRET in all environments
# 2. Invalidate all existing tokens
# 3. Log out all users or implement token migration
```

---

## Database Security

### Strong Passwords

```typescript
// ✅ CORRECT: Use strong password hashing
import { hashPassword } from '@myapp/server-utils/crypto';

async function createUser(email: string, password: string) {
  const { hash, salt } = await hashPassword(password, 12); // Cost factor 12+
  await db.insert(usersTable).values({ email, passwordHash: hash, passwordSalt: salt });
}

// ❌ WRONG: Store plain text passwords
await db.insert(usersTable).values({ email, password }); // NEVER!
```

### Principle of Least Privilege

```sql
-- ✅ CORRECT: Database user with minimal permissions
GRANT CONNECT ON DATABASE myapp TO myapp_user;
GRANT USAGE ON SCHEMA public TO myapp_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.users TO myapp_user;

-- ❌ WRONG: Full admin access
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp_user;  // Too permissive!
```

### SSL/TLS Connections

```typescript
// ✅ CORRECT: Enforce SSL connections
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',  // Enforce SSL
  connection: {
    sslmode: 'verify-full',  // Verify certificate
  },
});

// ❌ WRONG: Allow insecure connections
const client = postgres(process.env.DATABASE_URL!);  // No SSL!
```

### Database Access Logging

```typescript
// ✅ CORRECT: Log access patterns
import { logger } from '@myapp/server-utils/logger';

async function getUser(id: string) {
  logger.info('User access', { userId: id, action: 'read' });
  
  const [user] = await db.select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
    
  return user;
}
```

---

## Authentication & Authorization

### JWT Best Practices

```typescript
// ✅ CORRECT: Short-lived access tokens with refresh tokens
interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  iat: number;
  exp: number;
}

async function createTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  const accessToken = jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 15 * 60 }, // 15 minutes
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  );
  
  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET!,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// ❌ WRONG: Long-lived tokens without refresh
const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
```

### Password Security

```typescript
// ✅ CORRECT: Strong password validation
import { z } from 'zod';

export const PasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ❌ WRONG: Weak password requirements
export const WeakPasswordSchema = z.string().min(6);  // Too short!
```

### Rate Limiting

```typescript
// ✅ CORRECT: Rate limit authentication endpoints
import { rateLimit } from '@myapp/server-utils/rate-limit';

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again later.',
});

app.post('/api/auth/login', loginRateLimit, handleLogin);

// ❌ WRONG: No rate limiting
app.post('/api/auth/login', handleLogin);  // Vulnerable to brute force!
```

### Role-Based Access Control (RBAC)

```typescript
// ✅ CORRECT: RBAC middleware
type Role = 'user' | 'moderator' | 'admin';

interface AuthRequest extends Request {
  user?: TokenPayload;
}

function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);
```

---

## API Security

### CORS Configuration

```typescript
// ✅ CORRECT: Strict CORS configuration
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ❌ WRONG: Permissive CORS
app.use(cors());  // Allows any origin!
```

### Content Security Policy (CSP)

```typescript
// ✅ CORRECT: Strict CSP headers
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Only if needed
    styleSrc: ["'self'", "'unsafe-inline'"],  // Only if needed
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.yourdomain.com'],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}));
```

### Input Validation

```typescript
// ✅ CORRECT: Validate all inputs with Zod
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  password: z.string().min(12),
  role: z.enum(['user', 'admin']).default('user'),
});

function validateCreateUser(data: unknown) {
  return CreateUserSchema.parse(data);
}

// ❌ WRONG: Trust raw request body
function createUser(req, res) {
  await db.insert(usersTable).values(req.body);  // No validation!
}
```

### Request Size Limits

```typescript
// ✅ CORRECT: Limit request body size
import express from 'express';

app.use(express.json({ limit: '1mb' })); // 1MB max
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ❌ WRONG: No size limits
app.use(express.json());  // Vulnerable to DoS!
```

### Sensitive Data Handling

```typescript
// ✅ CORRECT: Never log sensitive data
import { logger } from '@myapp/server-utils/logger';

// ❌ WRONG: Logging sensitive information
logger.info('User login', { 
  email: 'user@example.com', 
  password: 'secret123',  // NEVER!
  ip: '192.168.1.1' 
});

// ✅ CORRECT: Sanitize logs
logger.info('User login attempt', {
  email: email.substring(0, 2) + '***@***.' + email.split('@')[1],
  ip: '192.168.1.1',
  userAgent: req.headers['user-agent'],
});
```

---

## Frontend Security

### Never Store Secrets in Client Code

```typescript
// ✅ CORRECT: Use public keys only
const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;

// ❌ WRONG: Expose secrets in frontend
const API_KEY = 'sk_live_xxxxx';  // NEVER!
const JWT_SECRET = 'super-secret';  // NEVER!
```

### HTTPS Enforcement

```typescript
// ✅ CORRECT: Redirect HTTP to HTTPS in production
import express from 'express';

if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use((req, res, next) => {
    if (req.secure) {
      return next();
    }
    res.redirect(`https://${req.hostname}${req.url}`);
  });
}
```

### XSS Prevention

```typescript
// ✅ CORRECT: Escape user input in React (automatic by default)
// React escapes by default

// ❌ WRONG: Dangerous innerHTML usage
function Component({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;  // Risky!
}

// ✅ CORRECT: Use DOMPurify for trusted HTML
import DOMPurify from 'dompurify';

function Component({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />;
}
```

### Secure API Communication

```typescript
// ✅ CORRECT: Send sensitive data in request body, not URL
// ❌ WRONG: Sensitive data in URL parameters
const response = await fetch(`/api/users?api_key=${API_KEY}`);  // Logged in server logs!

// ✅ CORRECT: Send in Authorization header
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

---

## Dependency Management

### Regular Updates

```bash
# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Update to latest major versions (breaking changes expected)
pnpm update --latest
```

### Security Audits

```bash
# Run security audit
pnpm audit

# Fix vulnerabilities automatically
pnpm audit fix

# View audit report
pnpm audit --json > audit-report.json
```

### Lock Files

```bash
# ✅ CORRECT: Always use lock files
pnpm install  # Uses pnpm-lock.yaml

# ❌ WRONG: Delete lock files
rm pnpm-lock.yaml  # Causes inconsistent versions!
```

### Monitor Supply Chain

```bash
# View dependency tree
pnpm why react

# Check for known vulnerabilities
pnpm npm audit --production

# Verify package integrity
pnpm dedup --verify
```

---

## Deployment Security

### Private Networks

```yaml
# ✅ CORRECT: VPC configuration (AWS)
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      SubnetId: !Ref PrivateSubnet
      SecurityGroupIds:
        - !Ref DatabaseSecurityGroup

# ❌ WRONG: Public exposure
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      SubnetId: !Ref PublicSubnet
```

### Firewall Rules

```bash
# ✅ CORRECT: Restrictive firewall
# Allow only HTTP/HTTPS from anywhere
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH from specific IP only
ufw allow from 203.0.113.0/24 to any port 22

# Deny everything else
ufw default deny incoming

# ❌ WRONG: Permissive firewall
ufw allow 22  # Allow SSH from anywhere!
ufw allow 3000  # Allow app port from anywhere!
```

### SSH Key Authentication

```bash
# ✅ CORRECT: Key-based authentication only
# In /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no

# ❌ WRONG: Password authentication
PasswordAuthentication yes  # Vulnerable to brute force!
PermitRootLogin yes  # Security risk!
```

### Regular Security Patches

```bash
# Automated security updates (Ubuntu)
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure automatic security updates
cat /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
  "${distro_id}:${distro_codename}-security";
};
```

---

## Data Protection & Privacy (GDPR/CCPA)

### Data Minimization

```typescript
// ✅ CORRECT: Only collect necessary data
interface UserRegistration {
  email: string;  // Required for authentication
  name: string;   // Required for display
  // No: phone, address, etc. unless explicitly needed
}

// ❌ WRONG: Collect excessive data
interface UserRegistration {
  email: string;
  name: string;
  phone: string;  // Not needed
  address: string;  // Not needed
  dateOfBirth: string;  // Not needed
  ssn: string;  // NEVER collect this unless required by law!
}
```

### User Consent

```typescript
// ✅ CORRECT: Explicit consent tracking
interface ConsentRecord {
  userId: string;
  consentType: 'marketing' | 'analytics' | 'third-party';
  granted: boolean;
  timestamp: Date;
  version: string;
}

async function updateMarketingConsent(userId: string, granted: boolean) {
  await db.insert(consentTable).values({
    userId,
    consentType: 'marketing',
    granted,
    timestamp: new Date(),
    version: '1.0',
  });
}
```

### Right to Access/Deletion

```typescript
// ✅ CORRECT: Data export endpoint
app.get('/api/user/data-export', authenticate, async (req, res) => {
  const userData = await getAllUserData(req.user!.id);
  res.json(userData);
});

// ✅ CORRECT: Account deletion endpoint
app.delete('/api/user/account', authenticate, async (req, res) => {
  await deleteUserData(req.user!.id);
  await db.delete(usersTable).where(eq(usersTable.id, req.user!.id));
  res.status(204).send();
});
```

### Data Retention

```typescript
// ✅ CORRECT: Automated data retention
import { cron } from '@myapp/server-utils/cron';

// Delete inactive user data after 2 years
cron.schedule('0 0 * * 0', async () => {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  await db.delete(sessionsTable)
    .where(lt(sessionsTable.createdAt, twoYearsAgo));
});
```

### Privacy Policy

```markdown
# Privacy Policy Requirements

Your privacy policy must include:
- What data you collect
- Why you collect it (legal basis)
- How you store it (encryption, location)
- How long you retain it
- Who you share it with (third parties)
- User rights (access, correction, deletion)
- How to exercise those rights
- Contact information for privacy concerns
```

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables set securely
- [ ] Secrets rotated for production
- [ ] SSL/TLS certificates configured
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Output sanitization on all responses
- [ ] Logging without sensitive data
- [ ] Database with least privilege access
- [ ] Dependencies audited and updated
- [ ] Security headers configured (Helmet)
- [ ] Authentication with short-lived tokens
- [ ] Authorization with RBAC
- [ ] Password hashing with cost factor 12+
- [ ] No secrets in code or logs
- [ ] HTTPS enforced in production

### Regular Maintenance

- [ ] Weekly dependency audits
- [ ] Monthly security updates
- [ ] Quarterly access reviews
- [ ] Annual penetration testing
- [ ] Incident response plan tested
- [ ] Backup and recovery tested

---

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** disclose publicly
2. **Do not** attempt to exploit further
3. **Email**: security@yourdomain.com
4. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested remediation (if any)

We will respond within 24 hours and keep you updated on the fix progress.

---

## Related Documentation

- [TRANSPARENCY.md](./TRANSPARENCY.md) - Transparency practices
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment security
- [COMMUNICATION.md](./COMMUNICATION.md) - API security patterns
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Development security
- [Package Documentation](./packages/) - Package-specific security
- [Template Documentation](./templates/) - Template-specific security
