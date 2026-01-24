/**
 * BOQ Import Review
 *
 * Full-screen review of parsed BOQ items before importing.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Warning,
  MagnifyingGlass,
  CaretDown,
  CaretRight,
  PencilSimple,
  X,
  Check,
  Link as LinkIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useConfirmBOQImport } from '@/lib/hooks/useBOQ';
import { useStagesByProject } from '@/lib/hooks/useStages';
import type { ParseResult, ParsedBOQItem } from '@/lib/api/boq';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface BOQImportReviewProps {
  projectId: string;
  parseResult: ParseResult;
  onBack: () => void;
  onComplete: () => void;
}

interface ReviewItem extends ParsedBOQItem {
  id: string;
  isSelected: boolean;
  isEditing: boolean;
}

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

function groupBySection(items: ReviewItem[]): Map<string, ReviewItem[]> {
  const groups = new Map<string, ReviewItem[]>();

  for (const item of items) {
    const section = item.sectionName || 'Other';
    if (!groups.has(section)) {
      groups.set(section, []);
    }
    groups.get(section)!.push(item);
  }

  return groups;
}

// ============================================
// Component
// ============================================

export function BOQImportReview({
  projectId,
  parseResult,
  onBack,
  onComplete,
}: BOQImportReviewProps) {
  // Initialize items with selection state
  const [items, setItems] = useState<ReviewItem[]>(() =>
    parseResult.items.map((item, index) => ({
      ...item,
      id: `import-${index}`,
      isSelected: true,
      isEditing: false,
    }))
  );
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState<'all' | 'flagged' | 'selected'>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(parseResult.sections)
  );

  const { data: stages = [] } = useStagesByProject(projectId);
  const confirmMutation = useConfirmBOQImport(projectId);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (search && !item.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Show filter
      if (showFilter === 'flagged' && !item.isReviewFlagged) {
        return false;
      }
      if (showFilter === 'selected' && !item.isSelected) {
        return false;
      }
      return true;
    });
  }, [items, search, showFilter]);

  // Group by section
  const groupedItems = useMemo(() => groupBySection(filteredItems), [filteredItems]);

  // Stats
  const selectedCount = items.filter((i) => i.isSelected).length;
  const flaggedCount = items.filter((i) => i.isReviewFlagged).length;
  const totalAmount = items
    .filter((i) => i.isSelected)
    .reduce((sum, i) => sum + i.quantity * i.rate, 0);

  // Handlers
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  }, []);

  const toggleAllInSection = useCallback((section: string, selected: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sectionName === section || (!item.sectionName && section === 'Other')
          ? { ...item, isSelected: selected }
          : item
      )
    );
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ParsedBOQItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, isEditing: false, isReviewFlagged: false, flagReason: undefined }
          : item
      )
    );
  }, []);

  const setItemEditing = useCallback((id: string, isEditing: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEditing } : item))
    );
  }, []);

  const handleLinkAllToStage = useCallback((stageId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.isSelected ? { ...item, stageId } : item))
    );
    toast.success('Linked selected items to stage');
  }, []);

  const handleConfirmImport = useCallback(async () => {
    const selectedItems = items.filter((i) => i.isSelected);

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to import');
      return;
    }

    try {
      const result = await confirmMutation.mutateAsync({
        items: selectedItems.map(({ id, isSelected, isEditing, ...item }) => item),
      });
      toast.success(`Imported ${result.importedCount} items`);
      onComplete();
    } catch {
      toast.error('Failed to import items');
    }
  }, [items, confirmMutation, onComplete]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="border-b bg-card rounded-t-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  Review Imported BOQ
                  <span className="text-sm font-normal text-muted-foreground">
                    {parseResult.fileName}
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI has parsed the BOQ - Review and confirm before saving
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onBack} className="cursor-pointer">
                Cancel Import
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={selectedCount === 0 || confirmMutation.isPending}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                {confirmMutation.isPending
                  ? 'Importing...'
                  : `Confirm & Add ${selectedCount} Items`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="px-4 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-card rounded border">
                <span className="text-2xl font-semibold">{parseResult.totalItems}</span>
              </div>
              <div className="text-sm">
                <div className="font-medium">Line Items</div>
                <div className="text-muted-foreground">Parsed successfully</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-card rounded border">
                <span className="text-2xl font-semibold">{parseResult.sections.length}</span>
              </div>
              <div className="text-sm">
                <div className="font-medium">Sections</div>
                <div className="text-muted-foreground">Categories found</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-card rounded border">
                <div className="flex items-center gap-2">
                  <Warning className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-semibold">{flaggedCount}</span>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Need Review</div>
                <div className="text-muted-foreground">Items flagged</div>
              </div>
              {flaggedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilter('flagged')}
                  className="ml-2 cursor-pointer"
                >
                  Review
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-card rounded border">
                <span className="text-2xl font-semibold">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="text-sm">
                <div className="font-medium">Total Amount</div>
                <div className="text-muted-foreground">Total project value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filter */}
              <Select value={showFilter} onValueChange={(v) => setShowFilter(v as typeof showFilter)}>
                <SelectTrigger className="w-32 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">Show All</SelectItem>
                  <SelectItem value="flagged" className="cursor-pointer">Flagged Only</SelectItem>
                  <SelectItem value="selected" className="cursor-pointer">Selected Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link to Stage */}
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Link All to Stage</span>
              <Select onValueChange={handleLinkAllToStage}>
                <SelectTrigger className="w-40 cursor-pointer">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id} className="cursor-pointer">
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="px-4 py-4">
          <div className="space-y-4">
            {Array.from(groupedItems.entries()).map(([section, sectionItems]) => {
              const isExpanded = expandedSections.has(section);
              const sectionTotal = sectionItems.reduce(
                (sum, i) => sum + i.quantity * i.rate,
                0
              );
              const selectedInSection = sectionItems.filter((i) => i.isSelected).length;
              const allSelected = selectedInSection === sectionItems.length;

              return (
                <Collapsible
                  key={section}
                  open={isExpanded}
                  onOpenChange={() => toggleSection(section)}
                  className="border rounded-lg bg-card"
                >
                  {/* Section Header */}
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <CaretDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <CaretRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{section}</span>
                        <span className="text-sm text-muted-foreground">
                          {sectionItems.length} items
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          Section Total: <span className="font-medium">{formatCurrency(sectionTotal)}</span>
                        </span>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(checked) =>
                            toggleAllInSection(section, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t">
                      {/* Table Header */}
                      <div className="grid grid-cols-[40px_100px_1fr_80px_80px_100px_100px_60px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
                        <div></div>
                        <div>Code</div>
                        <div>Description</div>
                        <div>Unit</div>
                        <div className="text-right">Qty</div>
                        <div className="text-right">Rate</div>
                        <div className="text-right">Amount</div>
                        <div></div>
                      </div>

                      {/* Items */}
                      <div className="divide-y">
                        {sectionItems.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            onToggleSelection={() => toggleItemSelection(item.id)}
                            onEdit={() => setItemEditing(item.id, true)}
                            onSave={(updates) => updateItem(item.id, updates)}
                            onCancel={() => setItemEditing(item.id, false)}
                          />
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card rounded-b-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Items selected: {selectedCount} of {parseResult.totalItems}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">₹ Total: {formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onBack} className="cursor-pointer">
                Cancel Import
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={selectedCount === 0 || confirmMutation.isPending}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm & Add {selectedCount} Items
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Item Row Component
// ============================================

interface ItemRowProps {
  item: ReviewItem;
  onToggleSelection: () => void;
  onEdit: () => void;
  onSave: (updates: Partial<ParsedBOQItem>) => void;
  onCancel: () => void;
}

function ItemRow({ item, onToggleSelection, onEdit, onSave, onCancel }: ItemRowProps) {
  const [editValues, setEditValues] = useState({
    description: item.description,
    unit: item.unit,
    quantity: item.quantity.toString(),
    rate: item.rate.toString(),
  });

  const amount = item.quantity * item.rate;

  if (item.isEditing) {
    return (
      <div className="grid grid-cols-[40px_100px_1fr_80px_80px_100px_100px_60px] gap-2 px-4 py-2 items-center bg-muted/30">
        <Checkbox checked={item.isSelected} disabled className="cursor-not-allowed" />
        <div className="text-sm text-muted-foreground">{item.code || '-'}</div>
        <Input
          value={editValues.description}
          onChange={(e) => setEditValues((p) => ({ ...p, description: e.target.value }))}
          className="h-8"
        />
        <Input
          value={editValues.unit}
          onChange={(e) => setEditValues((p) => ({ ...p, unit: e.target.value }))}
          className="h-8"
        />
        <Input
          type="number"
          value={editValues.quantity}
          onChange={(e) => setEditValues((p) => ({ ...p, quantity: e.target.value }))}
          className="h-8 text-right"
        />
        <Input
          type="number"
          value={editValues.rate}
          onChange={(e) => setEditValues((p) => ({ ...p, rate: e.target.value }))}
          className="h-8 text-right"
        />
        <div className="text-right text-sm font-medium">
          {formatCurrency(parseFloat(editValues.quantity || '0') * parseFloat(editValues.rate || '0'))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() =>
              onSave({
                description: editValues.description,
                unit: editValues.unit,
                quantity: parseFloat(editValues.quantity) || 0,
                rate: parseFloat(editValues.rate) || 0,
              })
            }
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-[40px_100px_1fr_80px_80px_100px_100px_60px] gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors',
        item.isReviewFlagged && 'bg-amber-50'
      )}
    >
      <Checkbox
        checked={item.isSelected}
        onCheckedChange={onToggleSelection}
        className="cursor-pointer"
      />
      <div className="text-sm text-muted-foreground">{item.code || '-'}</div>
      <div>
        <div className="font-medium">{item.description}</div>
        {item.isReviewFlagged && item.flagReason && (
          <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
            <Warning className="h-3 w-3" />
            {item.flagReason}
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">{item.unit}</div>
      <div className="text-right text-sm">{item.quantity.toLocaleString()}</div>
      <div className="text-right text-sm">₹{item.rate.toLocaleString()}</div>
      <div className="text-right text-sm font-medium">{formatCurrency(amount)}</div>
      <div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-pointer"
          onClick={onEdit}
        >
          {item.isReviewFlagged ? (
            <span className="text-xs text-amber-600">Edit</span>
          ) : (
            <PencilSimple className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
