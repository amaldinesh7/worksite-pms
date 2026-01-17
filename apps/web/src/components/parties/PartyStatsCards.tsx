import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, HardHat, Building2 } from 'lucide-react';
import type { PartySummary } from '@/lib/api/parties';

interface PartyStatsCardsProps {
  summary: PartySummary | undefined;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  count: number;
  balance: number;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'purple';
  isLoading?: boolean;
}

function StatCard({ title, count, balance, icon, color, isLoading }: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      progress: 'bg-blue-500',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      progress: 'bg-orange-500',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      progress: 'bg-purple-500',
    },
  };

  const classes = colorClasses[color];

  // Calculate progress percentage (capped at 100%)
  const maxBalance = 100000; // Arbitrary max for visualization
  const progressPercent = Math.min((Math.abs(balance) / maxBalance) * 100, 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className={`${classes.bg} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${classes.icon} animate-pulse`} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${classes.bg} border-0`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${classes.icon}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-xl font-semibold">{count}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Outstanding Balance</span>
            <span className="font-medium">{formatCurrency(balance)}</span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-gray-200"
            // indicatorClassName={classes.progress}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PartyStatsCards({ summary, isLoading }: PartyStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Vendors"
        count={summary?.totalVendors ?? 0}
        balance={summary?.vendorsBalance ?? 0}
        icon={<Users className="h-5 w-5" />}
        color="blue"
        isLoading={isLoading}
      />
      <StatCard
        title="Total Labours"
        count={summary?.totalLabours ?? 0}
        balance={summary?.laboursBalance ?? 0}
        icon={<HardHat className="h-5 w-5" />}
        color="orange"
        isLoading={isLoading}
      />
      <StatCard
        title="Sub Contractors"
        count={summary?.totalSubcontractors ?? 0}
        balance={summary?.subcontractorsBalance ?? 0}
        icon={<Building2 className="h-5 w-5" />}
        color="purple"
        isLoading={isLoading}
      />
    </div>
  );
}
