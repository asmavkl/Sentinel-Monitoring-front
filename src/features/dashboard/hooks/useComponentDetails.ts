import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useComponentDetails(componentId: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.componentDetails(componentId),
    queryFn: () => dashboardApi.getComponentDetails(componentId),
    enabled: componentId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
