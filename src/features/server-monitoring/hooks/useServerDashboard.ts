import { useQuery } from '@tanstack/react-query';
import { serverDashboardApi } from '@/api/serverDashboardApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import { useDashboardRefetchInterval } from '@/features/dashboard/hooks/useDashboardRefetchInterval';

export function useServerDashboard(serverId: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: dashboardQueryKeys.serverDashboard(serverId),
    queryFn: () => serverDashboardApi.getDashboard(serverId),
    enabled: serverId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
