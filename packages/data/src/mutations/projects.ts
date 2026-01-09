import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addProject } from '../mockDb';
import { queryKeys } from '../queries/keys';
import type { CreateProjectInput } from '@worksite/types';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => addProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};
