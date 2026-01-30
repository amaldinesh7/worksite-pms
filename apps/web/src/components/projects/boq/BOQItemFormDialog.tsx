/**
 * BOQ Item Form Dialog
 *
 * Modal for adding/editing BOQ items with dynamic work categories.
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
import { useCategoryItems } from '@/lib/hooks/useCategories';
import type { BOQItem } from '@/lib/api/boq';

// ============================================
// Types
// ============================================

interface BOQItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  item?: BOQItem | null;
  defaultCategoryId?: string;
}

// ============================================
// Schema
// ============================================

const formSchema = z.object({
  code: z.string().optional(),
  boqCategoryItemId: z.string().min(1, 'Category is required'),
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

// Simplified units for construction BOQ
const COMMON_UNITS = ['sqft', 'sqm', 'M3', 'nos', 'kg', 'MT', 'bags', 'rmt', 'LS'];

// ============================================
// Component
// ============================================

export function BOQItemFormDialog({
  open,
  onOpenChange,
  projectId,
  item,
  defaultCategoryId,
}: BOQItemFormDialogProps) {
  const isEditing = !!item;

  // Hooks
  const { data: stages = [] } = useStagesByProject(projectId);
  const { data: boqCategories = [] } = useCategoryItems('boq_category');
  const createMutation = useCreateBOQItem(projectId);
  const updateMutation = useUpdateBOQItem(projectId);

  // Get active categories
  const activeCategories = boqCategories.filter((cat) => cat.isActive !== false);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      boqCategoryItemId: defaultCategoryId || '',
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
          boqCategoryItemId: item.boqCategoryItemId || item.boqCategory?.id || '',
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          stageId: item.stageId || '',
          notes: item.notes || '',
        });
      } else {
        // Set default category to first available if not provided
        const defaultCat = defaultCategoryId || (activeCategories[0]?.id ?? '');
        form.reset({
          code: '',
          boqCategoryItemId: defaultCat,
          description: '',
          unit: 'nos',
          quantity: 1,
          rate: 0,
          stageId: '',
          notes: '',
        });
      }
    }
  }, [open, item, defaultCategoryId, form, activeCategories]);

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
              <Label htmlFor="boqCategoryItemId">Work Category</Label>
              <Select
                value={form.watch('boqCategoryItemId')}
                onValueChange={(value) => form.setValue('boqCategoryItemId', value)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.boqCategoryItemId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.boqCategoryItemId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Item Code (Optional)</Label>
              <Input id="code" placeholder="e.g., R2-CS-EW-1" {...form.register('code')} />
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
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
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
              <Input id="rate" type="number" step="0.01" min="0" {...form.register('rate')} />
              {form.formState.errors.rate && (
                <p className="text-sm text-destructive">{form.formState.errors.rate.message}</p>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Quoted Amount</span>
            <span className="text-lg font-semibold">
              ₹
              {amount.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
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
                <SelectItem value="none" className="cursor-pointer">
                  No stage
                </SelectItem>
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
