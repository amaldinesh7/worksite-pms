/**
 * Projects Management Page
 *
 * Main page for managing projects.
 * Features:
 * - Single toolbar with search, status filter, sort, view toggle, and add button
 * - Grid/List view toggle
 * - Project cards (grid) or table (list) with CRUD actions
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Plus, LayoutGrid, List, FolderOpen } from 'lucide-react';

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
import {
  ProjectCard,
  ProjectFormDialog,
  DeleteProjectDialog,
  ProjectsTable,
} from '@/components/projects';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/lib/hooks/useProjects';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type {
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/lib/api/projects';
import { Typography } from '@/components/ui/typography';

// ============================================
// Constants
// ============================================

const PAGINATION_LIMIT = 12;

type StatusFilter = 'ALL' | ProjectStatus;

// ============================================
// Component
// ============================================

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get status filter from URL or default to ALL
  const statusFromUrl = searchParams.get('status') as StatusFilter | null;
  const isValidStatus =
    statusFromUrl && ['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].includes(statusFromUrl);
  const initialStatus: StatusFilter = isValidStatus ? statusFromUrl : 'ALL';

  // State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'startDate'>('updatedAt');

  // Debounced search value (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Sync URL when status filter changes
  useEffect(() => {
    const currentStatus = searchParams.get('status');
    if (currentStatus !== statusFilter) {
      setSearchParams({ status: statusFilter }, { replace: true });
    }
  }, [statusFilter, searchParams, setSearchParams]);

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Data Fetching
  const { data: projectsData, isLoading } = useProjects({
    page,
    limit: PAGINATION_LIMIT,
    search: debouncedSearch || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  // Mutations
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  // Handlers
  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
    setSearchInput('');
  }, []);

  const handleAddProject = useCallback(() => {
    setSelectedProject(null);
    setFormDialogOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setFormDialogOpen(true);
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  }, []);

  const handleViewProject = useCallback(
    (project: Project) => {
      navigate(`/projects/${project.id}`);
    },
    [navigate]
  );

  const handleFormSubmit = useCallback(
    async (data: CreateProjectInput | UpdateProjectInput) => {
      try {
        if (selectedProject) {
          await updateMutation.mutateAsync({
            id: selectedProject.id,
            data: data as UpdateProjectInput,
          });
          toast.success('Project updated successfully');
        } else {
          await createMutation.mutateAsync(data as CreateProjectInput);
          toast.success('Project created successfully');
        }
        setFormDialogOpen(false);
        setSelectedProject(null);
      } catch {
        toast.error(selectedProject ? 'Failed to update project' : 'Failed to create project');
      }
    },
    [selectedProject, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedProject) return;

    try {
      await deleteMutation.mutateAsync(selectedProject.id);
      toast.success('Project deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch {
      toast.error('Failed to delete project');
    }
  }, [selectedProject, deleteMutation]);

  // Derived State
  const projects = projectsData?.items ?? [];
  const counts = projectsData?.counts ?? { all: 0, active: 0, onHold: 0, completed: 0 };
  const pagination = projectsData?.pagination ?? {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  // Get count for current filter
  const getStatusLabel = (status: StatusFilter): string => {
    switch (status) {
      case 'ALL':
        return `All Projects (${counts.all})`;
      case 'ACTIVE':
        return `Active (${counts.active})`;
      case 'ON_HOLD':
        return `On Hold (${counts.onHold})`;
      case 'COMPLETED':
        return `Completed (${counts.completed})`;
      default:
        return 'All Projects';
    }
  };

  return (
    <>
      <Header title="Projects" />

      <PageContent>
        <div className="space-y-4">
          {/* Single Toolbar Row */}
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

            {/* Status Filter Dropdown */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue>{getStatusLabel(statusFilter)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">
                  All Projects ({counts.all})
                </SelectItem>
                <SelectItem value="ACTIVE" className="cursor-pointer">
                  Active ({counts.active})
                </SelectItem>
                <SelectItem value="ON_HOLD" className="cursor-pointer">
                  On Hold ({counts.onHold})
                </SelectItem>
                <SelectItem value="COMPLETED" className="cursor-pointer">
                  Completed ({counts.completed})
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <Typography variant="paragraph-small" as="span" className="text-muted-foreground">
                Sort by:
              </Typography>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
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
                  <SelectItem value="startDate" className="cursor-pointer">
                    Start Date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center border rounded-md bg-card">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="icon"
                className="rounded-r-none cursor-pointer"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="icon"
                className="rounded-l-none cursor-pointer"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Add Project Button */}
            <Button onClick={handleAddProject} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add project
            </Button>
          </div>

          {/* Projects Content */}
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
                    <div className="h-32 bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-2 bg-muted rounded w-full" />
                      <div className="flex justify-between">
                        <div className="h-6 bg-muted rounded w-16" />
                        <div className="h-6 bg-muted rounded w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-11 bg-muted border-b" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 border-b last:border-0 flex items-center px-4 gap-4"
                    >
                      <div className="h-10 w-10 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : projects.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpen className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No projects found</EmptyTitle>
                <EmptyDescription>
                  {debouncedSearch
                    ? `No projects match "${debouncedSearch}"`
                    : 'Get started by creating your first project'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={handleAddProject} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </Button>
              </EmptyContent>
            </Empty>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onClick={handleViewProject}
                />
              ))}
            </div>
          ) : (
            <ProjectsTable
              projects={projects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onClick={handleViewProject}
            />
          )}

          {/* Pagination */}
          {!isLoading && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {projects.length} of {pagination.total} projects
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
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
                      variant={page === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
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
                  onClick={() => setPage((p) => p + 1)}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageContent>

      {/* Form Dialog (Add/Edit) */}
      <ProjectFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        project={selectedProject}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={selectedProject}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
