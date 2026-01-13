# Core Rules

This file defines global coding styles, architecture guidelines, and standards for the Worksite project.

## Language & Style

- **TypeScript ONLY**: Use strict mode for all files.
- **Functional Components**: Use functional components and hooks ONLY (no class components).
- **Composition**: Prefer composition over inheritance.
- **Variables**: Use `const` by default. Minimize `let`, and NEVER use `var`.
- **Async/Await**: Use `async/await` for all asynchronous operations (avoid `.then`).
- **Error Handling**: Use explicit `try/catch` blocks for error handling.
- **No `any`**: Strictly no `any` types. Use proper types or `unknown` if necessary.
- **No Side Effects**: No side effects in the render phase of components.
- **Pure Functions**: Prefer pure, testable functions for business logic.

## File Size & Modularity (CRITICAL)

- **Soft limit**: 200 lines per file.
- **Hard rule**: No monolithic screens or components.
- **Extraction**: If a file grows beyond the limit, extract:
  - Hooks
  - UI components
  - Utilities
- **Separation**: UI logic, data logic, and layout MUST be separated.

## Architecture Rules

- **UI Components**: Presentational ONLY.
- **Business Logic**: Must reside in hooks or services.
- **API Calls**: Use React Query hooks ONLY.
- **Screens**: Composition layer for components and hooks.
- **NO API calls inside JSX**.
- **NO business logic inside render**.
- **NO data mutation inside components**.

## Import Order (MANDATORY)

```ts
// 1. React / Expo
import { useEffect } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Workspace packages
import type { Project } from '@worksite/types';

// 4. App absolute imports
import { Button } from '@/components/ui/button';

// 5. Relative imports
import { useProjects } from '../hooks/useProjects';

// 6. Types (if not already imported)
import type { Props } from './types';
```

## AI Instructions

- Consistency > Cleverness.
- Follow existing patterns.
- Reference real files for context.
- Keep solutions boring, explicit, and maintainable.
