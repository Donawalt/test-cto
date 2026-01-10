# Security - bedrock-sage Template

Security best practices for WordPress with Bedrock and Sage.

## Table of Contents

1. [Bedrock Security Features](#bedrock-security-features)
2. [Sage Theme Security](#sage-theme-security)
3. [WordPress Hardening](#wordpress-hardening)
4. [Plugin Security](#plugin-security)
5. [Deployment Security](#deployment-security)

---

## Bedrock Security Features

### Environment-Based Configuration

Bedrock uses `.env` for configuration, keeping secrets out of version control:

```env
# .env - Never commit this file!
DB_NAME=wordpress
DB_USER=wordpress
DB_PASSWORD=secure-password
DB_HOST=localhost

# Security: Disable file editing in admin
DISALLOW_FILE_EDIT=true
```

### Composer Dependencies

```bash
# Only install from trusted sources
composer require roots/bedrock-autoloader

# Verify packages
composer require --verify roots/bedrock
```

---

## Sage Theme Security

### Asset Security

```php
// resources/functions.php

// Enqueue scripts with version/hash for cache busting
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_style(
    'sage/main.css',
    asset_path('styles/main.css'),
    [],
    filemtime(get_template_directory() . '/dist/styles/main.css')
  );
});
```

### Input Sanitization

```php
// resources/lib/setup.php

// Sanitize all theme customizer inputs
add_action('customize_sanitize_callback', function($value, $setting) {
  return sanitize_text_field($value);
}, 10, 2);

// Escape output
add_action('esc_html', function($safe_text, $text) {
  return $text;
}, 10, 2);
```

### Nonce Verification

```php
// resources/lib/ajax.php

// Verify nonce for all AJAX requests
add_action('admin_post_nopriv_contact_form', function() {
  if (!wp_verify_nonce($_POST['nonce'], 'contact_form_nonce')) {
    wp_send_json_error(['message' => 'Invalid nonce']);
  }
  
  $name = sanitize_text_field($_POST['name'] ?? '');
  $email = sanitize_email($_POST['email'] ?? '');
  $message = sanitize_textarea_field($_POST['message'] ?? '');
  
  // Process form...
});
```

---

## WordPress Hardening

### Disable XML-RPC

```php
// config/application.php

// Disable XML-RPC
add_filter('xmlrpc_enabled', '__return_false');

// Remove X-Pingback header
add_filter('wp_headers', function($headers) {
  unset($headers['X-Pingback']);
  return $headers;
});
```

### Hide WordPress Version

```php
// Remove version from head
remove_action('wp_head', 'wp_generator');

// Remove version from CSS/JS
add_filter('style_loader_src', function($src) {
  if ($ver = get_option('wp_version')) {
    $src = remove_query_arg('ver', $src);
  }
  return $src;
}, 15, 1);

add_filter('script_loader_src', function($src) {
  if ($ver = get_option('wp_version')) {
    $src = remove_query_arg('ver', $src);
  }
  return $src;
}, 15, 1);
```

### Limit Login Attempts

```php
// config/application.php

// Limit login attempts
add_action('wp_login_failed', 'log_failed_login');
function log_failed_login($username) {
  $ip = $_SERVER['REMOTE_ADDR'];
  $attempts = get_transient('login_attempts_' . md5($ip));
  
  if ($attempts === false) {
    $attempts = 1;
  } else {
    $attempts++;
  }
  
  set_transient('login_attempts_' . md5($ip), $attempts, HOUR_IN_SECONDS);
  
  if ($attempts >= 5) {
    wp_die(__('Too many failed login attempts. Please try again in an hour.'));
  }
}
```

### Secure File Permissions

```bash
# Correct file permissions
find /path/to/web/app/themes -type f -exec chmod 644 {} \;
find /path/to/web/app/themes -type d -exec chmod 755 {} \;

# Secure wp-config.php
chmod 640 web/wp-config.php

# Secure .env
chmod 600 .env
```

---

## Plugin Security

### Only Use Trusted Plugins

```bash
# Check plugin security
# - Look for regular updates
# - Check review ratings
# - Review changelog
# - Test on staging first
```

### Disable Unnecessary Plugins

```sql
-- List active plugins
SELECT * FROM wp_options WHERE option_name = 'active_plugins';
```

### Use WordPress.org Plugins

```php
// config/application.php

// Only allow plugins from wordpress.org
add_filter('site_option_active_sitewide_plugins', function($plugins) {
  $whitelist = [
    'akismet/akismet.php',
    'wordfence/wordfence.php',
    // Add trusted plugins...
  ];
  
  foreach (array_keys($plugins) as $plugin) {
    if (!in_array($plugin, $whitelist)) {
      unset($plugins[$plugin]);
    }
  }
  
  return $plugins;
});
```

---

## Deployment Security

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Security Headers

```php
// config/application.php

// Add security headers
add_action('send_headers', function() {
  header('X-Content-Type-Options: nosniff');
  header('X-Frame-Options: SAMEORIGIN');
  header('X-XSS-Protection: 1; mode=block');
  header('Referrer-Policy: strict-origin-when-cross-origin');
  header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
});
```

### Backup Strategy

```bash
# Daily database backup
0 2 * * * /usr/bin/mysqldump -uwordpress -ppassword wordpress > /backups/wordpress_$(date +\%Y\%m\%d).sql

# Weekly file backup
0 3 * * 0 /usr/bin/tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz /var/www/web/app/uploads
```

---

## Pre-Deployment Checklist

- [ ] DISALLOW_FILE_EDIT enabled
- [ ] Strong salts generated (https://roots.io/salts.html)
- [ ] SSL/TLS configured
- [ ] File permissions set correctly
- [ ] XML-RPC disabled
- [ ] WordPress version hidden
- [ ] Security headers added
- [ ] Login attempts limited
- [ ] Trusted plugins only
- [ ] Backups configured
- [ ] Firewall configured
- [ ] Security plugin active (Wordfence/Sucuri)

---

## Regular Maintenance

### Weekly

- [ ] Review security logs
- [ ] Check for failed login attempts
- [ ] Verify backups completed

### Monthly

- [ ] Update WordPress core
- [ ] Update all plugins
- [ ] Update theme
- [ ] Rotate salts
- [ ] Review user accounts

### Quarterly

- [ ] Security audit
- [ ] Penetration testing
- [ ] Password policy review
- [ ] Incident response drill

---

## Related Documentation

- [BEDROCK_SETUP.md](./BEDROCK_SETUP.md) - Comprehensive setup guide
- [Root SECURITY.md](../../SECURITY.md) - Comprehensive security guide
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration options
- [README.md](./README.md) - Full documentation
- [WordPress Security Codex](https://wordpress.org/support/article/hardening-wordpress/)
