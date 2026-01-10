# Quick Start - sanity-cms Template

Get your Sanity Studio running in under 5 minutes.

## Prerequisites

- Node.js 18+
- Sanity CLI (`npm install -g sanity`)
- Sanity account (free at [sanity.io](https://sanity.io))

## 🚀 5-Minute Setup

### Step 1: Copy the Template

```bash
# Using the helper script (recommended)
cd /path/to/test-cto
pnpm create-from-template sanity-cms ../my-studio

# Or manually copy
cp -r templates/sanity-cms my-studio
cd my-studio
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Initialize Sanity

```bash
# Initialize a new Sanity project
npx sanity init

# Or use existing project ID
# Edit sanity.config.ts with your project ID
```

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your project ID:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

### Step 5: Start Development

```bash
pnpm dev
```

Your Sanity Studio is now running at `http://localhost:3333` 🎉

## What's Included

```
sanity-cms/
├── sanity.config.ts       # Sanity configuration
├── sanity.cli.ts          # CLI configuration
├── desk.tsx               # Custom desk structure
├── schemaTypes/
│   ├── index.ts           # Export all schemas
│   ├── post.ts            # Blog post schema
│   ├── author.ts          # Author schema
│   ├── category.ts        # Category schema
│   ├── project.ts         # Portfolio project schema
│   ├── settings.ts        # Site settings schema
│   └── blockContent.ts    # Rich text schema
├── structure/
│   ├── index.ts           # Desk structure
│   └── singletons.ts      # Singleton document types
├── utils/
│   ├── sanityClient.ts    # Sanity client utilities
│   └── index.ts           # Export utilities
├── plugins/               # Custom plugins
└── .env.example           # Environment template
```

## Available Content Types

| Schema | Description |
|--------|-------------|
| `post` | Blog posts with rich text |
| `author` | Author profiles with bio |
| `category` | Content categories |
| `project` | Portfolio projects |
| `settings` | Site-wide settings |

## Next Steps

1. **SANITY_SETUP.md** - Detailed configuration guide
2. **INTEGRATION_WITH_TESTCTO.md** - Connect to frontend
3. **INTEGRATION_CHECKLIST.md** - Integration options
4. **SECURITY.md** - Security best practices

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Sanity Studio |
| `pnpm build` | Build for deployment |
| `pnpm deploy` | Deploy to Sanity |
| `pnpm deploy-graphql` | Deploy GraphQL API |
| `sanity manage` | Open dashboard |

## Troubleshooting

### Project ID not found

```bash
# List your Sanity projects
sanity projects list

# Or create new project
sanity project create
```

### Dataset not found

```bash
# Create a new dataset
sanity dataset create production

# Or use an existing one
```

### Build errors

```bash
# Clear cache and rebuild
rm -rf node_modules/.sanity
pnpm build
```

## Getting Help

- See [SANITY_SETUP.md](./SANITY_SETUP.md) for detailed configuration
- Check [INTEGRATION_WITH_TESTCTO.md](./INTEGRATION_WITH_TESTCTO.md)
- Review [SECURITY.md](./SECURITY.md) for security guidance
- Visit [sanity.io/docs](https://www.sanity.io/docs)

---

**Time to productive**: ~5 minutes
