/**
 * Project Expenses Tab
 *
 * Displays expenses for a project with:
 * - Search input
 * - Filters button
 * - Sort dropdown
 * - Add expense button
 * - Expenses table with pagination
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { MagnifyingGlass, FunnelSimple, Plus, DotsThree, PencilSimple, Trash, Eye } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useExpenses, useDeleteExpense } from '@/lib/hooks/useExpenses';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { AddExpenseModal } from './AddExpenseModal';
import type { Expense, ExpenseStatus } from '@/lib/api/expenses';

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
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'expenseDate' | 'amount'>('expenseDate');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchInput, 300);

  // Data fetching
  const { data: expensesData, isLoading } = useExpenses({
    projectId,
    page,
    limit: PAGINATION_LIMIT,
    search: debouncedSearch || undefined,
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

  // Derived state
  const expenses = expensesData?.items ?? [];
  const pagination = expensesData?.pagination ?? {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expense..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters Button */}
        <Button variant="outline" className="cursor-pointer">
          <FunnelSimple className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px] cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expenseDate" className="cursor-pointer">
                Last created
              </SelectItem>
              <SelectItem value="amount" className="cursor-pointer">
                Amount
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
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlass className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No expenses found</EmptyTitle>
            <EmptyDescription>
              {debouncedSearch
                ? `No expenses match "${debouncedSearch}"`
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
        <div className="rounded-lg border overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>CATEGORY</TableHead>
                <TableHead>VENDOR</TableHead>
                <TableHead className="text-right">AMOUNT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="w-12">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => {
                const totalAmount = expense.rate * expense.quantity;
                const categoryName = expense.expenseCategory?.name ?? 'Unknown';
                const partyName = expense.party?.name ?? 'Unknown';
                return (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {expense.description || categoryName}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {expense.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {categoryName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {partyName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totalAmount)}
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
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <TablePagination
          page={page}
          pages={pagination.pages}
          total={pagination.total}
          limit={PAGINATION_LIMIT}
          onPageChange={handlePageChange}
          itemLabel="expenses"
        />
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
