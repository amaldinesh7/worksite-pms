# Worksite - AI Agents & Dynamic Context

> **This file is the source of truth for AI context that changes over time.**
> Update this when: adding packages, creating patterns, defining new agents.

---

## Tool Registry

When you add a new npm package, add it here so the AI knows how to use it.

```yaml
tools:
  # ============================================
  # UI / Styling (Hybrid Architecture)
  # ============================================
  - name: '@worksite/ui'
    version: '1.0.0'
    context: Design tokens - SINGLE SOURCE OF TRUTH for all styling
    rules: |
      - ALL design tokens defined in packages/ui/src/tokens.ts
      - rawColors: Color palette from Figma (neutral, teal, red, etc.)
      - semanticColors: Light/dark mode semantic mappings
      - Web: CSS variables in globals.css derived from tokens.ts
      - Mobile: tailwind.config.js imports tailwindTheme from tokens.ts
      - Focus rings: ring (default), ring-primary (interactive), ring-error (error)
      - Primary color = teal.800 (#115e59) for brand/buttons
    examples: packages/ui/src/tokens.ts
    docs: See .cursor/rules/tailwind-v4.mdc

  - name: tailwindcss
    version: '^4.1.0'
    context: Tailwind CSS v4.1 - CSS-first configuration
    rules: |
      - Use @theme directive in CSS for theme configuration (NOT JS)
      - Web tailwind.config.js should only have: content, plugins
      - Define CSS variables in @layer base { :root { } }
      - Map to utilities in @theme { --color-*: var(--*); }
      - Focus rings: ring-ring (default), ring-ring-primary (teal), ring-ring-error (red)
      - See .cursor/rules/tailwind-v4.mdc for full guide
    examples: apps/web/src/styles/globals.css
    docs: https://tailwindcss.com/docs/theme

  - name: nativewind
    version: '^4.1.23'
    context: Tailwind CSS for React Native (mobile styling)
    rules: |
      - Use for ALL mobile styling in apps/mobile
      - Same class names as web Tailwind
      - Import global.css in _layout.tsx
      - Use className prop on RN components
    examples: apps/mobile/app/**/*
    docs: https://www.nativewind.dev

  - name: shadcn/ui
    version: 'latest'
    context: Copy-paste React components for web
    rules: |
      - Components live in apps/web/src/components/ui/
      - Install new components: cd apps/web && npx shadcn@latest add [component]
      - Use cn() helper from @/lib/utils for conditional classes
      - Customize variants in component files using CSS variables
      - NEVER use on mobile - web only
      - Check .cursor/rules/shadcn-usage.mdc for component list
      - Config file: apps/web/components.json
    examples: apps/web/src/components/ui/**/*
    docs: https://ui.shadcn.com/docs/components

  # ============================================
  # State Management
  # ============================================
  - name: '@tanstack/react-query'
    version: '^5.62.11'
    context: Server state management (data fetching, caching)
    rules: |
      - Use for ALL server data fetching
      - Define query keys in a central constants file
      - Use useQuery for reads, useMutation for writes
      - Configure staleTime based on data freshness needs
    examples: apps/*/src/hooks/queries/**/*
    docs: https://tanstack.com/query

  - name: zustand
    version: '^5.0.0'
    context: Client state management (UI state, user preferences)
    rules: |
      - Use ONLY for client-side state (not server data)
      - Keep stores small and focused
      - Use selectors to prevent unnecessary re-renders
      - Persist user preferences with zustand/middleware
    examples: apps/*/src/stores/**/*
    docs: https://zustand.docs.pmnd.rs

  # ============================================
  # Forms & Validation
  # ============================================
  - name: react-hook-form
    version: '^7.54.0'
    context: Form state management
    rules: |
      - Use with Zod for validation
      - Define form types from Zod schemas
      - Use Controller for custom inputs
    examples: apps/*/src/components/forms/**/*
    docs: https://react-hook-form.com

  - name: zod
    version: '^3.24.1'
    context: Schema validation and TypeScript type inference
    rules: |
      - Define ALL API schemas in packages/types
      - Use z.infer<typeof Schema> for TypeScript types
      - Validate ALL user input
      - Share schemas between frontend and backend
    examples: packages/types/src/**/*
    docs: https://zod.dev

  # ============================================
  # Backend
  # ============================================
  - name: fastify
    version: '^5.2.2'
    context: Backend API framework
    rules: |
      - Use TypeBox or Zod for request/response schemas
      - Register plugins in separate files
      - Use fastify.log for logging
      - Handle errors with setErrorHandler
    examples: apps/api/src/**/*
    docs: https://fastify.dev

  - name: prisma
    version: '^6.1.0'
    context: Database ORM for PostgreSQL
    rules: |
      - Always use transactions for multiple operations
      - Define all models in schema.prisma
      - Use select to limit returned fields
      - Never expose internal IDs to clients
    examples: apps/api/prisma/**/*
    docs: https://prisma.io/docs

  # ============================================
  # Mobile
  # ============================================
  - name: expo
    version: '~52.0.23'
    context: React Native development platform
    rules: |
      - Use expo-router for navigation
      - Use expo-* packages when available
      - Test on both iOS and Android
    docs: https://docs.expo.dev

  - name: expo-router
    version: '~4.0.15'
    context: File-based routing for React Native
    rules: |
      - Files in app/ directory are routes
      - Use _layout.tsx for layouts
      - Use [...path].tsx for catch-all routes
    examples: apps/mobile/app/**/*
    docs: https://expo.github.io/router

  # ============================================
  # Testing
  # ============================================
  - name: vitest
    version: '^4.0.16'
    context: Fast unit and integration testing for API
    rules: |
      - Use for ALL API endpoint tests
      - Every new endpoint MUST have a test
      - Use app.inject() for testing routes (no server startup)
      - Test both success and error cases
      - Use createTestApp() helper from src/tests/helper.ts
    examples: apps/api/src/**/*.test.ts
    docs: https://vitest.dev

  # ============================================
  # Code Review
  # ============================================
  - name: coderabbit-cli
    version: '0.3.5'
    context: AI-powered code review before commits
    rules: |
      - Run `coderabbit --prompt-only` for AI agent integration
      - Use `--type uncommitted` for reviewing only staged/unstaged changes
      - Use `--base main` if comparing against main branch
      - Fix critical and high priority issues before committing
      - Run review loop max 2 times to avoid infinite iterations
      - Config file: .coderabbit.yaml in project root
    examples: .cursor/rules/coderabbit-review.mdc
    docs: https://docs.coderabbit.ai/cli/overview

  # ============================================
  # File Compression
  # ============================================
  - name: sharp
    version: '^0.34.5'
    context: High-performance image compression
    rules: |
      - Use for all image processing (JPEG, PNG, WebP)
      - Resize images > 2000px to reduce size
      - Convert PNG to WebP for better compression
      - Quality 80% is good balance of size/quality
    examples: apps/api/src/services/compression.service.ts
    docs: https://sharp.pixelplumbing.com

  - name: pdf-lib
    version: '^1.17.1'
    context: PDF manipulation and compression
    rules: |
      - Use for PDF metadata removal
      - Enable object streams for better compression
      - Handle encrypted PDFs gracefully
    examples: apps/api/src/services/compression.service.ts
    docs: https://pdf-lib.js.org
```

