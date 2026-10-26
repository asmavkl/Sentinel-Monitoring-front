import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { WidgetConfiguration, WidgetType } from '@/types/widgets';
import { WIDGET_TYPE_LABELS } from '@/types/widgets';
import {
  CHART_TYPE_LABELS,
  CHART_TYPE_OPTIONS,
  METRIC_WIDGET_TIME_RANGE_OPTIONS,
  TIME_RANGE_LABELS,
  withCurrentOption,
  readChartType,
  readTimeRange,
} from '../utils/widgetConfigurationForm';

interface WidgetConfiguratorProps {
  widgetType: WidgetType;
  title: string;
  description?: string | null;
  configuration: WidgetConfiguration;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onConfigurationChange: (configuration: WidgetConfiguration) => void;
}

export function WidgetConfigurator({
  widgetType,
  title,
  description,
  configuration,
  onTitleChange,
  onDescriptionChange,
  onConfigurationChange,
}: WidgetConfiguratorProps) {
  const patchConfiguration = (patch: WidgetConfiguration) => {
    onConfigurationChange({ ...configuration, ...patch });
  };



  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        {WIDGET_TYPE_LABELS[widgetType]}
      </Typography>

      <TextField
        label="عنوان"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        fullWidth
        required
      />

      <TextField
        label="توضیحات"
        value={description ?? ''}
        onChange={(event) => onDescriptionChange(event.target.value)}
        fullWidth
        multiline
        minRows={2}
      />

      {widgetType === 'StatusCard' ? (
        <FormControlLabel
          control={
            <Switch
              checked={configuration.showDuration === true}
              onChange={(event) => patchConfiguration({ showDuration: event.target.checked })}
            />
          }
          label="نمایش مدت"
        />
      ) : null}

      {widgetType === 'Chart' ? (
        <>
          <FormControl fullWidth>
            <InputLabel id="chart-type-label">نوع نمودار</InputLabel>
            <Select
              labelId="chart-type-label"
              label="نوع نمودار"
              value={readChartType(configuration)}
              onChange={(event) => patchConfiguration({ chartType: event.target.value })}
            >
              {withCurrentOption(CHART_TYPE_OPTIONS, readChartType(configuration)).map((option) => (
                <MenuItem key={option} value={option}>
                  {CHART_TYPE_LABELS[option] ?? option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={configuration.showLegend === true}
                onChange={(event) => patchConfiguration({ showLegend: event.target.checked })}
              />
            }
            label="نمایش راهنما"
          />

          <FormControl fullWidth>
            <InputLabel id="time-range-label">بازه زمانی</InputLabel>
            <Select
              labelId="time-range-label"
              label="بازه زمانی"
              value={readTimeRange(configuration)}
              onChange={(event) => patchConfiguration({ timeRange: event.target.value })}
              inputProps={{ 'aria-label': 'بازه زمانی' }}
            >
              {withCurrentOption(METRIC_WIDGET_TIME_RANGE_OPTIONS, readTimeRange(configuration)).map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {TIME_RANGE_LABELS[option] ?? option}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        </>
      ) : null}

      {widgetType === 'NumberCard' ? (
        <>
          <TextField
            label="فرمت مقدار"
            value={configuration.valueFormat || ''}
            onChange={(event) => patchConfiguration({ valueFormat: event.target.value })}
            fullWidth
            helperText="فرمت نمایش مقدار (مثال: 0.00)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={configuration.showTrend === true}
                onChange={(event) => patchConfiguration({ showTrend: event.target.checked })}
              />
            }
            label="نمایش روند"
          />
        </>
      ) : null}



      {widgetType === 'Table' ? (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={configuration.showPagination === true}
                onChange={(event) => patchConfiguration({ showPagination: event.target.checked })}
              />
            }
            label="نمایش صفحه بندی"
          />

          <FormControl fullWidth>
            <InputLabel id="page-size-label">تعداد در صفحه</InputLabel>
            <Select
              labelId="page-size-label"
              label="تعداد در صفحه"
              value={String(configuration.pageSize ?? 10)}
              onChange={(event) => patchConfiguration({ pageSize: Number(event.target.value) })}
            >
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </Select>
          </FormControl>
        </>
      ) : null}

      {widgetType === 'Gauge' ? (
        <>
          <TextField
            label="حداقل"
            type="number"
            value={configuration.min ?? 0}
            onChange={(event) => patchConfiguration({ min: Number(event.target.value) })}
            fullWidth
            error={typeof configuration.min === 'number' && typeof configuration.max === 'number' && configuration.min >= configuration.max}
            helperText={typeof configuration.min === 'number' && typeof configuration.max === 'number' && configuration.min >= configuration.max ? 'حداقل باید کمتر از حداکثر باشد' : undefined}
          />

          <TextField
            label="حداکثر"
            type="number"
            value={configuration.max ?? 100}
            onChange={(event) => patchConfiguration({ max: Number(event.target.value) })}
            fullWidth
            error={typeof configuration.min === 'number' && typeof configuration.max === 'number' && configuration.min >= configuration.max}
            helperText={typeof configuration.min === 'number' && typeof configuration.max === 'number' && configuration.min >= configuration.max ? 'حداکثر باید بیشتر از حداقل باشد' : undefined}
          />

          <TextField
            label="واحد"
            value={configuration.unit || ''}
            onChange={(event) => patchConfiguration({ unit: event.target.value })}
            fullWidth
            helperText="واحد نمایش مقدار (مثال: ms, %, MB)"
          />

          <TextField
            label="تعداد اعشار"
            type="number"
            value={configuration.decimalPlaces ?? 0}
            onChange={(event) => patchConfiguration({ decimalPlaces: Number(event.target.value) })}
            fullWidth
            error={typeof configuration.decimalPlaces === 'number' && configuration.decimalPlaces < 0}
            helperText={typeof configuration.decimalPlaces === 'number' && configuration.decimalPlaces < 0 ? 'تعداد اعشار باید غیر منفی باشد' : 'تعداد اعشار نمایش مقدار'}
          />
        </>
      ) : null}

      {widgetType === 'ProgressBar' ? (
        <TextField
          label="تعداد اعشار"
          type="number"
          value={configuration.decimalPlaces ?? 1}
          onChange={(event) => patchConfiguration({ decimalPlaces: Number(event.target.value) })}
          fullWidth
          error={typeof configuration.decimalPlaces === 'number' && configuration.decimalPlaces < 0}
          helperText="برای هر نوار، حداقل، حداکثر و آستانه رنگ را در تب منبع داده تنظیم کنید."
        />
      ) : null}
    </Stack>
  );
}
