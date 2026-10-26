import { Box, Stack, Typography } from '@mui/material';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { useMetricDefinition } from '@/features/dashboard/hooks/useMetricQueries';
import type { WidgetComponentProps } from './types';
import { useMetricWidgetValueWithStatus } from './useMetricWidgetValue';
import {
  METRIC_AGGREGATION_LABELS,
  METRIC_EMPTY_MESSAGE,
  formatMetricValue,
} from '@/utils/metricWidget';
import { NOC_STATUS_FILL, readThreshold, statusFromThreshold } from '@/utils/widgetThreshold';
import { ApplicationHealthStatus } from '@/types/enums';
import { getPrimaryDataSource, isServerDataSource } from '@/utils/widgetDataSource';

export function NumberMetricWidget({
  title,
  configuration,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const metricValue = useMetricWidgetValueWithStatus(configuration, dataSources);
  const serverSource = isServerDataSource(getPrimaryDataSource(dataSources))
    ? getPrimaryDataSource(dataSources)
    : null;
  const definitionQuery = useMetricDefinition(
    metricValue.checkId ?? 0,
    metricValue.metricId ?? 0,
  );
  const threshold = readThreshold(configuration);
  const displayValue = serverSource ? (serverSource.value ?? null) : metricValue.value;
  const thresholdStatus = statusFromThreshold(displayValue, threshold);

  // Use healthStatus from the status API response if available, otherwise use threshold
  const healthStatus = serverSource
    ? (serverSource.healthStatus ?? ApplicationHealthStatus.Unknown)
    : (metricValue.status?.healthStatus ?? thresholdStatus);
  const fill = healthStatus ? NOC_STATUS_FILL[healthStatus] : NOC_STATUS_FILL[ApplicationHealthStatus.Normal];

  if (!serverSource && (!metricValue.checkId || !metricValue.metricId)) {
    return (
      <Box sx={{ height: '100%', p: 2 }} data-testid="number-metric-widget">
        <Typography variant="body2" color="text.secondary">
          منبع داده متریک تنظیم نشده است.
        </Typography>
      </Box>
    );
  }

  if (!serverSource && (metricValue.isLoading || definitionQuery.isLoading)) {
    return <DashboardLoading message="در حال بارگذاری شاخص..." />;
  }

  if (!serverSource && metricValue.isError) {
    return <DashboardError error={metricValue.error} title="بارگذاری شاخص ممکن نیست" />;
  }

  if (displayValue == null) {
    return (
      <Box sx={{ height: '100%', p: 2 }} data-testid="number-metric-widget">
        <Typography variant="body2" color="text.secondary">
          {METRIC_EMPTY_MESSAGE}
        </Typography>
      </Box>
    );
  }

  const metricLabel =
    serverSource?.metricDisplayName ||
    serverSource?.metricName ||
    definitionQuery.data?.displayName ||
    definitionQuery.data?.name ||
    'Requests';

  // Determine fraction digits from configuration
  const valueFormat = configuration?.valueFormat as string;
  let fractionDigits = 0;
  if (valueFormat && valueFormat.includes('.')) {
    const decimalPart = valueFormat.split('.')[1];
    fractionDigits = decimalPart.length;
  }

  return (
    <Box
      data-testid="number-metric-widget"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: fill,
        minHeight: embedded ? '100%' : 120,
      }}
    >
      {!embedded ? (
        <Box sx={{ px: 1.5, pt: 1.25 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title || metricLabel}
          </Typography>
        </Box>
      ) : null}
      <Stack
        spacing={0.5}
        sx={{
          flex: 1,
          minHeight: 0,
          containerType: 'size',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          py: 1,
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <Typography
          component="p"
          sx={{
            fontWeight: 800,
            lineHeight: 1.05,
            fontSize: 'clamp(1.25rem, 28cqh, 2.75rem)',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'rgba(0,0,0,0.78)',
          }}
        >
          {formatMetricValue(displayValue, {
            unit: serverSource ? null : metricValue.unit,
            fractionDigits,
          })}
        </Typography>
        <Typography variant="caption" noWrap sx={{ maxWidth: '100%', color: 'rgba(0,0,0,0.55)' }}>
          {metricLabel}
          {` · ${METRIC_AGGREGATION_LABELS[metricValue.aggregation]}`}
        </Typography>
      </Stack>
    </Box>
  );
}
