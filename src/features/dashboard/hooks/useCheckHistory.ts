import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useCheckHistory(checkId: number, pageNumber = 1, pageSize = 50) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.checkHistory(checkId, pageNumber),
    queryFn: () => dashboardApi.getCheckHistory(checkId, { pageNumber, pageSize }),
    enabled: checkId > 0,
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}
