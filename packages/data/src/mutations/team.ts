import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTeamMember } from '../mockDb';
import { queryKeys } from '../queries/keys';
import type { CreateTeamMemberInput } from '@worksite/types';

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeamMemberInput) => addTeamMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers });
    },
  });
};
