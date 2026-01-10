# Quick Start - library Template

Get your NPM package ready for publishing in under 2 minutes.

## Prerequisites

- Node.js 18+
- pnpm 8+
- NPM account (for publishing)

## 🚀 2-Minute Setup

### Step 1: Copy the Template

```bash
# Using the helper script (recommended)
cd /path/to/test-cto
pnpm create-from-template library ../my-lib

# Or manually copy
cp -r templates/library my-lib
cd my-lib
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Build and Test

```bash
pnpm build
pnpm test
```

### Step 4: Publish

```bash
pnpm publish
```

Your package is now on npm! 🎉

## What's Included

```
library/
├── src/
│   ├── index.ts         # Main entry point
│   ├── lib/             # Core functionality
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript types
├── tests/               # Test files
├── docs/                # Documentation
├── package.json
├── tsconfig.json
├── tsup.config.ts       # Build configuration
└── README.md
```

## Next Steps

1. **Read the full README** - `README.md` for comprehensive documentation
2. **Integration Checklist** - `INTEGRATION_CHECKLIST.md` for monorepo/standalone setup
3. **Security Guide** - `SECURITY.md` for security best practices

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build for production |
| `pnpm dev` | Build in watch mode |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | TypeScript checks |
| `pnpm publish` | Publish to npm |

## First Release

```bash
# Initial release
pnpm publish

# Or for scoped packages
pnpm publish --access public
```

## Troubleshooting

### Build errors

```bash
# Check TypeScript errors
pnpm type-check

# Clear build cache
rm -rf dist
pnpm build
```

### Publishing issues

```bash
# Check npm login
npm whoami

# If not logged in
npm login

# Retry publish
pnpm publish
```

## Getting Help

- See [README.md](./README.md) for full documentation
- Check [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) for integration options
- Review [SECURITY.md](./SECURITY.md) for security guidance

---

**Time to productive**: ~2 minutes
