-- CreateEnum
CREATE TYPE "BOQCategory" AS ENUM ('MATERIAL', 'LABOUR', 'SUB_WORK', 'EQUIPMENT', 'OTHER');

-- CreateTable
CREATE TABLE "boq_sections" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boq_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boq_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT,
    "stageId" TEXT,
    "code" TEXT,
    "category" "BOQCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "rate" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "isReviewFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boq_expense_links" (
    "id" TEXT NOT NULL,
    "boqItemId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boq_expense_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boq_sections_organizationId_idx" ON "boq_sections"("organizationId");

-- CreateIndex
CREATE INDEX "boq_sections_projectId_idx" ON "boq_sections"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "boq_sections_projectId_name_key" ON "boq_sections"("projectId", "name");

-- CreateIndex
CREATE INDEX "boq_items_organizationId_idx" ON "boq_items"("organizationId");

-- CreateIndex
CREATE INDEX "boq_items_projectId_idx" ON "boq_items"("projectId");

-- CreateIndex
CREATE INDEX "boq_items_sectionId_idx" ON "boq_items"("sectionId");

-- CreateIndex
CREATE INDEX "boq_items_stageId_idx" ON "boq_items"("stageId");

-- CreateIndex
CREATE INDEX "boq_items_category_idx" ON "boq_items"("category");

-- CreateIndex
CREATE INDEX "boq_expense_links_boqItemId_idx" ON "boq_expense_links"("boqItemId");

-- CreateIndex
CREATE INDEX "boq_expense_links_expenseId_idx" ON "boq_expense_links"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "boq_expense_links_boqItemId_expenseId_key" ON "boq_expense_links"("boqItemId", "expenseId");

-- AddForeignKey
ALTER TABLE "boq_sections" ADD CONSTRAINT "boq_sections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_sections" ADD CONSTRAINT "boq_sections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "boq_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_expense_links" ADD CONSTRAINT "boq_expense_links_boqItemId_fkey" FOREIGN KEY ("boqItemId") REFERENCES "boq_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boq_expense_links" ADD CONSTRAINT "boq_expense_links_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
