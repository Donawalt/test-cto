// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

export interface Users {
  /** uuid */
  id: string
  /** string(255) */
  email: string
  /** string(100) */
  name: string
  /** string */
  password: string
  /** enum */
  role: 'user' | 'admin' | 'moderator'
  /** string */
  avatar?: string
  /** text */
  bio?: string
  /** boolean */
  is_active: boolean
  /** timestamp */
  created_at: Date
  /** timestamp */
  updated_at: Date
  /** relationship: hasMany */
  posts[]
  /** relationship: hasMany */
  comments[]
}

export interface Posts {
  /** uuid */
  id: string
  /** string(255) */
  title: string
  /** text */
  content: string
  /** uuid */
  author_id: string
  /** enum */
  status: 'draft' | 'published' | 'archived'
  /** timestamp */
  published_at?: Date
  /** timestamp */
  created_at: Date
  /** timestamp */
  updated_at: Date
  /** relationship: belongsTo */
  users
  /** relationship: hasMany */
  comments[]
}

export interface Comments {
  /** uuid */
  id: string
  /** text */
  content: string
  /** uuid */
  author_id: string
  /** uuid */
  post_id: string
  /** uuid */
  parent_id?: string
  /** timestamp */
  created_at: Date
  /** timestamp */
  updated_at: Date
  /** relationship: belongsTo */
  users
  /** relationship: belongsTo */
  posts
  /** relationship: belongsTo */
  comments
  /** relationship: hasMany */
  comments[]
}

