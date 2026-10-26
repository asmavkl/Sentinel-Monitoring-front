import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardSectionsApi } from '@/api/dashboardSectionsApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import {
  invalidateDashboardOwner,
  type DashboardOwnerScope,
} from '@/features/dashboard/hooks/invalidateDashboardOwner';
import type { CreateSectionRequestDto } from '@/types/dashboard';

export function useCreateSection(
  ownerId: number,
  dashboardId: number,
  scope: DashboardOwnerScope = 'application',
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSectionRequestDto) =>
      dashboardSectionsApi.createSection(dashboardId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.sections(dashboardId) });
      invalidateDashboardOwner(queryClient, ownerId, scope);
    },
  });
}
