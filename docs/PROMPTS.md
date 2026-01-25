# AI Development Prompts
## Worksite - Feature Implementation Guide

> **Purpose**: This file contains structured prompts for AI-assisted development of pending features.  
> **Usage**: Copy the relevant prompt when starting work on a feature. Each prompt is self-contained.

---

## Table of Contents

1. [Phase 1: Core Financial Visibility](#phase-1-core-financial-visibility)
   - [1.1 BOQ/Budget Management](#11-boqbudget-management)
   - [1.2 Budget vs Actual Variance](#12-budget-vs-actual-variance)
   - [1.3 Project P&L Dashboard](#13-project-pl-dashboard)
   - [1.4 Credits Hub](#14-credits-hub)
2. [Phase 2: Client & Payment Management](#phase-2-client--payment-management)
   - [2.1 Payment Milestones](#21-payment-milestones)
   - [2.2 Client Payment Tracking](#22-client-payment-tracking)
   - [2.3 Payment Narration](#23-payment-narration)
   - [2.4 Aging Reports](#24-aging-reports)
3. [Phase 3: Operational Excellence](#phase-3-operational-excellence)
   - [3.1 Timeline Alerts](#31-timeline-alerts)
   - [3.2 Labor Cost Enhancement](#32-labor-cost-enhancement)
4. [Phase 4: Automation](#phase-4-automation)
   - [4.1 Invoice Scanning](#41-invoice-scanning)
   - [4.2 Material Inventory](#42-material-inventory)

---

# Phase 1: Core Financial Visibility

---

## 1.1 BOQ/Budget Management

### Database Schema Prompt

```
@database I need to implement a BOQ (Bill of Quantities) / Budget Management system for Worksite.

**Context**: 
- Worksite is a construction project management system
- Users need to enter quoted budgets line-by-line when they win a project
- Each budget item should be linkable to stages
- Later, expenses will be linked to budget items to show variance

**Requirements**:
1. Create a new `BudgetItem` model with:
   - organizationId, projectId (required)
   - stageId (optional - can be project-level or stage-level)
   - category: enum or string (Material, Labour, Sub Work, Other)
   - description: string (e.g., "Cement 43 Grade", "Electrical Wiring")
   - quotedRate: Decimal (unit price quoted to client)
   - quotedQuantity: Decimal (quantity quoted)
   - unit: string optional (sq ft, bags, kg, etc.)
   - timestamps

2. Add relation from Expense to BudgetItem (optional link)
   - budgetItemId on Expense model
   
3. Add relations to Project and Stage models

4. Create migration file with proper indexes

Follow existing patterns in schema.prisma. Use Decimal for money fields.
```

### API Endpoints Prompt

```
@backend Create CRUD API endpoints for Budget Items in Worksite.

**Context**:
- BudgetItem model exists in Prisma schema (see schema.prisma)
- Follow existing patterns in apps/api/src/routes/
- Use Zod for validation, follow expense.schema.ts patterns

**Required Endpoints**:

1. `GET /api/projects/:projectId/budget`
   - List all budget items for a project
   - Include: stage name if linked
   - Calculate: quotedTotal (rate × quantity)
   - Optional query params: stageId, category

2. `POST /api/projects/:projectId/budget-items`
   - Create new budget item
   - Validate: rate > 0, quantity > 0
   - Return created item with relations

3. `PUT /api/budget-items/:id`
   - Update budget item
   - Partial update support

4. `DELETE /api/budget-items/:id`
   - Soft delete or hard delete (follow existing pattern)

5. `GET /api/projects/:projectId/budget/summary`
   - Aggregate totals by category
   - Return: { category, quotedTotal, actualTotal, variance }

**Structure**:
- routes/budget/index.ts
- routes/budget/budget.controller.ts
- routes/budget/budget.schema.ts
- repositories/budget.repository.ts

Include tests in routes/__tests__/budget.test.ts
```

### Web UI Prompt - Budget Tab

```
@frontend Create a Budget/BOQ tab for the Project Detail page in Worksite.

**Context**:
- Location: apps/web/src/components/projects/budget/
- Project Detail page has tabs (Overview, Stages, Expenses, Documents)
- Add new "Budget" tab between Overview and Stages
- Follow existing patterns in ProjectStagesTab.tsx

**UI Requirements**:

1. **Budget Tab Overview**:
   - Header: "Project Budget" with "Add Item" button
   - Summary cards row:
     - Total Quoted: ₹XX,XX,XXX
     - Total Actual: ₹XX,XX,XXX (from linked expenses)
     - Variance: ₹XX,XXX (green if under, red if over)
     - Margin %: XX%

2. **Budget Items Table**:
   - Columns: Category | Description | Unit | Qty | Rate | Quoted Total | Actual | Variance
   - Groupable by: Category or Stage
   - Row actions: Edit, Delete, Link Expenses
   - Empty state: "No budget items yet. Add your first item to start tracking."

3. **Add/Edit Budget Item Dialog**:
   - Form fields:
     - Category (dropdown: Material, Labour, Sub Work, Other)
     - Description (text input)
     - Stage (optional dropdown - list project stages)
     - Unit (text input, optional)
     - Quantity (number input)
     - Rate (currency input)
     - Auto-calculated Total (read-only)
   - Validation: Description required, Quantity > 0, Rate > 0

4. **Variance Indicators**:
   - Green badge: Under budget
   - Yellow badge: Within 10% of budget
   - Red badge: Over budget

**Components to create**:
- ProjectBudgetTab.tsx (main container)
- BudgetSummaryCards.tsx
- BudgetItemsTable.tsx
- BudgetItemFormDialog.tsx

**Hooks to create** (in lib/hooks/useBudget.ts):
- useBudgetItems(projectId)
- useBudgetSummary(projectId)
- useCreateBudgetItem()
- useUpdateBudgetItem()
- useDeleteBudgetItem()

Use shadcn/ui components. Follow existing expense tab patterns.
```

---

## 1.2 Budget vs Actual Variance

### Variance Calculation Prompt

```
@backend Add variance calculation to the Budget system.

**Context**:
- BudgetItem model exists with quotedRate, quotedQuantity
- Expense model can be linked to BudgetItem via budgetItemId
- Need to calculate actual spend vs quoted budget

**Requirements**:

1. **Update Budget Repository**:
   Add method `getBudgetWithActuals(projectId)` that returns:
   ```typescript
   {
     items: [{
       id, category, description, unit,
       quotedRate, quotedQuantity, quotedTotal,
       actualTotal: sum of linked expenses (rate × quantity),
       variance: quotedTotal - actualTotal,
       variancePercent: (variance / quotedTotal) * 100,
       expenseCount: number of linked expenses
     }],
     summary: {
       totalQuoted, totalActual, totalVariance, marginPercent
     }
   }
   ```

2. **Update Expense Creation**:
   - When creating expense, optionally link to budgetItemId
   - Auto-suggest budget item based on:
     - Same category (Material → Material budget items)
     - Similar description (fuzzy match)

3. **Add API endpoint**:
   `GET /api/projects/:projectId/budget/variance`
   - Returns items with variance calculations
   - Supports groupBy: category | stage

4. **Add variance alerts**:
   - If any item exceeds budget by >10%, flag it
   - Return `alerts: [{ budgetItemId, message, severity }]`
```

### Variance UI Prompt

```
@frontend Add variance visualization to Budget tab.

**Context**:
- Budget tab exists with items table
- API returns variance data per item

**UI Enhancements**:

1. **Variance Column in Table**:
   - Show: Actual | Variance | %
   - Color coding:
     - Green: Under budget (variance > 0)
     - Yellow: 0-10% over
     - Red: >10% over
   - Progress bar showing actual vs quoted

2. **Variance Summary Chart**:
   - Horizontal bar chart by category
   - Each bar: Quoted (gray) vs Actual (colored)
   - Legend: Material | Labour | Sub Work

3. **Budget Alerts Banner**:
   - If items are over budget, show alert banner at top
   - "3 items are over budget. Review now →"
   - Clicking scrolls to first over-budget item

4. **Link Expense to Budget Item**:
   - In Expense form, add optional "Budget Item" dropdown
   - Filter dropdown by matching category
   - Show remaining budget for selected item

Use Recharts for charts (already in project).
```

---

## 1.3 Project P&L Dashboard

### P&L API Prompt

```
@backend Create Profit & Loss calculation API for projects.

**Context**:
- Projects have: amount (total contract value), expenses, payments
- Need to calculate P&L at project, stage, and category level

**Requirements**:

1. **New endpoint**: `GET /api/projects/:projectId/pnl`

   Response structure:
   ```typescript
   {
     project: {
       id, name,
       contractValue: project.amount,
       totalExpenses: sum of all expenses,
       grossProfit: contractValue - totalExpenses,
       grossMargin: (grossProfit / contractValue) * 100,
       paymentsReceived: sum of IN payments,
       paymentsPending: contractValue - paymentsReceived
     },
     byStage: [{
       stageId, stageName,
       budgetAllocated: stage.budgetAmount,
       actualSpent: sum of stage expenses,
       variance, variancePercent
     }],
     byCategory: [{
       category: "Material" | "Labour" | "Sub Work",
       budgeted: sum of budget items,
       actual: sum of expenses,
       variance, variancePercent
     }],
     trend: [{
       month: "2026-01",
       expenses: total for month,
       cumulative: running total
     }]
   }
   ```

2. **Add to Project repository**:
   - `getProjectPnL(organizationId, projectId)`
   - Use Prisma aggregations for efficiency

3. **Caching consideration**:
   - P&L calculations can be expensive
   - Consider caching with invalidation on expense/payment changes
```

### P&L Dashboard UI Prompt

```
@frontend Create a P&L Dashboard view for Project Detail page.

**Context**:
- Add to Project Overview tab or create dedicated "Financials" tab
- Show profit/loss metrics prominently
- Target user: Business owner wanting quick financial health check

**UI Requirements**:

1. **P&L Summary Cards** (top of page):
   ```
   ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
   │ Contract Value  │ Total Expenses  │ Gross Profit    │ Margin          │
   │ ₹50,00,000      │ ₹35,00,000      │ ₹15,00,000      │ 30%             │
   │                 │                 │ ↑ On track      │ ● Healthy       │
   └─────────────────┴─────────────────┴─────────────────┴─────────────────┘
   ```

2. **Expense Breakdown Donut Chart**:
   - Segments: Material (blue), Labour (green), Sub Work (orange), Other (gray)
   - Center: Total Expenses amount
   - Legend with amounts

3. **Stage-wise Budget vs Actual**:
   - Horizontal grouped bar chart
   - Each stage: Budget bar (gray) + Actual bar (colored by status)
   - Sorted by variance (worst first)

4. **Expense Trend Line Chart**:
   - X-axis: Months
   - Y-axis: Amount
   - Lines: Monthly expenses, Cumulative expenses
   - Optional: Budget burn line

5. **Quick Stats Row**:
   - Payments Received: ₹XX / ₹XX (with progress bar)
   - Days Remaining: XX days
   - Expenses This Month: ₹XX

**Components**:
- ProjectFinancials.tsx or enhance ProjectOverviewTab.tsx
- PnLSummaryCards.tsx
- ExpenseBreakdownChart.tsx
- StageBudgetChart.tsx
- ExpenseTrendChart.tsx

Use existing card patterns from PartyStatsCards.tsx
```

---

## 1.4 Credits Hub

### Credits Hub API Prompt

```
@backend Create a Credits Hub API for unified payables/receivables view.

**Context**:
- Payables: Amount owed to vendors/labours/subcontractors (expenses - payments OUT)
- Receivables: Amount owed by clients (project amount - payments IN)
- Need cross-project, cross-party aggregation

**Requirements**:

1. **New endpoint**: `GET /api/credits-hub`

   Query params:
   - type: "payables" | "receivables" | "all"
   - projectId: optional filter
   - partyId: optional filter
   - aging: boolean (include aging breakdown)

   Response:
   ```typescript
   {
     summary: {
       totalPayables: number,
       totalReceivables: number,
       netPosition: receivables - payables
     },
     payables: [{
       partyId, partyName, partyType,
       totalExpenses: sum of expenses to this party,
       totalPaid: sum of OUT payments to this party,
       balance: totalExpenses - totalPaid,
       projects: [{ projectId, projectName, balance }],
       aging: { current: 0-30, days30: 30-60, days60: 60-90, days90: 90+ }
     }],
     receivables: [{
       partyId, partyName, // Client
       projectId, projectName,
       contractValue,
       totalReceived: sum of IN payments,
       balance: contractValue - totalReceived,
       aging: { ... }
     }]
   }
   ```

2. **Aging calculation**:
   - Based on expense date for payables
   - Based on project start date or milestone due date for receivables

3. **Export endpoint**: `GET /api/credits-hub/export`
   - Returns CSV/Excel format
   - Include all details for accounting
```

### Credits Hub UI Prompt

```
@frontend Create a Credits Hub page in Worksite.

**Context**:
- New top-level page: /credits-hub
- Add to sidebar navigation after "Parties"
- Primary user: Business owner, Accountant

**UI Requirements**:

1. **Page Header**:
   - Title: "Credits Hub"
   - Subtitle: "Track all pending payments at a glance"
   - Export button (top right)

2. **Summary Cards Row**:
   ```
   ┌─────────────────┬─────────────────┬─────────────────┐
   │ 💰 Receivables  │ 📤 Payables     │ 📊 Net Position │
   │ ₹25,00,000      │ ₹18,00,000      │ +₹7,00,000      │
   │ From 5 clients  │ To 23 parties   │ Positive        │
   └─────────────────┴─────────────────┴─────────────────┘
   ```

3. **Tabs**: Receivables | Payables

4. **Receivables Tab**:
   - Table: Client | Project | Contract | Received | Pending | Aging
   - Row expansion: Show payment history
   - Filter by: Project, Aging bucket
   - Sort by: Amount pending, Aging

5. **Payables Tab**:
   - Table: Party | Type | Projects | Total Owed | Aging
   - Row expansion: Show project-wise breakdown
   - Filter by: Party type, Project, Aging bucket
   - Bulk action: "Mark for Payment" (future)

6. **Aging Visualization**:
   - Stacked bar showing: Current | 30-60 | 60-90 | 90+
   - Color: Green → Yellow → Orange → Red

7. **Quick Actions**:
   - Click party → Go to Party Detail
   - Click project → Go to Project Detail
   - "Record Payment" button per row

**Files to create**:
- pages/credits/CreditsHubPage.tsx
- components/credits/CreditsSummaryCards.tsx
- components/credits/ReceivablesTable.tsx
- components/credits/PayablesTable.tsx
- components/credits/AgingBar.tsx
- lib/hooks/useCreditsHub.ts
- lib/api/credits.ts

Add route to router and sidebar navigation.
```

---

# Phase 2: Client & Payment Management

---

## 2.1 Payment Milestones

### Milestones Schema Prompt

```
@database Create Payment Milestones system for tracking client payments.

**Context**:
- Projects have contract value (amount field)
- Clients pay in installments tied to project milestones
- Need to track expected vs received per milestone

**Requirements**:

1. Create `PaymentMilestone` model:
   ```prisma
   model PaymentMilestone {
     id             String   @id @default(cuid())
     organizationId String
     projectId      String
     stageId        String?  // Optional link to stage
     name           String   // "Advance", "Foundation Complete", etc.
     percentage     Decimal  @db.Decimal(5, 2)  // e.g., 20.00
     expectedAmount Decimal  @db.Decimal(15, 2)
     dueDate        DateTime?
     status         MilestoneStatus @default(PENDING)
     order          Int      @default(0)  // For ordering
     createdAt      DateTime @default(now())
     updatedAt      DateTime @updatedAt
     
     // Relations
     organization Organization @relation(...)
     project      Project      @relation(...)
     stage        Stage?       @relation(...)
     payments     Payment[]    // Payments against this milestone
   }
   
   enum MilestoneStatus {
     PENDING
     PARTIALLY_PAID
     PAID
     OVERDUE
   }
   ```

2. Add `milestoneId` to Payment model (optional)

3. Add `milestones` relation to Project model

4. Create migration with indexes on projectId, status
```

### Milestones API Prompt

```
@backend Create API for Payment Milestones management.

**Endpoints**:

1. `GET /api/projects/:projectId/milestones`
   - List all milestones for project
   - Include: payments against each milestone
   - Calculate: amountReceived, balance, status

2. `POST /api/projects/:projectId/milestones`
   - Create milestone
   - Auto-calculate expectedAmount from percentage × project.amount
   - Validate: total percentage ≤ 100%

3. `PUT /api/milestones/:id`
   - Update milestone details
   - Recalculate if percentage changes

4. `DELETE /api/milestones/:id`
   - Only if no payments linked

5. `POST /api/milestones/:id/record-payment`
   - Create payment linked to milestone
   - Update milestone status automatically
   - Validate: payment ≤ remaining balance

6. `GET /api/projects/:projectId/milestones/summary`
   - Total expected, received, pending
   - Next due milestone
   - Overdue count
```

### Milestones UI Prompt

```
@frontend Create Payment Milestones UI in Project Detail.

**Context**:
- Add to Project Overview or create "Payments" tab
- Show milestone-based payment tracking
- Allow recording payments against milestones

**UI Requirements**:

1. **Milestones Timeline View**:
   ```
   ○───────●───────●───────○───────○
   Advance  Foundation  Structure  Finishing  Handover
   20%      25%         25%        20%        10%
   ✓ Paid   ✓ Paid      ◐ Partial  Pending    Pending
   ```
   - Visual timeline with status indicators
   - Click milestone to expand details

2. **Milestones Table**:
   | Milestone | % | Expected | Received | Pending | Due Date | Status |
   | Advance | 20% | ₹10L | ₹10L | ₹0 | Jan 1 | ✓ Paid |
   | Foundation | 25% | ₹12.5L | ₹8L | ₹4.5L | Feb 15 | ◐ Partial |
   
   - Status badges: Paid (green), Partial (yellow), Pending (gray), Overdue (red)
   - Actions: Record Payment, Edit, Delete

3. **Add Milestone Dialog**:
   - Name (text)
   - Percentage (number, shows calculated amount)
   - Due Date (optional date picker)
   - Link to Stage (optional dropdown)
   - Validation: Show remaining % available

4. **Record Payment Dialog**:
   - Pre-filled: Milestone name, pending amount
   - Amount (number, max = pending)
   - Payment Mode (Cash/Cheque/Online)
   - Payment Date
   - Notes

5. **Summary Card**:
   ```
   Client Payments
   ₹30L / ₹50L received (60%)
   [████████░░░░░░░░] 
   Next due: Foundation (₹4.5L) - Feb 15
   ```

**Components**:
- ProjectMilestonesSection.tsx
- MilestoneTimeline.tsx
- MilestonesTable.tsx
- MilestoneFormDialog.tsx
- RecordMilestonePaymentDialog.tsx
```

---

## 2.2 Client Payment Tracking

### Client Payments UI Prompt

```
@frontend Enhance Party Detail page for CLIENT type parties.

**Context**:
- Party Detail page exists for VENDOR, LABOUR, SUBCONTRACTOR
- CLIENT parties need different view focused on receivables
- Show payment milestones and project progress

**UI Requirements for CLIENT Party Type**:

1. **Client Overview Card**:
   - Client name, contact
   - Total contract value across projects
   - Total received / Total pending
   - Projects count

2. **Projects with Payment Status**:
   | Project | Contract | Received | Pending | Progress |
   | Villa A | ₹50L | ₹30L | ₹20L | 60% |
   
   - Click to expand: Show milestones for that project
   - Progress bar: Actual progress vs payment progress

3. **Payment History**:
   - All IN payments from this client
   - Grouped by project
   - Show milestone linkage

4. **Quick Actions**:
   - "Record Payment" → Opens dialog with project/milestone selection
   - "Send Reminder" (future feature)

**Conditional rendering**:
- If party.type === 'CLIENT', show this view
- Otherwise, show existing vendor/labour view
```

---

## 2.3 Payment Narration

### Payment Notes Enhancement Prompt

```
@backend @frontend Enhance Payment model with narration/notes history.

**Backend Requirements**:

1. Add to Payment model:
   ```prisma
   holdReason    String?   // Why payment is on hold
   disputeStatus String?   // NONE, DISPUTED, RESOLVED
   ```

2. Create `PaymentNote` model for audit trail:
   ```prisma
   model PaymentNote {
     id        String   @id @default(cuid())
     paymentId String
     note      String   @db.Text
     createdBy String   // userId
     createdAt DateTime @default(now())
     
     payment Payment @relation(...)
   }
   ```

3. Add endpoints:
   - `POST /api/payments/:id/notes` - Add note
   - `GET /api/payments/:id/notes` - Get note history
   - `PUT /api/payments/:id/hold` - Mark payment on hold with reason

**Frontend Requirements**:

1. In payment list/detail, show hold status badge
2. "Add Note" button on payment row
3. Notes history panel (expandable)
4. "Mark on Hold" action with reason dialog
5. Search payments by notes content
```

---

## 2.4 Aging Reports

### Aging Reports Prompt

```
@frontend Create Aging Reports page/section.

**Context**:
- Part of Credits Hub or standalone Reports section
- Shows receivables/payables grouped by age

**UI Requirements**:

1. **Aging Summary Table**:
   ```
   | Category      | Current | 1-30 Days | 31-60 Days | 61-90 Days | 90+ Days | Total |
   |---------------|---------|-----------|------------|------------|----------|-------|
   | Receivables   | ₹10L    | ₹5L       | ₹3L        | ₹2L        | ₹1L      | ₹21L  |
   | Payables      | ₹8L     | ₹4L       | ₹2L        | ₹1L        | ₹0.5L    | ₹15.5L|
   ```

2. **Aging Chart**:
   - Stacked bar chart
   - X-axis: Aging buckets
   - Y-axis: Amount
   - Bars: Receivables vs Payables

3. **Detailed Aging List**:
   - Filter by: Receivables/Payables, Aging bucket
   - Show: Party, Amount, Days Outstanding, Last Payment Date
   - Sort by: Days outstanding (worst first)

4. **Export Options**:
   - Export to Excel with all details
   - Print-friendly view
```

---

# Phase 3: Operational Excellence

---

## 3.1 Timeline Alerts

### Notifications System Prompt

```
@backend Create a notifications/alerts system for Worksite.

**Requirements**:

1. **Notification Model**:
   ```prisma
   model Notification {
     id             String   @id @default(cuid())
     organizationId String
     userId         String?  // null = org-wide
     type           NotificationType
     title          String
     message        String
     entityType     String?  // PROJECT, STAGE, TASK, PAYMENT
     entityId       String?
     isRead         Boolean  @default(false)
     createdAt      DateTime @default(now())
   }
   
   enum NotificationType {
     DEADLINE_APPROACHING
     DEADLINE_OVERDUE
     BUDGET_EXCEEDED
     PAYMENT_RECEIVED
     PAYMENT_DUE
   }
   ```

2. **Alert Configuration**:
   ```prisma
   model AlertConfig {
     id             String   @id @default(cuid())
     organizationId String
     alertType      String
     enabled        Boolean  @default(true)
     daysBeforeDeadline Int?  // For deadline alerts
     threshold      Decimal? // For budget alerts (percentage)
   }
   ```

3. **Background Job** (or cron):
   - Run daily: Check for approaching deadlines
   - Create notifications for:
     - Stage/Task deadlines in X days
     - Overdue stages/tasks
     - Budget items exceeded threshold
     - Payment milestones due

4. **API Endpoints**:
   - `GET /api/notifications` - List user notifications
   - `PUT /api/notifications/:id/read` - Mark as read
   - `PUT /api/notifications/read-all` - Mark all as read
   - `GET /api/alerts/config` - Get alert settings
   - `PUT /api/alerts/config` - Update settings
```

### Notifications UI Prompt

```
@frontend Create notifications UI and alert configuration.

**Requirements**:

1. **Notification Bell (Header)**:
   - Bell icon with unread count badge
   - Click to open dropdown panel
   - Show recent 5 notifications
   - "View All" link

2. **Notifications Dropdown**:
   ```
   ┌─────────────────────────────────┐
   │ Notifications            Mark all│
   ├─────────────────────────────────┤
   │ ⚠️ Stage "Foundation" due in 3d │
   │    Villa Project • 2 hours ago  │
   ├─────────────────────────────────┤
   │ 🔴 Task "Electrical" is overdue │
   │    Office Project • 1 day ago   │
   ├─────────────────────────────────┤
   │ 💰 Payment received: ₹5,00,000  │
   │    From: ABC Client • 2 days ago│
   └─────────────────────────────────┘
   ```

3. **Notifications Page** (/notifications):
   - Full list with filters
   - Filter by: Type, Read/Unread, Date range
   - Bulk actions: Mark read, Delete

4. **Alert Settings** (in Settings):
   - Toggle alerts on/off by type
   - Configure: Days before deadline (1, 3, 5, 7)
   - Configure: Budget threshold (10%, 20%)
   - Email digest: Daily/Weekly/Off

**Components**:
- components/layout/NotificationBell.tsx
- components/notifications/NotificationDropdown.tsx
- components/notifications/NotificationItem.tsx
- pages/notifications/NotificationsPage.tsx
- pages/settings/AlertSettingsSection.tsx
```

---

## 3.2 Labor Cost Enhancement

### Labor Tracking Prompt

```
@backend @frontend Enhance labor expense tracking with rate types.

**Backend Changes**:

1. Add to CategoryItem or create LaborRateType:
   - Rate types: Regular, Overtime, Night, Holiday
   - Each can have different multiplier

2. Enhance Expense for labor:
   - Add: hoursWorked, rateType
   - Calculate: amount = hours × rate × multiplier

3. Add labor productivity tracking:
   - workArea (sq ft completed)
   - Calculate: productivity = workArea / hoursWorked

**Frontend Changes**:

1. **Enhanced Labor Expense Form**:
   - Labor type (from labour_type category)
   - Rate type dropdown (Regular/Overtime/Night)
   - Hours worked
   - Rate (auto-fill based on labor + rate type)
   - Work area completed (optional)

2. **Labor Cost Report**:
   - Breakdown by rate type
   - Compare: Budgeted hours vs Actual hours
   - Productivity metrics per labor type
   - Alert if overtime exceeds X%

3. **Labor Dashboard Widget**:
   - Total labor cost this month
   - Overtime percentage
   - Top 5 labor costs by type
```

---

# Phase 4: Automation

---

## 4.1 Invoice Scanning

### OCR Integration Prompt

```
@backend Implement invoice/bill scanning with OCR.

**Requirements**:

1. **Upload Endpoint**: `POST /api/expenses/scan`
   - Accept image file (JPEG, PNG, PDF)
   - Store original in document storage
   - Send to OCR service

2. **OCR Integration Options**:
   - Google Cloud Vision API
   - AWS Textract
   - Open source: Tesseract (fallback)

3. **Extraction Logic**:
   - Vendor name (match against existing parties)
   - Invoice number
   - Date
   - Line items (description, quantity, rate, amount)
   - Total amount
   - GST/Tax if present

4. **Response**:
   ```typescript
   {
     confidence: 0.85,
     extracted: {
       vendorName: "ABC Suppliers",
       vendorMatch: { id, name, confidence },
       invoiceNumber: "INV-2026-001",
       date: "2026-01-15",
       items: [{
         description: "Cement 43 Grade",
         quantity: 100,
         unit: "bags",
         rate: 350,
         amount: 35000
       }],
       total: 35000,
       tax: 6300
     },
     originalImageUrl: "..."
   }
   ```

5. **Review Flow**:
   - User reviews extracted data
   - Corrects any errors
   - Confirms to create expense
```

### Scan UI Prompt

```
@frontend Create invoice scanning UI flow.

**Flow**:

1. **Scan Entry Point** (in Add Expense):
   - Tab: "Manual" | "Scan Invoice"
   - Or floating action button on mobile

2. **Upload/Capture Screen**:
   - Drag & drop zone (web)
   - Camera capture button (mobile)
   - "Processing..." state with spinner

3. **Review Extracted Data**:
   - Side-by-side: Original image | Extracted form
   - All fields editable
   - Confidence indicators (green/yellow/red)
   - Vendor dropdown with suggested match highlighted
   - "Add as new vendor" option if no match

4. **Confirmation**:
   - Summary of expense to be created
   - "Create Expense" button
   - Option to add payment immediately

**Components**:
- ScanInvoiceTab.tsx (in AddExpenseModal)
- InvoiceUploader.tsx
- ExtractedDataReview.tsx
- VendorMatcher.tsx
```

---

## 4.2 Material Inventory

### Inventory System Prompt

```
@database @backend Create material inventory tracking system.

**Schema**:

```prisma
model InventoryItem {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String
  materialTypeId String   // Link to material_type category
  name           String
  unit           String
  
  // Stock tracking
  quantityIn     Decimal  @db.Decimal(15, 4)  // Total received
  quantityOut    Decimal  @db.Decimal(15, 4)  // Total used
  quantityBalance Decimal @db.Decimal(15, 4) // In - Out
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  movements InventoryMovement[]
}

model InventoryMovement {
  id              String   @id @default(cuid())
  inventoryItemId String
  type            MovementType // IN, OUT, ADJUSTMENT
  quantity        Decimal  @db.Decimal(15, 4)
  expenseId       String?  // Link to expense for IN
  reason          String?  // For OUT/ADJUSTMENT
  date            DateTime
  createdBy       String
  createdAt       DateTime @default(now())
  
  inventoryItem InventoryItem @relation(...)
  expense       Expense?      @relation(...)
}

enum MovementType {
  IN
  OUT
  ADJUSTMENT
  RETURN
  WASTAGE
}
```

**API Endpoints**:
- `GET /api/projects/:projectId/inventory` - List inventory items
- `POST /api/inventory/movement` - Record movement
- `GET /api/inventory/:id/movements` - Movement history
- `GET /api/projects/:projectId/inventory/alerts` - Discrepancy alerts
```

### Inventory UI Prompt

```
@frontend Create Material Inventory tracking UI.

**Requirements**:

1. **Inventory Tab** (in Project Detail):
   - Table: Material | Unit | In | Out | Balance | Status
   - Status: OK (green), Low (yellow), Discrepancy (red)

2. **Auto-create from Expense**:
   - When material expense created, auto-add to inventory (IN)
   - Prompt: "Add to inventory?" with quantity

3. **Record Usage (OUT)**:
   - "Record Usage" button per item
   - Form: Quantity used, Date, Reason/Location
   - Subtract from balance

4. **Discrepancy Alert**:
   - If balance doesn't match expected usage
   - "Expected: 100 bags used for 1000 sq ft, Actual: 120 bags"
   - Alert banner with "Investigate" action

5. **Movement History**:
   - Expandable row showing all movements
   - Type, Quantity, Date, By whom
```

---

# Mobile App Prompts

---

## Mobile Quick Entry Prompt

```
@mobile Create quick expense entry flow for site engineers.

**Context**:
- Site engineers need to log expenses quickly on-site
- Minimize taps, support offline
- Camera for receipts

**Screens**:

1. **Quick Add FAB**:
   - Floating action button on home screen
   - Opens quick entry sheet

2. **Quick Entry Sheet**:
   - Project selector (remember last used)
   - Expense type (3 big buttons: Material | Labour | Sub Work)
   - Party selector (recent parties first)
   - Amount (large number pad)
   - Optional: Photo capture
   - "Save" button

3. **Offline Support**:
   - Queue entries when offline
   - Show "Pending sync" badge
   - Auto-sync when online
   - Conflict resolution

4. **Recent Entries**:
   - List of today's entries
   - Quick duplicate action
   - Edit/Delete

**Navigation**:
- Home → FAB → Quick Entry
- Home → Project → Expenses → Add
```

---

## Usage Instructions

1. **Starting a Feature**: Copy the relevant prompt(s) for your feature
2. **Context**: Each prompt includes necessary context about existing code
3. **Order**: Follow the order: Schema → API → UI
4. **Testing**: Each backend prompt mentions test file locations
5. **Patterns**: Prompts reference existing code patterns to follow

---

*Last Updated: January 23, 2026*
