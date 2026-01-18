/**
 * Organizations React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getOrganizationMembers, type OrganizationMember } from '../api/organizations';
import { useAuthStore } from '@/stores/auth.store';

// ============================================
// Query Keys
// ============================================

export const organizationKeys = {
  all: ['organizations'] as const,
  members: (orgId: string) => [...organizationKeys.all, 'members', orgId] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch organization members
 */
export function useOrganizationMembers() {
  const { organization } = useAuthStore();
  const orgId = organization?.id || '';

  return useQuery<OrganizationMember[], Error>({
    queryKey: organizationKeys.members(orgId),
    queryFn: () => getOrganizationMembers(orgId),
    enabled: !!orgId,
  });
}
