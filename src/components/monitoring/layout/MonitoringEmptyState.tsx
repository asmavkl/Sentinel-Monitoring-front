import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MonitoringEmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function MonitoringEmptyState({
  title = 'در حال حاضر سامانه ای برای پایش تعریف نشده است',
  description,
  action,
}: MonitoringEmptyStateProps) {
  return (
    <Box
      data-testid="monitoring-empty-state"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
        py: 4,
        px: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <MonitorHeartOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Box>
  );
}
