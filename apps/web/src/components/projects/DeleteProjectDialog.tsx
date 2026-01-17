/**
 * Delete Project Dialog Component
 *
 * Confirmation dialog for deleting a project.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Project } from '@/lib/api/projects';

// ============================================
// Props
// ============================================

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

// ============================================
// Component
// ============================================

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onConfirm,
  isDeleting,
}: DeleteProjectDialogProps) {
  if (!project) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be
            undone. All associated expenses, payments, and documents will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteProjectDialog;
