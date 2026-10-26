import { Button, ButtonGroup } from '@mui/material';
import type { SxProps } from '@mui/material';
import type { MetricTimeRangeOption } from '@/types/metrics';
import { METRIC_TIME_RANGE_LABELS } from '@/utils/metricWidget';

interface TimeRangeSelectorProps {
  value: MetricTimeRangeOption;
  onChange: (value: MetricTimeRangeOption) => void;
  sx?: SxProps;
}

export function TimeRangeSelector({ value, onChange, sx }: TimeRangeSelectorProps) {
  return (
    <ButtonGroup size="small" sx={sx}>
      {(Object.keys(METRIC_TIME_RANGE_LABELS) as MetricTimeRangeOption[]).map((range) => (
        <Button
          key={range}
          variant={value === range ? 'contained' : 'outlined'}
          onClick={() => onChange(range)}
        >
          {METRIC_TIME_RANGE_LABELS[range]}
        </Button>
      ))}
    </ButtonGroup>
  );
}
