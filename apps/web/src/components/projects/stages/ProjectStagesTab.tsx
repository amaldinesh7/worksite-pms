/**
 * ProjectStagesTab Component
 *
 * Main container for the Stages tab showing either:
 * 1. A vertical list of stage items (default view)
 * 2. Stage detail view with tasks (when a stage is selected)
 */

import * as React from 'react';
import { format, differenceInDays, differenceInCalendarDays } from 'date-fns';
import {
  Plus,
  Layers,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Clock,
  Users,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStagesByProject, useDeleteStage, useStage, useStageStats } from '@/lib/hooks/useStages';
import { useTasksByStage, useDeleteTask, useUpdateTaskStatus } from '@/lib/hooks/useTasks';
import type { Stage, StageStatus } from '@/lib/api/stages';
import type { Task, TaskStatus } from '@/lib/api/tasks';
import { StageCard } from './StageCard';
import { StageFormDialog } from './StageFormDialog';
import { TaskFormDialog } from './TaskFormDialog';

// ============================================
// Types
// ============================================

interface ProjectStagesTabProps {
  projectId: string;
}

type SortOption = 'latest' | 'oldest' | 'name' | 'budget';

// ============================================
// Status Configs
// ============================================

const stageStatusConfig: Record<
  StageStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  SCHEDULED: { label: 'Scheduled', variant: 'outline' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  ON_HOLD: { label: 'On Hold', variant: 'destructive' },
};

const taskStatusConfig: Record<
  TaskStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  NOT_STARTED: { label: 'Pending', variant: 'outline' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  ON_HOLD: { label: 'On Hold', variant: 'outline' },
  BLOCKED: { label: 'Blocked', variant: 'destructive' },
};

// ============================================
// Helper Functions
// ============================================

