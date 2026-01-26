/**
 * Party Transactions Panel Component
 *
 * Right panel that displays transaction details for a party.
 * Includes summary cards, tabs for payments/expenses, and a paginated table.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TablePagination } from '@/components/ui/table-pagination';
import { MoreVertical } from 'lucide-react';
import type { PartyTransaction, PartyType, PaginationMeta } from '@/lib/api/parties';

// ============================================
// Types
// ============================================

interface PartyTransactionsPanelProps {
  /** Party type (determines tab labels) */
  partyType: PartyType;
  /** Total paid amount */
  totalPaid: number;
  /** Total expenses/purchases amount */
  totalExpenses: number;
  /** Current tab */
  activeTab: 'payments' | 'expenses';
  /** Callback when tab changes */
  onTabChange: (tab: 'payments' | 'expenses') => void;
  /** List of transactions */
  transactions: PartyTransaction[];
  /** Pagination info */
  pagination: PaginationMeta;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getExpensesLabel(partyType: PartyType): string {
  switch (partyType) {
    case 'VENDOR':
      return 'Purchase';
    case 'LABOUR':
    case 'SUBCONTRACTOR':
      return 'Wages';
    default:
      return 'Expenses';
  }
}

// ============================================
// Component
// ============================================

export function PartyTransactionsPanel({
  partyType,
  totalPaid,
  totalExpenses,
  activeTab,
  onTabChange,
  transactions,
  pagination,
  onPageChange,
  isLoading = false,
}: PartyTransactionsPanelProps) {
  const expensesLabel = getExpensesLabel(partyType);
  const progressPercentage = totalExpenses > 0 ? Math.min((totalPaid / totalExpenses) * 100, 100) : 0;

  return (
    <div className="h-full flex flex-col gap-5">
      {/* Summary Cards */}
      <Card className="p-6 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-8">
          <div className="flex flex-col gap-1">
            <Typography variant="muted" className="mb-1">Paid</Typography>
            <Typography variant="h3" className="font-semibold">
              {formatCurrency(totalPaid)}
            </Typography>
          </div>

          <div className="flex flex-col gap-1 text-right">
            <Typography variant="muted" className="mb-1">{expensesLabel}</Typography>
            <Typography variant="h3" className="font-semibold">
              {formatCurrency(totalExpenses)}
            </Typography>
          </div>
        </div>
        <div className="flex-1">
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Table Container (matching PartiesTable style) */}
      <div className="rounded-lg border overflow-hidden flex flex-col">
        {/* Tabs Header (replacing search bar position) */}
        <div className="bg-card p-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => onTabChange(v as 'payments' | 'expenses')}
          >
            <TabsList className='bg-transparent'>
              <TabsTrigger value="payments" className="cursor-pointer">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="expenses" className="cursor-pointer">
                {expensesLabel}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Date
              </TableHead>
              <TableHead>
                Title
              </TableHead>
              <TableHead>
                Amount
              </TableHead>
              <TableHead className="text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Typography variant="muted">No transactions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    {transaction.title}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className='text-center'>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && pagination.total > 0 && (
          <TablePagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
            itemLabel="Transactions"
            className='border-t'
          />
        )}
      </div>
    </div>
  );
}

export default PartyTransactionsPanel;
