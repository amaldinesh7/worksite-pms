/**
 * Project Detail Page
 *
 * Shows detailed view of a project with multiple tabs:
 * - Overview: Project financials, timeline, stages, details, quick links
 * - Expenses: Expenses table with search, filters, and add expense modal
 * - Payments: (future)
 * - Stages: (future)
 * - Documents: (future)
 * - Reports: (future)
 * - Analytics: (future)
 */

import { useMemo } from 'react';
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
import { ProjectStagesTab } from '@/components/projects/stages';

// ============================================
// Helpers
// ============================================



// ============================================
// Component
// ============================================

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL-based tab state for persistence
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };

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
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Payments tab coming soon
            </div>
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
