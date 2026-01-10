# Quick Start - api-server Template

Get your Express API server running in under 2 minutes.

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (or use SQLite for development)

## 🚀 2-Minute Setup

### Step 1: Copy the Template

```bash
# Using the helper script (recommended)
cd /path/to/test-cto
pnpm create-from-template api-server ../my-api

# Or manually copy
cp -r templates/api-server my-api
cd my-api
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL and secrets:

```env
DATABASE_URL=postgresql://localhost:5432/myapi
JWT_SECRET=your-secure-random-secret
NODE_ENV=development
PORT=3000
```

### Step 4: Start Development

```bash
pnpm dev
```

Your API is now running at `http://localhost:3000` 🎉

## What's Included

```
api-server/
├── src/
│   ├── routes/           # API route handlers
│   ├── controllers/      # Business logic
│   ├── middleware/       # Express middleware
│   ├── services/         # Service layer
│   ├── db/               # Database connection
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   ├── server.ts         # Express app
│   └── index.ts          # Entry point
├── tests/                # Test files
├── docker/               # Docker configuration
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/users | List users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

## Next Steps

1. **Read the full README** - `README.md` for comprehensive documentation
2. **Integration Checklist** - `INTEGRATION_CHECKLIST.md` for monorepo/standalone setup
3. **Security Guide** - `SECURITY.md` for security best practices

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run migrations |

## Troubleshooting

### Database connection failed

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Or use SQLite for development
echo "DATABASE_URL=file:./dev.db" > .env
```

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Type errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
pnpm dev
```

## Getting Help

- See [README.md](./README.md) for full documentation
- Check [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) for integration options
- Review [SECURITY.md](./SECURITY.md) for security guidance

---

**Time to productive**: ~2 minutes
