/**
 * Client Card Component
 *
 * Displays client information in the project overview.
 * Two states:
 * 1. No client - Shows empty state with "Add Client" button
 * 2. Has client - Shows client info with Edit button
 */

import { useState } from 'react';
import { PencilSimple, Plus, Phone, MapPin } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectClientDialog } from './SelectClientDialog';
import type { Project } from '@/lib/api/projects';

// ============================================
// Types
// ============================================

interface ClientCardProps {
  project: Project;
  onClientUpdated?: () => void;
}

// ============================================
// Helper Functions
// ============================================

function getInitials(name: string): string {
  if (!name?.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================
// Component
// ============================================

export function ClientCard({ project, onClientUpdated }: ClientCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasClient = !!project.client;

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = (updated?: boolean) => {
    setIsDialogOpen(false);
    if (updated && onClientUpdated) {
      onClientUpdated();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Client</CardTitle>
          {hasClient && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 cursor-pointer"
              onClick={handleOpenDialog}
            >
              <PencilSimple className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {hasClient ? (
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                {getInitials(project.client!.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{project.client!.name}</div>
                {project.client!.phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{project.client!.phone}</span>
                  </div>
                )}
                {project.client!.location && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{project.client!.location}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">No client assigned</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDialog}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SelectClientDialog open={isDialogOpen} onOpenChange={handleDialogClose} project={project} />
    </>
  );
}
