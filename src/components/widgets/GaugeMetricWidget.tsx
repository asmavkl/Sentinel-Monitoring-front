import { Card, CardContent, Stack, Typography } from '@mui/material';
import { GaugeChart } from '@/components/charts';
import { DashboardError, DashboardLoading } from '@/components/dashboard';
import { useMetricDefinition } from '@/features/dashboard/hooks/useMetricQueries';
import type { WidgetComponentProps } from './types';
import { useMetricWidgetValue } from './useMetricWidgetValue';
import {
  METRIC_EMPTY_MESSAGE,
  clampPercent,
  formatMetricValue,
} from '@/utils/metricWidget';

export function GaugeMetricWidget({ title, configuration, dataSources }: WidgetComponentProps) {
  const metricValue = useMetricWidgetValue(configuration, dataSources);
  const definitionQuery = useMetricDefinition(
    metricValue.checkId ?? 0,
    metricValue.metricId ?? 0,
  );

  if (!metricValue.checkId || !metricValue.metricId) {
    return (
      <Card sx={{ height: '100%' }} data-testid="gauge-metric-widget">
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            منبع داده متریک تنظیم نشده است.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (metricValue.isLoading || definitionQuery.isLoading) {
    return <DashboardLoading message="در حال بارگذاری Gauge..." />;
  }

  if (metricValue.isError) {
    return <DashboardError error={metricValue.error} title="بارگذاری Gauge ممکن نیست" />;
  }

  if (metricValue.isEmpty || metricValue.value == null) {
    return (
      <Card sx={{ height: '100%' }} data-testid="gauge-metric-widget">
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {METRIC_EMPTY_MESSAGE}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const percent = clampPercent(Number(metricValue.value));
  const label =
    definitionQuery.data?.displayName || definitionQuery.data?.name || title || 'Availability';

  return (
    <Card sx={{ height: '100%' }} data-testid="gauge-metric-widget">
      <CardContent>
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" align="center">
            {title}
          </Typography>
          <GaugeChart value={Number(percent.toFixed(1))} title={label} height={220} />
          <Typography variant="h5">
            {formatMetricValue(percent, { asPercent: true, fractionDigits: 1 })}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
