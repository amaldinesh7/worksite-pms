/**
 * Delete Payment Dialog Component
 *
 * Confirmation dialog for deleting a payment.
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
import type { Payment } from '@/lib/api/payments';

// ============================================
// Props
// ============================================

interface DeletePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
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

export function DeletePaymentDialog({
  open,
  onOpenChange,
  payment,
  onConfirm,
  isDeleting,
}: DeletePaymentDialogProps) {
  if (!payment) return null;

  const paymentAmount = formatCurrency(Number(payment.amount));
  const partyName = payment.party?.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this payment of <strong>{paymentAmount}</strong>
            {partyName && (
              <>
                {' '}to <strong>{partyName}</strong>
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
