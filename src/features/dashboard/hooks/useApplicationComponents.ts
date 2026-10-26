import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useApplicationComponents(applicationId: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.components(applicationId),
    queryFn: () => dashboardApi.getApplicationComponents(applicationId),
    enabled: applicationId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
