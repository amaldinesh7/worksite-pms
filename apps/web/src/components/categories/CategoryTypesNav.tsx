/**
 * Category Types Navigation Component
 *
 * Left panel that displays the list of category types.
 * Filters to show only the allowed types per design requirements.
 */

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CategoryType } from '@/lib/api/categories';

// Allowed category type keys in display order
const ALLOWED_TYPE_KEYS = [
  'expense_type',
  'material_type',
  'labour_type',
  'subwork_type',
  'project_type',
] as const;

// Human-readable labels for fallback
const TYPE_LABELS: Record<string, string> = {
  expense_type: 'Expense Types',
  material_type: 'Material Types',
  labour_type: 'Labour Types',
  subwork_type: 'Subwork Types',
  project_type: 'Project Types',
};

interface CategoryTypesNavProps {
  /** List of category types to display */
  categoryTypes: CategoryType[];
  /** Currently selected category type */
  selectedType: CategoryType | null;
  /** Callback when a category type is selected */
  onSelect: (categoryType: CategoryType) => void;
  /** Loading state */
  isLoading?: boolean;
}

export function CategoryTypesNav({
  categoryTypes,
  selectedType,
  onSelect,
  isLoading = false,
}: CategoryTypesNavProps) {
  // Filter and sort category types based on allowed keys
  const filteredTypes = ALLOWED_TYPE_KEYS.map((key) =>
    categoryTypes.find((t) => t.key === key)
  ).filter((t): t is CategoryType => t !== undefined);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="bg-white border border-neutral-200 rounded-lg p-4 h-full">
        <h2 className="text-lg font-medium text-neutral-800 mb-4 px-2">Category Types</h2>
        <nav className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-neutral-100 rounded-md animate-pulse" />
          ))}
        </nav>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-neutral-200 rounded-lg p-4 h-full">
      <h2 className="text-lg font-medium text-neutral-800 mb-4 px-2">Category Types</h2>
      <nav className="space-y-1">
        {filteredTypes.length > 0 ? (
          // Render actual category types from API
          filteredTypes.map((categoryType) => {
            const isSelected = selectedType?.id === categoryType.id;
            const label = categoryType.label || TYPE_LABELS[categoryType.key] || categoryType.key;

            return (
              <button
                key={categoryType.id}
                onClick={() => onSelect(categoryType)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm cursor-pointer',
                  'transition-colors duration-150',
                  isSelected
                    ? 'text-neutral-900 bg-neutral-100 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                )}
              >
                {label}
              </button>
            );
          })
        ) : (
          // Empty state when no data available
          <p className="px-3 py-2 text-sm text-neutral-500">
            No category types available. Please check your connection or seed the database.
          </p>
        )}
      </nav>
    </Card>
  );
}

export default CategoryTypesNav;
