/**
 * Onboarding Page
 *
 * Shown to new users who don't have an organization.
 * Collects user name and organization name to complete setup.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Buildings, User, Briefcase } from '@phosphor-icons/react';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useAuthStore } from '@/stores/auth.store';
import { completeOnboarding } from '@/lib/api/auth';

// ============================================
// Schema
// ============================================

const onboardingSchema = z.object({
  userName: z.string().min(1, 'Name is required').max(100),
  organizationName: z.string().min(1, 'Organization name is required').max(200),
  organizationType: z.enum(['CONSTRUCTION', 'INTERIOR', 'CONTRACTOR', 'OTHER']),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ============================================
// Constants
// ============================================

const ORGANIZATION_TYPES = [
  { value: 'CONSTRUCTION', label: 'Construction Company' },
  { value: 'INTERIOR', label: 'Interior Design' },
  { value: 'CONTRACTOR', label: 'General Contractor' },
  { value: 'OTHER', label: 'Other' },
];

// ============================================
// Component
// ============================================

export default function Onboarding() {
  const navigate = useNavigate();
  const { setOrganization, updateUser, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      userName: user?.name || '',
      organizationName: '',
      organizationType: 'CONSTRUCTION',
    },
  });

  const organizationType = watch('organizationType');

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const result = await completeOnboarding(data);

      if (result.success && result.data) {
        // Update auth store with user name and organization
        updateUser({ name: result.data.user.name });
        setOrganization(result.data.organization);
        toast.success('Welcome to Worksite!');
        navigate('/projects');
      } else {
        toast.error(result.error?.message || 'Failed to complete setup');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Buildings className="h-8 w-8 text-primary" weight="duotone" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Worksite</CardTitle>
          <CardDescription>
            Let's set up your account and organization to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Name */}
            <div className="space-y-2">
              <Label htmlFor="userName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userName"
                placeholder="Enter your full name"
                {...register('userName')}
                aria-invalid={!!errors.userName}
              />
              {errors.userName && (
                <Typography variant="paragraph-small" className="text-destructive">{errors.userName.message}</Typography>
              )}
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="flex items-center gap-2">
                <Buildings className="h-4 w-4" />
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="organizationName"
                placeholder="Enter your company or organization name"
                {...register('organizationName')}
                aria-invalid={!!errors.organizationName}
              />
              {errors.organizationName && (
                <Typography variant="paragraph-small" className="text-destructive">{errors.organizationName.message}</Typography>
              )}
            </div>

            {/* Organization Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Organization Type
              </Label>
              <Select
                value={organizationType}
                onValueChange={(value) =>
                  setValue('organizationType', value as OnboardingFormData['organizationType'])
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
