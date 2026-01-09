import type {
  Project,
  Expense,
  Category,
  CreditAccount,
  TeamMember,
} from '@worksite/types';

// ============================================
// In-Memory Mock Database
// Persists during app session, resets on reload
// ============================================

interface MockDatabase {
  projects: Project[];
  expenses: Expense[];
  categories: Category[];
  creditAccounts: CreditAccount[];
  teamMembers: TeamMember[];
}

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substring(2, 11);

// Get today's date in ISO format
const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

// ============================================
// Seed Data
// ============================================

export const mockDb: MockDatabase = {
  projects: [
    {
      id: 'p1',
      name: 'Villa Construction',
      clientName: 'Mr. Sharma',
      location: 'Whitefield, Bangalore',
      startDate: '2026-01-01',
      createdAt: lastWeek,
    },
    {
      id: 'p2',
      name: 'Office Renovation',
      clientName: 'ABC Corp',
      location: 'MG Road, Bangalore',
      startDate: '2026-01-05',
      createdAt: yesterday,
    },
  ],

  expenses: [
    {
      id: 'e1',
      projectId: 'p1',
      amount: 25000,
      categoryId: 'c1',
      creditAccountId: 'cr1',
      paymentMode: 'upi',
      notes: 'Cement bags - 50 units',
      createdAt: yesterday,
    },
    {
      id: 'e2',
      projectId: 'p1',
      amount: 15000,
      categoryId: 'c2',
      creditAccountId: 'cr2',
      paymentMode: 'cash',
      notes: 'Mason work - foundation',
      createdAt: today,
    },
    {
      id: 'e3',
      projectId: 'p2',
      amount: 8500,
      categoryId: 'c1',
      paymentMode: 'upi',
      notes: 'Paint and supplies',
      createdAt: today,
    },
  ],

  categories: [
    {
      id: 'c1',
      name: 'Materials',
      createdAt: lastWeek,
    },
    {
      id: 'c2',
      name: 'Labour',
      createdAt: lastWeek,
    },
  ],

  creditAccounts: [
    {
      id: 'cr1',
      name: 'Cement Supplier',
      type: 'vendor',
      phone: '9876543210',
      createdAt: lastWeek,
    },
    {
      id: 'cr2',
      name: 'Rajesh (Mason)',
      type: 'individual',
      phone: '9876543211',
      createdAt: lastWeek,
    },
  ],

  teamMembers: [
    {
      id: 't1',
      name: 'You',
      phone: '9999999999',
      role: 'owner',
      createdAt: lastWeek,
    },
    {
      id: 't2',
      name: 'Suresh Kumar',
      phone: '8888888888',
      role: 'supervisor',
      createdAt: lastWeek,
    },
  ],
};

// ============================================
// CRUD Operations (called by React Query)
// ============================================

// Projects
export const getProjects = (): Promise<Project[]> => {
  return Promise.resolve([...mockDb.projects]);
};

export const getProject = (id: string): Promise<Project | undefined> => {
  return Promise.resolve(mockDb.projects.find((p) => p.id === id));
};

export const addProject = (
  input: Omit<Project, 'id' | 'createdAt'>
): Promise<Project> => {
  const project: Project = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  mockDb.projects.unshift(project);
  return Promise.resolve(project);
};

// Expenses
export const getExpenses = (projectId?: string): Promise<Expense[]> => {
  const expenses = projectId
    ? mockDb.expenses.filter((e) => e.projectId === projectId)
    : mockDb.expenses;
  return Promise.resolve([...expenses].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
};

export const getExpensesByCreditAccount = (creditAccountId: string): Promise<Expense[]> => {
  const expenses = mockDb.expenses.filter((e) => e.creditAccountId === creditAccountId);
  return Promise.resolve([...expenses].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
};

export const addExpense = (
  input: Omit<Expense, 'id' | 'createdAt'>
): Promise<Expense> => {
  const expense: Expense = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  mockDb.expenses.unshift(expense);
  return Promise.resolve(expense);
};

// Categories
export const getCategories = (): Promise<Category[]> => {
  return Promise.resolve([...mockDb.categories]);
};

export const getCategory = (id: string): Promise<Category | undefined> => {
  return Promise.resolve(mockDb.categories.find((c) => c.id === id));
};

export const addCategory = (
  input: Omit<Category, 'id' | 'createdAt'>
): Promise<Category> => {
  const category: Category = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  mockDb.categories.push(category);
  return Promise.resolve(category);
};

export const deleteCategory = (id: string): Promise<boolean> => {
  // Check if category is used by any expense
  const isUsed = mockDb.expenses.some((e) => e.categoryId === id);
  if (isUsed) {
    return Promise.reject(new Error('Category is in use and cannot be deleted'));
  }
  const index = mockDb.categories.findIndex((c) => c.id === id);
  if (index > -1) {
    mockDb.categories.splice(index, 1);
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
};

export const isCategoryInUse = (id: string): boolean => {
  return mockDb.expenses.some((e) => e.categoryId === id);
};

// Credit Accounts
export const getCreditAccounts = (): Promise<CreditAccount[]> => {
  return Promise.resolve([...mockDb.creditAccounts]);
};

export const getCreditAccount = (id: string): Promise<CreditAccount | undefined> => {
  return Promise.resolve(mockDb.creditAccounts.find((c) => c.id === id));
};

export const addCreditAccount = (
  input: Omit<CreditAccount, 'id' | 'createdAt'>
): Promise<CreditAccount> => {
  const creditAccount: CreditAccount = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  mockDb.creditAccounts.push(creditAccount);
  return Promise.resolve(creditAccount);
};

export const getCreditBalance = (creditAccountId: string): number => {
  return mockDb.expenses
    .filter((e) => e.creditAccountId === creditAccountId)
    .reduce((sum, e) => sum + e.amount, 0);
};

// Team Members
export const getTeamMembers = (): Promise<TeamMember[]> => {
  return Promise.resolve([...mockDb.teamMembers]);
};

export const addTeamMember = (
  input: Omit<TeamMember, 'id' | 'createdAt'>
): Promise<TeamMember> => {
  const member: TeamMember = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  mockDb.teamMembers.push(member);
  return Promise.resolve(member);
};

// ============================================
// Computed Data Helpers
// ============================================

export const getTodayTotal = (): number => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  return mockDb.expenses
    .filter((e) => new Date(e.createdAt) >= todayStart)
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getProjectStats = (projectId: string) => {
  const projectExpenses = mockDb.expenses.filter((e) => e.projectId === projectId);
  return {
    totalExpenses: projectExpenses.reduce((sum, e) => sum + e.amount, 0),
    expenseCount: projectExpenses.length,
    photoCount: projectExpenses.filter((e) => e.billPhotoUrl).length,
  };
};

export const getMonthlyTotal = (projectId: string): number => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  return mockDb.expenses
    .filter((e) => e.projectId === projectId && new Date(e.createdAt) >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);
};
