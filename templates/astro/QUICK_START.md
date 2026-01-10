# Quick Start - astro Template

Get your Astro static site running in under 2 minutes.

## Prerequisites

- Node.js 18+
- pnpm 8+

## 🚀 2-Minute Setup

### Step 1: Copy the Template

```bash
# Using the helper script (recommended)
cd /path/to/test-cto
pnpm create-from-template astro ../my-site

# Or manually copy
cp -r templates/astro my-site
cd my-site
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Start Development

```bash
pnpm dev
```

Your site is now running at `http://localhost:4321` 🎉

## What's Included

```
astro/
├── src/
│   ├── components/       # Astro and React components
│   ├── layouts/         # Page layouts
│   ├── pages/           # File-based routing
│   │   ├── index.astro  # Homepage
│   │   └── blog/        # Blog posts
│   └── styles/          # CSS files
├── public/              # Static assets
├── astro.config.mjs
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Next Steps

1. **Read the full README** - `README.md` for comprehensive documentation
2. **Integration Checklist** - `INTEGRATION_CHECKLIST.md` for monorepo/standalone setup
3. **Security Guide** - `SECURITY.md` for security best practices

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm type-check` | Run TypeScript checks |

## Project Structure

Astro uses file-based routing. Create pages in `src/pages/`:

```
src/pages/
├── index.astro       # Homepage (/)
├── about.astro       # About page (/about)
└── blog/
    ├── index.astro  # Blog listing (/blog)
    └── [slug].astro # Dynamic blog post (/blog/post-slug)
```

## Frontmatter

Astro uses frontmatter for server-side logic:

```astro
---
// This runs at build time
const title = 'My Page Title'
const data = await fetch('https://api.example.com/data').then(r => r.json())
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </body>
</html>
```

## Troubleshooting

### Port already in use

```bash
# Kill process on port 4321
lsof -ti:4321 | xargs kill -9
```

### Build errors

```bash
# Clear cache and rebuild
rm -rf node_modules/.astro
pnpm build
```

## Getting Help

- See [README.md](./README.md) for full documentation
- Check [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) for integration options
- Review [SECURITY.md](./SECURITY.md) for security guidance

---

**Time to productive**: ~2 minutes
