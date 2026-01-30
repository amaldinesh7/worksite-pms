/**
 * Project Reports Tab
 *
 * Comprehensive project reports including:
 * - P&L summary cards (Revenue, Costs, Gross Profit, Margin)
 * - Financial summary cards (Received, Receivables, Payables, Team Advances)
 * - Expense breakdown pie chart by type
 * - Cash flow timeline chart
 * - Budget vs Actual comparison table
 */

import { useMemo, useState } from 'react';
import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Receipt,
  Wallet,
  ChartPie,
  CaretDown,
  Users,
  HandCoins,
  ArrowCircleDown,
  ArrowCircleUp,
  ChartLine,
} from '@phosphor-icons/react';
import {
  eachMonthOfInterval,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  min,
  max,
} from 'date-fns';

import { useBOQStats } from '@/lib/hooks/useBOQ';
import { useProject, useProjectStats } from '@/lib/hooks/useProjects';
import { useExpensesSummary, useExpenses } from '@/lib/hooks/useExpenses';
import { useProjectMemberAdvanceSummaries } from '@/lib/hooks/useMemberAdvances';
import { usePayments } from '@/lib/hooks/usePayments';
import { PieChart, AreaChart } from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import {
  FlippableAmount,
  formatShortCurrency,
  formatFullCurrency,
} from '@/components/ui/flippable-amount';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface ProjectReportsTabProps {
  projectId: string;
}

interface CategoryData {
  categoryName: string;
  sortOrder: number;
  quoted: number;
  actual: number;
  count: number;
}

// ============================================
// Helper Functions
// ============================================

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================
// Constants
// ============================================

const EXPENSE_TYPE_COLORS: Record<string, string> = {
  Material: '#0d9488',
  Labour: '#f59e0b',
  'Sub Work': '#8b5cf6',
  Equipment: '#22c55e',
  Other: '#6b7280',
};

// ============================================
// Component
// ============================================

