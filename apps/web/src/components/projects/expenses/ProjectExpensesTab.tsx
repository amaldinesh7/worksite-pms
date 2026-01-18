/**
 * Project Expenses Tab
 *
 * Displays expenses for a project with:
 * - Expense type filter (clearable)
 * - Date range filter (clearable)
 * - Sort dropdown (backend sorting)
 * - Add expense button
 * - Expenses table with pagination and loading states
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Plus, DotsThree, PencilSimple, Trash, Eye, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { DateRangePicker } from '@/components/ui/custom/date-range-picker';
import { useExpenses, useDeleteExpense } from '@/lib/hooks/useExpenses';
import { useCategoryItems } from '@/lib/hooks/useCategories';
import { AddExpenseModal } from './AddExpenseModal';
import type { Expense, ExpenseStatus, ExpenseSortBy, ExpenseSortOrder } from '@/lib/api/expenses';

// ============================================
// Types
// ============================================

interface ProjectExpensesTabProps {
  projectId: string;
}

// ============================================
// Constants
// ============================================

const PAGINATION_LIMIT = 10;

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getStatusBadgeVariant(status: ExpenseStatus): 'default' | 'secondary' {
  return status === 'APPROVED' ? 'default' : 'secondary';
}

function getStatusLabel(status: ExpenseStatus): string {
  return status === 'APPROVED' ? 'Approved' : 'Pending';
}

// ============================================
// Component
// ============================================

export function ProjectExpensesTab({ projectId }: ProjectExpensesTabProps) {
  // State
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ExpenseSortBy>('expenseDate');
  const [sortOrder, setSortOrder] = useState<ExpenseSortOrder>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<string | undefined>(undefined);

  // Fetch expense types for filter dropdown
  const { data: expenseTypes = [] } = useCategoryItems('expense_type');

  // Data fetching with isFetching for loading overlay
  const { data: expensesData, isLoading, isFetching } = useExpenses({
    projectId,
    page,
    limit: PAGINATION_LIMIT,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    expenseTypeItemId: expenseTypeFilter,
    sortBy,
    sortOrder,
  });

  // Mutations
  const deleteMutation = useDeleteExpense();

  // Handlers
  const handleAddExpense = useCallback(() => {
    setSelectedExpense(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEditExpense = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setIsAddModalOpen(true);
  }, []);

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    try {
      await deleteMutation.mutateAsync(expense.id);
      toast.success('Expense deleted successfully');
    } catch {
      toast.error('Failed to delete expense');
    }
  }, [deleteMutation]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDateRangeUpdate = useCallback(
    (values: { range: DateRange; compareRange?: DateRange }) => {
      setDateRange(values.range);
      setPage(1); // Reset to first page when filter changes
    },
    []
  );

  const handleExpenseTypeChange = useCallback((value: string) => {
    setExpenseTypeFilter(value || undefined);
    setPage(1); // Reset to first page when filter changes
  }, []);

  const handleClearExpenseTypeFilter = useCallback(() => {
    setExpenseTypeFilter(undefined);
    setPage(1);
  }, []);

  const handleClearDateRange = useCallback(() => {
    setDateRange(undefined);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    // Value format: "field-order" e.g., "expenseDate-desc" or "amount-asc"
    const [field, order] = value.split('-') as [ExpenseSortBy, ExpenseSortOrder];
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  // Derived state
  const expenses = expensesData?.items ?? [];
  const pagination = expensesData?.pagination ?? {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  // Get selected expense type name for display
  const selectedExpenseTypeName = expenseTypes.find((t) => t.id === expenseTypeFilter)?.name;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Expense Type Filter */}
        <Select value={expenseTypeFilter || ''} onValueChange={handleExpenseTypeChange}>
          <SelectTrigger
            className="w-[160px] cursor-pointer"
            isClearable
            hasValue={!!expenseTypeFilter}
            onClear={handleClearExpenseTypeFilter}
          >
            <SelectValue placeholder="Expense type" />
          </SelectTrigger>
          <SelectContent>
            {expenseTypes.map((type) => (
              <SelectItem key={type.id} value={type.id} className="cursor-pointer">
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <DateRangePicker
          onUpdate={handleDateRangeUpdate}
          initialDateFrom={dateRange?.from}
          initialDateTo={dateRange?.to}
          align="start"
          showCompare={false}
          isClearable
          onClear={handleClearDateRange}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expenseDate-desc" className="cursor-pointer">
                Date (Newest)
              </SelectItem>
              <SelectItem value="expenseDate-asc" className="cursor-pointer">
                Date (Oldest)
              </SelectItem>
              <SelectItem value="amount-desc" className="cursor-pointer">
                Amount (High-Low)
              </SelectItem>
              <SelectItem value="amount-asc" className="cursor-pointer">
                Amount (Low-High)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Expense Button */}
        <Button onClick={handleAddExpense} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add expense
        </Button>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="animate-pulse">
            <div className="h-11 bg-muted border-b" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 border-b last:border-0 flex items-center px-4 gap-4">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-4 w-8 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Funnel className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No expenses found</EmptyTitle>
            <EmptyDescription>
              {expenseTypeFilter || dateRange?.from
                ? `No expenses match the selected filters${selectedExpenseTypeName ? ` (${selectedExpenseTypeName})` : ''}`
                : 'Get started by adding your first expense'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleAddExpense} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="relative rounded-lg border overflow-hidden bg-white">
          {/* Loading overlay for refetch */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <CircleNotch className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DATE</TableHead>
                <TableHead>EXPENSE TYPE</TableHead>
                <TableHead className="text-right">AMOUNT</TableHead>
                <TableHead className="text-right">PAID</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="w-12">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => {
                const totalAmount = expense.rate * expense.quantity;
                const expenseTypeName = expense.expenseType?.name ?? 'Unknown';
                const paidAmount = expense.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm">
                      {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {expenseTypeName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totalAmount)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(paidAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(expense.status)}>
                        {getStatusLabel(expense.status)}
                      </Badge>
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
                            onClick={() => handleEditExpense(expense)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditExpense(expense)}
                            className="cursor-pointer"
                          >
                            <PencilSimple className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteExpense(expense)}
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

          {/* Pagination inside table container */}
          {pagination.total > 0 && (
            <TablePagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              limit={PAGINATION_LIMIT}
              onPageChange={handlePageChange}
              itemLabel="expenses"
              className="border-t"
            />
          )}
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <AddExpenseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        projectId={projectId}
        expense={selectedExpense}
      />
    </div>
  );
}
