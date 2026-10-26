import { Box, Typography } from '@mui/material';
import { ApplicationHealthStatus } from '@/types/enums';
import { getHealthStatusColor, getHealthStatusLabel } from '@/utils/healthStatus';

interface ApplicationStatusBlockProps {
  status: number;
  label?: string;
}

export function ApplicationStatusBlock({ status, label }: ApplicationStatusBlockProps) {
  const backgroundColor = getHealthStatusColor(status as ApplicationHealthStatus);
  const statusLabel = getHealthStatusLabel(status as ApplicationHealthStatus);

  return (
    <Box
      data-testid="application-status-block"
      data-status={status}
      sx={{
        bgcolor: backgroundColor,
        color: '#263238',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        width: '100%',
        flex: 1,
        minHeight: 0,
        px: 1,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: 0.2,
        }}
      >
        {label ?? 'وضعیت سلامت'}
      </Typography>
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: '1rem',
          lineHeight: 1.2,
        }}
      >
        {statusLabel}
      </Typography>
    </Box>
  );
}
