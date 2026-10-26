export const monitoredServersQueryKeys = {
  all: ['monitored-servers'] as const,
  list: () => [...monitoredServersQueryKeys.all, 'list'] as const,
  detail: (id: number) => [...monitoredServersQueryKeys.all, 'detail', id] as const,
  status: (id: number) => [...monitoredServersQueryKeys.all, 'status', id] as const,
  metrics: (id: number) => [...monitoredServersQueryKeys.all, 'metrics', id] as const,
  history: (serverId: number, metricDefinitionId: number, limit: number) =>
    [...monitoredServersQueryKeys.all, 'history', serverId, metricDefinitionId, limit] as const,
  criteria: (serverId: number, metricDefinitionId: number) =>
    [...monitoredServersQueryKeys.all, 'criteria', serverId, metricDefinitionId] as const,
};
