/**
 * Client Form Dialog
 *
 * Modal dialog for editing client information.
 * Note: Clients are created via project creation flow, not directly.
 */

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
import type { Client, UpdateClientInput } from '@/lib/api/clients';

// ============================================
// Schema
// ============================================

const clientFormSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  phone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

// ============================================
// Props
// ============================================

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSubmit: (data: UpdateClientInput) => void;
  isSubmitting: boolean;
}

// ============================================
// Component
// ============================================

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSubmit,
  isSubmitting,
}: ClientFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
    },
  });

  // Reset form when dialog opens or client changes
  useEffect(() => {
    if (open && client) {
      reset({
        name: client.name,
        phone: client.phone || '',
        location: client.location,
      });
    }
  }, [open, client, reset]);

  const handleFormSubmit = (data: ClientFormData) => {
    onSubmit({
      name: data.name,
      phone: data.phone || undefined,
      location: data.location,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>Update the client&apos;s information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
