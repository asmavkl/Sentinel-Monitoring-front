import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, LineChart } from '@/components/charts';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { useDatasetHistory } from '@/features/dashboard/hooks';
import type { WidgetComponentProps } from './types';
import {
  readMetricTimeRange,
  resolveTimeRangeBounds,
} from '@/utils/metricWidget';
import { parseChartConfiguration } from '@/utils/widgetConfiguration';
import { readRefreshIntervalMs } from '@/utils/widgetThreshold';
import { getPrimaryCheckId } from '@/utils/widgetDataSource';
import {
  detectDefaultDatasetConfiguration,
} from '@/utils/datasetUtils';
import {
  readDataSourceType,
  readTimeColumn,
  readValueColumns,
  readDatasetTake,
} from '@/utils/datasetWidget';
import type { DatasetHistoryDto } from '@/types/dashboard';
import { formatPersianTime } from '@/utils/dateUtils';
import { TimeRangeSelector } from './TimeRangeSelector';

interface ChartSeries {
  name: string;
  data: number[];
}

interface ChartData {
  categories: string[];
  series: ChartSeries[];
}

function buildDatasetChartData(
  history: DatasetHistoryDto[],
  timeColumn: string | undefined,
  valueColumns: string[],
): ChartData {
  if (history.length === 0) {
    return { categories: [], series: [] };
  }

  const latest = history[0];
  const dataset = latest.dataset;

  const timeCol = timeColumn ?? dataset.columns[0]?.name;
  const valCols = valueColumns.length > 0 ? valueColumns : dataset.columns.slice(1).map(c => c.name);

  const categories = dataset.rows.map((row) => {
    const timeValue = row[timeCol ?? ''];
    return typeof timeValue === 'string' ? formatPersianTime(timeValue) : String(timeValue ?? '');
  });

  const series: ChartSeries[] = valCols.map((colName) => ({
    name: colName,
    data: dataset.rows.map((row) => Number(row[colName] ?? 0)),
  }));

  return { categories, series };
}

export function DatasetChartWidget({
  title,
  configuration,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const checkId = getPrimaryCheckId(dataSources) ?? 0;
  const applicationId = dataSources[0]?.applicationId ?? 0;
  const dataSourceType = readDataSourceType(configuration);
  const timeRange = readMetricTimeRange(configuration);
  const chartConfig = parseChartConfiguration(configuration);
  const refreshOverride = readRefreshIntervalMs(configuration);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const historyBounds = resolveTimeRangeBounds(selectedTimeRange);
  const timeColumn = readTimeColumn(configuration);
  const valueColumns = readValueColumns(configuration);
  const take = readDatasetTake(configuration);

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

  const historyQuery = useDatasetHistory(
    checkId,
    applicationId,
    {
      from: historyBounds.from,
      to: historyBounds.to,
      take,
    },
    refreshOverride,
  );

  const chartData = useMemo(() => {
    if (!historyQuery.data || historyQuery.data.length === 0) {
      return { categories: [], series: [] };
    }

    const latest = historyQuery.data[0];
    const defaults = detectDefaultDatasetConfiguration(latest.dataset);

    return buildDatasetChartData(
      historyQuery.data,
      timeColumn ?? defaults.timeColumn ?? undefined,
      valueColumns.length > 0 ? valueColumns : defaults.valueColumns,
    );
  }, [historyQuery.data, timeColumn, valueColumns]);

  if (dataSourceType !== 'Dataset') {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        منبع داده داده‌ای تنظیم نشده است.
      </Typography>
    );
  }

  if (!checkId) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        منبع داده تنظیم نشده است.
      </Typography>
    );
  }

  if (historyQuery.isLoading) {
    return <DashboardLoading message="در حال بارگذاری نمودار..." />;
  }

  if (historyQuery.isError) {
    return <DashboardError error={historyQuery.error} title="بارگذاری نمودار ممکن نیست" />;
  }

  const hasData = chartData.categories.length > 0 && chartData.series.length > 0;
  const ChartComponent = chartConfig.chartType === 'bar' ? BarChart : LineChart;

  return (
    <Box sx={{ height: '100%', p: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} data-testid="dataset-chart-widget">
      {!embedded ? (
        <Stack spacing={0.5} sx={{ mb: 1, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              داده‌ای
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
            داده‌ای
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
            برای این ویجت داده‌ای ثبت نشده است
          </Typography>
        )}
      </Box>
    </Box>
  );
}
