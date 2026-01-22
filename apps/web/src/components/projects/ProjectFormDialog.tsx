/**
 * Project Form Dialog Component
 *
 * Modal dialog for creating and editing projects.
 * Includes image upload, date pickers, and member selection.
 */

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageIcon, X, Check } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useCategoryItems } from '@/lib/hooks/useCategories';
import { useOrganizationMembers } from '@/lib/hooks/useOrganizations';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/lib/api/projects';

// ============================================
// Schema
// ============================================

const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  location: z.string().min(1, 'Location is required'),
  area: z.string().regex(/^\d*$/, 'Must be a number').optional(),
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date().optional(),
  projectTypeItemId: z.string().min(1, 'Project type is required'),
  projectPicture: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

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

  // Fetch project types
  const { data: projectTypes = [], isLoading: isLoadingTypes } = useCategoryItems('project_type');

  // Fetch organization members
  const { data: orgMembers = [], isLoading: isLoadingMembers } = useOrganizationMembers();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
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
    },
  });

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
        });
        setImagePreview(null);
        setSelectedMembers([]);
      }
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
    };

    onSubmit(submitData);
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

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Filter members to show only those who can be assigned (MANAGER, SUPERVISOR)
  const assignableMembers = orgMembers.filter((m) =>
    ['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(m.role)
  );

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
            {/* Image Upload - Full Width, Compact */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Project preview"
                    className="h-full w-full object-cover"
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
                    'flex flex-col items-center justify-center w-full h-24 cursor-pointer rounded-lg border-2 border-dashed transition-colors',
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
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
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
                <Label htmlFor="amount">
                  Project Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter Project Amount"
                  {...register('amount')}
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
                {errors.area && (
                  <p className="text-sm text-destructive">{errors.area.message}</p>
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

            {/* Project Manager / Team Members */}
            <div className="space-y-2">
              <Label>Project Manager</Label>
              <div className="border rounded-lg p-3">
                {isLoadingMembers ? (
                  <p className="text-sm text-muted-foreground">Loading members...</p>
                ) : assignableMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignable members found</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignableMembers.map((member) => {
                      const isSelected = selectedMembers.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleMember(member.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted hover:bg-muted/80 border-transparent'
                          )}
                        >
                          <div className="h-5 w-5 rounded-full bg-background/20 flex items-center justify-center text-xs">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{member.user.name}</span>
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Select team members to assign to this project
              </p>
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
