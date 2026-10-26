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
import { useState } from 'react';
import type { ServerMetricDefinitionDto } from '@/types/monitoredServers';
import type { WidgetConfiguration, WidgetDataSourceRequestDto } from '@/types/widgets';
import {
  defaultProgressBarItem,
  parseProgressBarConfiguration,
  type ProgressBarItemConfiguration,
} from '@/utils/progressBar';

interface ServerProgressBarSourceEditorProps {
  serverMetrics: ServerMetricDefinitionDto[];
  dataSources: WidgetDataSourceRequestDto[];
  configuration: WidgetConfiguration;
  onChange: (next: {
    dataSources: WidgetDataSourceRequestDto[];
    configuration: WidgetConfiguration;
  }) => void;
}

export function ServerProgressBarSourceEditor({
  serverMetrics,
  dataSources,
  configuration,
  onChange,
}: ServerProgressBarSourceEditorProps) {
  const parsed = parseProgressBarConfiguration(configuration);
  const [metricId, setMetricId] = useState<number | ''>('');

  const emit = (sources: WidgetDataSourceRequestDto[], bars: ProgressBarItemConfiguration[]) => {
    onChange({
      dataSources: sources.map((source, index) => ({ ...source, displayOrder: index })),
      configuration: {
        ...configuration,
        decimalPlaces: parsed.decimalPlaces,
        bars: sources.map((source, index) => ({
          serverMetricDefinitionId: source.serverMetricDefinitionId,
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
    const serverMetricDefinitionId = source.serverMetricDefinitionId;
    return (
      parsed.bars.find(
        (bar) =>
          bar.serverMetricDefinitionId != null &&
          bar.serverMetricDefinitionId === serverMetricDefinitionId,
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
    if (metricId === '' || metricId == null) {
      return;
    }

    const metric = serverMetrics.find((item) => item.id === metricId);
    if (!metric) {
      return;
    }

    const alreadyAdded = dataSources.some(
      (source) => source.serverMetricDefinitionId === metric.id,
    );
    if (alreadyAdded) {
      return;
    }

    emit(
      [
        ...dataSources,
        {
          serverMetricDefinitionId: metric.id,
          metricDefinitionId: metric.id,
          metricName: metric.name,
          dataSourceType: 'Metric' as const,
          displayOrder: dataSources.length,
        },
      ],
      [
        ...bars,
        {
          ...defaultProgressBarItem,
          serverMetricDefinitionId: metric.id,
          metricDefinitionId: metric.id,
          metricName: metric.name,
          unit: metric.unit ?? '',
        },
      ],
    );
    setMetricId('');
  };

  return (
    <Stack spacing={2} data-testid="server-progress-bar-source-editor">
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
          const metric = serverMetrics.find(
            (item) => item.id === source.serverMetricDefinitionId,
          );
          const metricLabel = metric?.displayName || metric?.name || source.metricName;

          return (
            <Card key={`${source.serverMetricDefinitionId ?? index}`} variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack spacing={1.5}>
                  <MetricSourceHeading
                    label={metricLabel || `متریک ${index + 1}`}
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
      {serverMetrics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          برای این سرور متریک تعریف نشده است.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <FormControl fullWidth size="small">
            <InputLabel id="server-progress-metric-label">متریک</InputLabel>
            <Select
              labelId="server-progress-metric-label"
              label="متریک"
              value={metricId === '' ? '' : String(metricId)}
              onChange={(event) => setMetricId(event.target.value ? Number(event.target.value) : '')}
            >
              {serverMetrics
                .filter(
                  (metric) =>
                    !dataSources.some((source) => source.serverMetricDefinitionId === metric.id),
                )
                .map((metric) => (
                  <MenuItem key={metric.id} value={String(metric.id)}>
                    {metric.displayName || metric.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button variant="outlined" disabled={metricId === ''} onClick={addSource}>
            افزودن متریک
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function MetricSourceHeading({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
      <IconButton aria-label={`حذف ${label}`} size="small" onClick={onRemove}>
        <DeleteOutlinedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
