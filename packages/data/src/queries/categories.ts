import { useQuery } from '@tanstack/react-query';
import { getCategories, getCategory, isCategoryInUse } from '../mockDb';
import { queryKeys } from './keys';

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => getCategory(id),
    enabled: !!id,
  });
};

export const useCategoryInUse = (id: string) => {
  return useQuery({
    queryKey: queryKeys.categoryInUse(id),
    queryFn: () => Promise.resolve(isCategoryInUse(id)),
    enabled: !!id,
  });
};
