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

import { useCallback, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { IconProps } from '@phosphor-icons/react';
import {
  House,
  CurrencyDollar,
  Money,
  Stack,
  FileText,
  ChartBar,
  Receipt,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

import { Header } from '@/components/layout';
import {
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
  SecondaryTabsContent,
} from '@/components/ui/custom/secondary-tabs';
import { useProject, useProjectStats, useUpdateProject } from '@/lib/hooks/useProjects';
import { ProjectOverviewTab } from '@/components/projects/overview/ProjectOverviewTab';
import { ProjectExpensesTab } from '@/components/projects/expenses/ProjectExpensesTab';
import { ProjectPaymentsTab } from '@/components/projects/payments';
import { ProjectStagesTab } from '@/components/projects/stages';
import { ProjectBOQTab } from '@/components/projects/boq';
import { ProjectReportsTab } from '@/components/projects/reports';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import type { UpdateProjectInput } from '@/lib/api/projects';

// ============================================
// Tab Configuration
// ============================================

interface TabConfig {
  value: string;
  label: string;
  icon: React.ComponentType<IconProps>;
}

const PROJECT_TABS: TabConfig[] = [
  { value: 'overview', label: 'Overview', icon: House },
  { value: 'expenses', label: 'Expenses', icon: CurrencyDollar },
  { value: 'payments', label: 'Payments', icon: Money },
  { value: 'stages', label: 'Stages', icon: Stack },
  { value: 'boq', label: 'BOQ & Estimate', icon: Receipt },
  { value: 'documents', label: 'Documents', icon: FileText },
  { value: 'reports', label: 'Reports', icon: ChartBar },
];

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

  // Edit modal state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
  const {
    data: project,
    isLoading: isProjectLoading,
    refetch: refetchProject,
  } = useProject(id || '');
  const { data: stats, isLoading: isStatsLoading } = useProjectStats(id || '');

  // Mutations
  const updateMutation = useUpdateProject();

  // Handler to refresh project data (used after client updates)
  const handleRefreshProject = useCallback(() => {
    refetchProject();
  }, [refetchProject]);

  // Handler to open edit dialog
  const handleEditProject = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  // Handler for project update submission
  const handleUpdateProject = useCallback(
    async (data: UpdateProjectInput) => {
      if (!id) return;
      try {
        await updateMutation.mutateAsync({ id, data });
        toast.success('Project updated successfully');
        setIsEditDialogOpen(false);
        refetchProject();
      } catch {
        toast.error('Failed to update project');
      }
    },
    [id, updateMutation, refetchProject]
  );

  // Loading state
  if (isProjectLoading) {
    return (
      <main className="flex-1 overflow-hidden flex flex-col" role="main">
        <div className="p-6">
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
        </div>
      </main>
    );
  }

  // Project not found
  if (!project) {
    return (
      <main className="flex-1 overflow-hidden flex flex-col" role="main">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-neutral-500 mb-4">Project not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="text-primary hover:underline cursor-pointer"
          >
            Go back to Projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header
        title="Projects"
        breadcrumbs={
          project.name
            ? [{ label: 'Projects', href: '/projects' }, { label: project.name }]
            : undefined
        }
      />
      <main className="flex-1 overflow-hidden flex flex-col" role="main">
        <SecondaryTabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Sticky Tabs List */}
          <SecondaryTabsList className="sticky top-0 z-10 bg-white shrink-0 px-5">
            {PROJECT_TABS.map((tab) => (
              <SecondaryTabsTrigger key={tab.value} value={tab.value} icon={tab.icon}>
                {tab.label}
              </SecondaryTabsTrigger>
            ))}
          </SecondaryTabsList>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <SecondaryTabsContent value="overview" className="p-5">
              <ProjectOverviewTab
                project={project}
                stats={stats}
                isStatsLoading={isStatsLoading}
                onNavigateToStages={() => setActiveTab('stages')}
                onRefreshProject={handleRefreshProject}
                onEditProject={handleEditProject}
              />
            </SecondaryTabsContent>

            <SecondaryTabsContent value="expenses" className="py-6 px-6">
              <ProjectExpensesTab projectId={project.id} />
            </SecondaryTabsContent>

            <SecondaryTabsContent value="payments" className="py-6 px-6">
              <ProjectPaymentsTab
                projectId={project.id}
                initialPaymentTab={paymentTab}
                initialMemberId={memberId}
                onPaymentTabChange={handlePaymentTabChange}
                onMemberIdChange={handleMemberIdChange}
              />
            </SecondaryTabsContent>

            <SecondaryTabsContent value="stages" className="py-6 px-6">
              <ProjectStagesTab projectId={project.id} />
            </SecondaryTabsContent>

            <SecondaryTabsContent value="boq" className="py-6 px-6">
              <ProjectBOQTab projectId={project.id} />
            </SecondaryTabsContent>

            <SecondaryTabsContent value="documents" className="py-6 px-6">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Documents tab coming soon
              </div>
            </SecondaryTabsContent>

            <SecondaryTabsContent value="reports" className="py-6 px-6">
              <ProjectReportsTab projectId={project.id} />
            </SecondaryTabsContent>
          </div>
        </SecondaryTabs>
      </main>

      {/* Edit Project Dialog */}
      <ProjectFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        onSubmit={handleUpdateProject}
        isSubmitting={updateMutation.isPending}
      />
    </>
  );
}
