import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { serverDashboardApi } from '@/api/serverDashboardApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import {
  invalidateDashboardOwner,
  type DashboardOwnerScope,
} from '@/features/dashboard/hooks/invalidateDashboardOwner';

export function useDeleteWidget(ownerId: number, scope: DashboardOwnerScope = 'application') {
  const queryClient = useQueryClient();
  const api = scope === 'server' ? serverDashboardApi : applicationDashboardApi;

  return useMutation({
    mutationFn: (widgetId: number) => api.deleteWidget(ownerId, widgetId),
    onSuccess: (_data, widgetId) => {
      invalidateDashboardOwner(queryClient, ownerId, scope);
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.widget(widgetId) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-sections'] });
    },
  });
}
