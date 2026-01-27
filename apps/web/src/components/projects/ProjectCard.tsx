/**
 * Project Card Component
 *
 * Displays a project in a card format with image, details, progress, and team members.
 * Includes a 3-dot menu for edit/delete actions.
 */

import { Building2, MoreVertical, Pencil, Trash2, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';
import type { Project } from '@/lib/api/projects';

// ============================================
// Types
// ============================================

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onClick?: (project: Project) => void;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number | null): string {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================
// Component
// ============================================

export function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  const members = project.projectAccess || [];
  const displayedMembers = members.slice(0, 3);
  const remainingCount = members.length - 3;

  const handleCardClick = () => {
    if (onClick) {
      onClick(project);
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={handleCardClick}
    >
      {/* Status Badge Overlay */}
      {project.status === 'ON_HOLD' && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            On Hold
          </Badge>
        </div>
      )}

      {/* 3-Dot Menu */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-card/80 hover:bg-card cursor-pointer"
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
      </div>

      {/* Project Image */}
      <div className="h-32 bg-muted flex items-center justify-center">
        {project.projectPicture ? (
          <img
            src={project.projectPicture}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title and Type */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <Typography variant="paragraph-small" className="font-semibold line-clamp-1">
              {project.name}
            </Typography>
            <Badge variant="outline" className="shrink-0 text-xs">
              {project.projectType?.name || 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Budget and Start Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Budget: {formatCurrency(project.amount)}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Started: {formatDate(project.startDate)}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <Typography variant="muted" className="text-xs">
              Progress
            </Typography>
            <Typography variant="paragraph-small">{project.progress || 0}%</Typography>
          </div>
          <Progress value={project.progress || 0} className="h-1.5" />
        </div>

        {/* Team Members and View Details */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {displayedMembers.length > 0 ? (
              <>
                <div className="flex -space-x-2">
                  {displayedMembers.map((access) => (
                    <div
                      key={access.id}
                      className="h-7 w-7 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-xs font-medium text-primary"
                      title={access.member?.user?.name || 'Unknown'}
                    >
                      {access.member?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  ))}
                </div>
                {remainingCount > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">+{remainingCount}</span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>No members</span>
              </div>
            )}
          </div>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick(project);
            }}
          >
            View Details →
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
