import { Box, Stack, Typography } from '@mui/material';
import { useCheckStatus } from '@/features/dashboard/hooks/useCheckStatus';
import { useMetricDefinitions, useMetricLatest } from '@/features/dashboard/hooks/useMetricQueries';
import { formatMetricValue } from '@/utils/metricWidget';
import {
  barPercent,
  barTone,
  findBarConfiguration,
  parseProgressBarConfiguration,
  type ProgressBarItemConfiguration,
  type ProgressBarTone,
} from '@/utils/progressBar';
import type { WidgetDataSourceDto } from '@/types/widgets';
import { isServerDataSource } from '@/utils/widgetDataSource';
import type { WidgetComponentProps } from './types';

export function ProgressBarWidget({ configuration, dataSources }: WidgetComponentProps) {
  const progressConfig = parseProgressBarConfiguration(configuration);
  const sources = [...dataSources].sort(
    (left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
  );

  if (sources.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', px: 2 }} data-testid="progress-bar-widget">
        <Typography variant="body2" color="text.secondary" align="center">
          منبع داده متریک تنظیم نشده است.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      data-testid="progress-bar-widget"
      spacing={0.5}
      sx={{ height: '100%', px: 2, py: 1.5, overflow: 'auto', alignItems: 'flex-start', justifyContent: 'flex-start' }}
    >
      {sources.map((source, index) => (
        <ProgressBarRow
          key={`${source.checkId ?? 'check'}-${source.metricDefinitionId ?? source.metricId ?? source.metricName ?? index}`}
          source={source}
          bar={findBarConfiguration(progressConfig.bars, source, index)}
          decimalPlaces={progressConfig.decimalPlaces}
        />
      ))}
    </Stack>
  );
}

function ProgressBarRow({
  source,
  bar,
  decimalPlaces,
}: {
  source: WidgetDataSourceDto;
  bar: ProgressBarItemConfiguration;
  decimalPlaces: number;
}) {
  const serverSource = isServerDataSource(source);
  const checkId = serverSource ? 0 : (source.checkId ?? 0);
  const configuredMetricId = source.metricDefinitionId ?? source.metricId ?? null;
  const definitionsQuery = useMetricDefinitions(checkId);
  const statusQuery = useCheckStatus(checkId);
  const resolvedMetricId =
    configuredMetricId != null && configuredMetricId > 0
      ? configuredMetricId
      : (definitionsQuery.data?.find((item) => item.name === source.metricName)?.id ?? null);
  const latestQuery = useMetricLatest(checkId, resolvedMetricId ?? 0);

  const definition = definitionsQuery.data?.find((item) => item.id === resolvedMetricId);
  const label =
    (serverSource ? source.metricDisplayName || source.metricName : null) ||
    source.checkName ||
    source.status?.name ||
    statusQuery.data?.name ||
    definition?.displayName ||
    definition?.name ||
    latestQuery.data?.displayName ||
    source.metricName ||
    'متریک';

  if (serverSource) {
    if (source.value == null || !Number.isFinite(Number(source.value))) {
      return <ProgressBarMessage label={label} message="داده‌ای موجود نیست." />;
    }

    const value = Number(source.value);
    return (
      <ProgressBarTrack
        label={label}
        percent={barPercent(value, bar.min, bar.max)}
        tone={barTone(value, bar)}
        formatted={formatMetricValue(value, { unit: bar.unit || null, fractionDigits: decimalPlaces })}
      />
    );
  }

  if (checkId <= 0 || resolvedMetricId == null) {
    return <ProgressBarMessage label={label} message="متریک تنظیم نشده است." />;
  }

  if ((resolvedMetricId != null && latestQuery.isLoading) || definitionsQuery.isLoading) {
    return <ProgressBarMessage label={label} message="در حال بارگذاری..." />;
  }

  if (latestQuery.isError) {
    return <ProgressBarMessage label={label} message="بارگذاری مقدار ممکن نیست." />;
  }

  const metricValue = latestQuery.data?.value;
  if (metricValue == null || !Number.isFinite(Number(metricValue))) {
    return <ProgressBarMessage label={label} message="داده‌ای موجود نیست." />;
  }

  const value = Number(metricValue);
  const percent = barPercent(value, bar.min, bar.max);
  const tone = barTone(value, bar);
  const unit = bar.unit || latestQuery.data?.unit || '';
  const formatted = formatMetricValue(value, { unit: unit || null, fractionDigits: decimalPlaces });

  return (
    <ProgressBarTrack
      label={label}
      percent={percent}
      tone={tone}
      formatted={formatted}
    />
  );
}

function ProgressBarTrack({
  label,
  percent,
  tone,
  formatted,
}: {
  label: string;
  percent: number;
  tone: ProgressBarTone;
  formatted: string;
}) {
  return (
    <Stack spacing={0.75} data-testid="progress-bar-row" sx={{ alignItems: 'flex-start', width: '100%' }}>
      <ProgressBarLabel label={label} />
      <Box
        data-testid="progress-bar-track"
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 28,
          borderRadius: 1,
          bgcolor: 'grey.200',
          overflow: 'hidden',
          width: '100%',
        }}
        style={{ direction: 'ltr' }}
      >
        <Box
          role="progressbar"
          aria-label={label}
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          sx={{
            height: '100%',
            flexShrink: 1,
            minWidth: '2px',
            bgcolor: (theme) => theme.palette[tone].main,
          }}
          style={{ width: `${Math.max(percent, 0)}%` }}
        />
        <Typography
          variant="caption"
          data-testid="progress-bar-value"
          sx={{ px: 0.75, flexShrink: 0, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatted}
        </Typography>
      </Box>
    </Stack>
  );
}

function ProgressBarLabel({ label }: { label: string }) {
  return (
    <Box dir="rtl" sx={{ width: '100%' }}>
      <Typography
        variant="body2"
        noWrap
        title={label}
        data-testid="progress-bar-label"
        sx={{ fontWeight: 500, textAlign: 'right' }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function ProgressBarMessage({ label, message }: { label: string; message: string }) {
  return (
    <Stack spacing={0.5} data-testid="progress-bar-row" sx={{ alignItems: 'flex-start' }}>
      <ProgressBarLabel label={label} />
      <Typography variant="caption" color="text.secondary" style={{ textAlign: 'left' }}>
        {message}
      </Typography>
    </Stack>
  );
}