---

## Specialized Agents

Use these prefixes to get focused assistance:

### @architect

**Role**: System design and architecture decisions
**Context**: Full codebase structure, tech stack, scaling, security
**Use when**: Designing features, making architectural decisions, planning refactors

```
@architect Should we use WebSockets or polling for real-time features?
@architect Design the authentication flow for mobile and web
@architect How should we structure the notification system?
```

### @frontend

**Role**: UI development with hybrid architecture (Tailwind + shadcn for web, NativeWind for mobile)
**Context**: Component design, styling, responsiveness, accessibility, platform-specific UI
**Use when**: Building UI components, fixing styling issues, creating animations

```
@frontend Create a responsive card component for user profiles (web)
@frontend Build a native-feeling list component (mobile)
@frontend Add loading states to the feed component
```

### @backend

**Role**: API development with Fastify
**Context**: API endpoints, business logic, database queries, authentication
**Use when**: Creating endpoints, handling requests, implementing business logic

```
@backend Create a paginated GET /api/posts endpoint
@backend Add rate limiting to authentication routes
@backend Implement soft delete for user accounts
```

### @mobile

**Role**: React Native / Expo specialist
**Context**: Mobile-specific features, native modules, platform differences
**Use when**: Mobile navigation, native features, platform-specific code

```
@mobile Implement push notifications with Expo
@mobile Add biometric authentication
@mobile Fix the keyboard avoiding view on the login screen
```

