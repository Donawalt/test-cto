# Integration with test-cto

Connect your Sanity CMS to test-cto frontend applications.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Integration](#frontend-integration)
3. [Using @myapp/types](#using-myapptypes)
4. [GROQ Queries](#groq-queries)
5. [Webhooks](#webhooks)
6. [Type-Safe Components](#type-safe-components)

---

## Overview

This guide explains how to integrate Sanity CMS with test-cto monorepo templates:

- **vite-react**: React SPA with TanStack Query
- **astro**: Static site with build-time data fetching
- **api-server**: Express backend for custom logic

---

## Frontend Integration

### Install Sanity Client

```bash
# In your frontend package
pnpm add @sanity/client @sanity/image-url
```

### Configure Client

```typescript
// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: import.meta.env.PROD,
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}
```

### Environment Variables

```bash
# .env
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

---

## Using @myapp/types

### Sanity Types in @myapp/types

The monorepo includes Sanity types for type-safe content:

```typescript
// packages/types/src/sanity/index.ts
import { z } from 'zod'

export const sanityPostSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.object({ current: z.string() }),
  publishedAt: z.string().datetime().optional(),
  excerpt: z.string().optional(),
  body: z.array(z.unknown()).optional(),
})

export type SanityPost = z.infer<typeof sanityPostSchema>
```

### Using in Frontend

```typescript
// src/components/BlogPost.tsx
import type { SanityPost } from '@myapp/types/sanity'
import { sanityPostSchema } from '@myapp/types/sanity'

async function fetchPost(slug: string): Promise<SanityPost> {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    body
  }`
  
  const data = await sanityClient.fetch(query, { slug })
  
  // Validate with Zod
  return sanityPostSchema.parse(data)
}
```

---

## GROQ Queries

### Basic Queries

```typescript
// src/lib/queries.ts
import { groq } from 'next-sanity'

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "author": author->{ name, image },
    "categories": categories[]->{ title, slug },
    mainImage
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    body,
    mainImage,
    "author": author->{
      name,
      image,
      bio,
      social
    },
    "categories": categories[]->{ title, slug }
  }
`

export const authorsQuery = groq`
  *[_type == "author"] | order(name asc) {
    _id,
    name,
    slug,
    image,
    bio
  }
`

export const projectsQuery = groq`
  *[_type == "project"] | order(featured desc, publishedAt desc) {
    _id,
    title,
    slug,
    tagline,
    mainImage,
    technologies,
    demoUrl,
    repoUrl,
    featured
  }
`
```

### Using Queries

```typescript
// src/lib/api.ts
import { sanityClient } from './sanity'
import { postsQuery, postBySlugQuery } from './queries'

export async function getPosts() {
  return sanityClient.fetch(postsQuery)
}

export async function getPostBySlug(slug: string) {
  return sanityClient.fetch(postBySlugQuery, { slug })
}
```

---

## Webhooks

### Configure Webhook

In Sanity dashboard, set up webhooks to trigger frontend rebuilds or ISR:

```json
{
  "url": "https://your-api.com/webhooks/sanity",
  "trigger": "onCreate,onUpdate,onDelete",
  "filter": "_type in ['post', 'project', 'author']"
}
```

### Handle Webhook

```typescript
// api-server/src/routes/webhooks.ts
import { Router } from 'express'

const router = Router()

router.post('/sanity', async (req, res) => {
  const signature = req.headers['x-sanity-signature']
  
  // Verify signature
  if (!verifySignature(signature, req.body)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  const { _type, _id } = req.body
  
  // Trigger revalidation
  if (_type === 'post') {
    await revalidatePost(_id)
  }
  
  res.status(200).json({ received: true })
})

export default router
```

---

## Type-Safe Components

### Blog Post Card

```typescript
// src/components/PostCard.tsx
import type { SanityPost } from '@myapp/types/sanity'
import { urlFor } from '../lib/sanity'

interface PostCardProps {
  post: SanityPost
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="card">
      {post.mainImage && (
        <img
          src={urlFor(post.mainImage).width(400).height(300).url()}
          alt={post.mainImage.alt || post.title}
        />
      )}
      <h2>{post.title}</h2>
      {post.excerpt && <p>{post.excerpt}</p>}
      <time>
        {new Date(post.publishedAt!).toLocaleDateString()}
      </time>
    </article>
  )
}
```

### Portable Text Component

```typescript
// src/components/PortableText.tsx
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { urlFor } from '../lib/sanity'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure>
        <img
          src={urlFor(value).width(800).url()}
          alt={value.alt || ''}
        />
      </figure>
    ),
    code: ({ value }) => (
      <pre>
        <code>{value.code}</code>
      </pre>
    ),
  },
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    blockquote: ({ children }) => (
      <blockquote>{children}</blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const target = (value.href || '').startsWith('http')
        ? '_blank'
        : undefined
      return (
        <a href={value.href} target={target}>
          {children}
        </a>
      )
    },
  },
}

interface PortableTextProps {
  content: any[]
}

export function RichText({ content }: PortableTextProps) {
  return <PortableText value={content} components={components} />
}
```

---

## Astro Integration

### Build-Time Fetching

```astro
---
// src/pages/blog/[slug].astro
import { sanityClient } from '../../lib/sanity'
import { postBySlugQuery } from '../../lib/queries'
import Layout from '../../layouts/Layout.astro'
import { RichText } from '../../components/PortableText'

export async function getStaticPaths() {
  const posts = await sanityClient.fetch(groq`
    *[_type == "post"]{ "slug": slug.current }
  `)
  
  return posts.map((post: any) => ({
    params: { slug: post.slug },
  }))
}

const { slug } = Astro.params
const post = await sanityClient.fetch(postBySlugQuery, { slug })
---

<Layout title={post.title}>
  <article>
    <h1>{post.title}</h1>
    <RichText content={post.body} />
  </article>
</Layout>
```

---

## Next Steps

- [QUICK_START.md](./QUICK_START.md) - Initial setup
- [SANITY_SETUP.md](./SANITY_SETUP.md) - Detailed configuration
- [SECURITY.md](./SECURITY.md) - Security best practices

---

**Integration Time**: ~15-30 minutes
