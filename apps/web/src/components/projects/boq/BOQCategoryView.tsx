/**
 * BOQ Category View
 *
 * Collapsible sections grouped by category with inline add functionality.
 */

import { useState, useCallback } from 'react';
import { CaretDown, CaretRight, Plus, DotsThree, PencilSimple, Trash, Package, Users, Wrench, Gear, DotsThreeCircle } from '@phosphor-icons/react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useBOQByCategory, useCreateBOQItem, useDeleteBOQItem } from '@/lib/hooks/useBOQ';
import { useStagesByProject } from '@/lib/hooks/useStages';
import { BOQItemFormDialog } from './BOQItemFormDialog';
import type { BOQItem, BOQCategory, BOQCategoryGroup } from '@/lib/api/boq';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface BOQCategoryViewProps {
  projectId: string;
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

const CATEGORY_CONFIG: Record<BOQCategory, { label: string; icon: typeof Package; color: string }> = {
  MATERIAL: { label: 'Material', icon: Package, color: 'text-blue-600' },
  LABOUR: { label: 'Labour', icon: Users, color: 'text-amber-600' },
  SUB_WORK: { label: 'Sub Work', icon: Wrench, color: 'text-purple-600' },
  EQUIPMENT: { label: 'Equipment', icon: Gear, color: 'text-green-600' },
  OTHER: { label: 'Other', icon: DotsThreeCircle, color: 'text-gray-600' },
};

const COMMON_UNITS = ['nos', 'sqft', 'sqm', 'cum', 'cft', 'rft', 'kg', 'MT', 'bags', 'liters', 'points', 'days', 'meters'];

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

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatVariance(variance: number): string {
  const prefix = variance >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(variance)}`;
}

// ============================================
// Category Section Component
// ============================================

interface CategorySectionProps {
  category: BOQCategory;
  group: BOQCategoryGroup | undefined;
  projectId: string;
  stages: Array<{ id: string; name: string }>;
  onEditItem: (item: BOQItem) => void;
}

function CategorySection({ category, group, projectId, stages, onEditItem }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [formState, setFormState] = useState<InlineAddFormState>(INITIAL_FORM_STATE);
  const [isAdding, setIsAdding] = useState(false);

  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
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
        category,
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
  }, [category, formState, createMutation]);

  const handleDeleteItem = useCallback(async (item: BOQItem) => {
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    }
  }, [deleteMutation]);

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
            <Icon className={cn('h-5 w-5', config.color)} />
            <span className="font-medium">{config.label}</span>
            <span className="text-sm text-muted-foreground">
              {itemCount} items • {formatCurrency(quotedTotal)} quoted
            </span>
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
                onValueChange={(value) => handleInputChange('stageId', value === 'none' ? '' : value)}
              >
                <SelectTrigger className="w-32 h-9 cursor-pointer">
                  <SelectValue placeholder="Stage (optional)" />
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
              <div className="w-24 text-right text-sm font-medium">
                ₹{formAmount > 0 ? formAmount.toLocaleString() : '0.00'}
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
          <div className="grid grid-cols-[1fr_80px_80px_100px_100px_100px_100px_40px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
            <div>Description</div>
            <div>Unit</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Quoted</div>
            <div>Stage</div>
            <div className="text-right">Variance</div>
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
                const actualAmount = item.expenseLinks.reduce((sum, link) => {
                  return sum + link.expense.rate * link.expense.quantity;
                }, 0);
                const variance = quotedAmount - actualAmount;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_80px_80px_100px_100px_100px_100px_40px] gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                      {item.code && (
                        <div className="text-xs text-muted-foreground">{item.code}</div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.unit}</div>
                    <div className="text-right text-sm">{item.quantity.toLocaleString()}</div>
                    <div className="text-right text-sm">₹{item.rate.toLocaleString()}</div>
                    <div className="text-right text-sm font-medium">{formatCurrency(quotedAmount)}</div>
                    <div className="text-sm text-muted-foreground">{item.stage?.name || '-'}</div>
                    <div className={cn(
                      'text-right text-sm',
                      variance >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {formatVariance(variance)}
                    </div>
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

export function BOQCategoryView({ projectId }: BOQCategoryViewProps) {
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: categoryGroups, isLoading } = useBOQByCategory(projectId);
  const { data: stages = [] } = useStagesByProject(projectId);

  const handleEditItem = useCallback((item: BOQItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  // Create a map for easy lookup
  const groupMap = (categoryGroups ?? []).reduce((acc, group) => {
    acc[group.category] = group;
    return acc;
  }, {} as Record<BOQCategory, BOQCategoryGroup>);

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

  const categories: BOQCategory[] = ['MATERIAL', 'LABOUR', 'SUB_WORK', 'OTHER'];

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          group={groupMap[category]}
          projectId={projectId}
          stages={stages}
          onEditItem={handleEditItem}
        />
      ))}

      {/* Edit Dialog */}
      <BOQItemFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        projectId={projectId}
        item={editingItem}
      />
    </div>
  );
}
