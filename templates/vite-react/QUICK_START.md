# Quick Start - vite-react Template

Get your React application running in under 2 minutes.

## Prerequisites

- Node.js 18+
- pnpm 8+

## 🚀 5-Minute Setup

### Step 1: Copy the Template

```bash
# Using the helper script (recommended)
cd /path/to/test-cto
pnpm create-from-template vite-react ../my-app

# Or manually copy
cp -r templates/vite-react my-app
cd my-app
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Start Development

```bash
pnpm dev
```

Your app is now running at `http://localhost:5173` 🎉

## What's Included

```
vite-react/
├── src/
│   ├── components/       # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── pages/           # Page components
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json
├── vite.config.ts
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
| `pnpm lint` | Run ESLint |

## Troubleshooting

### Port already in use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
pnpm dev -- --port 3000
```

### TypeScript errors

```bash
# Clear cache and restart
rm -rf node_modules/.vite
pnpm dev
```

## Getting Help

- See [README.md](./README.md) for full documentation
- Check [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) for integration options
- Review [SECURITY.md](./SECURITY.md) for security guidance

---

**Time to productive**: ~2 minutes
