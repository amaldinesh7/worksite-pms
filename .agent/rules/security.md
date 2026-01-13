# Security Rules

Absolute "don'ts" and security guidelines.

## Core Rules

- **No Secrets in Git**: NEVER commit `.env` files or hardcode secrets.
- **Input Validation**: ALWAYS validate all user inputs using Zod.
- **Database Safety**: Use Prisma to prevent SQL injection.
- **Authentication**: Respect organization and project boundaries for data access.
- **Privacy**: Never expose internal IDs (like database auto-increment IDs) to clients; use UUIDs or CUIDs.
