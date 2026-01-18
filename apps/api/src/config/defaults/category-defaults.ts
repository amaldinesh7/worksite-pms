/**
 * Default Category Types and Items
 *
 * CategoryTypes are GLOBAL (created once, shared by all organizations).
 * CategoryItems are per-organization (created when organization is created).
 */

export interface DefaultCategoryItem {
  name: string;
  isEditable: boolean;
}

export interface DefaultCategoryType {
  key: string;
  label: string;
  items: DefaultCategoryItem[];
}

/**
 * Global category types with their default items.
 * - expense_type: Has 3 non-editable default items (Material, Labour, Sub Work)
 * - Other types: Empty by default, users add their own items
 */
export const DEFAULT_CATEGORY_TYPES: DefaultCategoryType[] = [
  {
    key: 'expense_type',
    label: 'Expense Types',
    items: [
      { name: 'Material', isEditable: false },
      { name: 'Labour', isEditable: false },
      { name: 'Sub Work', isEditable: false },
    ],
  },
  {
    key: 'material_type',
    label: 'Material Types',
    items: [],
  },
  {
    key: 'labour_type',
    label: 'Labour Types',
    items: [],
  },
  {
    key: 'sub_work_type',
    label: 'Sub Work Types',
    items: [],
  },
  {
    key: 'project_type',
    label: 'Project Types',
    items: [],
  },
];

/**
 * Get default category types for global setup.
 */
export function getDefaultCategoryTypes(): DefaultCategoryType[] {
  return DEFAULT_CATEGORY_TYPES;
}
