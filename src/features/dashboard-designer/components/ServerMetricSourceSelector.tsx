import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { ServerMetricDefinitionDto } from '@/types/monitoredServers';
import type { WidgetDataSourceRequestDto } from '@/types/widgets';

interface ServerMetricSourceSelectorProps {
  metrics: ServerMetricDefinitionDto[];
  dataSources: WidgetDataSourceRequestDto[];
  allowMultiple: boolean;
  onChange: (dataSources: WidgetDataSourceRequestDto[]) => void;
}

export function ServerMetricSourceSelector({
  metrics,
  dataSources,
  allowMultiple,
  onChange,
}: ServerMetricSourceSelectorProps) {
  const [pendingMetricId, setPendingMetricId] = useState<number | ''>('');
  const selectedId = dataSources[0]?.serverMetricDefinitionId ?? '';

  const toSource = (metricId: number, displayOrder: number): WidgetDataSourceRequestDto | null => {
    const metric = metrics.find((item) => item.id === metricId);
    if (!metric) {
      return null;
    }

    return {
      serverMetricDefinitionId: metric.id,
      metricDefinitionId: metric.id,
      metricName: metric.name,
      dataSourceType: 'Metric',
      displayOrder,
    };
  };

  if (!allowMultiple) {
    return (
      <FormControl fullWidth size="small">
        <InputLabel id="server-metric-source-label">متریک سرور</InputLabel>
        <Select
          labelId="server-metric-source-label"
          label="متریک سرور"
          value={selectedId === '' ? '' : String(selectedId)}
          onChange={(event) => {
            const metricId = Number(event.target.value);
            const source = toSource(metricId, 0);
            onChange(source ? [source] : []);
          }}
        >
          {metrics.map((metric) => (
            <MenuItem key={metric.id} value={String(metric.id)}>
              {metric.displayName || metric.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Stack spacing={1.5}>
      {dataSources.map((source, index) => {
        const metric = metrics.find((item) => item.id === source.serverMetricDefinitionId);
        return (
          <Stack key={`${source.serverMetricDefinitionId ?? index}`} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {metric?.displayName || source.metricName || 'متریک'}
            </Typography>
            <IconButton
              aria-label="حذف متریک"
              size="small"
              onClick={() =>
                onChange(
                  dataSources
                    .filter((_, itemIndex) => itemIndex !== index)
                    .map((item, itemIndex) => ({ ...item, displayOrder: itemIndex })),
                )
              }
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      })}
      <Stack direction="row" spacing={1}>
        <FormControl fullWidth size="small">
          <InputLabel id="server-metric-add-label">افزودن متریک</InputLabel>
          <Select
            labelId="server-metric-add-label"
            label="افزودن متریک"
            value={pendingMetricId === '' ? '' : String(pendingMetricId)}
            onChange={(event) => {
              const metricId = Number(event.target.value);
              const source = toSource(metricId, dataSources.length);
              if (!source) {
                return;
              }
              if (dataSources.some((item) => item.serverMetricDefinitionId === metricId)) {
                setPendingMetricId('');
                return;
              }
              onChange([...dataSources, source]);
              setPendingMetricId('');
            }}
          >
            {metrics.map((metric) => (
              <MenuItem key={metric.id} value={String(metric.id)}>
                {metric.displayName || metric.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