export function ProjectReportsTab({ projectId }: ProjectReportsTabProps) {
  // UI State
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [showFullAmounts, setShowFullAmounts] = useState(false);

  // Data fetching
  const { data: project, isLoading: isProjectDataLoading } = useProject(projectId);
  const { data: boqStats, isLoading: isBOQLoading } = useBOQStats(projectId);
  const { data: projectStats, isLoading: isProjectLoading } = useProjectStats(projectId);
  const { data: expenseSummary, isLoading: isExpenseLoading } = useExpensesSummary(projectId);
  const { data: memberSummaries, isLoading: isMemberLoading } =
    useProjectMemberAdvanceSummaries(projectId);

  // Fetch payments (client payments IN) for timeline
  const { data: paymentsData, isLoading: isPaymentsLoading } = usePayments({
    projectId,
    type: 'IN',
    limit: 1000, // Get all payments
    sortBy: 'paymentDate',
    sortOrder: 'asc',
  });

  // Fetch expenses for timeline
  const { data: expensesData, isLoading: isExpensesDataLoading } = useExpenses({
    projectId,
    limit: 1000, // Get all expenses
    sortBy: 'expenseDate',
    sortOrder: 'asc',
  });

  // Calculate total team balance
  const totalTeamBalance = useMemo(() => {
    if (!memberSummaries) return 0;
    return memberSummaries.reduce((sum, m) => sum + m.balance, 0);
  }, [memberSummaries]);

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

    // Payables = total expenses - total payments out
    const totalExpenses = projectStats?.totalExpenses ?? 0;
    const totalPaymentsOut = projectStats?.totalPaymentsOut ?? 0;
    const payables = totalExpenses - totalPaymentsOut;

    return {
      totalRevenue,
      totalCosts,
      grossProfit,
      grossMargin,
      budgetUsage,
      clientPaymentsIn,
      outstandingFromClient,
      payables,
      categoryBreakdown: boqStats?.categoryBreakdown ?? {},
    };
  }, [boqStats, projectStats]);

  // Prepare pie chart data from expense summary
  const expensePieData = useMemo(() => {
    if (!expenseSummary || expenseSummary.length === 0) return [];

    return expenseSummary.map((item) => ({
      name: item.categoryName,
      value: item.total,
      color: EXPENSE_TYPE_COLORS[item.categoryName] || '#6b7280',
    }));
  }, [expenseSummary]);

  // Prepare cash flow timeline data
  const cashFlowData = useMemo(() => {
    if (!project || !paymentsData?.items || !expensesData?.items) return [];

    const projectStart = parseISO(project.startDate);
    const today = new Date();
    const projectEnd = project.endDate ? parseISO(project.endDate) : today;

    // Timeline end is the earlier of: today or project end date
    const timelineEnd = isBefore(projectEnd, today) ? projectEnd : today;

    // Get the actual data range from payments and expenses
    const paymentDates = paymentsData.items.map((p) => parseISO(p.paymentDate));
    const expenseDates = expensesData.items.map((e) => parseISO(e.expenseDate));
    const allDates = [...paymentDates, ...expenseDates].filter((d) => !isNaN(d.getTime()));

    // Use project start as minimum, or earliest data point if before project start
    const earliestData = allDates.length > 0 ? min(allDates) : projectStart;
    const latestData = allDates.length > 0 ? max(allDates) : timelineEnd;

    const rangeStart = isBefore(earliestData, projectStart) ? earliestData : projectStart;
    const rangeEnd = isAfter(latestData, timelineEnd) ? latestData : timelineEnd;

    // Generate months for the timeline
    const months = eachMonthOfInterval({
      start: startOfMonth(rangeStart),
      end: endOfMonth(rangeEnd),
    });

    // Aggregate payments by month
    const paymentsByMonth = new Map<string, number>();
    paymentsData.items.forEach((payment) => {
      const monthKey = format(parseISO(payment.paymentDate), 'yyyy-MM');
      paymentsByMonth.set(monthKey, (paymentsByMonth.get(monthKey) || 0) + payment.amount);
    });

    // Aggregate expenses by month
    const expensesByMonth = new Map<string, number>();
    expensesData.items.forEach((expense) => {
      const monthKey = format(parseISO(expense.expenseDate), 'yyyy-MM');
      const amount = expense.rate * expense.quantity;
      expensesByMonth.set(monthKey, (expensesByMonth.get(monthKey) || 0) + amount);
    });

    // Build cumulative data
    let cumulativePayments = 0;
    let cumulativeExpenses = 0;

    return months.map((month) => {
      const monthKey = format(month, 'yyyy-MM');
      cumulativePayments += paymentsByMonth.get(monthKey) || 0;
      cumulativeExpenses += expensesByMonth.get(monthKey) || 0;

      return {
        label: format(month, 'MMM yy'),
        payments: cumulativePayments,
        expenses: cumulativeExpenses,
      };
    });
  }, [project, paymentsData, expensesData]);

  const isLoading =
    isBOQLoading ||
    isProjectLoading ||
    isExpenseLoading ||
    isMemberLoading ||
    isProjectDataLoading ||
    isPaymentsLoading ||
    isExpensesDataLoading;

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
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-muted rounded animate-pulse mb-1" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const isHealthy = plData.grossMargin >= 20;
  const isProfitable = plData.grossProfit >= 0;

  // Format function based on toggle
  const formatAmount = showFullAmounts ? formatFullCurrency : formatShortCurrency;

  return (
    <div className="space-y-6">
      {/* P&L Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Revenue (Quoted) */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Receipt className="h-4 w-4" />
            <span>Total Revenue</span>
          </div>
          <FlippableAmount
            amount={plData.totalRevenue}
            className="text-2xl font-semibold numeric"
          />
          <div className="text-xs text-muted-foreground mt-1">Based on quoted BOQ</div>
        </div>

        {/* Total Costs */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CurrencyDollar className="h-4 w-4" />
            <span>Total Costs</span>
          </div>
          <FlippableAmount amount={plData.totalCosts} className="text-2xl font-semibold numeric" />
          <div className="text-xs text-muted-foreground mt-1 numeric">
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
          <div
            className={cn(
              'text-2xl font-semibold',
              isProfitable ? 'text-green-600' : 'text-red-600'
            )}
          >
            <FlippableAmount
              amount={plData.grossProfit}
              showPrefix
              prefix={isProfitable ? '+' : ''}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Revenue minus costs</div>
        </div>

        {/* Gross Margin */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Wallet className="h-4 w-4" />
            <span>Gross Margin</span>
          </div>
          <div className="text-2xl font-semibold numeric">{formatPercent(plData.grossMargin)}</div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                isHealthy ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}
            >
              {isHealthy ? 'Healthy' : 'At Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Received from Client */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowCircleDown className="h-4 w-4 text-green-600" />
            <span>Received from Client</span>
          </div>
          <FlippableAmount
            amount={plData.clientPaymentsIn}
            className="text-2xl font-semibold numeric text-green-600"
          />
        </div>

        {/* Outstanding from Client */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <HandCoins className="h-4 w-4 text-amber-600" />
            <span>Outstanding from Client</span>
          </div>
          <FlippableAmount
            amount={plData.outstandingFromClient}
            className={cn(
              'text-2xl font-semibold numeric',
              plData.outstandingFromClient > 0 ? 'text-amber-600' : 'text-green-600'
            )}
          />
        </div>

        {/* Payables (What we owe to parties) */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowCircleUp className="h-4 w-4 text-red-600" />
            <span>Payables</span>
          </div>
          <FlippableAmount
            amount={plData.payables}
            className={cn(
              'text-2xl font-semibold numeric',
              plData.payables > 0 ? 'text-red-600' : 'text-green-600'
            )}
          />
          <div className="text-xs text-muted-foreground mt-1">Owed to parties</div>
        </div>

        {/* Team Advances Balance */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Team Advances</span>
          </div>
          <FlippableAmount
            amount={totalTeamBalance}
            className={cn(
              'text-2xl font-semibold numeric',
              totalTeamBalance > 0 ? 'text-blue-600' : 'text-green-600'
            )}
          />
          <div className="text-xs text-muted-foreground mt-1">Unspent with team members</div>
        </div>
      </div>

      {/* Charts Row - Expenses by Type & Cash Flow */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expense Breakdown Pie Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ChartPie className="h-5 w-5 text-muted-foreground" />
            Expenses by Type
          </h3>

          {expensePieData.length > 0 ? (
            <>
              <PieChart
                data={expensePieData}
                height={250}
                showLegend={true}
                showTooltip={true}
                innerRadius={0}
                outerRadius={80}
                formatValue={formatShortCurrency}
              />

              {/* View Details Toggle */}
              <button
                onClick={() => setShowExpenseDetails(!showExpenseDetails)}
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-4 mx-auto cursor-pointer"
              >
                {showExpenseDetails ? 'Hide breakdown' : 'View breakdown'}
                <CaretDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    showExpenseDetails && 'rotate-180'
                  )}
                />
              </button>

              {/* Expense Details */}
              {showExpenseDetails && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {expensePieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </span>
                      <span className="font-medium numeric">{formatShortCurrency(item.value)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="numeric">
                      {formatShortCurrency(
                        expensePieData.reduce((sum, item) => sum + item.value, 0)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <ChartPie className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No expense data available</p>
                <p className="text-sm">Add expenses to see the breakdown</p>
              </div>
            </div>
          )}
        </div>

        {/* Cash Flow Timeline Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-muted-foreground" />
            Cash Flow Over Time
          </h3>

          {cashFlowData.length > 0 ? (
            <AreaChart
              data={cashFlowData}
              series={[
                {
                  dataKey: 'payments',
                  name: 'Client Payments',
                  color: '#22c55e',
                  fillOpacity: 0.15,
                },
                { dataKey: 'expenses', name: 'Expenses', color: '#ef4444', fillOpacity: 0.15 },
              ]}
              height={250}
              showLegend={true}
              showTooltip={true}
              formatValue={formatShortCurrency}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <ChartLine className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No cash flow data available</p>
                <p className="text-sm">Payments and expenses will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget vs Actual Comparison Table */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Budget vs Actual by Category</h3>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span className="text-muted-foreground">Show full amounts</span>
            <Switch checked={showFullAmounts} onCheckedChange={setShowFullAmounts} />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  Quoted Budget
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  Actual Spent
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  Variance
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(plData.categoryBreakdown).map(([categoryId, data]) => {
                const categoryData = data as CategoryData;
                const variance = categoryData.quoted - categoryData.actual;
                const variancePercent =
                  categoryData.quoted > 0 ? (variance / categoryData.quoted) * 100 : 0;
                const isOverBudget = variance < 0;

                return (
                  <tr key={categoryId} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <span className="font-medium">{categoryData.categoryName}</span>
                    </td>
                    <td className="text-right py-3 px-4 numeric">
                      {formatAmount(categoryData.quoted)}
                    </td>
                    <td className="text-right py-3 px-4 numeric">
                      {formatAmount(categoryData.actual)}
                    </td>
                    <td
                      className={cn(
                        'text-right py-3 px-4 font-medium numeric',
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {isOverBudget ? '' : '+'}
                      {formatAmount(variance)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs numeric',
                          isOverBudget ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        )}
                      >
                        {isOverBudget ? '' : '+'}
                        {formatPercent(variancePercent)}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {Object.keys(plData.categoryBreakdown).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No budget data available. Add BOQ items and link expenses to see the comparison.
                  </td>
                </tr>
              )}

              {/* Total Row */}
              {Object.keys(plData.categoryBreakdown).length > 0 && (
                <tr className="bg-muted/50 font-semibold">
                  <td className="py-3 px-4">Total</td>
                  <td className="text-right py-3 px-4 numeric">
                    {formatAmount(plData.totalRevenue)}
                  </td>
                  <td className="text-right py-3 px-4 numeric">
                    {formatAmount(plData.totalCosts)}
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-4 numeric',
                      isProfitable ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isProfitable ? '+' : ''}
                    {formatAmount(plData.grossProfit)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs numeric',
                        isProfitable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}
                    >
                      {isProfitable ? '+' : ''}
                      {formatPercent(plData.grossMargin)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
