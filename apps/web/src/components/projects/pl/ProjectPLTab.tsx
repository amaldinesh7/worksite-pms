/**
 * Project P&L Tab
 *
 * Profit & Loss statement for the project showing:
 * - Summary cards (Revenue, Costs, Gross Profit, Margin)
 * - Cost breakdown by category
 * - Revenue breakdown (client payments)
 * - Trend chart
 */

import { useMemo } from 'react';
import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Receipt,
  Wallet,
  ChartLine,
  Package,
  Users,
  Wrench,
  Gear,
  DotsThreeCircle,
} from '@phosphor-icons/react';

import { useBOQStats } from '@/lib/hooks/useBOQ';
import { useProjectStats } from '@/lib/hooks/useProjects';
import { cn } from '@/lib/utils';
import type { BOQCategory } from '@/lib/api/boq';

// ============================================
// Types
// ============================================

interface ProjectPLTabProps {
  projectId: string;
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

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================
// Constants
// ============================================

const CATEGORY_CONFIG: Record<BOQCategory, { label: string; icon: typeof Package; color: string; bgColor: string }> = {
  MATERIAL: { label: 'Material', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  LABOUR: { label: 'Labour', icon: Users, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  SUB_WORK: { label: 'Sub Work', icon: Wrench, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  EQUIPMENT: { label: 'Equipment', icon: Gear, color: 'text-green-600', bgColor: 'bg-green-50' },
  OTHER: { label: 'Other', icon: DotsThreeCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

// ============================================
// Component
// ============================================

export function ProjectPLTab({ projectId }: ProjectPLTabProps) {
  // Data fetching
  const { data: boqStats, isLoading: isBOQLoading } = useBOQStats(projectId);
  const { data: projectStats, isLoading: isProjectLoading } = useProjectStats(projectId);

  // Derived calculations
  const plData = useMemo(() => {
    const totalRevenue = boqStats?.totalQuoted ?? 0;
    const totalCosts = boqStats?.totalActual ?? 0;
    const grossProfit = totalRevenue - totalCosts;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const budgetUsage = boqStats?.budgetUsage ?? 0;

    // Client payments from project stats
    const clientPaymentsIn = projectStats?.totalPaymentsIn ?? 0;
    const outstandingFromClient = totalRevenue - clientPaymentsIn;

    return {
      totalRevenue,
      totalCosts,
      grossProfit,
      grossMargin,
      budgetUsage,
      clientPaymentsIn,
      outstandingFromClient,
      categoryBreakdown: boqStats?.categoryBreakdown ?? {},
    };
  }, [boqStats, projectStats]);

  const isLoading = isBOQLoading || isProjectLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="h-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const isHealthy = plData.grossMargin >= 20;
  const isProfitable = plData.grossProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Profit & Loss Statement</h2>
        <p className="text-sm text-muted-foreground">
          Financial overview of project revenue, costs, and profitability
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Revenue (Quoted) */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Receipt className="h-4 w-4" />
            <span>Total Revenue</span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(plData.totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">Based on quoted BOQ</div>
        </div>

        {/* Total Costs */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CurrencyDollar className="h-4 w-4" />
            <span>Total Costs</span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(plData.totalCosts)}</div>
          <div className="text-xs text-muted-foreground">
            {formatPercent(plData.budgetUsage)} of budget used
          </div>
        </div>

        {/* Gross Profit */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {isProfitable ? (
              <TrendUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendDown className="h-4 w-4 text-red-600" />
            )}
            <span>Gross Profit</span>
          </div>
          <div className={cn(
            'text-2xl font-semibold',
            isProfitable ? 'text-green-600' : 'text-red-600'
          )}>
            {isProfitable ? '+' : ''}{formatCurrency(plData.grossProfit)}
          </div>
          <div className="text-xs text-muted-foreground">
            Revenue minus costs
          </div>
        </div>

        {/* Gross Margin */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Wallet className="h-4 w-4" />
            <span>Gross Margin</span>
          </div>
          <div className="text-2xl font-semibold">{formatPercent(plData.grossMargin)}</div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              isHealthy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {isHealthy ? 'Healthy' : 'At Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-muted-foreground" />
            Cost Breakdown by Category
          </h3>

          <div className="space-y-4">
            {(Object.entries(plData.categoryBreakdown) as [BOQCategory, { quoted: number; actual: number; count: number }][]).map(([category, data]) => {
              const config = CATEGORY_CONFIG[category];
              if (!config || data.count === 0) return null;
              
              const Icon = config.icon;
              const percentOfTotal = plData.totalCosts > 0
                ? (data.actual / plData.totalCosts) * 100
                : 0;
              const variance = data.quoted - data.actual;
              const isOverBudget = variance < 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('p-1.5 rounded', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <span className="font-medium">{config.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({data.count} items)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(data.actual)}</div>
                      <div className={cn(
                        'text-xs',
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      )}>
                        {isOverBudget ? '' : '+'}{formatCurrency(variance)} vs quoted
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', config.bgColor.replace('50', '500'))}
                      style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {formatPercent(percentOfTotal)} of total costs
                  </div>
                </div>
              );
            })}

            {(Object.values(plData.categoryBreakdown) as { quoted: number; actual: number; count: number }[]).every(d => d.count === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No cost data available. Add BOQ items and link expenses to see breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Revenue & Collections */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            Revenue & Collections
          </h3>

          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Quoted Revenue</span>
                <span className="font-semibold">{formatCurrency(plData.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Client Payments Received</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(plData.clientPaymentsIn)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Outstanding from Client</span>
                <span className={cn(
                  'font-semibold',
                  plData.outstandingFromClient > 0 ? 'text-amber-600' : 'text-green-600'
                )}>
                  {formatCurrency(plData.outstandingFromClient)}
                </span>
              </div>
            </div>

            {/* Collection Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Collection Progress</span>
                <span className="font-medium">
                  {plData.totalRevenue > 0
                    ? formatPercent((plData.clientPaymentsIn / plData.totalRevenue) * 100)
                    : '0%'}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      plData.totalRevenue > 0
                        ? (plData.clientPaymentsIn / plData.totalRevenue) * 100
                        : 0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* P&L Summary Box */}
            <div className={cn(
              'p-4 rounded-lg',
              isProfitable ? 'bg-green-50' : 'bg-red-50'
            )}>
              <div className="text-sm text-muted-foreground mb-1">Net Position</div>
              <div className={cn(
                'text-xl font-semibold',
                isProfitable ? 'text-green-700' : 'text-red-700'
              )}>
                {isProfitable ? 'Profit: ' : 'Loss: '}
                {formatCurrency(Math.abs(plData.grossProfit))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isProfitable
                  ? `${formatPercent(plData.grossMargin)} margin on quoted revenue`
                  : 'Costs exceed quoted revenue'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget vs Actual Comparison */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-base font-semibold mb-4">Budget vs Actual by Category</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Quoted Budget</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Actual Spent</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Variance</th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">% Used</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(plData.categoryBreakdown) as [BOQCategory, { quoted: number; actual: number; count: number }][]).map(([category, data]) => {
                const config = CATEGORY_CONFIG[category];
                if (!config) return null;
                
                const variance = data.quoted - data.actual;
                const percentUsed = data.quoted > 0 ? (data.actual / data.quoted) * 100 : 0;
                const isOverBudget = variance < 0;

                return (
                  <tr key={category} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <config.icon className={cn('h-4 w-4', config.color)} />
                        <span className="font-medium">{config.label}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{formatCurrency(data.quoted)}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(data.actual)}</td>
                    <td className={cn(
                      'text-right py-3 px-4 font-medium',
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    )}>
                      {isOverBudget ? '' : '+'}{formatCurrency(variance)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        percentUsed > 100 ? 'bg-red-100 text-red-700' :
                        percentUsed > 80 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      )}>
                        {formatPercent(percentUsed)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {/* Total Row */}
              <tr className="bg-muted/50 font-semibold">
                <td className="py-3 px-4">Total</td>
                <td className="text-right py-3 px-4">{formatCurrency(plData.totalRevenue)}</td>
                <td className="text-right py-3 px-4">{formatCurrency(plData.totalCosts)}</td>
                <td className={cn(
                  'text-right py-3 px-4',
                  isProfitable ? 'text-green-600' : 'text-red-600'
                )}>
                  {isProfitable ? '+' : ''}{formatCurrency(plData.grossProfit)}
                </td>
                <td className="text-right py-3 px-4">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    plData.budgetUsage > 100 ? 'bg-red-100 text-red-700' :
                    plData.budgetUsage > 80 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  )}>
                    {formatPercent(plData.budgetUsage)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
