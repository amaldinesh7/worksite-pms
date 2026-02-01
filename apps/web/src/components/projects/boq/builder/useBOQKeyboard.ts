/**
 * BOQ Keyboard Navigation Hook
 *
 * Handles keyboard navigation for the BOQ builder grid.
 * Supports Tab, Enter, Escape, and Arrow keys.
 */

import { useCallback, type KeyboardEvent } from 'react';
import type { BOQColumnConfig, EditingCell } from './types';

// ============================================
// Types
// ============================================

interface UseBOQKeyboardOptions {
  columns: BOQColumnConfig[];
  rowCount: number;
  editingCell: EditingCell | null;
  setEditingCell: (cell: EditingCell | null) => void;
  onSaveAndAddNew?: () => void;
}

interface UseBOQKeyboardReturn {
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnKey: string) => void;
}

// ============================================
// Hook
// ============================================

export function useBOQKeyboard({
  columns,
  rowCount,
  editingCell,
  setEditingCell,
  onSaveAndAddNew,
}: UseBOQKeyboardOptions): UseBOQKeyboardReturn {
  // Find editable columns only
  const editableColumns = columns.filter((col) => col.isEditable);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnKey: string) => {
      const currentColIndex = editableColumns.findIndex((col) => col.key === columnKey);

      switch (e.key) {
        case 'Tab': {
          e.preventDefault();

          if (e.shiftKey) {
            // Move backwards
            if (currentColIndex > 0) {
              // Move to previous column in same row
              setEditingCell({
                rowIndex,
                columnKey: editableColumns[currentColIndex - 1].key,
                sectionId: editingCell?.sectionId || null,
              });
            } else if (rowIndex > 0) {
              // Move to last column of previous row
              setEditingCell({
                rowIndex: rowIndex - 1,
                columnKey: editableColumns[editableColumns.length - 1].key,
                sectionId: editingCell?.sectionId || null,
              });
            }
          } else {
            // Move forwards
            if (currentColIndex < editableColumns.length - 1) {
              // Move to next column in same row
              setEditingCell({
                rowIndex,
                columnKey: editableColumns[currentColIndex + 1].key,
                sectionId: editingCell?.sectionId || null,
              });
            } else if (rowIndex < rowCount - 1) {
              // Move to first column of next row
              setEditingCell({
                rowIndex: rowIndex + 1,
                columnKey: editableColumns[0].key,
                sectionId: editingCell?.sectionId || null,
              });
            } else if (onSaveAndAddNew) {
              // At last cell of last row - create new row
              onSaveAndAddNew();
            }
          }
          break;
        }

        case 'Enter': {
          e.preventDefault();

          if (e.shiftKey) {
            // Move up
            if (rowIndex > 0) {
              setEditingCell({
                rowIndex: rowIndex - 1,
                columnKey,
                sectionId: editingCell?.sectionId || null,
              });
            }
          } else {
            // Move down
            if (rowIndex < rowCount - 1) {
              setEditingCell({
                rowIndex: rowIndex + 1,
                columnKey,
                sectionId: editingCell?.sectionId || null,
              });
            } else if (onSaveAndAddNew) {
              // At last row - create new row
              onSaveAndAddNew();
            } else {
              // Save and exit edit mode
              setEditingCell(null);
            }
          }
          break;
        }

        case 'Escape': {
          e.preventDefault();
          setEditingCell(null);
          break;
        }

        case 'ArrowUp': {
          // Only navigate if at the start of input
          const input = e.target as HTMLInputElement;
          if (input.selectionStart === 0 && input.selectionEnd === 0) {
            e.preventDefault();
            if (rowIndex > 0) {
              setEditingCell({
                rowIndex: rowIndex - 1,
                columnKey,
                sectionId: editingCell?.sectionId || null,
              });
            }
          }
          break;
        }

        case 'ArrowDown': {
          // Only navigate if at the end of input
          const input = e.target as HTMLInputElement;
          if (input.selectionStart === input.value.length) {
            e.preventDefault();
            if (rowIndex < rowCount - 1) {
              setEditingCell({
                rowIndex: rowIndex + 1,
                columnKey,
                sectionId: editingCell?.sectionId || null,
              });
            }
          }
          break;
        }

        case 'ArrowLeft': {
          // Only navigate if at the start of input
          const input = e.target as HTMLInputElement;
          if (input.selectionStart === 0 && input.selectionEnd === 0) {
            e.preventDefault();
            if (currentColIndex > 0) {
              setEditingCell({
                rowIndex,
                columnKey: editableColumns[currentColIndex - 1].key,
                sectionId: editingCell?.sectionId || null,
              });
            }
          }
          break;
        }

        case 'ArrowRight': {
          // Only navigate if at the end of input
          const input = e.target as HTMLInputElement;
          if (input.selectionStart === input.value.length) {
            e.preventDefault();
            if (currentColIndex < editableColumns.length - 1) {
              setEditingCell({
                rowIndex,
                columnKey: editableColumns[currentColIndex + 1].key,
                sectionId: editingCell?.sectionId || null,
              });
            }
          }
          break;
        }
      }
    },
    [columns, editableColumns, rowCount, editingCell, setEditingCell, onSaveAndAddNew]
  );

  return { handleKeyDown };
}
