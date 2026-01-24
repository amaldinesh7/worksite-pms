# Database Schema

> Auto-generated from `apps/api/prisma/schema.prisma`
> Last generated: 2026-01-24T17:18:58.132Z

---

### Organization

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `name` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `members` | `OrganizationMember[]` | - |
| `projects` | `Project[]` | - |
| `categoryItems` | `CategoryItem[]` | - |
| `parties` | `Party[]` | - |
| `expenses` | `Expense[]` | - |
| `payments` | `Payment[]` | - |
| `documents` | `Document[]` | - |
| `stages` | `Stage[]` | - |
| `tasks` | `Task[]` | - |
| `attachments` | `Attachment[]` | - |
| `roles` | `Role[]` | - |
| `memberAdvances` | `MemberAdvance[]` | - |
| `boqSections` | `BOQSection[]` | - |
| `boqItems` | `BOQItem[]` | - |

### User

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `name` | `String` | - |
| `phone` | `String?` | @unique |
| `email` | `String?` | @unique |
| `location` | `String?` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `memberships` | `OrganizationMember[]` | - |
| `refreshTokens` | `RefreshToken[]` | - |

### Role

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `name` | `String` | - |
| `description` | `String?` | - |
| `isSystemRole` | `Boolean` | @default(false) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `permissions` | `RolePermission[]` | - |
| `members` | `OrganizationMember[]` | - |

### Permission

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `key` | `String` | @unique |
| `name` | `String` | - |
| `description` | `String?` | - |
| `category` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `roles` | `RolePermission[]` | - |

### RolePermission

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `roleId` | `String` | - |
| `permissionId` | `String` | - |
| `role` | `Role` | @relation(fields: [roleId], references: [id], onDelete: Cascade) |
| `permission` | `Permission` | @relation(fields: [permissionId], references: [id], onDelete: Cascade) |

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
| `roleId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `user` | `User` | @relation(fields: [userId], references: [id], onDelete: Cascade) |
| `role` | `Role` | @relation(fields: [roleId], references: [id]) |
| `projectAccess` | `ProjectAccess[]` | - |
| `stageAssignments` | `StageMemberAssignment[]` | - |
| `taskAssignments` | `TaskMemberAssignment[]` | - |
| `recordedPayments` | `Payment[]` | @relation("PaymentRecordedBy") |
| `memberAdvances` | `MemberAdvance[]` | - |

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
| `key` | `String` | @unique // project_type | expense_type | material_type | labour_type | sub_work_type |
| `label` | `String` | - |
| `isActive` | `Boolean` | @default(true) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `items` | `CategoryItem[]` | - |

### CategoryItem

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `categoryTypeId` | `String` | - |
| `name` | `String` | - |
| `isActive` | `Boolean` | @default(true) |
| `isEditable` | `Boolean` | @default(true) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `categoryType` | `CategoryType` | @relation(fields: [categoryTypeId], references: [id], onDelete: Cascade) |
| `projectsAsType` | `Project[]` | @relation("ProjectType") |
| `expensesAsType` | `Expense[]` | @relation("ExpenseType") |
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
| `memberAdvances` | `MemberAdvance[]` | - |
| `boqSections` | `BOQSection[]` | - |
| `boqItems` | `BOQItem[]` | - |

### Stage

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `name` | `String` | - |
| `description` | `String?` | - |
| `startDate` | `DateTime` | - |
| `endDate` | `DateTime` | - |
| `budgetAmount` | `Decimal` | @db.Decimal(15, 2) |
| `weight` | `Decimal` | @db.Decimal(5, 2) // Contribution to overall project progress (%) |
| `status` | `StageStatus` | @default(SCHEDULED) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `expenses` | `Expense[]` | - |
| `tasks` | `Task[]` | - |
| `memberAssignments` | `StageMemberAssignment[]` | - |
| `partyAssignments` | `StagePartyAssignment[]` | - |
| `boqItems` | `BOQItem[]` | - |

### StageMemberAssignment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `stageId` | `String` | - |
| `memberId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `stage` | `Stage` | @relation(fields: [stageId], references: [id], onDelete: Cascade) |
| `member` | `OrganizationMember` | @relation(fields: [memberId], references: [id], onDelete: Cascade) |

### StagePartyAssignment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `stageId` | `String` | - |
| `partyId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `stage` | `Stage` | @relation(fields: [stageId], references: [id], onDelete: Cascade) |
| `party` | `Party` | @relation(fields: [partyId], references: [id], onDelete: Cascade) |

### Task

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `stageId` | `String` | - |
| `name` | `String` | - |
| `description` | `String?` | - |
| `daysAllocated` | `Int` | - |
| `status` | `TaskStatus` | @default(NOT_STARTED) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `stage` | `Stage` | @relation(fields: [stageId], references: [id], onDelete: Cascade) |
| `memberAssignments` | `TaskMemberAssignment[]` | - |
| `partyAssignments` | `TaskPartyAssignment[]` | - |

### TaskMemberAssignment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `taskId` | `String` | - |
| `memberId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `task` | `Task` | @relation(fields: [taskId], references: [id], onDelete: Cascade) |
| `member` | `OrganizationMember` | @relation(fields: [memberId], references: [id], onDelete: Cascade) |

