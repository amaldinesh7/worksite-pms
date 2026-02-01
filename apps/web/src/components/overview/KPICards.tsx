/**
 * KPI Cards Component
 * Displays 4 actionable KPI cards for the dashboard header
 */

import { Building2, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { KPIStats } from '@/lib/api/overview';

interface KPICardsProps {
  data: KPIStats;
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
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  subtitle?: string;
  isLoading?: boolean;
}

function KPICard({ title, value, icon, variant = 'default', subtitle, isLoading }: KPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-emerald-500/30 bg-emerald-50/50',
    warning: 'border-amber-500/30 bg-amber-50/50',
    danger: 'border-red-500/30 bg-red-50/50',
  };

  const iconStyles = {
    default: 'text-muted-foreground bg-muted',
    success: 'text-emerald-600 bg-emerald-100',
    warning: 'text-amber-600 bg-amber-100',
    danger: 'text-red-600 bg-red-100',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md cursor-pointer', variantStyles[variant])}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('rounded-xl p-3', iconStyles[variant])}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          )}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  const hasAttention = data.attentionNeeded > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Active Projects"
        value={data.activeProjects}
        icon={<Building2 className="h-5 w-5" />}
        variant="default"
        isLoading={isLoading}
      />
      <KPICard
        title="Outstanding Receivables"
        value={formatCurrency(data.outstandingReceivables)}
        icon={<ArrowDownCircle className="h-5 w-5" />}
        variant="success"
        subtitle="Due from clients"
        isLoading={isLoading}
      />
      <KPICard
        title="Outstanding Payables"
        value={formatCurrency(data.outstandingPayables)}
        icon={<ArrowUpCircle className="h-5 w-5" />}
        variant="warning"
        subtitle="Due to vendors"
        isLoading={isLoading}
      />
      <KPICard
        title="Needs Attention"
        value={hasAttention ? `${data.attentionNeeded} projects` : 'All good!'}
        icon={<AlertTriangle className="h-5 w-5" />}
        variant={hasAttention ? 'danger' : 'default'}
        subtitle={hasAttention ? 'Over budget or overdue' : undefined}
        isLoading={isLoading}
      />
    </div>
  );
}
