/**
 * Project Overview Tab
 *
 * Displays project overview with:
 * - Project Financials card (budget and expenses progress)
 * - Current Tasks section (in-progress and upcoming tasks)
 * - Project Stages section
 * - Timeline card (days left, progress percentage)
 * - Client card
 * - Project Details card (with assignees)
 */

import { differenceInDays, format } from 'date-fns';
import { Calendar, CheckCircle, Clock, PencilSimple, CircleNotch } from '@phosphor-icons/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStagesByProject } from '@/lib/hooks/useStages';
import { useTasksByProject } from '@/lib/hooks/useTasks';
import { ClientCard } from './ClientCard';
import type { Project, ProjectStats } from '@/lib/api/projects';
import type { Stage, StageStatus } from '@/lib/api/stages';
import type { Task, TaskStatus } from '@/lib/api/tasks';

// ============================================
// Types
// ============================================

interface ProjectOverviewTabProps {
  project: Project;
  stats: ProjectStats | undefined;
  isStatsLoading: boolean;
  onNavigateToStages?: () => void;
  onRefreshProject?: () => void;
  onEditProject?: () => void;
}

// ============================================
// Helper Functions
// ============================================

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `₹${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString()}`;
}

function getProjectStatusBadge(status: Project['status']) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          In Progress
        </Badge>
      );
    case 'ON_HOLD':
      return (
        <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          On Hold
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ============================================
// Sub Components
// ============================================

function ProjectFinancialsCard({
  project,
  stats,
  isLoading,
}: {
  project: Project;
  stats: ProjectStats | undefined;
  isLoading: boolean;
}) {
  const projectAmount = project.amount || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const totalPaymentsIn = stats?.totalPaymentsIn || 0;
  const balance = stats?.balance || 0;

  const budgetProgress =
    projectAmount > 0 ? Math.min((totalPaymentsIn / projectAmount) * 100, 100) : 0;
  const expensesProgress =
    projectAmount > 0 ? Math.min((totalExpenses / projectAmount) * 100, 100) : 0;

  const pendingAmount = projectAmount - totalPaymentsIn;
  const creditAmount = balance;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-neutral-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-20 bg-neutral-100 rounded animate-pulse" />
          <div className="h-20 bg-neutral-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Project Financials</CardTitle>
        <div className="text-right">
          <span
            className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(balance)}
          </span>
          <span className="text-sm text-muted-foreground ml-2">Balance in Hand</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{Math.round(budgetProgress)}%</span>
          </div>
          <Progress value={budgetProgress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              <span className="text-green-600">{formatCurrency(totalPaymentsIn)}</span> Received /{' '}
              {formatCurrency(projectAmount)} Total
            </span>
            <span className="text-red-600">
              Pending: {formatCurrency(pendingAmount > 0 ? pendingAmount : 0)}
            </span>
          </div>
        </div>

        {/* Expenses Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expenses</span>
            <span className="font-medium">{Math.round(expensesProgress)}%</span>
          </div>
          <Progress value={expensesProgress} className="h-2 [&>div]:bg-orange-500" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              <span className="text-red-600">{formatCurrency(totalExpenses)}</span> Paid /{' '}
              {formatCurrency(projectAmount)} Total
            </span>
            <span className={creditAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
              Credit: {formatCurrency(creditAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineCard({ project }: { project: Project }) {
  const endDate = project.endDate ? new Date(project.endDate) : null;
  const today = new Date();

  const daysLeft = endDate ? differenceInDays(endDate, today) : null;

  const isOnTrack = daysLeft !== null && daysLeft > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Timeline</span>
          <Badge variant={isOnTrack ? 'default' : 'secondary'} className="text-xs">
            {isOnTrack ? 'On Track' : 'Delayed'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-5 w-5 cursor-pointer">
          <Calendar className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold">
            {daysLeft !== null ? `${Math.max(daysLeft, 0)} Days Left` : 'No deadline set'}
          </div>
          {endDate && (
            <p className="text-sm text-muted-foreground">
              Est. completion: {format(endDate, 'MMM yyyy')}
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm text-green-600">+5% this month</span>
          </div>
          <div className="text-3xl font-bold">{Math.round(project.progress || 0)}%</div>
          <p className="text-sm text-muted-foreground">
            {project._count?.expenses || 0} of 12 stages complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectStagesSection({
  projectId,
  onViewAll,
}: {
  projectId: string;
  onViewAll: () => void;
}) {
  const { data: stages = [], isLoading } = useStagesByProject(projectId);

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        );
      case 'ON_HOLD':
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            On Hold
          </Badge>
        );
      default:
        return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" weight="fill" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" weight="fill" />;
      case 'ON_HOLD':
        return <Clock className="h-5 w-5 text-orange-600" weight="fill" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-neutral-300" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Project Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Project Stages</CardTitle>
        <Button variant="link" className="text-sm cursor-pointer" onClick={onViewAll}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No stages created yet</p>
            <p className="text-sm">Add stages to track project progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stages.slice(0, 5).map((stage: Stage) => (
              <div
                key={stage.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {getStatusIcon(stage.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{stage.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(stage.startDate), 'MMM d')} -{' '}
                    {format(new Date(stage.endDate), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{formatCurrency(stage.budgetAmount)}</div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>
                {getStatusBadge(stage.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CurrentTasksSection({
  projectId,
  onViewAll,
}: {
  projectId: string;
  onViewAll: () => void;
}) {
  const { data: allTasks = [], isLoading } = useTasksByProject(projectId);

  // Get tasks: prioritize IN_PROGRESS, then NOT_STARTED
  const inProgressTasks = allTasks.filter((t) => t.status === 'IN_PROGRESS');
  const upcomingTasks = allTasks.filter((t) => t.status === 'NOT_STARTED');

  // Show up to 5 tasks: current ongoing first, then fill with upcoming
  const displayTasks: Task[] = [];
  displayTasks.push(...inProgressTasks.slice(0, 5));
  if (displayTasks.length < 5) {
    displayTasks.push(...upcomingTasks.slice(0, 5 - displayTasks.length));
  }

  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        );
      case 'NOT_STARTED':
        return <Badge variant="secondary">Not Started</Badge>;
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case 'ON_HOLD':
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            On Hold
          </Badge>
        );
      case 'BLOCKED':
        return (
          <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">
            Blocked
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTaskStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" weight="fill" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" weight="fill" />;
      case 'ON_HOLD':
      case 'BLOCKED':
        return <Clock className="h-5 w-5 text-orange-600" weight="fill" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-neutral-300" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Current Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Current Tasks</CardTitle>
        <Button variant="link" className="text-sm cursor-pointer" onClick={onViewAll}>
          View all tasks
        </Button>
      </CardHeader>
      <CardContent>
        {displayTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks in progress</p>
            <p className="text-sm">Tasks will appear here when added to stages</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {getTaskStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{task.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {task.stage?.name || 'Unknown stage'} • {task.daysAllocated} day
                    {task.daysAllocated > 1 ? 's' : ''} allocated
                  </div>
                </div>
                {/* Assignees */}
                {task.memberAssignments && task.memberAssignments.length > 0 && (
                  <div className="flex -space-x-2">
                    {task.memberAssignments.slice(0, 3).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border-2 border-background"
                        title={assignment.member.user.name}
                      >
                        {assignment.member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {task.memberAssignments.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                        +{task.memberAssignments.length - 3}
                      </div>
                    )}
                  </div>
                )}
                {getTaskStatusBadge(task.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectDetailsCard({ project, onEdit }: { project: Project; onEdit?: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Project Details</CardTitle>
        <Button variant="ghost" size="icon" className="h-5 w-5 cursor-pointer" onClick={onEdit}>
          <PencilSimple className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
          <div className="mt-1">{getProjectStatusBadge(project.status)}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Project Type</div>
          <div className="font-medium mt-1">{project.projectType?.name || 'N/A'}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
          <div className="font-medium mt-1">{project.location}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Assignees</div>
          {project.projectAccess && project.projectAccess.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.projectAccess.map((access) => (
                <div key={access.id} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {access.member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-medium text-sm">{access.member.user.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mt-1">No assignees</div>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</div>
          <div className="font-medium mt-1">
            {format(new Date(project.startDate), 'MMM d, yyyy')}
          </div>
        </div>

        {project.endDate && (
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Est. Completion
            </div>
            <div className="font-medium mt-1">
              {format(new Date(project.endDate), 'MMM d, yyyy')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function ProjectOverviewTab({
  project,
  stats,
  isStatsLoading,
  onNavigateToStages,
  onRefreshProject,
  onEditProject,
}: ProjectOverviewTabProps) {
  const handleViewAllStages = () => {
    if (onNavigateToStages) {
      onNavigateToStages();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Main Content */}
      <div className="col-span-8 space-y-6">
        {/* Project Financials */}
        <ProjectFinancialsCard project={project} stats={stats} isLoading={isStatsLoading} />

        {/* Current Tasks - Show before stages */}
        <CurrentTasksSection projectId={project.id} onViewAll={handleViewAllStages} />

        {/* Project Stages */}
        <ProjectStagesSection projectId={project.id} onViewAll={handleViewAllStages} />
      </div>

      {/* Right Column - Sidebar */}
      <div className="col-span-4 space-y-6">
        {/* Timeline */}
        <TimelineCard project={project} />

        {/* Client Card */}
        <ClientCard project={project} onClientUpdated={onRefreshProject} />

        {/* Project Details */}
        <ProjectDetailsCard project={project} onEdit={onEditProject} />
      </div>
    </div>
  );
}
