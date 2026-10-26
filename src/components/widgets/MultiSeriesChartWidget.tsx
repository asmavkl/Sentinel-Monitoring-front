import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart } from '@/components/charts/LineChart';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { useMetricDefinitions } from '@/features/dashboard/hooks/useMetricQueries';
import { useMultiSeriesMetricHistory } from '@/features/dashboard/hooks/useMetricHistory';
import type { WidgetComponentProps } from './types';
import { formatPersianDateTime } from '@/utils/dateUtils';
import { resolveTimeRangeBounds } from '@/utils/metricWidget';
import { isServerDataSource } from '@/utils/widgetDataSource';
import { formatPersianTime } from '@/utils/dateUtils';
import { TimeRangeSelector } from './TimeRangeSelector';
import type { MetricTimeRangeOption } from '@/types/metrics';

export function MultiSeriesChartWidget({
  title,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const serverSources = dataSources.filter((source) => isServerDataSource(source));
  const serverMode = serverSources.length > 0;
  const checkId = serverMode ? null : (dataSources[0]?.checkId ?? null);
  const applicationId = dataSources[0]?.applicationId ?? undefined;
  const [selectedTimeRange, setSelectedTimeRange] = useState<MetricTimeRangeOption>('24h');

  // Measure container height for responsive chart (same as MetricChartWidget)
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

  const { data: metrics, isLoading: metricsLoading } = useMetricDefinitions(
    checkId ?? 0,
    applicationId,
  );

  // Get all metrics (removed isVisible filter)
  const metricIds = useMemo(() => {
    return metrics?.map((m) => m.id).sort((a, b) => a - b) ?? [];
  }, [metrics]);

  // Use useMemo to stabilize query parameters
  const metricHistoryQuery = useMemo(() => {
    const bounds = resolveTimeRangeBounds(selectedTimeRange);
    return {
      metricIds,
      from: bounds.from,
      to: bounds.to,
      take: bounds.take,
    };
  }, [metricIds, selectedTimeRange]);

  const { data: history, isLoading: historyLoading, error: historyError } = useMultiSeriesMetricHistory(
    checkId ?? 0,
    metricHistoryQuery,
    null, // Disable auto-refresh for this widget
  );

  const chartData = useMemo(() => {
    if (serverMode) {
      const longest = [...serverSources].sort(
        (left, right) => (right.history?.length ?? 0) - (left.history?.length ?? 0),
      )[0];
      const categories = (longest?.history ?? []).map((point) => formatPersianTime(point.timestamp));
      return {
        categories,
        series: serverSources.map((source) => ({
          name: source.metricDisplayName || source.metricName || 'متریک',
          data: (source.history ?? []).map((point) => Number(point.value)),
        })),
      };
    }

    if (!history || !history.series || history.series.length === 0) {
      return { categories: [], series: [] };
    }

    const categories = history.series[0]?.points.map((point) =>
      formatPersianDateTime(point.timestamp, 'short'),
    ) || [];

    const series = history.series.map((item) => ({
      name: item.displayName,
      data: item.points.map((point) => point.value),
    }));

    return { categories, series };
  }, [history, serverMode, serverSources]);

  if (!serverMode && !checkId) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        منبع داده تنظیم نشده است.
      </Typography>
    );
  }

  if (!serverMode && (metricsLoading || historyLoading)) {
    return <DashboardLoading message="در حال بارگذاری نمودار..." />;
  }

  if (!serverMode && historyError) {
    return <DashboardError error={historyError} title="بارگذاری نمودار ممکن نیست" />;
  }

  const hasData = chartData.categories.length > 0 && chartData.series.length > 0;

  return (
    <Box sx={{ height: '100%', p: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} data-testid="multi-series-chart-widget">
      {!embedded ? (
        <Stack spacing={0.5} sx={{ mb: 1, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {chartData.series.length} سری متریک
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
            {chartData.series.length} سری متریک
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
            <LineChart
              categories={chartData.categories}
              series={chartData.series}
              height={containerHeight}
              width="100%"
              rotateXAxisLabels
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            داده‌ای برای نمایش وجود ندارد
          </Typography>
        )}
      </Box>
    </Box>
  );
}
