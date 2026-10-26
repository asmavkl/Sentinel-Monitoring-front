import { Box, CircularProgress, Typography } from '@mui/material';
import { LineChart } from '@/components/charts/LineChart';
import { formatPersianDateTime } from '@/utils/dateUtils';
import type { MultiSeriesMetricHistoryDto } from '../types/metricHistory';

interface MultiSeriesHistoryChartProps {
  data: MultiSeriesMetricHistoryDto | null | undefined;
  isLoading: boolean;
  error: Error | null;
  height?: number;
}

// Generate distinct colors for multiple series
function generateSeriesColors(count: number): string[] {
  const baseColors = [
    '#1976d2', // primary.main
    '#dc004e', // secondary.main
    '#ff9800', // warning.main
    '#4caf50', // success green
    '#9c27b0', // purple
    '#00bcd4', // cyan
    '#ff5722', // deep orange
    '#795548', // brown
  ];

  // If we need more colors than base, cycle through them with variations
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

export function MultiSeriesHistoryChart({
  data,
  isLoading,
  error,
  height = 400,
}: MultiSeriesHistoryChartProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          خطا در بارگذاری داده‌ها: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!data || !data.series || data.series.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          برای این شاخص متریکی قابل نمایش وجود ندارد
        </Typography>
      </Box>
    );
  }

  // Transform data for LineChart
  const categories = data.series[0]?.points.map((point) =>
    formatPersianDateTime(point.timestamp, 'short'),
  ) || [];

  const series = data.series.map((item) => ({
    name: item.displayName,
    data: item.points.map((point) => point.value),
  }));

  const seriesColors = generateSeriesColors(series.length);

  return (
    <LineChart
      categories={categories}
      series={series}
      height={height}
      rotateXAxisLabels={true}
      customColors={seriesColors}
    />
  );
}
