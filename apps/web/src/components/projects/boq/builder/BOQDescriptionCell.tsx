/**
 * BOQ Description Cell
 *
 * A markdown-enabled cell for BOQ item descriptions.
 * Supports bold, italic, strikethrough, and lists.
 */

import { useRef, useEffect } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';
import { MarkdownPreview } from '@/components/ui/markdown-preview';

// ============================================
// Types
// ============================================

interface BOQDescriptionCellProps {
  value: string;
  isEditing: boolean;
  isEditMode: boolean; // Global edit mode
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onBlur?: () => void;
  className?: string;
}

// ============================================
// Component
// ============================================

export function BOQDescriptionCell({
  value,
  isEditing,
  isEditMode,
  onChange,
  onStartEdit,
  onBlur,
  className,
}: BOQDescriptionCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to blur
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, onBlur]);

  // View mode: render markdown preview
  if (!isEditing) {
    return (
      <div
        className={cn(
          'min-h-[36px] w-full px-2 py-1.5 text-sm',
          isEditMode && 'cursor-pointer hover:bg-muted/50',
          className
        )}
        onClick={isEditMode ? onStartEdit : undefined}
      >
        <div className="line-clamp-2">
          <MarkdownPreview source={value} isCompact />
        </div>
      </div>
    );
  }

  // Edit mode: show markdown editor
  return (
    <div ref={containerRef} className={cn('w-full', className)} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        height={120}
        visibleDragbar={false}
        hideToolbar={false}
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
        ]}
        extraCommands={[]}
        textareaProps={{
          placeholder: 'Enter description...',
          onBlur: onBlur,
        }}
      />
    </div>
  );
}
