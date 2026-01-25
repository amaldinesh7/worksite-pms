# Worksite Deployment Guide

> Comprehensive guide for deploying the Worksite construction management platform across environments.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENVIRONMENTS                              │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  Component  │    Local    │    Beta     │    Stage    │   Prod  │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────┤
│  Web        │ Vite Dev    │ Vercel      │ Vercel      │ Vercel  │
│  API        │ Node.js     │ Render      │ Render      │ Render  │
│  Database   │ Docker PG   │ Supabase    │ Supabase    │ Supabase│
│  Storage    │ MinIO       │ Supabase    │ Supabase    │ R2      │
│  Branch     │ local       │ beta        │ stage       │ main    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

---

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Web      | React + Vite + Tailwind + shadcn/ui |
| API      | Fastify + Prisma + Node.js          |
| Database | PostgreSQL                          |
| Storage  | MinIO / Supabase Storage / R2       |
| Auth     | JWT + httpOnly Cookies              |

---

## Environment Variables

### API Environment Variables

| Variable        | Local                   | Beta/Stage      | Prod            | Description                             |
| --------------- | ----------------------- | --------------- | --------------- | --------------------------------------- |
| `NODE_ENV`      | `development`           | `production`    | `production`    | Environment mode                        |
| `PORT`          | `3000`                  | auto            | auto            | Server port (Render sets automatically) |
| `HOST`          | `0.0.0.0`               | `0.0.0.0`       | `0.0.0.0`       | Server host                             |
| `DATABASE_URL`  | Local PG                | Supabase pooled | Supabase pooled | PostgreSQL connection (pooled)          |
| `DIRECT_URL`    | -                       | Supabase direct | Supabase direct | Direct connection for migrations        |
| `JWT_SECRET`    | dev default             | **REQUIRED**    | **REQUIRED**    | JWT signing secret (32+ chars)          |
| `COOKIE_SECRET` | dev default             | **REQUIRED**    | **REQUIRED**    | Cookie signing secret (32+ chars)       |
| `CORS_ORIGIN`   | `http://localhost:5173` | Vercel URL      | Vercel URL      | Allowed origins (comma-separated)       |

#### Storage Variables (by environment)

**Local (MinIO):**

```env
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents
MINIO_USE_SSL=false
```

**Beta/Stage (Supabase Storage):**

```env
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_STORAGE_BUCKET=documents
```

**Prod (Cloudflare R2):**

```env
STORAGE_PROVIDER=r2
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_BUCKET_NAME=worksite-prod-files
CLOUDFLARE_R2_PUBLIC_URL=https://files.worksite.app
```

### Web Environment Variables

| Variable            | Description                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | API base URL (e.g., `https://worksite-api-beta.onrender.com/api`). Note: `VITE_` prefix required by Vite. |

---

## Platform Setup

### Supabase Setup (Database + Storage for Beta/Stage)

1. **Create Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Create new project: `worksite-beta` (or `worksite-stage`)
   - Choose region closest to your users
   - Set a strong database password (save it!)

2. **Get Connection Strings**
   - Go to Project Settings > Database
   - Copy **Connection string** (URI format):
     - **Pooled** (Transaction mode): Use for `DATABASE_URL`
     - **Direct**: Use for `DIRECT_URL` (migrations only)

   Example:

   ```
   # Pooled (for app)
   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

   # Direct (for migrations)
   DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

3. **Setup Storage**
   - Go to Storage in Supabase dashboard
   - Create bucket: `documents`
   - Set bucket to **private** (we'll use signed URLs)

4. **Get API Keys**
   - Go to Project Settings > API
   - Copy:
     - `SUPABASE_URL`: Project URL
     - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (secret!)

### Render Setup (API)

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" > "Web Service"
   - Connect your GitHub repo
   - Configure:
     ```
     Name: worksite-api-beta
     Region: Oregon (or closest)
     Branch: beta
     Root Directory: apps/api
     Runtime: Node
     Build Command: pnpm install && pnpm build
     Start Command: pnpm start
     ```

3. **Environment Variables**
   - Add all API environment variables from the table above
   - Mark secrets as "Secret" type

4. **Health Check**
   - Health Check Path: `/health`

### Vercel Setup (Web)

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your GitHub repo

2. **Configure Build**

   ```
   Framework Preset: Vite
   Root Directory: apps/web
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

