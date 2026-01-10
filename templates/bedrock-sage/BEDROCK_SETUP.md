# Bedrock + Sage Setup Guide

Complete guide to setting up Bedrock (modern WordPress) and Sage (modern theme) in your test-cto project.

> **Important**: This guide follows the official [Bedrock documentation](https://roots.io/bedrock/docs/) and [Sage documentation](https://roots.io/sage/docs/) exactly. Do not modify Bedrock core files - always follow official documentation for updates and modifications.

## Table of Contents

1. [What is Bedrock?](#what-is-bedrock)
2. [What is Sage?](#what-is-sage)
3. [Prerequisites](#prerequisites)
4. [Official Bedrock Installation](#official-bedrock-installation)
5. [Installing Sage Theme](#installing-sage-theme)
6. [Integrating with test-cto Monorepo](#integrating-with-test-cto-monorepo)
7. [Development Workflow](#development-workflow)
8. [Deployment](#deployment)
9. [Directory Structure](#directory-structure)
10. [Resources](#resources)
11. [Common Commands Reference](#common-commands-reference)
12. [Important Notes](#important-notes)
13. [Troubleshooting](#troubleshooting)
14. [Next Steps](#next-steps)

---

## What is Bedrock?

**Bedrock** is a modern WordPress stack that helps you get started with the best development tools and practices.

### Key Features

- **Better Directory Structure** - Separation of application, content, and configuration
- **Environment Variables** - Configure WordPress via `.env` file (like 12-factor apps)
- **Composer Dependencies** - WordPress core as a dependency, not a file upload
- **Better Security** - Environment-specific configurations
- **WP-CLI Integration** - Command-line WordPress management

### Official Resources

- [Bedrock Documentation](https://roots.io/bedrock/docs/)
- [Bedrock GitHub](https://github.com/roots/bedrock)
- [Bedrock Sage Starter Theme](https://github.com/roots/sage)

---

## What is Sage?

**Sage** is a WordPress starter theme with a modern development workflow.

### Key Features

- **Modern Build Tools** - Webpack, Babel, PostCSS
- **Blade Templates** - Laravel-style templating
- **Asset Management** - Compiled, minified, versioned assets
- **Bootstrap Integration** - Optional Tailwind or Bootstrap
- **Theme Customizer API** - Live preview support
- **ACF Integration** - Advanced Custom Fields ready

### Official Resources

- [Sage Documentation](https://roots.io/sage/docs/)
- [Sage GitHub](https://github.com/roots/sage)
- [Blade for WordPress](https://blade.roots.io/)

---

## Prerequisites

### System Requirements

| Tool | Minimum Version | Recommended Version |
|------|-----------------|---------------------|
| PHP | 8.0+ | 8.2+ |
| Composer | 2.0+ | 2.5+ |
| Node.js | 18.0+ | 20.x |
| pnpm | 8.0+ | 8.x |
| MySQL/MariaDB | 5.7+ / 10.2+ | 8.0 |
| Git | 2.0+ | Latest |

### Verify Your Environment

```bash
# Check PHP version
php -v

# Check Composer
composer --version

# Check Node.js
node -v

# Check pnpm
pnpm --version

# Check MySQL
mysql --version
```

### Install Missing Tools

**Ubuntu/Debian:**
```bash
# PHP 8.2
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# pnpm
npm install -g pnpm
```

**macOS with Homebrew:**
```bash
# PHP
brew install php@8.2

# Composer
brew install composer

# Node.js
brew install node@20

# pnpm
npm install -g pnpm
```

---

## Official Bedrock Installation

### Method 1: Fresh Installation (Recommended)

```bash
# Create new Bedrock project
composer create-project roots/bedrock my-wordpress-app

# Navigate to project
cd my-wordpress-app
```

### Method 2: Using test-cto Template

```bash
# Copy the template
cp -r templates/bedrock-sage my-wordpress-app
cd my-wordpress-app

# Install dependencies
composer install
npm install
# or
pnpm install
```

### Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_NAME=wordpress
DB_USER=wordpress
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PREFIX=wp_

# Security Keys (generate at https://roots.io/salts.html)
AUTH_KEY='generateme'
SECURE_AUTH_KEY='generateme'
LOGGED_IN_KEY='generateme'
NONCE_KEY='generateme'
AUTH_SALT='generateme'
SECURE_AUTH_SALT='generateme'
LOGGED_IN_SALT='generateme'
NONCE_SALT='generateme'

# Site URL
WP_HOME='http://localhost'
WP_SITEURL='${WP_HOME}/wp'

# Environment
WP_ENV=development

# Optional: Mail configuration
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user@example.com
# SMTP_PASS=password

# Optional: Redis caching
# WP_REDIS_HOST=127.0.0.1
# WP_REDIS_PORT=6379
```

### Generate Security Salts

Visit https://roots.io/salts.html and copy the generated keys to your `.env` file.

### Set Up Database

```bash
# Create database (using MySQL command line)
mysql -u root -p

CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Install WordPress

```bash
# Access via browser
# Navigate to http://localhost

# Or use WP-CLI
wp core install --url=http://localhost --title="My Site" --admin_user=admin --admin_password=secure_password --admin_email=admin@example.com
```

---

## Installing Sage Theme

### Method 1: Composer (Recommended)

```bash
# Navigate to Bedrock themes directory
cd web/app/themes

# Create Sage project
composer create-project roots/sage my-theme

# Or use the test-cto template
cp -r ../../../templates/bedrock-sage/web/app/themes/sage my-theme
```

### Method 2: From test-cto Template

The test-cto template includes a pre-configured Sage theme:

```bash
# After copying the template
cd my-wordpress-app/web/app/themes/sage

# Install theme dependencies
npm install
# or
pnpm install
```

### Activate Theme

```bash
# Using WP-CLI
wp theme activate sage

# Or via WordPress admin
# Appearance > Themes > Activate Sage
```

### Configure Sage

Edit `composer.json` in the theme directory:

```json
{
  "name": "roots/sage",
  "type": "wordpress-theme",
  "description": "WordPress starter theme with Laravel Blade",
  "keywords": ["wordpress", "theme"],
  "license": "MIT",
  "require": {
    "php": ">=8.0",
    "roots/acorn": "^3.0"
  },
  "autoload": {
    "psr-4": {
      "App\\": "app/"
    }
  }
}
```

---

## Integrating with test-cto Monorepo

### Project Structure

```
my-wordpress-app/
├── web/
│   ├── app/
│   │   ├── themes/
│   │   │   └── sage/           # Sage theme
│   │   ├── plugins/
│   │   ├── mu-plugins/
│   │   └── uploads/
│   ├── wp-config.php
│   └── index.php
├── config/
│   ├── application.php
│   └── environments/
│       ├── development.php
│       ├── staging.php
│       └── production.php
├── vendor/                     # Composer dependencies
├── .env                        # Environment config
├── composer.json
├── package.json
└── pnpm-workspace.yaml         # If using monorepo
```

### Using @myapp/types for REST API

```php
// web/app/themes/sage/app/setup.php

// Enqueue scripts with type-safe data
add_action('wp_enqueue_scripts', function() {
  wp_localize_script('sage/app.js', 'WP_API', [
    'root' => esc_url_raw(rest_url()),
    'nonce' => wp_create_nonce('wp_rest'),
    'siteUrl' => home_url(),
  ]);
});
```

### Connecting to API Server

```php
// web/app/themes/sage/app/helpers.php

function fetch_api_data($endpoint, $args = []) {
  $api_url = defined('API_SERVER_URL') ? API_SERVER_URL : 'http://localhost:3000/api';
  
  $response = wp_remote_get(
    $api_url . $endpoint,
    array_merge([
      'headers' => [
        'Content-Type' => 'application/json',
      ],
    ], $args)
  );
  
  if (is_wp_error($response)) {
    return null;
  }
  
  return json_decode(wp_remote_retrieve_body($response), true);
}
```

### Frontend Integration

```typescript
// In vite-react or astro template
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function fetchFromWordPress(endpoint: string) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}
```

---

## Development Workflow

### Starting Development Server

```bash
# Start WordPress development server
npm run dev

# Or for Sage theme with hot reload
cd web/app/themes/sage
npm run start
```

### Build for Development

```bash
# Watch for changes
npm run dev

# Build assets
npm run build
```

### Build for Production

```bash
# Production build with optimization
npm run build

# Or from root
npm run build:production
```

### Using WP-CLI

```bash
# Generate a post
wp post create --post_type=page --post_title='About' --post_status=publish

# Import content
wp import data.xml --authors=skip

# Database operations
wp db export
wp db import backup.sql

# Update WordPress core
wp core update

# Update all plugins
wp plugin update --all
```

---

## Deployment

### Best Practices (Roots.io)

1. **Use Environment Variables**
   - Never commit `.env` to version control
   - Use environment-specific configurations

2. **Deploy with Composer**
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

3. **File Permissions**
   ```bash
   find web/app/themes/sage -type f -exec chmod 644 {} \;
   find web/app/themes/sage -type d -exec chmod 755 {} \;
   chmod 640 web/wp-config.php
   ```

### Deployment Platforms

#### Fly.io (Recommended for WordPress)

```bash
# Install Fly.io CLI
curl -L https://fly.io/install.sh | sh

# Initialize
fly launch

# Set secrets
fly secrets set DB_HOST=hostname DB_NAME=dbname DB_USER=user DB_PASS=password

# Deploy
fly deploy
```

#### DigitalOcean App Platform

```yaml
# app.yaml
name: wordpress
services:
  - name: web
    github:
      repo: your-repo/wordpress
      branch: main
    build_command: composer install --no-dev && npm run build
    run_command: vendor/bin/wp server --host=0.0.0.0 --port=8080
    env_vars:
      - key: DB_HOST
        fromDatabase:
          name: wordpress
          property: host
      - key: WP_ENV
        value: production
```

#### Traditional Server (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/my-wordpress-app/web;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 365d;
    }
}
```

### Deployment Checklist

- [ ] WordPress core updated
- [ ] All plugins updated
- [ ] Theme updated
- [ ] Composer install --no-dev
- [ ] Assets built for production
- [ ] Database backed up
- [ ] Environment variables set
- [ ] SSL certificate configured
- [ ] Caching enabled
- [ ] Security headers added

---

## Directory Structure

### Bedrock Output

```
bedrock/
├── web/
│   ├── app/
│   │   ├── mu-plugins/     # Must-use plugins
│   │   ├── plugins/        # Regular plugins
│   │   ├── themes/         # Themes
│   │   │   └── sage/       # Sage theme
│   │   └── uploads/        # Media uploads
│   ├── wp-config.php       # WordPress configuration
│   ├── index.php           # Entry point
│   └── .htaccess          # Apache config
├── config/
│   ├── application.php     # Main config
│   ├── environments/       # Environment-specific
│   │   ├── development.php
│   │   ├── staging.php
│   │   └── production.php
│   └── phpunit.xml
├── vendor/                 # Composer dependencies
├── .env                    # Environment variables
├── composer.json          # Composer config
└── LICENSE
```

### Sage Theme Structure

```
sage/
├── app/
│   ├── setup.php          # Theme setup
│   ├── helpers.php        # Helper functions
│   └── filters.php        # WordPress filters
├── resources/
│   ├── views/            # Blade templates
│   │   ├── layouts/
│   │   │   └── app.blade.php
│   │   ├── partials/
│   │   └── index.blade.php
│   ├── assets/           # Source assets
│   │   ├── sass/
│   │   ├── js/
│   │   └── images/
│   └── functions.php     # Legacy functions
├── dist/                  # Compiled assets
├── vendor/                # Composer dependencies
├── composer.json
├── package.json
└── webpack.config.js
```

---

## Resources

### Official Documentation

| Resource | URL |
|----------|-----|
| Bedrock Docs | https://roots.io/bedrock/docs/ |
| Sage Docs | https://roots.io/sage/docs/ |
| WP-CLI | https://wp-cli.org/ |
| Composer | https://getcomposer.org/doc/ |
| Sage on GitHub | https://github.com/roots/sage |

### Getting Help

| Channel | URL |
|---------|-----|
| Roots Discourse | https://discourse.roots.io/ |
| Roots Discord | https://discord.gg/roots |
| WordPress Support | https://wordpress.org/support/ |

### Related test-cto Documentation

- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [SECURITY.md](./SECURITY.md) - Security best practices
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

---

## Common Commands Reference

### Composer Commands

| Command | Description |
|---------|-------------|
| `composer install` | Install dependencies |
| `composer update` | Update dependencies |
| `composer require package/name` | Add package |
| `composer remove package/name` | Remove package |
| `composer dump-autoload` | Regenerate autoloader |
| `composer install --no-dev` | Production install |

### NPM/PNPM Commands

| Command | Description |
|---------|-------------|
| `npm install` / `pnpm install` | Install dependencies |
| `npm run dev` / `pnpm dev` | Development build |
| `npm run build` / `pnpm build` | Production build |
| `npm run start` / `pnpm start` | Hot reload dev server |

### WP-CLI Commands

| Command | Description |
|---------|-------------|
| `wp core version` | Check WordPress version |
| `wp core update` | Update WordPress |
| `wp plugin list` | List plugins |
| `wp theme list` | List themes |
| `wp db export` | Export database |
| `wp db import` | Import database |
| `wp search-replace` | Replace URLs in database |

### Sage Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Start development with HMR |
| `npm run build` | Build for production |
| `npm run lint` | Lint assets |
| `npm run lint:fix` | Fix linting issues |

---

## Important Notes

### Do NOT Modify Bedrock Core

- Bedrock is managed by Composer
- Never edit files in `vendor/roots/bedrock/`
- Always use hooks and filters for customization
- Update via `composer update`

### Do NOT Modify Sage Core

- Sage is managed by Composer
- Never edit files in `vendor/roots/sage/`
- Customize in `app/` directory
- Update via `composer update`

### Plugin Management

- Install plugins via Composer when possible
- Use `composer require wpackagist-plugin/plugin-name`
- For premium plugins, install manually to `web/app/plugins/`

### Theme Development

- Use Blade templates in `resources/views/`
- Use `app/` for PHP code
- Use `resources/assets/` for source assets
- Build to `dist/` for production

### Database Management

- Always use WP-CLI for database operations
- Use `wp search-replace` when moving environments
- Never commit database dumps to version control

---

## Troubleshooting

### PHP Extensions Missing

```bash
# Check missing extensions
php -m

# Install common extensions (Ubuntu)
sudo apt install php8.2-{cli,fpm,mysql,xml,mbstring,curl,zip,gd,redis}
```

### Composer Memory Limit

```bash
# Increase memory limit
COMPOSER_MEMORY_LIMIT=-1 composer install
```

### Node Version Issues

```bash
# Use nvm
nvm use 18

# Check Node version
node -v
```

### Database Connection Failed

```bash
# Test database connection
wp db check

# Verify credentials in .env
cat .env | grep DB_

# Test MySQL connection
mysql -h localhost -u wordpress -p
```

### Permalinks Not Working

```bash
# Flush rewrite rules
wp rewrite flush

# Check .htaccess
cat web/.htaccess

# Enable mod_rewrite (Apache)
sudo a2enmod rewrite
```

### Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules

# Reinstall
npm install

# Check for errors
npm run build
```

---

## Next Steps

After setting up Bedrock + Sage:

1. **Customize Theme**
   - Modify `resources/views/` with your design
   - Update `app/setup.php` for theme support
   - Add custom functionality in `app/`

2. **Add Content Types**
   - Use ACF for custom fields
   - Create custom post types in `app/`
   - Register taxonomies

3. **Set Up Deployment**
   - Choose deployment platform
   - Configure environment variables
   - Set up CI/CD pipeline

4. **Security Hardening**
   - Enable SSL/TLS
   - Configure security headers
   - Set up regular backups
   - Review [SECURITY.md](./SECURITY.md)

5. **Performance Optimization**
   - Enable caching
   - Optimize images
   - Minify assets
   - Use CDN

---

## Summary

This guide has walked you through:

- ✅ Installing Bedrock using official methods
- ✅ Installing Sage theme
- ✅ Configuring environment variables
- ✅ Setting up the development workflow
- ✅ Integrating with test-cto monorepo
- ✅ Deploying to production

For any issues not covered here, refer to the official documentation or ask in the Roots community.
