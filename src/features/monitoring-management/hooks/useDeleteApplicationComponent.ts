import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { monitoringManagementQueryKeys } from './queryKeys';

interface DeleteApplicationComponentVariables {
  applicationId: number;
  componentId: number;
}

export function useDeleteApplicationComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId }: DeleteApplicationComponentVariables) =>
      monitoringManagementApi.deleteApplicationComponent(componentId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: monitoringManagementQueryKeys.components(variables.applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
    },
  });
}
