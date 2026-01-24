/**
 * Project Detail Page
 *
 * Shows detailed view of a project with multiple tabs:
 * - Overview: Project financials, timeline, stages, details, quick links
 * - Expenses: Expenses table with search, filters, and add expense modal
 * - Payments: Client/Party/Team payments with URL-based filter persistence
 * - Stages: Project stages and tasks
 * - Documents: (future)
 * - Reports: (future)
 * - Analytics: (future)
 */

import { useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  House,
  CurrencyDollar,
  Money,
  Stack,
  FileText,
  ChartBar,
  ChartLine,
} from '@phosphor-icons/react';

import { PageContent, Header } from '@/components/layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
  SecondaryTabsContent,
} from '@/components/ui/custom/secondary-tabs';
import { useProject, useProjectStats } from '@/lib/hooks/useProjects';
import { ProjectOverviewTab } from '@/components/projects/overview/ProjectOverviewTab';
import { ProjectExpensesTab } from '@/components/projects/expenses/ProjectExpensesTab';
import { ProjectPaymentsTab } from '@/components/projects/payments';
import { ProjectStagesTab } from '@/components/projects/stages';

// ============================================
// Component
// ============================================

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-based state for persistence
  const activeTab = searchParams.get('tab') || 'overview';
  const paymentTab = searchParams.get('paymentTab') || 'client';
  const memberId = searchParams.get('memberId') || undefined;

  // Update URL params while preserving existing ones
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      // When changing main tabs, clear payment-specific params if leaving payments
      if (tab !== 'payments') {
        updateSearchParams({ tab, paymentTab: undefined, memberId: undefined });
      } else {
        updateSearchParams({ tab });
      }
    },
    [updateSearchParams]
  );

  const handlePaymentTabChange = useCallback(
    (tab: string) => {
      // Clear memberId when switching away from team tab
      if (tab !== 'team') {
        updateSearchParams({ paymentTab: tab, memberId: undefined });
      } else {
        updateSearchParams({ paymentTab: tab });
      }
    },
    [updateSearchParams]
  );

  const handleMemberIdChange = useCallback(
    (newMemberId: string | undefined) => {
      updateSearchParams({ memberId: newMemberId });
    },
    [updateSearchParams]
  );

  // Data fetching
  const { data: project, isLoading: isProjectLoading } = useProject(id || '');
  const { data: stats, isLoading: isStatsLoading } = useProjectStats(id || '');

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (!project) return [];
    return [
      { label: 'Projects', href: '/projects' },
      { label: project.name },
    ];
  }, [project]);

  // Loading state
  if (isProjectLoading) {
    return (
      <PageContent className="overflow-hidden min-h-0">
        <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse mb-4" />
        <div className="h-8 w-64 bg-neutral-100 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-neutral-100 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="h-64 bg-neutral-100 rounded animate-pulse" />
          </div>
          <div className="col-span-4">
            <div className="h-64 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      </PageContent>
    );
  }

  // Project not found
  if (!project) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-neutral-500 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="text-primary hover:underline cursor-pointer"
          >
            Go back to Projects
          </button>
        </div>
      </PageContent>
    );
  }

  return (
    <>
      <Header title={project.name} />
      <PageContent className="overflow-hidden min-h-0 pt-2">
        {/* Breadcrumb */}
        {/* <Breadcrumb items={breadcrumbItems} className="mb-2" /> */}

        {/* Tabs */}
        <SecondaryTabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <SecondaryTabsList>
            <SecondaryTabsTrigger value="overview" icon={House}>
              Overview
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="expenses" icon={CurrencyDollar}>
              Expenses
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="payments" icon={Money}>
              Payments
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="stages" icon={Stack}>
              Stages
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="documents" icon={FileText}>
              Documents
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="reports" icon={ChartBar}>
              Reports
            </SecondaryTabsTrigger>
            <SecondaryTabsTrigger value="analytics" icon={ChartLine}>
              Analytics
            </SecondaryTabsTrigger>
          </SecondaryTabsList>

          <SecondaryTabsContent value="overview" className="mt-6">
            <ProjectOverviewTab
              project={project}
              stats={stats}
              isStatsLoading={isStatsLoading}
            />
          </SecondaryTabsContent>

          <SecondaryTabsContent value="expenses" className="mt-6">
            <ProjectExpensesTab projectId={project.id} />
          </SecondaryTabsContent>

          <SecondaryTabsContent value="payments" className="mt-6">
            <ProjectPaymentsTab
              projectId={project.id}
              initialPaymentTab={paymentTab}
              initialMemberId={memberId}
              onPaymentTabChange={handlePaymentTabChange}
              onMemberIdChange={handleMemberIdChange}
            />
          </SecondaryTabsContent>

          <SecondaryTabsContent value="stages" className="mt-6">
            <ProjectStagesTab projectId={project.id} />
          </SecondaryTabsContent>

          <SecondaryTabsContent value="documents" className="mt-6">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Documents tab coming soon
            </div>
          </SecondaryTabsContent>

          <SecondaryTabsContent value="reports" className="mt-6">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Reports tab coming soon
            </div>
          </SecondaryTabsContent>

          <SecondaryTabsContent value="analytics" className="mt-6">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Analytics tab coming soon
            </div>
          </SecondaryTabsContent>
        </SecondaryTabs>
      </PageContent>
    </>
  );
}
