import { useQuery } from '@tanstack/react-query';
import { dashboardTemplatesApi } from '@/api/dashboardTemplatesApi';

export const dashboardTemplatesQueryKey = ['dashboard-templates'] as const;

export function useDashboardTemplates(enabled = true) {
  return useQuery({
    queryKey: dashboardTemplatesQueryKey,
    queryFn: () => dashboardTemplatesApi.getTemplates(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
