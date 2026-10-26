import { Box, Stack, Typography } from '@mui/material';
import type { WidgetComponentProps } from './types';
import { parseStatusCardConfiguration } from '@/utils/widgetConfiguration';
import { getPrimaryCheckId, getPrimaryDataSource, isServerDataSource } from '@/utils/widgetDataSource';
import { readRefreshIntervalMs } from '@/utils/widgetThreshold';
import { useCheckStatus } from '@/features/dashboard/hooks/useCheckStatus';
import { getHealthStatusColor, getHealthStatusLabel } from '@/utils/healthStatus';
import { ApplicationHealthStatus } from '@/types/enums';

export function StatusCardWidget({
  title,
  configuration,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const config = parseStatusCardConfiguration(configuration);
  const source = getPrimaryDataSource(dataSources);
  const serverSource = isServerDataSource(source) ? source : null;
  const checkId = serverSource ? 0 : getPrimaryCheckId(dataSources);
  const refreshOverride = readRefreshIntervalMs(configuration);
  const statusQuery = useCheckStatus(checkId ?? 0, refreshOverride);
  const checkStatus = serverSource ? null : (statusQuery.data ?? source?.status ?? null);
  const healthStatus = serverSource
    ? (serverSource.healthStatus ?? ApplicationHealthStatus.Unknown)
    : (checkStatus?.healthStatus ?? 2); // Default to Normal
  const fill = getHealthStatusColor(healthStatus);
  const displayValue = config.showDuration
    ? checkStatus?.lastDurationMs != null
      ? `${checkStatus.lastDurationMs} ms`
      : getHealthStatusLabel(healthStatus)
    : getHealthStatusLabel(healthStatus);

  return (
    <Box
      data-testid="status-card-widget"
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
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
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
          {displayValue}
        </Typography>
        <Typography
          variant="body2"
          noWrap
          sx={{ maxWidth: '100%', color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}
        >
          {getHealthStatusLabel(healthStatus)}
        </Typography>
      </Stack>
    </Box>
  );
}