### @web

**Role**: Web-specific development
**Context**: Browser APIs, SSR, SEO, web performance
**Use when**: Web-only features, browser compatibility, PWA features

```
@web Add service worker for offline support
@web Implement SEO meta tags
@web Fix hydration mismatch in the header
```

### @database

**Role**: Database and Prisma specialist
**Context**: Schema design, queries, migrations, performance
**Use when**: Designing schemas, writing complex queries, optimizing performance

```
@database Design the schema for a multi-tenant system
@database Optimize the posts feed query
@database Add a migration for the new comments feature
```

### @reviewer

**Role**: Code review specialist using CodeRabbit CLI
**Context**: Security, performance, best practices, code quality
**Use when**: Before committing, before creating PRs, after implementing features

```
@reviewer Review my uncommitted changes and fix critical issues
@reviewer Run a full code review against main branch before PR
@reviewer Check this feature implementation for security vulnerabilities
```

**Workflow:**

1. Run `coderabbit --prompt-only --type uncommitted`
2. Evaluate findings (critical > high > medium > low)
3. Fix critical and high priority issues
4. Run CodeRabbit again to verify
5. Stop after 2 iterations if no critical issues remain

---

## Project Patterns

### feature_creation

**Workflow for creating new features end-to-end:**

```yaml
steps:
  1. Types: Define Zod schemas in packages/types
  2. Database: Add Prisma models if needed (npx prisma migrate dev)
  3. API: Create routes in apps/api/src/routes
  4. Services: Business logic in apps/api/src/services
  5. Hooks: TanStack Query hooks in packages/data
  6. Mobile: Screens in apps/mobile/app (NativeWind styling)
  7. Web: Pages in apps/web/src (Tailwind + shadcn/ui)
  8. Docs: Run `pnpm docs:generate`
```

**Note**: UI components are platform-specific. Share business logic via `@worksite/data` hooks, not UI components.

### form_pattern

**Standard form implementation:**

```typescript
// 1. Define schema in packages/types
import { z } from 'zod';
export const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

// 2. Use in WEB component (shadcn/ui + Tailwind)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostSchema, type CreatePostInput } from '@worksite/types';
import { Button } from '@/components/ui/button';

function CreatePostForm() {
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <input {...form.register('title')} placeholder="Title" className="border rounded-md p-2" />
      <textarea {...form.register('content')} placeholder="Content" className="border rounded-md p-2" />
      <Button type="submit">Create</Button>
    </form>
  );
}

// 3. Use in MOBILE component (NativeWind)
import { View, TextInput, Pressable, Text } from 'react-native';

function CreatePostForm() {
  // Same useForm hook...
  return (
    <View className="flex-col gap-3">
      <TextInput placeholder="Title" className="border border-border rounded-md p-2" />
      <TextInput placeholder="Content" className="border border-border rounded-md p-2" multiline />
      <Pressable className="bg-primary rounded-md p-3">
        <Text className="text-white text-center font-semibold">Create</Text>
      </Pressable>
    </View>
  );
}
```

### api_pattern

**Standard API endpoint structure:**

```typescript
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export default async function (fastify: FastifyInstance) {
  // GET /posts - List
  fastify.get('/posts', async (request, reply) => {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: posts };
  });

  // POST /posts - Create
  fastify.post('/posts', async (request, reply) => {
    const body = CreatePostSchema.parse(request.body);
    const post = await prisma.post.create({ data: body });
    return reply.code(201).send({ data: post });
  });
}
```

### data_fetching_pattern

**TanStack Query usage:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Query keys (define centrally)
export const queryKeys = {
  posts: ['posts'] as const,
  post: (id: string) => ['posts', id] as const,
};

// Read hook
export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: () => api.get('/posts').then((r) => r.data),
  });
}

// Write hook with cache invalidation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => api.post('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
}
```

### api_test_pattern

**Standard API endpoint test (REQUIRED for every new endpoint):**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp } from '../tests/helper';
import type { FastifyInstance } from 'fastify';

describe('POST /api/resource', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // SUCCESS CASE - verify response shape
  it('creates resource and returns expected shape', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/resource',
      payload: { name: 'test' },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      data: { id: expect.any(String), name: 'test' },
    });
  });

  // ERROR CASE - verify error handling
  it('returns 400 for invalid input', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/resource',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });
});
```

### hybrid_ui_pattern

**Creating consistent UI across platforms:**

