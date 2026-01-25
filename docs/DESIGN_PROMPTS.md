# UI/UX Design Prompts
## Worksite - Screen Design Guide for AI Design Tools

> **Purpose**: Prompts for AI design tools (Figma AI, Galileo AI, Uizard, v0.dev, etc.) to generate UI mockups  
> **Brand**: Deep slate-teal (#3D5A5B), clean/minimal, professional construction management aesthetic  
> **Target Users**: Construction contractors, interior builders, small-medium builders

---

## Design System Context

### Brand Colors
```
Primary: #3D5A5B (Deep Slate Teal)
Primary Light: #4A6B6C
Primary Dark: #2D4445
Background: #F8FAFB (Light Gray)
Card Background: #FFFFFF
Text Primary: #1A1A1A
Text Secondary: #6B7280
Success: #10B981 (Green)
Warning: #F59E0B (Amber)
Danger: #EF4444 (Red)
```

### Typography
```
Font Family: Inter or SF Pro Display
Headings: Semi-bold, tracking tight
Body: Regular, 14-16px
Numbers/Money: Tabular figures, medium weight
```

### Design Principles
1. **Data-Dense but Clear**: Show lots of information without clutter
2. **Action-Oriented**: Clear CTAs, obvious next steps
3. **Trust-Building**: Professional, reliable feel for financial data
4. **Mobile-First Thinking**: Works on tablet at construction site

---

# Phase 1: Core Financial Visibility

---

## 1.1 Budget/BOQ Tab Design

### Screen: Project Budget Tab (Desktop)

```
Design a desktop web application screen for a construction project management tool.

**Screen**: Project Budget Tab
**Context**: User is viewing budget details for a specific project

**Layout** (1440px wide):

1. **Header Section** (sticky):
   - Breadcrumb: Projects > Villa Construction > Budget
   - Page title: "Project Budget"
   - Primary button: "+ Add Budget Item" (teal background)

2. **Summary Cards Row** (4 cards, equal width):
   Card 1: "Total Quoted"
   - Large number: ₹50,00,000
   - Subtitle: "12 line items"
   
   Card 2: "Actual Spent"
   - Large number: ₹32,50,000
   - Subtitle: "65% of budget"
   - Progress bar below (65% filled, teal)
   
   Card 3: "Variance"
   - Large number: +₹17,50,000
   - Green text/icon indicating under budget
   - Subtitle: "35% remaining"
   
   Card 4: "Projected Margin"
   - Large number: 28%
   - Green badge: "Healthy"
   - Subtitle: "Based on current spend"

3. **Filter/View Bar**:
   - Tabs: "All Items" | "By Category" | "By Stage"
   - Search input: "Search budget items..."
   - Filter dropdown: Category filter
   - Sort dropdown: "Sort by: Variance"

4. **Budget Items Table**:
   Columns: Category | Description | Unit | Qty | Rate | Quoted Total | Actual | Variance | Actions
   
   Sample rows:
   - Material | Cement 43 Grade | bags | 500 | ₹380 | ₹1,90,000 | ₹1,75,000 | +₹15,000 (green) | ⋮
   - Material | Steel TMT Bars | kg | 2000 | ₹75 | ₹1,50,000 | ₹1,62,000 | -₹12,000 (red) | ⋮
   - Labour | Mason Work | sq ft | 3000 | ₹45 | ₹1,35,000 | ₹1,20,000 | +₹15,000 (green) | ⋮

   **Row styling**:
   - Alternate row backgrounds
   - Variance column: Green text for positive, Red for negative
   - Hover state shows action menu
   - Over-budget rows have subtle red left border

5. **Empty State** (when no items):
   - Illustration: Simple line drawing of a checklist/budget
   - Title: "No budget items yet"
   - Subtitle: "Add your quoted items to start tracking budget vs actual"
   - CTA button: "Add First Item"

**Style**:
- Clean, minimal design
- Lots of whitespace
- Cards have subtle shadow
- Table has clean borders, no heavy styling
- Use teal (#3D5A5B) for primary actions and positive indicators
```

### Screen: Add Budget Item Modal

```
Design a modal dialog for adding a budget item in a construction management app.

**Modal**: Add Budget Item
**Size**: 500px wide, auto height

**Layout**:

1. **Header**:
   - Title: "Add Budget Item"
   - Close (X) button top right

2. **Form Fields**:

   **Category** (required)
   - Dropdown select
   - Options: Material, Labour, Sub Work, Other
   - Placeholder: "Select category"

   **Description** (required)
   - Text input
   - Placeholder: "e.g., Cement 43 Grade, Electrical Wiring"
   - Helper text: "Be specific for easy expense matching"

   **Link to Stage** (optional)
   - Dropdown select
   - Options: [List of project stages]
   - Placeholder: "Select stage (optional)"

   **Unit** (optional)
   - Text input, smaller width
   - Placeholder: "e.g., bags, sq ft, kg"

   **Quantity** (required)
   - Number input
   - Placeholder: "0"

   **Rate** (required)
   - Currency input with ₹ prefix
   - Placeholder: "0.00"

   **Calculated Total** (read-only)
   - Disabled input showing: ₹ [Qty × Rate]
   - Light gray background
   - Updates live as user types

3. **Footer**:
   - Cancel button (outline style)
   - "Add Item" button (teal, primary)

**Validation States**:
- Required fields show red border + error message when empty
- Quantity and Rate must be > 0

**Style**:
- Clean form layout
- Generous spacing between fields
- Labels above inputs
- Subtle rounded corners on inputs
```

---

## 1.2 BOQ Import Flow

### Screen: Import BOQ Modal

```
Design a BOQ (Bill of Quantities) import modal for a construction project management app.

**Modal**: Import BOQ
**Context**: User wants to import an existing BOQ document instead of manual entry

**Layout** (520px wide):

1. **Header**:
   - Title: "Import BOQ"
   - Close (X) button

2. **Drop Zone**:
   - Large dashed border area
   - Icon: Document upload icon
   - Text: "Drop your BOQ file here"
   - Subtext: "or click to browse"
   - Supported formats: "PDF, Excel (.xlsx), CSV • Max 25MB"

3. **How It Works** (info box):
   - Step 1: Upload your BOQ file
   - Step 2: AI extracts line items
   - Step 3: You review & confirm all items
   - Note: "You'll have full control to edit before saving"

4. **Footer**:
   - Cancel button

**Style**:
- Clean, simple upload interface
- Reassuring messaging about review step
- Teal accent on drop zone hover
```

### Screen: BOQ Parsing Progress

```
Design a parsing progress screen for BOQ import.

**Modal**: Parsing BOQ
**Context**: File uploaded, AI is extracting data

**Layout** (480px wide):

1. **File Info**:
   - File icon + name: "ETH_Civil_BOQ.pdf"
   - File size: "2.4 MB"

2. **Progress**:
   - Progress bar with percentage
   - Status text updates:
     - "Analyzing document structure..."
     - "Extracting line items..."
     - "Validating calculations..."

3. **Live Stats** (appear as parsing completes):
   - ✓ 12 sections found
   - ✓ 370 line items extracted
   - ⚠️ 8 items flagged for review

4. **Cancel Button**

**Style**:
- Animated progress bar
- Checkmarks appear as steps complete
- Warning icon for flagged items
```

### Screen: BOQ Review Page (Full Page)

```
Design a full-page BOQ review screen for construction project management.

**Screen**: Review Imported BOQ
**Context**: AI has parsed the BOQ, user must review and confirm before saving

**Layout** (Desktop, 1440px):

1. **Header Bar**:
   - Back arrow + "Review Imported BOQ"
   - File name badge: "ETH_Civil_BOQ.pdf"
   - Actions: [Cancel Import] [Confirm & Add Items] (primary)

2. **Summary Cards Row** (4 cards):
   - Line Items: 370 parsed
   - Sections: 12 found
   - Need Review: 8 flagged (amber)
   - Total Amount: ₹15.42 Cr

3. **Filter Bar**:
   - Search: "Search items..."
   - Filter: [Show All ▼] | Show Flagged Only
   - Bulk action: [Link All to Stage ▼]

4. **Section Accordion List**:

   Each section (collapsible):
   ```
   ▼ EARTHWORK                                    14 items • ₹1.16 Cr
   ─────────────────────────────────────────────────────────────────
   
   | ✓ | Code       | Description              | Unit | Qty   | Rate  | Amount    |
   |---|------------|--------------------------|------|-------|-------|-----------|
   | ☑ | R2-CS-EW-1 | Excavation for found...  | Cum  | 8,500 | ₹307  | ₹26.09L   |
   | ☑ | R2-CS-EW-2 | Extra over above...      | Cum  | 900   | ₹71   | ₹63,900   |
   | ⚠️| R2-CS-EW-3 | Excavation in soft...    | Cum  | 8,000 | ₹500  | ₹40.00L   |
   |   |            | ⚠️ Review: Verify amount |      |       |       | [Edit]    |
   
   Section Total: ₹1,16,28,350 ✓ (matches calculated)
   [+ Add Missing Item]
   ```

   **Row States**:
   - Normal: White background, checkbox checked
   - Flagged: Yellow background, warning icon, "Review" note
   - Unchecked: Grayed out, will not be imported

5. **Sticky Footer**:
   - Items selected: 362 of 370
   - Total: ₹15,42,00,000
   - [Cancel Import] [Confirm & Add 362 Items]

**Interactions**:
- Click section header to expand/collapse
- Click row to edit in modal
- Uncheck to exclude from import
- Hover description to see full text

**Style**:
- Clean table design
- Yellow highlight for flagged items
- Green checkmarks for validated sections
- Collapsible sections for large BOQs
```

### Screen: Edit BOQ Item Modal

```
Design a modal for editing a parsed BOQ item during review.

**Modal**: Edit Budget Item
**Context**: User clicked Edit on a flagged or any item

**Layout** (520px wide):

1. **Header**:
   - Title: "Edit Budget Item"
   - Warning banner (if flagged): "⚠️ Amount doesn't match Qty × Rate"

2. **Form Fields**:

   **Item Code**
   - Text input, pre-filled
   
   **Section**
   - Dropdown: EARTHWORK, CONCRETE, PLUMBING, etc.
   
   **Description**
   - Textarea (expandable)
   - Full parsed description shown
   
   **Category**
   - Dropdown: Material | Labour | Sub Work | Other
   
   **Unit**
   - Dropdown with common units: Cum, Sqm, RMT, EACH, Kg, etc.

   **Quantity / Rate / Amount** (row):
   - Three inputs side by side
   - Live calculation: "Qty × Rate = Amount"
   - Validation indicator: ✓ or ⚠️

   **Link to Stage** (optional)
   - Dropdown of project stages

   **☐ Mark as Provisional**
   - Checkbox for estimates

3. **Footer**:
   - [Remove from Import] (danger, left)
   - [Cancel] [Save Changes] (right)

**Style**:
- Warning banner prominent if flagged
- Live calculation validation
- Clear form layout
```

---

## 1.3 Budget Variance Visualization

### Screen: Budget Variance View

```
Design a budget variance visualization screen for construction project management.

**Screen**: Budget Variance Analysis
**Context**: Showing quoted vs actual comparison with visual charts

**Layout**:

1. **Variance Alert Banner** (conditional, top of page):
   - Yellow/amber background
   - Icon: Warning triangle
   - Text: "3 items are over budget by more than 10%"
   - Link: "Review now →"

2. **Category Breakdown Chart**:
   - Horizontal bar chart
   - 3 categories: Material, Labour, Sub Work
   - Each category shows two bars:
     - Gray bar: Quoted amount
     - Colored bar: Actual amount (teal if under, red if over)
   - Legend showing Quoted vs Actual
   - Amounts displayed at end of bars

   Example:
   ```
   Material    ████████████████░░░░  ₹25L / ₹30L quoted
   Labour      ██████████████████    ₹18L / ₹15L quoted (over!)
   Sub Work    ████████░░░░░░░░░░░░  ₹8L / ₹20L quoted
   ```

3. **Stage-wise Variance Table**:
   | Stage | Budget | Actual | Variance | Status |
   | Foundation | ₹10L | ₹9.5L | +₹50K | ✓ On Track |
   | Structure | ₹25L | ₹27L | -₹2L | ⚠️ Over Budget |
   | Finishing | ₹15L | ₹8L | - | 🔄 In Progress |

   Status badges:
   - Green check: On Track (under budget)
   - Yellow warning: Over Budget
   - Blue circle: In Progress (not complete)
   - Gray: Not Started

4. **Variance Trend Mini-Chart**:
   - Small line chart showing variance over time
   - X-axis: Weeks/Months
   - Y-axis: Cumulative variance
   - Line color: Green when positive, transitions to red when negative

**Style**:
- Charts use brand colors
- Clean, minimal chart styling (no heavy gridlines)
- Data labels are readable
- Responsive layout
```

---

## 1.3 Project P&L Dashboard

### Screen: Project Financials Dashboard

```
Design a financial dashboard for a construction project management application.

**Screen**: Project Financials / P&L Dashboard
**User**: Business owner checking project profitability

**Layout** (Desktop, 1440px):

1. **Hero Stats Row** (4 large cards):

   Card 1: "Contract Value"
   - Icon: Document/Contract icon
   - Value: ₹50,00,000
   - Subtitle: "Total project value"
   - Neutral styling

   Card 2: "Total Expenses"
   - Icon: Expense/Money out icon
   - Value: ₹35,00,000
   - Subtitle: "70% of contract"
   - Progress ring showing 70%

   Card 3: "Gross Profit"
   - Icon: Trending up icon
   - Value: ₹15,00,000
   - Badge: "On Track" (green)
   - Subtitle: "Projected profit"

   Card 4: "Margin"
   - Icon: Percentage icon
   - Value: 30%
   - Visual: Semi-circular gauge
   - Color: Green (healthy margin)

2. **Two-Column Layout Below**:

   **Left Column (60%)**:
   
   **Expense Breakdown Donut Chart**:
   - Title: "Expenses by Category"
   - Donut chart with center showing total
   - Segments:
     - Material: 45% (Blue)
     - Labour: 35% (Green)
     - Sub Work: 15% (Orange)
     - Other: 5% (Gray)
   - Legend below with amounts

   **Stage-wise Budget Chart**:
   - Title: "Budget vs Actual by Stage"
   - Grouped horizontal bar chart
   - Each stage: Budget bar (gray) + Actual bar (teal/red)
   - Stages: Foundation, Structure, Electrical, Plumbing, Finishing

   **Right Column (40%)**:

   **Payment Status Card**:
   - Title: "Client Payments"
   - Progress bar: ₹30L / ₹50L received
   - Visual: 60% filled progress bar
   - List of recent payments (last 3)
   - Link: "View all payments →"

   **Quick Stats List**:
   - Days Remaining: 45 days
   - Expenses This Month: ₹4,50,000
   - Pending Approvals: 3 expenses
   - Team Members: 8 assigned

   **Alerts Card**:
   - Title: "Attention Needed"
   - List items with icons:
     - ⚠️ Labour costs 12% over budget
     - 📅 Foundation stage deadline in 5 days
     - 💰 ₹5L payment due from client

**Style**:
- Dashboard feel with card-based layout
- Charts are clean and modern
- Use consistent iconography
- Color coding for status (green=good, yellow=warning, red=alert)
- Subtle shadows on cards
- Teal accent color for positive metrics
```

### Screen: P&L Mobile View

```
Design a mobile-optimized P&L summary screen for construction project management.

**Screen**: Project P&L (Mobile, 375px)
**Context**: Business owner checking profitability on phone

**Layout** (scrollable):

1. **Header**:
   - Back arrow
   - Project name: "Villa Construction"
   - Share icon

2. **Profit Summary Card** (hero):
   - Large centered number: ₹15,00,000
   - Label: "Projected Profit"
   - Margin badge: "30% margin"
   - Background: Subtle gradient or teal tint

3. **Key Metrics Row** (3 items, horizontal scroll if needed):
   - Contract: ₹50L
   - Expenses: ₹35L
   - Remaining: ₹15L

4. **Expense Breakdown** (simplified):
   - Horizontal stacked bar showing category split
   - Legend below: Material | Labour | Sub Work
   - Tap to see details

5. **Recent Activity**:
   - Last 5 expenses/payments
   - Simple list with amount and date
   - Pull to refresh

6. **Bottom Action**:
   - Floating button: "Add Expense"

**Style**:
- Large touch targets
- Readable numbers (18px+)
- Minimal chrome, maximum data
- Swipe gestures for navigation
```

---

## 1.4 Credits Hub

### Screen: Credits Hub Main Page

```
Design a Credits Hub page for tracking receivables and payables in construction management.

**Screen**: Credits Hub
**User**: Business owner or accountant tracking money owed

**Layout** (Desktop, 1440px):

1. **Page Header**:
   - Title: "Credits Hub"
   - Subtitle: "Track all pending payments at a glance"
   - Action buttons: "Export" (outline), "Record Payment" (primary)

2. **Summary Cards Row** (3 cards):

   Card 1: "Receivables"
   - Icon: Arrow pointing in (money coming)
   - Value: ₹25,00,000
   - Subtitle: "From 5 clients"
   - Color accent: Green/Teal

   Card 2: "Payables"
   - Icon: Arrow pointing out (money going)
   - Value: ₹18,00,000
   - Subtitle: "To 23 parties"
   - Color accent: Orange

   Card 3: "Net Position"
   - Icon: Balance/Scale icon
   - Value: +₹7,00,000
   - Badge: "Positive" (green)
   - Subtitle: "You're owed more than you owe"

3. **Tabs**: "Receivables" | "Payables"

4. **Receivables Tab Content**:

   **Aging Overview Bar**:
   - Horizontal stacked bar showing aging distribution
   - Segments: Current (green) | 1-30 days (teal) | 31-60 (yellow) | 61-90 (orange) | 90+ (red)
   - Amounts labeled on each segment

   **Receivables Table**:
   | Client | Project | Contract | Received | Pending | Aging | Actions |
   | ABC Corp | Office Building | ₹80L | ₹55L | ₹25L | 45 days | Record Payment |
   | Mr. Sharma | Villa Project | ₹50L | ₹30L | ₹20L | 12 days | Record Payment |

   - Row expansion: Shows payment milestones and history
   - Aging column: Color-coded badge (green/yellow/orange/red)
   - Sortable columns
   - Filter by aging bucket

5. **Payables Tab Content** (similar structure):

   **Payables Table**:
   | Party | Type | Total Owed | Aging | Projects | Actions |
   | Steel Suppliers | Vendor | ₹3,50,000 | 30 days | 2 projects | View Details |
   | Raj Electricals | Subcontractor | ₹1,20,000 | 60 days | 1 project | View Details |

   - Party type icon/badge
   - Row expansion: Shows project-wise breakdown
   - "Mark for Payment" checkbox for bulk actions

6. **Empty State**:
   - Illustration: Balanced scale or checkmark
   - Title: "All caught up!"
   - Subtitle: "No pending receivables/payables"

**Style**:
- Clean table design
- Color-coded aging (urgency increases with age)
- Clear visual hierarchy
- Action buttons easily accessible
- Expandable rows for details
```

### Screen: Credits Hub Mobile

```
Design a mobile Credits Hub screen for construction project management.

**Screen**: Credits Hub (Mobile, 375px)

**Layout**:

1. **Header**:
   - Title: "Credits Hub"
   - Filter icon (top right)

2. **Summary Section**:
   - Two side-by-side cards:
     - Receivables: ₹25L ↓
     - Payables: ₹18L ↑
   - Net position below: "+₹7L (Positive)"

3. **Segment Control**: "Receivables" | "Payables"

4. **List View** (scrollable):
   
   Each item card:
   ```
   ┌─────────────────────────────────┐
   │ ABC Corp                    ₹25L│
   │ Office Building Project         │
   │ ━━━━━━━━━━━░░░░ 70% received   │
   │ 45 days outstanding    [Pay →] │
   └─────────────────────────────────┘
   ```
   
   - Swipe left for quick actions
   - Tap to expand details
   - Color indicator for aging (left border)

5. **Floating Action Button**:
   - "Record Payment" (teal)

6. **Pull to Refresh**

**Style**:
- Card-based list
- Large touch targets
- Swipe gestures
- Quick glance information
```

---

# Phase 2: Client & Payment Management

---

## 2.1 Payment Milestones

### Screen: Payment Milestones Timeline

```
Design a payment milestones view for tracking client payments in construction projects.

**Screen**: Payment Milestones (within Project Detail)
**Context**: Tracking client payment schedule against project progress

**Layout**:

1. **Section Header**:
   - Title: "Payment Schedule"
   - Subtitle: "Track client payments against milestones"
   - Button: "+ Add Milestone"

2. **Progress Summary**:
   - Large progress bar: ₹30L / ₹50L (60%)
   - Text: "60% of contract value received"
   - Next due: "Foundation Complete - ₹10L due Feb 15"

3. **Visual Timeline** (horizontal):
   ```
   ●━━━━━━━●━━━━━━━◐━━━━━━━○━━━━━━━○
   Advance  Foundation  Structure  Finishing  Handover
   ₹10L     ₹12.5L      ₹12.5L     ₹10L       ₹5L
   ✓ Paid   ✓ Paid      ◐ Partial  Pending    Pending
   Jan 1    Feb 1       Mar 15     Apr 30     May 31
   ```
   
   Node states:
   - Filled circle (●): Fully paid (green)
   - Half circle (◐): Partially paid (yellow)
   - Empty circle (○): Pending (gray)
   - Overdue: Red outline

4. **Milestones Detail Cards** (below timeline):

   Each milestone card:
   ```
   ┌─────────────────────────────────────────────────┐
   │ Foundation Complete                    ✓ PAID   │
   │ 25% of contract                                 │
   ├─────────────────────────────────────────────────┤
   │ Expected: ₹12,50,000                           │
   │ Received: ₹12,50,000                           │
   │ Due Date: Feb 1, 2026         Paid: Feb 3      │
   ├─────────────────────────────────────────────────┤
   │ Linked Stage: Foundation     [View Payments]    │
   └─────────────────────────────────────────────────┘
   ```

   For partial payment:
   ```
   ┌─────────────────────────────────────────────────┐
   │ Structure Complete              ◐ PARTIAL      │
   │ 25% of contract                                 │
   ├─────────────────────────────────────────────────┤
   │ Expected: ₹12,50,000                           │
   │ Received: ₹8,00,000    Pending: ₹4,50,000     │
   │ ████████████░░░░░░░░░  64% received            │
   │ Due Date: Mar 15, 2026                         │
   ├─────────────────────────────────────────────────┤
   │ [Record Payment]              [Send Reminder]   │
   └─────────────────────────────────────────────────┘
   ```

5. **Payment History** (expandable per milestone):
   - Date | Amount | Mode | Reference
   - Feb 3 | ₹8,00,000 | Online | TXN123456

**Style**:
- Timeline is visually prominent
- Clear status indicators
- Progress bars for partial payments
- Action buttons easily accessible
```

### Screen: Add Milestone Modal

```
Design a modal for adding payment milestones in construction project management.

**Modal**: Add Payment Milestone
**Size**: 480px wide

**Layout**:

1. **Header**:
   - Title: "Add Payment Milestone"
   - Close button

2. **Form Fields**:

   **Milestone Name** (required)
   - Text input
   - Placeholder: "e.g., Advance, Foundation Complete"
   - Suggestions dropdown: Common milestones

   **Percentage of Contract** (required)
   - Number input with % suffix
   - Range: 1-100
   - Helper: "Remaining available: 30%"

   **Calculated Amount** (read-only)
   - Shows: ₹[percentage × contract value]
   - Auto-updates as percentage changes

   **Due Date** (optional)
   - Date picker
   - Placeholder: "Select due date"

   **Link to Stage** (optional)
   - Dropdown of project stages
   - Helper: "Payment due when stage completes"

3. **Percentage Visualization**:
   - Horizontal bar showing all milestones
   - Existing milestones in gray
   - New milestone preview in teal
   - Shows if total exceeds 100%

4. **Footer**:
   - Cancel button
   - "Add Milestone" button (disabled if total > 100%)

**Validation**:
- Total milestones cannot exceed 100%
- Name is required
- Percentage must be > 0

**Style**:
- Clean form layout
- Visual feedback for percentage allocation
- Clear validation messages
```

### Screen: Record Milestone Payment

```
Design a modal for recording payment against a milestone.

**Modal**: Record Payment
**Context**: Recording client payment for a specific milestone

**Layout**:

1. **Header**:
   - Title: "Record Payment"
   - Milestone name: "Structure Complete"
   - Close button

2. **Payment Summary** (read-only info):
   - Expected Amount: ₹12,50,000
   - Already Received: ₹8,00,000
   - Pending: ₹4,50,000
   - Visual progress bar

3. **Form Fields**:

   **Amount** (required)
   - Currency input with ₹ prefix
   - Default: Pending amount
   - Max: Pending amount
   - Quick buttons: "Full Amount" | "50%" | "Custom"

   **Payment Date** (required)
   - Date picker
   - Default: Today

   **Payment Mode** (required)
   - Segmented control: Cash | Cheque | Online
   - Icons for each option

   **Reference Number** (optional, shown for Cheque/Online)
   - Text input
   - Placeholder: "Transaction ID or Cheque No."

   **Notes** (optional)
   - Textarea
   - Placeholder: "Add any notes about this payment"

4. **Footer**:
   - Cancel button
   - "Record Payment" button

**After Success**:
- Success toast: "Payment of ₹4,50,000 recorded"
- Milestone status updates automatically
- Modal closes

**Style**:
- Clear payment context at top
- Large amount input
- Easy payment mode selection
```

---

## 2.2 Aging Reports

### Screen: Aging Analysis Report

```
Design an aging analysis report screen for construction project finances.

**Screen**: Aging Report
**Context**: Analyzing receivables/payables by age for cash flow management

**Layout**:

1. **Page Header**:
   - Title: "Aging Analysis"
   - Date range selector
   - Export button

2. **Aging Summary Table**:
   ```
   ┌────────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
   │            │ Current │ 1-30    │ 31-60   │ 61-90   │ 90+     │ Total   │
   │            │         │ Days    │ Days    │ Days    │ Days    │         │
   ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
   │ Receivables│ ₹10L    │ ₹5L     │ ₹3L     │ ₹2L     │ ₹5L     │ ₹25L    │
   │ Payables   │ ₹8L     │ ₹4L     │ ₹3L     │ ₹2L     │ ₹1L     │ ₹18L    │
   └────────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
   ```
   
   Cell styling:
   - Current: Green background
   - 1-30: Light green
   - 31-60: Yellow
   - 61-90: Orange
   - 90+: Red

3. **Aging Distribution Chart**:
   - Grouped bar chart
   - X-axis: Aging buckets
   - Y-axis: Amount
   - Two bar groups: Receivables (teal) vs Payables (orange)

4. **Detailed Aging List**:
   
   Tabs: "Receivables" | "Payables"
   
   Filter bar:
   - Aging bucket dropdown
   - Party type filter (for payables)
   - Search

   Table:
   | Party | Amount | Days Outstanding | Last Payment | Project | Action |
   | ABC Corp | ₹5,00,000 | 95 days | Dec 15 | Office | Follow Up |

   Row styling:
   - Left border color indicates aging severity
   - Overdue rows highlighted

5. **Insights Panel** (sidebar or cards):
   - "₹5L receivables are 90+ days overdue"
   - "Top overdue: ABC Corp (₹5L, 95 days)"
   - "Suggested action: Follow up on 3 accounts"

**Style**:
- Color-coded aging (heat map style)
- Clear data visualization
- Actionable insights
- Print-friendly layout option
```

---

# Phase 3: Operational Excellence

---

## 3.1 Notifications & Alerts

### Screen: Notification Center

```
Design a notification center for construction project management.

**Component**: Notification Bell Dropdown (Header)

**Trigger**: Bell icon with badge showing unread count

**Dropdown Panel** (320px wide, max 400px tall):

1. **Header**:
   - Title: "Notifications"
   - "Mark all as read" link (right aligned)

2. **Notification List** (scrollable):

   Each notification item:
   ```
   ┌─────────────────────────────────────────┐
   │ ⚠️ Stage deadline approaching           │
   │ "Foundation" due in 3 days              │
   │ Villa Project • 2 hours ago        •    │
   └─────────────────────────────────────────┘
   ```
   
   Types with icons:
   - ⚠️ Warning (yellow): Deadline approaching
   - 🔴 Alert (red): Overdue, Over budget
   - 💰 Payment (green): Payment received
   - 📋 Task (blue): Task completed
   - 📄 Document (gray): Document uploaded

   Unread indicator: Blue dot on right

3. **Empty State**:
   - Icon: Bell with checkmark
   - Text: "You're all caught up!"

4. **Footer**:
   - "View all notifications →" link

**Hover State**: Slight background highlight
**Click Action**: Navigate to related entity

**Style**:
- Clean list design
- Clear visual hierarchy
- Unread items slightly bolder
- Timestamps in relative format
```

### Screen: Notifications Page (Full)

```
Design a full notifications page for construction project management.

**Screen**: Notifications (/notifications)

**Layout**:

1. **Page Header**:
   - Title: "Notifications"
   - Filter dropdown: All | Unread | Deadlines | Payments | Budget
   - "Mark all as read" button

2. **Notification Groups** (by date):

   **Today**
   - List of today's notifications

   **Yesterday**
   - List of yesterday's notifications

   **This Week**
   - Older notifications

3. **Notification Card** (expanded view):
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ ⚠️ Stage "Foundation" is due in 3 days                  │
   │                                                         │
   │ Project: Villa Construction                             │
   │ Due Date: January 28, 2026                              │
   │ Current Progress: 85%                                   │
   │                                                         │
   │ [View Stage]  [Dismiss]                    2 hours ago  │
   └─────────────────────────────────────────────────────────┘
   ```

4. **Bulk Actions**:
   - Checkbox selection
   - "Delete selected" button
   - "Mark selected as read" button

**Style**:
- Grouped by time
- Clear notification types
- Actionable buttons
- Easy bulk management
```

### Screen: Alert Settings

```
Design an alert configuration screen for construction project management.

**Screen**: Settings > Alerts & Notifications

**Layout**:

1. **Section**: Deadline Alerts
   
   Toggle: "Enable deadline alerts" [ON/OFF]
   
   When enabled:
   - "Alert me X days before deadline"
   - Dropdown: 1 day | 3 days | 5 days | 7 days
   - Checkboxes:
     - [ ] Stage deadlines
     - [ ] Task deadlines
     - [ ] Payment milestones

2. **Section**: Budget Alerts
   
   Toggle: "Enable budget alerts" [ON/OFF]
   
   When enabled:
   - "Alert when expenses exceed budget by X%"
   - Slider or dropdown: 5% | 10% | 15% | 20%

3. **Section**: Payment Alerts
   
   Toggle: "Enable payment alerts" [ON/OFF]
   
   Checkboxes:
   - [ ] Payment received
   - [ ] Payment overdue (receivables)
   - [ ] Payment due (payables)

4. **Section**: Notification Delivery
   
   - In-app notifications: Always on
   - Push notifications (mobile): [ON/OFF]
   - Email digest: [OFF | Daily | Weekly]

5. **Save Button**: "Save Preferences"

**Style**:
- Clean settings layout
- Toggle switches for on/off
- Grouped by category
- Clear descriptions
```

---

## 3.2 Labor Tracking Enhancement

### Screen: Enhanced Labor Expense Form

```
Design an enhanced labor expense entry form for construction project management.

**Screen**: Add Labor Expense (within Add Expense modal)

**Context**: When user selects "Labour" as expense type

**Additional Fields for Labour**:

1. **Labour Type** (required)
   - Dropdown from labour_type category
   - Options: Mason, Carpenter, Electrician, Plumber, Helper, etc.

2. **Rate Type** (required)
   - Segmented control with icons:
     - ☀️ Regular
     - 🌙 Overtime (1.5x)
     - 🌃 Night (2x)
     - 🎉 Holiday (2x)
   
   - Shows multiplier effect on rate

3. **Workers Count** (required)
   - Number input
   - Stepper buttons (+/-)

4. **Hours/Days Worked** (required)
   - Number input
   - Toggle: Hours | Days
   - Default: Days

5. **Base Rate** (required)
   - Currency input
   - Per hour/day (based on toggle)

6. **Calculated Fields** (read-only):
   - Effective Rate: Base × Multiplier
   - Total: Workers × Hours × Effective Rate

7. **Work Completed** (optional):
   - Number input
   - Unit dropdown: sq ft, running ft, nos
   - Helper: "For productivity tracking"

**Visual**:
```
┌─────────────────────────────────────────────────────┐
│ Labour Type: [Mason ▼]                              │
│                                                     │
│ Rate Type:  [☀️ Regular] [🌙 OT] [🌃 Night] [🎉 Holiday]│
│             ─────────────                           │
│                                                     │
│ Workers: [- 4 +]     Hours: [8] [Hours ▼]          │
│                                                     │
│ Base Rate: ₹[500] /day                             │
│                                                     │
│ ─────────────────────────────────────────────────  │
│ Effective Rate: ₹500 × 1.0 = ₹500/day              │
│ Total Amount: 4 workers × 8 hours × ₹62.5 = ₹2,000 │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Work Completed: [100] [sq ft ▼] (optional)         │
└─────────────────────────────────────────────────────┘
```

**Style**:
- Clear rate type selection
- Live calculation updates
- Visual multiplier indication
- Easy number entry with steppers
```

---

# Phase 4: Automation

---

## 4.1 Invoice Scanning

### Screen: Scan Invoice Flow

```
Design an invoice scanning flow for construction expense entry.

**Flow**: Scan Invoice Tab (within Add Expense)

**Step 1: Upload/Capture**

Desktop:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ┌─────────────────────────────────────┐        │
│     │                                     │        │
│     │         📄                          │        │
│     │                                     │        │
│     │    Drag & drop invoice here         │        │
│     │    or click to browse               │        │
│     │                                     │        │
│     │    Supports: JPG, PNG, PDF          │        │
│     └─────────────────────────────────────┘        │
│                                                     │
│              [Browse Files]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Mobile:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ┌───────────────┐  ┌───────────────┐           │
│     │               │  │               │           │
│     │    📷         │  │    📁         │           │
│     │   Camera      │  │   Gallery     │           │
│     │               │  │               │           │
│     └───────────────┘  └───────────────┘           │
│                                                     │
│              Take photo or select file              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Step 2: Processing**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🔄 Processing invoice...               │
│                                                     │
│              [████████░░░░░░░░] 60%                 │
│                                                     │
│              Extracting details...                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Step 3: Review Extracted Data**
```
┌─────────────────────────────────────────────────────────────────┐
│ Review Extracted Data                                           │
├────────────────────────────┬────────────────────────────────────┤
│                            │                                    │
│  [Invoice Image Preview]   │  Vendor *                          │
│                            │  [ABC Suppliers ▼]  ✓ 95% match    │
│  📄 invoice_001.jpg        │  ──────────────────────────────    │
│                            │  Invoice Number                    │
│  [Zoom] [Rotate]           │  [INV-2026-0042]   ✓ Extracted     │
│                            │  ──────────────────────────────    │
│                            │  Date *                            │
│                            │  [Jan 15, 2026]    ✓ Extracted     │
│                            │  ──────────────────────────────    │
│                            │  Items:                            │
│                            │  ┌────────────────────────────┐   │
│                            │  │ Cement 43 Grade            │   │
│                            │  │ Qty: 100  Rate: ₹380       │   │
│                            │  │ Amount: ₹38,000       [Edit]│   │
│                            │  └────────────────────────────┘   │
│                            │  ┌────────────────────────────┐   │
│                            │  │ Sand (River)               │   │
│                            │  │ Qty: 5    Rate: ₹2,500     │   │
│                            │  │ Amount: ₹12,500       [Edit]│   │
│                            │  └────────────────────────────┘   │
│                            │  ──────────────────────────────    │
│                            │  Total: ₹50,500                    │
│                            │  Tax: ₹9,090                       │
│                            │  Grand Total: ₹59,590              │
│                            │                                    │
├────────────────────────────┴────────────────────────────────────┤
│ ⚠️ Please verify extracted data before creating expense         │
│                                                                 │
│ [Cancel]                              [Create Expense]          │
└─────────────────────────────────────────────────────────────────┘
```

**Confidence Indicators**:
- ✓ Green checkmark: High confidence (>90%)
- ⚠️ Yellow warning: Medium confidence (70-90%)
- ❌ Red X: Low confidence (<70%) - needs manual entry

**Style**:
- Side-by-side layout for review
- Editable extracted fields
- Clear confidence indicators
- Original image reference
```

---

## 4.2 Material Inventory

### Screen: Material Inventory Tab

```
Design a material inventory tracking screen for construction projects.

**Screen**: Project > Inventory Tab

**Layout**:

1. **Header**:
   - Title: "Material Inventory"
   - Subtitle: "Track materials received vs used"
   - Button: "Record Usage"

2. **Summary Cards**:
   - Total Materials Tracked: 24 items
   - Items Low in Stock: 3
   - Discrepancies Found: 1

3. **Inventory Table**:
   | Material | Unit | Received | Used | Balance | Status | Actions |
   | Cement 43 Grade | bags | 500 | 420 | 80 | ✓ OK | Record Usage |
   | Steel TMT 12mm | kg | 2000 | 1850 | 150 | ⚠️ Low | Record Usage |
   | Bricks | nos | 10000 | 9500 | 500 | ❌ Check | Investigate |

   Status indicators:
   - ✓ OK (green): Balance is expected
   - ⚠️ Low (yellow): Running low
   - ❌ Check (red): Discrepancy detected

4. **Expandable Row Details**:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │ Cement 43 Grade                                             │
   ├─────────────────────────────────────────────────────────────┤
   │ Movement History:                                           │
   │ Jan 20 | IN  | +200 bags | Purchase from ABC Suppliers      │
   │ Jan 18 | OUT | -50 bags  | Used for foundation work         │
   │ Jan 15 | IN  | +300 bags | Purchase from XYZ Cement         │
   │ Jan 12 | OUT | -100 bags | Used for column casting          │
   ├─────────────────────────────────────────────────────────────┤
   │ Expected Usage: 400 bags (for 4000 sq ft work)              │
   │ Actual Usage: 420 bags                                      │
   │ Variance: +20 bags (5% over expected)                       │
   └─────────────────────────────────────────────────────────────┘
   ```

5. **Record Usage Modal**:
   - Material (pre-selected or dropdown)
   - Quantity used
   - Date
   - Purpose/Location (text)
   - Recorded by (auto-filled)

**Style**:
- Clean table with expandable rows
- Color-coded status
- Quick actions per row
- Movement history timeline
```

---

# Project Documents

---

## 5.1 Documents Tab

### Screen: Project Documents

```
Design a documents management screen for a construction project.

**Screen**: Project > Documents Tab
**Context**: Managing all project files - contracts, drawings, permits, invoices, photos

**Layout** (Desktop, 1440px):

1. **Header**:
   - Title: "Documents"
   - Subtitle: "47 documents"
   - Actions: [Download All] [+ Upload]

2. **Category Cards Row** (horizontal, clickable filters):
   - 📄 Contracts (3)
   - 📐 Drawings (12)
   - 📋 Permits (5) - ⚠️ badge if expiring
   - 🧾 Invoices (18)
   - 📸 Photos (8)
   - 📁 Other (1)

3. **Filter Bar**:
   - Search: "Search documents..."
   - Category dropdown
   - Linked to: [All | Stage | Expense | Party]
   - View toggle: [Grid] [List]
   - Sort: [Newest ▼]

4. **Grid View** (4 columns):
   Each card:
   ```
   ┌─────────────────────────┐
   │ [Thumbnail/Preview]     │
   │                         │
   │ Contract_v2.pdf         │
   │ 📄 Contract • 2.4 MB    │
   │ Jan 5, 2026             │
   │                    [⋮]  │
   └─────────────────────────┘
   ```
   
   Thumbnail types:
   - PDF: First page preview
   - Images: Scaled preview
   - Other: File type icon (DOC, XLS, DWG)

5. **List View** (alternative):
   | Preview | Name | Category | Linked To | Size | Date | Actions |
   | [thumb] | Contract_v2.pdf | Contract | — | 2.4MB | Jan 5 | ⋮ |
   | [thumb] | Foundation.dwg | Drawing | Stage: Foundation | 8.1MB | Jan 8 | ⋮ |

6. **Empty State**:
   - Illustration: Folder with files
   - Title: "No documents yet"
   - Subtitle: "Upload contracts, drawings, permits to keep files organized"
   - CTA: [Upload First Document]

**Hover Actions** (on card):
- 👁 View | ⬇ Download | ✏️ Edit | 🗑 Delete

**Style**:
- Category badges with colors (Contract=blue, Drawing=purple, etc.)
- Clean grid/list design
- Thumbnails for visual browsing
- Quick category filtering
```

### Screen: Upload Documents Modal

```
Design a document upload modal for construction project management.

**Modal**: Upload Documents
**Size**: 560px wide

**Layout**:

1. **Header**:
   - Title: "Upload Documents"
   - Close button

2. **Drop Zone**:
   - Dashed border area
   - Icon: Upload cloud
   - Text: "Drag & drop files here or click to browse"
   - Formats: "PDF, Images, DWG, DOC, XLS • Max 25MB each"

3. **Selected Files List** (after selection):
   Each file row:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ 📄 Invoice_Steel_Jan.pdf                    2.4 MB  [X] │
   │    Category: [Invoice ▼]    Link to: [Expense #142 ▼]  │
   └─────────────────────────────────────────────────────────┘
   ```
   
   - File name with size
   - Remove button (X)
   - Category dropdown (auto-detected from filename)
   - Link to dropdown (Stage, Expense, Party - optional)

4. **Footer**:
   - Cancel button
   - [Upload X Files] button

**Smart Defaults**:
- "invoice" in name → Invoice category
- .jpg, .png → Photo category
- .dwg → Drawing category
- "contract" in name → Contract category

**Style**:
- Multi-file upload support
- Per-file categorization
- Optional entity linking
- Progress indicator during upload
```

### Screen: Document Preview Modal

```
Design a document preview modal for construction project management.

**Modal**: Document Preview
**Size**: 80% viewport width, 90% height

**Layout**:

1. **Header Bar**:
   - Back/Close button
   - File name: "Invoice_Steel_Jan.pdf"
   - Actions: [⬇ Download] [🔗 Copy Link] [✏️ Edit] [🗑 Delete]

2. **Two-Column Layout**:

   **Left (70%)**: Document Preview
   - PDF viewer / Image viewer
   - Zoom controls
   - Page navigation (for multi-page)

   **Right (30%)**: Details Panel
   - **Type**: Invoice (badge)
   - **Size**: 2.4 MB
   - **Uploaded**: Jan 15, 2026
   - **By**: Admin
   - **Linked To**: Expense #142 - Steel Bars
   - [Edit Details] button

3. **Navigation**:
   - Previous/Next arrows (if browsing multiple)

**Style**:
- Large preview area
- Clean metadata panel
- Easy navigation between documents
```

---

# Mobile App Screens

---

## Quick Expense Entry (Mobile)

```
Design a quick expense entry flow for mobile construction app.

**Screen**: Quick Add Expense (Mobile, 375px)

**Trigger**: Floating Action Button (FAB) on home screen

**Flow**:

**Step 1: Select Project** (if multiple)
- Recent projects at top
- Search bar
- List with project cards

**Step 2: Quick Entry Form**
```
┌─────────────────────────────────────────┐
│ ← Add Expense          Villa Project    │
├─────────────────────────────────────────┤
│                                         │
│  What type?                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 🧱      │ │ 👷      │ │ 🔧      │   │
│  │Material │ │ Labour  │ │Sub Work │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  Party *                                │
│  [ABC Suppliers              ▼]         │
│  Recent: ABC Suppliers, XYZ Traders     │
│                                         │
│  Amount *                               │
│  ┌─────────────────────────────────┐   │
│  │ ₹                    35,000     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 7 │ 8 │ 9 │                     │   │
│  │ 4 │ 5 │ 6 │                     │   │
│  │ 1 │ 2 │ 3 │                     │   │
│  │ . │ 0 │ ⌫ │                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📷 Add Photo (optional)                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Save Expense            │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Features**:
- Large touch targets
- Number pad for amount
- Recent parties for quick selection
- Camera integration
- Minimal required fields

**Success State**:
- Haptic feedback
- Success animation
- "Add Another" option
- Return to home

**Offline Mode**:
- Show "Saved offline" badge
- Queue indicator
- Auto-sync when online
```

---

## Mobile Dashboard

```
Design a mobile dashboard for construction project management.

**Screen**: Home Dashboard (Mobile, 375px)

**Layout**:

1. **Header**:
   - Logo/App name
   - Notification bell with badge
   - Profile avatar

2. **Quick Stats Row** (horizontal scroll):
   ```
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Active  │ │ Due     │ │ Pending │ │ This    │
   │ Projects│ │ Today   │ │ Credits │ │ Month   │
   │    5    │ │    3    │ │  ₹18L   │ │  ₹4.5L  │
   └─────────┘ └─────────┘ └─────────┘ └─────────┘
   ```

3. **Recent Projects** (card list):
   ```
   ┌─────────────────────────────────────────┐
   │ 🏠 Villa Construction                   │
   │ ████████████░░░░░░ 65%                  │
   │ ₹32L spent of ₹50L • 45 days left       │
   └─────────────────────────────────────────┘
   ```

4. **Today's Tasks** (if any):
   - Checklist style
   - Tap to complete
   - Swipe to reschedule

5. **Recent Activity Feed**:
   - Last 5 activities
   - Expense added, Payment received, etc.

6. **Bottom Navigation**:
   - Home | Projects | Add (+) | Parties | More

**FAB**: Quick Add Expense (center, prominent)

**Style**:
- Card-based layout
- Swipe gestures
- Pull to refresh
- Bottom navigation
```

---

# Design Specifications Summary

## Component Library Needs

Based on these screens, you'll need:

1. **Cards**: Stat cards, Project cards, Notification cards
2. **Tables**: Data tables with expandable rows, sorting, filtering
3. **Charts**: Donut, Bar (horizontal/vertical), Line, Progress bars
4. **Forms**: Inputs, Selects, Date pickers, Number pads, Toggles
5. **Modals**: Form modals, Confirmation dialogs
6. **Navigation**: Tabs, Breadcrumbs, Bottom nav (mobile)
7. **Status Indicators**: Badges, Progress bars, Color-coded indicators
8. **Empty States**: Illustrations with CTAs
9. **Notifications**: Toast, Dropdown panel, Full page

## Responsive Breakpoints

- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1440px
- Wide: 1440px+

---

*Last Updated: January 24, 2026*
