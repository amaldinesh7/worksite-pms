/**
 * Overview Hooks
 * React Query hooks for dashboard data
 */

import { useQuery } from '@tanstack/react-query';
import {
  getOverview,
  getKPIStats,
  getProjectsPL,
  getTodayTasks,
  getCreditsSummary,
  getAlerts,
} from '../api/overview';

// Query Keys
export const overviewKeys = {
  all: ['overview'] as const,
  full: () => [...overviewKeys.all, 'full'] as const,
  kpi: () => [...overviewKeys.all, 'kpi'] as const,
  projectsPL: () => [...overviewKeys.all, 'projects-pl'] as const,
  tasks: () => [...overviewKeys.all, 'tasks'] as const,
  credits: () => [...overviewKeys.all, 'credits'] as const,
  alerts: () => [...overviewKeys.all, 'alerts'] as const,
};

/**
 * Hook to fetch complete overview data
 */
export function useOverview() {
  return useQuery({
    queryKey: overviewKeys.full(),
    queryFn: getOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch KPI stats only
 */
export function useKPIStats() {
  return useQuery({
    queryKey: overviewKeys.kpi(),
    queryFn: getKPIStats,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch project P/L data
 */
export function useProjectsPL() {
  return useQuery({
    queryKey: overviewKeys.projectsPL(),
    queryFn: getProjectsPL,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch today's tasks
 */
export function useTodayTasks() {
  return useQuery({
    queryKey: overviewKeys.tasks(),
    queryFn: getTodayTasks,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch credits summary
 */
export function useCreditsSummary() {
  return useQuery({
    queryKey: overviewKeys.credits(),
    queryFn: getCreditsSummary,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch alerts
 */
export function useAlerts() {
  return useQuery({
    queryKey: overviewKeys.alerts(),
    queryFn: getAlerts,
    staleTime: 1000 * 60 * 5,
  });
}
