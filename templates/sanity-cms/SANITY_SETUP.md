# Sanity Setup Guide

Detailed configuration guide for the Sanity CMS template.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Project Configuration](#project-configuration)
3. [Schema Customization](#schema-customization)
4. [Desk Structure](#desk-structure)
5. [Media Library](#media-library)
6. [Roles & Permissions](#roles--permissions)
7. [API Configuration](#api-configuration)
8. [Deployment](#deployment)

---

## Initial Setup

### Create a Sanity Project

```bash
# Install Sanity CLI globally
npm install -g sanity

# Login to Sanity
sanity login

# Create new project (or use existing)
sanity project create
# Follow the prompts:
# - Project name: MyApp CMS
# - Output path: ./my-studio
# - TypeScript: Yes
# - Package manager: pnpm
```

### Or Use Template

```bash
# Copy the template
cp -r templates/sanity-cms my-studio
cd my-studio

# Install dependencies
pnpm install

# Initialize with existing project
npx sanity init
```

### Configure Project ID

Edit `.env` or use environment variables:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

---

## Project Configuration

### sanity.config.ts

```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'MyApp CMS',
  
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  
  plugins: [
    structureTool(),
    visionTool(),
  ],
  
  schema: {
    types: schemaTypes,
  },
})
```

### Environment Variables

```env
# .env file
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Schema Customization

### Adding a New Schema

1. Create the schema file:

```typescript
// schemaTypes/product.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
```

2. Export from index:

```typescript
// schemaTypes/index.ts
export { default as product } from './product'
```

3. The schema is now available in your desk!

### Customizing Field Validation

```typescript
defineField({
  name: 'email',
  title: 'Email',
  type: 'string',
  validation: (Rule) =>
    Rule.required()
      .email()
      .custom((email, context) => {
        // Custom validation
        if (email && email.includes('test@example.com')) {
          return 'Test emails not allowed'
        }
        return true
      }),
})
```

---

## Desk Structure

### Default Structure

The default structure shows all document types:

```typescript
// structure/index.ts
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items(S.documentTypeListItems())
```

### Custom Structure with Groups

```typescript
import type { StructureResolver } from 'sanity/structure'
import { singletons } from './singletons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog Content')
            .items(S.documentTypeListItems().filter(item => 
              ['post', 'author', 'category'].includes(item.getId() || '')
            ))
        ),
      S.listItem()
        .title('Portfolio')
        .child(
          S.list()
            .title('Portfolio Content')
            .items(S.documentTypeListItems().filter(item =>
              ['project'].includes(item.getId() || '')
            ))
        ),
      S.divider(),
      ...singletons.map(typeName =>
        S.listItem()
          .title(typeName.charAt(0).toUpperCase() + typeName.slice(1))
          .child(S.documentList().filter(' _type == "' + typeName + '"'))
      ),
    ])
```

### Hiding Document Types

```typescript
// structure/singletons.ts
export const hiddenDocTypes = [
  'settings',
  // Add more to hide from main list
]

// In structure resolver, filter out hidden types
S.documentTypeListItems().filter(
  (item) => !hiddenDocTypes.includes(item.getId() || '')
)
```

---

## Media Library

### Image Asset Source

```typescript
// sanity.config.ts
import { media } from 'sanity-plugin-media'

export default defineConfig({
  // ... other config
  plugins: [
    media(), // Add media plugin
    // ... other plugins
  ],
})
```

### Custom Image Fields

```typescript
defineField({
  name: 'image',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true, // Enable focal point
    metadata: ['palette', 'lqip'], // Include metadata
  },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative Text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Caption',
    },
  ],
})
```

---

## Roles & Permissions

### Built-in Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access |
| Editor | Edit/publish all content |
| Author | Edit own content, publish |
| Contributor | Create drafts only |

### Custom Roles

Configure in Sanity dashboard:

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project
3. Go to API > Roles
4. Create new role with custom permissions

### Role-Based Field Access

```typescript
defineField({
  name: 'internalNotes',
  title: 'Internal Notes',
  type: 'text',
  hidden: ({ document, currentUser }) => {
    if (!currentUser) return true
    return currentUser.role !== 'admin'
  },
})
```

---

## API Configuration

### CORS Origins

Add your frontend URLs to allow API access:

```bash
# Via Sanity CLI
sanity cors add http://localhost:5173
sanity cors add http://localhost:3000

# Or in dashboard:
# Project > API > CORS Origins
```

### API Tokens

```bash
# Create read-only token for frontend
sanity token create --name "Frontend Read" --read

# Create write token for server
sanity token create --name "Server Write" --read --write
```

### GraphQL API

```bash
# Deploy GraphQL API
pnpm deploy-graphql

# Or via CLI
sanity graphql deploy
```

---

## Deployment

### Deploy Studio

```bash
# Deploy to Sanity's hosting
pnpm deploy

# Or deploy to a custom Vercel/Netlify project
pnpm build
# Deploy dist/ folder
```

### Deploy Content

```bash
# Use content studio for editing
pnpm dev

# Or use CLI for scripted deployments
sanity dataset import data.ndjson production
```

### Webhooks

Configure webhooks in dashboard:

1. Project > API > Webhooks
2. Create webhook:
   - URL: Your deploy hook or CMS update trigger
   - Trigger: On create/update/delete
   - Filter: _type in ["post", "project", "author"]

---

## Next Steps

- [INTEGRATION_WITH_TESTCTO.md](./INTEGRATION_WITH_TESTCTO.md) - Connect to frontend
- [SECURITY.md](./SECURITY.md) - Security best practices
- [Sanity Documentation](https://www.sanity.io/docs)

---

**Setup Time**: ~5-10 minutes
