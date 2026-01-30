/**
 * Company Overview Page
 * Main dashboard showing KPIs, project stats, P/L table, tasks, and alerts
 */

import { ArrowsClockwise } from '@phosphor-icons/react';
import { Header } from '@/components/layout';
import { PageContent } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useOverview } from '@/lib/hooks/useOverview';
import {
  KPICards,
  ProjectStatsChart,
  ProjectPLTable,
  TodayTasksList,
  CreditsSummary,
  AlertsPanel,
} from '@/components/overview';

export function OverviewPage() {
  const { data, isLoading, isRefetching, refetch } = useOverview();

  // Default data for loading states
  const defaultKPIStats = {
    activeProjects: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    attentionNeeded: 0,
  };

  const defaultStatusBreakdown = {
    active: 0,
    onHold: 0,
    completed: 0,
  };

  const defaultCredits = {
    vendors: { count: 0, balance: 0 },
    labours: { count: 0, balance: 0 },
    subcontractors: { count: 0, balance: 0 },
    total: 0,
  };

  return (
    <>
      <Header
        title="Company Overview"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 cursor-pointer"
          >
            <ArrowsClockwise className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <PageContent>
        <div className="space-y-6">
          {/* Section 1: KPI Cards */}
          <section>
            <KPICards data={data?.kpiStats || defaultKPIStats} isLoading={isLoading} />
          </section>

          {/* Section 2: Chart + Alerts (side by side, equal width) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectStatsChart
              data={data?.projectStatusBreakdown || defaultStatusBreakdown}
              isLoading={isLoading}
            />
            <AlertsPanel data={data?.alerts || []} isLoading={isLoading} />
          </section>

          {/* Section 3: P/L Table (full width) */}
          <section>
            <ProjectPLTable data={data?.projectsPL || []} isLoading={isLoading} />
          </section>

          {/* Section 3: Tasks */}
          <section>
            <TodayTasksList data={data?.todayTasks || []} isLoading={isLoading} />
          </section>

          {/* Section 4: Credits Summary */}
          <section>
            <Typography variant="h4" className="mb-4">
              Credits & Outstanding
            </Typography>
            <CreditsSummary
              credits={data?.creditsSummary || defaultCredits}
              outstandingPayables={data?.outstandingPayables || []}
              outstandingReceivables={data?.outstandingReceivables || []}
              isLoading={isLoading}
            />
          </section>
        </div>
      </PageContent>
    </>
  );
}
