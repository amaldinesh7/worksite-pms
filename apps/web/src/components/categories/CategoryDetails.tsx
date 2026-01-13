/**
 * Category Details Component
 *
 * Right panel that displays the items for a selected category type.
 * Includes search filtering and the ability to add new items.
 */

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';
import { MagnifyingGlass, Plus, PencilSimple } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { CategoryType, CategoryItem } from '@/lib/api/categories';

interface CategoryDetailsProps {
  /** The selected category type */
  categoryType: CategoryType | null;
  /** List of items for the category */
  items: CategoryItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when creating a new item */
  onCreateItem: (name: string) => void;
  /** Whether item creation is in progress */
  isCreating?: boolean;
  /** Callback when editing an item */
  onEditItem?: (item: CategoryItem, newName: string) => void;
}

/**
 * Gets the placeholder text for the create input based on category type
 */
function getCreatePlaceholder(categoryType: CategoryType | null): string {
  if (!categoryType) return 'Type new item name and press Enter...';

  // Remove "Types" suffix and format
  const singularName = categoryType.label.replace(/ Types?$/i, '').toLowerCase();

  return `Type new ${singularName} type name and press Enter...`;
}

export function CategoryDetails({
  categoryType,
  items,
  isLoading = false,
  onCreateItem,
  isCreating = false,
  onEditItem,
}: CategoryDetailsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');

  // Ref for create input to maintain focus
  const createInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');

  // Refocus create input after item creation completes
  useEffect(() => {
    if (!isCreating) {
      createInputRef.current?.focus();
    }
  }, [isCreating]);

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle creating a new item when Enter is pressed
  const handleCreateKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newItemName.trim() && !isCreating) {
        onCreateItem(newItemName.trim());
        setNewItemName('');
      }
    },
    [newItemName, onCreateItem, isCreating]
  );

  // Open edit modal
  const handleOpenEdit = (item: CategoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingItem(null);
    setEditName('');
  };

  // Save edit
  const handleSaveEdit = () => {
    if (editingItem && editName.trim() && editName !== editingItem.name && onEditItem) {
      onEditItem(editingItem, editName.trim());
      handleCloseEdit();
    }
  };

  // Handle Enter key in edit modal
  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }
  };

  if (!categoryType) {
    return (
      <Card className="bg-white border border-neutral-200 rounded-lg p-6 flex items-center justify-center h-full">
        <p className="text-neutral-500 text-sm">Select a category type to view items</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border border-neutral-200 rounded-lg flex flex-col h-full min-h-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 shrink-0 flex flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-medium text-neutral-800">{categoryType.label}</h2>
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
              weight="bold"
            />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-64 bg-neutral-50 border-neutral-200',
                'pl-10 pr-4 py-2 h-10',
                'placeholder:text-neutral-400 text-neutral-800 text-sm',
                'focus:ring-neutral-300'
              )}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 shrink-0">
          {/* Create Input */}
          <div className="border border-neutral-200 rounded-lg bg-neutral-50/50">
            <div className="p-3 flex items-center gap-3">
              <Plus
                className={cn(
                  'h-4 w-4 shrink-0',
                  isCreating ? 'text-neutral-300' : 'text-neutral-500'
                )}
                weight="bold"
              />
              <input
                ref={createInputRef}
                type="text"
                placeholder={getCreatePlaceholder(categoryType)}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleCreateKeyDown}
                disabled={isCreating}
                className={cn(
                  'flex-1 bg-transparent focus:outline-none text-sm',
                  'placeholder:text-neutral-500 text-neutral-800',
                  isCreating && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <LoadingState />
          ) : filteredItems.length === 0 ? (
            <EmptyState hasSearch={!!searchQuery} />
          ) : (
            <ItemsList items={filteredItems} onEditItem={onEditItem ? handleOpenEdit : undefined} />
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleEditKeyDown}
              placeholder="Enter item name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editName.trim() || editName === editingItem?.name}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// Sub-components
// ============================================

function LoadingState() {
  return (
    <div className="border-t border-neutral-200">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0"
        >
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-12">
      <p className="text-neutral-500 text-sm">
        {hasSearch ? 'No items match your search' : 'No items yet. Add one above.'}
      </p>
    </div>
  );
}

interface ItemsListProps {
  items: CategoryItem[];
  onEditItem?: (item: CategoryItem) => void;
}

function ItemsList({ items, onEditItem }: ItemsListProps) {
  return (
    <div className="border-t border-neutral-200">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex items-center justify-between py-3 group',
            index < items.length - 1 && 'border-b border-neutral-200'
          )}
        >
          <span className="text-neutral-800 text-sm">{item.name}</span>
          {onEditItem && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditItem(item)}
                className={cn(
                  'inline-flex items-center px-3 py-1 cursor-pointer',
                  'text-xs border border-neutral-200 rounded-md',
                  'text-neutral-600 bg-white hover:bg-neutral-100',
                  'transition-all duration-150',
                  'opacity-40 group-hover:opacity-100 focus-visible:opacity-100',
                  'focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none'
                )}
              >
                <PencilSimple className="mr-1.5 h-3 w-3" weight="bold" />
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CategoryDetails;
