/**
 * BOQ Select Cell
 *
 * Dropdown select cell for the BOQ builder grid.
 * Used for fields with predefined options (e.g., unit).
 */

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================
// Types
// ============================================

export interface BOQSelectCellProps {
  value: string;
  options: readonly string[];
  width: string;
  isEditable?: boolean;
  isEditMode?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

// ============================================
// Component
// ============================================

export function BOQSelectCell({
  value,
  options,
  width,
  isEditable = true,
  isEditMode = false,
  className,
  onChange,
}: BOQSelectCellProps) {
  const isInteractive = isEditable && isEditMode;

  // In view mode or non-editable, just show the value
  if (!isInteractive) {
    return (
      <div
        className={cn(
          'boq-cell relative flex min-h-[32px] items-center justify-center border-r border-border px-2 py-1',
          !isEditable && 'bg-muted/10',
          className
        )}
        style={{ width, minWidth: width, flexShrink: 0 }}
      >
        <span className="text-sm">{value || '-'}</span>
      </div>
    );
  }

  // In edit mode, show the dropdown
  return (
    <div
      className={cn(
        'boq-cell relative flex min-h-[32px] items-center justify-center border-r border-border',
        className
      )}
      style={{ width, minWidth: width, flexShrink: 0 }}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            'h-full w-full border-0 rounded-none bg-transparent shadow-none',
            'px-1 py-0 text-sm text-center',
            'focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background',
            'hover:bg-muted/30',
            '[&>span]:text-center [&>span]:w-full',
            // Hide the chevron to keep it compact
            '[&>div]:hidden'
          )}
        >
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent align="center" className="min-w-[80px]">
          {options.map((option) => (
            <SelectItem key={option} value={option} className="text-sm justify-center">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
