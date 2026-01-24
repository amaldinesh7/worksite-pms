/**
 * Team Member Payments Tab
 *
 * Displays team member advances for a project with:
 * - Member selector dropdown
 * - Right sidebar with selected member's summary (Advance Given, Expenses Logged, Balance)
 * - Advances table with pagination
 * - Give Cash Advance button
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, DotsThree, Trash, CircleNotch, FunnelIcon, User, PencilSimple } from '@phosphor-icons/react';
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
import {
  useMemberAdvances,
  useMemberAdvanceSummary,
  useProjectMembers,
  useDeleteMemberAdvance,
} from '@/lib/hooks/useMemberAdvances';
import { GiveCashAdvanceModal } from './GiveCashAdvanceModal';
import { DeleteAdvanceDialog } from './DeleteAdvanceDialog';
import type { MemberAdvance, MemberAdvanceSortBy, SortOrder } from '@/lib/api/member-advances';

// ============================================
// Types
// ============================================

interface TeamMemberPaymentsTabProps {
  projectId: string;
  /** Initial member ID from URL for pre-selecting a member */
  initialMemberId?: string;
  /** Callback when member selection changes */
  onMemberIdChange?: (memberId: string | undefined) => void;
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

export function TeamMemberPaymentsTab({
  projectId,
  initialMemberId,
  onMemberIdChange,
}: TeamMemberPaymentsTabProps) {
  // State
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<MemberAdvanceSortBy>('advanceDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMemberId || '');
  const [editingAdvance, setEditingAdvance] = useState<MemberAdvance | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<MemberAdvance | null>(null);

  // Fetch project members for dropdown
  const { data: projectMembers = [] } = useProjectMembers(projectId);

  // Fetch member advance summary for selected member
  const { data: memberSummary, isLoading: isSummaryLoading } = useMemberAdvanceSummary(
    projectId,
    selectedMemberId
  );

  // Fetch advances with optional member filter
  const { data: advancesData, isLoading, isFetching } = useMemberAdvances({
    projectId,
    memberId: selectedMemberId || undefined,
    page,
    limit: PAGINATION_LIMIT,
    sortBy,
    sortOrder,
  });

  // Mutations
  const deleteMutation = useDeleteMemberAdvance();

  // Handlers
  const handleAddAdvance = useCallback(() => {
    setEditingAdvance(null);
    setIsAddModalOpen(true);
  }, []);

  const handleEditAdvance = useCallback((advance: MemberAdvance) => {
    setEditingAdvance(advance);
    setIsAddModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((advance: MemberAdvance) => {
    setAdvanceToDelete(advance);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!advanceToDelete) return;

    try {
      await deleteMutation.mutateAsync(advanceToDelete.id);
      toast.success('Advance deleted successfully');
      setDeleteDialogOpen(false);
      setAdvanceToDelete(null);
    } catch {
      toast.error('Failed to delete advance');
    }
  }, [advanceToDelete, deleteMutation]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleMemberChange = useCallback((value: string) => {
    const newValue = value || '';
    setSelectedMemberId(newValue);
    setPage(1);
    onMemberIdChange?.(newValue || undefined);
  }, [onMemberIdChange]);

  const handleClearMemberFilter = useCallback(() => {
    setSelectedMemberId('');
    setPage(1);
    onMemberIdChange?.(undefined);
  }, [onMemberIdChange]);

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split('-') as [MemberAdvanceSortBy, SortOrder];
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  // Derived state
  const advances = advancesData?.items ?? [];
  const pagination = advancesData?.pagination ?? {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          {/* Member Filter */}
          <Select value={selectedMemberId} onValueChange={handleMemberChange}>
            <SelectTrigger
              className="w-[200px] cursor-pointer"
              isClearable
              hasValue={!!selectedMemberId}
              onClear={handleClearMemberFilter}
            >
              <SelectValue placeholder="All team members" />
            </SelectTrigger>
            <SelectContent>
              {projectMembers.map((member) => (
                <SelectItem key={member.id} value={member.id} className="cursor-pointer">
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                <SelectItem value="advanceDate-desc" className="cursor-pointer">
                  Date (Newest)
                </SelectItem>
                <SelectItem value="advanceDate-asc" className="cursor-pointer">
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

          {/* Give Cash Advance Button */}
          <Button onClick={handleAddAdvance} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Give Cash Advance
          </Button>
        </div>

        {/* Advances Table */}
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
                </div>
              ))}
            </div>
          </div>
        ) : advances.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FunnelIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No advances found</EmptyTitle>
              <EmptyDescription>
                {selectedMemberId
                  ? 'No advances for the selected team member'
                  : 'Get started by giving your first cash advance'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleAddAdvance} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Give Cash Advance
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
            <div className="flex gap-4">
          <div className="relative rounded-lg border overflow-hidden bg-card flex-1">
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
                  <TableHead>MEMBER</TableHead>
                  <TableHead>PURPOSE</TableHead>
                  <TableHead>PAYMENT MODE</TableHead>
                  <TableHead className="w-12">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((advance) => (
                  <TableRow key={advance.id}>
                    <TableCell className="text-sm">
                      {format(new Date(advance.advanceDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(Number(advance.amount))}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {advance.member?.user?.name || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {advance.purpose}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentModeBadgeVariant(advance.paymentMode)}>
                        {getPaymentModeLabel(advance.paymentMode)}
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
                            onClick={() => handleEditAdvance(advance)}
                            className="cursor-pointer"
                          >
                            <PencilSimple className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(advance)}
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
                itemLabel="advances"
                className="border-t"
              />
            )}
          </div>
          {/* Right Sidebar - Member Summary */}
      {selectedMemberId && (
        <div className="w-64 shrink-0">
          <div className="rounded-lg border bg-card p-4 space-y-4 sticky top-4">
            {/* Member Info */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{memberSummary?.memberName || 'Loading...'}</p>
                <p className="text-sm text-muted-foreground">{memberSummary?.memberRole || ''}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {/* Advance Given */}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Advance Given</span>
                {isSummaryLoading ? (
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <span className="font-medium text-red-600">
                    {formatCurrency(memberSummary?.totalAdvanceGiven ?? 0)}
                  </span>
                )}
              </div>

              {/* Expenses Logged */}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expenses Logged</span>
                {isSummaryLoading ? (
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <span className="font-medium text-red-600">
                    {formatCurrency(memberSummary?.expensesLogged ?? 0)}
                  </span>
                )}
              </div>

              <div className="border-t pt-3">
                {/* Balance */}
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Balance</span>
                  {isSummaryLoading ? (
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(memberSummary?.balance ?? 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        )}
      </div>

      

      {/* Give/Edit Cash Advance Modal */}
      <GiveCashAdvanceModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingAdvance(null);
        }}
        projectId={projectId}
        preselectedMemberId={selectedMemberId}
        advance={editingAdvance}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAdvanceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        advance={advanceToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
