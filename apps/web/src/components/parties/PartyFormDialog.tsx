import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import type { Party, PartyType, CreatePartyInput, UpdatePartyInput } from '@/lib/api/parties';

// ============================================
// Schema
// ============================================

const partyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

type PartyFormData = z.infer<typeof partyFormSchema>;

// ============================================
// Props
// ============================================

interface PartyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party?: Party | null;
  defaultType?: PartyType;
  onSubmit: (data: CreatePartyInput | UpdatePartyInput) => void;
  isSubmitting: boolean;
}

// ============================================
// Component
// ============================================

export function PartyFormDialog({
  open,
  onOpenChange,
  party,
  defaultType = 'VENDOR',
  onSubmit,
  isSubmitting,
}: PartyFormDialogProps) {
  const isEditing = !!party;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
    },
  });

  // Reset form when dialog opens/closes or party changes
  useEffect(() => {
    if (open) {
      if (party) {
        reset({
          name: party.name,
          phone: party.phone || '',
          location: party.location || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          location: '',
        });
      }
    }
  }, [open, party, reset]);

  const handleFormSubmit = (data: PartyFormData) => {
    // When editing, use party's existing type; when creating, use defaultType
    const partyType = isEditing ? party.type : defaultType;
    
    onSubmit({
      name: data.name,
      phone: data.phone || undefined,
      location: data.location,
      type: partyType,
    });
  };

  const getTypeLabel = (type: PartyType): string => {
    switch (type) {
      case 'VENDOR':
        return 'Vendor';
      case 'LABOUR':
        return 'Labour';
      case 'SUBCONTRACTOR':
        return 'Sub Contractor';
      default:
        return type;
    }
  };

  const getDialogTitle = (): string => {
    if (isEditing) {
      return `Edit ${getTypeLabel(party.type)}`;
    }
    return `Add New ${getTypeLabel(defaultType)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the party details below.'
              : 'Fill in the details to create a new party.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter name"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...register('phone')}
              />
            </div>

            {/* Location Field */}
            <div className="grid gap-2">
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
