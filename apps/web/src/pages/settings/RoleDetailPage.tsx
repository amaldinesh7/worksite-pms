/**
 * Role Detail Page
 *
 * Page for viewing, creating or editing a role with permissions.
 * Features:
 * - View mode (read-only) by default when viewing existing role
 * - Edit mode when creating new role or clicking Edit button
 * - Role name and description form
 * - Permissions editor with grouped checkboxes
 * - Select all functionality per category
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Pencil } from 'lucide-react';

import { PageContent, Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useRole, useCreateRole, useUpdateRole } from '@/lib/hooks/useRoles';
import { usePermissionsGrouped } from '@/lib/hooks/usePermissions';
import type { CreateRoleInput, UpdateRoleInput } from '@/lib/api/roles';

// ============================================
// Component
// ============================================

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewRole = id === 'new';

  // Edit mode state - new roles start in edit mode, existing roles start in view mode
  const [isEditMode, setIsEditMode] = useState(isNewRole);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Queries
  const { data: role, isLoading: isLoadingRole } = useRole(isNewRole ? '' : id || '');
  const { data: permissionsGrouped, isLoading: isLoadingPermissions } = usePermissionsGrouped();

  // Mutations
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  // Initialize form from role data
  useEffect(() => {
    if (role && !isNewRole) {
      setName(role.name);
      setDescription(role.description || '');
      const permIds = new Set(role.permissions.map((p) => p.id));
      setSelectedPermissionIds(permIds);
      setHasChanges(false);
    }
  }, [role, isNewRole]);

  // Track changes
  const originalPermissionIds = useMemo(() => {
    if (!role || isNewRole) return new Set<string>();
    return new Set(role.permissions.map((p) => p.id));
  }, [role, isNewRole]);

  useEffect(() => {
    if (isNewRole) {
      setHasChanges(name.trim().length > 0);
      return;
    }

    if (!role) return;

    const nameChanged = name !== role.name;
    const descChanged = description !== (role.description || '');
    const permissionsChanged =
      selectedPermissionIds.size !== originalPermissionIds.size ||
      [...selectedPermissionIds].some((permId) => !originalPermissionIds.has(permId));

    setHasChanges(nameChanged || descChanged || permissionsChanged);
  }, [name, description, selectedPermissionIds, originalPermissionIds, role, isNewRole]);

  // Handlers
  const handleBack = useCallback(() => {
    navigate('/settings/roles');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    if (isNewRole) {
      navigate('/settings/roles');
    } else {
      // Reset form and exit edit mode
      if (role) {
        setName(role.name);
        setDescription(role.description || '');
        const permIds = new Set(role.permissions.map((p) => p.id));
        setSelectedPermissionIds(permIds);
      }
      setIsEditMode(false);
      setHasChanges(false);
    }
  }, [isNewRole, navigate, role]);

  const handleEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handlePermissionToggle = useCallback(
    (permissionId: string) => {
      if (!isEditMode) return;
      setSelectedPermissionIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(permissionId)) {
          newSet.delete(permissionId);
        } else {
          newSet.add(permissionId);
        }
        return newSet;
      });
    },
    [isEditMode]
  );

  const handleSelectAllInCategory = useCallback(
    (category: string) => {
      if (!isEditMode || !permissionsGrouped) return;
      const permissions = permissionsGrouped[category] || [];
      const allSelected = permissions.every((p) => selectedPermissionIds.has(p.id));

      setSelectedPermissionIds((prev) => {
        const newSet = new Set(prev);
        if (allSelected) {
          // Deselect all
          permissions.forEach((p) => newSet.delete(p.id));
        } else {
          // Select all
          permissions.forEach((p) => newSet.add(p.id));
        }
        return newSet;
      });
    },
    [isEditMode, permissionsGrouped, selectedPermissionIds]
  );

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      if (isNewRole) {
        const data: CreateRoleInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          permissionIds: [...selectedPermissionIds],
        };
        await createMutation.mutateAsync(data);
        toast.success('Role created successfully');
        navigate('/settings/roles');
      } else if (id) {
        const data: UpdateRoleInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          permissionIds: [...selectedPermissionIds],
        };
        await updateMutation.mutateAsync({ id, data });
        toast.success('Role updated successfully');
        setIsEditMode(false);
        setHasChanges(false);
      }
    } catch {
      toast.error(isNewRole ? 'Failed to create role' : 'Failed to update role');
    }
  }, [
    isNewRole,
    id,
    name,
    description,
    selectedPermissionIds,
    createMutation,
    updateMutation,
    navigate,
  ]);

  const isLoading = (!isNewRole && isLoadingRole) || isLoadingPermissions;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const categories = permissionsGrouped ? Object.keys(permissionsGrouped).sort() : [];

  if (isLoading) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Roles & Permissions', href: '/settings/roles' },
            { label: 'Loading...' },
          ]}
        />
        <PageContent>
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-24 bg-gray-200 rounded" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-48 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </PageContent>
      </>
    );
  }

  if (!isNewRole && !role) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: 'Roles & Permissions', href: '/settings/roles' },
            { label: 'Not Found' },
          ]}
        />
        <PageContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <Typography variant="muted" className="mb-4">
              Role not found
            </Typography>
            <Button variant="outline" onClick={handleBack} className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roles
            </Button>
          </div>
        </PageContent>
      </>
    );
  }

  // Determine the breadcrumb label
  const getBreadcrumbLabel = () => {
    if (isNewRole) return 'New Role';
    return role?.name || 'Role Details';
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Roles & Permissions', href: '/settings/roles' },
          { label: getBreadcrumbLabel() },
        ]}
      />

      <PageContent>
        <div className="space-y-6">
          {/* Sub-header with back button and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="cursor-pointer h-5 w-5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium">
                {isNewRole
                  ? 'Create a new role'
                  : isEditMode
                    ? `Edit ${role?.name}`
                    : role?.name || 'Role Details'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleEdit} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Role Details Card */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-base font-semibold mb-4">Role Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role name{isEditMode && '*'}</Label>
                {isEditMode ? (
                  <Input
                    id="role-name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={role?.isSystemRole}
                  />
                ) : (
                  <p className="text-sm py-2">{name || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                {isEditMode ? (
                  <Input
                    id="role-description"
                    placeholder="Describe the services or products this vendor provides..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                ) : (
                  <p className="text-sm py-2 text-muted-foreground">
                    {description || 'No description'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Card */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Permissions</h3>
              <Typography variant="muted" className="text-sm">
                {isEditMode
                  ? 'Select the permissions this role should have access to'
                  : 'Permissions assigned to this role'}
              </Typography>
            </div>

            <div className="space-y-6">
              {categories.map((category) => {
                const permissions = permissionsGrouped?.[category] || [];
                const selectedCount = permissions.filter((p) =>
                  selectedPermissionIds.has(p.id)
                ).length;
                const isAllSelected = selectedCount === permissions.length;
                const isSomeSelected = selectedCount > 0 && selectedCount < permissions.length;

                return (
                  <div key={category} className="space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-medium">{category}</h4>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleSelectAllInCategory(category)}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) {
                                (
                                  el as HTMLButtonElement & { indeterminate: boolean }
                                ).indeterminate = isSomeSelected;
                              }
                            }}
                            className="cursor-pointer"
                            onCheckedChange={() => handleSelectAllInCategory(category)}
                          />
                          <span>Select all</span>
                        </button>
                      )}
                    </div>

                    {/* Permission Items */}
                    <div className="space-y-3 pl-1">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissionIds.has(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                            disabled={!isEditMode}
                            className={isEditMode ? 'mt-0.5 cursor-pointer' : 'mt-0.5'}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={permission.id}
                              className={`text-sm font-medium ${isEditMode ? 'cursor-pointer' : ''}`}
                            >
                              {permission.name}
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
