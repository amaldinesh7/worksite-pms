import { useQuery } from '@tanstack/react-query';
import { getCreditAccounts, getCreditAccount, getCreditBalance } from '../mockDb';
import { queryKeys } from './keys';

export const useCreditAccounts = () => {
  return useQuery({
    queryKey: queryKeys.creditAccounts,
    queryFn: getCreditAccounts,
  });
};

export const useCreditAccount = (id: string) => {
  return useQuery({
    queryKey: queryKeys.creditAccount(id),
    queryFn: () => getCreditAccount(id),
    enabled: !!id,
  });
};

export const useCreditBalance = (creditAccountId: string) => {
  return useQuery({
    queryKey: queryKeys.creditBalance(creditAccountId),
    queryFn: () => Promise.resolve(getCreditBalance(creditAccountId)),
    enabled: !!creditAccountId,
  });
};
