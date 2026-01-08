# Worksite

Full-stack monorepo with React Native mobile, React web, and Node.js backend.

---

## Tech Stack

| Layer    | Tech                |
| -------- | ------------------- |
| Mobile   | React Native + Expo |
| Web      | React + Vite        |
| API      | Fastify + Prisma    |
| Database | PostgreSQL          |
| UI       | Tamagui             |
| Monorepo | Turborepo + pnpm    |

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

## What's Running After `pnpm dev`

| App        | URL                   | How to Access                                 |
| ---------- | --------------------- | --------------------------------------------- |
| **Web**    | http://localhost:5173 | Open in browser                               |
| **API**    | http://localhost:3000 | Test with `curl http://localhost:3000/health` |
| **Mobile** | QR Code in terminal   | See instructions below                        |

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
DATABASE_URL=postgresql://myuser:mypassword@localhost:5433/worksite
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
