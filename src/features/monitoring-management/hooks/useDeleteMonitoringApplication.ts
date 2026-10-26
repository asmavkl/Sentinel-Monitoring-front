import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { applicationQueryKeys } from '@/features/applications/hooks/queryKeys';
import { monitoringManagementQueryKeys } from './queryKeys';

export function useDeleteMonitoringApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monitoringManagementApi.deleteMonitoringApplication(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
      void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.application(id) });
      void queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });
    },
  });
}
