/**
 * BOQ Stage View
 *
 * BOQ items grouped by project stage.
 * Note: This view is kept for potential future use but is not the primary view.
 */

import { useState, useCallback } from 'react';
import {
  CaretDown,
  CaretRight,
  DotsThree,
  PencilSimple,
  Trash,
  Stack,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBOQByStage, useDeleteBOQItem } from '@/lib/hooks/useBOQ';
import { BOQItemFormDialog } from './BOQItemFormDialog';
import type { BOQItem, BOQStageGroup } from '@/lib/api/boq';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface BOQStageViewProps {
  projectId: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format currency as full amount (not short format)
 */
function formatFullCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatVariance(variance: number): string {
  const prefix = variance >= 0 ? '+' : '';
  return `${prefix}${formatFullCurrency(variance)}`;
}

// ============================================
// Stage Section Component
// ============================================

interface StageSectionProps {
  group: BOQStageGroup;
  projectId: string;
  onEditItem: (item: BOQItem) => void;
}

function StageSection({ group, projectId, onEditItem }: StageSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const deleteMutation = useDeleteBOQItem(projectId);

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
            <Stack className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{group.stageName}</span>
            <span className="text-sm text-muted-foreground">{group.itemCount} items</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Quoted:{' '}
              <span className="font-medium text-foreground">
                {formatFullCurrency(group.quotedTotal)}
              </span>
            </span>
            <span className={cn(group.variance >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatVariance(group.variance)}
            </span>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t">
          {/* Table Header */}
          <div className="grid grid-cols-[100px_1fr_80px_80px_120px_120px_120px_120px_40px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
            <div>Category</div>
            <div>Description</div>
            <div>Unit</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Quoted</div>
            <div className="text-right">Actual</div>
            <div className="text-right">Variance</div>
            <div></div>
          </div>

          {/* Items */}
          {group.items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No items assigned to this stage.
            </div>
          ) : (
            <div className="divide-y">
              {group.items.map((item) => {
                const quotedAmount = item.quantity * item.rate;
                const actualAmount = item.expenseLinks.reduce((sum, link) => {
                  return sum + link.expense.rate * link.expense.quantity;
                }, 0);
                const variance = quotedAmount - actualAmount;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[100px_1fr_80px_80px_120px_120px_120px_120px_40px] gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <Badge variant="secondary" className="text-xs bg-muted">
                        {item.boqCategory?.name || 'Unknown'}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium">{item.description}</div>
                      {item.code && (
                        <div className="text-xs text-muted-foreground">{item.code}</div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.unit}</div>
                    <div className="text-right text-sm">{item.quantity.toLocaleString()}</div>
                    <div className="text-right text-sm">{formatFullCurrency(item.rate)}</div>
                    <div className="text-right text-sm font-medium">
                      {formatFullCurrency(quotedAmount)}
                    </div>
                    <div className="text-right text-sm">{formatFullCurrency(actualAmount)}</div>
                    <div
                      className={cn(
                        'text-right text-sm',
                        variance >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
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

export function BOQStageView({ projectId }: BOQStageViewProps) {
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: stageGroups, isLoading } = useBOQByStage(projectId);

  const handleEditItem = useCallback((item: BOQItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!stageGroups || stageGroups.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Stack className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No BOQ items found.</p>
        <p className="text-sm">Add items and assign them to stages to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stageGroups.map((group) => (
        <StageSection
          key={group.stageId || 'unassigned'}
          group={group}
          projectId={projectId}
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
