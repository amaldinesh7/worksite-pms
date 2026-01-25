/**
 * Project Overview Tab
 *
 * Displays project overview with:
 * - Project Financials card (budget and expenses progress)
 * - Timeline card (days left, progress percentage)
 * - Project Stages section
 * - Project Details card
 * - Quick Links card
 */

import { differenceInDays, format } from 'date-fns';
import {
  Plus,
  Receipt,
  Upload,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  PencilSimple,
  CircleNotch,
} from '@phosphor-icons/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStagesByProject } from '@/lib/hooks/useStages';
import type { Project, ProjectStats } from '@/lib/api/projects';
import type { Stage, StageStatus } from '@/lib/api/stages';

// ============================================
// Types
// ============================================

interface ProjectOverviewTabProps {
  project: Project;
  stats: ProjectStats | undefined;
  isStatsLoading: boolean;
  onNavigateToStages?: () => void;
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

  const budgetProgress = projectAmount > 0 ? Math.min((totalPaymentsIn / projectAmount) * 100, 100) : 0;
  const expensesProgress = projectAmount > 0 ? Math.min((totalExpenses / projectAmount) * 100, 100) : 0;

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
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</span>
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
              <span className="text-green-600">{formatCurrency(totalPaymentsIn)}</span> Received / {formatCurrency(projectAmount)} Total
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
              <span className="text-red-600">{formatCurrency(totalExpenses)}</span> Paid / {formatCurrency(projectAmount)} Total
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
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
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

function ProjectStagesSection({ projectId, onViewAll }: { projectId: string; onViewAll: () => void }) {
  const { data: stages = [], isLoading } = useStagesByProject(projectId);

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'ON_HOLD':
        return <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100">On Hold</Badge>;
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
                    {format(new Date(stage.startDate), 'MMM d')} - {format(new Date(stage.endDate), 'MMM d, yyyy')}
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

function ProjectDetailsCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Project Details</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
          <PencilSimple className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
          <div className="font-medium mt-1">
            {project.status === 'ACTIVE' ? 'In Progress' : project.status}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Project Type</div>
          <div className="font-medium mt-1">{project.projectType?.name || 'N/A'}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
          <div className="font-medium mt-1">{project.location}</div>
        </div>

        {project.client && (
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Project Manager</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {project.client.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm">{project.client.name}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</div>
          <div className="font-medium mt-1">{format(new Date(project.startDate), 'MMM d, yyyy')}</div>
        </div>

        {project.endDate && (
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Est. Completion</div>
            <div className="font-medium mt-1">{format(new Date(project.endDate), 'MMM d, yyyy')}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickLinksCard() {
  const quickLinks = [
    { icon: Receipt, label: 'Add Expense', action: () => {} },
    { icon: Plus, label: 'Record Payment', action: () => {} },
    { icon: Upload, label: 'Upload Document', action: () => {} },
    { icon: FileText, label: 'Create Report', action: () => {} },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer text-left"
            >
              <link.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function ProjectOverviewTab({ project, stats, isStatsLoading, onNavigateToStages }: ProjectOverviewTabProps) {
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

        {/* Project Stages */}
        <ProjectStagesSection projectId={project.id} onViewAll={handleViewAllStages} />
      </div>

      {/* Right Column - Sidebar */}
      <div className="col-span-4 space-y-6">
        {/* Timeline */}
        <TimelineCard project={project} />

        {/* Project Details */}
        <ProjectDetailsCard project={project} />

        {/* Quick Links */}
        <QuickLinksCard />
      </div>
    </div>
  );
}
