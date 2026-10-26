import { useQuery } from '@tanstack/react-query';
import { checkMetricsApi } from '@/api/checkMetricsApi';
import { dashboardQueryKeys } from './queryKeys';
import type { MetricAggregateQuery, MetricHistoryQuery } from '@/types/metrics';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';
import { resolveTimeRangeBounds } from '@/utils/metricWidget';

export function useMetricDefinitions(checkId: number, applicationId?: number, refetchOverrideMs?: number | null) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  return useQuery({
    queryKey: [...dashboardQueryKeys.metricDefinitions(checkId), applicationId ?? null],
    queryFn: () => checkMetricsApi.getMetricDefinitions(checkId, applicationId),
    enabled: checkId > 0,
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}

export function useMetricDefinition(checkId: number, metricId: number, applicationId?: number, refetchOverrideMs?: number | null) {
  const definitionsQuery = useMetricDefinitions(checkId, applicationId, refetchOverrideMs);
  const definition =
    metricId > 0
      ? ((definitionsQuery.data ?? []).find((item) => item.id === metricId) ?? null)
      : null;

  return {
    ...definitionsQuery,
    data: definition,
  };
}

export function useMetricHistory(
  checkId: number,
  metricId: number,
  query: MetricHistoryQuery = {},
  refetchOverrideMs?: number | null,
) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);
  const timeRange = query.from as string || '24h';

  return useQuery({
    queryKey: dashboardQueryKeys.metricHistory(checkId, metricId, { take: query.take, from: timeRange }),
    queryFn: () => {
      const bounds = resolveTimeRangeBounds(timeRange);
      return checkMetricsApi.getMetricHistory(checkId, metricId, {
        from: bounds.from,
        to: bounds.to,
        take: query.take,
      });
    },
    enabled: checkId > 0 && metricId > 0,
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}

export function useMetricLatest(
  checkId: number,
  metricId: number,
  applicationId?: number,
  refetchOverrideMs?: number | null,
) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  return useQuery({
    queryKey: [...dashboardQueryKeys.metricLatest(checkId, metricId), applicationId ?? null],
    queryFn: () => checkMetricsApi.getMetricLatest(checkId, metricId, applicationId),
    enabled: checkId > 0 && metricId > 0,
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}

export function useMetricAggregate(
  checkId: number,
  metricId: number,
  query: MetricAggregateQuery,
  enabled = true,
  refetchOverrideMs?: number | null,
) {
  const refetchInterval = useDashboardRefetchInterval(refetchOverrideMs);

  return useQuery({
    queryKey: dashboardQueryKeys.metricAggregate(checkId, metricId, {
      aggregation: query.aggregation,
    }),
    queryFn: () => {
      const bounds = resolveTimeRangeBounds(query.from as string || '24h');
      return checkMetricsApi.getMetricAggregate(checkId, metricId, {
        aggregation: query.aggregation,
        from: bounds.from,
        to: bounds.to,
      });
    },
    enabled: enabled && checkId > 0 && metricId > 0 && Boolean(query.aggregation),
    staleTime: refetchInterval === false ? Infinity : ((refetchInterval ?? 300_000) * 2),
    refetchInterval,
  });
}
