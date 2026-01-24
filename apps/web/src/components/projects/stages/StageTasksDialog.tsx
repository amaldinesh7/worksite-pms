/**
 * StageTasksDialog Component
 *
 * Dialog showing all tasks for a stage with ability to add/edit/delete tasks.
 */

import * as React from 'react';
import { format } from 'date-fns';
import { Plus, CalendarDays, DollarSign, Percent, ListTodo } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useTasksByStage, useDeleteTask, useUpdateTaskStatus } from '@/lib/hooks/useTasks';
import { useStageStats } from '@/lib/hooks/useStages';
import type { Stage, StageStatus } from '@/lib/api/stages';
import type { Task, TaskStatus } from '@/lib/api/tasks';
import { TaskCard } from './TaskCard';
import { TaskFormDialog } from './TaskFormDialog';

// ============================================
// Types
// ============================================

interface StageTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage;
}

// ============================================
// Status Badge Config
// ============================================

const statusConfig: Record<StageStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'outline' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  ON_HOLD: { label: 'On Hold', variant: 'destructive' },
};

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// Loading Skeleton
// ============================================

function TaskCardSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 rounded-lg border">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 bg-muted rounded w-40" />
          <div className="h-5 bg-muted rounded w-16" />
        </div>
        <div className="h-4 bg-muted rounded w-24" />
      </div>
      <div className="h-8 w-8 bg-muted rounded" />
    </div>
  );
}

// ============================================
// Empty State
// ============================================

function EmptyTasksState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <ListTodo className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No tasks yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Break down this stage into individual tasks to track progress more granularly.
      </p>
      <Button onClick={onAddTask} className="cursor-pointer">
        <Plus className="mr-2 h-4 w-4" />
        Add First Task
      </Button>
    </div>
  );
}

// ============================================
// Component
// ============================================

export function StageTasksDialog({ isOpen, onClose, stage }: StageTasksDialogProps) {
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null);

  // Fetch tasks and stats
  const { data: tasks, isLoading: isLoadingTasks } = useTasksByStage(stage.id);
  const { data: stats } = useStageStats(stage.id);

  // Mutations
  const deleteTask = useDeleteTask();
  const updateTaskStatus = useUpdateTaskStatus();

  const { label, variant } = statusConfig[stage.status];
  const startDate = new Date(stage.startDate);
  const endDate = new Date(stage.endDate);

  // Handlers
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
        stageId: deletingTask.stageId,
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl">{stage.name}</DialogTitle>
                {stage.description && (
                  <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                )}
              </div>
              <Badge variant={variant}>{label}</Badge>
            </div>
          </DialogHeader>

          {/* Stage Info */}
          <div className="grid grid-cols-4 gap-4 py-4 border-y">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Timeline</p>
                <p className="font-medium">
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Budget</p>
                <p className="font-medium">{formatCurrency(Number(stage.budgetAmount))}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium">{Number(stage.weight)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Tasks</p>
                <p className="font-medium">
                  {stats?.completedTaskCount || 0} / {stats?.taskCount || 0} completed
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          {stats && stats.taskCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Task Progress</span>
                <span className="font-medium">{stats.taskProgress}%</span>
              </div>
              <Progress value={stats.taskProgress} className="h-2" />
            </div>
          )}

          {/* Tasks Header */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="font-semibold">Tasks</h3>
            <Button size="sm" onClick={handleAddTask} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          {/* Tasks List */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2 pb-4">
              {isLoadingTasks ? (
                <>
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </>
              ) : !tasks || tasks.length === 0 ? (
                <EmptyTasksState onAddTask={handleAddTask} />
              ) : (
                tasks.map((task) => (
                  <TaskCard
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
        </DialogContent>
      </Dialog>

      {/* Task Form Dialog */}
      <TaskFormDialog
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        stageId={stage.id}
        task={editingTask}
      />

      {/* Delete Confirmation */}
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
