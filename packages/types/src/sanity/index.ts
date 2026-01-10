import { z } from 'zod'

export const sanityPostSchema = z.object({
  _id: z.string(),
  _type: z.literal('post'),
  _createdAt: z.string().datetime(),
  _updatedAt: z.string().datetime(),
  title: z.string().min(1).max(200),
  slug: z.object({
    _type: z.literal('slug'),
    current: z.string().regex(/^[a-z0-9-]+$/),
  }),
  author: z.object({
    _type: z.literal('reference'),
    _ref: z.string(),
  }).optional(),
  mainImage: z.object({
    _type: z.literal('image'),
    asset: z.object({
      _type: z.literal('reference'),
      _ref: z.string(),
    }),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }).optional(),
  categories: z.array(
    z.object({
      _type: z.literal('reference'),
      _ref: z.string(),
    })
  ).optional(),
  publishedAt: z.string().datetime().optional(),
  excerpt: z.string().max(500).optional(),
  body: z.array(z.unknown()).optional(),
})

export type SanityPost = z.infer<typeof sanityPostSchema>

export const sanityAuthorSchema = z.object({
  _id: z.string(),
  _type: z.literal('author'),
  _createdAt: z.string().datetime(),
  _updatedAt: z.string().datetime(),
  name: z.string().min(1).max(100),
  slug: z.object({
    _type: z.literal('slug'),
    current: z.string().regex(/^[a-z0-9-]+$/),
  }),
  image: z.object({
    _type: z.literal('image'),
    asset: z.object({
      _type: z.literal('reference'),
      _ref: z.string(),
    }),
    alt: z.string().optional(),
  }).optional(),
  bio: z.array(z.unknown()).optional(),
  email: z.string().email().optional(),
  social: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
})

export type SanityAuthor = z.infer<typeof sanityAuthorSchema>

export const sanityCategorySchema = z.object({
  _id: z.string(),
  _type: z.literal('category'),
  _createdAt: z.string().datetime(),
  _updatedAt: z.string().datetime(),
  title: z.string().min(1).max(50),
  slug: z.object({
    _type: z.literal('slug'),
    current: z.string().regex(/^[a-z0-9-]+$/),
  }),
  description: z.string().max(200).optional(),
})

export type SanityCategory = z.infer<typeof sanityCategorySchema>

export const sanityProjectSchema = z.object({
  _id: z.string(),
  _type: z.literal('project'),
  _createdAt: z.string().datetime(),
  _updatedAt: z.string().datetime(),
  title: z.string().min(1).max(100),
  slug: z.object({
    _type: z.literal('slug'),
    current: z.string().regex(/^[a-z0-9-]+$/),
  }),
  tagline: z.string().max(200).optional(),
  description: z.array(z.unknown()).optional(),
  mainImage: z.object({
    _type: z.literal('image'),
    asset: z.object({
      _type: z.literal('reference'),
      _ref: z.string(),
    }),
    alt: z.string().optional(),
  }).optional(),
  gallery: z.array(
    z.object({
      _type: z.literal('image'),
      asset: z.object({
        _type: z.literal('reference'),
        _ref: z.string(),
      }),
      alt: z.string().optional(),
    })
  ).optional(),
  technologies: z.array(z.string()).optional(),
  demoUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  featured: z.boolean().optional(),
})

export type SanityProject = z.infer<typeof sanityProjectSchema>

export const sanitySettingsSchema = z.object({
  _id: z.string(),
  _type: z.literal('settings'),
  _createdAt: z.string().datetime(),
  _updatedAt: z.string().datetime(),
  title: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  logo: z.object({
    _type: z.literal('image'),
    asset: z.object({
      _type: z.literal('reference'),
      _ref: z.string(),
    }),
  }).optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url(),
    })
  ).optional(),
  seo: z.object({
    ogImage: z.string().url().optional(),
    twitterHandle: z.string().optional(),
  }).optional(),
})

export type SanitySettings = z.infer<typeof sanitySettingsSchema>

export const sanityBlockContentSchema = z.array(
  z.object({
    _type: z.union([
      z.literal('block'),
      z.literal('image'),
      z.literal('code'),
      z.literal('embed'),
    ]),
    _key: z.string(),
    children: z.array(
      z.object({
        _type: z.literal('span'),
        _key: z.string(),
        text: z.string(),
        marks: z.array(z.string()).optional(),
        style: z.enum(['normal', 'h1', 'h2', 'h3', 'h4', 'blockquote']).optional(),
      })
    ).optional(),
    markDefs: z.array(
      z.object({
        _type: z.union([z.literal('link'), z.literal('internalLink')]),
        _key: z.string(),
        href: z.string().optional(),
      })
    ).optional(),
    style: z.enum(['normal', 'h1', 'h2', 'h3', 'h4', 'blockquote']).optional(),
  })
)

export type SanityBlockContent = z.infer<typeof sanityBlockContentSchema>

export const SanitySchemas = {
  post: sanityPostSchema,
  author: sanityAuthorSchema,
  category: sanityCategorySchema,
  project: sanityProjectSchema,
  settings: sanitySettingsSchema,
  blockContent: sanityBlockContentSchema,
} as const
