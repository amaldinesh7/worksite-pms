# Product Requirements Document (PRD)
## Worksite - Construction Project Management System

> **Version**: 1.0  
> **Last Updated**: January 23, 2026  
> **Status**: Active Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Product Goals & Objectives](#3-product-goals--objectives)
4. [Target Users & Use Cases](#4-target-users--use-cases)
5. [Feature Requirements](#5-feature-requirements)
6. [Technical Considerations](#6-technical-considerations)
7. [Roadmap & Phasing](#7-roadmap--phasing)
8. [Value Propositions](#8-value-propositions)
9. [User Interview Insights](#9-user-interview-insights)

---

## 1. Executive Summary

### Current Product Overview & Core Value Proposition

**Worksite** is a full-stack Construction Project Management System designed for small to medium-sized construction contractors, interior designers, and builders. It provides a centralized platform to manage projects, track expenses, handle vendor/labour relationships, and monitor project progress.

**Current Core Features:**
- Multi-tenant organization management with role-based access control
- Project lifecycle management (creation, stages, tasks)
- Party management (Vendors, Labours, Subcontractors, Clients)
- Expense tracking with category-based classification (Material, Labour, Sub Work)
- Payment tracking (IN/OUT) with credit balance management
- Document management with compression
- Team management with project-level access control

### Key Problems the Product Solves Today

1. **Project Organization**: Centralizes project data instead of scattered Excel sheets
2. **Expense Tracking**: Records expenses with party linkage and partial payment support
3. **Party Ledger**: Tracks transactions per vendor/labour across projects
4. **Stage-based Progress**: Breaks projects into stages with budget allocation
5. **Team Coordination**: Assigns team members and parties to stages/tasks

### Vision for the Evolved Product

The evolved Worksite should become the **"single source of truth"** for construction business owners to:
- Know exactly how much profit/loss they're making **per project, per stage, per item**
- Track **where budget overruns happen** (especially labor costs)
- See **real-time credit balances** across all vendors/projects
- Get **alerts** when timelines are at risk
- Enable **accountants and site engineers** to input data seamlessly
- Provide **owner-level dashboards** for quick decision-making

---

## 2. Current State Analysis

### Existing Features and Functionality

#### 2.1 Organization & Authentication
- Phone-based OTP authentication
- Multi-organization support
- Role-based permissions system
- Organization member management

#### 2.2 Project Management
```
Projects → Stages → Tasks
```
- Project creation with client assignment, location, dates, budget
- Project status tracking (ACTIVE, ON_HOLD, COMPLETED)
- Stage management with budget allocation, weight (% contribution), dates
- Task management within stages with days allocated

#### 2.3 Parties (External Stakeholders)

| Type | Purpose |
|------|---------|
| VENDOR | Material suppliers |
| LABOUR | Workers |
| SUBCONTRACTOR | Sub-work contractors |
| CLIENT | Project clients |

- Party detail page with project-wise transactions
- Payment and expense history per party

#### 2.4 Expense System
- Expense types: Material, Labour, Sub Work
- Links to: Project, Party, Stage (optional)
- Rate × Quantity calculation
- Partial payment support at creation
- Expense status: PENDING, APPROVED

#### 2.5 Payment System
- Payment types: IN (from client), OUT (to vendor/labour)
- Payment modes: CASH, CHEQUE, ONLINE
- Links to: Project, Party, Expense (optional)
- Credit balance calculation (expenses - payments)

#### 2.6 Documents
- File upload with automatic compression
- Project-scoped document storage

### Current User Flows

**Flow 1: Add Expense with Payment**
```
Select Project → Choose Expense Type → Select Party → 
Enter Rate/Quantity → Optional: Add Partial Payment → Save
```

**Flow 2: View Party Ledger**
```
Parties → Select Party → View Projects List → 
See Payments/Expenses tabs → Filter by Project
```

**Flow 3: Manage Project Stages**
```
Project Detail → Stages Tab → Create Stage → 
Add Tasks → Assign Members/Parties → Track Progress
```

### Technical Architecture Overview

| Layer | Technology |
|-------|------------|
| Web Frontend | React + Vite + Tailwind + shadcn/ui |
| Mobile | React Native + Expo + NativeWind |
| API | Fastify + Prisma |
| Database | PostgreSQL |
| Storage | MinIO / Supabase |
| Monorepo | Turborepo + pnpm |

### Identified Limitations / Pain Points

1. **No BOQ (Bill of Quantities) Integration**: Cannot compare quoted vs actual costs
2. **No Budget vs Actual Tracking**: Missing profit/loss visibility per stage/item
3. **No Labor Cost Variance Tracking**: Can't track if labor worked overtime (double pay)
4. **No Client Payment Schedule**: Missing milestone-based client payment tracking
5. **No Credits Hub**: No unified view of all pending payments across vendors - wont be building (Achieved with a filter in parties age - show only outstanding credits)
6. **No Timeline Alerts**: No notifications when deadlines approach
7. **No Inventory/Material Tracking**: Can't verify if supplied material was used
8. **No Reports/Analytics Dashboard**: Limited data visualization
9. **No Invoice/Bill Scanning**: Manual entry only

---

## 3. Product Goals & Objectives

### Additional Value to Deliver

| Goal | Value Proposition |
|------|-------------------|
| **Profit Visibility** | "See exactly how much you're making on every project, every stage, every line item" |
| **Cost Control** | "Know the moment you're going over budget, not after the project ends" |
| **Credit Management** | "Never lose track of who owes you and who you owe" |
| **Timeline Confidence** | "Get alerts before deadlines slip, not after" |
| **Effortless Entry** | "Your team enters data in seconds; you see insights instantly" |

### Problems Needing Better Solutions

1. **Quoted vs Actual Comparison** (HIGH PRIORITY)
   - User quote: *"Every businessman would want to know how much he thought he will spend and how much did he spend"*

2. **Labor Cost Variance** (HIGH PRIORITY)
   - User quote: *"Labor has to work at night, he'll charge double. That budget for labor factored for every work - that is very important"*

3. **Multi-Project Vendor Tracking** (MEDIUM PRIORITY)
   - User quote: *"Single vendor supplying for various projects... how do you know which project's payment is pending?"*

4. **Material Usage Verification** (MEDIUM PRIORITY)
   - User quote: *"Check whether material which is supplied is being used also... somebody has stolen it"*

5. **Payment Narration/History** (MEDIUM PRIORITY)
   - User quote: *"After five years, if he comes saying 1 lakh is pending, I can see why it is pending"*

### Success Metrics & KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users | 60%+ of org members | Weekly login rate |
| Expense Entry Time | < 30 seconds | Time to complete |
| Budget Accuracy | < 5% variance | Quoted vs Actual |
| Credit Visibility | 100% tracked | All pending amounts visible |
| Project Completion Rate | 90%+ on time | Deadline adherence |

---

## 4. Target Users & Use Cases

### Current User Personas

| Persona | Role | Primary Use |
|---------|------|-------------|
| **Business Owner** | Decision Maker | Dashboard, Profit/Loss, Approvals |
| **Site Engineer** | Field Operations | Daily entries, Task updates, Photos |
| **Accountant** | Finance | Payments, Expenses, Reconciliation |
| **Purchase Manager** | Procurement | Vendor management, Material tracking |

### Proposed New/Expanded User Segments

| Persona | Opportunity |
|---------|-------------|
| **Project Manager** | Timeline management, Resource allocation |
| **Client (Limited Access)** | Progress viewing, Payment history |
| **Supervisor** | Labor attendance, Daily work logs |

### Jobs-to-be-Done Framework

| User | Job | Current Pain | Solution |
|------|-----|--------------|----------|
| Owner | Know if project is profitable | Manual calculation end of project | Real-time P&L per project |
| Owner | Track pending credits | Ask accountant, check Tally | Credits Hub dashboard |
| Accountant | Record payment | Enter in Tally + Excel | Single entry, auto-categorized |
| Site Engineer | Log daily expenses | WhatsApp receipts, forget | Mobile app quick entry |
| Owner | Check timeline status | Call site engineer | Dashboard with alerts |

---

## 5. Feature Requirements

### 5.1 BOQ / Budget Management (MUST-HAVE) - Phase 1

**User Story**: As a business owner, I want to enter my quoted budget line-by-line so I can compare it against actual expenses.

**Functional Requirements**:
- Create budget items with: Category, Description, Quoted Rate, Quoted Quantity, Quoted Total
- Link budget items to stages
- Auto-calculate variance when expenses are recorded
- Show: Quoted | Actual | Variance | % Variance

**Value Impact**: HIGH - Core differentiator mentioned multiple times in interview

---

### 5.1.1 BOQ Import from File (MUST-HAVE) - Phase 1

**User Story**: As a business owner, I want to import my existing BOQ document (PDF/Excel) so I don't have to manually enter hundreds of line items.

**Context**: Real construction BOQs contain 100-400+ line items organized by sections (Earthwork, Concrete, Plumbing, etc.). Manual entry is impractical.

**Functional Requirements**:

1. **File Upload**
   - Support: PDF, Excel (.xlsx), CSV
   - Max size: 25MB
   - Store original file as project document

2. **AI-Assisted Parsing**
   - Extract table structure from uploaded file
   - Identify sections/categories (e.g., EARTHWORK, PLUMBING)
   - Parse line items: Item Code, Description, Unit, Qty, Rate, Amount
   - Skip summary rows ("TOTAL FOR...") and note rows
   - Flag items with calculation mismatches or low confidence

3. **Mandatory Human Review** (Zero-Error-Margin)
   - Display all parsed items in editable table grouped by section
   - Highlight flagged items (yellow) requiring attention
   - Show section totals with validation (parsed vs calculated)
   - Allow: Edit any field, Remove items, Add missing items
   - User must confirm before items are saved

4. **Commit & Storage**
   - Save confirmed items as BudgetItems
   - Link items to project stages (optional, during review)
   - Store original file in Documents with link to import
   - Log import: file name, item count, total amount, imported by, timestamp

**BOQ Structure Handled**:
| Column | Description |
|--------|-------------|
| SR NO / Item Code | Unique identifier (e.g., R2-CS-EW-1) |
| Description | Detailed work specification (can be 500+ chars) |
| Unit | Measurement unit (Cum, Sqm, RMT, EACH, Kg, etc.) |
| Qty | Quantity |
| Rate | Rate per unit |
| Amount | Total (Qty × Rate) |

**Edge Cases**:
- Nested items ("Extra over above item...")
- Provisional items (estimates)
- Sub-items (R2-CS-PS-172a-2)
- Long descriptions with specifications
- Multiple sections with subtotals

**Value Impact**: HIGH - Eliminates hours of manual data entry, reduces errors

---

### 5.2 Profit & Loss Dashboard (MUST-HAVE) - Phase 1

**User Story**: As a business owner, I want to see my profit/loss at a glance for each project.

**Functional Requirements**:
- Project-level P&L: Budget - Expenses = Margin
- Stage-level breakdown
- Category-level breakdown (Material, Labour, Sub Work)
- Trend over time

**Value Impact**: HIGH - *"Owners love to see what is the money he's making at every quotation"*

---

### 5.3 Credits Hub (MUST-HAVE) - Phase 1

**User Story**: As a business owner, I want a single view of all pending payments (receivables and payables).

**Functional Requirements**:
- **Payables**: Amount owed to vendors/labours/subcontractors
- **Receivables**: Amount owed by clients
- Filter by: Project, Party, Date range
- Export to Excel

**Value Impact**: HIGH - *"Pending is always linked to the receivable from the customer"*

---

### 5.4 Client Payment Schedule (MUST-HAVE) - Phase 2

**User Story**: As a business owner, I want to track client payments against milestones.

**Functional Requirements**:
- Define payment milestones per project (e.g., 20% advance, 30% at foundation)
- Link milestones to stages
- Track received vs expected
- Show client-facing payment summary

**Value Impact**: HIGH - Mentioned as next priority feature in interview

---

### 5.5 Labor Cost Tracking Enhancement (SHOULD-HAVE) - Phase 3

**User Story**: As a business owner, I want to track labor cost variances (regular vs overtime).

**Functional Requirements**:
- Add labor rate types: Regular, Overtime, Night
- Track planned vs actual labor hours
- Calculate variance alerts
- Productivity metrics (sq ft per labor per day)

**Value Impact**: HIGH - *"Fluctuating factor is the labor"*

---

### 5.6 Timeline Alerts & Notifications (SHOULD-HAVE) - Phase 3

**User Story**: As a business owner, I want to receive alerts when project timelines are at risk.

**Functional Requirements**:
- Deadline approaching alerts (configurable: 5, 3, 1 day before)
- Stage/Task overdue notifications
- Push notifications (mobile) + in-app
- Daily digest email option

**Value Impact**: MEDIUM - *"Timeline tool, very good tool"*

---

### 5.7 Payment Narration & History (SHOULD-HAVE) - Phase 2

**User Story**: As an accountant, I want to add notes to explain why a payment is pending.

**Functional Requirements**:
- Rich notes field on payments with history
- Dispute/Hold status with reason
- Audit trail of all changes
- Search payments by notes

**Value Impact**: MEDIUM - *"Narration that why this vendor sometimes doesn't get paid"*

---

### 5.8 Invoice/Bill Scanning (NICE-TO-HAVE) - Phase 4

**User Story**: As a site engineer, I want to scan an invoice and have it auto-fill expense details.

**Functional Requirements**:
- Camera capture or file upload
- OCR extraction: Vendor, Amount, Date, Items
- Review & confirm before saving
- Store original image

**Value Impact**: MEDIUM - Already shown in UI mockup during interview

---

### 5.9 Material Inventory Tracking (NICE-TO-HAVE) - Phase 4

**User Story**: As a business owner, I want to verify that materials supplied were actually used.

**Functional Requirements**:
- Track: Material In (purchased) vs Material Out (used)
- Link to expense records
- Wastage/Return tracking
- Alerts for discrepancies

**Value Impact**: MEDIUM - *"Check your store, inventory room whether this much material is taken back"*

---

### 5.10 Client Portal (NICE-TO-HAVE) - Phase 5

**User Story**: As a client, I want to see my project progress and payment history.

**Functional Requirements**:
- Limited view: Progress %, Photos, Payment history
- Configurable visibility by owner
- No cost/expense visibility
- Optional: Push notifications for updates

**Value Impact**: LOW - *"Very difficult to get clients to use app"*

---

## 6. Technical Considerations

### Required Schema Changes

```prisma
// New: Budget/BOQ
model BudgetItem {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String
  stageId        String?
  category       String   // Material, Labour, Sub Work
  description    String
  quotedRate     Decimal  @db.Decimal(15, 2)
  quotedQuantity Decimal  @db.Decimal(15, 4)
  unit           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization Organization @relation(...)
  project      Project      @relation(...)
  stage        Stage?       @relation(...)
  expenses     Expense[]    // Link actual expenses
}

// New: Payment Milestones
model PaymentMilestone {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String
  stageId        String?
  name           String
  percentage     Decimal  @db.Decimal(5, 2)
  expectedAmount Decimal  @db.Decimal(15, 2)
  dueDate        DateTime?
  status         MilestoneStatus @default(PENDING)
  
  // Relations
  payments Payment[]
}

// Enhanced: Expense
model Expense {
  // ... existing fields
  budgetItemId String? // Link to BOQ
  budgetItem   BudgetItem? @relation(...)
}

// Enhanced: Payment
model Payment {
  // ... existing fields
  milestoneId String?
  milestone   PaymentMilestone? @relation(...)
  holdReason  String?           // For dispute tracking
}
```

### API Additions

| Endpoint | Purpose |
|----------|---------|
| `GET /api/projects/:id/budget` | Get BOQ with variance |
| `POST /api/projects/:id/budget-items` | Add budget line |
| `GET /api/credits-hub` | Unified payables/receivables |
| `GET /api/projects/:id/pnl` | Profit & Loss summary |
| `GET /api/projects/:id/milestones` | Payment milestones |
| `POST /api/alerts/configure` | Set notification preferences |

### Performance Requirements

- Dashboard load: < 2 seconds
- Expense entry: < 500ms response
- Search: < 1 second for 10K+ records
- Mobile offline: Queue entries, sync when online

### Security Considerations

- All financial data encrypted at rest
- Audit logs for payment modifications
- Role-based access to P&L data
- Client portal: Strict data isolation

---

## 7. Roadmap & Phasing

### Phase 1: Core Financial Visibility (4-6 weeks)
**Goal**: Enable profit/loss tracking

| Feature | Effort | Priority |
|---------|--------|----------|
| BOQ/Budget Management | 2 weeks | P0 |
| Budget vs Actual Variance | 1 week | P0 |
| Project P&L Dashboard | 1 week | P0 |
| Credits Hub | 1 week | P0 |

**Dependencies**: None (builds on existing expense/payment system)

---

### Phase 2: Client & Payment Management (3-4 weeks)
**Goal**: Complete payment lifecycle

| Feature | Effort | Priority |
|---------|--------|----------|
| Payment Milestones | 1.5 weeks | P1 |
| Client Payment Tracking | 1 week | P1 |
| Payment Narration | 0.5 weeks | P1 |

**Dependencies**: Phase 1 (Credits Hub)

---

### Phase 3: Operational Excellence (3-4 weeks)
**Goal**: Proactive management

| Feature | Effort | Priority |
|---------|--------|----------|
| Timeline Alerts | 1.5 weeks | P1 |
| Labor Cost Enhancement | 1.5 weeks | P1 |
| Daily Digest Emails | 1 week | P2 |

**Dependencies**: None

---

### Phase 4: Automation & Intelligence (4-6 weeks)
**Goal**: Reduce manual effort

| Feature | Effort | Priority |
|---------|--------|----------|
| Invoice Scanning (OCR) | 3 weeks | P2 |
| Material Inventory | 2 weeks | P2 |
| AI Insights (optional) | 2 weeks | P3 |

**Dependencies**: Phase 1-3 complete

---

### Phase 5: Ecosystem Expansion (Future)
**Goal**: Expand user base

| Feature | Effort | Priority |
|---------|--------|----------|
| Client Portal | 3 weeks | P3 |
| Supplier Integration | TBD | P3 |
| Multi-currency | TBD | P3 |

---

## 8. Value Propositions

### Primary Hook (For Business Owners)

> **"Know your profit before the project ends, not after."**
> 
> Worksite shows you exactly how much you're making (or losing) on every project, every stage, every line item — in real-time. No more surprises at the end.

### Secondary Hooks

1. **For the Budget-Conscious Owner**
   > "See the moment you go over budget. Get alerts before it's too late."

2. **For the Credit-Worried Owner**
   > "One dashboard shows every rupee you owe and every rupee owed to you. Across all vendors, all projects."

3. **For the Time-Strapped Owner**
   > "Your team enters data in 30 seconds. You see insights instantly. No more calling site engineers for updates."

4. **For the Growth-Minded Owner**
   > "Start free for small projects. Scale as you grow. Built by someone who understands construction."

### Differentiation Statement

> "Other tools give you Excel on a screen. Worksite gives you **answers**:
> - Is this project profitable?
> - Who do I need to pay this week?
> - Will we finish on time?
> 
> Built for contractors who want to run a business, not manage spreadsheets."

---

## 9. User Interview Insights

### Key Quotes & Implications

| Topic | Quote | Implication |
|-------|-------|-------------|
| Profit tracking | *"Every businessman would want that how much he thought he will spend and how much did he spend"* | BOQ comparison is critical |
| Labor costs | *"Fluctuating factor is the labor... he'll charge double"* | Need labor variance tracking |
| Credit tracking | *"Pending is always linked to the receivable from the customer"* | Link payables to receivables |
| Payment history | *"After five years, if he comes saying 1 lakh is pending, I can see why"* | Need payment narration |
| Material verification | *"Check whether material supplied is being used"* | Inventory tracking |
| Timeline alerts | *"Date of delivery was tenth and today is fifth"* | Proactive notifications |
| Client adoption | *"High net worth individuals... very difficult"* | Client portal is low priority |
| Pricing | *"Just 1,000 rupees for three months"* | Low entry price, monthly subscription |

### Workflow Insights

1. **BOQ Creation**: Happens at project bidding stage, includes all line items with rates
2. **Purchase Flow**: Purchase manager gets target rates, scouts vendors, finalizes
3. **Payment Flow**: Accountant makes entries under project heads, categorized by type
4. **Tracking Tool**: Currently using Tally for accounting, Excel for project tracking
5. **Client Interaction**: Minimal in design projects (PMC handles), more in direct projects

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| BOQ | Bill of Quantities - itemized list of materials, labor, and costs |
| PMC | Project Management Consultant |
| Turnkey Project | End-to-end project where contractor handles everything |
| Credit | Pending payment owed to a party |
| Receivable | Payment expected from client |
| Payable | Payment owed to vendor/labour |

---

## Appendix B: Competitor Landscape

| Tool | Strength | Gap Worksite Can Fill |
|------|----------|----------------------|
| Tally | Accounting | No project-level tracking |
| Excel | Flexibility | No real-time, no mobile |
| Zoho Projects | Project management | Not construction-specific |
| Buildertrend | Construction | Too expensive, US-focused |

---

*Document maintained by: Product Team*  
*Next review date: February 2026*
