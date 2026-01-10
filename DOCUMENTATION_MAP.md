# Documentation Map

Interactive guide to navigating the test-cto documentation, showing connections between documents and recommended reading paths.

> **See Also**: [README.md](./README.md) for project overview, [GETTING_STARTED.md](./GETTING_STARTED.md) for quick start.

## Table of Contents

1. [Documentation Link Graph](#documentation-link-graph)
2. [User Journey Maps](#user-journey-maps)
3. [Navigation Checklist](#navigation-checklist)
4. [Cross-Reference Audit](#cross-reference-audit)
5. [Recommended Reading Order](#recommended-reading-order)

---

## Documentation Link Graph

```
                              ┌─────────────────┐
                              │                 │
                              │   README.md     │
                              │                 │
                              └────────┬────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │          │                 │
│ GETTING_STARTED │◄────────►│  ARCHITECTURE   │◄────────►│ COMMUNICATION   │
│                 │          │                 │          │                 │
└────────┬────────┘          └────────┬────────┘          └────────┬────────┘
         │                           │                           │
         │          ┌────────────────┼────────────────┐          │
         │          │                │                │          │
         ▼          ▼                ▼                ▼          ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │  │                 │
│   DEPLOYMENT    │  │    SECURITY     │  │ TRANSPARENCY    │  │ PACKAGE READMEs │
│                 │  │                 │  │                 │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │                    │
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │  │                 │
│ TEMPLATE GUIDES │  │  TEMPLATE MDs   │  │  INTEGRATION    │  │   SANITY CMS    │
│                 │  │                 │  │   CHECKLISTs    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
                   ┌─────────────────┐
                   │                 │
                   │ DOCUMENTATION   │
                   │     MAP (this)  │
                   │                 │
                   └─────────────────┘
```

---

## User Journey Maps

### Journey 1: New Developer

```
START: README.md
  │
  ├─► Quick Start section
  │
  ├─► GETTING_STARTED.md
  │    │
  │    ├─ Prerequisites
  │    ├─ Installation
  │    ├─ Development setup
  │    │
  │    └─ ARCHITECTURE.md (for deeper understanding)
  │
  └─► Choose a template
       │
       ├─ vite-react/astro (frontend focus)
       └─ api-server/bedrock-sage (backend focus)
```

**Time to productive**: 15-30 minutes

### Journey 2: Adding New Features

```
START: ARCHITECTURE.md
  │
  ├─ Package responsibilities
  ├─ Communication patterns
  │
  └─ COMMUNICATION.md
       │
       ├─ API contract structure
       ├─ Client-side patterns
       │
       └─ @myapp/types/README.md (for type definitions)
```

**Time to productive**: 5-10 minutes

### Journey 3: Deployment

```
START: README.md (deployment section)
  │
  └─ DEPLOYMENT.md
       │
       ├─ Pre-deployment checklist
       ├─ Choose platform
       │  ├─ Vercel/Netlify (frontend)
       │  ├─ Railway/Render (backend)
       │  └─ AWS (custom)
       │
       ├─ Database setup
       ├─ Environment configuration
       │
       └─ SECURITY.md (deployment security section)
```

**Time to productive**: 30-60 minutes

### Journey 4: Security Review

```
START: README.md (security section)
  │
  └─ SECURITY.md
       │
       ├─ Security philosophy
       ├─ Environment variables
       ├─ Database security
       ├─ Authentication
       ├─ API security
       ├─ Frontend security
       ├─ Dependencies
       ├─ Deployment security
       │
       └─ TRANSPARENCY.md (for compliance context)
```

**Time to productive**: 60-90 minutes

### Journey 5: Compliance Check

```
START: TRANSPARENCY.md
  │
  ├─ Code transparency
  ├─ Data transparency
  ├─ Dependency transparency
  │
  └─ SECURITY.md
       │
       └─ Data protection & privacy (GDPR/CCPA)
            │
            ├─ Data minimization
            ├─ User consent
            ├─ Right to access/deletion
            └─ Data retention policies
```

**Time to productive**: 30-45 minutes

---

## Navigation Checklist

### Before You Start

- [ ] Read [README.md](./README.md)
- [ ] Identify your use case
- [ ] Choose appropriate template

### Getting Started

- [ ] Follow [GETTING_STARTED.md](./GETTING_STARTED.md)
- [ ] Set up development environment
- [ ] Run initial build

### Understanding Architecture

- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Understand package boundaries
- [ ] Review communication patterns

### API Development

- [ ] Study [COMMUNICATION.md](./COMMUNICATION.md)
- [ ] Review @myapp/types README
- [ ] Define API contracts

### Deployment Preparation

- [ ] Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Complete pre-deployment checklist
- [ ] Configure environment variables

### Security Hardening

- [ ] Read [SECURITY.md](./SECURITY.md)
- [ ] Implement security checklist
- [ ] Review compliance requirements

### Going Live

- [ ] Run security audit
- [ ] Configure monitoring
- [ ] Set up backup procedures
- [ ] Document incident response

---

## Cross-Reference Audit

### Root Documentation Cross-References

| From \ To | README | GETTING_STARTED | ARCHITECTURE | COMMUNICATION | DEPLOYMENT | SECURITY | TRANSPARENCY |
|-----------|--------|-----------------|--------------|---------------|------------|----------|--------------|
| README | - | ✓ | ✓ | ✓ | ✓ | - | - |
| GETTING_STARTED | ✓ | - | ✓ | ✓ | ✓ | - | - |
| ARCHITECTURE | ✓ | ✓ | - | ✓ | ✓ | - | - |
| COMMUNICATION | ✓ | ✓ | ✓ | - | - | - | - |
| DEPLOYMENT | ✓ | ✓ | ✓ | ✓ | - | ✓ | - |
| SECURITY | - | - | - | - | ✓ | - | ✓ |
| TRANSPARENCY | - | - | - | - | - | ✓ | - |

### Package Documentation Cross-References

| Package | README | ARCHITECTURE | COMMUNICATION | DEPLOYMENT |
|---------|--------|--------------|---------------|------------|
| @myapp/types | ✓ | Role | API patterns | - |
| @myapp/db | ✓ | Role | - | DB setup |
| @myapp/schema | ✓ | Role | - | - |
| @myapp/server-utils | ✓ | Role | API patterns | - |
| @myapp/ui | ✓ | Role | - | - |
| @myapp/hooks | ✓ | Role | - | - |
| @myapp/utils | ✓ | Role | - | - |
| @myapp/lib | ✓ | Role | - | - |
| @myapp/tokens | ✓ | Role | - | - |
| @myapp/web | ✓ | Role | - | Deployment |

### Template Documentation Cross-References

| Template | QUICK_START | INTEGRATION | SECURITY | DEPLOYMENT |
|----------|-------------|-------------|----------|------------|
| vite-react | ✓ | ✓ | ✓ | ✓ |
| astro | ✓ | ✓ | ✓ | ✓ |
| library | ✓ | ✓ | ✓ | ✓ |
| api-server | ✓ | ✓ | ✓ | ✓ |
| bedrock-sage | ✓ | ✓ | ✓ | ✓ |
| sanity-cms | ✓ | ✓ | ✓ | ✓ |

---

## Recommended Reading Order

### By Role

#### Frontend Developer
1. README.md
2. GETTING_STARTED.md
3. ARCHITECTURE.md (client-side packages)
4. COMMUNICATION.md
5. Template-specific QUICK_START.md
6. @myapp/ui/README.md

#### Backend Developer
1. README.md
2. GETTING_STARTED.md
3. ARCHITECTURE.md (server-side packages)
4. COMMUNICATION.md
5. SECURITY.md (API security section)
6. @myapp/db/README.md

#### DevOps Engineer
1. README.md
2. DEPLOYMENT.md
3. SECURITY.md (deployment section)
4. TRANSPARENCY.md
5. Template-specific SECURITY.md

#### Security Engineer
1. SECURITY.md (full)
2. TRANSPARENCY.md (compliance)
3. ARCHITECTURE.md (boundaries)
4. COMMUNICATION.md (API security)

#### Product Manager
1. README.md
2. TRANSPARENCY.md
3. ARCHITECTURE.md (overview)
4. Template documentation

### By Use Case

#### Starting New Project
1. README.md (quick start)
2. GETTING_STARTED.md (installation)
3. Choose template → QUICK_START.md

#### Adding Database
1. ARCHITECTURE.md (@myapp/db role)
2. GETTING_STARTED.md (schemas)
3. @myapp/db/README.md
4. COMMUNICATION.md (API patterns)

#### Deploying to Production
1. DEPLOYMENT.md (pre-deployment)
2. SECURITY.md (deployment security)
3. Template-specific deployment guide

#### Security Audit
1. SECURITY.md (full)
2. TRANSPARENCY.md (compliance)
3. Package-specific security notes
4. Template-specific SECURITY.md

#### Compliance Review
1. TRANSPARENCY.md (full)
2. SECURITY.md (data protection)
3. Data handling templates

---

## Missing Links Check

### Current Status: ✅ All Cross-References Valid

| Link Type | Count | Status |
|-----------|-------|--------|
| Internal documentation links | 150+ | ✅ Valid |
| Package README links | 50+ | ✅ Valid |
| Template documentation links | 40+ | ✅ Valid |
| External reference links | 20+ | ✅ Valid |

### Validation Process

```bash
# Check for broken links
pnpm markdown-link-check *.md

# Verify cross-references
grep -r "\[.*\](.*\.md)" . --include="*.md"
```

---

## Quick Reference

### Most Common Paths

| Goal | Path |
|------|------|
| I want to start developing | README.md → GETTING_STARTED.md |
| I need to understand the architecture | ARCHITECTURE.md |
| I'm building an API | COMMUNICATION.md |
| I'm deploying to production | DEPLOYMENT.md |
| I need security guidance | SECURITY.md |
| I'm preparing for compliance | TRANSPARENCY.md |

### Document Purpose Summary

| Document | Purpose | Read When |
|----------|---------|-----------|
| README.md | Project overview | First time |
| GETTING_STARTED.md | Setup guide | Starting development |
| ARCHITECTURE.md | System design | Understanding structure |
| COMMUNICATION.md | API patterns | Building APIs |
| DEPLOYMENT.md | Deployment guide | Going to production |
| SECURITY.md | Security practices | Any development |
| TRANSPARENCY.md | Compliance guide | Legal/audit review |
| DOCUMENTATION_MAP | Navigation aid | Finding documents |

---

## Related Documentation

- [README.md](./README.md) - Project overview
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Quick start guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [COMMUNICATION.md](./COMMUNICATION.md) - API patterns
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [SECURITY.md](./SECURITY.md) - Security practices
- [TRANSPARENCY.md](./TRANSPARENCY.md) - Transparency & compliance
