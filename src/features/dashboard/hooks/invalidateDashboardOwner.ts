import type { QueryClient } from '@tanstack/react-query';
import { dashboardQueryKeys } from './queryKeys';

export type DashboardOwnerScope = 'application' | 'server';

export function invalidateDashboardOwner(
  queryClient: QueryClient,
  ownerId: number,
  scope: DashboardOwnerScope,
) {
  if (scope === 'server') {
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.serverDashboard(ownerId) });
    return;
  }

  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard(ownerId) });
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.layout(ownerId) });
}
