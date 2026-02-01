/**
 * BOQ Item Row
 *
 * A single row in the BOQ builder grid.
 * Displays item data with inline editing capability.
 */

import { type KeyboardEvent } from 'react';
import { Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { BOQCell } from './BOQCell';
import { BOQDescriptionCell } from './BOQDescriptionCell';
import { BOQSelectCell } from './BOQSelectCell';
import { BOQItemImage } from './BOQItemImage';
import type { BOQBuilderItem, BOQColumnConfig, EditingCell, PendingImage } from './types';

// ============================================
// Types
// ============================================

interface BOQItemRowProps {
  projectId: string;
  item: BOQBuilderItem;
  columns: BOQColumnConfig[];
  rowIndex: number;
  editingCell: EditingCell | null;
  isEditMode: boolean; // Global edit mode
  onCellEdit: (rowIndex: number, columnKey: string) => void;
  onCellChange: (itemId: string, field: string, value: string) => void;
  onCellBlur: () => void;
  onDelete: (itemId: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnKey: string) => void;
  // Image handling props (deferred save)
  pendingImage?: PendingImage;
  isImageMarkedForDelete?: boolean;
  onImageSelect?: (file: File) => void;
  onPendingImageRemove?: () => void;
  onExistingImageDelete?: () => void;
}

// ============================================
// Component
// ============================================

export function BOQItemRow({
  projectId,
  item,
  columns,
  rowIndex,
  editingCell,
  isEditMode,
  onCellEdit,
  onCellChange,
  onCellBlur,
  onDelete,
  onKeyDown,
  pendingImage,
  isImageMarkedForDelete,
  onImageSelect,
  onPendingImageRemove,
  onExistingImageDelete,
}: BOQItemRowProps) {
  const isRowEditing = editingCell?.rowIndex === rowIndex;

  // Compute amount (qty × rate)
  const computedAmount = item.quantity * item.rate;

  // Get value for a column
  const getCellValue = (columnKey: string): string | number | undefined => {
    switch (columnKey) {
      case 'code':
        return item.code || '';
      case 'description':
        return item.description;
      case 'unit':
        return item.unit;
      case 'quantity':
        return item.quantity;
      case 'rate':
        return item.rate;
      case 'amount':
        return computedAmount;
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'boq-row flex border-b border-border transition-colors',
        'hover:bg-muted/20',
        item.isReviewFlagged && 'bg-amber-50/50 hover:bg-amber-100/50'
      )}
    >
      {columns.map((col) => {
        const isEditing = isRowEditing && editingCell?.columnKey === col.key;
        const value = getCellValue(col.key);

        // Actions column (delete button) - only show in edit mode
        if (col.key === 'actions') {
          return (
            <div
              key={col.key}
              className="boq-cell flex min-h-[32px] items-center justify-center px-1"
              style={{ width: col.width, minWidth: col.width, flexShrink: 0 }}
            >
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        }

        // Image column
        if (col.key === 'image') {
          return (
            <div
              key={col.key}
              className="boq-cell flex min-h-[32px] items-center justify-center px-1"
              style={{ width: col.width, minWidth: col.width, flexShrink: 0 }}
            >
              <BOQItemImage
                projectId={projectId}
                boqItemId={item.id}
                isEditing={isEditMode}
                isNewItem={item.isNew}
                pendingImage={pendingImage}
                isMarkedForDelete={isImageMarkedForDelete}
                onImageSelect={onImageSelect}
                onPendingImageRemove={onPendingImageRemove}
                onExistingImageDelete={onExistingImageDelete}
              />
            </div>
          );
        }

        // Description column - use markdown editor
        if (col.key === 'description') {
          return (
            <div
              key={col.key}
              className="boq-cell min-h-[32px]"
              style={{
                width: col.width === '1fr' ? undefined : col.width,
                minWidth: col.width === '1fr' ? undefined : col.width,
                flex: col.width === '1fr' ? 1 : undefined,
              }}
            >
              <BOQDescriptionCell
                value={String(value || '')}
                isEditing={isEditing}
                isEditMode={isEditMode}
                onChange={(val) => onCellChange(item.id, col.key, val)}
                onStartEdit={() => onCellEdit(rowIndex, col.key)}
                onBlur={onCellBlur}
              />
            </div>
          );
        }

        // Unit column - use dropdown select
        if (col.type === 'select' && col.options) {
          return (
            <BOQSelectCell
              key={col.key}
              value={String(value || '')}
              options={col.options}
              width={col.width}
              isEditable={col.isEditable}
              isEditMode={isEditMode}
              onChange={(val) => onCellChange(item.id, col.key, val)}
            />
          );
        }

        return (
          <BOQCell
            key={col.key}
            value={value}
            type={col.type === 'select' ? 'text' : col.type}
            width={col.width}
            align={col.align}
            isEditable={isEditMode && col.isEditable}
            isEditing={isEditing}
            placeholder={col.placeholder}
            onStartEdit={() => onCellEdit(rowIndex, col.key)}
            onChange={(val) => onCellChange(item.id, col.key, val)}
            onBlur={onCellBlur}
            onKeyDown={(e) => onKeyDown(e, rowIndex, col.key)}
          />
        );
      })}
    </div>
  );
}
