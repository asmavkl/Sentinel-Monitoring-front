import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { checkMetricsApi } from '@/api/checkMetricsApi';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';
import type { WidgetDto } from '@/types/dashboard';
import { readAggregation, readMetricId, readMetricTimeRange, resolveTimeRangeBounds } from '@/utils/metricWidget';
import { getPrimaryCheckId, getPrimaryDataSource } from '@/utils/widgetDataSource';
import { readDataSourceType } from '@/utils/datasetWidget';

export function useWidgetRefresh() {
  const queryClient = useQueryClient();

  return useCallback(
    async (widget: WidgetDto) => {
      const checkId = getPrimaryCheckId(widget.dataSources ?? []);
      const checkType = widget.dataSources?.[0]?.status?.checkType;
      const applicationId = widget.dataSources?.[0]?.applicationId ?? null;
      if (!checkId) {
        return;
      }

      // Check if this is a chart widget based on widgetType
      const isChartWidget = widget.widgetType === 'Chart';
      const isTableWidget = widget.widgetType === 'Table';
      const isNumberCard = widget.widgetType === 'NumberCard';
      const isProgressBar = widget.widgetType === 'ProgressBar';
      const dataSourceType = readDataSourceType(widget.configuration);
      const isDatabaseCheck = checkType === 2; // DatabaseQuery or SqlQuery (both have value 2)

      // For table widgets, always assume dataset (tables only show dataset data)
      if (isTableWidget) {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'dataset-latest' && key[1] === checkId;
          },
        });
        // Invalidate dashboard query to update lastExecutionTime in dataSources
        if (applicationId) {
          await queryClient.invalidateQueries({
            queryKey: dashboardQueryKeys.dashboard(applicationId),
          });
        }
        return;
      }

      if (isChartWidget && (dataSourceType === 'Dataset' || isDatabaseCheck)) {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key[0] === 'dataset-history' && key[1] === checkId;
          },
        });
        // Invalidate dashboard query to update lastExecutionTime in dataSources
        if (applicationId) {
          await queryClient.invalidateQueries({
            queryKey: dashboardQueryKeys.dashboard(applicationId),
          });
        }
        return;
      }

      if (isProgressBar) {
        await Promise.all(
          (widget.dataSources ?? []).map(async (source) => {
            const sourceCheckId = source.checkId;
            const metricId = source.metricDefinitionId ?? source.metricId;
            if (sourceCheckId == null || metricId == null) {
              return;
            }

            await queryClient.invalidateQueries({
              queryKey: dashboardQueryKeys.metricLatest(sourceCheckId, metricId),
            });
          }),
        );
        // Invalidate dashboard query to update lastExecutionTime in dataSources
        if (applicationId) {
          await queryClient.invalidateQueries({
            queryKey: dashboardQueryKeys.dashboard(applicationId),
          });
        }
        return;
      }

      if (isChartWidget || isNumberCard) {
        // This is a chart widget or number card - call appropriate API based on chart type
        let metricId = readMetricId(widget.configuration);
        const timeRange = readMetricTimeRange(widget.configuration);
        const chartType = widget.configuration.chartType as string || 'line';
        const aggregation = readAggregation(widget.configuration);

        // If metricId not in config, resolve from metricName
        if (metricId == null) {
          const metricName = getPrimaryDataSource(widget.dataSources ?? [])?.metricName ?? null;
          if (metricName) {
            try {
              const definitions = await checkMetricsApi.getMetricDefinitions(checkId);
              metricId = definitions.find((item) => item.name === metricName)?.id ?? null;
            } catch (error) {
              console.error('Failed to get metric definitions:', error);
            }
          }
        }

        if (metricId != null) {
          try {
            // For number cards, we only need to refresh latest/aggregate and status
            if (isNumberCard) {
              // Invalidate status query
              await queryClient.invalidateQueries({
                queryKey: dashboardQueryKeys.checkStatus(checkId),
              });
              // Invalidate both latest and aggregate queries for number card
              await queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey;
                  return (
                    Array.isArray(key) &&
                    key[0] === 'check-metric-latest' &&
                    key[1] === checkId &&
                    key[2] === metricId
                  );
                },
              });
              await queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey;
                  return (
                    Array.isArray(key) &&
                    key[0] === 'check-metric-aggregate' &&
                    key[1] === checkId &&
                    key[2] === metricId
                  );
                },
              });
              // Invalidate dashboard query to update lastExecutionTime in dataSources
              if (applicationId) {
                await queryClient.invalidateQueries({
                  queryKey: dashboardQueryKeys.dashboard(applicationId),
                });
              }
            } else if (chartType === 'pie') {
              const bounds = resolveTimeRangeBounds(timeRange);
              // For aggregate API, 'Latest' is not valid, so use 'Average' as default
              const validAggregation = aggregation === 'Latest' ? 'Average' : (aggregation || 'Average');
              const aggregateData = await checkMetricsApi.getMetricAggregate(checkId, metricId, {
                aggregation: validAggregation,
                from: bounds.from,
                to: bounds.to,
              });

              // Update cache with fresh aggregate data
              queryClient.setQueryData(
                dashboardQueryKeys.metricAggregate(checkId, metricId, {
                  aggregation: validAggregation,
                  from: bounds.from,
                  to: bounds.to,
                }),
                aggregateData
              );
              // Invalidate dashboard query to update lastExecutionTime in dataSources
              if (applicationId) {
                await queryClient.invalidateQueries({
                  queryKey: dashboardQueryKeys.dashboard(applicationId),
                });
              }
            } else {
              const bounds = resolveTimeRangeBounds(timeRange);
              const historyData = await checkMetricsApi.getMetricHistory(checkId, metricId, {
                from: bounds.from,
                to: bounds.to,
                take: bounds.take,
              });

              // Update cache with fresh data
              queryClient.setQueryData(
                dashboardQueryKeys.metricHistory(checkId, metricId, { take: bounds.take }),
                historyData
              );

              // Invalidate latest to get fresh latest value
              await queryClient.invalidateQueries({
                queryKey: dashboardQueryKeys.metricLatest(checkId, metricId),
              });
              // Invalidate dashboard query to update lastExecutionTime in dataSources
              if (applicationId) {
                await queryClient.invalidateQueries({
                  queryKey: dashboardQueryKeys.dashboard(applicationId),
                });
              }
            }
          } catch (error) {
            console.error('Failed to refresh chart/number card data:', error);
            // Fallback to invalidate
            await queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey;
                return (
                  Array.isArray(key) &&
                  (key[0] === 'check-metric-history' || key[0] === 'check-metric-aggregate') &&
                  key[1] === checkId &&
                  key[2] === metricId
                );
              },
            });
            // Invalidate dashboard query to update lastExecutionTime in dataSources
            if (applicationId) {
              await queryClient.invalidateQueries({
                queryKey: dashboardQueryKeys.dashboard(applicationId),
              });
            }
          }
        }
      } else {
        // This is not a chart or number card widget (e.g., status card) - use old behavior
        await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.checkStatus(checkId) });
        await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.checkMetrics(checkId) });
        // Invalidate dashboard query to update lastExecutionTime in dataSources
        if (applicationId) {
          await queryClient.invalidateQueries({
            queryKey: dashboardQueryKeys.dashboard(applicationId),
          });
        }
      }
    },
    [queryClient],
  );
}
