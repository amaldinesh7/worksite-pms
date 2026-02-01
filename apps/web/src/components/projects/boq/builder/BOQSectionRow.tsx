/**
 * BOQ Section Row
 *
 * Collapsible section header row in the BOQ builder grid.
 * Displays section name with edit capability and total amount.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { CaretDown, CaretRight, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { BOQBuilderSection } from './types';

// ============================================
// Types
// ============================================

interface BOQSectionRowProps {
  section: BOQBuilderSection;
  isExpanded: boolean;
  isEditMode: boolean;
  totalAmount: number;
  itemCount: number;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================
// Component
// ============================================

export function BOQSectionRow({
  section,
  isExpanded,
  isEditMode,
  totalAmount,
  itemCount,
  onToggle,
  onRename,
  onDelete,
}: BOQSectionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when section changes
  useEffect(() => {
    setEditValue(section.name);
  }, [section.name]);

  const handleStartEdit = () => {
    if (!isEditMode) return;
    setEditValue(section.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== section.name) {
      onRename(trimmed);
    } else {
      setEditValue(section.name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(section.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        'boq-section-row flex items-center border-b border-border',
        'bg-muted/50 font-medium transition-colors hover:bg-muted/70'
      )}
    >
      {/* Expand/Collapse Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <CaretDown className="h-4 w-4" weight="bold" />
        ) : (
          <CaretRight className="h-4 w-4" weight="bold" />
        )}
      </button>

      {/* Section Name (editable) */}
      <div className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full min-w-0 rounded border border-primary bg-background px-2 py-0.5 text-sm font-medium outline-none"
          />
        ) : (
          <span
            className={cn('min-w-0 truncate text-sm', isEditMode && 'cursor-text hover:bg-muted')}
            onClick={handleStartEdit}
            title={section.name}
          >
            {section.name}
          </span>
        )}

        {/* Item count badge */}
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Section Total */}
      <div className="shrink-0 px-3 py-1.5 text-right text-sm font-semibold tabular-nums">
        {formatCurrency(totalAmount)}
      </div>

      {/* Delete Section (only in edit mode) */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {isEditMode && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete section"
          >
            <Trash className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
