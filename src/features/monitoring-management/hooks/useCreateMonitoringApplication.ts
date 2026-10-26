import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { applicationQueryKeys } from '@/features/applications/hooks/queryKeys';
import { monitoringManagementQueryKeys } from './queryKeys';
import type { CreateApplicationRequest } from '@/types/monitoringManagement';

export function useCreateMonitoringApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApplicationRequest) =>
      monitoringManagementApi.createMonitoringApplication(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
      void queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
    },
  });
}