### TaskPartyAssignment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `taskId` | `String` | - |
| `partyId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `task` | `Task` | @relation(fields: [taskId], references: [id], onDelete: Cascade) |
| `party` | `Party` | @relation(fields: [partyId], references: [id], onDelete: Cascade) |

### Party

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `name` | `String` | - |
| `phone` | `String?` | - |
| `location` | `String` | - |
| `type` | `PartyType` | - |
| `profilePicture` | `String?` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `expenses` | `Expense[]` | - |
| `payments` | `Payment[]` | - |
| `projectsAsClient` | `Project[]` | @relation("ProjectClient") |
| `stageAssignments` | `StagePartyAssignment[]` | - |
| `taskAssignments` | `TaskPartyAssignment[]` | - |

### Expense

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `partyId` | `String` | - |
| `stageId` | `String?` | - |
| `expenseTypeItemId` | `String` | - |
| `materialTypeItemId` | `String?` | - |
| `labourTypeItemId` | `String?` | - |
| `subWorkTypeItemId` | `String?` | - |
| `description` | `String?` | - |
| `rate` | `Decimal` | @db.Decimal(15, 2) |
| `quantity` | `Decimal` | @db.Decimal(15, 4) |
| `expenseDate` | `DateTime` | - |
| `status` | `ExpenseStatus` | @default(PENDING) |
| `notes` | `String?` | @db.Text |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `party` | `Party` | @relation(fields: [partyId], references: [id]) |
| `stage` | `Stage?` | @relation(fields: [stageId], references: [id]) |
| `expenseType` | `CategoryItem` | @relation("ExpenseType", fields: [expenseTypeItemId], references: [id]) |
| `materialType` | `CategoryItem?` | @relation("MaterialType", fields: [materialTypeItemId], references: [id]) |
| `labourType` | `CategoryItem?` | @relation("LabourType", fields: [labourTypeItemId], references: [id]) |
| `subWorkType` | `CategoryItem?` | @relation("SubWorkType", fields: [subWorkTypeItemId], references: [id]) |
| `payments` | `Payment[]` | - |
| `boqLinks` | `BOQExpenseLink[]` | - |

### Payment

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `partyId` | `String?` | - |
| `expenseId` | `String?` | - |
| `recordedById` | `String?` | - |
| `type` | `PaymentType` | - |
| `paymentMode` | `PaymentMode` | - |
| `amount` | `Decimal` | @db.Decimal(15, 2) |
| `paymentDate` | `DateTime` | - |
| `referenceNumber` | `String?` | // Invoice/Receipt number |
| `notes` | `String?` | @db.Text |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `party` | `Party?` | @relation(fields: [partyId], references: [id]) |
| `expense` | `Expense?` | @relation(fields: [expenseId], references: [id]) |
| `recordedBy` | `OrganizationMember?` | @relation("PaymentRecordedBy", fields: [recordedById], references: [id]) |

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

### MemberAdvance

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `memberId` | `String` | - |
| `amount` | `Decimal` | @db.Decimal(15, 2) |
| `purpose` | `String` | - |
| `paymentMode` | `PaymentMode` | - |
| `advanceDate` | `DateTime` | - |
| `expectedSettlementDate` | `DateTime?` | - |
| `notes` | `String?` | @db.Text |
| `createdAt` | `DateTime` | @default(now()) |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `member` | `OrganizationMember` | @relation(fields: [memberId], references: [id], onDelete: Cascade) |

### BOQSection

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `name` | `String` | - |
| `sortOrder` | `Int` | @default(0) |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `items` | `BOQItem[]` | - |

### BOQItem

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `organizationId` | `String` | - |
| `projectId` | `String` | - |
| `sectionId` | `String?` | - |
| `stageId` | `String?` | - |
| `code` | `String?` | // e.g., "R2-CS-EW-1" |
| `category` | `BOQCategory` | - |
| `description` | `String` | - |
| `unit` | `String` | - |
| `quantity` | `Decimal` | @db.Decimal(15, 4) |
| `rate` | `Decimal` | @db.Decimal(15, 2) |
| `notes` | `String?` | @db.Text |
| `isReviewFlagged` | `Boolean` | @default(false) |
| `flagReason` | `String?` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `updatedAt` | `DateTime` | @updatedAt |
| `organization` | `Organization` | @relation(fields: [organizationId], references: [id], onDelete: Cascade) |
| `project` | `Project` | @relation(fields: [projectId], references: [id], onDelete: Cascade) |
| `section` | `BOQSection?` | @relation(fields: [sectionId], references: [id], onDelete: SetNull) |
| `stage` | `Stage?` | @relation(fields: [stageId], references: [id], onDelete: SetNull) |
| `expenseLinks` | `BOQExpenseLink[]` | - |

### BOQExpenseLink

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `String` | @id @default(cuid()) |
| `boqItemId` | `String` | - |
| `expenseId` | `String` | - |
| `createdAt` | `DateTime` | @default(now()) |
| `boqItem` | `BOQItem` | @relation(fields: [boqItemId], references: [id], onDelete: Cascade) |
| `expense` | `Expense` | @relation(fields: [expenseId], references: [id], onDelete: Cascade) |

