# Database Schema

> Auto-generated from `apps/api/prisma/schema.prisma`
> Last generated: 2026-01-12T21:06:04.893Z

---

### Organization

| Field           | Type                   | Attributes           |
| --------------- | ---------------------- | -------------------- |
| `id`            | `String`               | @id @default(cuid()) |
| `name`          | `String`               | -                    |
| `createdAt`     | `DateTime`             | @default(now())      |
| `members`       | `OrganizationMember[]` | -                    |
| `projects`      | `Project[]`            | -                    |
| `categoryTypes` | `CategoryType[]`       | -                    |
| `categoryItems` | `CategoryItem[]`       | -                    |
| `parties`       | `Party[]`              | -                    |
| `expenses`      | `Expense[]`            | -                    |
| `payments`      | `Payment[]`            | -                    |
| `documents`     | `Document[]`           | -                    |
| `stages`        | `Stage[]`              | -                    |

### User

| Field           | Type                   | Attributes           |
| --------------- | ---------------------- | -------------------- |
| `id`            | `String`               | @id @default(cuid()) |
| `name`          | `String`               | -                    |
| `phone`         | `String`               | @unique              |
| `createdAt`     | `DateTime`             | @default(now())      |
| `memberships`   | `OrganizationMember[]` | -                    |
| `refreshTokens` | `RefreshToken[]`       | -                    |

### OtpVerification

| Field       | Type       | Attributes           |
| ----------- | ---------- | -------------------- |
| `id`        | `String`   | @id @default(cuid()) |
| `phone`     | `String`   | -                    |
| `code`      | `String`   | // hashed OTP        |
| `expiresAt` | `DateTime` | -                    |
| `attempts`  | `Int`      | @default(0)          |
| `verified`  | `Boolean`  | @default(false)      |
| `createdAt` | `DateTime` | @default(now())      |

### RefreshToken

| Field       | Type       | Attributes                                                       |
| ----------- | ---------- | ---------------------------------------------------------------- |
| `id`        | `String`   | @id @default(cuid())                                             |
| `userId`    | `String`   | -                                                                |
| `token`     | `String`   | @unique                                                          |
| `expiresAt` | `DateTime` | -                                                                |
| `createdAt` | `DateTime` | @default(now())                                                  |
| `user`      | `User`     | @relation(fields: [userId], references: [id], onDelete: Cascade) |

### OrganizationMember

| Field            | Type               | Attributes                                                               |
| ---------------- | ------------------ | ------------------------------------------------------------------------ |
| `id`             | `String`           | @id @default(cuid())                                                     |
| `organizationId` | `String`           | -                                                                        |
| `userId`         | `String`           | -                                                                        |
| `role`           | `OrganizationRole` | -                                                                        |
| `createdAt`      | `DateTime`         | @default(now())                                                          |
| `organization`   | `Organization`     | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `user`           | `User`             | @relation(fields: [userId], references: [id], onDelete: Cascade)         |

### CategoryType

| Field            | Type             | Attributes                                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------ | ---------------- | ------------- | ----------- | ------------- |
| `id`             | `String`         | @id @default(cuid())                                                     |
| `organizationId` | `String`         | -                                                                        |
| `key`            | `String`         | // project_type                                                          | expense_category | material_type | labour_type | sub_work_type |
| `label`          | `String`         | -                                                                        |
| `isActive`       | `Boolean`        | @default(true)                                                           |
| `createdAt`      | `DateTime`       | @default(now())                                                          |
| `updatedAt`      | `DateTime`       | @updatedAt                                                               |
| `organization`   | `Organization`   | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `items`          | `CategoryItem[]` | -                                                                        |

### CategoryItem

| Field                | Type           | Attributes                                                               |
| -------------------- | -------------- | ------------------------------------------------------------------------ |
| `id`                 | `String`       | @id @default(cuid())                                                     |
| `organizationId`     | `String`       | -                                                                        |
| `categoryTypeId`     | `String`       | -                                                                        |
| `name`               | `String`       | -                                                                        |
| `isActive`           | `Boolean`      | @default(true)                                                           |
| `createdAt`          | `DateTime`     | @default(now())                                                          |
| `updatedAt`          | `DateTime`     | @updatedAt                                                               |
| `organization`       | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `categoryType`       | `CategoryType` | @relation(fields: [categoryTypeId], references: [id], onDelete: Cascade) |
| `projectsAsType`     | `Project[]`    | @relation("ProjectType")                                                 |
| `expensesAsCategory` | `Expense[]`    | @relation("ExpenseCategory")                                             |
| `expensesAsMaterial` | `Expense[]`    | @relation("MaterialType")                                                |
| `expensesAsLabour`   | `Expense[]`    | @relation("LabourType")                                                  |
| `expensesAsSubWork`  | `Expense[]`    | @relation("SubWorkType")                                                 |

### Project

