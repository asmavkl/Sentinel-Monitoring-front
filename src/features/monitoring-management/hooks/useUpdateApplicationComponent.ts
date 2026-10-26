import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { monitoringManagementQueryKeys } from './queryKeys';
import type { UpdateComponentRequest } from '@/types/monitoringManagement';

interface UpdateApplicationComponentVariables {
  applicationId: number;
  componentId: number;
  payload: UpdateComponentRequest;
}

export function useUpdateApplicationComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, payload }: UpdateApplicationComponentVariables) =>
      monitoringManagementApi.updateApplicationComponent(componentId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: monitoringManagementQueryKeys.components(variables.applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
    },
  });
}