function formatBudget(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount}`;
}

function formatDuration(days: number): string {
  const weeks = Math.round(days / 7);
  if (weeks >= 1) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// Task Row Component
// ============================================

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function TaskRow({ task, onEdit, onDelete, onStatusChange }: TaskRowProps) {
  const { label, variant } = taskStatusConfig[task.status];
  const isCompleted = task.status === 'COMPLETED';

  const assignedMembers = task.memberAssignments || [];
  const assignedParties = task.partyAssignments || [];
  const totalAssigned = assignedMembers.length + assignedParties.length;

  const displayedMembers = assignedMembers.slice(0, 3);
  const remainingCount = totalAssigned - 3;

  const handleCheckboxChange = () => {
    if (isCompleted) {
      onStatusChange(task, 'NOT_STARTED');
    } else {
      onStatusChange(task, 'COMPLETED');
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleCheckboxChange}
          className="h-5 w-5 cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{task.name}</h4>
            <Badge variant={variant}>{label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{task.daysAllocated} days allocated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Assigned to: {totalAssigned}</span>
            </div>
          </div>
        </div>

        {totalAssigned > 0 && (
          <div className="flex items-center gap-2">
            {displayedMembers.length <= 2 ? (
              displayedMembers.map((assignment) => {
                const memberName = assignment.member?.user?.name || 'Unknown';
                const roleName = assignment.member?.role?.name || 'Labour';
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
                  >
                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium overflow-hidden">
                      <span className="text-gray-600">{getInitials(memberName)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">{memberName}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {roleName}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {displayedMembers.map((assignment) => {
                    const memberName = assignment.member?.user?.name || 'Unknown';
                    return (
                      <div
                        key={assignment.id}
                        className="h-8 w-8 rounded-full bg-gray-200 border-2 border-background flex items-center justify-center text-xs font-medium"
                        title={memberName}
                      >
                        <span className="text-gray-600">{getInitials(memberName)}</span>
                      </div>
                    );
                  })}
                </div>
                {remainingCount > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">+{remainingCount}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task)}
            className="cursor-pointer"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(task)}
            className="cursor-pointer"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// Stage Detail View Component
// ============================================

interface StageDetailViewProps {
  stageId: string;
  onBack: () => void;
}

function StageDetailView({ stageId, onBack }: StageDetailViewProps) {
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  const { data: stage, isLoading: isStageLoading } = useStage(stageId);
  const { data: stats } = useStageStats(stageId);
  const { data: tasks, isLoading: isTasksLoading } = useTasksByStage(stageId);

  const deleteTask = useDeleteTask();
  const updateTaskStatus = useUpdateTaskStatus();

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    if (filterStatus === 'all') return tasks;
    return tasks.filter((task) => task.status === filterStatus);
  }, [tasks, filterStatus]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      await updateTaskStatus.mutateAsync({ id: task.id, status });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask.mutateAsync({
        id: deletingTask.id,
        stageId: stageId,
      });
      setDeletingTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  if (isStageLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          <Card className="p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-5 w-5 rounded bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Stage not found</p>
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          Go back to Stages
        </Button>
      </div>
    );
  }

  const { label, variant } = stageStatusConfig[stage.status];
  const startDate = new Date(stage.startDate);
  const endDate = new Date(stage.endDate);
  const isValidStart = !isNaN(startDate.getTime());
  const isValidEnd = !isNaN(endDate.getTime());

  // Validate dates and clamp duration to prevent negative values
  const duration =
    isValidStart && isValidEnd ? Math.max(0, differenceInDays(endDate, startDate)) : 0;
  const daysRemaining = isValidEnd
    ? Math.max(0, differenceInCalendarDays(endDate, new Date()))
    : null;
  const progressValue = stats?.taskProgress || 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header: Back Arrow + Stage Name + Status Badge */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="cursor-pointer h-8 w-8 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{stage.name}</h2>
          <Badge variant={variant}>{label}</Badge>
        </div>

        {/* Stage Info Card */}
        <Card className="p-6">
          <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="col-span-1">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{stage.description || 'No description provided.'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <p className="font-medium">{format(startDate, 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">End Date</p>
              <p className="font-medium">{format(endDate, 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{formatDuration(duration)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Budget</p>
              <p className="font-medium">{formatBudget(Number(stage.budgetAmount))}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress: {progressValue}%</span>
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className="text-muted-foreground">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              )}
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </Card>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks ({tasks?.length || 0})</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All tasks
                    </SelectItem>
                    <SelectItem value="NOT_STARTED" className="cursor-pointer">
                      Pending
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className="cursor-pointer">
                      In Progress
                    </SelectItem>
                    <SelectItem value="COMPLETED" className="cursor-pointer">
                      Completed
                    </SelectItem>
                    <SelectItem value="ON_HOLD" className="cursor-pointer">
                      On Hold
                    </SelectItem>
                    <SelectItem value="BLOCKED" className="cursor-pointer">
                      Blocked
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTask} className="cursor-pointer">
                Add task
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-520px)]">
            <div className="space-y-3 pr-4">
              {isTasksLoading ? (
                <>
                  <Card className="p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                </>
              ) : filteredTasks.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Break down this stage into individual tasks to track progress more granularly.
                  </p>
                  <Button onClick={handleAddTask} className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Task
                  </Button>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <TaskFormDialog
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        stageId={stageId}
        task={editingTask}
      />

      <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTask?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function StageCardSkeleton() {
  return (
    <div className="py-6 border-b animate-pulse">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
            <div className="h-6 bg-muted rounded w-20" />
          </div>
          <div className="flex gap-8">
            <div className="h-10 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-20" />
            <div className="h-10 bg-muted rounded w-16" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-8 bg-muted rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Empty State
// ============================================

function EmptyState({ onAddStage }: { onAddStage: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Layers className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No stages yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Break down your project into manageable stages to track progress, budget, and team
        assignments.
      </p>
      <Button onClick={onAddStage} className="cursor-pointer">
        <Plus className="mr-2 h-4 w-4" />
        Add First Stage
      </Button>
    </Card>
  );
}

// ============================================
// Stages List View Component
// ============================================

interface StagesListViewProps {
  stages: Stage[];
  onAddStage: () => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stage: Stage) => void;
  onViewTasks: (stage: Stage) => void;
}

function StagesListView({
  stages,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onViewTasks,
}: StagesListViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortOption>('latest');

  const filteredStages = React.useMemo(() => {
    let result = [...stages];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (stage) =>
          stage.name.toLowerCase().includes(query) ||
          stage.description?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'budget':
        result.sort((a, b) => Number(b.budgetAmount) - Number(a.budgetAmount));
        break;
    }

    return result;
  }, [stages, searchQuery, sortBy]);

  const stats = React.useMemo(() => {
    return {
      total: stages.length,
      active: stages.filter((s) => s.status === 'IN_PROGRESS').length,
      completed: stages.filter((s) => s.status === 'COMPLETED').length,
    };
  }, [stages]);

  return (
    <div className="space-y-4">
      {/* Header with Search, Filters, Sort */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="cursor-pointer" disabled title="Filters coming soon">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-36 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest" className="cursor-pointer">
                  Last created
                </SelectItem>
                <SelectItem value="oldest" className="cursor-pointer">
                  First created
                </SelectItem>
                <SelectItem value="name" className="cursor-pointer">
                  Name
                </SelectItem>
                <SelectItem value="budget" className="cursor-pointer">
                  Budget
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onAddStage} className="cursor-pointer">
            Create stage
          </Button>
        </div>
      </div>

      {/* Stages Card Container */}
      <Card>
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-muted-foreground">
            Total Stages: {stats.total} • Active: {stats.active} • Completed: {stats.completed}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <CardContent className="px-6 py-0">
            {filteredStages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <p className="text-muted-foreground">No stages found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredStages.map((stage, index) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  onEdit={onEditStage}
                  onDelete={onDeleteStage}
                  onViewTasks={onViewTasks}
                  isLast={index === filteredStages.length - 1}
                />
              ))
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ProjectStagesTab({ projectId }: ProjectStagesTabProps) {
  const [selectedStageId, setSelectedStageId] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingStage, setEditingStage] = React.useState<Stage | null>(null);
  const [deletingStage, setDeletingStage] = React.useState<Stage | null>(null);

  const { data: stages, isLoading, error } = useStagesByProject(projectId);
  const deleteStage = useDeleteStage();

  const handleAddStage = () => {
    setEditingStage(null);
    setIsFormOpen(true);
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setIsFormOpen(true);
  };

  const handleDeleteStage = (stage: Stage) => {
    setDeletingStage(stage);
  };

  const handleViewTasks = (stage: Stage) => {
    setSelectedStageId(stage.id);
  };

  const handleBackToList = () => {
    setSelectedStageId(null);
  };

  const confirmDelete = async () => {
    if (!deletingStage) return;
    try {
      await deleteStage.mutateAsync({
        id: deletingStage.id,
        projectId: deletingStage.projectId,
      });
      setDeletingStage(null);
    } catch (error) {
      console.error('Failed to delete stage:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStage(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 bg-muted rounded w-64 animate-pulse" />
            <div className="h-10 bg-muted rounded w-24 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-muted rounded w-44 animate-pulse" />
            <div className="h-10 bg-muted rounded w-28 animate-pulse" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <StageCardSkeleton />
            <StageCardSkeleton />
            <StageCardSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p className="text-destructive mb-4">Failed to load stages</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="cursor-pointer"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  // Empty state
  if (!stages || stages.length === 0) {
    return (
      <>
        <EmptyState onAddStage={handleAddStage} />
        <StageFormDialog
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          projectId={projectId}
          stage={editingStage}
        />
      </>
    );
  }

  return (
    <>
      {selectedStageId ? (
        <StageDetailView stageId={selectedStageId} onBack={handleBackToList} />
      ) : (
        <StagesListView
          stages={stages}
          onAddStage={handleAddStage}
          onEditStage={handleEditStage}
          onDeleteStage={handleDeleteStage}
          onViewTasks={handleViewTasks}
        />
      )}

      {/* Form Dialog */}
      <StageFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        projectId={projectId}
        stage={editingStage}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingStage} onOpenChange={() => setDeletingStage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingStage?.name}"? This action cannot be undone
              and will also delete all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {deleteStage.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
