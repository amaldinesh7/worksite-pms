# Database Schema

> Auto-generated from `apps/api/prisma/schema.prisma`
> Last generated: 2026-01-07T14:34:40.482Z

---

### User

| Field       | Type       | Attributes           |
| ----------- | ---------- | -------------------- |
| `id`        | `String`   | @id @default(cuid()) |
| `email`     | `String`   | @unique              |
| `name`      | `String?`  | -                    |
| `createdAt` | `DateTime` | @default(now())      |
