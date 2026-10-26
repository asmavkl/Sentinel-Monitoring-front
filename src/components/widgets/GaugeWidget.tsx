// import { Box, Typography } from '@mui/material';
// import { GaugeChart } from '@/components/charts';
// import { DashboardError, DashboardLoading } from '@/components/dashboard';
// import { useCheckStatus } from '@/features/dashboard/hooks/useCheckStatus';
// import { useMetricLatest } from '@/features/dashboard/hooks/useMetricQueries';
// import type { WidgetComponentProps } from './types';
// import { useResolvedMetricIds } from './useMetricWidgetValue';
// import { getPrimaryDataSource, isServerDataSource } from '@/utils/widgetDataSource';
// import { parseGaugeConfiguration } from '@/utils/widgetConfiguration';

// export function GaugeWidget({ title, configuration, dataSources, embedded = false }: WidgetComponentProps) {
//   const { checkId, metricId, metricName, definitionsQuery } = useResolvedMetricIds(
//     configuration,
//     dataSources,
//   );
//   const serverSource = isServerDataSource(getPrimaryDataSource(dataSources))
//     ? getPrimaryDataSource(dataSources)
//     : null;
//   const latestQuery = useMetricLatest(serverSource ? 0 : (checkId ?? 0), metricId ?? 0);
//   const statusQuery = useCheckStatus(serverSource ? 0 : (checkId ?? 0));

//   const gaugeConfig = parseGaugeConfiguration(configuration);
//   const { min, max, unit, decimalPlaces } = gaugeConfig;
//   const durationFallback =
//     metricName === 'response_time' && statusQuery.data?.lastDurationMs != null
//       ? statusQuery.data.lastDurationMs
//       : null;
//   const metricValue = serverSource ? serverSource.value : latestQuery.data?.value;
//   const value = metricValue != null ? Number(metricValue) : durationFallback;

//   if (
//     !serverSource &&
//     (!checkId || (metricId == null && durationFallback == null && metricName !== 'response_time'))
//   ) {
//     return (
//       <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', px: 2 }} data-testid="gauge-widget">
//         <Typography variant="body2" color="text.secondary" align="center">
//           منبع داده متریک تنظیم نشده است.
//         </Typography>
//       </Box>
//     );
//   }

//   const waitingForMetric = !serverSource && metricId != null && latestQuery.isLoading;
//   const waitingForDefinition = !serverSource && metricId == null && definitionsQuery.isLoading;
//   const waitingForStatus =
//     !serverSource && value == null && metricName === 'response_time' && statusQuery.isLoading;

//   if (waitingForMetric || waitingForDefinition || waitingForStatus) {
//     return <DashboardLoading message="در حال بارگذاری گیج..." />;
//   }

//   if (latestQuery.isError && value == null) {
//     return <DashboardError error={latestQuery.error} title="بارگذاری گیج ممکن نیست" />;
//   }

//   if (value == null) {
//     return (
//       <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', px: 2 }} data-testid="gauge-widget">
//         <Typography variant="body2" color="text.secondary" align="center">
//           داده‌ای موجود نیست
//         </Typography>
//       </Box>
//     );
//   }

//   const apiUnit = latestQuery.data?.unit || (durationFallback != null && metricValue == null ? 'ms' : '');
//   const displayUnit = unit || apiUnit;
//   const label =
//     serverSource?.metricDisplayName ||
//     serverSource?.metricName ||
//     definitionsQuery.data?.find((item) => item.id === metricId)?.displayName ||
//     definitionsQuery.data?.find((item) => item.id === metricId)?.name ||
//     latestQuery.data?.displayName ||
//     title ||
//     'Gauge';

//   return (
//     <GaugeBody
//       embedded={embedded}
//       value={value}
//       min={min}
//       max={max}
//       label={label}
//       unit={displayUnit}
//       decimalPlaces={decimalPlaces}
//     />
//   );
// }

