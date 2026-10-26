import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useCheckStatus(checkId: number, refetchOverrideMs?: number | null) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  return useQuery({
    queryKey: dashboardQueryKeys.checkStatus(checkId),
    queryFn: () => dashboardApi.getCheckStatus(checkId),
    enabled: checkId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
