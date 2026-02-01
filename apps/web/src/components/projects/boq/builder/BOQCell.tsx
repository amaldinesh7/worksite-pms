/**
 * BOQ Cell
 *
 * Atomic cell component for the BOQ builder grid.
 * Handles view/edit states with inline editing.
 * Shows tooltip for truncated text on hover.
 */

import { useRef, useEffect, useState, type KeyboardEvent, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// Types
// ============================================

export interface BOQCellProps {
  value: string | number | undefined;
  type?: 'text' | 'number' | 'currency';
  width: string;
  align?: 'left' | 'center' | 'right';
  isEditable?: boolean;
  isEditing?: boolean;
  placeholder?: string;
  className?: string;
  onStartEdit?: () => void;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(num);
}

function formatNumber(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 4,
  }).format(num);
}

// ============================================
// Component
// ============================================

export function BOQCell({
  value,
  type = 'text',
  width,
  align = 'left',
  isEditable = true,
  isEditing = false,
  placeholder,
  className,
  onStartEdit,
  onChange,
  onBlur,
  onKeyDown,
}: BOQCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Check if text is truncated when value changes
  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    // Check on mount and when value changes
    checkTruncation();

    // Use ResizeObserver for responsive checks
    const observer = new ResizeObserver(checkTruncation);
    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  // Format display value based on type
  const getDisplayValue = () => {
    if (value === undefined || value === null || value === '') {
      return placeholder ? (
        <span className="text-muted-foreground/50 italic">{placeholder}</span>
      ) : (
        ''
      );
    }

    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      default:
        return String(value);
    }
  };

  // Alignment classes
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // Handle double-click to edit
  const handleDoubleClick = () => {
    if (isEditable && onStartEdit) {
      onStartEdit();
    }
  };

  // Handle click (single click also starts edit for faster UX)
  const handleClick = () => {
    if (isEditable && onStartEdit && !isEditing) {
      onStartEdit();
    }
  };

  return (
    <div
      className={cn(
        'boq-cell relative flex min-h-[32px] items-center border-r border-border px-2 py-1',
        alignClass,
        isEditable && !isEditing && 'cursor-text hover:bg-muted/30',
        isEditing && 'ring-2 ring-inset ring-primary bg-background z-10',
        !isEditable && 'bg-muted/10',
        className
      )}
      style={{ width, minWidth: width, flexShrink: 0 }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type={type === 'number' || type === 'currency' ? 'number' : 'text'}
          step={type === 'currency' ? '0.01' : type === 'number' ? 'any' : undefined}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full bg-transparent text-sm outline-none',
            alignClass,
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
          )}
        />
      ) : isTruncated && value ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span ref={textRef} className={cn('w-full truncate text-sm', alignClass)}>
                {getDisplayValue()}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs break-words">
              {String(value)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span ref={textRef} className={cn('w-full truncate text-sm', alignClass)}>
          {getDisplayValue()}
        </span>
      )}
    </div>
  );
}
