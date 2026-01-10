# Security - sanity-cms Template

Security best practices for Sanity CMS deployments.

## Table of Contents

1. [API Token Security](#api-token-security)
2. [CORS Configuration](#cors-configuration)
3. [Role-Based Access Control](#role-based-access-control)
4. [Field-Level Security](#field-level-security)
5. [Webhook Security](#webhook-security)
6. [Data Privacy](#data-privacy)

---

## API Token Security

### Create Tokens with Minimal Permissions

```bash
# Read-only token for frontend
sanity token create \
  --name "Frontend Read Token" \
  --read

# Read token with specific dataset
sanity token create \
  --name "Limited Read Token" \
  --read \
  --dataset production
```

### Token Types

| Token Type | Permissions | Use Case |
|------------|-------------|----------|
| Read | Query data only | Frontend display |
| Write | Mutate data | Server-side editing |
| Read/Write | Full access | Admin tools |
| Automation | Custom scope | CI/CD pipelines |

### Environment Variables

```bash
# .env - Never commit!
SANITY_API_TOKEN=your-read-token

# Frontend - Only public token
VITE_SANITY_API_TOKEN=pk_read_xxxxx

# Backend - Can use write token
SANITY_API_TOKEN=sk_write_xxxxx
```

---

## CORS Configuration

### Restrict Allowed Origins

```bash
# Via CLI
sanity cors add http://localhost:5173
sanity cors add http://localhost:3000
sanity cors add https://yourdomain.com

# List current origins
sanity cors list

# Remove origin
sanity cors delete http://malicious.com
```

### Best Practices

```bash
# ✅ CORRECT: Specific origins only
sanity cors add https://yourdomain.com
sanity cors add https://staging.yourdomain.com

# ❌ WRONG: Allow all origins
# Never use --allow-all or * wildcard
```

### Dashboard Configuration

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project
3. Navigate to API > CORS Origins
4. Add allowed origins

---

## Role-Based Access Control

### Built-in Roles

| Role | Access |
|------|--------|
| Admin | Full project access |
| Editor | Create, edit, publish all |
| Author | Create, edit own, publish none |
| Contributor | Create, edit own drafts |

### Custom Roles

In Sanity dashboard:

1. API > Roles
2. Create new role
3. Assign permissions by document type

### Editor Role Configuration

```json
{
  "name": "Content Editor",
  "permissions": {
    "project": {
      "read": true,
      "listUsers": false
    },
    "dataset": {
      "read": true
    },
    "documents": {
      "post": ["read", "create", "update"],
      "author": ["read", "create", "update"],
      "category": ["read", "create", "update"],
      "project": ["read", "create", "update"],
      "settings": ["read"]
    }
  }
}
```

---

## Field-Level Security

### Hide Sensitive Fields

```typescript
// schemaTypes/author.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      // Only admins can see/edit email
      hidden: ({ currentUser }) => {
        if (!currentUser) return true
        return currentUser.role !== 'admin'
      },
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      // Hidden from non-editors
      hidden: ({ currentUser }) => {
        if (!currentUser) return true
        return !['admin', 'editor'].includes(currentUser.role)
      },
    }),
  ],
})
```

### Read-Only Fields

```typescript
defineField({
  name: 'createdAt',
  title: 'Created At',
  type: 'datetime',
  readOnly: true,
  hidden: true, // Hide from editors entirely
})
```

---

## Webhook Security

### Verify Webhook Signatures

```typescript
// api-server/src/middleware/sanity-webhook.ts
import crypto from 'crypto'

export function verifySanityWebhook(
  payload: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Usage in Express route
app.post('/webhooks/sanity', (req, res) => {
  const signature = req.headers['x-sanity-signature'] as string
  
  if (!verifySanityWebhook(JSON.stringify(req.body), signature, process.env.SANITY_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Process webhook...
})
```

### Webhook Best Practices

```typescript
// In Sanity dashboard:
// Project > API > Webhooks

{
  "url": "https://your-api.com/webhooks/sanity",
  "trigger": "onCreate,onUpdate,onDelete",
  "filter": "_type in ['post', 'project']",
  "headers": {
    "X-Webhook-Secret": "${SANITY_WEBHOOK_SECRET}"
  }
}
```

---

## Data Privacy

### GDPR Compliance

```typescript
// Track data consent
export const consentSchema = {
  marketing: false,
  analytics: false,
  thirdParty: false,
  timestamp: new Date(),
  version: '1.0',
}

// Export user data endpoint
app.get('/api/user/export', authenticate, async (req, res) => {
  // Query Sanity for all user data
  const data = await sanityClient.fetch(
    `*[_type == "author" && _id == $userId][0]`,
    { userId: req.user!.id }
  )
  
  res.json(data)
})

// Delete user data endpoint
app.delete('/api/user/delete', authenticate, async (req, res) => {
  const userId = req.user!.id
  
  // Delete all author documents
  await sanityClient.delete({
    query: `*[_type == "author" && _id == $userId]`,
    params: { userId }
  })
  
  res.status(204).send()
})
```

### Anonymize Data

```typescript
// Anonymize author data for GDPR requests
async function anonymizeAuthor(authorId: string) {
  await sanityClient.patch(authorId)
    .set({
      name: 'Deleted User',
      email: `deleted-${authorId}@example.com`,
      image: undefined,
      bio: undefined,
      social: undefined,
    })
    .commit()
}
```

---

## Pre-Deployment Checklist

- [ ] CORS origins restricted to production URLs
- [ ] API tokens created with minimal permissions
- [ ] Role-based access configured
- [ ] Sensitive fields hidden from non-admins
- [ ] Webhook signature verification implemented
- [ ] GDPR data export endpoint created
- [ ] Data anonymization process tested
- [ ] No secrets in client-side code

---

## Regular Security Audits

### Monthly

- [ ] Review API tokens and revoke unused
- [ ] Check CORS origins
- [ ] Review webhook logs
- [ ] Audit user permissions

### Quarterly

- [ ] Rotate API tokens
- [ ] Review field-level security
- [ ] Test webhook verification
- [ ] Update security documentation

---

## Related Documentation

- [Root SECURITY.md](../../SECURITY.md) - Comprehensive security guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SANITY_SETUP.md](./SANITY_SETUP.md) - Detailed configuration
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [Sanity Security Documentation](https://www.sanity.io/docs/security)
