import { Box, Stack, Typography } from '@mui/material';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import type { WidgetComponentProps } from './types';
import { useMetricWidgetValue } from './useMetricWidgetValue';
import {
  METRIC_AGGREGATION_LABELS,
  METRIC_EMPTY_MESSAGE,
  formatMetricValue,
} from '@/utils/metricWidget';
import { useMetricDefinition } from '@/features/dashboard/hooks/useMetricQueries';
import { readValueFormat } from '@/features/dashboard-designer/utils/widgetConfigurationForm';
import { NOC_STATUS_FILL, readThreshold, statusFromThreshold } from '@/utils/widgetThreshold';
import { ApplicationHealthStatus } from '@/types/enums';

export function KpiMetricWidget({
  title,
  configuration,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const metricValue = useMetricWidgetValue(configuration, dataSources);
  const definitionQuery = useMetricDefinition(
    metricValue.checkId ?? 0,
    metricValue.metricId ?? 0,
  );
  const valueFormat = readValueFormat(configuration);
  const asPercent = valueFormat === 'percent';
  const configUnit = typeof configuration.unit === 'string' ? configuration.unit : null;
  const threshold = readThreshold(configuration);
  const thresholdStatus = statusFromThreshold(metricValue.value, threshold);
  const fill = thresholdStatus ? NOC_STATUS_FILL[thresholdStatus] : NOC_STATUS_FILL[ApplicationHealthStatus.Normal];

  if (!metricValue.checkId || !metricValue.metricId) {
    return (
      <Box sx={{ height: '100%', p: 2 }} data-testid="kpi-metric-widget">
        <Typography variant="body2" color="text.secondary">
          منبع داده متریک تنظیم نشده است.
        </Typography>
      </Box>
    );
  }

  if (metricValue.isLoading || definitionQuery.isLoading) {
    return <DashboardLoading message="در حال بارگذاری KPI..." />;
  }

  if (metricValue.isError) {
    return <DashboardError error={metricValue.error} title="بارگذاری KPI ممکن نیست" />;
  }

  if (metricValue.isEmpty) {
    return (
      <Box sx={{ height: '100%', p: 2 }} data-testid="kpi-metric-widget">
        <Typography variant="body2" color="text.secondary">
          {METRIC_EMPTY_MESSAGE}
        </Typography>
      </Box>
    );
  }

  const subtitle =
    definitionQuery.data?.displayName ||
    definitionQuery.data?.name ||
    METRIC_AGGREGATION_LABELS[metricValue.aggregation];

  return (
    <Box
      data-testid="kpi-metric-widget"
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
          <Typography variant="subtitle1" color="text.secondary">
            {title || subtitle}
          </Typography>
        </Box>
      ) : null}
      <Stack
        spacing={0.5}
        sx={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          px: 1.5,
          py: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="p"
          sx={{ fontWeight: 800, lineHeight: 1.1, color: 'rgba(0,0,0,0.78)' }}
        >
          {formatMetricValue(metricValue.value, {
            asPercent,
            unit: asPercent ? null : configUnit || metricValue.unit,
            fractionDigits: asPercent ? 1 : undefined,
          })}
        </Typography>
        {title || subtitle ? (
          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.55)' }}>
            {subtitle}
            {` · ${METRIC_AGGREGATION_LABELS[metricValue.aggregation]}`}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
