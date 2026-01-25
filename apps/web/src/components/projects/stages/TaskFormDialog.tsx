/**
 * TaskFormDialog Component
 *
 * Modal for creating or editing a task with toggleable labour/subcontractor assignment.
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Switch } from '@/components/ui/switch';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { toast } from 'sonner';
import { useTeamMembers } from '@/lib/hooks/useTeam';
import { useParties } from '@/lib/hooks/useParties';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/useTasks';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '@/lib/api/tasks';

// ============================================
// Form Schema
// ============================================

const taskFormSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  daysAllocated: z.coerce.number().int().min(1, 'Days allocated must be at least 1'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'BLOCKED']),
  memberIds: z.array(z.string()),
  assignLabour: z.boolean(),
  assignSubcontractor: z.boolean(),
  labourIds: z.array(z.string()),
  subcontractorIds: z.array(z.string()),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// ============================================
// Types
// ============================================

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  task?: Task | null;
}

// ============================================
// Status Options
// ============================================

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'BLOCKED', label: 'Blocked' },
];

// ============================================
// Component
// ============================================

export function TaskFormDialog({ isOpen, onClose, stageId, task }: TaskFormDialogProps) {
  const isEditing = !!task;

  // Fetch team members, labour, and subcontractors
  const { data: teamData } = useTeamMembers({ limit: 100 });
  const { data: labourData } = useParties({ type: 'LABOUR', limit: 100 });
  const { data: subcontractorData } = useParties({ type: 'SUBCONTRACTOR', limit: 100 });

  // Mutations
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isSubmitting = createTask.isPending || updateTask.isPending;

  // Form setup
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: '',
      description: '',
      daysAllocated: 1,
      status: 'NOT_STARTED',
      memberIds: [],
      assignLabour: false,
      assignSubcontractor: false,
      labourIds: [],
      subcontractorIds: [],
    },
  });

  // Reset form when task changes
  React.useEffect(() => {
    if (task) {
      // Separate party assignments by type
      const labourAssignments = task.partyAssignments.filter((a) => a.party.type === 'LABOUR');
      const subcontractorAssignments = task.partyAssignments.filter(
        (a) => a.party.type === 'SUBCONTRACTOR'
      );

      form.reset({
        name: task.name,
        description: task.description || '',
        daysAllocated: task.daysAllocated,
        status: task.status,
        memberIds: task.memberAssignments.map((a) => a.memberId),
        assignLabour: labourAssignments.length > 0,
        assignSubcontractor: subcontractorAssignments.length > 0,
        labourIds: labourAssignments.map((a) => a.partyId),
        subcontractorIds: subcontractorAssignments.map((a) => a.partyId),
      });
    } else {
      form.reset({
        name: '',
        description: '',
        daysAllocated: 1,
        status: 'NOT_STARTED',
        memberIds: [],
        assignLabour: false,
        assignSubcontractor: false,
        labourIds: [],
        subcontractorIds: [],
      });
    }
  }, [task, form]);

  // Watch toggles
  const assignLabour = form.watch('assignLabour');
  const assignSubcontractor = form.watch('assignSubcontractor');

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

  // Convert labour to options
  const labourOptions: MultiSelectOption[] = React.useMemo(() => {
    if (!labourData?.items) return [];
    return labourData.items.map((party) => ({
      value: party.id,
      label: party.name,
      description: party.phone || party.location,
    }));
  }, [labourData]);

  // Convert subcontractors to options
  const subcontractorOptions: MultiSelectOption[] = React.useMemo(() => {
    if (!subcontractorData?.items) return [];
    return subcontractorData.items.map((party) => ({
      value: party.id,
      label: party.name,
      description: party.location,
    }));
  }, [subcontractorData]);

  // Handle form submission
  const handleSubmit = async (values: TaskFormValues) => {
    try {
      // Combine party IDs (labour + subcontractor)
      const partyIds = [
        ...(values.assignLabour ? values.labourIds : []),
        ...(values.assignSubcontractor ? values.subcontractorIds : []),
      ];

      if (isEditing && task) {
        const updateData: UpdateTaskInput = {
          name: values.name,
          description: values.description || null,
          daysAllocated: values.daysAllocated,
          status: values.status,
          memberIds: values.memberIds,
          partyIds,
        };
        await updateTask.mutateAsync({ id: task.id, data: updateData });
      } else {
        const createData: CreateTaskInput = {
          stageId,
          name: values.name,
          description: values.description,
          daysAllocated: values.daysAllocated,
          status: values.status,
          memberIds: values.memberIds,
          partyIds,
        };
        await createTask.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(
        `Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      // Do NOT call onClose() - keep dialog open for retry
    }
  };

  // Clear party selections when toggle is turned off
  const handleLabourToggle = (checked: boolean) => {
    form.setValue('assignLabour', checked);
    if (!checked) {
      form.setValue('labourIds', []);
    }
  };

  const handleSubcontractorToggle = (checked: boolean) => {
    form.setValue('assignSubcontractor', checked);
    if (!checked) {
      form.setValue('subcontractorIds', []);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the task details and assignments.'
              : 'Create a new task for this stage.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Task Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Install electrical wiring"
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
              placeholder="Enter task description..."
              rows={2}
              {...form.register('description')}
            />
          </div>

          {/* Days Allocated & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daysAllocated">
                Days Allocated <span className="text-destructive">*</span>
              </Label>
              <Input
                id="daysAllocated"
                type="number"
                min={1}
                placeholder="1"
                {...form.register('daysAllocated')}
              />
              {form.formState.errors.daysAllocated && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.daysAllocated.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value: TaskStatus) => form.setValue('status', value)}
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
          </div>

          {/* Team Members (Internal Team) */}
          <div className="space-y-2">
            <Label>Assign Team Members (Internal)</Label>
            <MultiSelect
              options={teamMemberOptions}
              selected={form.watch('memberIds')}
              onChange={(selected) => form.setValue('memberIds', selected)}
              placeholder="Select team members..."
              searchPlaceholder="Search members..."
              emptyMessage="No team members found."
            />
          </div>

          {/* Labour Toggle & Selection */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="assignLabour" className="font-medium">
                  Assign Labour
                </Label>
                <p className="text-sm text-muted-foreground">
                  Assign external labour workers to this task
                </p>
              </div>
              <Switch
                id="assignLabour"
                checked={assignLabour}
                onCheckedChange={handleLabourToggle}
              />
            </div>
            {assignLabour && (
              <MultiSelect
                options={labourOptions}
                selected={form.watch('labourIds')}
                onChange={(selected) => form.setValue('labourIds', selected)}
                placeholder="Select labour..."
                searchPlaceholder="Search labour..."
                emptyMessage="No labour found."
              />
            )}
          </div>

          {/* Subcontractor Toggle & Selection */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="assignSubcontractor" className="font-medium">
                  Assign Subcontractor
                </Label>
                <p className="text-sm text-muted-foreground">Assign subcontractors to this task</p>
              </div>
              <Switch
                id="assignSubcontractor"
                checked={assignSubcontractor}
                onCheckedChange={handleSubcontractorToggle}
              />
            </div>
            {assignSubcontractor && (
              <MultiSelect
                options={subcontractorOptions}
                selected={form.watch('subcontractorIds')}
                onChange={(selected) => form.setValue('subcontractorIds', selected)}
                placeholder="Select subcontractors..."
                searchPlaceholder="Search subcontractors..."
                emptyMessage="No subcontractors found."
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
