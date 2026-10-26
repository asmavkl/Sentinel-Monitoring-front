import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, LineChart } from '@/components/charts';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import {
  useMetricDefinition,
  useMetricHistory,
} from '@/features/dashboard/hooks/useMetricQueries';
import type { WidgetComponentProps } from './types';
import {
  METRIC_EMPTY_MESSAGE,
  readMetricTimeRange,
} from '@/utils/metricWidget';
import { parseChartConfiguration } from '@/utils/widgetConfiguration';
import { readRefreshIntervalMs } from '@/utils/widgetThreshold';
import { useResolvedMetricIds } from './useMetricWidgetValue';
import { getPrimaryDataSource, isServerDataSource } from '@/utils/widgetDataSource';
import { formatPersianDate, formatPersianTime } from '@/utils/dateUtils';
import { TimeRangeSelector } from './TimeRangeSelector';

export function MetricChartWidget({
  title,
  configuration,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const { checkId, metricId, metricName, definitionsQuery } = useResolvedMetricIds(
    configuration,
    dataSources,
  );
  const serverSource = isServerDataSource(getPrimaryDataSource(dataSources))
    ? getPrimaryDataSource(dataSources)
    : null;
  const timeRange = readMetricTimeRange(configuration);
  const chartConfig = parseChartConfiguration(configuration);
  const refreshOverride = readRefreshIntervalMs(configuration);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Measure container height for responsive chart
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(220);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setContainerHeight(Math.max(100, height)); // Minimum 100px
      }
    };

    updateHeight();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const definitionQuery = useMetricDefinition(serverSource ? 0 : (checkId ?? 0), metricId ?? 0);
  const historyQuery = useMetricHistory(
    serverSource ? 0 : (checkId ?? 0),
    metricId ?? 0,
    { from: selectedTimeRange },
    refreshOverride,
  );

  const chartData = useMemo(() => {
    const points = serverSource?.history ?? historyQuery.data ?? [];
    const seriesName =
      serverSource?.metricDisplayName ||
      serverSource?.metricName ||
      definitionQuery.data?.displayName ||
      metricName ||
      definitionQuery.data?.name ||
      'Metric';

    return {
      categories: points.map((point) => {
        const date = formatPersianDate(point.timestamp, 'short');
        const time = formatPersianTime(point.timestamp);
        return `${date}\n${time}`;
      }),
      series: [
        {
          name: seriesName,
          data: points.map((point) => Number(point.value)),
        },
      ],
    };
  }, [definitionQuery.data, historyQuery.data, metricName, serverSource]);

  if (!serverSource && (!checkId || (!metricId && !metricName))) {
    return (
      <Typography variant="body2" color="text.secondary" data-testid="metric-chart-widget" sx={{ p: 2 }}>
        منبع داده متریک تنظیم نشده است.
      </Typography>
    );
  }

  if (!serverSource && (definitionsQuery.isLoading || historyQuery.isLoading || definitionQuery.isLoading)) {
    return <DashboardLoading message="در حال بارگذاری نمودار..." />;
  }

  if (!serverSource && !metricId) {
    return (
      <Typography variant="body2" color="text.secondary" data-testid="metric-chart-widget" sx={{ p: 2 }}>
        {METRIC_EMPTY_MESSAGE}
      </Typography>
    );
  }

  if (!serverSource && historyQuery.isError) {
    return <DashboardError error={historyQuery.error} title="بارگذاری نمودار ممکن نیست" />;
  }

  const hasData = chartData.categories.length > 0;
  const ChartComponent = chartConfig.chartType === 'bar' ? BarChart : LineChart;

  return (
    <Box sx={{ height: '100%', p: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} data-testid="metric-chart-widget">
      {!embedded ? (
        <Stack spacing={0.5} sx={{ mb: 1, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              متریک: {serverSource?.metricDisplayName || serverSource?.metricName || definitionQuery.data?.displayName || metricName || definitionQuery.data?.name}
            </Typography>
            <TimeRangeSelector
              value={selectedTimeRange}
              onChange={setSelectedTimeRange}
              sx={{ ml: 'auto' }}
            />
          </Box>
        </Stack>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {serverSource?.metricDisplayName || serverSource?.metricName || definitionQuery.data?.displayName || metricName || definitionQuery.data?.name}
          </Typography>
          <TimeRangeSelector
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            sx={{ ml: 'auto' }}
          />
        </Box>
      )}
      <Box ref={containerRef} sx={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
        {hasData ? (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'stretch' }}>
            <ChartComponent
              categories={chartData.categories}
              series={chartData.series}
              height={containerHeight}
              width="100%"
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {METRIC_EMPTY_MESSAGE}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
