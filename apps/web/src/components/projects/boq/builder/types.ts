/**
 * BOQ Builder Types
 *
 * Shared types for the BOQ builder components.
 */

// ============================================
// Unit Constants
// ============================================

/**
 * Standard units for construction BOQ items
 * Centralized here to be used across all BOQ components
 */
export const COMMON_UNITS = [
  'nos',
  'sqft',
  'sqm',
  'cum',
  'cft',
  'rmt',
  'kg',
  'MT',
  'bags',
  'LS',
] as const;

export type BOQUnit = (typeof COMMON_UNITS)[number];

// ============================================
// Data Types
// ============================================

export interface BOQBuilderSection {
  id: string;
  name: string;
  sortOrder: number;
}

export interface BOQBuilderItem {
  id: string;
  sectionId: string | null;
  code: string | null;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  isReviewFlagged: boolean;
  flagReason?: string;
  // Temporary ID for new items that haven't been saved yet
  isNew?: boolean;
}

// ============================================
// Column Configuration
// ============================================

export interface BOQColumnConfig {
  key: string;
  label: string;
  width: string;
  align: 'left' | 'center' | 'right';
  type: 'text' | 'number' | 'currency' | 'select';
  isEditable: boolean;
  placeholder?: string;
  /** Options for select type columns */
  options?: readonly string[];
}

export const DEFAULT_COLUMNS: BOQColumnConfig[] = [
  {
    key: 'code',
    label: '#',
    width: '70px',
    align: 'center',
    type: 'text',
    isEditable: true,
    placeholder: '-',
  },
  {
    key: 'image',
    label: '',
    width: '40px',
    align: 'center',
    type: 'text',
    isEditable: false,
  },
  {
    key: 'description',
    label: 'Description',
    width: '1fr',
    align: 'left',
    type: 'text',
    isEditable: true,
    placeholder: 'Enter description...',
  },
  {
    key: 'unit',
    label: 'Unit',
    width: '80px',
    align: 'center',
    type: 'select',
    isEditable: true,
    options: COMMON_UNITS,
  },
  {
    key: 'quantity',
    label: 'Qty',
    width: '70px',
    align: 'right',
    type: 'number',
    isEditable: true,
    placeholder: '0',
  },
  {
    key: 'rate',
    label: 'Rate',
    width: '90px',
    align: 'right',
    type: 'currency',
    isEditable: true,
    placeholder: '0',
  },
  {
    key: 'amount',
    label: 'Amount',
    width: '100px',
    align: 'right',
    type: 'currency',
    isEditable: false, // Computed field
  },
  {
    key: 'actions',
    label: '',
    width: '40px',
    align: 'center',
    type: 'text',
    isEditable: false,
  },
];

// ============================================
// UI State Types
// ============================================

export interface EditingCell {
  rowIndex: number;
  columnKey: string;
  sectionId: string | null;
}

// ============================================
// Mutation Input Types
// ============================================

export interface CreateBOQSectionInput {
  name: string;
  sortOrder?: number;
}

export interface UpdateBOQSectionInput {
  name?: string;
  sortOrder?: number;
}

export interface CreateBOQItemInput {
  sectionId?: string;
  code?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

export interface UpdateBOQItemInput {
  sectionId?: string | null;
  code?: string | null;
  description?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
}

// ============================================
// Pending Image Types
// ============================================

/**
 * Represents an image that has been selected but not yet uploaded.
 * Stored in memory until the user clicks Save.
 */
export interface PendingImage {
  file: File;
  previewUrl: string;
}

/**
 * Map of item IDs to their pending images.
 * Key: itemId (can be real ID or temp ID for new items)
 * Value: PendingImage data
 */
export type PendingImagesMap = Map<string, PendingImage>;
