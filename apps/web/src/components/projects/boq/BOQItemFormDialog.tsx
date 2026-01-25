/**
 * BOQ Item Form Dialog
 *
 * Modal for adding/editing BOQ items.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateBOQItem, useUpdateBOQItem } from '@/lib/hooks/useBOQ';
import { useStagesByProject } from '@/lib/hooks/useStages';
import type { BOQItem, BOQCategory } from '@/lib/api/boq';

// ============================================
// Types
// ============================================

interface BOQItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  item?: BOQItem | null;
  defaultCategory?: BOQCategory;
}

// ============================================
// Schema
// ============================================

const formSchema = z.object({
  code: z.string().optional(),
  category: z.enum(['MATERIAL', 'LABOUR', 'SUB_WORK', 'EQUIPMENT', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  rate: z.coerce.number().nonnegative('Rate must be non-negative'),
  stageId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================
// Constants
// ============================================

const CATEGORY_OPTIONS: { value: BOQCategory; label: string }[] = [
  { value: 'MATERIAL', label: 'Material' },
  { value: 'LABOUR', label: 'Labour' },
  { value: 'SUB_WORK', label: 'Sub Work' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'OTHER', label: 'Other' },
];

const COMMON_UNITS = ['nos', 'sqft', 'sqm', 'cum', 'cft', 'rft', 'kg', 'MT', 'bags', 'liters', 'points', 'days', 'meters'];

// ============================================
// Component
// ============================================

export function BOQItemFormDialog({
  open,
  onOpenChange,
  projectId,
  item,
  defaultCategory = 'MATERIAL',
}: BOQItemFormDialogProps) {
  const isEditing = !!item;

  // Hooks
  const { data: stages = [] } = useStagesByProject(projectId);
  const createMutation = useCreateBOQItem(projectId);
  const updateMutation = useUpdateBOQItem(projectId);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      category: defaultCategory,
      description: '',
      unit: 'nos',
      quantity: 1,
      rate: 0,
      stageId: '',
      notes: '',
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          code: item.code || '',
          category: item.category,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          stageId: item.stageId || '',
          notes: item.notes || '',
        });
      } else {
        form.reset({
          code: '',
          category: defaultCategory,
          description: '',
          unit: 'nos',
          quantity: 1,
          rate: 0,
          stageId: '',
          notes: '',
        });
      }
    }
  }, [open, item, defaultCategory, form]);

  // Handlers
  const handleSubmit = async (values: FormValues) => {
    try {
      const data = {
        ...values,
        stageId: values.stageId || undefined,
        notes: values.notes || undefined,
        code: values.code || undefined,
      };

      if (isEditing && item) {
        await updateMutation.mutateAsync({ id: item.id, data });
        toast.success('BOQ item updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('BOQ item added');
      }

      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Failed to update item' : 'Failed to add item');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Calculate amount
  const quantity = form.watch('quantity') || 0;
  const rate = form.watch('rate') || 0;
  const amount = quantity * rate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit BOQ Item' : 'Add BOQ Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Category & Code Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value as BOQCategory)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Item Code (Optional)</Label>
              <Input
                id="code"
                placeholder="e.g., R2-CS-EW-1"
                {...form.register('code')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter item description"
              rows={2}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Unit, Qty, Rate Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={form.watch('unit')}
                onValueChange={(value) => form.setValue('unit', value)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit} className="cursor-pointer">
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.unit && (
                <p className="text-sm text-destructive">{form.formState.errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                {...form.register('quantity')}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (₹)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                {...form.register('rate')}
              />
              {form.formState.errors.rate && (
                <p className="text-sm text-destructive">{form.formState.errors.rate.message}</p>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Quoted Amount</span>
            <span className="text-lg font-semibold">
              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <Label htmlFor="stageId">Link to Stage (Optional)</Label>
            <Select
              value={form.watch('stageId') || 'none'}
              onValueChange={(value) => form.setValue('stageId', value === 'none' ? '' : value)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">No stage</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id} className="cursor-pointer">
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes"
              rows={2}
              {...form.register('notes')}
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
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