3. **Environment Variables**
   - Add `VITE_API_BASE_URL` pointing to your Render API URL

4. **Branch Deployments**
   - Production Branch: `main`
   - Preview Branches: `beta`, `stage`

---

## Deployment Commands

### Database Migration

```bash
# Set environment variables first
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# Run migrations
cd apps/api
pnpm db:migrate:prod

# (Optional) Seed data
pnpm db:seed
```

### Local Development

```bash
# Start all services (PostgreSQL + MinIO)
docker-compose up -d

# Install dependencies
pnpm install

# Run migrations
cd apps/api && pnpm db:migrate && pnpm db:seed

# Start development servers
pnpm dev  # Runs all apps via Turborepo
```

### Manual Build & Test

```bash
# Build all apps
pnpm build

# Test API
cd apps/api && pnpm test

# Type check
pnpm typecheck
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Environment variables documented and ready
- [ ] Database migrations tested locally
- [ ] Secrets generated (JWT_SECRET, COOKIE_SECRET)

### Beta Deployment

1. [ ] Supabase project created
2. [ ] Database connection strings obtained
3. [ ] Storage bucket created
4. [ ] Render service created with env vars
5. [ ] Database migrated to Supabase
6. [ ] Vercel project created with env vars
7. [ ] Health check passing: `GET /health`
8. [ ] Web app loads correctly
9. [ ] Authentication flow works
10. [ ] Basic CRUD operations work

### Post-Deployment

- [ ] Monitor Render logs for errors
- [ ] Check Supabase database metrics
- [ ] Verify CORS is working correctly
- [ ] Test from multiple browsers/devices

---

## Troubleshooting

### Common Issues

**1. CORS Errors**

```
Access to XMLHttpRequest blocked by CORS policy
```

- Verify `CORS_ORIGIN` includes your web app URL
- Check for trailing slashes (remove them)
- Ensure cookies are configured correctly (`credentials: true`)

**2. Database Connection Failed**

```
Can't reach database server
```

- Check `DATABASE_URL` format is correct
- For Supabase: Use pooled connection (port 6543)
- Verify IP is not blocked (Supabase allows all by default)

**3. Prisma Migration Errors**

```
Prisma Migrate could not create the shadow database
```

- Use `DIRECT_URL` for migrations (not pooled connection)
- Ensure you have database creation permissions

**4. JWT/Cookie Issues**

```
Unauthorized / Token invalid
```

- Verify `JWT_SECRET` is the same across deployments
- Check cookie domain settings
- Ensure `withCredentials: true` in API client

**5. Build Failures on Render**

```
Build failed
```

- Check Node.js version (should be 18+)
- Verify `pnpm-lock.yaml` is committed
- Check for missing dependencies

---

## Security Notes

1. **Never commit secrets** - Use environment variables
2. **Generate strong secrets** - Use `openssl rand -base64 32`
3. **Rotate secrets regularly** - Especially after team changes
4. **Use HTTPS only** - Vercel and Render provide this by default
5. **Restrict CORS origins** - Only allow your web app domains

---

## URLs Reference

### Beta Environment

| Service    | URL                                             |
| ---------- | ----------------------------------------------- |
| Web        | `https://worksite-beta.vercel.app`              |
| API        | `https://worksite-api-beta.onrender.com`        |
| API Health | `https://worksite-api-beta.onrender.com/health` |
| Supabase   | `https://xxx.supabase.co`                       |

### Stage Environment

| Service | URL                                       |
| ------- | ----------------------------------------- |
| Web     | `https://worksite-stage.vercel.app`       |
| API     | `https://worksite-api-stage.onrender.com` |

### Production

| Service | URL                                        |
| ------- | ------------------------------------------ |
| Web     | `https://app.worksite.com` (custom domain) |
| API     | `https://api.worksite.com` (custom domain) |

---

## Related Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
