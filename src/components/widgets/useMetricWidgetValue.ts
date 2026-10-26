import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import {
  useMetricAggregate,
  useMetricDefinitions,
  useMetricLatest,
} from '@/features/dashboard/hooks/useMetricQueries';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import type { WidgetConfiguration, WidgetDataSourceDto } from '@/types/widgets';
import type { MetricAggregationOption } from '@/types/metrics';
import {
  readAggregation,
  readMetricId,
  readMetricTimeRange,
} from '@/utils/metricWidget';
import { readRefreshIntervalMs } from '@/utils/widgetThreshold';
import { getPrimaryCheckId, getPrimaryDataSource, getPrimaryMetricId } from '@/utils/widgetDataSource';

export function useResolvedMetricIds(
  configuration: WidgetConfiguration,
  dataSources: WidgetDataSourceDto[],
) {
  const checkId = getPrimaryCheckId(dataSources);
  const configuredMetricId = readMetricId(configuration);
  const sourceMetricId = getPrimaryMetricId(dataSources);
  const metricName = getPrimaryDataSource(dataSources)?.metricName ?? null;
  const refreshOverride = readRefreshIntervalMs(configuration);
  const definitionsQuery = useMetricDefinitions(checkId ?? 0, undefined, refreshOverride);

  const metricId = useMemo(() => {
    if (configuredMetricId != null) {
      return configuredMetricId;
    }

    if (sourceMetricId != null) {
      return sourceMetricId;
    }

    if (!metricName) {
      return null;
    }

    return definitionsQuery.data?.find((item) => item.name === metricName)?.id ?? null;
  }, [configuredMetricId, definitionsQuery.data, metricName, sourceMetricId]);

  return {
    checkId,
    metricId,
    metricName,
    definitionsQuery,
  };
}

export function useMetricWidgetValue(
  configuration: WidgetConfiguration,
  dataSources: WidgetDataSourceDto[],
) {
  const { checkId, metricId, metricName, definitionsQuery } = useResolvedMetricIds(
    configuration,
    dataSources,
  );
  const aggregation = readAggregation(configuration);
  const timeRange = readMetricTimeRange(configuration);
  const refreshOverride = readRefreshIntervalMs(configuration);
  const useLatest = aggregation === 'Latest' || !aggregation;

  const shouldQuery = metricId != null && metricId > 0 && checkId != null && checkId > 0;
  const latestQuery = useMetricLatest(checkId ?? 0, metricId ?? 0, undefined, refreshOverride);
  const aggregateQuery = useMetricAggregate(
    checkId ?? 0,
    metricId ?? 0,
    {
      aggregation: aggregation === 'Latest' || !aggregation ? 'Average' : (aggregation as Exclude<MetricAggregationOption, 'Latest'>),
      from: timeRange,
      to: timeRange,
    },
    !useLatest && shouldQuery,
    refreshOverride,
  );

  const activeQuery = useLatest ? latestQuery : aggregateQuery;
  const value = useLatest ? latestQuery.data?.value : aggregateQuery.data?.value;
  const unit = useLatest ? latestQuery.data?.unit : aggregateQuery.data?.unit;

  return {
    checkId,
    metricId,
    metricName,
    aggregation,
    timeRange,
    value: value ?? null,
    unit: unit ?? null,
    dataUpdatedAt: activeQuery.dataUpdatedAt,
    isLoading: definitionsQuery.isLoading || activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    isEmpty: !definitionsQuery.isLoading && !activeQuery.isLoading && !activeQuery.isError && value == null,
  };
}

export function useMetricWidgetValueWithStatus(
  configuration: WidgetConfiguration,
  dataSources: WidgetDataSourceDto[],
) {
  const { checkId, metricId, metricName, definitionsQuery } = useResolvedMetricIds(
    configuration,
    dataSources,
  );
  const aggregation = readAggregation(configuration);
  const timeRange = readMetricTimeRange(configuration);
  const refreshOverride = readRefreshIntervalMs(configuration);
  const useLatest = aggregation === 'Latest' || !aggregation;

  // Get status from dashboard API
  const statusQuery = useQuery({
    queryKey: dashboardQueryKeys.checkStatus(checkId ?? 0),
    queryFn: () => dashboardApi.getCheckStatus(checkId ?? 0),
    enabled: checkId != null && checkId > 0,
    staleTime: Infinity,
    refetchInterval: false,
  });

  // Get metric value from check metrics API
  const shouldQuery = metricId != null && metricId > 0 && checkId != null && checkId > 0;
  const latestQuery = useMetricLatest(checkId ?? 0, metricId ?? 0, undefined, refreshOverride);
  const aggregateQuery = useMetricAggregate(
    checkId ?? 0,
    metricId ?? 0,
    {
      aggregation: aggregation === 'Latest' || !aggregation ? 'Average' : (aggregation as Exclude<MetricAggregationOption, 'Latest'>),
      from: timeRange,
      to: timeRange,
    },
    !useLatest && shouldQuery,
    refreshOverride,
  );

  const activeQuery = useLatest ? latestQuery : aggregateQuery;
  const value = useLatest ? latestQuery.data?.value : aggregateQuery.data?.value;
  const unit = useLatest ? latestQuery.data?.unit : aggregateQuery.data?.unit;

  return {
    checkId,
    metricId,
    metricName,
    aggregation,
    timeRange,
    value: value ?? null,
    unit: unit ?? null,
    status: statusQuery.data ?? null,
    dataUpdatedAt: activeQuery.dataUpdatedAt,
    isLoading: definitionsQuery.isLoading || activeQuery.isLoading || statusQuery.isLoading,
    isError: activeQuery.isError || statusQuery.isError,
    error: activeQuery.error || statusQuery.error,
    isEmpty: !definitionsQuery.isLoading && !activeQuery.isLoading && !statusQuery.isLoading && !activeQuery.isError && !statusQuery.isError && value == null,
  };
}
