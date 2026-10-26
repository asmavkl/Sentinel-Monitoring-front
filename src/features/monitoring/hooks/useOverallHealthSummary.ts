import { useApplications } from '@/features/applications/hooks/useApplications';
import { summarizeApplicationHealth } from '@/features/applications/utils/summarizeApplicationHealth';
import { useMonitoredServers } from '@/features/server-monitoring/hooks/useMonitoredServers';
import { useMonitoredServerStatuses } from '@/features/server-monitoring/hooks/useMonitoredServers';
import { summarizeServerHealth } from '@/features/server-monitoring/utils/summarizeServerHealth';

export interface OverallHealthSummary {
  up: number;
  warning: number;
  down: number;
  unknown: number;
  outOfService: number;
  total: number;
  isFetching: boolean;
  refetch: () => void;
}

export function useOverallHealthSummary(): OverallHealthSummary {
  const applicationsQuery = useApplications();
  const serversQuery = useMonitoredServers();

  const serverIds = serversQuery.data?.map((server) => server.id) || [];
  const serverStatusesQuery = useMonitoredServerStatuses(serverIds);

  const applicationSummary = summarizeApplicationHealth(applicationsQuery.data);
  const serverSummary = summarizeServerHealth(
    serversQuery.data,
    serverStatusesQuery.map((query) => query.data),
  );

  const combinedSummary: OverallHealthSummary = {
    up: applicationSummary.up + serverSummary.up,
    warning: applicationSummary.warning + serverSummary.warning,
    down: applicationSummary.down + serverSummary.down,
    unknown: applicationSummary.unknown + serverSummary.unknown,
    outOfService: applicationSummary.outOfService + serverSummary.outOfService,
    total: applicationSummary.total + serverSummary.total,
    isFetching:
      applicationsQuery.isFetching ||
      serversQuery.isFetching ||
      serverStatusesQuery.some((query) => query.isFetching),
    refetch: () => {
      void applicationsQuery.refetch();
      void serversQuery.refetch();
      serverStatusesQuery.forEach((query) => {
        void query.refetch();
      });
    },
  };

  return combinedSummary;
}
