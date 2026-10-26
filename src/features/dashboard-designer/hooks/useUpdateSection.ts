import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardSectionsApi } from '@/api/dashboardSectionsApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import {
  invalidateDashboardOwner,
  type DashboardOwnerScope,
} from '@/features/dashboard/hooks/invalidateDashboardOwner';
import type { UpdateSectionRequestDto } from '@/types/dashboard';

interface UpdateSectionVariables {
  sectionId: number;
  payload: UpdateSectionRequestDto;
}

export function useUpdateSection(
  ownerId: number,
  dashboardId: number,
  scope: DashboardOwnerScope = 'application',
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, payload }: UpdateSectionVariables) =>
      dashboardSectionsApi.updateSection(dashboardId, sectionId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.sections(dashboardId) });
      invalidateDashboardOwner(queryClient, ownerId, scope);
    },
  });
}
