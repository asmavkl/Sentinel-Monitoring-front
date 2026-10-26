import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MonitoringPageContainerProps {
  title?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function MonitoringPageContainer({
  title,
  toolbar,
  children,
}: MonitoringPageContainerProps) {
  return (
    <Stack data-testid="monitoring-page-container" spacing={1.5}>
      {title || toolbar ? (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
          }}
        >
          {title ? (
            <Typography component="h1" sx={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </Typography>
          ) : null}
          {toolbar ? <Box sx={{ flex: title ? 1 : undefined, minWidth: 0 }}>{toolbar}</Box> : null}
        </Stack>
      ) : null}
      {children}
    </Stack>
  );
}
