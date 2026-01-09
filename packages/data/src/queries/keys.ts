// ============================================
// Query Keys - Centralized for cache management
// ============================================

export const queryKeys = {
  // Projects
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectStats: (id: string) => ['projectStats', id] as const,
  monthlyTotal: (id: string) => ['monthlyTotal', id] as const,

  // Expenses
  expenses: (projectId?: string) => ['expenses', projectId] as const,
  expensesByCreditAccount: (creditAccountId: string) => ['expenses', 'credit', creditAccountId] as const,
  todayTotal: ['todayTotal'] as const,

  // Categories
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
  categoryInUse: (id: string) => ['categoryInUse', id] as const,

  // Credit Accounts
  creditAccounts: ['creditAccounts'] as const,
  creditAccount: (id: string) => ['creditAccounts', id] as const,
  creditBalance: (id: string) => ['creditBalance', id] as const,

  // Team Members
  teamMembers: ['teamMembers'] as const,
};
