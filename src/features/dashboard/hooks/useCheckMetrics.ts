import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useCheckMetrics(checkId: number, limit = 50) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.checkMetrics(checkId),
    queryFn: () => dashboardApi.getCheckMetrics(checkId, limit),
    enabled: checkId > 0,
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}
