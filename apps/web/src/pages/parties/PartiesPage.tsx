/**
 * Parties Management Page
 *
 * Main page for managing parties (vendors, labours, subcontractors).
 * Features:
 * - Stats cards showing totals and balances by type
 * - Tab navigation for filtering by party type
 * - Data table with search, pagination, and CRUD actions
 *
 * Note: Layout (Sidebar) is provided by the parent ProtectedLayout route.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  Storefront,
  HardHat,
  Briefcase,
} from '@phosphor-icons/react';
import { PageContent, Header } from '@/components/layout';
import {
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
} from '@/components/ui/custom/secondary-tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  PartyStatsCards,
  PartiesTable,
  PartyFormDialog,
  DeletePartyDialog,
} from '@/components/parties';
import {
  useParties,
  usePartiesSummary,
  useCreateParty,
  useUpdateParty,
  useDeleteParty,
} from '@/lib/hooks/useParties';
import type { Party, PartyType, CreatePartyInput, UpdatePartyInput } from '@/lib/api/parties';

const PAGINATION_LIMIT = 9;    

// ============================================
// Types
// ============================================

type TabValue = PartyType;

// ============================================
// Component
// ============================================

export default function PartiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get tab from URL or default to VENDOR
  const tabFromUrl = searchParams.get('tab') as TabValue | null;
  const isValidTab = tabFromUrl && ['VENDOR', 'LABOUR', 'SUBCONTRACTOR'].includes(tabFromUrl);
  const initialTab: TabValue = isValidTab ? tabFromUrl : 'VENDOR';

  // Tab state - initialize from URL
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Pagination state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showOnlyWithCredit, setShowOnlyWithCredit] = useState(false);
  const limit = PAGINATION_LIMIT;

  // Sync URL when tab changes
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // ============================================
  // Data Fetching
  // ============================================

  const { data: summary, isLoading: isSummaryLoading } = usePartiesSummary();

  const { data: partiesData, isLoading: isPartiesLoading } = useParties({
    page,
    limit,
    search: search || undefined,
    type: activeTab,
    hasCredit: showOnlyWithCredit || undefined,
  });

  // ============================================
  // Mutations
  // ============================================

  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty();
  const deleteMutation = useDeleteParty();

  // ============================================
  // Handlers
  // ============================================

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
    setPage(1); // Reset to first page when changing tabs
    setSearch(''); // Clear search when changing tabs
  }, []);

  const handleCreditFilterChange = useCallback((checked: boolean) => {
    setShowOnlyWithCredit(checked);
    setPage(1); // Reset to first page when changing filter
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleAddParty = useCallback(() => {
    setSelectedParty(null);
    setFormDialogOpen(true);
  }, []);

  const handleViewParty = useCallback((party: Party) => {
    // Navigate to party detail page
    navigate(`/parties/${party.id}`);
  }, [navigate]);

  const handleEditParty = useCallback((party: Party) => {
    setSelectedParty(party);
    setFormDialogOpen(true);
  }, []);

  const handleDeleteParty = useCallback((party: Party) => {
    setSelectedParty(party);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreatePartyInput | UpdatePartyInput) => {
      try {
        if (selectedParty) {
          // Update existing party
          await updateMutation.mutateAsync({
            id: selectedParty.id,
            data: data as UpdatePartyInput,
          });
          toast.success('Party updated successfully');
        } else {
          // Create new party
          await createMutation.mutateAsync(data as CreatePartyInput);
          toast.success('Party created successfully');
        }
        setFormDialogOpen(false);
        setSelectedParty(null);
      } catch {
        toast.error(selectedParty ? 'Failed to update party' : 'Failed to create party');
      }
    },
    [selectedParty, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedParty) return;

    try {
      await deleteMutation.mutateAsync(selectedParty.id);
      toast.success('Party deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedParty(null);
    } catch {
      toast.error('Failed to delete party');
    }
  }, [selectedParty, deleteMutation]);

  // ============================================
  // Derived State
  // ============================================

  const parties = partiesData?.items ?? [];
  const pagination = partiesData?.pagination ?? {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  const getDefaultType = (): PartyType => {
    return activeTab;
  };

  // ============================================
  // Render
  // ============================================

  return (
    <>
      <Header
        title="Parties Overview"
        subtitle="Manage your vendors, labours, and subcontractors"
        showSearch={false}
        primaryActionLabel=""
      />

      <PageContent>
        <div className="space-y-3">
          {/* Stats Cards */}
          <PartyStatsCards summary={summary} isLoading={isSummaryLoading} />

          {/* Tabs and Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SecondaryTabs value={activeTab} onValueChange={handleTabChange}>
                <SecondaryTabsList>
                  <SecondaryTabsTrigger value="VENDOR" icon={Storefront} className="cursor-pointer">
                    Vendors
                  </SecondaryTabsTrigger>
                  <SecondaryTabsTrigger value="LABOUR" icon={HardHat} className="cursor-pointer">
                    Labours
                  </SecondaryTabsTrigger>
                  <SecondaryTabsTrigger value="SUBCONTRACTOR" icon={Briefcase} className="cursor-pointer">
                    Sub Contractors
                  </SecondaryTabsTrigger>
                </SecondaryTabsList>
              </SecondaryTabs>

              {/* Credit Filter Toggle */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="credit-filter"
                  className={`text-sm cursor-pointer ${!showOnlyWithCredit ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                >
                  All
                </Label>
                <Switch
                  id="credit-filter"
                  checked={showOnlyWithCredit}
                  onCheckedChange={handleCreditFilterChange}
                  className="cursor-pointer"
                />
                <Label
                  htmlFor="credit-filter"
                  className={`text-sm cursor-pointer ${showOnlyWithCredit ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                >
                  With Credit
                </Label>
              </div>
            </div>

            <PartiesTable
              parties={parties}
              isLoading={isPartiesLoading}
              search={search}
              onSearchChange={handleSearchChange}
              onAddParty={handleAddParty}
              onViewParty={handleViewParty}
              onEditParty={handleEditParty}
              onDeleteParty={handleDeleteParty}
              pagination={pagination}
              onPageChange={handlePageChange}
              activeTab={activeTab}
            />
          </div>
        </div>
      </PageContent>

      {/* Form Dialog (Add/Edit) */}
      <PartyFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        party={selectedParty}
        defaultType={getDefaultType()}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePartyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        party={selectedParty}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
