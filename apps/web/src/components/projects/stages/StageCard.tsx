/**
 * StageCard Component
 *
 * Displays a single stage as a list item with timeline, budget, progress, and team assignments.
 * This is a row item inside the stages list, not a standalone card.
 */

import { format, differenceInDays, differenceInCalendarDays } from 'date-fns';
import { CheckCircle, Clock, Settings, User, FileText, Pause, Edit } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Stage, StageStatus } from '@/lib/api/stages';

// ============================================
// Types
// ============================================

interface StageCardProps {
  stage: Stage;
  onEdit: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
  onViewTasks: (stage: Stage) => void;
  onHold?: (stage: Stage) => void;
  isLast?: boolean;
}

// ============================================
// Status Badge Config
// ============================================

const statusConfig: Record<
  StageStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof CheckCircle;
    iconClassName: string;
  }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    variant: 'outline',
    icon: Clock,
    iconClassName: 'text-muted-foreground',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'default',
    icon: Settings,
    iconClassName: 'text-primary',
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'secondary',
    icon: CheckCircle,
    iconClassName: 'text-green-600',
  },
  ON_HOLD: {
    label: 'On Hold',
    variant: 'destructive',
    icon: Pause,
    iconClassName: 'text-amber-600',
  },
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

// ============================================
// Component
// ============================================

export function StageCard({ stage, onEdit, onDelete, onViewTasks, onHold, isLast = false }: StageCardProps) {
  const { label, variant, icon: StatusIcon, iconClassName } = statusConfig[stage.status];
  const startDate = new Date(stage.startDate);
  const endDate = new Date(stage.endDate);
  const duration = differenceInDays(endDate, startDate);
  const taskCount = stage._count?.tasks || 0;
  const completedTaskCount = stage._count?.completedTasks || 0;

  // Calculate days remaining for in-progress stages
  const today = new Date();
  const daysRemaining = differenceInCalendarDays(endDate, today);

  // Calculate progress based on completed tasks or status
  const progressValue =
    stage.status === 'COMPLETED'
      ? 100
      : taskCount > 0
        ? Math.round((completedTaskCount / taskCount) * 100)
        : stage.status === 'IN_PROGRESS'
          ? 50
          : 0;

  // Get first assigned member name
  const firstMember = stage.memberAssignments[0];
  const memberName = firstMember?.member?.user?.name || null;

  const isInProgress = stage.status === 'IN_PROGRESS';
  const isCompleted = stage.status === 'COMPLETED';

  return (
    <div className={cn('py-6', !isLast && 'border-b')}>
      <div className="flex gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
            isCompleted ? 'bg-green-100' : isInProgress ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <StatusIcon className={cn('h-5 w-5', iconClassName)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-base">{stage.name}</h3>
              <Badge variant={variant}>{label}</Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isInProgress && onHold && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHold(stage)}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Pause className="mr-1.5 h-4 w-4" />
                  Hold
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(stage)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <Edit className="mr-1.5 h-4 w-4" />
                Edit stage
              </Button>
            </div>
          </div>

          {/* Description */}
          {stage.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {stage.description}
            </p>
          )}

          {/* Info Row */}
          <div className="flex items-center justify-between text-sm mb-4 w-[80%]">
            <div>
              <span className="text-muted-foreground">Start Date</span>
              <p className="font-medium">{format(startDate, 'MMM d, yyyy')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {isCompleted ? 'End Date' : 'Est. End Date'}
              </span>
              <p className="font-medium">{format(endDate, 'MMM d, yyyy')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration</span>
              <p className="font-medium">{formatDuration(duration)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Budget</span>
              <p className="font-medium">{formatBudget(Number(stage.budgetAmount))}</p>
            </div>
          </div>

          {/* Progress Bar (for in-progress stages) */}
          {isInProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Progress: {progressValue}%</span>
                {daysRemaining > 0 && (
                  <span className="text-muted-foreground">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                  </span>
                )}
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          )}

          {/* Footer Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {memberName && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{memberName}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>
                  {completedTaskCount}/{taskCount} Tasks
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewTasks(stage)}
              className="cursor-pointer"
            >
              View tasks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
