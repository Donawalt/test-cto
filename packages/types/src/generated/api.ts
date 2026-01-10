// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

export namespace UsersAPI {
  export const ENDPOINT = '/userss'

  export interface CreateBody {
    email?: string
    name?: string
    password?: string
    role?: 'user' | 'admin' | 'moderator'
    avatar??: string
    bio??: string
    is_active?: boolean
  }

  export interface UpdateBody {
    id?: string
    email?: string
    name?: string
    password?: string
    role?: 'user' | 'admin' | 'moderator'
    avatar?: string
    bio?: string
    is_active?: boolean
    updated_at?: Date
  }

  export interface Response extends Users {}

}

export namespace PostsAPI {
  export const ENDPOINT = '/postss'

  export interface CreateBody {
    title?: string
    content?: string
    author_id?: string
    status?: 'draft' | 'published' | 'archived'
    published_at??: Date
  }

  export interface UpdateBody {
    id?: string
    title?: string
    content?: string
    author_id?: string
    status?: 'draft' | 'published' | 'archived'
    published_at?: Date
    updated_at?: Date
  }

  export interface Response extends Posts {}

}

export namespace CommentsAPI {
  export const ENDPOINT = '/commentss'

  export interface CreateBody {
    content?: string
    author_id?: string
    post_id?: string
    parent_id??: string
  }

  export interface UpdateBody {
    id?: string
    content?: string
    author_id?: string
    post_id?: string
    parent_id?: string
    updated_at?: Date
  }

  export interface Response extends Comments {}

}

