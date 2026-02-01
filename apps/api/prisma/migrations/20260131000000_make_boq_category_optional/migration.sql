-- Make boqCategoryItemId nullable on BOQItem
-- This allows BOQ items to exist without a predefined category assignment
-- Items will be grouped by section (extracted from document) instead

-- Drop the foreign key constraint first
ALTER TABLE "boq_items" DROP CONSTRAINT IF EXISTS "boq_items_boqCategoryItemId_fkey";

-- Make the column nullable
ALTER TABLE "boq_items" ALTER COLUMN "boqCategoryItemId" DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE SET NULL
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_boqCategoryItemId_fkey" 
  FOREIGN KEY ("boqCategoryItemId") REFERENCES "category_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
