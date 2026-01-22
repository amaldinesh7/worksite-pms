/**
 * Party Detail Page
 *
 * Shows detailed view of a party with projects and transactions.
 * Features:
 * - Breadcrumb navigation
 * - 2-column layout: projects list (left) and transactions panel (right)
 * - Tabs for payments and expenses (purchase/wages)
 */

import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PageContent, Header } from '@/components/layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { PartyProjectsList, PartyTransactionsPanel } from '@/components/parties';
import { useParty, usePartyProjects, usePartyTransactions } from '@/lib/hooks/useParties';
import type { PartyType } from '@/lib/api/parties';

// ============================================
// Helpers
// ============================================

function getTypeLabel(type: PartyType): string {
  switch (type) {
    case 'VENDOR':
      return 'Vendor';
    case 'LABOUR':
      return 'Labour';
    case 'SUBCONTRACTOR':
      return 'Sub Contractor';
    default:
      return type;
  }
}

function getPartiesPath(type: PartyType): string {
  return `/parties?tab=${type}`;
}

// ============================================
// Component
// ============================================

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [transactionsPage, setTransactionsPage] = useState(1);

  // Data fetching
  const { data: party, isLoading: isPartyLoading } = useParty(id || '');
  const { data: projectsData, isLoading: isProjectsLoading } = usePartyProjects(id || '');
  const { data: transactionsData, isLoading: isTransactionsLoading } = usePartyTransactions(
    id || '',
    {
      type: activeTab,
      projectId: selectedProjectId || undefined,
      page: transactionsPage,
      limit: 5,
    }
  );

  // Handlers
  const handleSelectProject = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId);
    setTransactionsPage(1); // Reset to first page when project changes
  }, []);

  const handleTabChange = useCallback((tab: 'payments' | 'expenses') => {
    setActiveTab(tab);
    setTransactionsPage(1); // Reset to first page when tab changes
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTransactionsPage(page);
  }, []);

  // Computed values
  const breadcrumbItems = useMemo(() => {
    if (!party) return [];
    return [
      { label: 'Parties', href: '/parties' },
      { label: getTypeLabel(party.type), href: getPartiesPath(party.type) },
      { label: party.name },
    ];
  }, [party]);

  const projects = projectsData?.items || [];
  const totals = projectsData?.totals || { totalPaid: 0, totalCredit: 0 };
  const transactions = transactionsData?.items || [];
  const pagination = transactionsData?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  // Calculate totals for selected project or all projects
  const selectedProjectTotals = useMemo(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        return {
          totalPaid: project.totalPayments,
          totalExpenses: project.totalExpenses,
        };
      }
    }
    // If no project selected, sum all projects
    return {
      totalPaid: totals.totalPaid,
      totalExpenses: projects.reduce((sum, p) => sum + p.totalExpenses, 0),
    };
  }, [selectedProjectId, projects, totals]);

  // Loading state for the whole page
  if (isPartyLoading) {
    return (
      <PageContent className="overflow-hidden min-h-0">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-12 gap-6 h-full min-h-0 overflow-hidden">
          <div className="col-span-3 h-full">
            <div className="bg-card border border-border rounded-lg h-full animate-pulse" />
          </div>
          <div className="col-span-9 h-full">
            <div className="bg-card border border-border rounded-lg h-full animate-pulse" />
          </div>
        </div>
      </PageContent>
    );
  }

  // Party not found
  if (!party) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Party not found</p>
          <button
            onClick={() => navigate('/parties')}
            className="text-primary hover:underline cursor-pointer"
          >
            Go back to Parties
          </button>
        </div>
      </PageContent>
    );
  }

  return (
    <>
      <Header title={party.name} />
      <PageContent className="overflow-hidden min-h-0 pt-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-2" />

        {/* 2-Column Layout */}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100%-80px)] min-h-0 overflow-hidden">
          {/* Left Panel - Projects List */}
          <div className="col-span-3 h-full overflow-hidden">
            <PartyProjectsList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
              isLoading={isProjectsLoading}
              totalAmount={totals.totalCredit}
            />
          </div>

          {/* Right Panel - Transactions */}
          <div className="col-span-9 h-full overflow-hidden">
            <PartyTransactionsPanel
              partyType={party.type}
              totalPaid={selectedProjectTotals.totalPaid}
              totalExpenses={selectedProjectTotals.totalExpenses}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              transactions={transactions}
              pagination={pagination}
              onPageChange={handlePageChange}
              isLoading={isTransactionsLoading}
            />
          </div>
        </div>
      </PageContent>
    </>
  );
}
