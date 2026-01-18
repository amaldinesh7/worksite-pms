/**
 * Categories Management Page
 *
 * Main page for managing category types and their items.
 * Uses a two-column layout: category types navigation (left) and item details (right).
 *
 * Note: Layout (Sidebar) is provided by the parent ProtectedLayout route.
 */

import { useState, useEffect } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

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
import { cn } from '@/lib/utils';

// Default category type key to select on load
const DEFAULT_TYPE_KEY = 'labour_type';

export default function CategoriesPage() {
  // State for selected category type
  const [selectedType, setSelectedType] = useState<CategoryType | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

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

  // Filter items based on global search (if implemented)
  const filteredItems = globalSearch
    ? items.filter((item) => item.name.toLowerCase().includes(globalSearch.toLowerCase()))
    : items;

  // Custom header actions with global search
  const headerActions = (
    <div className="relative">
      <MagnifyingGlass
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
        weight="bold"
      />
      <input
        type="text"
        placeholder="Search categories..."
        value={globalSearch}
        onChange={(e) => setGlobalSearch(e.target.value)}
        className={cn(
          'w-64 pl-10 pr-4 py-2 text-sm',
          'bg-neutral-100 border border-neutral-200 rounded-lg',
          'placeholder:text-neutral-400 text-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent',
          'transition-all duration-150'
        )}
        aria-label="Search categories"
      />
    </div>
  );

  return (
    <>
      <Header
        title="Categories Management"
        subtitle="Manage expense types, materials, labour, and more"
        showSearch={false}
        primaryActionLabel=""
        actions={headerActions}
      />
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
              items={filteredItems}
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
