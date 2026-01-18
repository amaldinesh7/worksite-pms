/**
 * Category Types Navigation Component
 *
 * Left panel that displays the list of category types.
 * Filters to show only the allowed types per design requirements.
 * Uses the reusable ListPanel component.
 */

import { ListPanel } from '@/components/ui/list-panel';
import { cn } from '@/lib/utils';
import type { CategoryType } from '@/lib/api/categories';

// Allowed category type keys in display order
const ALLOWED_TYPE_KEYS = [
  'project_type',
  'expense_type',
  'material_type',
  'labour_type',
  'sub_work_type',
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

  return (
    <ListPanel>
      <ListPanel.Header title="Categories" />
      <ListPanel.Content>
        {isLoading ? (
          <ListPanel.Loading count={5} />
        ) : filteredTypes.length === 0 ? (
          <ListPanel.Empty>No category types available.</ListPanel.Empty>
        ) : (
          filteredTypes.map((categoryType) => {
            const isSelected = selectedType?.id === categoryType.id;
            const label = categoryType.label || TYPE_LABELS[categoryType.key] || categoryType.key;

            return (
              <ListPanel.Item
                key={categoryType.id}
                isSelected={isSelected}
                onClick={() => onSelect(categoryType)}
              >
                <span className={cn(
                  'text-sm',
                  isSelected ? 'font-medium text-neutral-900' : 'text-neutral-700'
                )}>
                  {label}
                </span>
              </ListPanel.Item>
            );
          })
        )}
      </ListPanel.Content>
    </ListPanel>
  );
}

export default CategoryTypesNav;
