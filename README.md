# Worksite

Full-stack monorepo with React Native mobile, React web, and Node.js backend.

---

## Tech Stack

| Layer    | Tech                           |
| -------- | ------------------------------ |
| Mobile   | React Native + Expo + NativeWind |
| Web      | React + Vite + Tailwind + shadcn/ui |
| API      | Fastify + Prisma               |
| Database | PostgreSQL                     |
| Storage  | MinIO / Supabase               |
| Monorepo | Turborepo + pnpm               |

---

## Prerequisites

- **Node.js** 20+ → [nodejs.org](https://nodejs.org)
- **pnpm** 9+ → `npm install -g pnpm`
- **Docker** → [docker.com](https://docker.com)

---

## Quick Start

```bash
# Clone
git clone <your-repo>
cd worksite

# Install
pnpm install

# Start database + storage
docker-compose up -d

# Setup database
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# Run everything
pnpm dev
```

🎉 Done!

---

## What's Running After `pnpm dev`

| App        | URL                   | How to Access                                 |
| ---------- | --------------------- | --------------------------------------------- |
| **Web**    | http://localhost:5173 | Open in browser                               |
| **API**    | http://localhost:3000 | Test with `curl http://localhost:3000/health` |
| **Mobile** | QR Code in terminal   | See instructions below                        |
| **MinIO**  | http://localhost:9001 | Storage console (minioadmin/minioadmin)       |

### Accessing the Mobile App

1. **Install Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Run the dev server** (if not already running):

   ```bash
   pnpm dev
   ```

3. **Look for the QR code** in terminal output under `@worksite/mobile:dev`

4. **Scan the QR code**:
   - iOS: Use your Camera app
   - Android: Use the Expo Go app's scanner

5. **Or open manually** by pressing:
   - `i` → Open iOS Simulator
   - `a` → Open Android Emulator
   - `w` → Open in web browser

> **Tip**: Your phone must be on the same WiFi network as your computer!

---

## Commands

```bash
pnpm dev              # Start all apps
pnpm build            # Build all
pnpm test             # Run all tests
pnpm docs:generate    # Update AI docs

# Specific app
pnpm dev --filter=@worksite/web
pnpm dev --filter=@worksite/api
pnpm dev --filter=@worksite/mobile

# API tests
cd apps/api && pnpm test
```

---

## Project Structure

```
worksite/
├── apps/
│   ├── api/              # Fastify + Prisma
│   │   └── src/
│   │       ├── routes/       # API endpoints
│   │       ├── services/     # Compression, Storage
│   │       └── repositories/ # Database access
│   ├── mobile/           # Expo + React Native
│   │   ├── app/              # Expo Router screens
│   │   ├── components/       # Reusable UI components
│   │   └── data/             # React Query + mock data
│   └── web/              # Vite + React
├── packages/
│   ├── ui/               # Shared design tokens
│   └── types/            # Shared TypeScript
├── docs/                 # Documentation
├── postman/              # API collections
└── scripts/              # Utilities
```

---

## Mobile App (Construction PMS)

The mobile app is a Construction Project Management System with the following features:

### Running Mobile Only

```bash
# From project root
pnpm dev --filter=@worksite/mobile

# Or directly
cd apps/mobile
pnpm dev
```

Then scan the QR code with Expo Go or press `w` for web preview.

---

## Features

### File Upload with Compression

Upload documents with automatic compression:

```bash
curl -X POST "http://localhost:3000/api/documents?projectId=YOUR_PROJECT_ID" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -F "file=@image.jpg"
```

**Supported formats:** JPEG, PNG, WebP, GIF, PDF, DOCX, XLSX, PPTX

**Compression results:**

- Images: 40-70% smaller (Sharp + WebP conversion)
- PDFs: 10-30% smaller (metadata removal)
- Office docs: 5-15% smaller (re-compression)

### Code Review with CodeRabbit

AI-powered code review before commits:

```bash
# Install CodeRabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Review uncommitted changes
coderabbit --prompt-only --type uncommitted

# Authenticate for enhanced reviews
coderabbit auth login
```

---

## Environment Variables

Create `.env` in `apps/api/`:

```bash
# Database
DATABASE_URL=postgresql://myuser:mypassword@localhost:5433/worksite

# Storage (MinIO for local, Supabase for production)
SUPABASE_URL=http://localhost:9000
SUPABASE_SERVICE_KEY=minioadmin
SUPABASE_STORAGE_BUCKET=documents

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## New Machine Setup

```bash
# 1. Install prerequisites
nvm install 20 && nvm use 20
npm install -g pnpm
# Install Docker Desktop

# 2. Clone & setup
git clone <repo>
cd worksite
pnpm install

# 3. Database + Storage
docker-compose up -d
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..

# 4. (Optional) Install CodeRabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# 5. Verify
pnpm dev
curl http://localhost:3000/health
```

---

## Troubleshooting

### Database won't connect

```bash
docker-compose down && docker-compose up -d
```

### Port in use

```bash
lsof -i :3000
kill -9 <PID>
```

### Prisma issues

```bash
cd apps/api
npx prisma generate
```

### Storage not working

```bash
# Check MinIO is running
docker-compose ps
# Access console at http://localhost:9001
```

---

## Development

### Code Review with CodeRabbit

AI-powered code review catches issues before they reach your PR:

```bash
# Install CodeRabbit CLI (one-time)
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Review uncommitted changes
coderabbit --prompt-only --type uncommitted

# Review against main branch (before PR)
coderabbit --prompt-only --base main

# Authenticate for enhanced reviews (optional)
coderabbit auth login
```

**Priority handling:**
| Priority | Action | Examples |
|----------|--------|----------|
| Critical | Fix immediately | Security vulnerabilities, data loss |
| High | Fix before commit | Memory leaks, race conditions |
| Medium | Fix if time permits | Best practice violations |
| Low | Can ignore | Style nits |

**AI Agent workflow:**

```
Implement [feature] and run coderabbit --prompt-only.
Fix critical/high issues and run again to verify.
Stop after 2 iterations if no critical issues remain.
```

### Running Tests

```bash
# All tests
pnpm test

# API tests only
cd apps/api && pnpm test

# Watch mode
cd apps/api && pnpm test:watch

# With coverage
cd apps/api && pnpm test:coverage
```

### Database Migrations

```bash
cd apps/api

# Create new migration
npx prisma migrate dev --name description_here

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

---

## AI Development

See `AI_GUIDE.md` for AI-powered development tips.

| File               | Purpose                          |
| ------------------ | -------------------------------- |
| `.cursorrules`     | Static coding rules              |
| `agents.md`        | Dynamic context, tools, patterns |
| `.coderabbit.yaml` | Code review configuration        |
| `docs/*.md`        | Auto-generated documentation     |

**Available @agents:**

```
@architect  → System design decisions
@frontend   → UI (Tailwind + shadcn for web, NativeWind for mobile)
@backend    → API endpoints with Fastify
@mobile     → React Native / Expo
@database   → Prisma / PostgreSQL
@reviewer   → Code review with CodeRabbit
```

---

## API Documentation

See `docs/API.md` for full endpoint reference.

**Key endpoints:**

- `POST /api/documents` - Upload with compression
- `GET /api/documents/:id/download` - Get signed download URL
- `GET /api/expenses/summary/by-category` - Expense analytics

---

Made with ❤️
