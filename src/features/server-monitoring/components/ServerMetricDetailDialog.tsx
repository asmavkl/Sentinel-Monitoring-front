import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { LineChart } from '@/components/charts/LineChart';
import { formatPersianDateTime } from '@/utils/dateUtils';
import { useServerMetricHistory } from '../hooks';
import type { MetricView } from '../utils/metricGroups';

interface ServerMetricDetailDialogProps {
  open: boolean;
  serverId: number;
  metric: MetricView | null;
  onClose: () => void;
}

export function ServerMetricDetailDialog({ open, serverId, metric, onClose }: ServerMetricDetailDialogProps) {
  const title = metric
    ? metric.instanceKey
      ? `${metric.instanceKey} · ${metric.displayName}`
      : metric.displayName
    : '';
  const historyQuery = useServerMetricHistory(serverId, open ? (metric?.id ?? null) : null);
  const points = historyQuery.data ?? [];

  const chartData = useMemo(
    () => ({
      categories: points.map((point) => formatPersianDateTime(point.timestamp, 'short')),
      series: [
        {
          name: title || 'Metric',
          data: points.map((point) => (typeof point.value === 'number' ? point.value : Number.NaN)),
        },
      ],
    }),
    [points, title],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>جزئیات ویجت: {title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          {historyQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : historyQuery.isError ? (
            <Typography variant="body2" color="error">
              خطا در بارگذاری داده‌ها: {historyQuery.error.message}
            </Typography>
          ) : chartData.categories.length > 0 ? (
            <LineChart
              categories={chartData.categories}
              series={chartData.series}
              height={400}
              rotateXAxisLabels
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              داده‌ای برای نمایش وجود ندارد
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
