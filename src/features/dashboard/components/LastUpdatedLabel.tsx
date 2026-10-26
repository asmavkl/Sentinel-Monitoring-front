import { Typography } from '@mui/material';
import { formatLastUpdated } from '../utils/formatLastUpdated';

interface LastUpdatedLabelProps {
  updatedAt?: number | Date | null;
}

export function LastUpdatedLabel({ updatedAt }: LastUpdatedLabelProps) {
  return (
    <Typography variant="body2" color="text.secondary" data-testid="last-updated-label">
      آخرین بروزرسانی: {formatLastUpdated(updatedAt)}
    </Typography>
  );
}
