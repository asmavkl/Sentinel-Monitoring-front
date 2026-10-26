import { useQuery } from '@tanstack/react-query';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useApplicationDashboard(applicationId: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.dashboard(applicationId),
    queryFn: () => applicationDashboardApi.getDashboard(applicationId),
    enabled: applicationId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