```typescript
// 1. Use shared tokens for design consistency
// packages/tokens/src/colors.ts defines the palette
// Both platforms use the same Tailwind config

// 2. WEB component (apps/web/src/components/ui/card.tsx)
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      {children}
    </div>
  );
}

// 3. MOBILE component (apps/mobile/components/Card.tsx)
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className}`} {...props}>
      {children}
    </View>
  );
}

// Same visual result, platform-native behavior!
```

**Key principle**: Same class names (`bg-primary`, `rounded-lg`, `p-4`) work on both platforms because they share the same Tailwind config from `@worksite/ui/tokens`.

### code_review_pattern

**CodeRabbit CLI review workflow (before commits/PRs):**

```bash
# Step 1: Review uncommitted changes
coderabbit --prompt-only --type uncommitted

# Step 2: If comparing against specific branch
coderabbit --prompt-only --base main --type all

# Step 3: After fixing issues, verify
coderabbit --prompt-only --type uncommitted
```

**AI Agent Integration Prompt:**

```
Implement [feature] and then run coderabbit --prompt-only.
Let it run in the background and fix any critical or high priority issues.
Run CodeRabbit again to verify fixes.
Only run the loop twice - if no critical issues remain, you're done.
Give me a summary of what was completed.
```

**Priority Handling:**

- **Critical**: Fix immediately (security, data loss, crashes)
- **High**: Fix before commit (memory leaks, race conditions)
- **Medium**: Fix if time permits (best practices)
- **Low**: Ignore unless pattern is widespread (style nits)

---

## Update Log

Keep track of significant changes to help AI understand project evolution.

```yaml
updates:
  - date: '2026-01-27'
    change: 'Migrated to Tailwind CSS v4.1 with single source of truth'
    details: |
      - tokens.ts is now the SINGLE SOURCE OF TRUTH for design tokens
      - Added rawColors (from Figma) and semanticColors (light/dark mode)
      - Web uses CSS-first config via @theme directive in globals.css
      - Mobile uses tailwindTheme export from tokens.ts
      - Added focus ring variants: ring, ring-primary (teal.500), ring-error
      - Primary color = teal.800 (#115e59) for brand, not text color
      - Created .cursor/rules/tailwind-v4.mdc for AI context
      - Simplified web tailwind.config.js (removed theme.extend)
  - date: '2026-01-10'
    change: 'Added shadcn/ui CLI configuration and Cursor rules'
    details: |
      - Created apps/web/components.json for shadcn CLI
      - Created .cursor/rules/shadcn-usage.mdc with component guide
      - AI will now prioritize shadcn components when building frontend
      - Install components: cd apps/web && npx shadcn@latest add [component]
  - date: '2026-01-09'
    change: 'Migrated to hybrid UI architecture'
    details: |
      Replaced Tamagui with platform-specific styling:
      - Web: Tailwind CSS + shadcn/ui
      - Mobile: NativeWind (Tailwind for RN)
      - Shared: @worksite/ui/tokens for design tokens
      UI components are now platform-specific.
  - date: '2026-01-09'
    change: 'Added CodeRabbit CLI integration'
    details: 'AI-powered code review before commits. Use "coderabbit --prompt-only" for automated review loops.'
  - date: '2026-01-09'
    change: 'Added file compression system'
    details: 'Documents API with Sharp (images), pdf-lib (PDFs), adm-zip (Office docs). Storage via MinIO/Supabase.'
  - date: '2026-01-07'
    change: 'Added API testing with Vitest'
    details: 'Minimal test setup with Vitest + Fastify inject(). Every new endpoint needs a test.'
  - date: '2026-01-07'
    change: 'Initial project setup'
    details: 'Created monorepo with mobile, web, and API apps'
```

---

## How to Update This File

### When Adding a New Tool

1. Install the package: `pnpm add package-name`
2. Add entry to Tool Registry above with:
   - `name`: Package name
   - `version`: Version from package.json
   - `context`: What it's for
   - `rules`: How to use it in THIS project
   - `examples`: Where to find usage examples
   - `docs`: Link to official docs
3. Tell AI: "I added [package], please read agents.md"

### When Creating a New Pattern

1. Add to Project Patterns section
2. Include example code
3. Reference in feature creation workflow if applicable

### When Making Significant Changes

1. Add entry to Update Log
2. Update any affected tool rules
3. Run `pnpm docs:generate` to update auto-docs
