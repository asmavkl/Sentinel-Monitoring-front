import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { dashboardQueryKeys } from './queryKeys';

const DASHBOARD_QUERY_PREFIXES = [
  ['application-overview'],
  ['application-components'],
  ['application-dashboard'],
  ['dashboard-layout'],
  ['check-status'],
  ['check-metrics'],
  ['check-history'],
  ['component-details'],
  ['dashboard-widget'],
] as const;

export function useDashboardRefresh(applicationId: number) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      await Promise.all(
        DASHBOARD_QUERY_PREFIXES.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      const overviewFailed =
        queryClient.getQueryState(dashboardQueryKeys.overview(applicationId))?.status === 'error';
      const componentsFailed =
        queryClient.getQueryState(dashboardQueryKeys.components(applicationId))?.status === 'error';
      const dashboardFailed =
        queryClient.getQueryState(dashboardQueryKeys.dashboard(applicationId))?.status === 'error';
      const layoutFailed =
        queryClient.getQueryState(dashboardQueryKeys.layout(applicationId))?.status === 'error';

      if (overviewFailed || componentsFailed || dashboardFailed || layoutFailed) {
        setRefreshError('بروزرسانی داشبورد ممکن نیست');
      }
    } catch {
      setRefreshError('بروزرسانی داشبورد ممکن نیست');
    } finally {
      setIsRefreshing(false);
    }
  }, [applicationId, queryClient]);

  return {
    refreshDashboard,
    isRefreshing,
    refreshError,
  };
}
