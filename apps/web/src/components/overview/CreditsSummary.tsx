/**
 * Credits Summary Component
 * Displays outstanding balances by party type with progress bars
 */

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Store, Users, Hammer, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CreditsSummary as CreditsSummaryType, OutstandingItem } from '@/lib/api/overview';

interface CreditsSummaryProps {
  credits: CreditsSummaryType;
  outstandingPayables: OutstandingItem[];
  outstandingReceivables: OutstandingItem[];
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getPartyTypeIcon(type: string) {
  switch (type) {
    case 'VENDOR':
      return <Store className="h-4 w-4" />;
    case 'LABOUR':
      return <Users className="h-4 w-4" />;
    case 'SUBCONTRACTOR':
      return <Hammer className="h-4 w-4" />;
    default:
      return <Store className="h-4 w-4" />;
  }
}

export function CreditsSummary({
  credits,
  outstandingPayables,
  outstandingReceivables,
  isLoading,
}: CreditsSummaryProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Credits Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = credits.total;
  const maxBalance = Math.max(
    credits.vendors.balance,
    credits.labours.balance,
    credits.subcontractors.balance
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Credits Hub Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Credits Hub</CardTitle>
            <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreditRow
            icon={<Store className="h-4 w-4" />}
            label="Vendors"
            count={credits.vendors.count}
            balance={credits.vendors.balance}
            maxBalance={maxBalance}
            color="bg-teal-500"
          />
          <CreditRow
            icon={<Users className="h-4 w-4" />}
            label="Labour"
            count={credits.labours.count}
            balance={credits.labours.balance}
            maxBalance={maxBalance}
            color="bg-amber-500"
          />
          <CreditRow
            icon={<Hammer className="h-4 w-4" />}
            label="Subcontractors"
            count={credits.subcontractors.count}
            balance={credits.subcontractors.balance}
            maxBalance={maxBalance}
            color="bg-purple-500"
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate('/parties')}
          >
            View All Parties
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Outstanding Tables */}
      <div className="space-y-4">
        {/* Outstanding Payables */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Payables
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {outstandingPayables.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No outstanding payables</p>
            ) : (
              <div className="space-y-2">
                {outstandingPayables.slice(0, 4).map((item) => (
                  <OutstandingRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Receivables */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Receivables
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {outstandingReceivables.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No outstanding receivables</p>
            ) : (
              <div className="space-y-2">
                {outstandingReceivables.slice(0, 4).map((item) => (
                  <OutstandingRow key={item.id} item={item} isReceivable />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface CreditRowProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  balance: number;
  maxBalance: number;
  color: string;
}

function CreditRow({ icon, label, count, balance, maxBalance, color }: CreditRowProps) {
  const percent = maxBalance > 0 ? (balance / maxBalance) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
        </div>
        <span className="font-semibold tabular-nums">{formatCurrency(balance)}</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface OutstandingRowProps {
  item: OutstandingItem;
  isReceivable?: boolean;
}

function OutstandingRow({ item, isReceivable }: OutstandingRowProps) {
  const navigate = useNavigate();
  const isOverdue = item.ageDays > 30;

  return (
    <div
      className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => navigate(isReceivable ? `/projects/${item.id}` : `/parties`)}
    >
      <div className="flex items-center gap-2 min-w-0">
        {!isReceivable && (
          <span className="text-muted-foreground">{getPartyTypeIcon(item.type)}</span>
        )}
        <span className="text-sm font-medium truncate">{item.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold tabular-nums text-sm">{formatCurrency(item.amount)}</span>
        {isOverdue && (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <Clock className="h-3 w-3" />
            {item.ageDays}d
          </span>
        )}
      </div>
    </div>
  );
}
