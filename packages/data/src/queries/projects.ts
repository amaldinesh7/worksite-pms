import { useQuery } from '@tanstack/react-query';
import { getProjects, getProject, getProjectStats, getMonthlyTotal } from '../mockDb';
import { queryKeys } from './keys';

export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: getProjects,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
};

export const useProjectStats = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projectStats(projectId),
    queryFn: () => Promise.resolve(getProjectStats(projectId)),
    enabled: !!projectId,
  });
};

export const useMonthlyTotal = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.monthlyTotal(projectId),
    queryFn: () => Promise.resolve(getMonthlyTotal(projectId)),
    enabled: !!projectId,
  });
};
