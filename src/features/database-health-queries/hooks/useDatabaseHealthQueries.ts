import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { databaseHealthQueriesApi } from '@/api/databaseHealthQueriesApi';
import type {
  CreateDatabaseHealthQueryRequest,
  DatabaseHealthQueryListFilters,
  UpdateDatabaseHealthQueryRequest,
} from '@/types/databaseHealthQueries';
import { databaseHealthQueryKeys } from './queryKeys';

function invalidateHealthQueryCache(queryClient: ReturnType<typeof useQueryClient>, id?: number) {
  void queryClient.invalidateQueries({ queryKey: databaseHealthQueryKeys.lists() });

  if (id) {
    void queryClient.invalidateQueries({ queryKey: databaseHealthQueryKeys.detail(id) });
  } else {
    void queryClient.invalidateQueries({ queryKey: databaseHealthQueryKeys.all });
  }
}

export function useDatabaseHealthQueries(
  filters: DatabaseHealthQueryListFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: databaseHealthQueryKeys.list(filters),
    queryFn: () => databaseHealthQueriesApi.getDatabaseHealthQueries(filters),
    enabled,
  });
}

export function useDatabaseHealthQuery(id: number) {
  return useQuery({
    queryKey: databaseHealthQueryKeys.detail(id),
    queryFn: () => databaseHealthQueriesApi.getDatabaseHealthQuery(id),
    enabled: id > 0,
  });
}

export function useCreateDatabaseHealthQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDatabaseHealthQueryRequest) =>
      databaseHealthQueriesApi.createDatabaseHealthQuery(payload),
    onSuccess: () => {
      invalidateHealthQueryCache(queryClient);
    },
  });
}

export function useUpdateDatabaseHealthQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDatabaseHealthQueryRequest }) =>
      databaseHealthQueriesApi.updateDatabaseHealthQuery(id, payload),
    onSuccess: (_data, variables) => {
      invalidateHealthQueryCache(queryClient, variables.id);
    },
  });
}

export function useActivateDatabaseHealthQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => databaseHealthQueriesApi.activateDatabaseHealthQuery(id),
    onSuccess: (_data, id) => {
      invalidateHealthQueryCache(queryClient, id);
    },
  });
}

export function useDeactivateDatabaseHealthQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => databaseHealthQueriesApi.deactivateDatabaseHealthQuery(id),
    onSuccess: (_data, id) => {
      invalidateHealthQueryCache(queryClient, id);
    },
  });
};
