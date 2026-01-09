import { useQuery } from '@tanstack/react-query';
import { getTeamMembers } from '../mockDb';
import { queryKeys } from './keys';

export const useTeamMembers = () => {
  return useQuery({
    queryKey: queryKeys.teamMembers,
    queryFn: getTeamMembers,
  });
};
