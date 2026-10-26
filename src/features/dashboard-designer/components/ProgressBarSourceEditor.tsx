import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useMetricDefinitions } from '@/features/dashboard/hooks/useMetricQueries';
import type { ComponentStatusDto } from '@/types/dashboard';
import type { WidgetConfiguration, WidgetDataSourceDto, WidgetDataSourceRequestDto } from '@/types/widgets';
import {
  defaultProgressBarItem,
  parseProgressBarConfiguration,
  type ProgressBarItemConfiguration,
} from '@/utils/progressBar';
import { getChecksGroupedByComponent, type CheckOption } from '../utils/checkOptions';

interface ProgressBarSourceEditorProps {
  applicationName?: string;
  availableChecks?: CheckOption[];
  components?: ComponentStatusDto[];
  dataSources: WidgetDataSourceRequestDto[];
  savedSources?: WidgetDataSourceDto[];
  configuration: WidgetConfiguration;
  onChange: (next: {
    dataSources: WidgetDataSourceRequestDto[];
    configuration: WidgetConfiguration;
  }) => void;
}

export function ProgressBarSourceEditor({
  availableChecks,
  components,
  dataSources,
  savedSources = [],
  configuration,
  onChange,
}: ProgressBarSourceEditorProps) {
  const groups = useMemo(() => {
    return availableChecks && availableChecks.length > 0
      ? groupChecks(availableChecks)
      : components
        ? getChecksGroupedByComponent(components)
        : [];
  }, [availableChecks, components]);

  const parsed = parseProgressBarConfiguration(configuration);
  const [componentId, setComponentId] = useState<number | null>(null);
  const [checkId, setCheckId] = useState<number | null>(null);
  const [metricId, setMetricId] = useState<number | null>(null);
  const definitionsQuery = useMetricDefinitions(checkId ?? 0);
  const definitions = definitionsQuery.data ?? [];
  const checks = groups.find((group) => group.componentId === componentId)?.checks ?? [];

  const emit = (sources: WidgetDataSourceRequestDto[], bars: ProgressBarItemConfiguration[]) => {
    onChange({
      dataSources: sources.map((source, index) => ({ ...source, displayOrder: index })),
      configuration: {
        ...configuration,
        decimalPlaces: parsed.decimalPlaces,
        bars: sources.map((source, index) => ({
          checkId: source.checkId,
          metricDefinitionId: source.metricDefinitionId,
          metricName: source.metricName,
          min: bars[index]?.min ?? defaultProgressBarItem.min,
          max: bars[index]?.max ?? defaultProgressBarItem.max,
          warning: bars[index]?.warning ?? defaultProgressBarItem.warning,
          critical: bars[index]?.critical ?? defaultProgressBarItem.critical,
          unit: bars[index]?.unit ?? '',
        })),
      },
    });
  };

  const bars = dataSources.map((source, index) => {
    const metricDefinitionId = source.metricDefinitionId;
    return (
      parsed.bars.find(
        (bar) =>
          bar.checkId === source.checkId &&
          bar.metricDefinitionId != null &&
          bar.metricDefinitionId === metricDefinitionId,
      ) ??
      parsed.bars[index] ??
      defaultProgressBarItem
    );
  });

  const updateBar = (index: number, patch: Partial<ProgressBarItemConfiguration>) => {
    const nextBars = bars.map((bar, barIndex) => (barIndex === index ? { ...bar, ...patch } : bar));
    emit(dataSources, nextBars);
  };

  const removeSource = (index: number) => {
    emit(
      dataSources.filter((_, sourceIndex) => sourceIndex !== index),
      bars.filter((_, barIndex) => barIndex !== index),
    );
  };

  const addSource = () => {
    if (checkId == null || metricId == null) {
      return;
    }

    const definition = definitions.find((item) => item.id === metricId);
    if (!definition) {
      return;
    }

    const alreadyAdded = dataSources.some(
      (source) => source.checkId === checkId && source.metricDefinitionId === definition.id,
    );
    if (alreadyAdded) {
      return;
    }

    const check = checks.find((item) => item.checkId === checkId);
    emit(
      [
        ...dataSources,
        {
          checkId,
          applicationId: check?.applicationId,
          dataSourceType: 'Metric',
          metricDefinitionId: definition.id,
          metricName: definition.name,
          displayOrder: dataSources.length,
        },
      ],
      [
        ...bars,
        {
          ...defaultProgressBarItem,
          checkId,
          metricDefinitionId: definition.id,
          metricName: definition.name,
        },
      ],
    );
    setMetricId(null);
  };

  return (
    <Stack spacing={2} data-testid="progress-bar-source-editor">
      <Typography variant="subtitle2">نوارها</Typography>
      {dataSources.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          هنوز متریکی اضافه نشده است. هر متریک یک نوار می‌شود.
        </Typography>
      ) : (
        dataSources.map((source, index) => {
          const bar = bars[index] ?? defaultProgressBarItem;
          const scaleError = bar.min >= bar.max;
          const thresholdError =
            bar.warning != null && bar.critical != null && bar.warning >= bar.critical;
          const catalogName = groups
            .flatMap((group) => group.checks)
            .find((check) => check.checkId === source.checkId)?.name;
          const saved = savedSources.find((item) => {
            const metricId = item.metricDefinitionId ?? item.metricId;
            return item.checkId === source.checkId && (source.metricDefinitionId == null || metricId === source.metricDefinitionId);
          });
          const checkName = catalogName || saved?.checkName || saved?.status?.name;

          return (
            <Card key={`${source.checkId}-${source.metricDefinitionId ?? index}`} variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack spacing={1.5}>
                  <MetricSourceHeading
                    checkId={source.checkId ?? 0}
                    metricDefinitionId={source.metricDefinitionId}
                    checkName={checkName}
                    fallback={`پایش ${index + 1}`}
                    onRemove={() => removeSource(index)}
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="حداقل"
                      type="number"
                      size="small"
                      value={bar.min}
                      error={scaleError}
                      onChange={(event) => updateBar(index, { min: Number(event.target.value) })}
                      fullWidth
                    />
                    <TextField
                      label="حداکثر"
                      type="number"
                      size="small"
                      value={bar.max}
                      error={scaleError}
                      helperText={scaleError ? 'حداقل باید کمتر از حداکثر باشد' : undefined}
                      onChange={(event) => updateBar(index, { max: Number(event.target.value) })}
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="آستانه هشدار"
                      type="number"
                      size="small"
                      value={bar.warning ?? ''}
                      error={thresholdError}
                      onChange={(event) => updateBar(index, { warning: Number(event.target.value) })}
                      fullWidth
                    />
                    <TextField
                      label="آستانه بحرانی"
                      type="number"
                      size="small"
                      value={bar.critical ?? ''}
                      error={thresholdError}
                      helperText={thresholdError ? 'هشدار باید کمتر از بحرانی باشد' : undefined}
                      onChange={(event) => updateBar(index, { critical: Number(event.target.value) })}
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    label="واحد"
                    size="small"
                    value={bar.unit}
                    onChange={(event) => updateBar(index, { unit: event.target.value })}
                    fullWidth
                    helperText="زیر هشدار سبز، تا بحرانی زرد، و از بحرانی به بالا قرمز"
                  />
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}

      <Typography variant="subtitle2">افزودن متریک</Typography>
      {groups.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          برای این سامانه پایشی در دسترس نیست.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <FormControl fullWidth size="small">
            <InputLabel id="progress-component-label">مولفه</InputLabel>
            <Select
              labelId="progress-component-label"
              label="مولفه"
              value={componentId == null ? '' : String(componentId)}
              onChange={(event) => {
                setComponentId(event.target.value ? Number(event.target.value) : null);
                setCheckId(null);
                setMetricId(null);
              }}
            >
              {groups.map((group) => (
                <MenuItem key={group.componentId} value={String(group.componentId)}>
                  {group.componentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" disabled={componentId == null}>
            <InputLabel id="progress-check-label">شاخص</InputLabel>
            <Select
              labelId="progress-check-label"
              label="شاخص"
              value={checkId == null ? '' : String(checkId)}
              onChange={(event) => {
                setCheckId(event.target.value ? Number(event.target.value) : null);
                setMetricId(null);
              }}
            >
              {checks.map((check) => (
                <MenuItem key={check.checkId} value={String(check.checkId)}>
                  {check.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" disabled={checkId == null || definitions.length === 0}>
            <InputLabel id="progress-metric-label">متریک</InputLabel>
            <Select
              labelId="progress-metric-label"
              label="متریک"
              value={metricId == null ? '' : String(metricId)}
              onChange={(event) => setMetricId(event.target.value ? Number(event.target.value) : null)}
            >
              {definitions.map((definition) => (
                <MenuItem key={definition.id} value={String(definition.id)}>
                  {definition.displayName || definition.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" disabled={checkId == null || metricId == null} onClick={addSource}>
            افزودن نوار
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function MetricSourceHeading({
  checkId,
  metricDefinitionId,
  checkName,
  fallback,
  onRemove,
}: {
  checkId: number;
  metricDefinitionId?: number;
  checkName?: string;
  fallback: string;
  onRemove: () => void;
}) {
  const definitionsQuery = useMetricDefinitions(checkId);
  const definition = definitionsQuery.data?.find((item) => item.id === metricDefinitionId);
  const metricLabel = definition?.displayName || definition?.name;
  const label = checkName || fallback;

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {metricLabel ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {metricLabel}
          </Typography>
        ) : null}
      </Box>
      <IconButton aria-label={`حذف ${label}`} size="small" onClick={onRemove}>
        <DeleteOutlinedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function groupChecks(checks: CheckOption[]) {
  const byComponent = new Map<number, { componentId: number; componentName: string; checks: CheckOption[] }>();

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
