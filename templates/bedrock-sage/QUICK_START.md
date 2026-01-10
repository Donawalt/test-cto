# Quick Start - bedrock-sage Template

Get your WordPress site with Bedrock + Sage running in under 5 minutes.

> **Note**: This template requires PHP 8.0+, Composer, and Node.js 18+

## Prerequisites

- PHP 8.0+
- Composer 2.0+
- Node.js 18+
- pnpm 8+

## 🚀 5-Minute Setup

### Step 1: Copy the Template

```bash
# Using the helper script (recommended)
cd /path/to/test-cto
pnpm create-from-template bedrock-sage ../my-wordpress

# Or manually copy
cp -r templates/bedrock-sage my-wordpress
cd my-wordpress
```

### Step 2: Install PHP Dependencies

```bash
composer install
```

### Step 3: Install Node Dependencies

```bash
npm install
# or
pnpm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database and security settings:

```env
DB_NAME=wordpress
DB_USER=wordpress
DB_PASSWORD=your-password
DB_HOST=localhost

# Generate salts: https://roots.io/salts.html
AUTH_KEY='generateme'
SECURE_AUTH_KEY='generateme'
LOGGED_IN_KEY='generateme'
NONCE_KEY='generateme'
AUTH_SALT='generateme'
SECURE_AUTH_SALT='generateme'
LOGGED_IN_SALT='generateme'
NONCE_SALT='generateme'
```

### Step 5: Start Development

```bash
# Start development server
npm run dev

# Or build for production
npm run build
```

## Directory Structure

```
bedrock-sage/
├── web/
│   ├── app/
│   │   ├── themes/           # Sage theme
│   │   ├── plugins/
│   │   ├── uploads/
│   │   └── mu-plugins/
│   ├── wp-config.php
│   └── index.php
├── config/
│   ├── application.php
│   └── environments/
├── vendor/                   # Composer dependencies
├── .env                      # Environment config
├── composer.json
├── package.json
└── README.md
```

## Next Steps

1. **BEDROCK_SETUP.md** - Comprehensive setup guide
2. **Read the full README** - `README.md` for comprehensive documentation
3. **Integration Checklist** - `INTEGRATION_CHECKLIST.md`
4. **Security Guide** - `SECURITY.md` for security best practices

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development with HMR |
| `npm run build` | Build for production |
| `composer install` | Install PHP dependencies |
| `wp` | WP-CLI commands |
| `npm run lint` | Lint assets |

## Troubleshooting

### PHP extensions missing

```bash
# Ubuntu/Debian
sudo apt install php8.1-{cli,curl,mbstring,xml,gd,mysql,zip}

# macOS with Homebrew
brew install php@8.1
```

### Composer memory limit

```bash
COMPOSER_MEMORY_LIMIT=-1 composer install
```

### Node version issues

```bash
# Use nvm to switch Node versions
nvm use 18
```

## Getting Help

- See [BEDROCK_SETUP.md](./BEDROCK_SETUP.md) for detailed setup
- Check [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)
- Review [SECURITY.md](./SECURITY.md) for security guidance

---

**Time to productive**: ~5 minutes
