# Release Workflow

> Simple guide for developing features and releasing them to production.

---

## Environments

| Env   | Branch  | Web URL                          | API URL                              | Purpose          |
| ----- | ------- | -------------------------------- | ------------------------------------ | ---------------- |
| Beta  | `beta`  | worksite-beta.vercel.app         | worksite-api-beta.onrender.com       | Internal testing |
| Stage | `stage` | worksite-stage.vercel.app        | worksite-api-stage.onrender.com      | QA / UAT         |
| Prod  | `main`  | app.worksite.com                 | api.worksite.com                     | Live users       |

---

## Branch Rules

| Branch       | Purpose                  | Protection                          |
| ------------ | ------------------------ | ----------------------------------- |
| `main`       | Production code          | PR required + 1 approval            |
| `stage`      | Staging / QA             | PR required                         |
| `beta`       | Internal testing         | PR preferred, direct push allowed   |
| `feature/*`  | Your work                | Branch from `main`                  |
| `hotfix/*`   | Urgent production fixes  | Branch from `main`, merge to all    |

---

## Feature Development (Step by Step)

### Step 1: Start Feature

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Step 2: Develop & Push

```bash
# Make changes, commit often
git add .
git commit -m "feat: add export button"
git push -u origin feature/your-feature-name
```

### Step 3: Deploy to Beta

1. Go to GitHub
2. Create PR: `feature/your-feature-name` → `beta`
3. Get review (optional) → Merge
4. Wait for auto-deploy (~2 min)
5. Test on: **worksite-beta.vercel.app**

### Step 4: Promote to Stage

1. Create PR: `beta` → `stage`
2. Get QA sign-off → Merge
3. Wait for auto-deploy
4. Test on: **worksite-stage.vercel.app**

### Step 5: Release to Prod

1. Create PR: `stage` → `main`
2. Get approval → Merge
3. Monitor: Render logs + Supabase dashboard

---

## Visual Flow

```
┌─────────────┐     PR      ┌──────────┐     PR      ┌──────────┐     PR      ┌──────────┐
│  feature/*  │ ──────────▶ │   beta   │ ──────────▶ │  stage   │ ──────────▶ │   main   │
│  (your work)│             │ (testing)│             │   (QA)   │             │  (prod)  │
└─────────────┘             └──────────┘             └──────────┘             └──────────┘
                                 │                        │                        │
                                 ▼                        ▼                        ▼
                            Auto-deploy              Auto-deploy              Auto-deploy
                            to Beta env              to Stage env             to Production
```

---

## Quick Commands

```bash
# Start new feature
git checkout main && git pull && git checkout -b feature/my-feature

# See what branch you're on
git branch

# Push and create PR
git push -u origin feature/my-feature
# Then go to GitHub and create PR

# Sync your feature branch with latest main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# If rebase has conflicts
git rebase --abort  # to cancel
# or fix conflicts, then:
git add .
git rebase --continue
```

---

## Database Migrations

Migrations run **automatically** on deploy via Render build command.

**For manual migrations** (if needed):

```bash
cd apps/api

# For beta
DATABASE_URL="beta-pooled-url" DIRECT_URL="beta-direct-url" pnpm db:migrate:prod

# For stage
DATABASE_URL="stage-pooled-url" DIRECT_URL="stage-direct-url" pnpm db:migrate:prod

# For prod
DATABASE_URL="prod-pooled-url" DIRECT_URL="prod-direct-url" pnpm db:migrate:prod
```

---

## Hotfix Process

For urgent production bugs:

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-login-crash

# 2. Fix the issue, commit
git add .
git commit -m "fix: resolve login crash on iOS"

# 3. Create PRs to ALL branches
#    hotfix/fix-login-crash → main (priority)
#    hotfix/fix-login-crash → stage
#    hotfix/fix-login-crash → beta
```

---

## Rollback

If something goes wrong in production:

### Web (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the project
3. Go to Deployments
4. Find the last working deployment
5. Click "..." → "Promote to Production"

### API (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select the service
3. Go to Events
4. Find the last working deploy
5. Click "Rollback to this deploy"

---

## Storybook

| Environment | URL                              |
| ----------- | -------------------------------- |
| Local       | `pnpm storybook` → localhost:6006 |
| Hosted      | storybook.worksite.app           |

---

## Checklist Before Merging to Prod

- [ ] Feature tested on beta
- [ ] QA approved on stage
- [ ] No console errors
- [ ] API tests passing (`pnpm test`)
- [ ] Types passing (`pnpm typecheck`)
- [ ] Database migrations tested (if any)

---

## Need Help?

- **Deployment issues**: Check Render/Vercel logs
- **Database issues**: Check Supabase dashboard
- **Code questions**: Ask in team Slack channel

---

## Related Docs

- [Deployment Guide](./DEPLOYMENT.md) - Full deployment setup
- [API Documentation](./API.md) - API endpoints
- [Database Schema](./DATABASE.md) - Data models
