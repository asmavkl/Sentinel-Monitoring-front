import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkManagementQueryKeys } from '@/features/check-management/hooks/queryKeys';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import { databaseHealthMonitoringApi } from '@/api/databaseHealthMonitoringApi';
import { databaseHealthMonitoringQueryKeys } from './queryKeys';
import type {
  AddDatabaseHealthMonitoringRequest,
  ProvisionDatabaseHealthMonitoringRequest,
} from '@/types/databaseHealthMonitoring';

function invalidateDatabaseHealthMonitoringQueries(queryClient: ReturnType<typeof useQueryClient>, applicationId: number) {
  void queryClient.invalidateQueries({ queryKey: databaseHealthMonitoringQueryKeys.provisionedChecks(applicationId) });
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard(applicationId) });
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.applicationChecks(applicationId) });
  void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.checks() });
  void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.applications() });
}

export function useProvisionedChecks(applicationId: number) {
  return useQuery({
    queryKey: databaseHealthMonitoringQueryKeys.provisionedChecks(applicationId),
    queryFn: () => databaseHealthMonitoringApi.getProvisionedChecks(applicationId),
    enabled: applicationId > 0,
  });
}

export function useAvailableHealthQueries(applicationId: number, databaseCredentialId: number) {
  return useQuery({
    queryKey: databaseHealthMonitoringQueryKeys.availableQueries(applicationId, databaseCredentialId),
    queryFn: () => databaseHealthMonitoringApi.getAvailableHealthQueries(applicationId, databaseCredentialId),
    enabled: applicationId > 0 && databaseCredentialId > 0,
  });
}

export function useProvisionDatabaseHealthMonitoring(applicationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProvisionDatabaseHealthMonitoringRequest) =>
      databaseHealthMonitoringApi.provisionDatabaseHealthMonitoring(applicationId, payload),
    onSuccess: () => {
      invalidateDatabaseHealthMonitoringQueries(queryClient, applicationId);
    },
  });
}

export function useAddDatabaseHealthMonitoring(applicationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDatabaseHealthMonitoringRequest) =>
      databaseHealthMonitoringApi.addDatabaseHealthMonitoring(applicationId, payload),
    onSuccess: () => {
      invalidateDatabaseHealthMonitoringQueries(queryClient, applicationId);
    },
  });
}
