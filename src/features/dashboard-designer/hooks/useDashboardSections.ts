import { useQuery } from '@tanstack/react-query';
import { dashboardSectionsApi } from '@/api/dashboardSectionsApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';

export function useDashboardSections(dashboardId: number) {
  return useQuery({
    queryKey: dashboardQueryKeys.sections(dashboardId),
    queryFn: () => dashboardSectionsApi.getSections(dashboardId),
    enabled: dashboardId > 0,
    staleTime: 10_000,
  });
}
