import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '@/api/applicationsApi';
import type { ApplicationListItem, ApplicationStatusDto } from '@/types/applications';
import { normalizeApplicationPriority } from '@/features/monitoring-management/utils/applicationPriority';
import { mapApplicationHealthStatus } from '@/utils/status';
import { applicationQueryKeys } from './queryKeys';

function applyApplicationStatus(item: ApplicationListItem, statusData: ApplicationStatusDto): ApplicationListItem {
  const calculatedStatus = mapApplicationHealthStatus(statusData.calculatedHealthStatus);
  const availabilityStatus = mapApplicationHealthStatus(statusData.availabilityStatus);

  return {
    ...item,
    status: calculatedStatus,
    availabilityStatus: availabilityStatus !== calculatedStatus ? availabilityStatus : undefined,
    lastUpdate: statusData.calculatedAt,
  };
}

async function fetchApplicationsWithStatus(): Promise<ApplicationListItem[]> {
  const pagedResult = await applicationsApi.getApplications();
  const applications = pagedResult.items;

  const statuses = await Promise.allSettled(
    applications.map((application) => applicationsApi.getApplicationStatus(application.id)),
  );

  return applications.map((application, index) => {
    const statusResult = statuses[index];
    const priority = normalizeApplicationPriority(application.priority);

    if (statusResult.status === 'fulfilled') {
      return applyApplicationStatus(
        {
          id: application.id,
          name: application.name,
          code: application.code,
          isActive: application.isActive,
          priority,
          status: 'UNKNOWN',
          lastUpdate: null,
        },
        statusResult.value,
      );
    }

    return {
      id: application.id,
      name: application.name,
      code: application.code,
      isActive: application.isActive,
      priority,
      status: 'UNKNOWN' as const,
      availabilityStatus: undefined,
      lastUpdate: null,
    };
  });
}

export function useRefreshApplicationStatus(applicationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applicationsApi.getApplicationStatus(applicationId),
    onSuccess: (statusData) => {
      queryClient.setQueryData<ApplicationListItem[]>(applicationQueryKeys.list(), (current) =>
        current?.map((item) => (item.id === applicationId ? applyApplicationStatus(item, statusData) : item)),
      );
    },
  });
}

export function useApplications() {
  return useQuery({
    queryKey: applicationQueryKeys.list(),
    queryFn: fetchApplicationsWithStatus,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}
