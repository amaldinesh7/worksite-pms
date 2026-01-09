// Re-export types from @worksite/types for convenience
export type {
  Project,
  Expense,
  Category,
  CreditAccount,
  CreditAccountType,
  TeamMember,
  TeamMemberRole,
  CreateProjectInput,
  CreateExpenseInput,
  CreateCategoryInput,
  CreateCreditAccountInput,
  CreateTeamMemberInput,
  CreditAccountWithBalance,
  ProjectWithStats,
  Activity,
  ActivityType,
} from '@worksite/types';

// Export mock database operations
export {
  mockDb,
  generateId,
  getProjects,
  getProject,
  addProject,
  getExpenses,
  getExpensesByCreditAccount,
  addExpense,
  getCategories,
  getCategory,
  addCategory,
  deleteCategory,
  isCategoryInUse,
  getCreditAccounts,
  getCreditAccount,
  addCreditAccount,
  getCreditBalance,
  getTeamMembers,
  addTeamMember,
  getTodayTotal,
  getProjectStats,
  getMonthlyTotal,
} from './mockDb';

// Export query keys and hooks
export {
  queryKeys,
  useProjects,
  useProject,
  useProjectStats,
  useMonthlyTotal,
  useExpenses,
  useExpensesByCreditAccount,
  useTodayTotal,
  useCategories,
  useCategory,
  useCategoryInUse,
  useCreditAccounts,
  useCreditAccount,
  useCreditBalance,
  useTeamMembers,
} from './queries';

// Export mutation hooks
export {
  useCreateProject,
  useCreateExpense,
  useCreateCategory,
  useDeleteCategory,
  useCreateCreditAccount,
  useCreateTeamMember,
} from './mutations';