| Field               | Type           | Attributes                                                               |
| ------------------- | -------------- | ------------------------------------------------------------------------ |
| `id`                | `String`       | @id @default(cuid())                                                     |
| `organizationId`    | `String`       | -                                                                        |
| `name`              | `String`       | -                                                                        |
| `clientName`        | `String`       | -                                                                        |
| `location`          | `String`       | -                                                                        |
| `startDate`         | `DateTime`     | -                                                                        |
| `projectTypeItemId` | `String`       | -                                                                        |
| `createdAt`         | `DateTime`     | @default(now())                                                          |
| `organization`      | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `projectType`       | `CategoryItem` | @relation("ProjectType", fields: [projectTypeItemId], references: [id])  |
| `stages`            | `Stage[]`      | -                                                                        |
| `expenses`          | `Expense[]`    | -                                                                        |
| `payments`          | `Payment[]`    | -                                                                        |
| `documents`         | `Document[]`   | -                                                                        |

### Stage

| Field            | Type           | Attributes                                                               |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| `id`             | `String`       | @id @default(cuid())                                                     |
| `organizationId` | `String`       | -                                                                        |
| `projectId`      | `String`       | -                                                                        |
| `name`           | `String`       | -                                                                        |
| `budgetAmount`   | `Decimal`      | @db.Decimal(15, 2)                                                       |
| `createdAt`      | `DateTime`     | @default(now())                                                          |
| `organization`   | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project`        | `Project`      | @relation(fields: [projectId], references: [id], onDelete: Cascade)      |
| `expenses`       | `Expense[]`    | -                                                                        |

### Party

| Field            | Type           | Attributes                                                               |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| `id`             | `String`       | @id @default(cuid())                                                     |
| `organizationId` | `String`       | -                                                                        |
| `name`           | `String`       | -                                                                        |
| `phone`          | `String?`      | -                                                                        |
| `type`           | `PartyType`    | -                                                                        |
| `createdAt`      | `DateTime`     | @default(now())                                                          |
| `organization`   | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `expenses`       | `Expense[]`    | -                                                                        |
| `payments`       | `Payment[]`    | -                                                                        |

### Expense

| Field                   | Type            | Attributes                                                                      |
| ----------------------- | --------------- | ------------------------------------------------------------------------------- |
| `id`                    | `String`        | @id @default(cuid())                                                            |
| `organizationId`        | `String`        | -                                                                               |
| `projectId`             | `String`        | -                                                                               |
| `partyId`               | `String`        | -                                                                               |
| `stageId`               | `String?`       | -                                                                               |
| `expenseCategoryItemId` | `String`        | -                                                                               |
| `materialTypeItemId`    | `String?`       | -                                                                               |
| `labourTypeItemId`      | `String?`       | -                                                                               |
| `subWorkTypeItemId`     | `String?`       | -                                                                               |
| `amount`                | `Decimal`       | @db.Decimal(15, 2)                                                              |
| `expenseDate`           | `DateTime`      | -                                                                               |
| `paymentMode`           | `String`        | -                                                                               |
| `notes`                 | `String?`       | @db.Text                                                                        |
| `createdAt`             | `DateTime`      | @default(now())                                                                 |
| `organization`          | `Organization`  | @relation(fields: [organizationId], references: [id], onDelete: Cascade)        |
| `project`               | `Project`       | @relation(fields: [projectId], references: [id], onDelete: Cascade)             |
| `party`                 | `Party`         | @relation(fields: [partyId], references: [id])                                  |
| `stage`                 | `Stage?`        | @relation(fields: [stageId], references: [id])                                  |
| `expenseCategory`       | `CategoryItem`  | @relation("ExpenseCategory", fields: [expenseCategoryItemId], references: [id]) |
| `materialType`          | `CategoryItem?` | @relation("MaterialType", fields: [materialTypeItemId], references: [id])       |
| `labourType`            | `CategoryItem?` | @relation("LabourType", fields: [labourTypeItemId], references: [id])           |
| `subWorkType`           | `CategoryItem?` | @relation("SubWorkType", fields: [subWorkTypeItemId], references: [id])         |

### Payment

| Field            | Type           | Attributes                                                               |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| `id`             | `String`       | @id @default(cuid())                                                     |
| `organizationId` | `String`       | -                                                                        |
| `projectId`      | `String`       | -                                                                        |
| `partyId`        | `String?`      | -                                                                        |
| `amount`         | `Decimal`      | @db.Decimal(15, 2)                                                       |
| `paymentDate`    | `DateTime`     | -                                                                        |
| `notes`          | `String?`      | @db.Text                                                                 |
| `createdAt`      | `DateTime`     | @default(now())                                                          |
| `organization`   | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project`        | `Project`      | @relation(fields: [projectId], references: [id], onDelete: Cascade)      |
| `party`          | `Party?`       | @relation(fields: [partyId], references: [id])                           |

### Document

| Field            | Type           | Attributes                                                               |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| `id`             | `String`       | @id @default(cuid())                                                     |
| `organizationId` | `String`       | -                                                                        |
| `projectId`      | `String`       | -                                                                        |
| `fileName`       | `String`       | -                                                                        |
| `fileType`       | `String`       | -                                                                        |
| `fileUrl`        | `String`       | -                                                                        |
| `storagePath`    | `String`       | // Path in storage bucket                                                |
| `mimeType`       | `String`       | // Detected MIME type                                                    |
| `originalSize`   | `Int`          | // Size before compression (bytes)                                       |
| `compressedSize` | `Int`          | // Size after compression (bytes)                                        |
| `uploadedAt`     | `DateTime`     | @default(now())                                                          |
| `organization`   | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project`        | `Project`      | @relation(fields: [projectId], references: [id], onDelete: Cascade)      |
