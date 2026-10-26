import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { monitoredServersApi, DEFAULT_METRIC_HISTORY_LIMIT } from '@/api/monitoredServersApi';
import { useDashboardRefetchInterval } from '@/features/dashboard/hooks/useDashboardRefetchInterval';
import type {
  CreateMonitoredServerRequest,
  UpdateMonitoredServerRequest,
  UpdateServerMetricCriteriaRequest,
} from '@/types/monitoredServers';
import { monitoredServersQueryKeys } from './queryKeys';
import { summarizeServerHealth } from '@/features/server-monitoring/utils/summarizeServerHealth';

function invalidateServerQueries(queryClient: ReturnType<typeof useQueryClient>, id?: number) {
  void queryClient.invalidateQueries({ queryKey: monitoredServersQueryKeys.list() });

  if (id) {
    void queryClient.invalidateQueries({ queryKey: monitoredServersQueryKeys.detail(id) });
    void queryClient.invalidateQueries({ queryKey: monitoredServersQueryKeys.status(id) });
    void queryClient.invalidateQueries({ queryKey: monitoredServersQueryKeys.metrics(id) });
  }
}

export function useMonitoredServers() {
  return useQuery({
    queryKey: monitoredServersQueryKeys.list(),
    queryFn: () => monitoredServersApi.getMonitoredServers(),
  });
}

export function useMonitoredServer(id: number) {
  return useQuery({
    queryKey: monitoredServersQueryKeys.detail(id),
    queryFn: () => monitoredServersApi.getMonitoredServer(id),
    enabled: id > 0,
  });
}

export function useMonitoredServerStatus(id: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: monitoredServersQueryKeys.status(id),
    queryFn: () => monitoredServersApi.getServerStatus(id),
    enabled: id > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}

export function useMonitoredServerStatuses(serverIds: number[]) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQueries({
    queries: serverIds.map((id) => ({
      queryKey: monitoredServersQueryKeys.status(id),
      queryFn: () => monitoredServersApi.getServerStatus(id),
      enabled: id > 0,
      staleTime: 10_000,
      refetchInterval,
    })),
  });
}

export function useServerMetrics(id: number) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: monitoredServersQueryKeys.metrics(id),
    queryFn: () => monitoredServersApi.getServerMetrics(id),
    enabled: id > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}

export function useServerMetricHistory(
  serverId: number,
  metricDefinitionId: number | null,
  limit = DEFAULT_METRIC_HISTORY_LIMIT,
) {
  const refetchInterval = useDashboardRefetchInterval();

  return useQuery({
    queryKey: monitoredServersQueryKeys.history(serverId, metricDefinitionId ?? 0, limit),
    queryFn: () => monitoredServersApi.getMetricHistory(serverId, metricDefinitionId ?? 0, limit),
    enabled: serverId > 0 && metricDefinitionId != null && metricDefinitionId > 0,
    refetchInterval,
  });
}

export function useServerMetricCriteria(
  serverId: number,
  metricDefinitionId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: monitoredServersQueryKeys.criteria(serverId, metricDefinitionId ?? 0),
    queryFn: () => monitoredServersApi.getMetricCriteria(serverId, metricDefinitionId ?? 0),
    enabled: enabled && serverId > 0 && metricDefinitionId != null && metricDefinitionId > 0,
  });
}

export function useCreateMonitoredServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMonitoredServerRequest) =>
      monitoredServersApi.createMonitoredServer(payload),
    onSuccess: () => {
      invalidateServerQueries(queryClient);
    },
  });
}

export function useUpdateMonitoredServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMonitoredServerRequest }) =>
      monitoredServersApi.updateMonitoredServer(id, payload),
    onSuccess: (_data, variables) => {
      invalidateServerQueries(queryClient, variables.id);
    },
  });
}

export function useActivateMonitoredServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monitoredServersApi.activateMonitoredServer(id),
    onSuccess: (_data, id) => {
      invalidateServerQueries(queryClient, id);
    },
  });
}

export function useDeactivateMonitoredServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monitoredServersApi.deactivateMonitoredServer(id),
    onSuccess: (_data, id) => {
      invalidateServerQueries(queryClient, id);
    },
  });
}

export function useDeleteMonitoredServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monitoredServersApi.deleteMonitoredServer(id),
    onSuccess: (_data, id) => {
      invalidateServerQueries(queryClient, id);
    },
  });
}

export function useUpdateServerMetricCriteria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serverId,
      metricDefinitionId,
      payload,
    }: {
      serverId: number;
      metricDefinitionId: number;
      payload: UpdateServerMetricCriteriaRequest;
    }) => monitoredServersApi.updateMetricCriteria(serverId, metricDefinitionId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: monitoredServersQueryKeys.criteria(variables.serverId, variables.metricDefinitionId),
      });
      void queryClient.invalidateQueries({
        queryKey: monitoredServersQueryKeys.status(variables.serverId),
      });
    },
  });
}

export function useServerHealthSummary() {
  const serversQuery = useMonitoredServers();
  const serverIds = serversQuery.data?.map((server) => server.id) || [];
  const serverStatusesQuery = useMonitoredServerStatuses(serverIds);

  const serverSummary = summarizeServerHealth(
    serversQuery.data,
    serverStatusesQuery.map((query) => query.data),
  );

  return {
    ...serverSummary,
    isFetching: serversQuery.isFetching || serverStatusesQuery.some((query) => query.isFetching),
    refetch: () => {
      void serversQuery.refetch();
      serverStatusesQuery.forEach((query) => {
        void query.refetch();
      });
    },
  };
}
