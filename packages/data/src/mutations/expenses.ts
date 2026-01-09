import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addExpense } from '../mockDb';
import { queryKeys } from '../queries/keys';
import type { CreateExpenseInput } from '@worksite/types';

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => addExpense(input),
    onSuccess: (expense) => {
      // Invalidate all expense-related queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTotal });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectStats(expense.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyTotal(expense.projectId) });
      
      // If linked to a credit account, invalidate balance
      if (expense.creditAccountId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.creditBalance(expense.creditAccountId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.expensesByCreditAccount(expense.creditAccountId) 
        });
      }
    },
  });
};
