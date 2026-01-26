/**
 * Projects Table Component
 *
 * Displays projects in a table format for list view.
 * Includes columns: Project, Status, Budget, Progress, Manager, Deadline, Actions
 */

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';
import type { Project } from '@/lib/api/projects';

// ============================================
// Types
// ============================================

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onClick?: (project: Project) => void;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number | null): string {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDeadline(endDate: string | null): { date: string; daysLeft: string } | null {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const date = formatDate(endDate);

  if (diffDays < 0) {
    return { date, daysLeft: `${Math.abs(diffDays)} days overdue` };
  } else if (diffDays === 0) {
    return { date, daysLeft: 'Due today' };
  } else if (diffDays === 1) {
    return { date, daysLeft: '1 day left' };
  } else if (diffDays < 7) {
    return { date, daysLeft: `${diffDays} days left` };
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return { date, daysLeft: `${weeks} week${weeks > 1 ? 's' : ''} left` };
  } else {
    const months = Math.floor(diffDays / 30);
    return { date, daysLeft: `${months} month${months > 1 ? 's' : ''} left` };
  }
}

function getStatusBadge(status: Project['status']) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          In Progress
        </Badge>
      );
    case 'ON_HOLD':
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
          On Hold
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
          Completed
        </Badge>
      );
    default:
      return null;
  }
}

// ============================================
// Component
// ============================================

export function ProjectsTable({ projects, onEdit, onDelete, onClick }: ProjectsTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const members = project.projectAccess || [];
            const manager = members[0]?.member?.user;
            const deadline = formatDeadline(project.endDate);

            return (
              <TableRow
                key={project.id}
                className={onClick ? 'cursor-pointer' : ''}
                onClick={() => onClick?.(project)}
              >
                {/* Project */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {project.projectPicture ? (
                        <img
                          src={project.projectPicture}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <Typography variant="paragraph-small" className="font-medium">{project.name}</Typography>
                      <Typography variant="muted" className="text-xs">
                        {project.projectType?.name || 'Unknown'}
                      </Typography>
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusBadge(project.status)}</TableCell>

                {/* Budget */}
                <TableCell>
                  <div>
                    <Typography variant="paragraph-small" className="font-medium">{formatCurrency(project.amount)}</Typography>
                    {project.amount && (
                      <Typography variant="muted" className="text-xs">
                        of {formatCurrency(project.amount)}
                      </Typography>
                    )}
                  </div>
                </TableCell>

                {/* Progress */}
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={project.progress || 0} className="h-2 flex-1" />
                    <Typography variant="paragraph-small" className="text-muted-foreground font-normal w-10 text-right">
                      {project.progress || 0}%
                    </Typography>
                  </div>
                </TableCell>

                {/* Manager */}
                <TableCell>
                  {manager ? (
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {manager.name.charAt(0).toUpperCase()}
                      </div>
                      <Typography variant="paragraph-small" className="font-normal">{manager.name}</Typography>
                    </div>
                  ) : (
                    <Typography variant="muted">—</Typography>
                  )}
                </TableCell>

                {/* Deadline */}
                <TableCell>
                  {deadline ? (
                    <div>
                      <Typography variant="paragraph-small" className="font-normal">{deadline.date}</Typography>
                      <Typography variant="muted" className="text-xs">{deadline.daysLeft}</Typography>
                    </div>
                  ) : (
                    <Typography variant="muted">—</Typography>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project);
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ProjectsTable;
