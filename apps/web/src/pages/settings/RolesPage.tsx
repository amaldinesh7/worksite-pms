/**
 * Roles & Permissions Page
 *
 * Main page for managing roles and permissions.
 * Features:
 * - Search bar and create role button
 * - List view of roles with member count and permissions count
 * - Click on role to view, delete action per role
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Shield, Users, Trash2 } from 'lucide-react';

import { PageContent, Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { DeleteRoleDialog } from '@/components/roles/DeleteRoleDialog';
import { useRoles, useDeleteRole } from '@/lib/hooks/useRoles';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Role } from '@/lib/api/roles';

// ============================================
// Component
// ============================================

export default function RolesPage() {
  const navigate = useNavigate();

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Queries
  const { data: rolesData, isLoading } = useRoles({ limit: 50 });

  // Mutations
  const deleteMutation = useDeleteRole();

  // Filter roles by search
  const roles = rolesData?.items || [];
  const filteredRoles = debouncedSearch
    ? roles.filter((role) =>
      role.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : roles;

  // Handlers
  const handleCreateRole = useCallback(() => {
    navigate('/settings/roles/new');
  }, [navigate]);

  const handleViewRole = useCallback(
    (role: Role) => {
      navigate(`/settings/roles/${role.id}`);
    },
    [navigate]
  );

  const handleDeleteRole = useCallback((e: React.MouseEvent, role: Role) => {
    e.stopPropagation(); // Prevent row click
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRole) return;

    try {
      await deleteMutation.mutateAsync(selectedRole.id);
      toast.success('Role deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch {
      toast.error('Failed to delete role');
    }
  }, [selectedRole, deleteMutation]);

  return (
    <>
      <Header
        title="Roles & Permissions"
        subtitle="Manage roles and configure permissions for your team members"
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
                placeholder="Search roles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Create Role Button */}
            <Button onClick={handleCreateRole} className="cursor-pointer">
              Create role
            </Button>
          </div>

          {/* Roles List */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card animate-pulse"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredRoles.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Shield className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No roles found</EmptyTitle>
                <EmptyDescription>
                  {debouncedSearch
                    ? `No roles match "${debouncedSearch}"`
                    : 'Get started by creating your first role'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={handleCreateRole} className="cursor-pointer">
                  Create role
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleViewRole(role)}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Shield className="h-5 w-5" />
                  </div>

                  {/* Role Name */}
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="font-medium">{role.name}</span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{role.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      <span>{role.permissions.length} permissions</span>
                    </div>
                  </div>

                  {/* Delete Action (only for non-system roles) */}
                  {!role.isSystemRole && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteRole(e, role)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContent>

      {/* Delete Confirmation Dialog */}
      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        role={selectedRole}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
