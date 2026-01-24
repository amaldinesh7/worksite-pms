/**
 * Delete Advance Dialog Component
 *
 * Confirmation dialog for deleting a member advance.
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
import type { MemberAdvance } from '@/lib/api/member-advances';

// ============================================
// Props
// ============================================

interface DeleteAdvanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: MemberAdvance | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

// ============================================
// Helper
// ============================================

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================
// Component
// ============================================

export function DeleteAdvanceDialog({
  open,
  onOpenChange,
  advance,
  onConfirm,
  isDeleting,
}: DeleteAdvanceDialogProps) {
  if (!advance) return null;

  const advanceAmount = formatCurrency(Number(advance.amount));
  const memberName = advance.member?.user?.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Advance</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this advance of <strong>{advanceAmount}</strong>
            {memberName && (
              <>
                {' '}given to <strong>{memberName}</strong>
              </>
            )}
            ? This action cannot be undone.
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
