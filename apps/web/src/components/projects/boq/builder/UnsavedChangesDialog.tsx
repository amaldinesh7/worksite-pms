import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

/**
 * Dialog to warn users about unsaved changes when navigating away.
 *
 * Provides three options:
 * - Cancel: Stay on the page and continue editing
 * - Discard Changes: Leave without saving
 * - Save & Leave: Save changes and then navigate
 */
export function UnsavedChangesDialog({
  isOpen,
  isSaving,
  onCancel,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes that will be lost if you leave this page. What would you like
            to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={onDiscard}
            disabled={isSaving}
            className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Discard Changes
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="cursor-pointer">
            {isSaving ? 'Saving...' : 'Save & Leave'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
