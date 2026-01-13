---
description: Workflow for creating a new feature end-to-end
---

# Feature Creation Workflow

Follow these 10 steps to implement a new feature in Worksite.

## Workflow Steps

1. **Define Types**: Create Zod schemas in `packages/types/src`.
2. **Database Models**: Add or update Prisma models in `apps/api/prisma/schema.prisma` if needed.
   // turbo
3. **Run Migrations**: Run `npx prisma migrate dev` to update the database.
4. **API Routes**: Create new routes in `apps/api/src/routes`.
5. **Business Logic**: Implement services in `apps/api/src/services`.
6. **Shared Data Hooks**: Create TanStack Query hooks in `packages/data/src`.
7. **Mobile Screen**: Implement the screen in `apps/mobile/app` using NativeWind.
8. **Web Page**: Implement the page in `apps/web/src` using Tailwind + shadcn/ui.
   // turbo
9. **Generate Docs**: Run `pnpm docs:generate` to update documentation.
10. **Self-Review**: Perform a self-review based on `core.md` and `security.md` rules.
