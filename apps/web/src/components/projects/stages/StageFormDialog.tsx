/**
 * StageFormDialog Component
 *
 * Modal for creating or editing a stage with team member and subcontractor assignment.
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { useTeamMembers } from '@/lib/hooks/useTeam';
import { useParties } from '@/lib/hooks/useParties';
import { useCreateStage, useUpdateStage } from '@/lib/hooks/useStages';
import type { Stage, StageStatus, CreateStageInput, UpdateStageInput } from '@/lib/api/stages';

// ============================================
// Form Schema
// ============================================

const stageFormSchema = z
  .object({
    name: z.string().min(1, 'Stage name is required'),
    description: z.string().optional(),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
    budgetAmount: z.coerce.number().min(0, 'Budget must be non-negative'),
    weight: z.coerce.number().min(0).max(100, 'Weight must be between 0 and 100'),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
    memberIds: z.array(z.string()).default([]),
    partyIds: z.array(z.string()).default([]),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  });

type StageFormValues = z.infer<typeof stageFormSchema>;

// ============================================
// Types
// ============================================

interface StageFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  stage?: Stage | null;
}

// ============================================
// Status Options
// ============================================

const statusOptions: { value: StageStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

// ============================================
// Component
// ============================================

export function StageFormDialog({ isOpen, onClose, projectId, stage }: StageFormDialogProps) {
  const isEditing = !!stage;

  // Fetch team members and subcontractors
  const { data: teamData } = useTeamMembers({ limit: 100 });
  const { data: partiesData } = useParties({ type: 'SUBCONTRACTOR', limit: 100 });

  // Mutations
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();

  const isSubmitting = createStage.isPending || updateStage.isPending;

  // Form setup
  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      budgetAmount: 0,
      weight: 0,
      status: 'SCHEDULED',
      memberIds: [],
      partyIds: [],
    },
  });

  // Reset form when stage changes
  React.useEffect(() => {
    if (stage) {
      form.reset({
        name: stage.name,
        description: stage.description || '',
        startDate: new Date(stage.startDate),
        endDate: new Date(stage.endDate),
        budgetAmount: Number(stage.budgetAmount),
        weight: Number(stage.weight),
        status: stage.status,
        memberIds: stage.memberAssignments.map((a) => a.memberId),
        partyIds: stage.partyAssignments.map((a) => a.partyId),
      });
    } else {
      form.reset({
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        budgetAmount: 0,
        weight: 0,
        status: 'SCHEDULED',
        memberIds: [],
        partyIds: [],
      });
    }
  }, [stage, form]);

  // Watch dates to calculate duration
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const duration = startDate && endDate ? differenceInDays(endDate, startDate) : 0;

  // Convert team members to options
  const teamMemberOptions: MultiSelectOption[] = React.useMemo(() => {
    if (!teamData?.items) return [];
    return teamData.items.map((member) => ({
      value: member.id,
      label: member.name,
      description: member.membership?.role?.name,
      avatar: member.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    }));
  }, [teamData]);

  // Convert subcontractors to options
  const subcontractorOptions: MultiSelectOption[] = React.useMemo(() => {
    if (!partiesData?.items) return [];
    return partiesData.items.map((party) => ({
      value: party.id,
      label: party.name,
      description: party.location,
    }));
  }, [partiesData]);

  // Handle form submission
  const handleSubmit = async (values: StageFormValues) => {
    try {
      if (isEditing && stage) {
        const updateData: UpdateStageInput = {
          name: values.name,
          description: values.description || null,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          budgetAmount: values.budgetAmount,
          weight: values.weight,
          status: values.status,
          memberIds: values.memberIds,
          partyIds: values.partyIds,
        };
        await updateStage.mutateAsync({ id: stage.id, data: updateData });
      } else {
        const createData: CreateStageInput = {
          projectId,
          name: values.name,
          description: values.description,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
          budgetAmount: values.budgetAmount,
          weight: values.weight,
          status: values.status,
          memberIds: values.memberIds,
          partyIds: values.partyIds,
        };
        await createStage.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save stage:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the stage details and assignments.'
              : 'Create a new stage for this project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Stage Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Stage Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Foundation & Excavation"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter stage description..."
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-3 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal cursor-pointer',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && form.setValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>
                End Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal cursor-pointer',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && form.setValue('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Duration (Read-only) */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input value={`${duration} days`} disabled className="bg-muted" />
            </div>
          </div>

          {/* Budget & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">
                Budget Allocation <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder="0"
                  className="pl-7"
                  {...form.register('budgetAmount')}
                />
              </div>
              {form.formState.errors.budgetAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.budgetAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight (%) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="0"
                  className="pr-7"
                  {...form.register('weight')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              {form.formState.errors.weight && (
                <p className="text-sm text-destructive">{form.formState.errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value: StageStatus) => form.setValue('status', value)}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <Label>Assign Team Members</Label>
            <MultiSelect
              options={teamMemberOptions}
              selected={form.watch('memberIds')}
              onChange={(selected) => form.setValue('memberIds', selected)}
              placeholder="Select team members..."
              searchPlaceholder="Search members..."
              emptyMessage="No team members found."
            />
          </div>

          {/* Subcontractors */}
          <div className="space-y-2">
            <Label>Assign Subcontractors</Label>
            <MultiSelect
              options={subcontractorOptions}
              selected={form.watch('partyIds')}
              onChange={(selected) => form.setValue('partyIds', selected)}
              placeholder="Select subcontractors..."
              searchPlaceholder="Search subcontractors..."
              emptyMessage="No subcontractors found."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Stage' : 'Create Stage'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
