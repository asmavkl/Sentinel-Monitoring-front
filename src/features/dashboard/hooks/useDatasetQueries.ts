import { useQuery } from '@tanstack/react-query';
import { datasetApi } from '@/api/datasetApi';
import { dashboardQueryKeys } from './queryKeys';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';

export function useLatestDataset(checkId: number, applicationId?: number, refetchOverrideMs?: number | null) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  return useQuery({
    queryKey: dashboardQueryKeys.datasetLatest(checkId, applicationId ?? 0),
    queryFn: () => datasetApi.getLatestDataset(checkId, applicationId),
    enabled: checkId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}

export function useDatasetHistory(
  checkId: number,
  applicationId?: number,
  query: { from?: string; to?: string; take?: number } = {},
  refetchOverrideMs?: number | null,
) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  return useQuery({
    queryKey: dashboardQueryKeys.datasetHistory(checkId, applicationId ?? 0, query),
    queryFn: () => datasetApi.getDatasetHistory(checkId, { ...query, applicationId }),
    enabled: checkId > 0,
    staleTime: 10_000,
    refetchInterval,
  });
}
