/**
 * Categories Management Page
 *
 * Main page for managing category types and their items.
 * Uses a two-column layout: category types navigation (left) and item details (right).
 *
 * Note: Layout (Sidebar) is provided by the parent ProtectedLayout route.
 */

import { useState, useEffect } from 'react';

import { PageContent, Header } from '@/components/layout';
import { CategoryTypesNav, CategoryDetails } from '@/components/categories';
import {
  useCategoryTypes,
  useCategoryItems,
  useCreateCategoryItem,
  useUpdateCategoryItem,
  useDeleteCategoryItem,
} from '@/lib/hooks/useCategories';
import type { CategoryType, CategoryItem } from '@/lib/api/categories';

// Default category type key to select on load
const DEFAULT_TYPE_KEY = 'labour_type';

export default function CategoriesPage() {
  // State for selected category type
  const [selectedType, setSelectedType] = useState<CategoryType | null>(null);

  // Fetch category types
  const { data: categoryTypes = [], isLoading: isLoadingTypes } = useCategoryTypes();

  // Fetch items for the selected category type
  const { data: items = [], isLoading: isLoadingItems } = useCategoryItems(selectedType?.key ?? '');

  // Mutations
  const createItemMutation = useCreateCategoryItem();
  const updateItemMutation = useUpdateCategoryItem();
  const deleteItemMutation = useDeleteCategoryItem();

  // Set default selected type when types are loaded
  useEffect(() => {
    if (categoryTypes.length > 0 && !selectedType) {
      // Try to find default type, otherwise use first available
      const defaultType = categoryTypes.find((t) => t.key === DEFAULT_TYPE_KEY);
      setSelectedType(defaultType ?? categoryTypes[0]);
    }
  }, [categoryTypes, selectedType]);

  // Handle creating a new item
  const handleCreateItem = (name: string) => {
    if (selectedType) {
      createItemMutation.mutate({
        categoryTypeId: selectedType.id,
        name,
      });
    }
  };

  // Handle editing an item (called from modal in CategoryDetails)
  const handleEditItem = (item: CategoryItem, newName: string) => {
    updateItemMutation.mutate({
      id: item.id,
      data: { name: newName },
    });
  };

  // Handle deleting an item
  const handleDeleteItem = (item: CategoryItem) => {
    deleteItemMutation.mutate(item.id);
  };

  return (
    <>
      <Header title="Categories" />
      <PageContent className="overflow-hidden min-h-0">
        <div className="grid grid-cols-12 gap-6 h-full min-h-0 overflow-hidden">
          {/* Left Panel - Category Types Navigation */}
          <div className="col-span-3 h-full overflow-hidden">
            <CategoryTypesNav
              categoryTypes={categoryTypes}
              selectedType={selectedType}
              onSelect={setSelectedType}
              isLoading={isLoadingTypes}
            />
          </div>

          {/* Right Panel - Category Details */}
          <div className="col-span-9 h-full overflow-hidden">
            <CategoryDetails
              categoryType={selectedType}
              items={items}
              isLoading={isLoadingItems}
              onCreateItem={handleCreateItem}
              isCreating={createItemMutation.isPending}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              isDeleting={deleteItemMutation.isPending}
            />
          </div>
        </div>
      </PageContent>
    </>
  );
}
