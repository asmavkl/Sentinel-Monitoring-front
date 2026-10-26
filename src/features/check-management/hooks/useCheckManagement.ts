import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkManagementApi } from '@/api/checkManagementApi';
import { databaseCredentialsApi } from '@/api/databaseCredentialsApi';
import { applicationQueryKeys } from '@/features/applications/hooks/queryKeys';
import { databaseCredentialsQueryKeys } from '@/features/database-credentials/hooks/queryKeys';
import { monitoringManagementQueryKeys } from '@/features/monitoring-management/hooks/queryKeys';
import { checkManagementQueryKeys } from './queryKeys';
import type { CreateCheckRequest, CreateCriteriaRequest, UpdateCheckRequest } from '@/types/checkManagement';
import type { PaginationQuery } from '@/types/api';

function invalidateCheckQueries(queryClient: ReturnType<typeof useQueryClient>, checkId?: number) {
  void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.checks() });
  void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.applications() });
  void queryClient.invalidateQueries({ queryKey: monitoringManagementQueryKeys.applications() });
  void queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all });

  if (checkId) {
    void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.check(checkId) });
    void queryClient.invalidateQueries({ queryKey: checkManagementQueryKeys.criteria(checkId) });
  }
}

export function useChecks(query: PaginationQuery = { pageNumber: 1, pageSize: 10 }) {
  const normalizedQuery = { pageNumber: query.pageNumber ?? 1, pageSize: query.pageSize ?? 10 };
  return useQuery({
    queryKey: checkManagementQueryKeys.checks(normalizedQuery),
    queryFn: () => checkManagementApi.getChecks(normalizedQuery),
  });
}

export function useCheck(id: number) {
  return useQuery({
    queryKey: checkManagementQueryKeys.check(id),
    queryFn: () => checkManagementApi.getCheck(id),
    enabled: id > 0,
  });
}

export function useMonitoringApplications() {
  return useQuery({
    queryKey: checkManagementQueryKeys.applications(),
    queryFn: async () => {
      const paged = await checkManagementApi.getMonitoringApplications();
      return paged.items;
    },
  });
}

export function useApplicationComponents(applicationId: number) {
  return useQuery({
    queryKey: checkManagementQueryKeys.components(applicationId),
    queryFn: () => checkManagementApi.getApplicationComponents(applicationId),
    enabled: applicationId > 0,
  });
}

export function useDatabaseCredentials(enabled = true) {
  return useQuery({
    queryKey: databaseCredentialsQueryKeys.list(),
    queryFn: () => databaseCredentialsApi.getDatabaseCredentials(),
    enabled,
  });
}

export function useCreateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCheckRequest) => checkManagementApi.createCheck(payload),
    onSuccess: () => {
      invalidateCheckQueries(queryClient);
    },
  });
}

export function useUpdateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCheckRequest }) =>
      checkManagementApi.updateCheck(id, payload),
    onSuccess: (_data, variables) => {
      invalidateCheckQueries(queryClient, variables.id);
    },
  });
}

export function useDeleteCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => checkManagementApi.deleteCheck(id),
    onSuccess: (_data, id) => {
      invalidateCheckQueries(queryClient, id);
    },
  });
}

export function useActivateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => checkManagementApi.activateCheck(id),
    onSuccess: (_data, id) => {
      invalidateCheckQueries(queryClient, id);
    },
  });
}

export function useDeactivateCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => checkManagementApi.deactivateCheck(id),
    onSuccess: (_data, id) => {
      invalidateCheckQueries(queryClient, id);
    },
  });
}

export function useCheckDataset(checkId: number, applicationId: number) {
  return useQuery({
    queryKey: checkManagementQueryKeys.checkDataset(checkId, applicationId),
    queryFn: () => checkManagementApi.getCheckDataset(checkId, applicationId),
    enabled: checkId > 0 && applicationId > 0,
  });
}

export function useCheckCriteria(checkId: number) {
  return useQuery({
    queryKey: checkManagementQueryKeys.criteria(checkId),
    queryFn: () => checkManagementApi.getCheckCriteria(checkId),
    enabled: checkId > 0,
  });
}

export function useCreateCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checkId, payload }: { checkId: number; payload: CreateCriteriaRequest }) =>
      checkManagementApi.createCheckCriteria(checkId, payload),
    onSuccess: (_data, variables) => {
      invalidateCheckQueries(queryClient, variables.checkId);
    },
  });
}

export function useUpdateCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ criteriaId, payload }: { checkId: number; criteriaId: number; payload: CreateCriteriaRequest }) =>
      checkManagementApi.updateCheckCriteria(criteriaId, payload),
    onSuccess: (_data, variables) => {
      invalidateCheckQueries(queryClient, variables.checkId);
    },
  });
}

export function useDeleteCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ criteriaId }: { checkId: number; criteriaId: number }) =>
      checkManagementApi.deleteCheckCriteria(criteriaId),
    onSuccess: (_data, variables) => {
      invalidateCheckQueries(queryClient, variables.checkId);
    },
  });
}

export function useRunCheck() {
  return useMutation({
    mutationFn: (id: number) => checkManagementApi.runCheck(id),
  });
}
