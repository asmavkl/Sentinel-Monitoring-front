import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { applicationQueryKeys } from '@/features/applications/hooks/queryKeys';
import { monitoringManagementQueryKeys } from './queryKeys';
import type { UpdateApplicationRequest } from '@/types/monitoringManagement';

interface UpdateMonitoringApplicationVariables {
  id: number;
  payload: UpdateApplicationRequest;
}

export function useUpdateMonitoringApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateMonitoringApplicationVariables) =>
      monitoringManagementApi.updateMonitoringApplication(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
      void queryClient.invalidateQueries({
        queryKey: monitoringManagementQueryKeys.application(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
    },
  });
}
