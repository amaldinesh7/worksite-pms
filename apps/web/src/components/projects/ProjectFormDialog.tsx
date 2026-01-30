/**
 * Project Form Dialog Component
 *
 * Modal dialog for creating and editing projects.
 * Includes image upload, date pickers, and member selection.
 */

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageIcon, X, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/custom/date-picker';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { cn } from '@/lib/utils';
import { useCategoryItems } from '@/lib/hooks/useCategories';
import { useTeamMembers } from '@/lib/hooks/useTeam';
import { useClients, useCreateClient } from '@/lib/hooks/useClients';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/lib/api/projects';

// ============================================
// Schema
// ============================================

const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  location: z.string().min(1, 'Location is required'),
  area: z.string().regex(/^\d*$/, 'Must be a number').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date().optional(),
  projectTypeItemId: z.string().min(1, 'Project type is required'),
  projectPicture: z.string().optional(),
  clientId: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

// Schema for inline client creation
const newClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  phone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

// ============================================
// Props
// ============================================

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
  isSubmitting: boolean;
}

// ============================================
// Component
// ============================================

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSubmitting,
}: ProjectFormDialogProps) {
  const isEditing = !!project;
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState<NewClientFormData>({
    name: '',
    phone: '',
    location: '',
  });
  const [newClientErrors, setNewClientErrors] = useState<Record<string, string>>({});

  // Fetch project types
  const { data: projectTypes = [], isLoading: isLoadingTypes } = useCategoryItems('project_type');

  // Fetch team members (fetch all with a high limit for selection)
  const { data: teamMembersData, isLoading: isLoadingMembers } = useTeamMembers({ limit: 100 });
  const teamMembers = teamMembersData?.items ?? [];

  // Fetch clients for selection
  const { data: clientsData, isLoading: isLoadingClients } = useClients({ limit: 100 });
  const clients = clientsData?.items ?? [];

  // Client creation mutation
  const createClientMutation = useCreateClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      location: '',
      area: '',
      amount: undefined,
      startDate: undefined,
      endDate: undefined,
      projectTypeItemId: '',
      projectPicture: '',
      clientId: '',
    },
  });

  const selectedClientId = watch('clientId');

  // Reset form when dialog opens/closes or project changes
  useEffect(() => {
    if (open) {
      if (project) {
        reset({
          name: project.name,
          location: project.location,
          area: project.area || '',
          amount: project.amount || undefined,
          startDate: project.startDate ? new Date(project.startDate) : undefined,
          endDate: project.endDate ? new Date(project.endDate) : undefined,
          projectTypeItemId: project.projectTypeItemId,
          projectPicture: project.projectPicture || '',
          clientId: project.clientId || '',
        });
        setImagePreview(project.projectPicture || null);
        setSelectedMembers(project.projectAccess?.map((a) => a.memberId) || []);
      } else {
        reset({
          name: '',
          location: '',
          area: '',
          amount: undefined,
          startDate: undefined,
          endDate: undefined,
          projectTypeItemId: '',
          projectPicture: '',
          clientId: '',
        });
        setImagePreview(null);
        setSelectedMembers([]);
      }
      setIsCreatingClient(false);
      setNewClientData({ name: '', phone: '', location: '' });
      setNewClientErrors({});
    }
  }, [open, project, reset]);

  const handleFormSubmit = (data: ProjectFormData) => {
    const submitData: CreateProjectInput | UpdateProjectInput = {
      name: data.name,
      location: data.location,
      area: data.area || undefined,
      amount: data.amount,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate?.toISOString(),
      projectTypeItemId: data.projectTypeItemId,
      projectPicture: data.projectPicture || undefined,
      memberIds: selectedMembers,
      clientId: data.clientId || undefined,
    };

    onSubmit(submitData);
  };

  // Handle creating a new client inline
  const handleCreateClient = async () => {
    // Validate new client data
    const result = newClientSchema.safeParse(newClientData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setNewClientErrors(fieldErrors);
      return;
    }

    try {
      const newClient = await createClientMutation.mutateAsync({
        name: newClientData.name,
        phone: newClientData.phone || undefined,
        location: newClientData.location,
      });
      // Select the newly created client
      setValue('clientId', newClient.id);
      setIsCreatingClient(false);
      setNewClientData({ name: '', phone: '', location: '' });
      setNewClientErrors({});
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleImageUpload = (file: File) => {
    if (file) {
      // For now, we'll create a local preview. In production, this would upload to storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue('projectPicture', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('projectPicture', '');
  };

  // Convert team members to multi-select options (filter to assignable roles - Manager & Supervisor only)
  const assignableRoles = ['manager', 'supervisor'];
  const teamMemberOptions: MultiSelectOption[] = useMemo(() => {
    return teamMembers
      .filter((m) => assignableRoles.includes(m.membership.role.name.toLowerCase()))
      .map((member) => ({
        value: member.membership.id,
        label: `${member.name} (${member.membership.role.name})`,
      }));
  }, [teamMembers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project' : 'Add Project'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the project details below.'
              : 'Fill in the details to create a new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Row 1: Project Name, Type */}
            <div className="grid grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter Project Name"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <Label htmlFor="projectTypeItemId">
                  Type of Project <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="projectTypeItemId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingTypes}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select Project Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No project types found
                          </div>
                        ) : (
                          projectTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id} className="cursor-pointer">
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.projectTypeItemId && (
                  <p className="text-sm text-destructive">{errors.projectTypeItemId.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Enter Location"
                  {...register('location')}
                  aria-invalid={!!errors.location}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Project Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter Project Amount"
                  {...register('amount', { valueAsNumber: true })}
                  aria-invalid={!!errors.amount}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              {/* Area (sq ft) */}
              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input
                  id="area"
                  placeholder="Enter Area"
                  inputMode="numeric"
                  {...register('area')}
                  aria-invalid={!!errors.area}
                />
                {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
              </div>

              {/* Client Selection */}
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                {isCreatingClient ? (
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Input
                        placeholder="Client name *"
                        value={newClientData.name}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, name: e.target.value })
                        }
                        aria-invalid={!!newClientErrors.name}
                      />
                      {newClientErrors.name && (
                        <p className="text-xs text-destructive">{newClientErrors.name}</p>
                      )}
                    </div>
                    <Input
                      placeholder="Phone number"
                      value={newClientData.phone}
                      onChange={(e) =>
                        setNewClientData({ ...newClientData, phone: e.target.value })
                      }
                    />
                    <div className="space-y-2">
                      <Input
                        placeholder="Location *"
                        value={newClientData.location}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, location: e.target.value })
                        }
                        aria-invalid={!!newClientErrors.location}
                      />
                      {newClientErrors.location && (
                        <p className="text-xs text-destructive">{newClientErrors.location}</p>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCreatingClient(false);
                          setNewClientData({ name: '', phone: '', location: '' });
                          setNewClientErrors({});
                        }}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateClient}
                        disabled={createClientMutation.isPending}
                        className="cursor-pointer"
                      >
                        {createClientMutation.isPending ? 'Creating...' : 'Add Client'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Controller
                    name="clientId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          if (value === '__new__') {
                            setIsCreatingClient(true);
                          } else {
                            field.onChange(value === '__none__' ? '' : value);
                          }
                        }}
                        value={field.value || '__none__'}
                        disabled={isLoadingClients}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select Client (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__" className="cursor-pointer">
                            No client
                          </SelectItem>
                          {clients.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id}
                              className="cursor-pointer"
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                          <div className="border-t my-1" />
                          <SelectItem value="__new__" className="cursor-pointer text-primary">
                            <span className="flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              Add New Client
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {selectedClientId && clients.find((c) => c.id === selectedClientId) && (
                  <p className="text-xs text-muted-foreground">
                    {clients.find((c) => c.id === selectedClientId)?.location}
                  </p>
                )}
              </div>
            </div>

            {/* Start Date and End Date on same line */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick a date"
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              {/* End Date (Deadline) */}
              <div className="space-y-2">
                <Label>End Date (Deadline)</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick a date"
                    />
                  )}
                />
              </div>
            </div>

            {/* Assign to */}
            <div className="space-y-2">
              <Label>Assign to</Label>
              <MultiSelect
                options={teamMemberOptions}
                selected={selectedMembers}
                onChange={setSelectedMembers}
                placeholder="Select team members..."
                searchPlaceholder="Search members..."
                emptyMessage="No team members found."
                disabled={isLoadingMembers}
              />
              <p className="text-xs text-muted-foreground">
                Select team members to assign to this project
              </p>
            </div>

            {/* Cover Image - Compact with aspect ratio preserved */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {imagePreview ? (
                <div className="relative block w-fit max-w-[200px] rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Project preview"
                    className="max-h-36 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center cursor-pointer hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-24 cursor-pointer rounded-lg border-2 border-dashed transition-colors bg-background',
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a cover image, or{' '}
                    <span className="text-primary underline">Browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 1600px width recommended. Max file size of 10MB
                  </p>
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectFormDialog;
