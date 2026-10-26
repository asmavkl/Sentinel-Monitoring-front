import { useQuery } from '@tanstack/react-query';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useDashboardLayout(applicationId: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.layout(applicationId),
    queryFn: () => applicationDashboardApi.getLayout(applicationId),
    enabled: applicationId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