// function GaugeBody({
//   embedded,
//   value,
//   min,
//   max,
//   label,
//   unit,
//   decimalPlaces,
// }: {
//   embedded: boolean;
//   value: number;
//   min: number;
//   max: number;
//   label: string;
//   unit: string;
//   decimalPlaces: number;
// }) {
//   return (
//     <Box
//       data-testid="gauge-widget"
//       dir="ltr"
//       sx={{
//         height: '100%',
//         width: '100%',
//         minHeight: 0,
//         display: 'flex',
//         flexDirection: 'column',
//       }}
//     >
//       <GaugeChart
//         value={value}
//         min={min}
//         max={max}
//         title={embedded ? undefined : label}
//         height="100%"
//         unit={unit}
//         decimalPlaces={decimalPlaces}
//       />
//     </Box>
//   );
// }
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import DataObjectIcon from '@mui/icons-material/DataObject';

import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { GaugeChart } from '@/components/charts';
import { DashboardLoading } from '@/components/dashboard';

import { useCheckStatus } from '@/features/dashboard/hooks/useCheckStatus';
import { useMetricLatest } from '@/features/dashboard/hooks/useMetricQueries';

import type { WidgetComponentProps } from './types';
import { useResolvedMetricIds } from './useMetricWidgetValue';

import {
  getPrimaryDataSource,
  isServerDataSource,
} from '@/utils/widgetDataSource';

import { parseGaugeConfiguration } from '@/utils/widgetConfiguration';

