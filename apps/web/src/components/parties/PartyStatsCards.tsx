import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TypographyMuted, TypographyLarge, TypographySmall } from '@/components/ui/typography';
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
  isLoading?: boolean;
}

function StatCard({ title, count, balance, icon, isLoading }: StatCardProps) {
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
      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
          <div className="flex-1">
            <TypographyMuted className="text-xs font-medium">{title}</TypographyMuted>
            <TypographyLarge className="text-xl">{count}</TypographyLarge>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <TypographySmall className="text-muted-foreground font-normal">Outstanding Balance</TypographySmall>
            <TypographySmall>{formatCurrency(balance)}</TypographySmall>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-muted"
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
        isLoading={isLoading}
      />
      <StatCard
        title="Total Labours"
        count={summary?.totalLabours ?? 0}
        balance={summary?.laboursBalance ?? 0}
        icon={<HardHat className="h-5 w-5" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Sub Contractors"
        count={summary?.totalSubcontractors ?? 0}
        balance={summary?.subcontractorsBalance ?? 0}
        icon={<Building2 className="h-5 w-5" />}
        isLoading={isLoading}
      />
    </div>
  );
}
