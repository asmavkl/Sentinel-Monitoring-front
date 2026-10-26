import { Box, Chip, type ChipProps } from '@mui/material';
import {
  statusColors,
  statusLabels,
  type MonitoringStatus,
} from '@/utils/status';

interface DualStatusBadgeProps extends Omit<ChipProps, 'color' | 'label'> {
  mainStatus: MonitoringStatus;
  availabilityStatus?: MonitoringStatus;
  mainLabel?: string;
}

export function DualStatusBadge({
  mainStatus,
  availabilityStatus,
  mainLabel,
  ...chipProps
}: DualStatusBadgeProps) {
  // If availability status is different and indicates a special state, show both
  const showDualStatus = availabilityStatus && 
    availabilityStatus !== mainStatus && 
    availabilityStatus === 'OUT_OF_SERVICE';

  if (!showDualStatus) {
    return (
      <Chip
        size="small"
        label={mainLabel ?? statusLabels[mainStatus]}
        color={statusColors[mainStatus]}
        variant="filled"
        {...chipProps}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      <Chip
        size="small"
        label={mainLabel ?? statusLabels[mainStatus]}
        color={statusColors[mainStatus]}
        variant="filled"
        {...chipProps}
      />
      <Chip
        size="small"
        label={statusLabels[availabilityStatus]}
        color={statusColors[availabilityStatus]}
        variant="outlined"
        sx={{ 
          fontWeight: 'bold',
          border: '2px solid',
        }}
      />
    </Box>
  );
}
