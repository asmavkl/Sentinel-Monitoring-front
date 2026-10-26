import { Alert, Box, Card, Chip, Stack, Typography } from '@mui/material';
import { ApplicationStatusBlock } from '@/features/applications/components/ApplicationStatusBlock';
import { formatPersianDateTime } from '@/features/monitoring-management/utils/formatDate';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import { ApplicationHealthStatus } from '@/types/enums';
import type { MonitoredServerDto, MonitoredServerStatusDto } from '@/types/monitoredServers';
import { getHealthStatusColor, getHealthStatusLabel } from '@/utils/healthStatus';
import { getExecutionStatusLabel } from '../utils/executionStatus';
import {
  formatDurationMs,
  formatMetricNumber,
  getMonitoringMethodLabel,
  getSnmpCredentialLabel,
  snmpVersionFromCredential,
} from '../utils/labels';
import { metricCaption, type MetricView } from '../utils/metricGroups';

interface ServerDetailSummaryProps {
  server: MonitoredServerDto;
  credential?: DatabaseCredentialDto;
  status?: MonitoredServerStatusDto;
  metrics: MetricView[];
  selectedMetricId?: number | null;
  onSelectMetric?: (metricId: number) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'end' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function metricTitle(metric: MetricView): string {
  return metric.instanceKey ? `${metric.instanceKey} · ${metric.displayName}` : metric.displayName;
}

export function ServerDetailSummary({
  server,
  credential,
  status,
  metrics,
  selectedMetricId,
  onSelectMetric,
}: ServerDetailSummaryProps) {
  const health = status?.healthStatus ?? ApplicationHealthStatus.Unknown;
  const hasExecution = status?.executionTime != null || status?.status != null;
  const numericMetrics = metrics.filter((metric) => typeof metric.value === 'number');

  return (
    <Stack spacing={2}>
      {!server.isActive ? (
        <Alert severity="warning">این سرور غیرفعال است و تا فعال شدن دوباره جمع‌آوری نمی‌شود.</Alert>
      ) : null}
      {!hasExecution ? <Alert severity="info">هنوز اجرایی برای این سرور ثبت نشده است.</Alert> : null}
      {status?.errorMessage ? <Alert severity="error">{status.errorMessage}</Alert> : null}

      <Card sx={{ overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: 'stretch', minHeight: { md: 280 } }}>
          <Box sx={{ width: { xs: '100%', md: 220 }, minHeight: { xs: 140, md: 'auto' }, display: 'flex' }}>
            <ApplicationStatusBlock status={health} />
          </Box>

          <Stack spacing={2} sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {server.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {server.host}:{server.port}
                  {server.description ? ` · ${server.description}` : ''}
                </Typography>
              </Box>
              <Chip
                label={getHealthStatusLabel(health)}
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, bgcolor: getHealthStatusColor(health), color: '#fff' }}
              />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <InfoRow label="اجرای فنی" value={getExecutionStatusLabel(status?.status)} />
              <InfoRow label="زمان اجرا" value={formatPersianDateTime(status?.executionTime)} />
              <InfoRow label="مدت" value={formatDurationMs(status?.durationMs)} />
            </Box>

            {numericMetrics.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {numericMetrics.map((metric) => {
                  const selected = metric.id === selectedMetricId;
                  const caption = metricCaption(metric.name);
                  return (
                    <Box
                      key={metric.id}
                      component="button"
                      type="button"
                      onClick={() => onSelectMetric?.(metric.id)}
                      aria-pressed={selected}
                      sx={{
                        textAlign: 'start',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.default',
                        borderRadius: 1,
                        px: 1.25,
                        py: 1,
                        minWidth: 0,
                        font: 'inherit',
                        color: 'inherit',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" noWrap title={metricTitle(metric)}>
                        {metricTitle(metric)}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline', mt: 0.25 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                          {formatMetricNumber(metric.value)}
                        </Typography>
                        {metric.unit ? (
                          <Typography variant="caption" color="text.secondary">
                            {metric.unit}
                          </Typography>
                        ) : null}
                      </Stack>
                      {caption ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {caption}
                        </Typography>
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                هنوز مقدار عددی برای نمایش در کارت وضعیت ثبت نشده است.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Card>

      <Card>
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
          <InfoRow label="روش" value={getMonitoringMethodLabel()} />
          <InfoRow label="نسخه SNMP" value={snmpVersionFromCredential(credential)} />
          <InfoRow label="اعتبارنامه" value={getSnmpCredentialLabel(credential)} />
          <InfoRow label="فاصله" value={`${server.intervalSeconds.toLocaleString('fa-IR')} ثانیه`} />
          <InfoRow label="مهلت" value={`${server.timeoutSeconds.toLocaleString('fa-IR')} ثانیه`} />
          <InfoRow label="سرور" value={server.isActive ? 'فعال' : 'غیرفعال'} />
        </Box>
      </Card>
    </Stack>
  );
}
