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
import type { Role } from '@/lib/api/roles';

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onConfirm,
  isDeleting,
}: DeleteRoleDialogProps) {
  if (!role) return null;

  const hasMembers = role.memberCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            {hasMembers ? (
              <>
                Cannot delete the role <strong>{role.name}</strong> because it has{' '}
                <strong>{role.memberCount}</strong> assigned{' '}
                {role.memberCount === 1 ? 'member' : 'members'}. Please reassign all members to a
                different role before deleting.
              </>
            ) : (
              <>
                Are you sure you want to delete the role <strong>{role.name}</strong>? This action
                cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          {!hasMembers && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
