import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCreditAccount } from '../mockDb';
import { queryKeys } from '../queries/keys';
import type { CreateCreditAccountInput } from '@worksite/types';

export const useCreateCreditAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCreditAccountInput) => addCreditAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditAccounts });
    },
  });
};
