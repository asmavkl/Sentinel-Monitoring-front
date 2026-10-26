import { useQuery } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { monitoringManagementQueryKeys } from './queryKeys';

export function useApplicationComponents(applicationId: number) {
  return useQuery({
    queryKey: monitoringManagementQueryKeys.components(applicationId),
    queryFn: () => monitoringManagementApi.getApplicationComponents(applicationId),
    enabled: applicationId > 0,
  });
}
