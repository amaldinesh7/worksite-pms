# Backend Rules

Backend-specific rules for the Fastify API (apps/api).

## Framework & Logic

- **Fastify Plugins**: Use plugins for organizing routes and logic.
- **Prisma**: Mandatory for all database access.
- **No Raw SQL**: Use Prisma client ONLY.
- **Zod**: Use for all request and response validation.
- **Services**: Business logic must reside in service files.
- **Repositories**: Database access logic must reside in repository files.

## Testing (REQUIRED)

- **Vitest**: Use for all unit and integration tests.
- **Test Coverage**: Every new endpoint MUST have an associated test.
- **Fastify inject()**: Use `app.inject()` for testing routes without starting the full server.
- **Helper**: Use `createTestApp()` helper from `src/tests/helper.ts`.

## API Patterns

- Return data in a `{ data: ... }` wrapper.
- Handle errors with appropriate HTTP status codes.
- Use `fastify.log` for logging.
