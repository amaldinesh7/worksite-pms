/**
 * BOQ Summary Cards
 *
 * Displays 4 summary cards: Total Quoted, Actual Spent, Variance, Projected Margin
 */

import { Receipt, CurrencyDollar, TrendUp, ChartPie } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { BOQStats } from '@/lib/api/boq';

// ============================================
// Types
// ============================================

interface BOQSummaryCardsProps {
  stats: BOQStats | undefined;
  isLoading: boolean;
}

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  return `${Math.abs(value).toFixed(0)}%`;
}

// ============================================
// Component
// ============================================

export function BOQSummaryCards({ stats, isLoading }: BOQSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-1" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const totalQuoted = stats?.totalQuoted ?? 0;
  const totalActual = stats?.totalActual ?? 0;
  const variance = stats?.variance ?? 0;
  const budgetUsage = stats?.budgetUsage ?? 0;
  const itemCount = stats?.itemCount ?? 0;

  // Calculate projected margin based on current spend rate
  const projectedMargin = totalQuoted > 0 ? ((totalQuoted - totalActual) / totalQuoted) * 100 : 0;
  const isHealthy = projectedMargin >= 20;

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Total Quoted */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Receipt className="h-4 w-4" />
          <span>Total Quoted</span>
        </div>
        <div className="text-2xl font-semibold numeric">{formatCurrency(totalQuoted)}</div>
        <div className="text-xs text-muted-foreground numeric">{itemCount} line items</div>
      </div>

      {/* Actual Spent */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CurrencyDollar className="h-4 w-4" />
          <span>Actual Spent</span>
        </div>
        <div className="text-2xl font-semibold numeric">{formatCurrency(totalActual)}</div>
        <div className="text-xs text-muted-foreground numeric">
          {formatPercent(budgetUsage)} of budget
        </div>
      </div>

      {/* Variance */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <TrendUp className="h-4 w-4" />
          <span>Variance</span>
        </div>
        <div className={cn(
          'text-2xl font-semibold numeric',
          variance >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
        </div>
        <div className="text-xs text-muted-foreground numeric">
          {100 - budgetUsage > 0 ? `${(100 - budgetUsage).toFixed(0)}% remaining` : 'Over budget'}
        </div>
      </div>

      {/* Projected Margin */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <ChartPie className="h-4 w-4" />
          <span>Projected Margin</span>
        </div>
        <div className="text-2xl font-semibold numeric">{formatPercent(projectedMargin)}</div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            isHealthy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          )}>
            {isHealthy ? 'Healthy' : 'At Risk'}
          </span>
          <span className="text-xs text-muted-foreground">Based on current spend</span>
        </div>
      </div>
    </div>
  );
}
