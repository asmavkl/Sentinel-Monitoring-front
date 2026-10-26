import { Chip, type ChipProps } from '@mui/material';
import {
  statusColors,
  statusLabels,
  type MonitoringStatus,
} from '@/utils/status';

interface StatusBadgeProps extends Omit<ChipProps, 'color' | 'label'> {
  status: MonitoringStatus;
  label?: string;
}

export function StatusBadge({ status, label, ...chipProps }: StatusBadgeProps) {
  return (
    <Chip
      size="small"
      label={label ?? statusLabels[status]}
      color={statusColors[status]}
      variant="filled"
      {...chipProps}
    />
  );
}
