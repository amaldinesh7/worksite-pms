# Database Schema

> Auto-generated from `apps/api/prisma/schema.prisma`
> Last generated: 2026-01-17T20:41:14.017Z

---

### Organization

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `name` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `members` | `OrganizationMember[]` | - |
| `projects` | `Project[]` | - |
| `categoryTypes` | `CategoryType[]` | - |
| `categoryItems` | `CategoryItem[]` | - |
| `parties` | `Party[]` | - |
| `expenses` | `Expense[]` | - |
| `payments` | `Payment[]` | - |
| `documents` | `Document[]` | - |
| `stages` | `Stage[]` | - |
| `attachments` | `Attachment[]` | - |

### User

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `name` | `String` | - |
| `phone` | `String?` | @unique |
| `email` | `String?` | @unique |
| `createdAt` | `DateTime` | @default(now()) |
| `memberships` | `OrganizationMember[]` | - |
| `refreshTokens` | `RefreshToken[]` | - |
| `party` | `Party?` | - |

### OtpVerification

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `phone` | `String` | - |
| `code` | `String` | // hashed OTP |
| `expiresAt` | `DateTime` | - |
| `attempts` | `Int` | @default(0) |
| `verified` | `Boolean` | @default(false) |
| `createdAt` | `DateTime` | @default(now()) |

### RefreshToken

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `userId` | `String` | - |
| `token` | `String` | @unique |
| `expiresAt` | `DateTime` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `user` | `User` | @relation(fields: [userId], references: [id], onDelete: Cascade) |

### OrganizationMember

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `userId` | `String` | - |
| `role` | `OrganizationRole` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `user` | `User` | @relation(fields: [userId], references: [id], onDelete: Cascade) |
| `projectAccess` | `ProjectAccess[]` | - |

### ProjectAccess

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `memberId` | `String` | - |
| `projectId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `member` | `OrganizationMember` | @relation(fields: [memberId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |

### CategoryType

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `key` | `String` | // project_type | expense_category | material_type | labour_type | sub_work_type |
| `label` | `String` | - |
| `isActive` | `Boolean` | @default(true) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `items` | `CategoryItem[]` | - |

### CategoryItem

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `categoryTypeId` | `String` | - |
| `name` | `String` | - |
| `isActive` | `Boolean` | @default(true) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `categoryType` | `CategoryType` | @relation(fields: [categoryTypeId], references: [id], onDelete: Cascade) |
| `projectsAsType` | `Project[]` | @relation("ProjectType") |
| `expensesAsCategory` | `Expense[]` | @relation("ExpenseCategory") |
| `expensesAsMaterial` | `Expense[]` | @relation("MaterialType") |
| `expensesAsLabour` | `Expense[]` | @relation("LabourType") |
| `expensesAsSubWork` | `Expense[]` | @relation("SubWorkType") |

### Project

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `name` | `String` | - |
| `clientId` | `String?` | - |
| `location` | `String` | - |
| `startDate` | `DateTime` | - |
| `endDate` | `DateTime?` | - |
| `amount` | `Decimal?` | @db.Decimal(15, 2) |
| `projectTypeItemId` | `String` | - |
| `area` | `String?` | - |
| `projectPicture` | `String?` | - |
| `status` | `ProjectStatus` | @default(ACTIVE) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @default(now()) @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `client` | `Party?` | @relation("ProjectClient", fields: [clientId], references: [id]) |
| `projectType` | `CategoryItem` | @relation("ProjectType", fields: [projectTypeItemId], references: [id]) |
| `stages` | `Stage[]` | - |
| `expenses` | `Expense[]` | - |
| `payments` | `Payment[]` | - |
| `documents` | `Document[]` | - |
| `projectAccess` | `ProjectAccess[]` | - |

### Stage

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `name` | `String` | - |
| `budgetAmount` | `Decimal` | @db.Decimal(15, 2) |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `expenses` | `Expense[]` | - |

### Party

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `name` | `String` | - |
| `phone` | `String?` | - |
| `location` | `String` | - |
| `type` | `PartyType` | - |
| `isInternal` | `Boolean` | @default(false) |
| `profilePicture` | `String?` | - |
| `userId` | `String?` | @unique |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `user` | `User?` | @relation(fields: [userId], references: [id]) |
| `expenses` | `Expense[]` | - |
| `payments` | `Payment[]` | - |
| `projectsAsClient` | `Project[]` | @relation("ProjectClient") |

### Expense

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `partyId` | `String` | - |
| `stageId` | `String?` | - |
| `expenseCategoryItemId` | `String` | - |
| `materialTypeItemId` | `String?` | - |
| `labourTypeItemId` | `String?` | - |
| `subWorkTypeItemId` | `String?` | - |
| `rate` | `Decimal` | @db.Decimal(15, 2) |
| `quantity` | `Decimal` | @db.Decimal(15, 4) |
| `expenseDate` | `DateTime` | - |
| `notes` | `String?` | @db.Text |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `party` | `Party` | @relation(fields: [partyId], references: [id]) |
| `stage` | `Stage?` | @relation(fields: [stageId], references: [id]) |
| `expenseCategory` | `CategoryItem` | @relation("ExpenseCategory", fields: [expenseCategoryItemId], references: [id]) |
| `materialType` | `CategoryItem?` | @relation("MaterialType", fields: [materialTypeItemId], references: [id]) |
| `labourType` | `CategoryItem?` | @relation("LabourType", fields: [labourTypeItemId], references: [id]) |
| `subWorkType` | `CategoryItem?` | @relation("SubWorkType", fields: [subWorkTypeItemId], references: [id]) |
| `payments` | `Payment[]` | - |

### Payment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `partyId` | `String?` | - |
| `expenseId` | `String?` | - |
| `type` | `PaymentType` | - |
| `paymentMode` | `PaymentMode` | - |
| `amount` | `Decimal` | @db.Decimal(15, 2) |
| `paymentDate` | `DateTime` | - |
| `notes` | `String?` | @db.Text |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `party` | `Party?` | @relation(fields: [partyId], references: [id]) |
| `expense` | `Expense?` | @relation(fields: [expenseId], references: [id]) |

### Document

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `fileName` | `String` | - |
| `fileType` | `String` | - |
| `fileUrl` | `String` | - |
| `storagePath` | `String` | - |
| `mimeType` | `String` | - |
| `uploadedAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |

### Attachment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `fileName` | `String` | - |
| `fileUrl` | `String` | - |
| `storagePath` | `String` | - |
| `mimeType` | `String` | - |
| `uploadedAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `entities` | `EntityAttachment[]` | - |

### EntityAttachment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `attachmentId` | `String` | - |
| `entityType` | `EntityType` | - |
| `entityId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `attachment` | `Attachment` | @relation(fields: [attachmentId], references: [id], onDelete: Cascade) |

