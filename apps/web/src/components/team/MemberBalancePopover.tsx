/**
 * Member Balance Popover
 *
 * Shows a popover with the breakdown of a team member's balance across projects.
 * Clicking on a project navigates to the project's team member payments tab
 * with the member filter pre-selected.
 */

import { useNavigate } from 'react-router-dom';
import { CaretRightIcon, CircleNotch, Wallet } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMemberBalancesAcrossProjects } from '@/lib/hooks/useMemberAdvances';

// ============================================
// Types
// ============================================

interface MemberBalancePopoverProps {
  memberId: string;
  totalBalance: number;
}

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================
// Component
// ============================================

export function MemberBalancePopover({ memberId, totalBalance }: MemberBalancePopoverProps) {
  const navigate = useNavigate();
  const { data: balances, isLoading } = useMemberBalancesAcrossProjects(memberId);

  const handleProjectClick = (projectId: string) => {
    // Navigate to project payments tab with team sub-tab and member filter
    navigate(`/projects/${projectId}?tab=payments&paymentTab=team&memberId=${memberId}`);
  };

  // Don't show popover trigger if no balance
  if (totalBalance === 0) {
    return (
      <span className="text-muted-foreground">
        {formatCurrency(0)}
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 font-medium text-primary hover:text-primary/80 hover:bg-primary/10 cursor-pointer"
        >
          {formatCurrency(totalBalance)}
          <CaretRightIcon className="ml-1 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Balance by Project</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <CircleNotch className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !balances || balances.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No project balances found
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {balances.map((balance) => (
              <button
                key={balance.projectId}
                onClick={() => handleProjectClick(balance.projectId)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0"
              >
                <span className="text-sm truncate mr-2">{balance.projectName}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(balance.balance)}
                  </span>
                  <CaretRightIcon className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Balance</span>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
