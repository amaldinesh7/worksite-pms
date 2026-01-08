# AI Development Guide

Quick reference for AI-powered development in this project.

---

## Context System

| File               | Purpose                  | Update When              |
| ------------------ | ------------------------ | ------------------------ |
| `.cursorrules`     | Static coding rules      | Rarely                   |
| `agents.md`        | Tools, @agents, patterns | Adding packages          |
| `.coderabbit.yaml` | Code review config       | Changing review rules    |
| `docs/*.md`        | Auto-generated docs      | Run `pnpm docs:generate` |

---

## Daily Workflow

### Starting a Task

1. Check `agents.md` for relevant tools/patterns
2. Use `@agent` prefix for focused help
3. Reference `docs/*.md` for current state

### Adding a New Package

```bash
# 1. Install
pnpm add your-package

# 2. Update agents.md Tool Registry
# Add: name, version, context, rules, docs

# 3. Tell AI
"Added [package], read agents.md"
```

### Building Features

Use `@agent` prefixes:

```
@architect  → Design decisions
@frontend   → UI components
@backend    → API endpoints
@mobile     → React Native stuff
@web        → Web-specific features
@database   → Prisma/queries
@reviewer   → Code review with CodeRabbit
```

Reference patterns:

```
@agents.md pattern:feature_creation
@agents.md pattern:form_pattern
@agents.md pattern:api_pattern
@agents.md pattern:code_review_pattern
```

### Before Committing

Run CodeRabbit to catch issues:

```bash
# Quick review of uncommitted changes
coderabbit --prompt-only --type uncommitted

# Or let AI handle it
"Review my changes with CodeRabbit and fix critical issues"
```

### After Code Changes

```bash
# Update auto-generated docs
pnpm docs:generate

# Run tests
cd apps/api && pnpm test
```

---

## Code Review Workflow

### Using CodeRabbit CLI

```bash
# Review uncommitted changes
coderabbit --prompt-only --type uncommitted

# Review against main branch
coderabbit --prompt-only --base main

# Full interactive review
coderabbit
```

### Priority Handling

| Priority     | Action              | Examples                            |
| ------------ | ------------------- | ----------------------------------- |
| **Critical** | Fix immediately     | Security vulnerabilities, data loss |
| **High**     | Fix before commit   | Memory leaks, race conditions       |
| **Medium**   | Fix if time permits | Best practice violations            |
| **Low**      | Can ignore          | Style nits, minor improvements      |

### AI Agent Integration

```
Implement [feature] and then run coderabbit --prompt-only.
Fix any critical or high priority issues.
Run CodeRabbit again to verify.
Only run the loop twice - stop if no critical issues remain.
```

---

## File Upload & Compression

### Uploading Documents

```bash
curl -X POST "http://localhost:3000/api/documents?projectId=xxx" \
  -H "x-organization-id: ORG_ID" \
  -F "file=@document.pdf"
```

### Supported File Types

| Type   | Extensions          | Compression                |
| ------ | ------------------- | -------------------------- |
| Images | jpg, png, webp, gif | Sharp (40-70% reduction)   |
| PDFs   | pdf                 | pdf-lib (10-30% reduction) |
| Office | docx, xlsx, pptx    | adm-zip (5-15% reduction)  |

### Response Includes Compression Stats

```json
{
  "compression": {
    "originalSize": 1024000,
    "compressedSize": 512000,
    "savedBytes": 512000,
    "compressionRatio": 2
  }
}
```

---

## Checklist

- [ ] Updated `agents.md` when adding packages
- [ ] Used `@agent` for focused help
- [ ] Ran CodeRabbit before committing
- [ ] Ran `pnpm docs:generate` after changes
- [ ] Used Tamagui, not primitives
- [ ] Used theme tokens, not hardcoded values
- [ ] Added tests for new API endpoints

---

## Project Structure

```
worksite/
├── apps/
│   ├── api/              # Fastify backend
│   │   └── src/
│   │       ├── routes/       # API endpoints
│   │       ├── services/     # Compression, Storage
│   │       └── repositories/ # Database access
│   ├── mobile/           # Expo mobile app
│   └── web/              # Vite web app
├── packages/
│   ├── ui/               # Shared Tamagui components
│   └── types/            # Shared Zod types
├── docs/                 # Auto-generated
├── agents.md             # AI context (update this!)
├── .coderabbit.yaml      # Code review config
└── .cursorrules          # Static rules
```

---

## Quick Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm test                   # Run all tests

# Database
cd apps/api
npx prisma migrate dev      # Create migration
npx prisma generate         # Regenerate client
npx prisma studio           # Visual database browser

# Code Review
coderabbit --prompt-only    # AI-optimized review
coderabbit --plain          # Detailed human-readable
coderabbit auth login       # Authenticate for enhanced reviews

# Storage
docker-compose up -d        # Start PostgreSQL + MinIO
# MinIO console: http://localhost:9001 (minioadmin/minioadmin)
```

**Happy coding! 🎉**
