import {
  Box,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { WidgetDataSourceRequestDto, DataSourceType } from '@/types/widgets';
import { useMetricDefinitions } from '@/features/dashboard/hooks/useMetricQueries';
import { useMultiSeriesMetricHistory } from '@/features/dashboard/hooks/useMetricHistory';
import { getChecksGroupedByComponent, type CheckOption } from '../utils/checkOptions';
import type { ComponentStatusDto } from '@/types/dashboard';
import { CheckType } from '@/types/enums';
import { resolveTimeRangeBounds } from '@/utils/metricWidget';

export interface MetricSelection {
  metricId: number;
  metricName: string;
}

export interface SeriesSelection {
  metricId: number;
  name: string;
  displayName: string;
}

interface DataSourceSelectorProps {
  applicationName?: string;
  availableChecks?: CheckOption[];
  components?: ComponentStatusDto[];
  dataSources: WidgetDataSourceRequestDto[];
  dataSourceType?: DataSourceType;
  requireMetric?: boolean;
  onChange: (
    dataSources: WidgetDataSourceRequestDto[],
    dataSourceType?: DataSourceType,
  ) => void;
}

export function DataSourceSelector({
  applicationName,
  availableChecks,
  components,
  dataSources,
  dataSourceType = 'Metric',
  requireMetric = false,
  onChange,
}: DataSourceSelectorProps) {
  const groups = useMemo(() => {
    return availableChecks && availableChecks.length > 0
      ? groupChecks(availableChecks)
      : components
        ? getChecksGroupedByComponent(components)
        : [];
  }, [availableChecks, components]);

  const selectedCheckId = dataSources[0]?.checkId ?? null;
  const selectedMetricName = dataSources[0]?.metricName ?? null;
  const selectedMetricDefinitionId = dataSources[0]?.metricDefinitionId ?? null;
  const [currentDataSourceType, setCurrentDataSourceType] = useState<DataSourceType>(dataSourceType);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<number[]>([]);

  const inferredComponentId = useMemo(() => {
    if (selectedCheckId == null) {
      return null;
    }

    for (const group of groups) {
      if (group.checks.some((check) => check.checkId === selectedCheckId)) {
        return group.componentId;
      }
    }

    return null;
  }, [groups, selectedCheckId]);

  const [componentId, setComponentId] = useState<number | null>(inferredComponentId);

  useEffect(() => {
    if (inferredComponentId != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComponentId(inferredComponentId);
    }
  }, [inferredComponentId]);

  const checksForComponent = useMemo(() => {
    if (componentId == null) {
      return [];
    }

    return groups.find((group) => group.componentId === componentId)?.checks ?? [];
  }, [groups, componentId]);

  const definitionsQuery = useMetricDefinitions(selectedCheckId ?? 0, undefined, 600_000);
  const definitions = definitionsQuery.data ?? [];

  const selectedCheck = checksForComponent.find((check) => check.checkId === selectedCheckId);

  // For Dataset type, use metric history API to get series data
  // Use useMemo to stabilize query parameters and prevent infinite re-fetches
  const metricHistoryQueryParams = useMemo(() => resolveTimeRangeBounds('24h'), []);
  const metricHistoryQuery = useMultiSeriesMetricHistory(
    selectedCheckId ?? 0,
    metricHistoryQueryParams,
    600_000,
  );

  const selectedMetricId =
    (selectedMetricDefinitionId != null && selectedMetricDefinitionId > 0
      ? selectedMetricDefinitionId
      : null) ??
    definitions.find((definition) => definition.name === selectedMetricName)?.id ??
    null;
  const metricMissing =
    requireMetric &&
    currentDataSourceType === 'Metric' &&
    selectedCheckId != null &&
    selectedMetricId == null &&
    (selectedMetricName == null || selectedMetricName.length === 0);

  // Auto-select all series when data loads for Dataset type
  useEffect(() => {
    if (currentDataSourceType === 'Dataset' && metricHistoryQuery.data && selectedSeriesIds.length === 0) {
      if (metricHistoryQuery.data.series.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedSeriesIds(metricHistoryQuery.data.series.map(s => s.metricId));
      }
    }
  }, [currentDataSourceType, metricHistoryQuery.data, selectedSeriesIds.length]);

  const isDatabaseCheck = selectedCheck?.checkType === CheckType.DatabaseQuery;

  const emitSelection = (
    checkId: number | null,
    nextMetricId: number | null,
    metricName: string | null,
    type: DataSourceType = currentDataSourceType,
    seriesIds?: number[],
  ) => {
    if (checkId == null) {
      onChange([], type);
      return;
    }

    const check = checksForComponent.find((c) => c.checkId === checkId);

    const nextSources: WidgetDataSourceRequestDto[] = [
      {
        checkId,
        applicationId: check?.applicationId,
        dataSourceType: type,
        metricDefinitionId: type === 'Metric' ? nextMetricId ?? undefined : undefined,
        metricName: type === 'Metric' ? metricName ?? undefined : undefined,
        displayOrder: 0,
        // Store selected series IDs in configuration for Dataset type
        ...(type === 'Dataset' && seriesIds ? { metricDefinitionId: seriesIds[0] } : {}),
      },
    ];

    if (type === 'Metric') {
      if (nextMetricId == null || metricName == null) {
        onChange(nextSources, type);
        return;
      }
      // Include metricDefinitionId in the data source
      onChange(
        nextSources.map(source => ({
          ...source,
          metricDefinitionId: nextMetricId,
          metricName: metricName,
        })),
        type
      );
    } else {
      onChange(nextSources, type);
    }
  };

  const handleSeriesToggle = (metricId: number) => {
    const newSelection = selectedSeriesIds.includes(metricId)
      ? selectedSeriesIds.filter((id) => id !== metricId)
      : [...selectedSeriesIds, metricId];

    setSelectedSeriesIds(newSelection);
  };

  return (
    <Stack spacing={2} data-testid="datasource-selector">
      <Typography variant="subtitle2">منبع داده</Typography>

      {applicationName ? (
        <FormControl fullWidth size="small">
          <InputLabel id="datasource-application-label">سامانه</InputLabel>
          <Select
            labelId="datasource-application-label"
            label="سامانه"
            value={applicationName}
            disabled
            inputProps={{ 'aria-label': 'سامانه' }}
          >
            <MenuItem value={applicationName}>{applicationName}</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Typography variant="body2" color="text.secondary">
          سامانه فعلی
        </Typography>
      )}

      {groups.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          برای این سامانه پایشی در دسترس نیست.
        </Typography>
      ) : (
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="datasource-component-label">مولفه</InputLabel>
            <Select
              labelId="datasource-component-label"
              label="مولفه"
              value={componentId == null ? '' : String(componentId)}
              onChange={(event) => {
                const nextComponentId = event.target.value ? Number(event.target.value) : null;
                setComponentId(nextComponentId);
                emitSelection(null, null, null);
              }}
              inputProps={{ 'aria-label': 'مولفه' }}
            >
              {groups.map((group) => (
                <MenuItem key={group.componentId} value={String(group.componentId)}>
                  {group.componentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={componentId == null}>
            <InputLabel id="datasource-check-label">پایش</InputLabel>
            <Select
              labelId="datasource-check-label"
              label="پایش"
              value={selectedCheckId == null ? '' : String(selectedCheckId)}
              onChange={(event) => {
                const checkId = event.target.value ? Number(event.target.value) : null;
                setSelectedSeriesIds([]); // Reset series selection when check changes
                emitSelection(checkId, null, null);
              }}
              inputProps={{ 'aria-label': 'پایش' }}
            >
              {checksForComponent.map((check) => (
                <MenuItem key={check.checkId} value={String(check.checkId)}>
                  {check.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCheckId != null && isDatabaseCheck ? (
            <FormControl fullWidth size="small">
              <InputLabel id="datasource-type-label">نوع منبع داده</InputLabel>
              <Select
                labelId="datasource-type-label"
                label="نوع منبع داده"
                value={currentDataSourceType}
                onChange={(event) => {
                  const type = event.target.value as DataSourceType;
                  setCurrentDataSourceType(type);
                  emitSelection(selectedCheckId, null, null, type);
                }}
                inputProps={{ 'aria-label': 'نوع منبع داده' }}
              >
                <MenuItem value="Metric">متریک</MenuItem>
                <MenuItem value="Dataset">داده‌ای</MenuItem>
              </Select>
            </FormControl>
          ) : null}

          {selectedCheckId == null ? null : currentDataSourceType === 'Metric' ? definitionsQuery.isLoading ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CircularProgress size={16} />
              <Typography variant="caption">بارگذاری متریک‌ها...</Typography>
            </Stack>
          ) : definitions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              متریکی برای این شاخص تعریف نشده است.
            </Typography>
          ) : (
            <FormControl fullWidth size="small" required={requireMetric} error={metricMissing}>
              <InputLabel id="datasource-metric-label">متریک</InputLabel>
              <Select
                labelId="datasource-metric-label"
                label="متریک"
                value={selectedMetricId == null ? '' : String(selectedMetricId)}
                onChange={(event) => {
                  const nextId = event.target.value ? Number(event.target.value) : null;
                  const definition = definitions.find((item) => item.id === nextId);
                  emitSelection(
                    selectedCheckId,
                    definition?.id ?? null,
                    definition?.name ?? null,
                  );
                }}
                inputProps={{ 'aria-label': 'متریک' }}
              >
                {definitions.map((definition) => (
                  <MenuItem key={definition.id} value={String(definition.id)}>
                    {definition.displayName || definition.name}
                  </MenuItem>
                ))}
              </Select>
              {metricMissing ? (
                <FormHelperText>یک متریک انتخاب کنید.</FormHelperText>
              ) : null}
            </FormControl>
          ) : currentDataSourceType === 'Dataset' ? metricHistoryQuery.isLoading ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CircularProgress size={16} />
              <Typography variant="caption">بارگذاری داده‌ها...</Typography>
            </Stack>
          ) : metricHistoryQuery.data && metricHistoryQuery.data.series.length > 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    سری‌های داده‌ای (انتخاب کنید):
                  </Typography>
                  <Stack spacing={0.5}>
                    {metricHistoryQuery.data.series.map((series) => (
                      <Box
                        key={series.metricId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 0.5,
                        }}
                      >
                        <Checkbox
                          checked={selectedSeriesIds.includes(series.metricId)}
                          onChange={() => handleSeriesToggle(series.metricId)}
                          size="small"
                        />
                        <Typography variant="body2">
                          {series.displayName} {series.unit ? `(${series.unit})` : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body2" color="text.secondary">
              داده‌ای برای این شاخص ثبت نشده است.
            </Typography>
          ) : null}

          {selectedCheckId != null && currentDataSourceType === 'Metric' && selectedMetricId != null ? (
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    مسیر انتخاب‌شده
                  </Typography>
                  <Typography variant="body2">
                    {applicationName ? `${applicationName} ← ` : ''}
                    {groups.find((group) => group.componentId === componentId)?.componentName ??
                      '—'}{' '}
                    ←{' '}
                    {checksForComponent.find((check) => check.checkId === selectedCheckId)?.name ??
                      '—'}{' '}
                    ←{' '}
                    {currentDataSourceType === 'Metric'
                      ? (definitions.find((definition) => definition.id === selectedMetricId)
                        ?.displayName ||
                        selectedMetricName ||
                        '—')
                      : 'داده‌ای'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : currentDataSourceType === 'Dataset' && metricHistoryQuery.data ? (
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    مسیر انتخاب‌شده
                  </Typography>
                  <Typography variant="body2">
                    {applicationName ? `${applicationName} ← ` : ''}
                    {groups.find((group) => group.componentId === componentId)?.componentName ??
                      '—'}{' '}
                    ←{' '}
                    {checksForComponent.find((check) => check.checkId === selectedCheckId)?.name ??
                      '—'}{' '}
                    ←{' '}
                    داده‌ای
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}

function groupChecks(checks: CheckOption[]) {
  const byComponent = new Map<
    number,
    { componentId: number; componentName: string; checks: CheckOption[] }
  >();

  for (const check of checks) {
    const existing = byComponent.get(check.componentId);
    if (existing) {
      existing.checks.push({ ...check });
    } else {
      byComponent.set(check.componentId, {
        componentId: check.componentId,
        componentName: check.componentName,
        checks: [{ ...check }],
      });
    }
  }

  return [...byComponent.values()];
}
