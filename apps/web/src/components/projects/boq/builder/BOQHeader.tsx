/**
 * BOQ Header
 *
 * Header section of the BOQ builder with title, totals, and action buttons.
 * Includes Edit/Save/Cancel functionality.
 */

import { Upload, Plus, PencilSimple, FloppyDisk, X } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// Types
// ============================================

interface BOQHeaderProps {
  projectName?: string;
  grandTotal: number;
  itemCount: number;
  sectionCount: number;
  hasExistingBOQ: boolean;
  // Edit mode props
  isEditMode: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  // Action props
  onAddSection: () => void;
  onImport: () => void;
  onExport: () => void;
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

export function BOQHeader({
  grandTotal,
  itemCount,
  sectionCount,
  hasExistingBOQ,
  isEditMode,
  hasChanges,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onAddSection,
  onImport,
}: BOQHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4">
      {/* Left side - Title and stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isEditMode && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Editing
            </span>
          )}
          {isEditMode && hasChanges && (
            <span className="text-xs text-muted-foreground">• Unsaved changes</span>
          )}
        </div>

        {/* Stats - inline text */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
          </span>
          <span className="text-border">•</span>
          <span>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-border">•</span>
          <span className="font-medium text-primary tabular-nums">
            Total: {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {isEditMode ? (
          // Edit mode actions
          <>
            <Button variant="outline" size="sm" onClick={onAddSection} className="cursor-pointer">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Section
            </Button>

            <div className="mx-1 h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              disabled={isSaving}
              className="cursor-pointer text-muted-foreground"
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FloppyDisk className="mr-1.5 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </>
        ) : (
          // View mode actions
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              disabled={hasExistingBOQ}
              title={hasExistingBOQ ? 'Delete existing BOQ to import new' : 'Import BOQ from file'}
              className="cursor-pointer"
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Import
            </Button>

            <Button size="sm" onClick={onStartEdit} className="cursor-pointer">
              <PencilSimple className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
