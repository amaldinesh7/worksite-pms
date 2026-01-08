# Worksite - AI Agents & Dynamic Context

> **This file is the source of truth for AI context that changes over time.**
> Update this when: adding packages, creating patterns, defining new agents.

---

## Tool Registry

When you add a new npm package, add it here so the AI knows how to use it.

```yaml
tools:
  # ============================================
  # UI / Components
  # ============================================
  - name: tamagui
    version: '^1.112.21'
    context: Universal UI components for mobile and web
    rules: |
      - ALWAYS use from @worksite/ui, not directly
      - ALWAYS use theme tokens ($primary, $background, $4)
      - NEVER use View, Text, TouchableOpacity directly
      - NEVER use div, span, button directly
      - Support dark mode automatically with tokens
    examples: packages/ui/src/components/**/*
    docs: https://tamagui.dev

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

**Role**: UI development with Tamagui
**Context**: Component design, styling, responsiveness, accessibility
**Use when**: Building UI components, fixing styling issues, creating animations

```
@frontend Create a responsive card component for user profiles
@frontend Fix the dark mode styling on the settings screen
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
  5. Hooks: TanStack Query hooks in apps/*/hooks
  6. UI: Shared components in packages/ui (if reusable)
  7. Mobile: Screens in apps/mobile/app
  8. Web: Pages in apps/web/src
  9. Docs: Run `pnpm docs:generate`
```

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

// 2. Use in component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostSchema, type CreatePostInput } from '@worksite/types';

function CreatePostForm() {
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
  });

  const onSubmit = async (data: CreatePostInput) => {
    await createPost(data);
  };

  return (
    <YStack gap="$3">
      <Input {...form.register('title')} placeholder="Title" />
      <TextArea {...form.register('content')} placeholder="Content" />
      <Button onPress={form.handleSubmit(onSubmit)}>Create</Button>
    </YStack>
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

---

## Update Log

Keep track of significant changes to help AI understand project evolution.

```yaml
updates:
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
