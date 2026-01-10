// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

export function createMockUsers(overrides?: Partial<Users>): Users {
  return {
    id: crypto.randomUUID(),
    email: 'mock-email',
    name: 'mock-name',
    password: 'mock-password',
    role: 'user',
    avatar: 'mock-avatar',
    bio: 'Mock bio content',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
    ...overrides,
  }
}

export function createMockPosts(overrides?: Partial<Posts>): Posts {
  return {
    id: crypto.randomUUID(),
    title: 'mock-title',
    content: 'Mock content content',
    author_id: crypto.randomUUID(),
    status: 'draft',
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
    ...overrides,
  }
}

export function createMockComments(overrides?: Partial<Comments>): Comments {
  return {
    id: crypto.randomUUID(),
    content: 'Mock content content',
    author_id: crypto.randomUUID(),
    post_id: crypto.randomUUID(),
    parent_id: crypto.randomUUID(),
    created_at: new Date(),
    updated_at: new Date()
    ...overrides,
  }
}

