# AI Development Guide

Quick reference for AI-powered development in this project.

---

## 🧠 Context System

| File | Purpose | Update When |
|------|---------|-------------|
| `.cursorrules` | Static coding rules | Rarely |
| `agents.md` | Tools, @agents, patterns | Adding packages |
| `docs/*.md` | Auto-generated docs | Run `pnpm docs:generate` |

---

## 🚀 Daily Workflow

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
```

Reference patterns:
```
@agents.md pattern:feature_creation
@agents.md pattern:form_pattern
@agents.md pattern:api_pattern
```

### After Code Changes

```bash
# Update auto-generated docs
pnpm docs:generate
```

---

## ✅ Checklist

- [ ] Updated `agents.md` when adding packages
- [ ] Used `@agent` for focused help
- [ ] Ran `pnpm docs:generate` after changes
- [ ] Used Tamagui, not primitives
- [ ] Used theme tokens, not hardcoded values

---

## 📁 Project Structure

```
worksite/
├── apps/
│   ├── api/          # Fastify backend
│   ├── mobile/       # Expo mobile app
│   └── web/          # Vite web app
├── packages/
│   ├── ui/           # Shared Tamagui components
│   └── types/        # Shared Zod types
├── docs/             # Auto-generated
├── agents.md         # AI context (update this!)
└── .cursorrules      # Static rules
```

**Happy coding! 🎉**
