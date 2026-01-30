/**
 * BOQ Category View
 *
 * Collapsible sections grouped by dynamic work categories with:
 * - Full amount display (not short format)
 * - Category totals on the right side with prominence
 * - Sticky total bar at the bottom
 */

import { useState, useCallback } from 'react';
import { CaretDown, CaretRight, Plus, DotsThree, PencilSimple, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBOQByCategory, useCreateBOQItem, useDeleteBOQItem } from '@/lib/hooks/useBOQ';
import { useStagesByProject } from '@/lib/hooks/useStages';
import { useCategoryItems } from '@/lib/hooks/useCategories';
import { BOQItemFormDialog } from './BOQItemFormDialog';
import type { BOQItem, BOQCategoryGroup } from '@/lib/api/boq';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface BOQCategoryViewProps {
  projectId: string;
  totalQuoted?: number;
}

interface InlineAddFormState {
  description: string;
  unit: string;
  quantity: string;
  rate: string;
  stageId: string;
}

// ============================================
// Constants
// ============================================

// Simplified units for construction BOQ
const COMMON_UNITS = ['sqft', 'sqm', 'M3', 'nos', 'kg', 'MT', 'bags', 'rmt', 'LS'];

const INITIAL_FORM_STATE: InlineAddFormState = {
  description: '',
  unit: 'nos',
  quantity: '',
  rate: '',
  stageId: '',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format currency as full amount (not short format)
 * Example: ₹8,60,000 instead of ₹8.60L
 */
function formatFullCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================
// Category Section Component
// ============================================

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  group: BOQCategoryGroup | undefined;
  projectId: string;
  stages: Array<{ id: string; name: string }>;
  onEditItem: (item: BOQItem) => void;
}

function CategorySection({
  categoryId,
  categoryName,
  group,
  projectId,
  stages,
  onEditItem,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [formState, setFormState] = useState<InlineAddFormState>(INITIAL_FORM_STATE);
  const [isAdding, setIsAdding] = useState(false);

  const items = group?.items ?? [];
  const itemCount = group?.itemCount ?? 0;
  const quotedTotal = group?.quotedTotal ?? 0;

  const createMutation = useCreateBOQItem(projectId);
  const deleteMutation = useDeleteBOQItem(projectId);

  const handleInputChange = useCallback((field: keyof InlineAddFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddItem = useCallback(async () => {
    if (!formState.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const quantity = parseFloat(formState.quantity) || 0;
    const rate = parseFloat(formState.rate) || 0;

    if (quantity <= 0) {
      toast.error('Quantity must be positive');
      return;
    }

    setIsAdding(true);
    try {
      await createMutation.mutateAsync({
        boqCategoryItemId: categoryId,
        description: formState.description.trim(),
        unit: formState.unit,
        quantity,
        rate,
        stageId: formState.stageId || undefined,
      });
      setFormState(INITIAL_FORM_STATE);
      toast.success('Item added');
    } catch {
      toast.error('Failed to add item');
    } finally {
      setIsAdding(false);
    }
  }, [categoryId, formState, createMutation]);

  const handleDeleteItem = useCallback(
    async (item: BOQItem) => {
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.success('Item deleted');
      } catch {
        toast.error('Failed to delete item');
      }
    },
    [deleteMutation]
  );

  // Calculate form amount
  const formQuantity = parseFloat(formState.quantity) || 0;
  const formRate = parseFloat(formState.rate) || 0;
  const formAmount = formQuantity * formRate;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
      {/* Header */}
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <CaretDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <CaretRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-base">{categoryName}</span>
            <span className="text-sm text-muted-foreground">({itemCount} items)</span>
          </div>
          {/* Category total on the right with prominence */}
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{formatFullCurrency(quotedTotal)}</div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t">
          {/* Inline Add Form */}
          <div className="p-3 bg-muted/30 border-b">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Description (e.g., Cement 43 Grade, Electrical Wiring)"
                value={formState.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="flex-1 h-9"
              />
              <Select
                value={formState.unit}
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger className="w-20 h-9 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit} className="cursor-pointer">
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Qty"
                value={formState.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-20 h-9"
              />
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">₹</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formState.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  className="w-24 h-9"
                />
              </div>
              <Select
                value={formState.stageId || 'none'}
                onValueChange={(value) =>
                  handleInputChange('stageId', value === 'none' ? '' : value)
                }
              >
                <SelectTrigger className="w-32 h-9 cursor-pointer">
                  <SelectValue placeholder="Stage (optional)" />
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
              <div className="w-28 text-right text-sm font-medium">
                {formatFullCurrency(formAmount)}
              </div>
              <Button
                size="sm"
                onClick={handleAddItem}
                disabled={isAdding || !formState.description.trim()}
                className="h-9 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_80px_100px_140px_100px_40px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
            <div>Description</div>
            <div>Unit</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Quoted Amount</div>
            <div>Stage</div>
            <div></div>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No items in this category. Add one above.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => {
                const quotedAmount = item.quantity * item.rate;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_80px_80px_100px_140px_100px_40px] gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                      {item.code && (
                        <div className="text-xs text-muted-foreground">{item.code}</div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.unit}</div>
                    <div className="text-right text-sm">{item.quantity.toLocaleString()}</div>
                    <div className="text-right text-sm">{formatFullCurrency(item.rate)}</div>
                    <div className="text-right text-sm font-semibold">
                      {formatFullCurrency(quotedAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.stage?.name || '-'}</div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                            <DotsThree className="h-4 w-4" weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEditItem(item)}
                            className="cursor-pointer"
                          >
                            <PencilSimple className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(item)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================
// Main Component
// ============================================

export function BOQCategoryView({ projectId, totalQuoted = 0 }: BOQCategoryViewProps) {
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: categoryGroups, isLoading } = useBOQByCategory(projectId);
  const { data: stages = [] } = useStagesByProject(projectId);
  const { data: boqCategories = [] } = useCategoryItems('boq_category');

  const handleEditItem = useCallback((item: BOQItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  // Create a map for easy lookup by category name
  const groupMap = (categoryGroups ?? []).reduce(
    (acc, group) => {
      acc[group.categoryName] = group;
      return acc;
    },
    {} as Record<string, BOQCategoryGroup>
  );

  // Calculate grand total from all category groups
  const grandTotal =
    categoryGroups?.reduce((sum, group) => sum + (group.quotedTotal || 0), 0) || totalQuoted;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Filter categories that have items or are part of our default set
  const activeCategories = boqCategories.filter((cat) => cat.isActive !== false);

  return (
    <>
      <div className="space-y-4">
        {activeCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No BOQ categories found.</p>
            <p className="text-sm mt-1">
              Please ensure BOQ work categories are configured in the system.
            </p>
          </div>
        ) : (
          activeCategories.map((category) => (
            <CategorySection
              key={category.id}
              categoryId={category.id}
              categoryName={category.name}
              group={groupMap[category.name]}
              projectId={projectId}
              stages={stages}
              onEditItem={handleEditItem}
            />
          ))
        )}
      </div>

      {/* Sticky Total Bar at Bottom - positioned within content container */}
      <div className="sticky bottom-0 bg-card border-t border rounded-lg shadow-lg mt-4 -mx-1">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">
              <span className="font-medium">Total BOQ Amount</span>
              <span className="text-sm ml-2">
                ({categoryGroups?.reduce((sum, g) => sum + (g.itemCount || 0), 0) || 0} items)
              </span>
            </div>
            <div className={cn('text-2xl font-bold', 'text-primary')}>
              {formatFullCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <BOQItemFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        projectId={projectId}
        item={editingItem}
      />
    </>
  );
}
