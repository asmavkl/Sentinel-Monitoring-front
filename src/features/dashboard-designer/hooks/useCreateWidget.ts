import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { serverDashboardApi } from '@/api/serverDashboardApi';
import {
  invalidateDashboardOwner,
  type DashboardOwnerScope,
} from '@/features/dashboard/hooks/invalidateDashboardOwner';
import type { CreateWidgetRequestDto } from '@/types/dashboard';

export function useCreateWidget(ownerId: number, scope: DashboardOwnerScope = 'application') {
  const queryClient = useQueryClient();
  const api = scope === 'server' ? serverDashboardApi : applicationDashboardApi;

  return useMutation({
    mutationFn: (payload: CreateWidgetRequestDto) => api.createWidget(ownerId, payload),
    onSuccess: () => {
      invalidateDashboardOwner(queryClient, ownerId, scope);
      void queryClient.invalidateQueries({ queryKey: ['dashboard-sections'] });
    },
  });
}
