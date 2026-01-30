/**
 * Overview API Client
 * Dashboard data fetching functions
 */

import { api } from './client';

// ============================================
// Types
// ============================================

export interface KPIStats {
  activeProjects: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  attentionNeeded: number;
}

export interface ProjectStatusBreakdown {
  active: number;
  onHold: number;
  completed: number;
}

export interface ProjectPL {
  id: string;
  name: string;
  clientName: string | null;
  budget: number;
  spent: number;
  remaining: number;
  healthPercent: number;
  status: string;
  isOverdue: boolean;
}

export interface TodayTask {
  id: string;
  name: string;
  projectName: string;
  projectId: string;
  stageName: string;
  status: string;
  assignees: Array<{
    id: string;
    name: string;
    avatar: string | null;
  }>;
}

export interface CreditsSummary {
  vendors: { count: number; balance: number };
  labours: { count: number; balance: number };
  subcontractors: { count: number; balance: number };
  total: number;
}

export interface OutstandingItem {
  id: string;
  name: string;
  type: 'VENDOR' | 'LABOUR' | 'SUBCONTRACTOR' | 'CLIENT';
  amount: number;
  ageDays: number;
}

export interface Alert {
  type: 'budget_overrun' | 'approaching_limit' | 'overdue_stage' | 'pending_expense';
  count: number;
  items: Array<{
    id: string;
    name: string;
    detail: string;
  }>;
}

export interface RecentProject {
  id: string;
  name: string;
  clientName: string | null;
  status: string;
  progress: number;
  updatedAt: string;
}

export interface OverviewData {
  kpiStats: KPIStats;
  projectStatusBreakdown: ProjectStatusBreakdown;
  projectsPL: ProjectPL[];
  todayTasks: TodayTask[];
  creditsSummary: CreditsSummary;
  outstandingPayables: OutstandingItem[];
  outstandingReceivables: OutstandingItem[];
  alerts: Alert[];
  recentProjects: RecentProject[];
}

// ============================================
// API Functions
// ============================================

/**
 * Get complete overview data for the dashboard
 */
export async function getOverview(): Promise<OverviewData> {
  const response = await api.get<{ data: OverviewData }>('/overview');
  return response.data.data;
}

/**
 * Get KPI statistics only
 */
export async function getKPIStats(): Promise<KPIStats> {
  const response = await api.get<{ data: KPIStats }>('/overview/kpi');
  return response.data.data;
}

/**
 * Get project P/L data
 */
export async function getProjectsPL(): Promise<ProjectPL[]> {
  const response = await api.get<{ data: ProjectPL[] }>('/overview/projects-pl');
  return response.data.data;
}

/**
 * Get today's tasks
 */
export async function getTodayTasks(): Promise<TodayTask[]> {
  const response = await api.get<{ data: TodayTask[] }>('/overview/tasks');
  return response.data.data;
}

/**
 * Get credits summary
 */
export async function getCreditsSummary(): Promise<CreditsSummary> {
  const response = await api.get<{ data: CreditsSummary }>('/overview/credits');
  return response.data.data;
}

/**
 * Get alerts
 */
export async function getAlerts(): Promise<Alert[]> {
  const response = await api.get<{ data: Alert[] }>('/overview/alerts');
  return response.data.data;
}
