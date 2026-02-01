/**
 * BOQ Add Row (Ghost Row)
 *
 * A placeholder row for quickly adding new items to a section.
 * Shows a dashed border and muted text to indicate it's not a real item.
 */

import { Plus } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { BOQColumnConfig } from './types';

// ============================================
// Types
// ============================================

interface BOQAddRowProps {
  sectionId: string | null;
  columns: BOQColumnConfig[];
  onAdd: (sectionId: string | null) => void;
}

// ============================================
// Component
// ============================================

export function BOQAddRow({ sectionId, columns, onAdd }: BOQAddRowProps) {
  const handleClick = () => {
    onAdd(sectionId);
  };

  return (
    <div
      className={cn(
        'boq-add-row flex cursor-pointer border-b border-dashed border-border/50',
        'text-muted-foreground transition-colors hover:bg-muted/20'
      )}
      onClick={handleClick}
    >
      {/* Code column with plus icon */}
      <div
        className="flex items-center justify-center px-2 py-1.5"
        style={{ width: columns[0]?.width || '50px', minWidth: columns[0]?.width || '50px' }}
      >
        <Plus className="h-3.5 w-3.5" weight="bold" />
      </div>

      {/* Description placeholder */}
      <div className="flex flex-1 items-center px-2 py-1.5 text-sm italic">Add item...</div>

      {/* Empty cells for remaining columns */}
      {columns.slice(2).map((col) => (
        <div
          key={col.key}
          className="px-2 py-1.5"
          style={{
            width: col.width === '1fr' ? undefined : col.width,
            minWidth: col.width === '1fr' ? undefined : col.width,
            flex: col.width === '1fr' ? 1 : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// Add Section Row
// ============================================

interface BOQAddSectionRowProps {
  onAdd: () => void;
}

export function BOQAddSectionRow({ onAdd }: BOQAddSectionRowProps) {
  return (
    <div
      className={cn(
        'boq-add-section flex cursor-pointer items-center gap-2 border-t border-dashed border-border/50',
        'px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/20'
      )}
      onClick={onAdd}
    >
      <Plus className="h-4 w-4" weight="bold" />
      <span>Add Section</span>
    </div>
  );
}
