# Integration Checklist - bedrock-sage Template

Two ways to use this template: as a standalone WordPress site or integrated into the test-cto monorepo.

## Option A: Standalone WordPress

### 1. Initialize

```bash
cp -r templates/bedrock-sage my-wordpress
cd my-wordpress
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Configure database and salts.

### 5. Start Development

```bash
npm run dev
```

---

## Option B: Monorepo Integration

### 1. Copy to Packages

```bash
cp -r templates/bedrock-sage packages/wordpress
```

### 2. Configure as Separate Application

Bedrock operates as a separate application. The monorepo integration is primarily for:

- Shared TypeScript types
- Common utilities
- CI/CD pipeline integration

### 3. Install Dependencies

```bash
cd packages/wordpress
composer install
npm install
```

---

## Integration Checklist

### Prerequisites

- [ ] PHP 8.0+ installed
- [ ] Composer 2.0+ installed
- [ ] Node.js 18+ installed
- [ ] Database server running

### Standalone Setup

- [ ] Copy template files
- [ ] Install Composer dependencies
- [ ] Install Node dependencies
- [ ] Configure .env file
- [ ] Set up database
- [ ] Generate security salts
- [ ] Run `npm run dev`

### WordPress Configuration

- [ ] Configure WP_HOME in .env
- [ ] Set up multisite (if needed)
- [ ] Configure SMTP (if needed)
- [ ] Set up caching plugin
- [ ] Configure permalinks

### Sage Theme Setup

- [ ] Activate Sage theme in WordPress
- [ ] Configure ACF (if using)
- [ ] Set up custom post types
- [ ] Configure menus
- [ ] Set up widgets

---

## Common Integration Tasks

### Using @myapp/types in Sage

```php
// In Blade templates, pass data from PHP
// Generate TypeScript interfaces from PHP data

// web/app/themes/sage/resources/views/front-page.blade.php
@php
$hero_data = [
  'title' => get_field('hero_title'),
  'subtitle' => get_field('hero_subtitle'),
  'cta' => get_field('hero_cta'),
];
@endphp

<script>
window.HERO_DATA = @json($hero_data);
</script>
```

### Integrating with API Server

```php
// web/app/themes/sage/app/setup.php

add_action('wp_enqueue_scripts', function() {
  wp_localize_script('sage/app.js', 'WP_API', [
    'root' => esc_url_raw(rest_url()),
    'nonce' => wp_create_nonce('wp_rest'),
  ]);
});
```

### Database Connection

```env
# .env
DB_NAME=wordpress
DB_USER=wordpress
DB_PASSWORD=password
DB_HOST=localhost
DB_PREFIX=wp_

# Optional: External database
# DB_HOST=aws RDS endpoint
# DB_PORT=5432
```

---

## Security Checklist

- [ ] Strong salts in .env
- [ ] DISALLOW_FILE_EDIT enabled
- [ ] Salt keys rotated regularly
- [ ] File permissions configured
- [ ] SSL/TLS configured
- [ ] Backup strategy in place
- [ ] Security plugin installed
- [ ] Login protection enabled
- [ ] Two-factor authentication

---

## Next Steps

After integration, review:

1. **BEDROCK_SETUP.md** - Comprehensive setup guide
2. **SECURITY.md** - Security best practices
3. **README.md** - Full template documentation
4. WordPress documentation at [roots.io](https://roots.io/bedrock/docs/)

---

**See Also:**
- [BEDROCK_SETUP.md](./BEDROCK_SETUP.md) - Complete setup guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SECURITY.md](./SECURITY.md) - Security guidelines
- [Root README.md](../../README.md) - Monorepo overview
