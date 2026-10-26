import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { MonitoringEmptyState } from '@/components/monitoring/layout';
import { formatPersianDateTime } from '@/features/monitoring-management/utils/formatDate';
import { formatMetricNumber } from '../utils/labels';
import { groupMetricViews, metricCaption, type MetricView } from '../utils/metricGroups';

interface ServerMetricsSectionProps {
  metrics: MetricView[];
  selectedMetricId?: number | null;
  onSelectMetric?: (metricId: number) => void;
  onConfigureCriteria: (metric: MetricView) => void;
}

export function ServerMetricsSection({
  metrics,
  selectedMetricId,
  onSelectMetric,
  onConfigureCriteria,
}: ServerMetricsSectionProps) {
  if (metrics.length === 0) {
    return (
      <MonitoringEmptyState
        title="هنوز متریکی جمع نشده است"
        description="متریک‌ها بعد از اولین جمع‌آوری موفق SNMP ساخته می‌شوند. تا آن لحظه معیاری قابل تنظیم نیست."
      />
    );
  }

  const groups = groupMetricViews(metrics);

  return (
    <Stack spacing={2}>
      {groups.map((group) => (
        <Stack key={group.id} spacing={1.5}>
          <Typography variant="h6">{group.label}</Typography>
          {group.instances.map((instance) => (
            <Stack key={`${group.id}-${instance.instanceKey ?? 'default'}`} spacing={1}>
              {instance.instanceKey ? (
                <Typography variant="subtitle2" color="text.secondary">
                  {instance.instanceKey}
                </Typography>
              ) : null}
              <Stack
                direction="row"
                spacing={1.5}
                useFlexGap
                sx={{ flexWrap: 'wrap', alignItems: 'stretch' }}
              >
                {instance.metrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    selected={metric.id === selectedMetricId}
                    onSelect={onSelectMetric}
                    onConfigureCriteria={onConfigureCriteria}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function MetricCard({
  metric,
  selected,
  onSelect,
  onConfigureCriteria,
}: {
  metric: MetricView;
  selected: boolean;
  onSelect?: (metricId: number) => void;
  onConfigureCriteria: (metric: MetricView) => void;
}) {
  const caption = metricCaption(metric.name);
  const hasNumber = typeof metric.value === 'number';

  return (
    <Card
      sx={{
        width: { xs: '100%', sm: 220 },
        flexGrow: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        borderWidth: selected ? 2 : 1,
        borderStyle: 'solid',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary" noWrap title={metric.displayName}>
            {metric.displayName}
          </Typography>
          {hasNumber ? (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                {formatMetricNumber(metric.value)}
              </Typography>
              {metric.unit ? (
                <Typography variant="body2" color="text.secondary">
                  {metric.unit}
                </Typography>
              ) : null}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              بدون مقدار
            </Typography>
          )}
          {caption ? (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary">
            {metric.timestamp ? formatPersianDateTime(metric.timestamp) : 'بدون مقدار'}
          </Typography>
          <Stack direction="row" spacing={1}>
            {onSelect ? (
              <Button size="small" variant={selected ? 'contained' : 'text'} onClick={() => onSelect(metric.id)}>
                تاریخچه
              </Button>
            ) : null}
            <Button size="small" variant="outlined" onClick={() => onConfigureCriteria(metric)}>
              معیار
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
