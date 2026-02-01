-- Migration: Replace BOQCategory enum with dynamic CategoryItem relation
-- This migration handles existing data by mapping old enum values to new category items

-- Step 1: Create boq_category type in category_types (GLOBAL - not per organization)
INSERT INTO "category_types" ("id", "key", "label", "isActive", "createdAt", "updatedAt")
SELECT 
    'clboqcattype001',
    'boq_category',
    'BOQ Work Categories',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "category_types" WHERE "key" = 'boq_category'
);

-- Step 2: Create default BOQ category items for each organization
-- We need to create these items so we can map existing BOQ items to them
DO $$
DECLARE
    org_record RECORD;
    type_id TEXT;
    category_names TEXT[] := ARRAY['Earth Works', 'PCC Work', 'RCC Works', 'Masonry Work', 'Plastering Work', 'Flooring Work', 'Waterproofing Work', 'MEP Works', 'Finishing Work', 'External Works', 'Other'];
    cat_name TEXT;
    counter INTEGER := 1;
BEGIN
    -- Get the category type id
    SELECT id INTO type_id FROM "category_types" WHERE "key" = 'boq_category' LIMIT 1;
    
    IF type_id IS NOT NULL THEN
        FOR org_record IN SELECT id FROM "organizations" LOOP
            FOREACH cat_name IN ARRAY category_names LOOP
                INSERT INTO "category_items" ("id", "organizationId", "categoryTypeId", "name", "isActive", "isEditable", "createdAt", "updatedAt")
                SELECT 
                    'clboqcat' || org_record.id || counter,
                    org_record.id,
                    type_id,
                    cat_name,
                    true,
                    true,
                    NOW(),
                    NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM "category_items" ci 
                    WHERE ci."organizationId" = org_record.id 
                    AND ci."categoryTypeId" = type_id 
                    AND ci."name" = cat_name
                );
                counter := counter + 1;
            END LOOP;
        END LOOP;
    END IF;
END $$;

-- Step 3: Add boqCategoryItemId column as nullable first
ALTER TABLE "boq_items" ADD COLUMN "boqCategoryItemId" TEXT;

-- Step 4: Map existing BOQ items to "Other" category for their organization
-- All existing items will be mapped to "Other" - users can re-categorize them later
UPDATE "boq_items" bi
SET "boqCategoryItemId" = (
    SELECT ci.id 
    FROM "category_items" ci
    JOIN "category_types" ct ON ci."categoryTypeId" = ct.id
    WHERE ci."organizationId" = bi."organizationId" 
    AND ct."key" = 'boq_category'
    AND ci."name" = 'Other'
    LIMIT 1
)
WHERE bi."boqCategoryItemId" IS NULL;

-- Step 5: Make the column required now that all rows have values
ALTER TABLE "boq_items" ALTER COLUMN "boqCategoryItemId" SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_boqCategoryItemId_fkey" 
FOREIGN KEY ("boqCategoryItemId") REFERENCES "category_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Create index on the new column
CREATE INDEX "boq_items_boqCategoryItemId_idx" ON "boq_items"("boqCategoryItemId");

-- Step 8: Drop the old category column and index
DROP INDEX IF EXISTS "boq_items_category_idx";
ALTER TABLE "boq_items" DROP COLUMN "category";

-- Step 9: Drop the old enum type
DROP TYPE IF EXISTS "BOQCategory";
