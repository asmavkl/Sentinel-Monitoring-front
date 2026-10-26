import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { monitoringManagementQueryKeys } from './queryKeys';
import type { CreateComponentRequest } from '@/types/monitoringManagement';

export function useCreateApplicationComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateComponentRequest) =>
      monitoringManagementApi.createApplicationComponent(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: monitoringManagementQueryKeys.components(variables.applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
      void queryClient.invalidateQueries({
        queryKey: monitoringManagementQueryKeys.application(variables.applicationId),
      });
    },
  });
}
