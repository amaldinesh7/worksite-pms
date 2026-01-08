# Database Schema

> Last updated: 2026-01-09
> Source: `apps/api/prisma/schema.prisma`

---

## Overview

Multi-tenant construction project management system with organization-scoped data.

```
Organization (tenant)
├── Users (via OrganizationMember)
├── Projects
│   ├── Stages
│   ├── Documents (with compression metadata)
│   ├── Expenses
│   └── Payments
├── Parties (vendors, labour, subcontractors)
└── Categories (project types, expense types, etc.)
```

---

## Enums

### OrganizationRole

```prisma
enum OrganizationRole {
  ADMIN
  MANAGER
  ACCOUNTANT
}
```

### PartyType

```prisma
enum PartyType {
  VENDOR
  LABOUR
  SUBCONTRACTOR
}
```

---

## Models

### Organization

| Field       | Type     | Attributes           |
| ----------- | -------- | -------------------- |
| `id`        | String   | @id @default(cuid()) |
| `name`      | String   | -                    |
| `createdAt` | DateTime | @default(now())      |

**Relations:** members, projects, categoryTypes, categoryItems, parties, expenses, payments, documents, stages

---

### User

| Field       | Type     | Attributes           |
| ----------- | -------- | -------------------- |
| `id`        | String   | @id @default(cuid()) |
| `name`      | String   | -                    |
| `phone`     | String   | @unique              |
| `createdAt` | DateTime | @default(now())      |

**Relations:** memberships (OrganizationMember[])

---

### OrganizationMember

| Field            | Type             | Attributes           |
| ---------------- | ---------------- | -------------------- |
| `id`             | String           | @id @default(cuid()) |
| `organizationId` | String           | -                    |
| `userId`         | String           | -                    |
| `role`           | OrganizationRole | -                    |
| `createdAt`      | DateTime         | @default(now())      |

**Constraints:** @@unique([organizationId, userId])

---

### Project

| Field               | Type     | Attributes           |
| ------------------- | -------- | -------------------- |
| `id`                | String   | @id @default(cuid()) |
| `organizationId`    | String   | -                    |
| `name`              | String   | -                    |
| `clientName`        | String   | -                    |
| `location`          | String   | -                    |
| `startDate`         | DateTime | -                    |
| `projectTypeItemId` | String   | FK to CategoryItem   |
| `createdAt`         | DateTime | @default(now())      |

**Relations:** stages, expenses, payments, documents

---

### Stage

| Field            | Type     | Attributes           |
| ---------------- | -------- | -------------------- |
| `id`             | String   | @id @default(cuid()) |
| `organizationId` | String   | -                    |
| `projectId`      | String   | -                    |
| `name`           | String   | -                    |
| `budgetAmount`   | Decimal  | @db.Decimal(15, 2)   |
| `createdAt`      | DateTime | @default(now())      |

**Constraints:** @@unique([projectId, name])

---

### Document

| Field            | Type     | Attributes           | Description                     |
| ---------------- | -------- | -------------------- | ------------------------------- |
| `id`             | String   | @id @default(cuid()) | -                               |
| `organizationId` | String   | -                    | Tenant ID                       |
| `projectId`      | String   | -                    | Parent project                  |
| `fileName`       | String   | -                    | Display name                    |
| `fileType`       | String   | -                    | Extension (pdf, jpg, etc.)      |
| `fileUrl`        | String   | -                    | Public URL                      |
| `storagePath`    | String   | -                    | Path in storage bucket          |
| `mimeType`       | String   | -                    | Detected MIME type              |
| `originalSize`   | Int      | -                    | Size before compression (bytes) |
| `compressedSize` | Int      | -                    | Size after compression (bytes)  |
| `uploadedAt`     | DateTime | @default(now())      | -                               |

**Indexes:** organizationId, projectId

---

### Party

| Field            | Type      | Attributes                    |
| ---------------- | --------- | ----------------------------- |
| `id`             | String    | @id @default(cuid())          |
| `organizationId` | String    | -                             |
| `name`           | String    | -                             |
| `phone`          | String?   | -                             |
| `type`           | PartyType | VENDOR, LABOUR, SUBCONTRACTOR |
| `createdAt`      | DateTime  | @default(now())               |

---

### CategoryType

| Field            | Type     | Attributes                           |
| ---------------- | -------- | ------------------------------------ |
| `id`             | String   | @id @default(cuid())                 |
| `organizationId` | String   | -                                    |
| `key`            | String   | project_type, expense_category, etc. |
| `label`          | String   | Display name                         |
| `isActive`       | Boolean  | @default(true)                       |
| `createdAt`      | DateTime | @default(now())                      |
| `updatedAt`      | DateTime | @updatedAt                           |

**Constraints:** @@unique([organizationId, key])

---

### CategoryItem

| Field            | Type     | Attributes           |
| ---------------- | -------- | -------------------- |
| `id`             | String   | @id @default(cuid()) |
| `organizationId` | String   | -                    |
| `categoryTypeId` | String   | -                    |
| `name`           | String   | -                    |
| `isActive`       | Boolean  | @default(true)       |
| `createdAt`      | DateTime | @default(now())      |
| `updatedAt`      | DateTime | @updatedAt           |

**Constraints:** @@unique([categoryTypeId, name])

---

### Expense

| Field                   | Type     | Attributes                |
| ----------------------- | -------- | ------------------------- |
| `id`                    | String   | @id @default(cuid())      |
| `organizationId`        | String   | -                         |
| `projectId`             | String   | -                         |
| `partyId`               | String   | -                         |
| `stageId`               | String?  | Optional stage            |
| `expenseCategoryItemId` | String   | -                         |
| `materialTypeItemId`    | String?  | -                         |
| `labourTypeItemId`      | String?  | -                         |
| `subWorkTypeItemId`     | String?  | -                         |
| `amount`                | Decimal  | @db.Decimal(15, 2)        |
| `expenseDate`           | DateTime | -                         |
| `paymentMode`           | String   | Cash, Bank Transfer, etc. |
| `notes`                 | String?  | @db.Text                  |
| `createdAt`             | DateTime | @default(now())           |

---

### Payment

| Field            | Type     | Attributes           |
| ---------------- | -------- | -------------------- |
| `id`             | String   | @id @default(cuid()) |
| `organizationId` | String   | -                    |
| `projectId`      | String   | -                    |
| `partyId`        | String?  | Optional party       |
| `amount`         | Decimal  | @db.Decimal(15, 2)   |
| `paymentDate`    | DateTime | -                    |
| `notes`          | String?  | @db.Text             |
| `createdAt`      | DateTime | @default(now())      |

---

## Migrations

Run migrations:

```bash
cd apps/api
npx prisma migrate dev --name description_of_change
```

Reset database (development only):

```bash
npx prisma migrate reset
```

Generate client:

```bash
npx prisma generate
```
