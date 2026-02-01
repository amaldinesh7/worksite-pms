-- AlterTable
-- Make boqCategoryItemId optional on BOQItem
-- Items are now grouped by sections instead of categories
ALTER TABLE "boq_items" ALTER COLUMN "boqCategoryItemId" DROP NOT NULL;
