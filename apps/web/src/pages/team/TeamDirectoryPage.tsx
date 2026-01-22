/**
 * Team Directory Page
 *
 * Main page for managing team members.
 * Features:
 * - Single toolbar with search, role filter, sort, and add button
 * - Table with team member details
 * - Add/Edit/Delete member dialogs
 */

import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Plus, Users } from 'lucide-react';

import { PageContent, Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { TeamMembersTable } from '@/components/team/TeamMembersTable';
import { AddMemberDialog } from '@/components/team/AddMemberDialog';
import { DeleteMemberDialog } from '@/components/team/DeleteMemberDialog';
import {
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from '@/lib/hooks/useTeam';
import { useRoles } from '@/lib/hooks/useRoles';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from '@/lib/api/team';

// ============================================
// Constants
// ============================================

const PAGINATION_LIMIT = 20;

// ============================================
// Component
// ============================================

export default function TeamDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const page = parseInt(searchParams.get('page') || '1', 10);
  const roleFilter = searchParams.get('role') || 'all';
  const sortBy = searchParams.get('sort') || 'updatedAt';

  // Local state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Queries
  const { data: membersData, isLoading: isLoadingMembers } = useTeamMembers({
    page,
    limit: PAGINATION_LIMIT,
    search: debouncedSearch || undefined,
    roleId: roleFilter !== 'all' ? roleFilter : undefined,
  });

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({ limit: 50 });

  // Mutations
  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();

  // Handlers
  const handleRoleFilterChange = useCallback(
    (roleId: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (roleId !== 'all') {
          params.set('role', roleId);
        } else {
          params.delete('role');
        }
        params.set('page', '1');
        return params;
      });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('sort', sort);
        return params;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('page', newPage.toString());
        return params;
      });
    },
    [setSearchParams]
  );

  const handleAddMember = useCallback(() => {
    setSelectedMember(null);
    setIsAddDialogOpen(true);
  }, []);

  const handleEditMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsAddDialogOpen(true);
  }, []);

  const handleDeleteMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSubmitMember = useCallback(
    async (data: CreateTeamMemberInput | UpdateTeamMemberInput) => {
      try {
        if (selectedMember) {
          await updateMutation.mutateAsync({ id: selectedMember.id, data });
          toast.success('Team member updated successfully');
        } else {
          await createMutation.mutateAsync(data as CreateTeamMemberInput);
          toast.success('Team member added successfully');
        }
        setIsAddDialogOpen(false);
        setSelectedMember(null);
      } catch {
        toast.error(selectedMember ? 'Failed to update team member' : 'Failed to add team member');
      }
    },
    [selectedMember, createMutation, updateMutation]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;

    try {
      await deleteMutation.mutateAsync(selectedMember.id);
      toast.success('Team member removed successfully');
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch {
      toast.error('Failed to remove team member');
    }
  }, [selectedMember, deleteMutation]);

  // Derived state
  const members = membersData?.items || [];
  const roles = rolesData?.items || [];
  const pagination = membersData?.pagination || {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };
  const isLoading = isLoadingMembers || isLoadingRoles;

  // Get filter label
  const getFilterLabel = () => {
    if (roleFilter === 'all') {
      return `All members (${pagination.total})`;
    }
    const role = roles.find((r) => r.id === roleFilter);
    return role ? role.name : 'All members';
  };

  return (
    <>
      <Header
        title="Team Directory"
        subtitle="Manage your team members and roles"
        showSearch={false}
        primaryActionLabel=""
      />

      <PageContent>
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter Dropdown */}
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue>{getFilterLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  All members ({pagination.total})
                </SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id} className="cursor-pointer">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px] cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt" className="cursor-pointer">
                    Last Modified
                  </SelectItem>
                  <SelectItem value="name" className="cursor-pointer">
                    Name
                  </SelectItem>
                  <SelectItem value="createdAt" className="cursor-pointer">
                    Date Added
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Member Button */}
            <Button onClick={handleAddMember} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add member
            </Button>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="animate-pulse">
                <div className="h-11 bg-muted border-b" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 border-b last:border-0 flex items-center px-4 gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : members.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No team members found</EmptyTitle>
                <EmptyDescription>
                  {debouncedSearch
                    ? `No members match "${debouncedSearch}"`
                    : 'Get started by adding your first team member'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={handleAddMember} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Add member
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <TeamMembersTable
              members={members}
              roles={roles}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {/* Pagination */}
          {!isLoading && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {members.length} of {pagination.total} members
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(pagination.pages, 3) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="cursor-pointer w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasMore}
                  onClick={() => handlePageChange(page + 1)}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageContent>

      {/* Add/Edit Member Dialog */}
      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        member={selectedMember}
        roles={roles}
        onSubmit={handleSubmitMember}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMemberDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        member={selectedMember}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
