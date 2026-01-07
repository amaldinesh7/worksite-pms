# Worksite

Full-stack monorepo with React Native mobile, React web, and Node.js backend.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native + Expo |
| Web | React + Vite |
| API | Fastify + Prisma |
| Database | PostgreSQL |
| UI | Tamagui |
| Monorepo | Turborepo + pnpm |

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

# Start database
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

## What's Running

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3000 |
| Mobile | Scan QR with Expo Go |

---

## Commands

```bash
pnpm dev              # Start all apps
pnpm build            # Build all
pnpm docs:generate    # Update AI docs

# Specific app
pnpm dev --filter=@worksite/web
pnpm dev --filter=@worksite/api
pnpm dev --filter=@worksite/mobile
```

---

## Project Structure

```
worksite/
├── apps/
│   ├── api/          # Fastify + Prisma
│   ├── mobile/       # Expo + React Native
│   └── web/          # Vite + React
├── packages/
│   ├── ui/           # Shared Tamagui
│   └── types/        # Shared TypeScript
├── docs/             # Auto-generated
└── scripts/          # Utilities
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

# 3. Database
docker-compose up -d
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..

# 4. Verify
pnpm dev
curl http://localhost:3000/health
```

---

## Environment Variables

Create `.env` in root:

```bash
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydb
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

---

## AI Development

See `AI_GUIDE.md` for AI-powered development tips.

- `.cursorrules` → Static rules
- `agents.md` → Dynamic context
- `docs/*.md` → Auto-generated docs

---

Made with ❤️
