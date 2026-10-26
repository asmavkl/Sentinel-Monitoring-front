import { useQuery } from '@tanstack/react-query';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { normalizeApplicationPriority } from '../utils/applicationPriority';
import { monitoringManagementQueryKeys } from './queryKeys';
import type { MonitoringApplicationListItem } from '@/types/monitoringManagement';

export function useMonitoringApplications() {
  return useQuery({
    queryKey: monitoringManagementQueryKeys.applications(),
    queryFn: async (): Promise<MonitoringApplicationListItem[]> => {
      const paged = await monitoringManagementApi.getMonitoringApplications();

      return Promise.all(
        paged.items.map(async (application) => {
          const [componentCount, checkCount] = await Promise.all([
            monitoringManagementApi
              .getApplicationComponents(application.id)
              .then((components) => components.length)
              .catch(() => null),
            monitoringManagementApi
              .getApplicationChecks(application.id)
              .then((checks) => checks.length)
              .catch(() => null),
          ]);

          return {
            ...application,
            priority: normalizeApplicationPriority(application.priority),
            componentCount,
            checkCount,
          };
        }),
      );
    },
  });
}

export function useMonitoringApplication(applicationId: number) {
  return useQuery({
    queryKey: monitoringManagementQueryKeys.application(applicationId),
    queryFn: () => monitoringManagementApi.getMonitoringApplication(applicationId),
    enabled: applicationId > 0,
  });
}
