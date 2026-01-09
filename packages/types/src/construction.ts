// ============================================
// Core Entity Types for Construction PMS
// ============================================

export interface Project {
  id: string;
  name: string;
  clientName: string;
  location: string;
  startDate: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  categoryId: string;
  creditAccountId?: string;
  paymentMode: 'cash' | 'upi';
  notes?: string;
  billPhotoUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export type CreditAccountType = 'vendor' | 'individual' | 'client';

export interface CreditAccount {
  id: string;
  name: string;
  type: CreditAccountType;
  phone?: string;
  createdAt: string;
}

export type TeamMemberRole = 'owner' | 'supervisor' | 'accountant';

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  role: TeamMemberRole;
  createdAt: string;
}

// ============================================
// Form Input Types
// ============================================

export interface CreateProjectInput {
  name: string;
  clientName: string;
  location: string;
  startDate: string;
}

export interface CreateExpenseInput {
  projectId: string;
  amount: number;
  categoryId: string;
  creditAccountId?: string;
  paymentMode: 'cash' | 'upi';
  notes?: string;
  billPhotoUrl?: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface CreateCreditAccountInput {
  name: string;
  type: CreditAccountType;
  phone?: string;
}

export interface CreateTeamMemberInput {
  name: string;
  phone: string;
  role: TeamMemberRole;
}

// ============================================
// Computed Types
// ============================================

export interface CreditAccountWithBalance extends CreditAccount {
  balance: number; // Positive = amount due
}

export interface ProjectWithStats extends Project {
  totalExpenses: number;
  expenseCount: number;
  photoCount: number;
}

// ============================================
// Activity Types for Home Screen
// ============================================

export type ActivityType = 'expense' | 'photo' | 'project';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  amount?: number;
  createdAt: string;
}
