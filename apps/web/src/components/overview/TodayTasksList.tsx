/**
 * Today's Tasks List Component
 * Displays tasks that are in progress or not started with assignees
 */

import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TodayTask } from '@/lib/api/overview';

interface TodayTasksListProps {
  data: TodayTask[];
  isLoading?: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'NOT_STARTED':
      return 'Not Started';
    default:
      return status;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TodayTasksList({ data, isLoading }: TodayTasksListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mb-2 text-emerald-500/50" />
            <p>All caught up!</p>
            <p className="text-sm">No pending tasks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
          <Badge variant="secondary" className="font-normal">
            {data.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
          {data.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/projects/${task.projectId}`)}
            >
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(task.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{task.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {task.projectName} • {task.stageName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={task.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                    className="text-xs h-5"
                  >
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
              </div>
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((assignee, idx) => (
                  <Avatar
                    key={assignee.id}
                    className={cn('h-7 w-7 border-2 border-background', idx > 0 && '-ml-2')}
                  >
                    {assignee.avatar ? (
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    ) : null}
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 3 && (
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted">
                      +{task.assignees.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
                {task.assignees.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 pt-0">
        <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/projects')}>
          View All Tasks
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
