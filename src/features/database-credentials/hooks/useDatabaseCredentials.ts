import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { databaseCredentialsApi } from '@/api/databaseCredentialsApi';
import { databaseCredentialsQueryKeys } from './queryKeys';
import type {
  CreateDatabaseCredentialRequest,
  TestDatabaseConnectionRequest,
  UpdateDatabaseCredentialRequest,
} from '@/types/databaseCredentials';

function invalidateCredentialQueries(queryClient: ReturnType<typeof useQueryClient>, id?: number) {
  void queryClient.invalidateQueries({ queryKey: databaseCredentialsQueryKeys.list() });

  if (id) {
    void queryClient.invalidateQueries({ queryKey: databaseCredentialsQueryKeys.detail(id) });
  }
}

export function useDatabaseCredentials() {
  return useQuery({
    queryKey: databaseCredentialsQueryKeys.list(),
    queryFn: () => databaseCredentialsApi.getDatabaseCredentials(),
  });
}

export function useDatabaseCredential(id: number) {
  return useQuery({
    queryKey: databaseCredentialsQueryKeys.detail(id),
    queryFn: () => databaseCredentialsApi.getDatabaseCredential(id),
    enabled: id > 0,
  });
}

export function useCreateDatabaseCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDatabaseCredentialRequest) =>
      databaseCredentialsApi.createDatabaseCredential(payload),
    onSuccess: () => {
      invalidateCredentialQueries(queryClient);
    },
  });
}

export function useUpdateDatabaseCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDatabaseCredentialRequest }) =>
      databaseCredentialsApi.updateDatabaseCredential(id, payload),
    onSuccess: (_data, variables) => {
      invalidateCredentialQueries(queryClient, variables.id);
    },
  });
}

export function useDeleteDatabaseCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => databaseCredentialsApi.deleteDatabaseCredential(id),
    onSuccess: (_data, id) => {
      invalidateCredentialQueries(queryClient, id);
    },
  });
}

export function useDeactivateDatabaseCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => databaseCredentialsApi.deactivateDatabaseCredential(id),
    onSuccess: (_data, id) => {
      invalidateCredentialQueries(queryClient, id);
    },
  });
}

export function useActivateDatabaseCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => databaseCredentialsApi.activateDatabaseCredential(id),
    onSuccess: (_data, id) => {
      invalidateCredentialQueries(queryClient, id);
    },
  });
}

export function useTestDatabaseConnection() {
  return useMutation({
    mutationFn: (payload: TestDatabaseConnectionRequest) =>
      databaseCredentialsApi.testDatabaseConnection(payload),
  });
}

export function useTestDatabaseCredential() {
  return useMutation({
    mutationFn: (id: number) => databaseCredentialsApi.testDatabaseCredential(id),
  });
}
