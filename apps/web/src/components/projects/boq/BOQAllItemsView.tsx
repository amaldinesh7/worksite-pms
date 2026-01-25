/**
 * BOQ All Items View
 *
 * Flat table view of all BOQ items with search, filter, and sort.
 */

import { useState, useCallback } from 'react';
import { Plus, DotsThree, PencilSimple, Trash, MagnifyingGlass, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { TablePagination } from '@/components/ui/table-pagination';
import { useBOQItems, useDeleteBOQItem } from '@/lib/hooks/useBOQ';
import { BOQItemFormDialog } from './BOQItemFormDialog';
import type { BOQItem, BOQCategory, BOQListParams } from '@/lib/api/boq';

// ============================================
// Types
// ============================================

interface BOQAllItemsViewProps {
  projectId: string;
  onAddItem: () => void;
}

// ============================================
// Constants
// ============================================

const PAGINATION_LIMIT = 10;

const CATEGORY_LABELS: Record<BOQCategory, string> = {
  MATERIAL: 'Material',
  LABOUR: 'Labour',
  SUB_WORK: 'Sub Work',
  EQUIPMENT: 'Equipment',
  OTHER: 'Other',
};

const CATEGORY_COLORS: Record<BOQCategory, string> = {
  MATERIAL: 'bg-blue-100 text-blue-700',
  LABOUR: 'bg-amber-100 text-amber-700',
  SUB_WORK: 'bg-purple-100 text-purple-700',
  EQUIPMENT: 'bg-green-100 text-green-700',
  OTHER: 'bg-gray-100 text-gray-700',
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
// Component
// ============================================

export function BOQAllItemsView({ projectId, onAddItem }: BOQAllItemsViewProps) {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BOQCategory | undefined>(undefined);
  const [sortBy, setSortBy] = useState<BOQListParams['sortBy']>('createdAt');
  const [sortOrder, setSortOrder] = useState<BOQListParams['sortOrder']>('desc');
  const [editingItem, setEditingItem] = useState<BOQItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Data fetching
  const { data, isLoading, isFetching } = useBOQItems(projectId, {
    page,
    limit: PAGINATION_LIMIT,
    search: search || undefined,
    category: categoryFilter,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteBOQItem(projectId);

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value as BOQCategory || undefined);
    setPage(1);
  }, []);

  const handleClearCategoryFilter = useCallback(() => {
    setCategoryFilter(undefined);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split('-') as [BOQListParams['sortBy'], BOQListParams['sortOrder']];
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  const handleEdit = useCallback((item: BOQItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(async (item: BOQItem) => {
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    }
  }, [deleteMutation]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  // Derived data
  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: PAGINATION_LIMIT, total: 0, pages: 0, hasMore: false };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budget items..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter || ''} onValueChange={handleCategoryChange}>
          <SelectTrigger
            className="w-[160px] cursor-pointer"
            isClearable
            hasValue={!!categoryFilter}
            onClear={handleClearCategoryFilter}
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value} className="cursor-pointer">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc" className="cursor-pointer">Newest First</SelectItem>
              <SelectItem value="createdAt-asc" className="cursor-pointer">Oldest First</SelectItem>
              <SelectItem value="amount-desc" className="cursor-pointer">Amount (High-Low)</SelectItem>
              <SelectItem value="amount-asc" className="cursor-pointer">Amount (Low-High)</SelectItem>
              <SelectItem value="description-asc" className="cursor-pointer">Description (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}
        <Button onClick={onAddItem} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget Item
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="animate-pulse">
            <div className="h-11 bg-muted border-b" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 border-b last:border-0 flex items-center px-4 gap-4">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlass className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No budget items found</EmptyTitle>
            <EmptyDescription>
              {search || categoryFilter
                ? 'No items match your filters. Try adjusting your search.'
                : 'Get started by adding your first budget item or importing a BOQ.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={onAddItem} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Budget Item
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="relative rounded-lg border overflow-hidden bg-card">
          {/* Loading overlay */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
              <CircleNotch className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">CATEGORY</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead className="w-16">UNIT</TableHead>
                <TableHead className="w-16 text-right">QTY</TableHead>
                <TableHead className="w-20 text-right">RATE</TableHead>
                <TableHead className="w-28 text-right">QUOTED TOTAL</TableHead>
                <TableHead className="w-24 text-right">ACTUAL</TableHead>
                <TableHead className="w-24 text-right">VARIANCE</TableHead>
                <TableHead className="w-12">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const quotedTotal = item.quantity * item.rate;
                const actualTotal = item.expenseLinks.reduce((sum, link) => {
                  return sum + link.expense.rate * link.expense.quantity;
                }, 0);
                const variance = quotedTotal - actualTotal;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="secondary" className={CATEGORY_COLORS[item.category]}>
                        {CATEGORY_LABELS[item.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.description}</span>
                        {item.code && (
                          <span className="text-xs text-muted-foreground">{item.code}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{item.rate.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(quotedTotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(actualTotal)}</TableCell>
                    <TableCell className={`text-right ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatVariance(variance)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <DotsThree className="h-4 w-4" weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(item)}
                            className="cursor-pointer"
                          >
                            <PencilSimple className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.total > 0 && (
            <TablePagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              limit={PAGINATION_LIMIT}
              onPageChange={setPage}
              itemLabel="items"
              className="border-t"
            />
          )}
        </div>
      )}

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
