/**
 * Client Projects Popover
 *
 * Shows a popover with the list of projects associated with a client.
 * Clicking on a project navigates to the project detail page.
 */

import { useNavigate } from 'react-router-dom';
import { FolderOpen, CaretRight, CircleNotch } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientProjects } from '@/lib/hooks/useClients';

// ============================================
// Types
// ============================================

interface ClientProjectsPopoverProps {
  clientId: string;
  projectsCount: number;
}

// ============================================
// Helper Functions
// ============================================

function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'ON_HOLD':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_HOLD':
      return 'On Hold';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
}

// ============================================
// Component
// ============================================

export function ClientProjectsPopover({ clientId, projectsCount }: ClientProjectsPopoverProps) {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useClientProjects(clientId);

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Don't show popover trigger if no projects
  if (projectsCount === 0) {
    return <span className="text-muted-foreground">0</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 font-medium text-primary hover:text-primary/80 hover:bg-primary/10 cursor-pointer"
        >
          {projectsCount}
          <CaretRight className="ml-1 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Projects ({projectsCount})</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <CircleNotch className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No projects found</div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0"
              >
                <div className="flex flex-col items-start gap-0.5 mr-2 min-w-0">
                  <span className="text-sm font-medium truncate w-full text-left">
                    {project.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full text-left">
                    {project.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getStatusBadgeVariant(project.status)} className="text-xs">
                    {getStatusLabel(project.status)}
                  </Badge>
                  <CaretRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
