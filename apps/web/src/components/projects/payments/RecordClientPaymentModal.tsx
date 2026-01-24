/**
 * Record Client Payment Modal
 *
 * Modal dialog for recording client payments (type = IN).
 * Features:
 * - Amount, Date, Payment Method, Reference Number, Notes
 * - Payment mode toggle (Cash, Bank Transfer, Cheque)
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
import { DatePicker } from '@/components/ui/custom/date-picker';
import { cn } from '@/lib/utils';
import { useCreatePayment, useUpdatePayment } from '@/lib/hooks/usePayments';
import type { PaymentMode, Payment } from '@/lib/api/payments';

// ============================================
// Schema
// ============================================

const paymentFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentDate: z.date({ required_error: 'Date is required' }),
  paymentMode: z.enum(['CASH', 'CHEQUE', 'ONLINE']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

// ============================================
// Types
// ============================================

interface RecordClientPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  payment?: Payment | null;
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

export function RecordClientPaymentModal({
  open,
  onOpenChange,
  projectId,
  payment,
}: RecordClientPaymentModalProps) {
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const isEditing = !!payment;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: undefined,
      paymentDate: new Date(),
      paymentMode: 'CASH',
      referenceNumber: '',
      notes: '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (payment) {
        // Edit mode - populate form with existing data
        reset({
          amount: Number(payment.amount),
          paymentDate: new Date(payment.paymentDate),
          paymentMode: payment.paymentMode as PaymentMode,
          referenceNumber: payment.referenceNumber || '',
          notes: payment.notes || '',
        });
      } else {
        // Create mode - reset to defaults
        reset({
          amount: undefined,
          paymentDate: new Date(),
          paymentMode: 'CASH',
          referenceNumber: '',
          notes: '',
        });
      }
    }
  }, [open, reset, payment]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      if (isEditing && payment) {
        await updateMutation.mutateAsync({
          id: payment.id,
          data: {
            amount: data.amount,
            paymentDate: data.paymentDate.toISOString(),
            paymentMode: data.paymentMode,
            referenceNumber: data.referenceNumber || undefined,
            notes: data.notes || undefined,
          },
        });
        toast.success('Payment updated successfully');
      } else {
        await createMutation.mutateAsync({
          projectId,
          type: 'IN',
          amount: data.amount,
          paymentDate: data.paymentDate.toISOString(),
          paymentMode: data.paymentMode,
          referenceNumber: data.referenceNumber || undefined,
          notes: data.notes || undefined,
        });
        toast.success('Payment recorded successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Failed to update payment' : 'Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Payment' : 'Record Client Payment'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select date"
                />
              )}
            />
            {errors.paymentDate && (
              <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
            )}
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

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number</Label>
            <Input
              id="referenceNumber"
              placeholder="Invoice or receipt number"
              {...register('referenceNumber')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this payment"
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
                  : 'Recording...'
                : isEditing
                  ? 'Save Changes'
                  : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
