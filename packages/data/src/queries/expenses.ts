import { useQuery } from '@tanstack/react-query';
import { getExpenses, getExpensesByCreditAccount, getTodayTotal } from '../mockDb';
import { queryKeys } from './keys';

export const useExpenses = (projectId?: string) => {
  return useQuery({
    queryKey: queryKeys.expenses(projectId),
    queryFn: () => getExpenses(projectId),
  });
};

export const useExpensesByCreditAccount = (creditAccountId: string) => {
  return useQuery({
    queryKey: queryKeys.expensesByCreditAccount(creditAccountId),
    queryFn: () => getExpensesByCreditAccount(creditAccountId),
    enabled: !!creditAccountId,
  });
};

export const useTodayTotal = () => {
  return useQuery({
    queryKey: queryKeys.todayTotal,
    queryFn: () => Promise.resolve(getTodayTotal()),
  });
};
