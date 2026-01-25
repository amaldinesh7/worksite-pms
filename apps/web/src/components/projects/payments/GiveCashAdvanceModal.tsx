/**
 * Give Cash Advance Modal
 *
 * Modal dialog for giving cash advances to team members.
 * Features:
 * - Team member selection
 * - Amount, Date, Purpose, Payment Method, Expected Settlement Date, Notes
 * - Payment mode toggle (Cash, Bank Transfer, Cheque)
 * - Shows member's current balance info
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Money, Bank, CreditCard } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/custom/date-picker';
import { cn } from '@/lib/utils';
import {
  useProjectMembers,
  useMemberAdvanceSummary,
  useCreateMemberAdvance,
  useUpdateMemberAdvance,
} from '@/lib/hooks/useMemberAdvances';
import type { PaymentMode, MemberAdvance } from '@/lib/api/member-advances';

// ============================================
// Schema
// ============================================

const advanceFormSchema = z.object({
  memberId: z.string().min(1, 'Team member is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  advanceDate: z.date({ required_error: 'Date is required' }),
  purpose: z.string().min(1, 'Purpose is required'),
  paymentMode: z.enum(['CASH', 'CHEQUE', 'ONLINE']),
  expectedSettlementDate: z.date().optional(),
  notes: z.string().optional(),
});

type AdvanceFormData = z.infer<typeof advanceFormSchema>;

// ============================================
// Types
// ============================================

interface GiveCashAdvanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  preselectedMemberId?: string;
  advance?: MemberAdvance | null;
}

interface PaymentModeOption {
  value: PaymentMode;
  label: string;
  icon: React.ReactNode;
}

const PAYMENT_MODE_OPTIONS: PaymentModeOption[] = [
  { value: 'CASH', label: 'Cash', icon: <Money className="h-4 w-4" /> },
  { value: 'ONLINE', label: 'Bank Transfer', icon: <Bank className="h-4 w-4" /> },
  { value: 'CHEQUE', label: 'Cheque', icon: <CreditCard className="h-4 w-4" /> },
];

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================
// Payment Mode Toggle Component
// ============================================

interface PaymentModeToggleProps {
  value?: PaymentMode;
  onChange: (value: PaymentMode) => void;
}

function PaymentModeToggle({ value, onChange }: PaymentModeToggleProps) {
  return (
    <div className="flex gap-2">
      {PAYMENT_MODE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors cursor-pointer',
            value === option.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-input hover:bg-muted'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Component
// ============================================

export function GiveCashAdvanceModal({
  open,
  onOpenChange,
  projectId,
  preselectedMemberId,
  advance,
}: GiveCashAdvanceModalProps) {
  const createMutation = useCreateMemberAdvance();
  const updateMutation = useUpdateMemberAdvance();
  const isEditing = !!advance;

  // Fetch project members for dropdown
  const { data: projectMembers = [] } = useProjectMembers(projectId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceFormSchema),
    defaultValues: {
      memberId: preselectedMemberId || '',
      amount: undefined,
      advanceDate: new Date(),
      purpose: '',
      paymentMode: 'CASH',
      expectedSettlementDate: undefined,
      notes: '',
    },
  });

  const watchedMemberId = watch('memberId');

  // Fetch member summary for selected member
  const { data: memberSummary } = useMemberAdvanceSummary(projectId, watchedMemberId || '');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (advance) {
        // Edit mode - populate form with existing data
        reset({
          memberId: advance.memberId,
          amount: Number(advance.amount),
          advanceDate: new Date(advance.advanceDate),
          purpose: advance.purpose || '',
          paymentMode: advance.paymentMode as PaymentMode,
          expectedSettlementDate: advance.expectedSettlementDate
            ? new Date(advance.expectedSettlementDate)
            : undefined,
          notes: advance.notes || '',
        });
      } else {
        // Create mode - reset to defaults
        reset({
          memberId: preselectedMemberId || '',
          amount: undefined,
          advanceDate: new Date(),
          purpose: '',
          paymentMode: 'CASH',
          expectedSettlementDate: undefined,
          notes: '',
        });
      }
    }
  }, [open, reset, preselectedMemberId, advance]);

  const onSubmit = async (data: AdvanceFormData) => {
    try {
      if (isEditing && advance) {
        await updateMutation.mutateAsync({
          id: advance.id,
          data: {
            amount: data.amount,
            advanceDate: data.advanceDate.toISOString(),
            purpose: data.purpose,
            paymentMode: data.paymentMode,
            expectedSettlementDate: data.expectedSettlementDate?.toISOString(),
            notes: data.notes || undefined,
          },
        });
        toast.success('Advance updated successfully');
      } else {
        await createMutation.mutateAsync({
          projectId,
          memberId: data.memberId,
          amount: data.amount,
          advanceDate: data.advanceDate.toISOString(),
          purpose: data.purpose,
          paymentMode: data.paymentMode,
          expectedSettlementDate: data.expectedSettlementDate?.toISOString(),
          notes: data.notes || undefined,
        });
        toast.success('Advance given successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Failed to update advance' : 'Failed to give advance');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Cash Advance' : 'Give Cash Advance'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Team Member Selection */}
          <div className="space-y-2">
            <Label>Team Member *</Label>
            <Controller
              name="memberId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id} className="cursor-pointer">
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.memberId && (
              <p className="text-sm text-destructive">{errors.memberId.message}</p>
            )}
          </div>

          {/* Current Balance Display */}
          {watchedMemberId && memberSummary && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className="text-lg font-semibold text-orange-600">
                  {formatCurrency(memberSummary.balance)}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register('amount')}
              />
            </div>
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Controller
              name="advanceDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select date"
                />
              )}
            />
            {errors.advanceDate && (
              <p className="text-sm text-destructive">{errors.advanceDate.message}</p>
            )}
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input
              id="purpose"
              placeholder="e.g., Material purchase, Site expenses"
              {...register('purpose')}
            />
            {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Controller
              name="paymentMode"
              control={control}
              render={({ field }) => (
                <PaymentModeToggle value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Expected Settlement Date */}
          <div className="space-y-2">
            <Label>Expected Settlement Date (Optional)</Label>
            <Controller
              name="expectedSettlementDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select date"
                />
              )}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this advance"
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting
                ? isEditing
                  ? 'Saving...'
                  : 'Processing...'
                : isEditing
                  ? 'Save Changes'
                  : 'Give Advance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