export function GaugeWidget({
  title,
  configuration,
  dataSources,
  embedded = false,
}: WidgetComponentProps) {
  const {
    checkId,
    metricId,
    metricName,
    definitionsQuery,
  } = useResolvedMetricIds(
    configuration,
    dataSources,
  );

  const primarySource = getPrimaryDataSource(dataSources);

  const serverSource = isServerDataSource(primarySource)
    ? primarySource
    : null;

  const latestQuery = useMetricLatest(
    serverSource ? 0 : (checkId ?? 0),
    metricId ?? 0,
  );

  const statusQuery = useCheckStatus(
    serverSource ? 0 : (checkId ?? 0),
  );

  const {
    min,
    max,
    unit,
    decimalPlaces,
  } = parseGaugeConfiguration(configuration);

  // ============================================================
  // VALUE
  // ============================================================

  const responseTimeFallback =
    metricName === 'response_time' &&
      statusQuery.data?.lastDurationMs != null
      ? statusQuery.data.lastDurationMs
      : null;

  const rawValue =
    serverSource?.value ??
    latestQuery.data?.value ??
    responseTimeFallback;

  const value =
    rawValue != null &&
      Number.isFinite(Number(rawValue))
      ? Number(rawValue)
      : null;

  const displayUnit =
    unit ||
    latestQuery.data?.unit ||
    (responseTimeFallback != null ? 'ms' : '');

  // For ms unit, treat 0 as null to show "-" in the gauge
  // Check if the unit is ms or if it's a response_time metric
  const isMsUnit =
    displayUnit === 'ms' ||
    metricName === 'response_time' ||
    responseTimeFallback != null;

  const finalValue =
    isMsUnit && value === 0
      ? null
      : value;

  // ============================================================
  // CONFIGURATION STATE
  // ============================================================

  const hasMetricConfiguration =
    metricId != null ||
    metricName === 'response_time';

  if (!serverSource && (!checkId || !hasMetricConfiguration)) {
    return (
      <GaugeEmptyState
        message="منبع داده‌ای برای این گیج تنظیم نشده است."
      />
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  const isLoading =
    !serverSource &&
    (
      (metricId != null && latestQuery.isLoading) ||
      (metricId == null && definitionsQuery.isLoading) ||
      (
        value == null &&
        metricName === 'response_time' &&
        statusQuery.isLoading
      )
    );

  if (isLoading) {
    return (
      <DashboardLoading
        message="در حال بارگذاری گیج..."
      />
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (latestQuery.isError && value == null) {
    return (
      <GaugeErrorState
        error={latestQuery.error}
      />
    );
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (finalValue == null) {
    return (
      <GaugeEmptyState
        message="در حال حاضر داده‌ای برای نمایش وجود ندارد."
      />
    );
  }

  // ============================================================
  // METADATA
  // ============================================================

  const metricDefinition = definitionsQuery.data?.find(
    (item) => item.id === metricId,
  );

  const label =
    serverSource?.metricDisplayName ||
    serverSource?.metricName ||
    metricDefinition?.displayName ||
    metricDefinition?.name ||
    latestQuery.data?.displayName ||
    title ||
    'Gauge';

  return (
    <GaugeBody
      embedded={embedded}
      value={finalValue}
      min={min}
      max={max}
      label={label}
      unit={displayUnit}
      decimalPlaces={decimalPlaces}
    />
  );
}

// ============================================================================
// GAUGE BODY
// ============================================================================

interface GaugeBodyProps {
  embedded: boolean;
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  decimalPlaces: number;
}

function GaugeBody({
  embedded,
  value,
  min,
  max,
  label,
  unit,
  decimalPlaces,
}: GaugeBodyProps) {
  return (
    <Box
      data-testid="gauge-widget"
      dir="ltr"
      sx={{
        position: 'relative',

        width: '100%',
        height: '100%',
        minHeight: 0,

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',
      }}
    >
      {/* ========================================================
          HEADER
         ======================================================== */}

      {!embedded && (
        <Box
          dir="rtl"
          sx={{
            flexShrink: 0,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            px: 1.25,
            pt: 0.9,
            pb: 0.4,
          }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              minWidth: 0,
              alignItems: 'center',
            }}
          >
            {/* Gauge icon */}
            <Box
              sx={(theme) => ({
                width: 28,
                height: 28,

                flexShrink: 0,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                borderRadius: 1.25,

                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.primary.main, 0.07),

                color: 'primary.main',
              })}
            >
              <SpeedIcon sx={{ fontSize: 17 }} />
            </Box>

            {/* Metric name */}
            <Typography
              title={label}
              sx={{
                minWidth: 0,

                fontSize: '0.75rem',
                fontWeight: 700,

                color: 'text.primary',

                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Typography>
          </Stack>

          {/* Unit */}
          {unit ? (
            <Typography
              sx={{
                flexShrink: 0,

                ml: 1,

                color: 'text.secondary',

                fontSize: '0.68rem',
                fontWeight: 600,
              }}
            >
              {unit}
            </Typography>
          ) : null}
        </Box>
      )}

      {/* ========================================================
          CHART
         ======================================================== */}

      <Box
        sx={{
          position: 'relative',

          flex: 1,

          minHeight: 0,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          px: {
            xs: 0.5,
            sm: 1,
          },

          pb: embedded ? 0 : 0.75,

          '& > *': {
            width: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
          },
        }}
      >
        <GaugeChart
          value={value}
          min={min}
          max={max}
          title={undefined}
          height="100%"
          unit={unit}
          decimalPlaces={decimalPlaces}
        />
      </Box>
    </Box>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function GaugeEmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <Box
      data-testid="gauge-widget"
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minHeight: 0,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        px: 2,

        bgcolor:
          theme.palette.mode === 'dark'
            ? alpha('#FFFFFF', 0.015)
            : '#FAFBFC',
      })}
    >
      <Stack
        spacing={0.75}
        sx={{
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={(theme) => ({
            width: 38,
            height: 38,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: 1.75,

            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha('#FFFFFF', 0.05)
                : '#F0F3F5',

            color: 'text.secondary',
          })}
        >
          <DataObjectIcon fontSize="small" />
        </Box>

        <Typography
          sx={{
            maxWidth: 240,

            color: 'text.secondary',

            fontSize: '0.73rem',
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

function GaugeErrorState({
  error,
}: {
  error: unknown;
}) {
  return (
    <Box
      data-testid="gauge-widget"
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        px: 2,
      }}
    >
      <Stack
        spacing={0.75}
        sx={{
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={(theme) => ({
            width: 38,
            height: 38,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: 1.75,

            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.error.main, 0.07),

            color: 'error.main',
          })}
        >
          <WarningIcon fontSize="small" />
        </Box>

        <Typography
          sx={{
            color: 'text.primary',
            fontSize: '0.75rem',
            fontWeight: 650,
          }}
        >
          بارگذاری گیج انجام نشد
        </Typography>

        <Typography
          sx={{
            maxWidth: 240,

            color: 'text.secondary',

            fontSize: '0.68rem',
            lineHeight: 1.5,
          }}
        >
          امکان دریافت مقدار متریک وجود ندارد.
        </Typography>

        {/* Keep error available for debugging without
            displaying raw technical details to users. */}
        <Box sx={{ display: 'none' }}>
          {String(error)}
        </Box>
      </Stack>
    </Box>
  );
}