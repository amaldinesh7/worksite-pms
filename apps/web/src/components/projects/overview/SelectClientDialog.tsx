/**
 * Select Client Dialog
 *
 * Modal dialog for selecting or creating a client for a project.
 * Features:
 * - Searchable list of existing clients
 * - Option to create a new client inline
 * - Updates the project's clientId via the update API
 */

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MagnifyingGlass, Plus, Check, CircleNotch } from '@phosphor-icons/react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useClients, useCreateClient } from '@/lib/hooks/useClients';
import { useUpdateProject } from '@/lib/hooks/useProjects';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Project } from '@/lib/api/projects';
import type { Client } from '@/lib/api/clients';

// ============================================
// Schema for new client form
// ============================================

const newClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  phone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

// ============================================
// Types
// ============================================

interface SelectClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean, updated?: boolean) => void;
  project: Project;
}

type DialogMode = 'select' | 'create';

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

export function SelectClientDialog({ open, onOpenChange, project }: SelectClientDialogProps) {
  const [mode, setMode] = useState<DialogMode>('select');
  const [searchInput, setSearchInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(project.clientId);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Queries & Mutations
  const { data: clientsData, isLoading: isLoadingClients } = useClients({
    limit: 50, // Get more for selection
    search: debouncedSearch || undefined,
  });

  const createClientMutation = useCreateClient();
  const updateProjectMutation = useUpdateProject();

  // Form for creating new client
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
    },
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMode('select');
      setSearchInput('');
      setSelectedClientId(project.clientId);
      resetForm();
    }
  }, [open, project.clientId, resetForm]);

  // Handlers
  const handleSelectClient = useCallback((client: Client) => {
    setSelectedClientId(client.id);
  }, []);

  const handleConfirmSelection = useCallback(async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: { clientId: selectedClientId },
      });
      toast.success('Client updated successfully');
      onOpenChange(false, true);
    } catch {
      toast.error('Failed to update client');
    }
  }, [project.id, selectedClientId, updateProjectMutation, onOpenChange]);

  const handleRemoveClient = useCallback(async () => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: { clientId: null },
      });
      toast.success('Client removed from project');
      onOpenChange(false, true);
    } catch {
      toast.error('Failed to remove client');
    }
  }, [project.id, updateProjectMutation, onOpenChange]);

  const handleCreateClient = useCallback(
    async (data: NewClientFormData) => {
      try {
        const newClient = await createClientMutation.mutateAsync({
          name: data.name,
          phone: data.phone || undefined,
          location: data.location,
        });

        // Automatically select the new client
        setSelectedClientId(newClient.id);
        setMode('select');
        toast.success('Client created successfully');
      } catch {
        toast.error('Failed to create client');
      }
    },
    [createClientMutation]
  );

  const clients = clientsData?.items || [];
  const isSubmitting = updateProjectMutation.isPending || createClientMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'select' ? 'Select Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {mode === 'select'
              ? 'Choose an existing client or create a new one.'
              : 'Enter the details for the new client.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'select' ? (
          <>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Clients List */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <CircleNotch className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : clients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {debouncedSearch ? 'No clients found' : 'No clients yet'}
                </div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0',
                      selectedClientId === client.id && 'bg-primary/5'
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                      {getInitials(client.name)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">{client.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {client.location}
                      </div>
                    </div>
                    {selectedClientId === client.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Add New Client Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode('create')}
              className="w-full cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>

            <DialogFooter className="gap-2 sm:gap-0">
              {project.clientId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemoveClient}
                  disabled={isSubmitting}
                  className="cursor-pointer text-destructive hover:text-destructive"
                >
                  Remove Client
                </Button>
              )}
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSelection}
                disabled={isSubmitting || selectedClientId === project.clientId}
                className="cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(handleCreateClient)}>
            <div className="grid gap-4 py-4">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter client name"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" {...register('phone')} />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  {...register('location')}
                  aria-invalid={!!errors.location}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode('select');
                  resetForm();
                }}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
