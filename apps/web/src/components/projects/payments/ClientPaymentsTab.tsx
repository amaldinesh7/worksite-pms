/**
 * Client Payments Tab
 *
 * Displays client payments (type = IN) for a project with:
 * - Summary cards (Budget, Received, Pending with progress)
 * - Date range filter
 * - Sort dropdown
 * - Add payment button
 * - Payments table with pagination
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Plus, DotsThree, Trash, CircleNotch, FunnelIcon, PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import {
  useProjectPaymentSummary,
  useClientPayments,
  useDeletePayment,
} from '@/lib/hooks/usePayments';
import { RecordClientPaymentModal } from './RecordClientPaymentModal';
import { DeletePaymentDialog } from './DeletePaymentDialog';
import type { Payment, PaymentSortBy, SortOrder } from '@/lib/api/payments';

// ============================================
// Types
// ============================================

interface ClientPaymentsTabProps {
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

function getPaymentModeBadgeVariant(mode: string): 'default' | 'secondary' | 'outline' {
  switch (mode) {
    case 'CASH':
      return 'default';
    case 'ONLINE':
      return 'secondary';
    case 'CHEQUE':
      return 'outline';
    default:
      return 'default';
  }
}

function getPaymentModeLabel(mode: string): string {
  switch (mode) {
    case 'CASH':
      return 'Cash';
    case 'ONLINE':
      return 'Online';
    case 'CHEQUE':
      return 'Cheque';
    default:
      return mode;
  }
}

// ============================================
// Component
// ============================================

export function ClientPaymentsTab({ projectId }: ClientPaymentsTabProps) {
  // State
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<PaymentSortBy>('paymentDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Data fetching
  const { data: summary, isLoading: isSummaryLoading } = useProjectPaymentSummary(projectId);
  const { data: paymentsData, isLoading, isFetching } = useClientPayments(projectId, {
    page,
    limit: PAGINATION_LIMIT,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    sortBy,
    sortOrder,
  });

  // Mutations
  const deleteMutation = useDeletePayment();

  // Handlers
  const handleAddPayment = useCallback(() => {
    setEditingPayment(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEditPayment = useCallback((payment: Payment) => {
    setEditingPayment(payment);
    setIsAddModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!paymentToDelete) return;

    try {
      await deleteMutation.mutateAsync(paymentToDelete.id);
      toast.success('Payment deleted successfully');
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch {
      toast.error('Failed to delete payment');
    }
  }, [paymentToDelete, deleteMutation]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDateRangeUpdate = useCallback(
    (values: { range: DateRange; compareRange?: DateRange }) => {
      setDateRange(values.range);
      setPage(1);
    },
    []
  );

  const handleClearDateRange = useCallback(() => {
    setDateRange(undefined);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split('-') as [PaymentSortBy, SortOrder];
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  // Derived state
  const payments = paymentsData?.items ?? [];
  const pagination = paymentsData?.pagination ?? {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  // Calculate percentages for display
  const receivedPercentage = summary?.receivedPercentage ?? 0;
  const pendingPercentage = 100 - receivedPercentage;

  return (
    <div className="space-y-6">
      {/* Summary Card - Redesigned to match reference */}
      <div className="rounded-lg border bg-card p-5">
        {isSummaryLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-2 w-full bg-muted animate-pulse rounded" />
            <div className="flex gap-4">
              <div className="h-20 flex-1 bg-muted animate-pulse rounded" />
              <div className="h-20 flex-1 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ) : (
          <>
            {/* Header: Total Project Budget */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Total Project Budget</p>
              <p className="text-2xl font-semibold">{formatCurrency(summary?.projectBudget ?? 0)}</p>
            </div>

            {/* Progress bar with percentage labels */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-muted-foreground">
                  {Math.round(receivedPercentage)}% Received
                </span>
                <span className="text-muted-foreground">
                  {Math.round(pendingPercentage)}% Pending
                </span>
              </div>
              <Progress value={receivedPercentage} className="h-2" />
            </div>

            {/* Sub-cards: Payment received and Pending */}
            <div className="flex gap-4">
              {/* Payment Received */}
              <div className="flex-1 rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Payment received</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(summary?.totalReceived ?? 0)}</p>
              </div>

              {/* Pending */}
              <div className="flex-1 rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className={`text-lg font-semibold ${(summary?.totalPending ?? 0) > 0 ? 'text-amber-600' : ''}`}>{formatCurrency(summary?.totalPending ?? 0)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
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
              <SelectItem value="paymentDate-desc" className="cursor-pointer">
                Date (Newest)
              </SelectItem>
              <SelectItem value="paymentDate-asc" className="cursor-pointer">
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

        {/* Add Payment Button */}
        <Button onClick={handleAddPayment} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="animate-pulse">
            <div className="h-11 bg-muted border-b" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 border-b last:border-0 flex items-center px-4 gap-4">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : payments.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FunnelIcon className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No payments found</EmptyTitle>
            <EmptyDescription>
              {dateRange?.from
                ? 'No payments match the selected date range'
                : 'Get started by recording your first client payment'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleAddPayment} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="relative rounded-lg border overflow-hidden bg-card">
          {/* Loading overlay for refetch */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
              <CircleNotch className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DATE</TableHead>
                <TableHead className="text-right">AMOUNT</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>PAYMENT MODE</TableHead>
                <TableHead>REFERENCE</TableHead>
                <TableHead>RECORDED BY</TableHead>
                <TableHead className="w-12">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm">
                    {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(Number(payment.amount))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {payment.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentModeBadgeVariant(payment.paymentMode)}>
                      {getPaymentModeLabel(payment.paymentMode)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{payment.referenceNumber || '-'}</TableCell>
                  <TableCell className="text-sm">
                    {payment.recordedBy?.user?.name || '-'}
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
                          onClick={() => handleEditPayment(payment)}
                          className="cursor-pointer"
                        >
                          <PencilSimple className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(payment)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.total > 0 && (
            <TablePagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              limit={PAGINATION_LIMIT}
              onPageChange={handlePageChange}
              itemLabel="payments"
              className="border-t"
            />
          )}
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      <RecordClientPaymentModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingPayment(null);
        }}
        projectId={projectId}
        payment={editingPayment}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePaymentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        payment={paymentToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
