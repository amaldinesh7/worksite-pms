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
import type { Party, PartyType } from '@/lib/api/parties';

interface DeletePartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: Party | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeletePartyDialog({
  open,
  onOpenChange,
  party,
  onConfirm,
  isDeleting,
}: DeletePartyDialogProps) {
  const getTypeLabel = (type: PartyType): string => {
    switch (type) {
      case 'VENDOR':
        return 'vendor';
      case 'LABOUR':
        return 'labour';
      case 'SUBCONTRACTOR':
        return 'sub contractor';
      default:
        return 'party';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {party?.type ? getTypeLabel(party.type) : 'party'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{party?.name}</strong>? This action cannot be
            undone. All associated expenses and payments will be affected.
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
