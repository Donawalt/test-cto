# Deployment Guide

A comprehensive guide for deploying MyApp monorepo applications to production across different platforms and deployment strategies.

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Platform-Specific Guides](#platform-specific-guides)
  - [Frontend Platforms](#frontend-platforms)
    - [Vercel](#vercel)
    - [Netlify](#netlify)
    - [Cloudflare Pages](#cloudflare-pages)
  - [Backend Platforms](#backend-platforms)
    - [Railway](#railway)
    - [Render](#render)
    - [Cloudflare Workers](#cloudflare-workers)
    - [Infomaniak](#infomaniak)
    - [Scaleway](#scaleway)
  - [Full-Stack Platforms](#full-stack-platforms)
    - [AWS](#aws)
    - [DigitalOcean](#digitalocean)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [CI/CD Integration](#cicd-integration)
- [Migration Strategies](#migration-strategies)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Scaling Strategies](#scaling-strategies)
- [Troubleshooting](#troubleshooting)

## Overview

The MyApp monorepo supports multiple deployment strategies across **9 production-ready platforms** depending on your template choice:

### Template Compatibility Matrix

| Platform | vite-react | astro | api-server | bedrock-sage | library |
|----------|-----------|-------|-----------|--------------|---------|
| **Vercel** | ✅ | ✅ | - | - | - |
| **Netlify** | ✅ | ✅ | - | - | - |
| **Cloudflare** | ✅ | ✅ | ✅ (Workers) | - | - |
| **Railway** | - | - | ✅ | ✅ | - |
| **Render** | - | - | ✅ | ✅ | - |
| **Infomaniak** | - | - | ✅ | ✅ | - |
| **Scaleway** | - | - | ✅ | ✅ | - |
| **AWS** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DigitalOcean** | ✅ | ✅ | ✅ | ✅ | - |

### Deployment Categories

- **Frontend Platforms**: Vercel, Netlify, Cloudflare Pages (static site hosting)
- **Backend Platforms**: Railway, Render, Cloudflare Workers, Infomaniak, Scaleway (API/server deployment)
- **Full-Stack Platforms**: AWS, DigitalOcean (complete infrastructure control)

### Platform Highlights

- **Privacy-Focused**: Infomaniak (Swiss data residency, GDPR compliance)
- **Edge Computing**: Cloudflare Workers (global edge deployment)
- **Enterprise-Ready**: AWS, Scaleway (full infrastructure control)
- **Developer-Friendly**: Vercel, Netlify, Railway, Render (simple deployment)
- **Cost-Effective**: DigitalOcean, Infomaniak, Scaleway (competitive pricing)

> **See Also**: [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details, [GETTING_STARTED.md](./GETTING_STARTED.md) for local development setup.

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Built all packages successfully: `pnpm build`
- [ ] Run type checking: `pnpm type-check`
- [ ] Run all tests: `pnpm test`
- [ ] Set up environment variables (see [Environment Configuration](#environment-configuration))
- [ ] Configured database connection (see [Database Setup](#database-setup))
- [ ] Run database migrations (see [Migration Strategies](#migration-strategies))
- [ ] Set up monitoring and logging (see [Monitoring & Logging](#monitoring--logging))
- [ ] Review security settings and secrets
- [ ] Configure CORS and API endpoints
- [ ] Set up SSL/TLS certificates
- [ ] Create database backups

## Platform-Specific Guides

### Vercel

Best for: `vite-react` template, `astro` template

**Setup:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from root:
```bash
# For vite-react template
cd templates/vite-react
pnpm build
vercel --prod
```

3. Configure build settings in `vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install"
}
```

**Environment Variables:**
- Navigate to Project Settings → Environment Variables
- Add all variables from `.env.client`
- Prefix client variables with `VITE_`

**Custom Domain:**
```bash
vercel domains add yourdomain.com
```

**See Also**: [vite-react README](./templates/vite-react/README.md)

### Netlify

Best for: `vite-react` template, `astro` template

**Setup:**

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
cd templates/vite-react
pnpm build
netlify deploy --prod --dir=dist
```

3. Configure `netlify.toml`:
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables:**
- Site Settings → Build & Deploy → Environment
- Add all `.env.client` variables

**Continuous Deployment:**
- Connect your Git repository
- Netlify auto-deploys on push to main branch

### Railway

Best for: `api-server` template, `bedrock-sage` template

**Setup:**

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Initialize project:
```bash
railway login
railway init
```

3. Deploy API server:
```bash
cd templates/api-server
railway up
```

4. Add PostgreSQL database:
```bash
railway add
# Select PostgreSQL
```

**Environment Variables:**
```bash
# Set via CLI
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production

# Or use the dashboard
```

**Database Migrations:**
```bash
# Run migrations on Railway
railway run pnpm migrate:run
```

**Custom Domain:**
- Settings → Domains → Custom Domain
- Add CNAME record pointing to your Railway URL

**See Also**: [api-server README](./templates/api-server/README.md), [Database Setup](#database-setup)

### Render

Best for: `api-server` template, `bedrock-sage` template

**Setup:**

1. Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: myapp-api
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: myapp-db
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true

databases:
  - name: myapp-db
    databaseName: myapp
    user: myapp
```

2. Deploy:
```bash
# Connect your Git repository
# Render auto-deploys from render.yaml
```

**Health Checks:**
```javascript
// Add to your Express server
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**Database Backups:**
- Dashboard → Database → Backups
- Enable automatic daily backups

### AWS

Best for: All templates, production-scale deployments

#### S3 + CloudFront (Static Sites)

For `vite-react` and `astro` templates:

1. Build your app:
```bash
cd templates/vite-react
pnpm build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://myapp-prod
aws s3 website s3://myapp-prod --index-document index.html
```

3. Upload files:
```bash
aws s3 sync dist/ s3://myapp-prod --delete
```

4. Create CloudFront distribution:
```bash
aws cloudfront create-distribution \
  --origin-domain-name myapp-prod.s3.amazonaws.com \
  --default-root-object index.html
```

5. Configure Cache Policy for SPA routing:
```json
{
  "ErrorResponses": {
    "Items": [{
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    }]
  }
}
```

#### ECS (Backend API)

For `api-server` and `bedrock-sage` templates:

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json ./packages/db/
COPY packages/server-utils/package.json ./packages/server-utils/
COPY templates/api-server/package.json ./templates/api-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build packages
RUN pnpm build

# Expose port
EXPOSE 4000

# Start server
CMD ["pnpm", "start"]
```

2. Build and push image:
```bash
aws ecr create-repository --repository-name myapp-api
docker build -t myapp-api .
docker tag myapp-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp-api:latest
```

3. Create ECS service:
```bash
aws ecs create-cluster --cluster-name myapp-cluster
aws ecs create-service \
  --cluster myapp-cluster \
  --service-name myapp-api \
  --task-definition myapp-api \
  --desired-count 2 \
  --launch-type FARGATE
```

4. Configure RDS (PostgreSQL):
```bash
aws rds create-db-instance \
  --db-instance-identifier myapp-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

**See Also**: [AWS Documentation](https://docs.aws.amazon.com/)

### DigitalOcean

Best for: All templates, cost-effective deployments

#### App Platform (Simple Deployment)

1. Create `app.yaml`:
```yaml
name: myapp
services:
  - name: web
    github:
      repo: your-username/myapp
      branch: main
      deploy_on_push: true
    build_command: pnpm install && pnpm build
    run_command: pnpm start
    envs:
      - key: DATABASE_URL
        scope: RUN_TIME
        value: ${db.DATABASE_URL}
      - key: NODE_ENV
        scope: RUN_TIME
        value: production

databases:
  - name: db
    engine: PG
    version: "14"
```

2. Deploy:
```bash
doctl apps create --spec app.yaml
```

#### Droplets (Full Control)

1. Create droplet:
```bash
doctl compute droplet create myapp \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc3
```

2. Install dependencies:
```bash
ssh root@your-droplet-ip
apt update && apt upgrade -y
apt install -y nodejs npm postgresql nginx
npm install -g pnpm
```

3. Clone and build:
```bash
git clone <your-repo> /var/www/myapp
cd /var/www/myapp
pnpm install
pnpm build
```

4. Configure Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. Set up PM2 for process management:
```bash
npm install -g pm2
pm2 start pnpm --name myapp -- start
pm2 startup
pm2 save
```

### Cloudflare Pages

Best for: `vite-react` template, `astro` template

**Privacy & Performance**: Global CDN, edge caching, excellent performance

**Setup:**

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Deploy static site:
```bash
cd templates/vite-react
pnpm build
npx wrangler pages deploy dist
```

3. Configure `wrangler.toml`:
```toml
name = "myapp"
compatibility_date = "2023-10-30"

[env.production]
workers_dev = false

[env.production.vars]
NODE_ENV = "production"
```

**Environment Variables:**
```bash
# Set via Wrangler CLI
npx wrangler pages secret put VITE_API_URL --env=production
npx wrangler pages secret put VITE_PUBLIC_KEY --env=production

# Or use dashboard: Workers & Pages → Settings → Environment Variables
```

**Custom Domain:**
```bash
npx wrangler pages domain add yourdomain.com --env=production
```

**CDN & Caching Strategy:**
```javascript
// Cache static assets for 1 year
// Cache HTML for 1 hour
// Cloudflare handles this automatically
```

**See Also**: [vite-react README](./templates/vite-react/README.md)

### Cloudflare Workers

Best for: `api-server` template, edge functions, global distribution

**Privacy & Performance**: Edge computing, 275+ locations worldwide, excellent for low-latency APIs

**Setup:**

1. Create Worker:
```bash
npx wrangler init myapp-worker
cd myapp-worker
```

2. Configure `wrangler.toml`:
```toml
name = "myapp-api"
main = "src/index.ts"
compatibility_date = "2023-10-30"

# Database bindings
[[d1_databases]]
binding = "DB"
database_name = "myapp-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# KV store for sessions
[[kv_namespaces]]
binding = "SESSIONS"
id = "xxxxxxxxxxxxxxxxxxxx"

# Environment variables
[env.production.vars]
NODE_ENV = "production"
JWT_SECRET = "your-secret-key"
```

3. Deploy Worker:
```bash
npx wrangler deploy --env=production
```

**Database Setup (D1):**
```bash
# Create D1 database
npx wrangler d1 create myapp-db

# Run migrations
npx wrangler d1 execute myapp-db --file=./migrations/schema.sql --env=production
```

**KV Store for Sessions:**
```bash
# Create KV namespace
npx wrangler kv:namespace create SESSIONS

# Add to wrangler.toml binding
```

**CORS Configuration:**
```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Your API logic here
    return new Response(JSON.stringify({ message: 'Hello from Workers!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
```

**Rate Limiting:**
```typescript
// Implement rate limiting using KV store
const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
const rateLimitKey = `rate_limit:${ip}`;
const requests = await env.SESSIONS.get(rateLimitKey);

if (requests && parseInt(requests) > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}

await env.SESSIONS.put(rateLimitKey, String((parseInt(requests) || 0) + 1), { expirationTtl: 3600 });
```

### Cloudflare R2 (Object Storage)

Best for: Static assets, file uploads, media storage

**Setup:**
```bash
# Create R2 bucket
npx wrangler r2 bucket create myapp-assets

# Configure binding in wrangler.toml
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "myapp-assets"
```

**File Upload Example:**
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      const key = `uploads/${Date.now()}-${file.name}`;
      await env.ASSETS.put(key, file.stream());
      
      return new Response(JSON.stringify({ key, url: `https://pub-xxx.r2.dev/${key}` }));
    }
    return new Response('Method not allowed', { status: 405 });
  },
};
```

**Signed URLs for Private Assets:**
```typescript
const url = await env.ASSETS.createSignedUrl('private-file.jpg', 3600);
```

### Cloudflare WAF (Web Application Firewall)

**Setup via Dashboard:**
1. Security → WAF → Custom rules
2. Rate limiting rules (100 requests per 10 minutes per IP)
3. Bot management (challenge suspicious traffic)
4. DDoS protection (automatically enabled)

**Custom Rules Example:**
```javascript
# Block common attack patterns
(http.request.uri.path contains "sqlmap" or http.request.uri.path contains "wp-admin")

# Rate limit API endpoints
(http.request.uri.path contains "/api/" and cf.threat_score > 10)

# Block specific regions (if needed)
(ip.geoip.country in {"CN" "RU"})
```

### Cloudflare DDoS Protection

**Automatic Protection:**
- L3/L4 DDoS protection (free)
- L7 DDoS protection (Pro/Enterprise)
- Always-on monitoring
- No configuration needed

**Custom Rules:**
```javascript
# Rate limiting for API endpoints
(http.request.uri.path contains "/api/" and rate(5m) > 1000)
```

---

## Infomaniak

Best for: `api-server` template, `bedrock-sage` template, privacy-focused projects

**Privacy & Compliance**: Swiss data residency, GDPR compliance, encrypted backups, no third-party data sharing

**Key Features:**
- **Data Residency**: All data stored in Switzerland
- **GDPR Compliance**: Built-in privacy controls
- **Encrypted Backups**: Automatic and manual backup encryption
- **Swiss Privacy**: No US surveillance laws (CLOUD Act)
- **Cost-Effective**: Competitive European pricing

### Setup

#### 1. Create Account
```bash
# Register at infomaniak.com
# Choose hosting plan (App Hosting or Virtual Server)
```

#### 2. Deploy API Server

**Option A: Managed Hosting (Similar to Railway/Render)**

1. Upload via Git:
```bash
# Connect GitHub repository
# Auto-deploy on push to main branch
```

2. Configure build:
```yaml
# infomaniak.yml
build:
  commands:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
    - pnpm build

start:
  command: "pnpm start"
  port: 4000

environments:
  production:
    - NODE_ENV=production
    - DATABASE_URL
    - JWT_SECRET
```

3. Environment Variables:
```bash
# Dashboard → Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
API_PORT=4000
```

**Option B: Virtual Server (VPS)**

1. Create VPS:
```bash
# Choose Ubuntu 22.04 LTS
# Recommended: 2 vCPU, 4GB RAM, 50GB SSD
```

2. Server Setup:
```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
```

3. Deploy Application:
```bash
# Clone repository
git clone <your-repo> /var/www/myapp
cd /var/www/myapp

# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build

# Start with PM2
pm2 start pnpm --name myapp -- start
pm2 startup
pm2 save
```

### Database Setup (PostgreSQL)

#### Managed Database:
```bash
# Create PostgreSQL database in Infomaniak dashboard
# Get connection string: postgresql://user:password@host:5432/database

# Add to environment variables
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Manual PostgreSQL Setup:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE myapp;
CREATE USER myapp_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp_user;

# Configure for external connections
# Edit /etc/postgresql/*/main/pg_hba.conf
# Add: host myapp myapp_user your_app_ip/32 md5

# Restart PostgreSQL
systemctl restart postgresql
```

### SSL/TLS Setup

**Let's Encrypt (Free SSL):**
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**Infomaniak Managed SSL:**
- SSL certificates included with hosting plans
- Automatic renewal
- Free Let's Encrypt certificates

### Encrypted Backups

#### Automatic Encrypted Backups:
```bash
# Enable in dashboard → Backups
# Frequency: Daily/Weekly
# Retention: 30 days
# Encryption: AES-256 (automatic)
```

#### Manual Backup Script:
```bash
#!/bin/bash
# /opt/myapp/backup.sh

DB_NAME="myapp"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create encrypted database dump
pg_dump $DB_NAME | gzip | gpg --cipher-algo AES256 --compress-algo 1 --symmetric --output $BACKUP_DIR/db_backup_$DATE.sql.gz.gpg

# Upload to Swiss storage
# Configure your backup destination
echo "Backup completed: db_backup_$DATE.sql.gz.gpg"
```

### Monitoring & Logging

#### Application Monitoring:
```bash
# PM2 monitoring
pm2 monit

# Log management
pm2 logs myapp

# System monitoring
apt install -y htop iotop
```

#### Health Checks:
```typescript
// Add to your API server
app.get('/health', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});
```

### Swiss Privacy Compliance

#### Data Protection Features:
- **Swiss Data Residency**: All data stays in Switzerland
- **GDPR Compliance**: Built-in consent management
- **No US Surveillance**: Protected from CLOUD Act
- **Encrypted Backups**: AES-256 encryption at rest and in transit
- **Privacy by Design**: Minimal data collection

#### GDPR Compliance Setup:
```typescript
// Add privacy headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'X-Privacy-Policy': 'https://yourdomain.com/privacy',
    'X-Data-Residency': 'Switzerland',
  });
  next();
});
```

**See Also**: [api-server README](./templates/api-server/README.md), [Privacy-focused deployment guide](./SECURITY.md#data-protection--privacy-gdprccpa)

---

## Scaleway

Best for: `api-server` template, `bedrock-sage` template, production-scale deployments

**Enterprise Features**: Docker/Kubernetes, VPC networking, security groups, managed databases, auto-scaling

**Key Features:**
- **Container Registry**: Build and store Docker images
- **Kubernetes K8s**: Managed K8s clusters with auto-scaling
- **VPC Networking**: Private network isolation
- **Security Groups**: Firewall rules and network access control
- **Managed Databases**: PostgreSQL with automated backups
- **Edge Computing**: Multi-region deployment

### Container Registry & Docker Deployment

#### 1. Create Container Registry
```bash
# Install Scaleway CLI
curl -o /usr/local/bin/scw -L https://github.com/scaleway/scaleway-cli/releases/latest/download/scw-linux-amd64
chmod +x /usr/local/bin/scw

# Configure credentials
scw init

# Create registry
scw registry namespace create name=myapp-registry
```

#### 2. Build and Push Docker Image
```dockerfile
# Dockerfile for api-server
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/
COPY templates/api-server/package.json ./templates/api-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

EXPOSE 4000
CMD ["pnpm", "start"]
```

```bash
# Build image
docker build -t myapp-api:latest .

# Tag for Scaleway registry
docker tag myapp-api:latest rg.fr-par.scw.cloud/myapp-registry/myapp-api:latest

# Push to registry
docker push rg.fr-par.scw.cloud/myapp-registry/myapp-api:latest
```

#### 3. Deploy with Docker

**Option A: Single Container**
```bash
# Create instance
scw instance server create \
  name=myapp-server \
  type=DEV1-S \
  image=ubuntu-jammy \
  volume=50GB \
  ip=new

# Install Docker
ssh root@instance-ip "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"

# Deploy container
ssh root@instance-ip "docker run -d -p 4000:4000 --name myapp rg.fr-par.scw.cloud/myapp-registry/myapp-api:latest"
```

**Option B: Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  myapp:
    image: rg.fr-par.scw.cloud/myapp-registry/myapp-api:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@host:5432/db
      - JWT_SECRET=your-secret-key
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - myapp
    restart: unless-stopped
```

### Kubernetes Deployment

#### 1. Create K8s Cluster
```bash
# Create Kubernetes cluster
scw k8s cluster create \
  name=myapp-cluster \
  version=1.28.1 \
  pool name=default-pool \
  node type=DEV1-M \
  node count=3

# Get kubeconfig
scw k8s kubeconfig get myapp-cluster > kubeconfig.yaml
export KUBECONFIG=kubeconfig.yaml
```

#### 2. Deploy Application with Helm

**Create Helm Chart:**
```bash
# Install Helm
curl https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/helm

# Create Helm chart
helm create myapp-chart
```

**Helm Values:**
```yaml
# myapp-chart/values.yaml
replicaCount: 3

image:
  repository: rg.fr-par.scw.cloud/myapp-registry/myapp-api
  tag: "latest"
  pullPolicy: Always

service:
  type: ClusterIP
  port: 4000

ingress:
  enabled: true
  className: nginx
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - api.yourdomain.com

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

resources:
  limits:
    memory: 512Mi
    cpu: 500m
  requests:
    memory: 256Mi
    cpu: 250m
```

**Deploy:**
```bash
# Deploy with Helm
helm upgrade --install myapp ./myapp-chart \
  --set image.tag=latest \
  --set ingress.host=api.yourdomain.com \
  --set database.url=$DATABASE_URL

# Check deployment
kubectl get pods
kubectl get ingress
```

### VPC & Networking

#### 1. Create VPC and Subnet
```bash
# Create VPC
scw vpc private-network create \
  name=myapp-vpc \
  region=fr-par

# Create subnet
scw vpc subnet create \
  organization=$(scw config get organization-id) \
  zone=fr-par-1 \
  vpc-id=$(scw vpc private-network list --name myapp-vpc --format json | jq -r '.[0].id') \
  cidr=10.0.1.0/24
```

#### 2. Security Groups

**Create Security Group:**
```bash
# Create security group
scw instance security-group create \
  name=myapp-sg \
  description="MyApp security group"

# Add rules
# HTTP/HTTPS access
scw instance security-group add-rule myapp-sg \
  --direction inbound \
  --protocol tcp \
  --port 80

scw instance security-group add-rule myapp-sg \
  --direction inbound \
  --protocol tcp \
  --port 443

# SSH access (restricted)
scw instance security-group add-rule myapp-sg \
  --direction inbound \
  --protocol tcp \
  --port 22 \
  --ip-range-range=your-ip/32

# Application port
scw instance security-group add-rule myapp-sg \
  --direction inbound \
  --protocol tcp \
  --port 4000

# Database access (PostgreSQL)
scw instance security-group add-rule myapp-sg \
  --direction inbound \
  --protocol tcp \
  --port 5432 \
  --ip-range-range=10.0.1.0/24
```

#### 3. Load Balancer

**Create Load Balancer:**
```bash
# Create load balancer
scw lb create \
  name=myapp-lb \
  region=fr-par \
  type=LB-S \
  organization-id=$(scw config get organization-id)

# Add backend
scw lb backend create \
  load-balancer-id=$(scw lb list --name myapp-lb --format json | jq -r '.[0].id') \
  name=myapp-backend \
  protocol=tcp \
  port=4000

# Add target (your instance)
scw lb target create \
  backend-id=$(scw lb backend list --load-balancer-id $(scw lb list --name myapp-lb --format json | jq -r '.[0].id') --format json | jq -r '.[0].id') \
  ip-address=your-instance-ip \
  port=4000 \
  weight=1
```

### Database Services (Managed PostgreSQL)

#### 1. Create Database Instance
```bash
# Create PostgreSQL instance
scw db instance create \
  name=myapp-db \
  engine=PostgreSQL-14 \
  node-type=DB-DEV-S \
  is-ha-cluster=false \
  organization=$(scw config get organization-id)

# Wait for provisioning (check status)
scw db instance list
```

#### 2. Configure Database
```bash
# Create database
scw db database create \
  instance-id=$(scw db instance list --name myapp-db --format json | jq -r '.[0].id') \
  name=myapp

# Create user
scw db user create \
  instance-id=$(scw db instance list --name myapp-db --format json | jq -r '.[0].id') \
  name=myapp_user \
  password=secure_password

# Get connection string
CONNECTION_STRING=$(scw db instance list --name myapp-db --format json | jq -r '.[0].endpoint | "postgresql://myapp_user:secure_password@\(.host):\(.port)/myapp"')
echo $CONNECTION_STRING
```

#### 3. Redis Cache (Optional)
```bash
# Create Redis cluster
scw redis cluster create \
  name=myapp-redis \
  node-type=REDIS-DEV-S \
  organization=$(scw config get organization-id)
```

### Auto-scaling Configuration

#### Horizontal Pod Autoscaler (HPA):
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Vertical Pod Autoscaler (VPA):
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Auto"
```

### Monitoring & Logging

#### 1. Enable Scaleway Observability
```bash
# Enable metrics and logs
scw observability enable \
  organization=$(scw config get organization-id) \
  region=fr-par
```

#### 2. Application Monitoring
```typescript
// Add to your API server
app.get('/health', async (req, res) => {
  try {
    // Database health check
    await db.execute(sql`SELECT 1`);
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});
```

**See Also**: [api-server README](./templates/api-server/README.md), [Kubernetes documentation](https://www.scaleway.com/en/docs/containers/kubernetes/)

## Database Setup

### PostgreSQL (Production)

**Railway:**
```bash
railway add
# Select PostgreSQL
# Connection string available as DATABASE_URL
```

**Render:**
```bash
# Create PostgreSQL database in dashboard
# Add connection string to environment variables
```

**Cloudflare D1:**
```bash
# Create D1 database
npx wrangler d1 create myapp-db

# Run migrations
npx wrangler d1 execute myapp-db --file=./migrations/schema.sql --env=production

# Connection string format:
DATABASE_URL=postgres://user:password@localhost:5432/database
# Note: D1 uses SQLite-compatible syntax in most cases
```

**Infomaniak:**
```bash
# Create PostgreSQL database in dashboard
# Get connection string: postgresql://user:password@host:5432/database

# Add to environment variables
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Scaleway:**
```bash
# Create PostgreSQL instance
scw db instance create \
  name=myapp-db \
  engine=PostgreSQL-14 \
  node-type=DB-DEV-S

# Create database and user
scw db database create \
  instance-id=$(scw db instance list --name myapp-db --format json | jq -r '.[0].id') \
  name=myapp

# Get connection string
CONNECTION_STRING=$(scw db instance list --name myapp-db --format json | jq -r '.[0].endpoint | "postgresql://myapp_user:secure_password@\(.host):\(.port)/myapp"')
echo $CONNECTION_STRING
```

**AWS RDS:**
```bash
aws rds create-db-instance \
  --db-instance-identifier myapp-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx
```

**DigitalOcean:**
```bash
# Create managed PostgreSQL database
doctl databases create myapp-db \
  --engine postgres \
  --version 14 \
  --size db-s-1vcpu-1gb \
  --region nyc3

# Get connection string
doctl databases connection-pool myapp-db --format connection-string
```

### Connection Pooling

For production, use connection pooling:

```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, {
  max: 10, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
```

### Database Migrations

See [Migration Strategies](#migration-strategies) below.

**See Also**: [@myapp/db README](./packages/db/README.md), [ARCHITECTURE.md - Database](./ARCHITECTURE.md#myappdb)

## Environment Configuration

### Client Variables (Public)

Prefix all client variables with `VITE_`:

```bash
# .env.client
VITE_API_URL=https://api.yourdomain.com
VITE_PUBLIC_KEY=pk_live_xxxxx
VITE_ANALYTICS_ID=GA-XXXXX
```

### Server Variables (Private)

```bash
# .env.server
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRES_IN=7d
API_PORT=4000
NODE_ENV=production

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS (if using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET=myapp-uploads

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Environment-Specific Configs

```typescript
// config/env.ts
export const config = {
  development: {
    apiUrl: 'http://localhost:4000',
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://staging-api.yourdomain.com',
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.yourdomain.com',
    logLevel: 'error',
  },
}[process.env.NODE_ENV || 'development'];
```

**See Also**: [GETTING_STARTED.md - Environment Variables](./GETTING_STARTED.md#environment-variables)

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18-alpine
  before_script:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
  script:
    - pnpm type-check
    - pnpm lint
    - pnpm test

build:
  stage: build
  image: node:18-alpine
  before_script:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
  script:
    - pnpm build
  artifacts:
    paths:
      - dist/
      - packages/*/dist/

deploy:
  stage: deploy
  image: node:18-alpine
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist
  only:
    - main
```

### CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

orbs:
  node: circleci/node@5.0.0

jobs:
  test:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: pnpm
      - run:
          name: Type check
          command: pnpm type-check
      - run:
          name: Lint
          command: pnpm lint
      - run:
          name: Test
          command: pnpm test

  deploy:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: pnpm
      - run:
          name: Build
          command: pnpm build
      - run:
          name: Deploy
          command: pnpm deploy

workflows:
  test-and-deploy:
    jobs:
      - test
      - deploy:
          requires:
            - test
          filters:
            branches:
              only: main
```

## Migration Strategies

### Drizzle Kit Migrations

1. **Generate migration:**
```bash
cd packages/db
pnpm drizzle-kit generate:pg
```

2. **Review migration file:**
```bash
ls -la drizzle/migrations/
cat drizzle/migrations/0001_*.sql
```

3. **Run migration:**
```bash
# Local
pnpm drizzle-kit push:pg

# Production (Railway)
railway run pnpm drizzle-kit push:pg

# Production (Render) - via build command
# Add to render.yaml:
# buildCommand: pnpm install && pnpm build && pnpm migrate:run
```

### Zero-Downtime Migrations

For production deployments with active users:

1. **Additive changes first:**
```sql
-- Step 1: Add new column (nullable)
ALTER TABLE users ADD COLUMN new_email VARCHAR(255);

-- Step 2: Backfill data
UPDATE users SET new_email = old_email WHERE new_email IS NULL;

-- Step 3: Make required (separate deployment)
ALTER TABLE users ALTER COLUMN new_email SET NOT NULL;

-- Step 4: Remove old column (separate deployment)
ALTER TABLE users DROP COLUMN old_email;
```

2. **Deploy in stages:**
```bash
# Stage 1: Add column
git commit -m "Add new_email column"
git push

# Stage 2: Backfill data
git commit -m "Backfill new_email data"
git push

# Stage 3: Make required
git commit -m "Make new_email required"
git push

# Stage 4: Remove old
git commit -m "Remove old_email column"
git push
```

### Rollback Strategy

```bash
# Keep migration scripts reversible
# drizzle/migrations/0001_add_users_email.sql
-- Up
ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL;

-- Down
ALTER TABLE users DROP COLUMN email;

# Rollback command
pnpm drizzle-kit drop
```

**See Also**: [@myapp/db README](./packages/db/README.md), [Schema Builder Documentation](./packages/schema/README.md)

## Monitoring & Logging

### Application Monitoring

#### Sentry (Error Tracking)

1. Install:
```bash
pnpm add @sentry/node @sentry/react
```

2. Configure server:
```typescript
// Server setup
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

3. Configure client:
```typescript
// Client setup
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

#### Datadog (APM)

```typescript
// Server setup
import tracer from 'dd-trace';

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
});
```

### Logging Strategy

Use structured logging with [@myapp/server-utils](./packages/server-utils/README.md):

```typescript
import { logger } from '@myapp/server-utils/logging';

// Development: Pretty console output
// Production: JSON structured logs

logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database error', { error, query });
logger.warn('Rate limit exceeded', { ip, endpoint });
```

### Performance Monitoring

#### New Relic

```bash
npm install newrelic
```

```javascript
// Load at app start
require('newrelic');
```

#### Custom Metrics

```typescript
import { metrics } from '@myapp/server-utils/metrics';

// Track API response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordResponseTime(req.path, duration);
  });
  next();
});

// Track database query times
const result = await metrics.measure('db.query.users', () =>
  db.select().from(users)
);
```

### Health Checks

```typescript
// Server health endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.execute(sql`SELECT 1`);
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});
```

**See Also**: [@myapp/server-utils README](./packages/server-utils/README.md)

## Performance Optimization

### Frontend Optimization

1. **Code Splitting:**
```typescript
// Lazy load routes
import { lazy } from 'react';

const Dashboard = lazy(() => import('./routes/dashboard'));
const Settings = lazy(() => import('./routes/settings'));
```

2. **Asset Optimization:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['@tanstack/react-router'],
        },
      },
    },
  },
});
```

3. **Image Optimization:**
```bash
# Use optimized formats
pnpm add vite-plugin-image-optimizer
```

4. **Caching Strategy:**
```typescript
// Service Worker for caching
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Backend Optimization

1. **Database Connection Pooling:**
```typescript
// packages/db/src/index.ts
const client = postgres(process.env.DATABASE_URL!, {
  max: 20, // Increased pool size
  idle_timeout: 20,
  connect_timeout: 10,
});
```

2. **Query Optimization:**
```typescript
// Use indexes
await db.execute(sql`
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_posts_user_id ON posts(user_id);
`);

// Batch queries
const users = await db.select()
  .from(users)
  .where(inArray(users.id, userIds)); // Better than N+1 queries
```

3. **Response Compression:**
```typescript
import compression from 'compression';

app.use(compression());
```

4. **Caching with Redis:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedUser(id: string) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.select().from(users).where(eq(users.id, id));
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
  
  return user;
}
```

### CDN Setup

**CloudFlare:**
```bash
# Point DNS to CloudFlare
# Enable caching rules
# Set cache headers
```

**AWS CloudFront:**
```bash
aws cloudfront create-distribution \
  --origin-domain-name myapp-prod.s3.amazonaws.com \
  --default-root-object index.html \
  --enabled
```

**See Also**: [ARCHITECTURE.md - Performance](./ARCHITECTURE.md#performance-considerations)

## Scaling Strategies

### Horizontal Scaling

**Load Balancing:**
```nginx
# Nginx load balancer config
upstream api_servers {
    least_conn;
    server api1.yourdomain.com:4000;
    server api2.yourdomain.com:4000;
    server api3.yourdomain.com:4000;
}

server {
    listen 80;
    location / {
        proxy_pass http://api_servers;
    }
}
```

**Auto-scaling (AWS):**
```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name myapp-asg \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns <target-group-arn>
```

### Vertical Scaling

**Railway:**
- Dashboard → Settings → Resources
- Increase memory and CPU allocation

**Render:**
- Dashboard → Instance Type
- Upgrade to larger instance

### Database Scaling

**Read Replicas:**
```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Primary (write)
const primaryClient = postgres(process.env.DATABASE_URL!);
export const dbWrite = drizzle(primaryClient);

// Replica (read)
const replicaClient = postgres(process.env.DATABASE_READ_URL!);
export const dbRead = drizzle(replicaClient);

// Usage
const user = await dbRead.select().from(users); // Read from replica
await dbWrite.insert(users).values(newUser); // Write to primary
```

**Connection Pooling (PgBouncer):**
```bash
# Add PgBouncer between app and database
# Railway includes this automatically
# For custom: Use docker image edoburu/pgbouncer
```

### Caching Layers

**Application Cache (Redis):**
```typescript
// High-traffic endpoints
app.get('/api/popular-posts', async (req, res) => {
  const cached = await redis.get('popular-posts');
  if (cached) return res.json(JSON.parse(cached));
  
  const posts = await db.select().from(posts).limit(10);
  await redis.set('popular-posts', JSON.stringify(posts), 'EX', 300);
  
  res.json(posts);
});
```

**CDN Caching:**
```typescript
// Set cache headers
app.use((req, res, next) => {
  if (req.path.startsWith('/api/public')) {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  next();
});
```

## Troubleshooting

### Common Issues

#### Build Failures

**Issue:** `Module not found` errors during build

**Solution:**
```bash
# Clear caches and rebuild
pnpm clean
rm -rf node_modules
pnpm install --frozen-lockfile
pnpm build
```

#### Database Connection Issues

**Issue:** `Connection timeout` or `Connection refused`

**Solution:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules (AWS/DigitalOcean)
# Ensure security group allows your IP

# Check connection pooling limits
# Increase max connections if needed
```

#### Memory Issues

**Issue:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Or add to package.json
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

#### CORS Errors

**Issue:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
```typescript
// Server setup
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
```

#### SSL/TLS Issues

**Issue:** `ERR_CERT_AUTHORITY_INVALID`

**Solution:**
```bash
# Use Let's Encrypt for free SSL
# Railway/Render/Vercel provide automatic SSL

# For custom: Use Certbot
certbot --nginx -d yourdomain.com
```

### Debugging Production Issues

**Enable Debug Logging:**
```bash
# Set environment variable
DEBUG=* NODE_ENV=production pnpm start
```

**Check Logs:**
```bash
# Railway
railway logs

# Render
# Dashboard → Logs

# AWS CloudWatch
aws logs tail /aws/ecs/myapp --follow
```

**Database Query Logging:**
```typescript
// Enable in development only
const client = postgres(process.env.DATABASE_URL!, {
  debug: process.env.NODE_ENV === 'development',
});
```

### Performance Debugging

**Profile Database Queries:**
```sql
-- PostgreSQL slow query log
ALTER DATABASE myapp SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

**Memory Profiling:**
```bash
# Generate heap snapshot
node --inspect server.js

# Use Chrome DevTools
# Navigate to chrome://inspect
```

**Load Testing:**
```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('https://api.yourdomain.com/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## Related Documentation

- **[README.md](./README.md)** - Project overview and quick start
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Local development setup
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and package structure
- **[COMMUNICATION.md](./COMMUNICATION.md)** - API patterns and contracts

### Package Documentation
- [@myapp/db](./packages/db/README.md) - Database setup and migrations
- [@myapp/server-utils](./packages/server-utils/README.md) - Server utilities
- [@myapp/types](./packages/types/README.md) - Type definitions

### Template Documentation
- [vite-react](./templates/vite-react/README.md) - React app deployment
- [astro](./templates/astro/README.md) - Static site deployment
- [api-server](./templates/api-server/README.md) - API server deployment
- [bedrock-sage](./templates/bedrock-sage/README.md) - Full-stack deployment
- [library](./templates/library/README.md) - NPM package publishing

---

**Ready to Deploy?** Start with the [Pre-Deployment Checklist](#pre-deployment-checklist) and choose your [deployment platform](#platform-specific-guides)!
