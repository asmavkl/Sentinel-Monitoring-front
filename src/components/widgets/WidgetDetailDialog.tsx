import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useMetricDefinitions, useMetricHistory } from '@/features/dashboard/hooks/useMetricQueries';
import { LineChart } from '@/components/charts/LineChart';
import { formatPersianDateTime } from '@/utils/dateUtils';
import type { WidgetDto } from '@/types/dashboard';
import { readDataSourceType } from '@/utils/datasetWidget';
import { resolveTimeRangeBounds } from '@/utils/metricWidget';

interface WidgetDetailDialogProps {
  open: boolean;
  widget: WidgetDto | null;
  onClose: () => void;
}

export function WidgetDetailDialog({ open, widget, onClose }: WidgetDetailDialogProps) {
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);

  const checkId = widget?.dataSources?.[0]?.checkId ?? null;
  const applicationId = widget?.dataSources?.[0]?.applicationId ?? undefined;
  const dataSourceType = readDataSourceType(widget?.configuration ?? {});

  // Check if this is a Dataset widget
  const isDatasetWidget = dataSourceType === 'Dataset';

  const { data: metrics, isLoading: metricsLoading } = useMetricDefinitions(
    checkId ?? 0,
    applicationId,
  );

  // Reset selection when dialog opens or widget changes (only for Metric widgets)
  useEffect(() => {
    if (open && !isDatasetWidget && metrics && metrics.length > 0) {
      const defaultMetricId = metrics[0]?.id;
      if (defaultMetricId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMetricId(defaultMetricId);
      }
    }
  }, [open, metrics, widget?.id, isDatasetWidget]);

  // Use useMemo to stabilize query parameters and prevent infinite re-fetches
  const metricHistoryQuery = useMemo(() => {
    const bounds = resolveTimeRangeBounds('24h');
    return {
      from: bounds.from,
      to: bounds.to,
      take: bounds.take,
    };
  }, []);

  const { data: history, isLoading: historyLoading, error: historyError } = useMetricHistory(
    checkId ?? 0,
    selectedMetricId ?? 0,
    metricHistoryQuery,
  );

  // Transform history data for LineChart
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      return { categories: [], series: [] };
    }

    const selectedMetric = metrics?.find((m) => m.id === selectedMetricId);
    const seriesName = selectedMetric?.displayName || selectedMetric?.name || 'Metric';

    return {
      categories: history.map((point) => formatPersianDateTime(point.timestamp, 'short')),
      series: [
        {
          name: seriesName,
          data: history.map((point) => point.value),
        },
      ],
    };
  }, [history, metrics, selectedMetricId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>جزئیات ویجت: {widget?.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          {/* Metric Selection - only for Metric widgets */}
          {!isDatasetWidget && (
            <>
              {metricsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : metrics && metrics.length > 0 ? (
                <FormControl fullWidth size="small">
                  <InputLabel id="metric-selector-label">انتخاب متریک</InputLabel>
                  <Select
                    labelId="metric-selector-label"
                    label="انتخاب متریک"
                    value={selectedMetricId ?? ''}
                    onChange={(event) => setSelectedMetricId(event.target.value ? Number(event.target.value) : null)}
                  >
                    {metrics.map((metric) => (
                      <MenuItem key={metric.id} value={metric.id}>
                        {metric.displayName} {metric.unit ? `(${metric.unit})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  هیچ متریکی برای این شاخص یافت نشد.
                </Typography>
              )}
            </>
          )}

          {/* Info for Dataset widgets */}
          {isDatasetWidget && (
            <Typography variant="body2" color="text.secondary">
              نمایش تمام سری‌های داده‌ای از Dataset
            </Typography>
          )}

          {/* Chart */}
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : historyError ? (
            <Typography variant="body2" color="error">
              خطا در بارگذاری داده‌ها: {historyError.message}
            </Typography>
          ) : chartData.categories.length > 0 ? (
            <LineChart
              categories={chartData.categories}
              series={chartData.series}
              height={400}
              rotateXAxisLabels={true}
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
