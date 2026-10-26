import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { serverDashboardApi } from '@/api/serverDashboardApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import {
  invalidateDashboardOwner,
  type DashboardOwnerScope,
} from '@/features/dashboard/hooks/invalidateDashboardOwner';
import type { UpdateWidgetRequestDto } from '@/types/dashboard';

interface UpdateWidgetVariables {
  widgetId: number;
  payload: UpdateWidgetRequestDto;
}

export function useUpdateWidget(ownerId: number, scope: DashboardOwnerScope = 'application') {
  const queryClient = useQueryClient();
  const api = scope === 'server' ? serverDashboardApi : applicationDashboardApi;

  return useMutation({
    mutationFn: ({ widgetId, payload }: UpdateWidgetVariables) =>
      api.updateWidget(ownerId, widgetId, payload),
    onSuccess: (widget) => {
      invalidateDashboardOwner(queryClient, ownerId, scope);
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.widget(widget.id) });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-sections'] });
    },
  });
}
