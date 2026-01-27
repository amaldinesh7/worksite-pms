/**
 * TaskCard Component
 *
 * Displays a single task item with status, days allocated, and assignments.
 */

import { Clock, MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task, TaskStatus } from '@/lib/api/tasks';

// ============================================
// Types
// ============================================

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

// ============================================
// Status Badge Config
// ============================================

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
> = {
  NOT_STARTED: { label: 'To Do', variant: 'outline' },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-blue-500 hover:bg-blue-600',
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'secondary',
    className: 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
  },
  ON_HOLD: { label: 'On Hold', variant: 'outline', className: 'border-amber-500 text-amber-700' },
  BLOCKED: { label: 'Blocked', variant: 'destructive' },
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'BLOCKED', label: 'Blocked' },
];

// ============================================
// Helper Functions
// ============================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// Component
// ============================================

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const { label, variant, className } = statusConfig[task.status];

  // Get assigned members (max 3 displayed)
  const assignedMembers = task.memberAssignments.slice(0, 3);
  const remainingMembersCount = task.memberAssignments.length - 3;

  // Get assigned parties (labour/subcontractors)
  const assignedParties = task.partyAssignments;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{task.name}</h4>
          <Badge variant={variant} className={cn('shrink-0', className)}>
            {label}
          </Badge>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {task.daysAllocated} {task.daysAllocated === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Assigned Members */}
          {assignedMembers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <div className="flex -space-x-1.5">
                {assignedMembers.map((assignment) => {
                  const memberName = assignment.member?.user?.name || 'Unknown';
                  return (
                    <div
                      key={assignment.id}
                      className="h-5 w-5 rounded-full bg-primary/10 border border-background flex items-center justify-center text-[10px] font-medium text-primary"
                      title={memberName}
                    >
                      {getInitials(memberName)}
                    </div>
                  );
                })}
                {remainingMembersCount > 0 && (
                  <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center text-[10px] font-medium">
                    +{remainingMembersCount}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned Parties */}
          {assignedParties.length > 0 && (
            <div className="flex items-center gap-1">
              {assignedParties.slice(0, 2).map((assignment) => (
                <Badge key={assignment.id} variant="outline" className="text-xs py-0 h-5">
                  {assignment.party.type === 'LABOUR' ? '👷' : '🏗️'} {assignment.party.name}
                </Badge>
              ))}
              {assignedParties.length > 2 && (
                <span className="text-xs">+{assignedParties.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Status Change Options */}
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Change Status</div>
          {statusOptions
            .filter((opt) => opt.value !== task.status)
            .map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onStatusChange(task, option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(task)}
            className="text-destructive cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
