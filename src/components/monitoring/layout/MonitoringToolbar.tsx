import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MonitoringToolbarProps {
  title?: ReactNode;
  actions?: ReactNode;
}

export function MonitoringToolbar({
  title,
  actions,
}: MonitoringToolbarProps) {
  return (
    <Box
      data-testid="monitoring-toolbar"
      sx={(theme) => ({
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.25, sm: 2 },

        minHeight: 56,
        px: { xs: 1.25, sm: 1.75 },
        py: { xs: 1, sm: 0.75 },

        bgcolor:
          theme.palette.mode === 'dark'
            ? '#171C23'
            : '#FAFBFC',

        border: '1px solid',
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : '#E5E9ED',

        borderRadius: 2,

        // بدون سایه
        boxShadow: 'none',

        transition: 'border-color 160ms ease, background-color 160ms ease',

        '&:hover': {
          borderColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.12)'
              : '#D9DEE3',
        },
      })}
    >
      {/* Title */}
      {title ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
          }}
        >
          {typeof title === 'string' ? (
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1rem' },
                fontWeight: 700,
                lineHeight: 1.4,
                color: 'text.primary',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}
        </Stack>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}

      {/* Actions */}
      {actions ? (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            flexWrap: 'wrap',
            flexShrink: 0,

            '& .MuiButton-root': {
              minHeight: 36,
              borderRadius: 1.5,
              fontWeight: 600,
            },

            '& .MuiIconButton-root': {
              borderRadius: 1.5,
            },
          }}
        >
          {actions}
        </Stack>
      ) : null}
    </Box>
  );
}