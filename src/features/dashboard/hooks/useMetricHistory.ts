import { useQuery } from '@tanstack/react-query';
import { checkMetricsApi } from '@/api/checkMetricsApi';
import { dashboardQueryKeys } from './queryKeys';
import type { MultiSeriesMetricHistoryQuery } from '../types/metricHistory';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';
import { resolveTimeRangeBounds } from '@/utils/metricWidget';

export function useMultiSeriesMetricHistory(
  checkId: number,
  query: MultiSeriesMetricHistoryQuery = {},
  refetchOverrideMs?: number | null,
) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  // Create a stable query key that doesn't change on every render
  // Use array for metricIds to ensure stable comparison
  const stableMetricIds = query.metricIds?.sort() ?? [];
  const hasTimeRange = query.from && query.to;

  return useQuery({
    queryKey: dashboardQueryKeys.metricHistory(checkId, 0, {
      take: query.take,
      metricIds: stableMetricIds,
      // Include from/to in queryKey to trigger refetch when time range changes
      from: hasTimeRange ? query.from : 'dynamic',
      to: hasTimeRange ? query.to : 'dynamic',
    }),
    queryFn: () => {
      // If from/to are not provided, resolve from time range string
      const bounds = hasTimeRange
        ? { from: query.from as string, to: query.to as string }
        : resolveTimeRangeBounds('24h');

      return checkMetricsApi.getMultiSeriesMetricHistory(checkId, {
        metricIds: query.metricIds,
        from: bounds.from,
        to: bounds.to,
        take: query.take,
      });
    },
    enabled: checkId > 0,
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}
