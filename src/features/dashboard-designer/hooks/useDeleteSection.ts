import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardSectionsApi } from '@/api/dashboardSectionsApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import {
  invalidateDashboardOwner,
  type DashboardOwnerScope,
} from '@/features/dashboard/hooks/invalidateDashboardOwner';

export function useDeleteSection(
  ownerId: number,
  dashboardId: number,
  scope: DashboardOwnerScope = 'application',
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: number) => dashboardSectionsApi.deleteSection(dashboardId, sectionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.sections(dashboardId) });
      invalidateDashboardOwner(queryClient, ownerId, scope);
    },
  });
}
